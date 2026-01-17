import { useState, useEffect } from 'react';
import api from '../services/api';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // 30초마다 새 알림 확인
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notification/my');
      setNotifications(res.data);
    } catch (err) {
      console.error('알림 로드 실패:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/notification/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('읽지 않은 알림 개수 로드 실패:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notification/read-all');
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('모든 알림 읽음 처리 실패:', err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    // MySQL에서 받은 UTC 시간에 9시간(한국 시간) 더하기
    const date = new Date(timestamp);
    date.setHours(date.getHours() + 9);
    
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // 초 단위

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case '승차': return 'login';
      case '하차': return 'logout';
      case '운행시작': return 'play_circle';
      case '운행종료': return 'stop_circle';
      case '비상': return 'warning';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case '승차': return 'text-safe-green';
      case '하차': return 'text-slate-500';
      case '운행시작': return 'text-blue-500';
      case '운행종료': return 'text-slate-500';
      case '비상': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="relative">
      {/* 알림 벨 버튼 */}
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) loadNotifications();
        }}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <span className="material-symbols-outlined text-2xl text-slate-600">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {showDropdown && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-navy">알림</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  모두 읽음
                </button>
              )}
            </div>

            {/* 알림 목록 */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">notifications_off</span>
                  <p className="text-slate-400 font-medium">알림이 없습니다</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notif.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-2xl ${getNotificationColor(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-navy text-sm">{notif.title}</h4>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm">{notif.message}</p>
                        <p className="text-slate-400 text-xs mt-1">{formatTime(notif.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
