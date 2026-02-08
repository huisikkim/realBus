import { useState } from 'react';
import { useChildrenManagement } from '../hooks/useChildrenManagement';
import { useParentSocket } from '../hooks/useParentSocket';
import { useETA } from '../hooks/useETA';
import BusLocationCard from '../components/parent/BusLocationCard';
import ChildList from '../components/parent/ChildList';
import AddChildModal from '../components/parent/AddChildModal';

function ParentDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    children,
    buses,
    stops,
    loadChildren,
    loadStops,
    addChild
  } = useChildrenManagement();

  const { busLocation, connected } = useParentSocket({
    children,
    onChildrenUpdate: loadChildren
  });

  const etaData = useETA(children, busLocation);

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 pb-20">
      <BusLocationCard 
        busLocation={busLocation} 
        connected={connected} 
        children={children} 
      />

      <ChildList 
        children={children} 
        etaData={etaData} 
        onAddClick={() => setShowAddModal(true)} 
      />

      <AddChildModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        buses={buses}
        stops={stops}
        onLoadStops={loadStops}
        onSubmit={addChild}
      />
    </main>
  );
}

export default ParentDashboard;
