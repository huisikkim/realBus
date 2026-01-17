const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { executeWithRetry } = require('../utils/dbRetry');

const router = express.Router();

// 내 알림 목록 조회
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [notifications] = await executeWithRetry(() =>
      db.execute(`
        SELECT n.*, c.name as child_name, b.bus_number
        FROM notifications n
        LEFT JOIN children c ON n.child_id = c.id
        LEFT JOIN buses b ON n.bus_id = b.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 50
      `, [req.user.id])
    );

    res.json(notifications);
  } catch (err) {
    console.error('알림 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 읽지 않은 알림 개수
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const [result] = await executeWithRetry(() =>
      db.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [req.user.id]
      )
    );

    res.json({ count: result[0].count });
  } catch (err) {
    console.error('읽지 않은 알림 개수 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 알림 읽음 처리
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await executeWithRetry(() =>
      db.execute(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      )
    );

    res.json({ message: '읽음 처리 완료' });
  } catch (err) {
    console.error('알림 읽음 처리 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 모든 알림 읽음 처리
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await executeWithRetry(() =>
      db.execute(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
        [req.user.id]
      )
    );

    res.json({ message: '모든 알림 읽음 처리 완료' });
  } catch (err) {
    console.error('모든 알림 읽음 처리 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 알림 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await executeWithRetry(() =>
      db.execute(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      )
    );

    res.json({ message: '알림 삭제 완료' });
  } catch (err) {
    console.error('알림 삭제 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
