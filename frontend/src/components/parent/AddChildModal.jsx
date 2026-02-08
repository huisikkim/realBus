import { useState, useEffect } from 'react';

function AddChildModal({ isOpen, onClose, buses, stops, onLoadStops, onSubmit }) {
  const [childForm, setChildForm] = useState({ name: '', age: '', busId: '', stopId: '' });

  useEffect(() => {
    if (childForm.busId) {
      onLoadStops(childForm.busId);
    }
  }, [childForm.busId, onLoadStops]);

  const handleSubmit = async () => {
    try {
      await onSubmit(childForm);
      setChildForm({ name: '', age: '', busId: '', stopId: '' });
      onClose();
    } catch (err) {
      alert(err.message || '등록 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl animate-slide-up md:animate-none">
        {/* 모달 헤더 */}
        <div className="relative p-4 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={onClose}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <span className="text-slate-500 dark:text-slate-400 text-xl">✕</span>
          </button>
          <h3 className="text-center text-base font-bold text-slate-900 dark:text-white">새 아이 등록</h3>
        </div>
        
        {/* 모달 본문 */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">아이 이름</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium"
              placeholder="이름을 입력하세요"
              value={childForm.name}
              onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">나이</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium"
              placeholder="나이를 입력하세요"
              value={childForm.age}
              onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">버스 선택</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium"
              value={childForm.busId}
              onChange={(e) => setChildForm({ ...childForm, busId: e.target.value, stopId: '' })}
            >
              <option value="">선택 안 함 (나중에 배정)</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">정류장 선택</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 outline-none transition-all font-medium disabled:opacity-50"
              value={childForm.stopId}
              onChange={(e) => setChildForm({ ...childForm, stopId: e.target.value })}
              disabled={!childForm.busId}
            >
              <option value="">{childForm.busId ? '선택 안 함' : '버스를 먼저 선택하세요'}</option>
              {stops.map(stop => (
                <option key={stop.id} value={stop.id}>{stop.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddChildModal;
