import api from '../../services/api';

function UserManagement({ users, onDataChange }) {
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      onDataChange();
    } catch (err) {
      alert('역할 변경 실패');
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-navy dark:text-blue-400">사용자 목록</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">사용자 역할을 관리합니다.</p>
      </div>

      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-slate-200 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-navy dark:bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-md flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-extrabold text-navy dark:text-blue-400 truncate">{user.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              className={`px-4 py-2 rounded-lg font-bold text-sm border-2 outline-none transition-all flex-shrink-0 w-28 ${
                user.role === 'admin' 
                  ? 'border-action-red dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-action-red dark:text-red-400'
                  : user.role === 'driver'
                  ? 'border-safe-green dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-safe-green dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <option value="parent">학부모</option>
              <option value="driver">기사</option>
              <option value="admin">관리자</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UserManagement;
