const express = require('express');
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// 버스별 정류장 목록 조회
router.get('/bus/:busId', authMiddleware, async (req, res) => {
  try {
    const [stops] = await db.execute(
      'SELECT * FROM stops WHERE bus_id = ? ORDER BY stop_order ASC',
      [req.params.busId]
    );
    res.json(stops);
  } catch (err) {
    console.error('정류장 목록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 정류장 등록 (관리자)
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { busId, name, latitude, longitude, stopOrder } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO stops (bus_id, name, latitude, longitude, stop_order) VALUES (?, ?, ?, ?, ?)',
      [busId, name, latitude, longitude, stopOrder || 0]
    );
    
    res.status(201).json({ message: '정류장 등록 완료', stopId: result.insertId });
  } catch (err) {
    console.error('정류장 등록 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 정류장 수정 (관리자)
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { name, latitude, longitude, stopOrder } = req.body;
    
    await db.execute(
      'UPDATE stops SET name = ?, latitude = ?, longitude = ?, stop_order = ? WHERE id = ?',
      [name, latitude, longitude, stopOrder, req.params.id]
    );
    
    res.json({ message: '정류장 수정 완료' });
  } catch (err) {
    console.error('정류장 수정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 정류장 삭제 (관리자)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await db.execute('DELETE FROM stops WHERE id = ?', [req.params.id]);
    res.json({ message: '정류장 삭제 완료' });
  } catch (err) {
    console.error('정류장 삭제 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 정류장 순서 일괄 변경 (관리자)
router.put('/bus/:busId/reorder', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { stops } = req.body; // [{ id, stopOrder }, ...]
    
    for (const stop of stops) {
      await db.execute(
        'UPDATE stops SET stop_order = ? WHERE id = ? AND bus_id = ?',
        [stop.stopOrder, stop.id, req.params.busId]
      );
    }
    
    res.json({ message: '순서 변경 완료' });
  } catch (err) {
    console.error('순서 변경 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
