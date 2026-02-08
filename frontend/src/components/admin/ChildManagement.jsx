import api from '../../services/api';

function ChildManagement({ children, buses, allStops, onDataChange }) {
  const assignChildBus = async (childId, busId) => {
    try {
      await api.put(`/admin/children/${childId}/bus`, { busId: busId || null });
      onDataChange();
    } catch (err) {
      alert('배정 실패');
    }
  };

  const assignChildStop = async (childId, stopId) => {
    try {
      await api.put(`/admin/children/${childId}/stop`, { stopId: stopId || null });
      onDataChange();
    } catch (err) {
      alert('정류장 배정 실패');
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-navy dark:text-blue-400">아이 목록</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">아이의 버스와 정류장을 배정합니다.</p>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3">child_care</span>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">등록된 아이가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map(child => (
            <div key={child.id} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy dark:bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-md">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-extrabold text-navy dark:text-blue-400">{child.name}</h4>
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold">{child.age}세</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">보호자: {child.parent_name}</p>
                    {child.stop_name && (
                      <p className="text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {child.stop_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={child.bus_id || ''}
                    onChange={(e) => assignChildBus(child.id, e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 font-medium text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 outline-none"
                  >
                    <option value="">버스 미배정</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>{bus.bus_number}호</option>
                    ))}
                  </select>
                  <select
                    value={child.stop_id || ''}
                    onChange={(e) => assignChildStop(child.id, e.target.value)}
                    disabled={!child.bus_id}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 font-medium text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600"
                  >
                    <option value="">정류장 미배정</option>
                    {allStops.filter(s => s.bus_id === child.bus_id).map(stop => (
                      <option key={stop.id} value={stop.id}>{stop.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ChildManagement;
