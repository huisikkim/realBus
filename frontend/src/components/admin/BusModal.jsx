function BusModal({ show, editingBus, busForm, setBusForm, drivers, onSave, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-navy dark:text-blue-400">
            {editingBus ? '버스 수정' : '버스 추가'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">버스 번호</label>
            <input
              type="text"
              placeholder="예: 1"
              value={busForm.busNumber}
              onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">기사 배정</label>
            <select
              value={busForm.driverId}
              onChange={(e) => setBusForm({ ...busForm, driverId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium"
            >
              <option value="">기사 선택 (선택사항)</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">정원</label>
            <input
              type="number"
              value={busForm.capacity}
              onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) || 15 })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-navy dark:bg-blue-600 hover:bg-navy-dark dark:hover:bg-blue-700 transition-all shadow-md"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusModal;
