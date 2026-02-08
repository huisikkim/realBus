import { useState } from 'react';
import { useAdminData } from '../hooks/useAdminData';
import BusManagement from '../components/admin/BusManagement';
import StopManagement from '../components/admin/StopManagement';
import UserManagement from '../components/admin/UserManagement';
import ChildManagement from '../components/admin/ChildManagement';

function AdminDashboard() {
  const [tab, setTab] = useState('buses');
  const { users, buses, drivers, children, allStops, loadData } = useAdminData();

  const tabs = [
    { id: 'buses', label: '버스 관리', icon: 'directions_bus' },
    { id: 'stops', label: '정류장 관리', icon: 'location_on' },
    { id: 'users', label: '사용자 관리', icon: 'group' },
    { id: 'children', label: '아이 관리', icon: 'child_care' }
  ];

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
      {/* 탭 네비게이션 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                tab === t.id
                  ? 'bg-navy dark:bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 탭별 컴포넌트 렌더링 */}
      {tab === 'buses' && <BusManagement buses={buses} drivers={drivers} onDataChange={loadData} />}
      {tab === 'stops' && <StopManagement buses={buses} onDataChange={loadData} />}
      {tab === 'users' && <UserManagement users={users} onDataChange={loadData} />}
      {tab === 'children' && <ChildManagement children={children} buses={buses} allStops={allStops} onDataChange={loadData} />}
    </main>
  );
}

export default AdminDashboard;
