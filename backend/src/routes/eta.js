const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { busLocations } = require('../socket');

const router = express.Router();

// 아이별 ETA 조회
router.get('/child/:childId', authMiddleware, async (req, res) => {
  try {
    // 아이 정보 + 정류장 좌표 조회
    const [children] = await db.execute(`
      SELECT c.*, s.latitude as stop_lat, s.longitude as stop_lng, s.name as stop_name
      FROM children c
      LEFT JOIN stops s ON c.stop_id = s.id
      WHERE c.id = ?
    `, [req.params.childId]);

    if (children.length === 0) {
      return res.status(404).json({ error: '아이를 찾을 수 없습니다' });
    }

    const child = children[0];

    if (!child.bus_id) {
      return res.json({ eta: null, message: '배정된 버스가 없습니다' });
    }

    if (!child.stop_lat || !child.stop_lng) {
      return res.json({ eta: null, message: '정류장이 설정되지 않았습니다' });
    }

    // 버스 현재 위치 조회
    const busLocation = busLocations.get(child.bus_id);

    if (!busLocation) {
      return res.json({ eta: null, message: '버스가 운행 중이 아닙니다' });
    }

    // 직선 거리 기반 ETA 계산 (카카오 API 없이 간단 계산)
    const distance = calculateDistance(
      busLocation.latitude,
      busLocation.longitude,
      parseFloat(child.stop_lat),
      parseFloat(child.stop_lng)
    );

    // 평균 속도 30km/h 가정 (시내 주행)
    const avgSpeed = 30;
    const etaMinutes = Math.ceil((distance / avgSpeed) * 60);

    res.json({
      eta: etaMinutes,
      distance: Math.round(distance * 1000), // 미터 단위
      stopName: child.stop_name,
      busLocation: {
        latitude: busLocation.latitude,
        longitude: busLocation.longitude
      },
      stopLocation: {
        latitude: parseFloat(child.stop_lat),
        longitude: parseFloat(child.stop_lng)
      }
    });
  } catch (err) {
    console.error('ETA 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스의 모든 정류장 ETA 조회 (기사용)
router.get('/bus/:busId/stops', authMiddleware, async (req, res) => {
  try {
    const busLocation = busLocations.get(parseInt(req.params.busId));

    if (!busLocation) {
      return res.json({ stops: [], message: '버스가 운행 중이 아닙니다' });
    }

    const [stops] = await db.execute(
      'SELECT * FROM stops WHERE bus_id = ? ORDER BY stop_order ASC',
      [req.params.busId]
    );

    const stopsWithEta = stops.map(stop => {
      const distance = calculateDistance(
        busLocation.latitude,
        busLocation.longitude,
        parseFloat(stop.latitude),
        parseFloat(stop.longitude)
      );

      const avgSpeed = 30;
      const etaMinutes = Math.ceil((distance / avgSpeed) * 60);

      return {
        ...stop,
        eta: etaMinutes,
        distance: Math.round(distance * 1000)
      };
    });

    res.json({ stops: stopsWithEta, busLocation });
  } catch (err) {
    console.error('버스 정류장 ETA 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// Haversine 공식으로 두 좌표 간 거리 계산 (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
