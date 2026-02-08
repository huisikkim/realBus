import { useState, useEffect } from 'react';
import api from '../../services/api';
import StopModal from './StopModal';

function StopManagement({ buses, onDataChange }) {
  const [stops, setStops] = useState([]);
  const [showStopModal, setShowStopModal] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopForm, setStopForm] = useState({ busId: '', name: '', latitude: '', longitude: '', stopOrder: 0 });
  const [selectedBusForStops, setSelectedBusForStops] = useState('');

  useEffect(() => {
    if (selectedBusForStops) {
      loadBusStops(selectedBusForStops);
    }
  }, [selectedBusForStops]);

  const loadBusStops = async (busId) => {
    try {
      const res = await api.get(`/stop/bus/${busId}`);
      setStops(res.data);
    } catch (err) {
      console.error('정류장 로드 실패:', err);
    }
  };

  const openStopModal = (stop = null) => {
    if (stop) {
      setEditingStop(stop);
      setStopForm({
        busId: stop.bus_id,
        name: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopOrder: stop.stop_order
      });
    } else {
      setEditingStop(null);
      setStopForm({
        busId: selectedBusForStops || '',
        name: '',
        latitude: '',
        longitude: '',
        stopOrder: stops.length
      });
    }
    setShowStopModal(true);
  };

  const saveStop = async () => {
    if (!stopForm.busId || !stopForm.name || !stopForm.latitude || !stopForm.longitude) {
      alert('모든 필드를 입력해주세요');
      return;
    }
    try {
      if (editingStop) {
        await api.put(`/stop/${editingStop.id}`, stopForm);
      } else {
        await api.post('/stop', stopForm);
      }
      setShowStopModal(false);
      onDataChange();
      if (selectedBusForStops) loadBusStops(selectedBusForStops);
    } catch (err) {
      alert('저장 실패');
    }
  };

  const deleteStop = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/stop/${id}`);
      onDataChange();
      if (selectedBusForStops) loadBusStops(selectedBusForStops);
    } catch (err) {
      alert('삭제 실패');
    }
  };

  return (
    <>
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-navy dark:text-blue-400">정류장 관리</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">버스별 정류장을 등록하고 관리합니다.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={selectedBusForStops}
              onChange={(e) => setSelectedBusForStops(e.target.value)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-medium bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-navy dark:focus:border-blue-400 focus:ring-2 focus:ring-navy/10 dark:focus:ring-blue-400/10 outline-none"
            >
              <option value="">버스 선택</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>{bus.bus_number}호 버스</option>
              ))}
            </select>
            <button
              onClick={() => openStopModal()}
              disabled={!selectedBusForStops}
              className="bg-navy dark:bg-blue-600 hover:bg-navy-dark dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-lg">add_location</span>
              <span className="hidden sm:inline">정류장 추가</span>
            </button>
          </div>
        </div>

        {!selectedBusForStops ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3">map</span>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">버스를 선택해주세요</p>
          </div>
        ) : stops.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3">location_off</span>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">등록된 정류장이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={stop.id} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-safe-green dark:bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-extrabold text-navy dark:text-blue-400">{stop.name}</h4>
                      <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                        {parseFloat(stop.latitude).toFixed(6)}, {parseFloat(stop.longitude).toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openStopModal(stop)}
                      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteStop(stop.id)}
                      className="px-4 py-2 rounded-lg bg-action-red dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-bold text-sm transition-all"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <StopModal
        show={showStopModal}
        editingStop={editingStop}
        stopForm={stopForm}
        setStopForm={setStopForm}
        buses={buses}
        onSave={saveStop}
        onClose={() => setShowStopModal(false)}
      />
    </>
  );
}

export default StopManagement;
