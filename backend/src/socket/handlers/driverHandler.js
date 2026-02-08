const db = require('../../config/database');
const locationService = require('../services/locationService');
const boardingService = require('../services/boardingService');

class DriverHandler {
  constructor(io, notificationService) {
    this.io = io;
    this.notificationService = notificationService;
  }

  /**
   * 기사 이벤트 핸들러 등록
   */
  register(socket) {
    socket.on('driver:updateLocation', (data) => this.handleUpdateLocation(socket, data));
    socket.on('driver:startTrip', (data) => this.handleStartTrip(socket, data));
    socket.on('driver:endTrip', (data) => this.handleEndTrip(socket, data));
    socket.on('driver:childBoarded', (data) => this.handleChildBoarded(socket, data));
    socket.on('driver:childAlighted', (data) => this.handleChildAlighted(socket, data));
  }

  /**
   * 위치 업데이트 처리
   */
  async handleUpdateLocation(socket, data) {
    if (socket.user.role !== 'driver') return;

    const { busId, latitude, longitude, speed } = data;
    
    try {
      const locationData = await locationService.updateLocation(busId, latitude, longitude, speed);
      this.notificationService.broadcastLocation(busId, locationData);
    } catch (err) {
      console.error('위치 업데이트 오류:', err);
    }
  }

  /**
   * 운행 시작 처리
   */
  async handleStartTrip(socket, data) {
    if (socket.user.role !== 'driver') return;

    const { busId } = data;
    
    try {
      await db.execute(
        'UPDATE buses SET status = ?, current_trip_start = NOW() WHERE id = ?',
        ['운행중', busId]
      );
      this.notificationService.notifyTripStarted(busId);
    } catch (err) {
      console.error('운행 시작 오류:', err);
    }
  }

  /**
   * 운행 종료 처리
   */
  async handleEndTrip(socket, data) {
    if (socket.user.role !== 'driver') return;

    const { busId } = data;
    
    try {
      await db.execute(
        'UPDATE buses SET status = ?, current_trip_start = NULL WHERE id = ?',
        ['대기', busId]
      );
      locationService.clearLocation(busId);
      this.notificationService.notifyTripEnded(busId);
    } catch (err) {
      console.error('운행 종료 오류:', err);
    }
  }

  /**
   * 승차 처리
   */
  async handleChildBoarded(socket, data) {
    if (socket.user.role !== 'driver') return;

    const { childId, busId } = data;
    
    try {
      const eventData = await boardingService.processBoarding(childId, busId);
      if (eventData) {
        this.notificationService.notifyBoarding(eventData);
      }
    } catch (err) {
      console.error('승차 처리 오류:', err);
    }
  }

  /**
   * 하차 처리
   */
  async handleChildAlighted(socket, data) {
    if (socket.user.role !== 'driver') return;

    const { childId, busId } = data;
    
    try {
      const eventData = await boardingService.processAlighting(childId, busId);
      if (eventData) {
        this.notificationService.notifyAlighting(eventData);
      }
    } catch (err) {
      console.error('하차 처리 오류:', err);
    }
  }
}

module.exports = DriverHandler;
