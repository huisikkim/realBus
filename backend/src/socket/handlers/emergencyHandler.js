const db = require('../../config/database');
const locationService = require('../services/locationService');

class EmergencyHandler {
  constructor(io, notificationService) {
    this.io = io;
    this.notificationService = notificationService;
  }

  /**
   * 비상 이벤트 핸들러 등록
   */
  register(socket) {
    socket.on('emergency', (data) => this.handleEmergency(socket, data));
  }

  /**
   * 비상 알림 처리
   */
  async handleEmergency(socket, data) {
    const { busId, message } = data;
    
    try {
      await db.execute(
        'INSERT INTO emergency_log (bus_id, user_id, message) VALUES (?, ?, ?)',
        [busId, socket.user.id, message]
      );
      
      const emergencyData = {
        busId,
        message,
        time: new Date(),
        location: locationService.getCurrentLocation(busId)
      };
      
      this.notificationService.notifyEmergency(busId, emergencyData);
    } catch (err) {
      console.error('비상 알림 오류:', err);
    }
  }
}

module.exports = EmergencyHandler;
