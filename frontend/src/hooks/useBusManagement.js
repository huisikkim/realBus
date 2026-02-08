import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * 버스 정보와 어린이 목록을 관리하는 커스텀 훅
 */
export function useBusManagement() {
  const [bus, setBus] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyBus();
  }, []);

  useEffect(() => {
    if (bus) {
      loadBusChildren(bus.id);
      
      // DB 상태가 '운행중'이어도 실제로는 종료된 상태일 수 있으므로
      // 로그인 시에는 항상 '대기' 상태로 시작
      if (bus.status === '운행중') {
        api.put(`/bus/${bus.id}/status`, { status: '대기' }).catch(err => {
          console.error('버스 상태 초기화 실패:', err);
        });
      }
    }
  }, [bus]);

  const loadMyBus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bus/my/assigned');
      if (res.data.length > 0) {
        setBus(res.data[0]);
      }
      setError(null);
    } catch (err) {
      console.error('버스 로드 실패:', err);
      setError('버스 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadBusChildren = async (busId) => {
    try {
      const res = await api.get(`/bus/${busId}/children`);
      setChildren(res.data);
    } catch (err) {
      console.error('아이 목록 로드 실패:', err);
      setError('어린이 목록을 불러오는데 실패했습니다.');
    }
  };

  return {
    bus,
    children,
    loading,
    error,
    reloadBus: loadMyBus,
    reloadChildren: () => bus && loadBusChildren(bus.id)
  };
}
