/**
 * 탑승 어린이 목록 컴포넌트
 */
function ChildrenList({ 
  children, 
  isRunning, 
  currentPassengers,
  hiddenButtons, 
  onBoarding 
}) {
  return (
    <section className="bg-white rounded-large shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-8">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-navy">탑승 어린이 목록</h3>
          <p className="text-slate-500 font-medium text-sm">실시간 탑승 및 하차 상태를 관리하세요.</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-slate-400 text-sm font-bold">총 {children.length}명</span>
          {isRunning && (
            <span className="text-safe-green text-sm font-bold">현재 탑승: {currentPassengers}명</span>
          )}
        </div>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">child_care</span>
          <p className="text-slate-400 font-medium">등록된 어린이가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map(child => (
            <ChildItem
              key={child.id}
              child={child}
              isRunning={isRunning}
              hiddenButtons={hiddenButtons}
              onBoarding={onBoarding}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 개별 어린이 아이템 컴포넌트
 */
function ChildItem({ child, isRunning, hiddenButtons, onBoarding }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-200 transition-all">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-14 h-14 md:w-20 md:h-20 bg-navy text-white rounded-2xl flex items-center justify-center text-xl md:text-3xl font-black shadow-md">
          {child.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg md:text-2xl font-extrabold text-navy">{child.name}</h4>
            {child.stop_name && (
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{child.stop_name}</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
              <span className="material-symbols-outlined text-base">person</span>
              보호자: {child.parent_name}
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
              <span className="material-symbols-outlined text-base">call</span>
              {child.parent_phone || '연락처 없음'}
            </div>
          </div>
        </div>
      </div>
      
      {isRunning && (
        <div className="flex gap-3 w-full md:w-auto">
          {!hiddenButtons[`${child.id}-board`] && (
            <button 
              onClick={() => onBoarding(child.id, 'board')}
              className="flex-1 md:flex-none bg-white hover:bg-emerald-50 text-safe-green border-2 border-emerald-500 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold md:font-black text-base md:text-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">login</span>
              승차
            </button>
          )}
          {!hiddenButtons[`${child.id}-alight`] && (
            <button 
              onClick={() => onBoarding(child.id, 'alight')}
              className="flex-1 md:flex-none bg-navy hover:bg-navy-dark text-white border-2 border-navy px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold md:font-black text-base md:text-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-navy/10"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">logout</span>
              하차
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ChildrenList;
