class NotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * 특정 사용자에게 알림 전송
   */
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * 특정 버스 구독자들에게 브로드캐스트
   */
  broadcastToBus(busId, event, data) {
    this.io.to(`bus:${busId}`).emit(event, data);
  }

  /**
   * 버스 구독자 수 조회
   */
  getBusSubscriberCount(busId) {
    const roomName = `bus:${busId}`;
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }

  /**
   * 승차 알림 전송
   */
  notifyBoarding(eventData) {
    console.log(`소켓 이벤트 전송: user:${eventData.parentId}`, eventData);
    this.sendToUser(eventData.parentId, 'child:boarded', eventData);
  }

  /**
   * 하차 알림 전송
   */
  notifyAlighting(eventData) {
    this.sendToUser(eventData.parentId, 'child:alighted', eventData);
  }

  /**
   * 위치 업데이트 브로드캐스트
   */
  broadcastLocation(busId, locationData) {
    const subscriberCount = this.getBusSubscriberCount(busId);
    
    if (subscriberCount > 0) {
      console.log(`위치 업데이트 브로드캐스트: bus:${busId} (구독자 ${subscriberCount}명)`);
    }
    
    this.broadcastToBus(busId, 'bus:locationUpdate', locationData);
  }

  /**
   * 운행 시작 알림
   */
  notifyTripStarted(busId) {
    this.broadcastToBus(busId, 'bus:tripStarted', { 
      busId, 
      startTime: new Date() 
    });
  }

  /**
   * 운행 종료 알림
   */
  notifyTripEnded(busId) {
    this.broadcastToBus(busId, 'bus:tripEnded', { 
      busId, 
      endTime: new Date() 
    });
  }

  /**
   * 비상 알림 전송
   */
  notifyEmergency(busId, data) {
    this.broadcastToBus(busId, 'emergency:alert', data);
  }
}

module.exports = NotificationService;
