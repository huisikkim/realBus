import { useState, useEffect } from 'react';
import api from '../services/api';

export function useETA(children, busLocation) {
  const [etaData, setEtaData] = useState({});

  useEffect(() => {
    const boardedChildren = children.filter(c => c.boarding_status === '승차');
    if (boardedChildren.length === 0 || !busLocation) {
      setEtaData({});
      return;
    }

    const fetchEta = async () => {
      const etaResults = {};
      for (const child of boardedChildren) {
        if (child.bus_id && child.stop_id) {
          try {
            const res = await api.get(`/eta/child/${child.id}`);
            etaResults[child.id] = res.data;
          } catch (err) {
            if (err.response?.status !== 500) {
              console.error('ETA 조회 실패:', err);
            }
          }
        }
      }
      setEtaData(etaResults);
    };

    fetchEta();
    const interval = setInterval(fetchEta, 30000);

    return () => clearInterval(interval);
  }, [children, busLocation]);

  return etaData;
}
