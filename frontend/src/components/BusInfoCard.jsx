import KakaoMap from './KakaoMap';

/**
 * 버스 정보와 지도를 표시하는 컴포넌트
 */
function BusInfoCard({ bus, isRunning, connected, currentLocation, currentPassengers }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-large shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy dark:text-blue-400">{bus.bus_number}호 버스</h2>
              <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                isRunning 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-safe-green dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
              }`}>
                {isRunning ? '운행중' : '대기'}
              </span>
              <span className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${
                connected 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                  : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-blue-600 dark:bg-blue-400 animate-pulse' : 'bg-rose-600 dark:bg-rose-400'}`}></span>
                {connected ? '서버 연결됨' : '서버 연결 안됨'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
              최대 정원: {bus.capacity}명 | 현재 탑승: {currentPassengers}명
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mb-1 uppercase tracking-widest">현재 속도</p>
            <p className="text-3xl md:text-4xl font-black text-navy dark:text-blue-400">
              {currentLocation?.speed || 0} <span className="text-lg font-bold text-slate-400 dark:text-slate-500">km/h</span>
            </p>
          </div>
        </div>

        {/* 지도 */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8 border border-slate-200 dark:border-slate-700 shadow-inner">
          {currentLocation ? (
            <KakaoMap latitude={currentLocation.latitude} longitude={currentLocation.longitude} />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-2">map</span>
                <p className="text-slate-400 dark:text-slate-500 font-medium">운행을 시작하면 지도가 표시됩니다</p>
              </div>
            </div>
          )}
          {currentLocation && (
            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-safe-green dark:bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-slate-700 dark:text-slate-300">실시간 추적 중</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BusInfoCard;
