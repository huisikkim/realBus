import { useState, useEffect } from 'react';
import api from '../services/api';

export function useChildrenManagement() {
  const [children, setChildren] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    loadChildren();
    loadBuses();
  }, []);

  const loadChildren = async () => {
    try {
      const res = await api.get('/child/my');
      setChildren(res.data);
    } catch (err) {
      console.error('아이 목록 로드 실패:', err);
    }
  };

  const loadBuses = async () => {
    try {
      const res = await api.get('/bus');
      setBuses(res.data);
    } catch (err) {
      console.error('버스 목록 로드 실패:', err);
    }
  };

  const loadStops = async (busId) => {
    try {
      const res = await api.get(`/stop/bus/${busId}`);
      setStops(res.data);
    } catch (err) {
      console.error('정류장 목록 로드 실패:', err);
      setStops([]);
    }
  };

  const addChild = async (childData) => {
    if (!childData.name || !childData.age) {
      throw new Error('이름과 나이를 입력해주세요');
    }
    
    await api.post('/child', {
      name: childData.name,
      age: parseInt(childData.age),
      busId: childData.busId || null,
      stopId: childData.stopId || null
    });
    
    await loadChildren();
  };

  return {
    children,
    buses,
    stops,
    loadChildren,
    loadStops,
    addChild
  };
}
