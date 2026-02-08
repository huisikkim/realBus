import StopMapPicker from '../StopMapPicker';

function StopModal({ show, editingStop, stopForm, setStopForm, buses, onSave, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-navy dark:text-blue-400">
            {editingStop ? '정류장 수정' : '정류장 추가'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">close</span>
          </button>
        </div>

        <StopMapPicker
          latitude={stopForm.latitude ? parseFloat(stopForm.latitude) : null}
          longitude={stopForm.longitude ? parseFloat(stopForm.longitude) : null}
          onSelect={(lat, lng) => setStopForm({ ...stopForm, latitude: lat.toFixed(8), longitude: lng.toFixed(8) })}
        />

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">버스</label>
            <select
              value={stopForm.busId}
              onChange={(e) => setStopForm({ ...stopForm, busId: e.target.value })}
              disabled={editingStop}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium disabled:bg-slate-100 dark:disabled:bg-slate-800"
            >
              <option value="">버스 선택</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">정류장 이름</label>
            <input
              type="text"
              placeholder="예: OO아파트 앞"
              value={stopForm.name}
              onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">위도</label>
              <input
                type="number"
                step="any"
                placeholder="37.5665"
                value={stopForm.latitude}
                onChange={(e) => setStopForm({ ...stopForm, latitude: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">경도</label>
              <input
                type="number"
                step="any"
                placeholder="126.9780"
                value={stopForm.longitude}
                onChange={(e) => setStopForm({ ...stopForm, longitude: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1.5">순서</label>
            <input
              type="number"
              value={stopForm.stopOrder}
              onChange={(e) => setStopForm({ ...stopForm, stopOrder: parseInt(e.target.value) || 0 })}
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

export default StopModal;
