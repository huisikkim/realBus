const db = require('../../config/database');

// 버스별 실시간 위치 저장 (메모리)
const busLocations = new Map();

class LocationService {
  /**
   * 버스 위치 업데이트
   */
  async updateLocation(busId, latitude, longitude, speed) {
    const locationData = {
      busId,
      latitude,
      longitude,
      speed,
      timestamp: new Date()
    };

    // 메모리에 저장
    busLocations.set(busId, locationData);

    // DB에 기록 (히스토리)
    try {
      await db.execute(
        'INSERT INTO location_history (bus_id, latitude, longitude, speed) VALUES (?, ?, ?, ?)',
        [busId, latitude, longitude, speed || 0]
      );
    } catch (err) {
      console.error('위치 저장 오류:', err);
      throw err;
    }

    return locationData;
  }

  /**
   * 현재 버스 위치 조회
   */
  getCurrentLocation(busId) {
    return busLocations.get(busId);
  }

  /**
   * 버스 위치 삭제 (운행 종료 시)
   */
  clearLocation(busId) {
    busLocations.delete(busId);
  }

  /**
   * 모든 버스 위치 조회
   */
  getAllLocations() {
    return busLocations;
  }
}

module.exports = new LocationService();
