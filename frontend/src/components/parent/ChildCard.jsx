function ChildCard({ child, etaData }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* 카드 헤더 */}
      <div className="p-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {/* 프로필 이미지 with 그라데이션 링 */}
          <div className={`w-14 h-14 rounded-full p-0.5 ${
            child.boarding_status === '승차' 
              ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400' 
              : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700'
          }`}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-black shadow-inner">
              {child.name.charAt(0)}
            </div>
          </div>
          {/* 상태 배지 */}
          {child.boarding_status === '승차' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-md">
              <span className="text-[10px]">✓</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{child.name}</h4>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
              {child.age}세
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🚌</span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">
              {child.bus_number ? `${child.bus_number}호 버스` : '버스 미배정'}
            </p>
          </div>
        </div>
        {child.boarding_status && (
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${
            child.boarding_status === '승차' 
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-500/30' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          }`}>
            {child.boarding_status}
          </span>
        )}
      </div>

      {/* 카드 본문 */}
      {child.stop_name && (
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-3 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">📍</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">{child.stop_name}</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">하차 정류장</p>
              </div>
            </div>
            {/* ETA 표시 - 승차 중일 때만 */}
            {child.boarding_status === '승차' && etaData[child.id]?.eta && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">⏱️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                      약 {etaData[child.id].eta}분 후 도착
                    </p>
                    <p className="text-amber-500/70 dark:text-amber-400/70 text-xs">
                      {(etaData[child.id].distance / 1000).toFixed(1)}km 남음
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChildCard;
