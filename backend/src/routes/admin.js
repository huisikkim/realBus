const express = require('express');
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// 관리자 전용 미들웨어
router.use(authMiddleware, roleMiddleware('admin'));

// 전체 사용자 목록
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, name, phone, role, created_at FROM shuttle_users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    console.error('사용자 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 역할 변경
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    await db.execute('UPDATE shuttle_users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: '역할 변경 완료' });
  } catch (err) {
    console.error('역할 변경 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 전체 버스 목록
router.get('/buses', async (req, res) => {
  try {
    const [buses] = await db.execute(`
      SELECT b.*, u.name as driver_name, u.email as driver_email
      FROM buses b
      LEFT JOIN shuttle_users u ON b.driver_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(buses);
  } catch (err) {
    console.error('버스 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스 등록
router.post('/buses', async (req, res) => {
  try {
    const { busNumber, driverId, capacity } = req.body;
    const [result] = await db.execute(
      'INSERT INTO buses (bus_number, driver_id, capacity) VALUES (?, ?, ?)',
      [busNumber, driverId || null, capacity || 15]
    );
    res.status(201).json({ message: '버스 등록 완료', busId: result.insertId });
  } catch (err) {
    console.error('버스 등록 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스 수정 (기사 배정 포함)
router.put('/buses/:id', async (req, res) => {
  try {
    const { busNumber, driverId, capacity } = req.body;
    await db.execute(
      'UPDATE buses SET bus_number = ?, driver_id = ?, capacity = ? WHERE id = ?',
      [busNumber, driverId || null, capacity, req.params.id]
    );
    res.json({ message: '버스 수정 완료' });
  } catch (err) {
    console.error('버스 수정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 버스 삭제
router.delete('/buses/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM buses WHERE id = ?', [req.params.id]);
    res.json({ message: '버스 삭제 완료' });
  } catch (err) {
    console.error('버스 삭제 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 기사 목록 (버스 배정용)
router.get('/drivers', async (req, res) => {
  try {
    const [drivers] = await db.execute(
      "SELECT id, name, email, phone FROM shuttle_users WHERE role = 'driver'"
    );
    res.json(drivers);
  } catch (err) {
    console.error('기사 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 전체 아이 목록
router.get('/children', async (req, res) => {
  try {
    const [children] = await db.execute(`
      SELECT c.*, u.name as parent_name, u.phone as parent_phone, b.bus_number, s.name as stop_name
      FROM children c
      JOIN shuttle_users u ON c.parent_id = u.id
      LEFT JOIN buses b ON c.bus_id = b.id
      LEFT JOIN stops s ON c.stop_id = s.id
      ORDER BY c.created_at DESC
    `);
    res.json(children);
  } catch (err) {
    console.error('아이 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 아이 버스 배정
router.put('/children/:id/bus', async (req, res) => {
  try {
    const { busId } = req.body;
    await db.execute('UPDATE children SET bus_id = ?, stop_id = NULL WHERE id = ?', [busId || null, req.params.id]);
    res.json({ message: '버스 배정 완료' });
  } catch (err) {
    console.error('버스 배정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 아이 정류장 배정
router.put('/children/:id/stop', async (req, res) => {
  try {
    const { stopId } = req.body;
    await db.execute('UPDATE children SET stop_id = ? WHERE id = ?', [stopId || null, req.params.id]);
    res.json({ message: '정류장 배정 완료' });
  } catch (err) {
    console.error('정류장 배정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 전체 정류장 목록
router.get('/stops', async (req, res) => {
  try {
    const [stops] = await db.execute(`
      SELECT s.*, b.bus_number
      FROM stops s
      JOIN buses b ON s.bus_id = b.id
      ORDER BY b.bus_number, s.stop_order
    `);
    res.json(stops);
  } catch (err) {
    console.error('정류장 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
