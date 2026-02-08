import { useState } from 'react';
import api from '../../services/api';
import BusModal from './BusModal';

function BusManagement({ buses, drivers, onDataChange }) {
  const [showBusModal, setShowBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [busForm, setBusForm] = useState({ busNumber: '', driverId: '', capacity: 15 });

  const openBusModal = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setBusForm({ busNumber: bus.bus_number, driverId: bus.driver_id || '', capacity: bus.capacity });
    } else {
      setEditingBus(null);
      setBusForm({ busNumber: '', driverId: '', capacity: 15 });
    }
    setShowBusModal(true);
  };

  const saveBus = async () => {
    try {
      if (editingBus) {
        await api.put(`/admin/buses/${editingBus.id}`, busForm);
      } else {
        await api.post('/admin/buses', busForm);
      }
      setShowBusModal(false);
      onDataChange();
    } catch (err) {
      alert('저장 실패');
    }
  };

  const deleteBus = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/admin/buses/${id}`);
      onDataChange();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  return (
    <>
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-navy dark:text-blue-400">버스 목록</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">등록된 버스를 관리합니다.</p>
          </div>
          <button
            onClick={() => openBusModal()}
            className="bg-navy dark:bg-blue-600 hover:bg-navy-dark dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            버스 추가
          </button>
        </div>

        {buses.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3">directions_bus</span>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">등록된 버스가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {buses.map(bus => (
              <div key={bus.id} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy dark:bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined">directions_bus</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-navy dark:text-blue-400">{bus.bus_number}호 버스</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      기사: {bus.driver_name || '미배정'} · 정원: {bus.capacity}명
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openBusModal(bus)}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteBus(bus.id)}
                    className="px-4 py-2 rounded-lg bg-action-red dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-bold text-sm transition-all"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <BusModal
        show={showBusModal}
        editingBus={editingBus}
        busForm={busForm}
        setBusForm={setBusForm}
        drivers={drivers}
        onSave={saveBus}
        onClose={() => setShowBusModal(false)}
      />
    </>
  );
}

export default BusManagement;
