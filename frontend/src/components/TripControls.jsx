/**
 * 운행 시작/종료 버튼 컴포넌트
 */
function TripControls({ isRunning, connected, onStartTrip, onEndTrip }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {!connected && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          서버와 연결되지 않았습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}
      {!isRunning ? (
        <button 
          onClick={onStartTrip}
          disabled={!connected}
          className={`w-full max-w-md py-4 md:py-5 rounded-xl font-extrabold text-lg md:text-xl transition-all shadow-lg flex items-center justify-center gap-3 ${
            connected 
              ? 'bg-safe-green hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-emerald-100 dark:shadow-emerald-900/30 active:scale-[0.99] cursor-pointer' 
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined font-bold text-2xl">play_circle</span>
          운행 시작
        </button>
      ) : (
        <button 
          onClick={onEndTrip}
          disabled={!connected}
          className={`w-full max-w-md py-4 md:py-5 rounded-xl font-extrabold text-lg md:text-xl transition-all shadow-lg flex items-center justify-center gap-3 ${
            connected 
              ? 'bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700 text-white shadow-rose-100 dark:shadow-rose-900/30 active:scale-[0.99] cursor-pointer' 
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined font-bold text-2xl">stop_circle</span>
          운행 종료
        </button>
      )}
    </div>
  );
}

export default TripControls;
