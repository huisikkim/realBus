import ChildCard from './ChildCard';

function ChildList({ children, etaData, onAddClick }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">내 아이</h3>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-bold text-sm hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>추가</span>
        </button>
      </div>

      {children.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30 flex items-center justify-center">
            <span className="text-5xl">👶</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-bold mb-2">아직 등록된 아이가 없어요</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">아이를 등록하고 버스를 배정해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map(child => (
            <ChildCard key={child.id} child={child} etaData={etaData} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ChildList;
