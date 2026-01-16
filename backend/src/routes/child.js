const express = require('express');
const db = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// 내 아이 목록 조회 (부모용) - 현재 탑승 상태 포함
router.get('/my', authMiddleware, roleMiddleware('parent'), async (req, res) => {
  try {
    const [children] = await db.execute(`
      SELECT c.*, b.bus_number, b.status as bus_status,
        (SELECT type FROM boarding_log 
         WHERE child_id = c.id 
         AND DATE(created_at) = CURDATE()
         ORDER BY created_at DESC LIMIT 1) as boarding_status
      FROM children c
      LEFT JOIN buses b ON c.bus_id = b.id
      WHERE c.parent_id = ?
    `, [req.user.id]);

    res.json(children);
  } catch (err) {
    console.error('내 아이 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 아이 등록
router.post('/', authMiddleware, roleMiddleware('parent'), async (req, res) => {
  try {
    const { name, age, busId, stopName } = req.body;

    const [result] = await db.execute(
      'INSERT INTO children (parent_id, name, age, bus_id, stop_name) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, age, busId, stopName]
    );

    res.status(201).json({ message: '아이 등록 완료', childId: result.insertId });
  } catch (err) {
    console.error('아이 등록 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 아이 정보 수정
router.put('/:id', authMiddleware, roleMiddleware('parent'), async (req, res) => {
  try {
    const { name, age, busId, stopName } = req.body;

    // 본인 아이인지 확인
    const [children] = await db.execute(
      'SELECT * FROM children WHERE id = ? AND parent_id = ?',
      [req.params.id, req.user.id]
    );

    if (children.length === 0) {
      return res.status(404).json({ error: '아이를 찾을 수 없습니다' });
    }

    await db.execute(
      'UPDATE children SET name = ?, age = ?, bus_id = ?, stop_name = ? WHERE id = ?',
      [name, age, busId, stopName, req.params.id]
    );

    res.json({ message: '수정 완료' });
  } catch (err) {
    console.error('아이 수정 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 아이 승하차 기록 조회
router.get('/:id/history', authMiddleware, async (req, res) => {
  try {
    const [logs] = await db.execute(`
      SELECT bl.*, b.bus_number
      FROM boarding_log bl
      JOIN buses b ON bl.bus_id = b.id
      WHERE bl.child_id = ?
      ORDER BY bl.created_at DESC
      LIMIT 50
    `, [req.params.id]);

    res.json(logs);
  } catch (err) {
    console.error('승하차 기록 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
