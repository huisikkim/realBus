import { useState, useEffect } from 'react';
import api from '../services/api';

export function useAdminData() {
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [children, setChildren] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, busesRes, driversRes, childrenRes, stopsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/buses'),
        api.get('/admin/drivers'),
        api.get('/admin/children'),
        api.get('/admin/stops')
      ]);
      setUsers(usersRes.data);
      setBuses(busesRes.data);
      setDrivers(driversRes.data);
      setChildren(childrenRes.data);
      setAllStops(stopsRes.data);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    users,
    buses,
    drivers,
    children,
    allStops,
    loading,
    loadData
  };
}
