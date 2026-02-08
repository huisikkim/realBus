const locationService = require('../services/locationService');

class ParentHandler {
  constructor(io, notificationService) {
    this.io = io;
    this.notificationService = notificationService;
  }

  /**
   * 부모 이벤트 핸들러 등록
   */
  register(socket) {
    socket.on('parent:subscribeBus', (data) => this.handleSubscribeBus(socket, data));
    socket.on('parent:unsubscribeBus', (data) => this.handleUnsubscribeBus(socket, data));
  }

  /**
   * 버스 구독
   */
  handleSubscribeBus(socket, data) {
    if (socket.user.role !== 'parent') return;

    const { busId } = data;
    
    console.log(`\n=== 버스 구독 ===`);
    console.log(`부모 ID: ${socket.user.id}, 버스 ID: ${busId}`);
    
    socket.join(`bus:${busId}`);
    console.log(`✅ 버스 룸 참여 완료: bus:${busId}`);

    // 현재 위치 즉시 전송
    const currentLocation = locationService.getCurrentLocation(busId);
    if (currentLocation) {
      console.log('현재 버스 위치 전송:', currentLocation);
      socket.emit('bus:locationUpdate', currentLocation);
    } else {
      console.log('현재 버스 위치 없음 (운행 중이 아님)');
    }
    console.log('=================\n');
  }

  /**
   * 버스 구독 해제
   */
  handleUnsubscribeBus(socket, data) {
    const { busId } = data;
    socket.leave(`bus:${busId}`);
  }
}

module.exports = ParentHandler;
