import KakaoMap from '../KakaoMap';

function BusLocationCard({ busLocation, connected, children }) {
  const hasBoarding = children.some(c => c.boarding_status === '승차');

  if (busLocation && hasBoarding) {
    return (
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden border-0">
        <div className="relative w-full aspect-[4/3] max-h-[400px]">
          <KakaoMap latitude={busLocation.latitude} longitude={busLocation.longitude} />
          
          {/* 상단 그라데이션 오버레이 */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent"></div>
          {/* 하단 그라데이션 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* 상단 정보 */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-0.5">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-base">🚌</span>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-xs drop-shadow-lg">실시간 위치</p>
                <p className="text-white/80 text-[10px] drop-shadow-lg">지금 운행 중</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md ${
              connected ? 'bg-emerald-500/90' : 'bg-slate-500/90'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-white ${connected ? 'animate-pulse' : ''}`}></span>
              <span className="text-white text-[10px] font-bold">LIVE</span>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl p-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">speed</span>
                  <span className="text-slate-900 dark:text-white font-bold text-sm">{busLocation.speed || 0} km/h</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">실시간 추적 중</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden border-0">
      <div className="relative w-full aspect-[4/3] max-h-[400px]">
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">location_off</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-bold text-base mb-1">
              {children.length === 0 
                ? '아이를 등록해주세요'
                : children.some(c => c.bus_id) 
                  ? '탑승 대기 중'
                  : '버스 배정 필요'
              }
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">
              {children.some(c => c.bus_id) 
                ? '탑승하면 실시간으로 위치를 확인할 수 있어요'
                : '아이에게 버스를 배정해주세요'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BusLocationCard;
