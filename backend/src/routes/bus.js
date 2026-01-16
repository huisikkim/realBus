const express = require('express');
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { busLocations } = require('../socket');

const router = express.Router();

// 버스 목록 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [buses] = await db.execute(`
      SELECT b.*, u.name as driver_name 
      FROM buses b 
      LEFT JOIN shuttle_users u ON b.driver_id = u.id
    `);

    // 실시간 위치 정보 추가
    const busesWithLocation = buses.map(bus => ({
      ...bus,
      currentLocation: busLocations.get(bus.id) || null
    }));

    res.json(busesWithLocation);
  } catch (err) {
    console.error('버스 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스 상세 조회
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [buses] = await db.execute(`
      SELECT b.*, u.name as driver_name, u.phone as driver_phone
      FROM buses b 
      LEFT JOIN shuttle_users u ON b.driver_id = u.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (buses.length === 0) {
      return res.status(404).json({ error: '버스를 찾을 수 없습니다' });
    }

    const bus = buses[0];
    bus.currentLocation = busLocations.get(bus.id) || null;

    res.json(bus);
  } catch (err) {
    console.error('버스 상세 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스 등록 (관리자)
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { busNumber, driverId, capacity } = req.body;

    const [result] = await db.execute(
      'INSERT INTO buses (bus_number, driver_id, capacity) VALUES (?, ?, ?)',
      [busNumber, driverId, capacity || 15]
    );

    res.status(201).json({ message: '버스 등록 완료', busId: result.insertId });
  } catch (err) {
    console.error('버스 등록 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 내 버스 조회 (기사용)
router.get('/my/assigned', authMiddleware, roleMiddleware('driver'), async (req, res) => {
  try {
    const [buses] = await db.execute(
      'SELECT * FROM buses WHERE driver_id = ?',
      [req.user.id]
    );

    res.json(buses);
  } catch (err) {
    console.error('내 버스 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스에 탑승 중인 아이들 조회
router.get('/:id/children', authMiddleware, async (req, res) => {
  try {
    const [children] = await db.execute(`
      SELECT c.*, u.name as parent_name, u.phone as parent_phone
      FROM children c
      JOIN shuttle_users u ON c.parent_id = u.id
      WHERE c.bus_id = ?
    `, [req.params.id]);

    res.json(children);
  } catch (err) {
    console.error('탑승 아이 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
