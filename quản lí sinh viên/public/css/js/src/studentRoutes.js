const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. API Lấy toàn bộ danh sách sinh viên từ CSDL MySQL
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sinh_vien');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. API Thêm sinh viên mới vào CSDL MySQL
router.post('/', async (req, res) => {
    const { ma_sv, ho_ten, gioi_tinh, ma_lop, email, gpa, drl } = req.body;
    try {
        const query = `INSERT INTO sinh_vien (ma_sv, ho_ten, gioi_tinh, ma_lop, email, gpa, drl) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [ma_sv, ho_ten, gioi_tinh, ma_lop, email, gpa, drl]);
        res.json({ success: true, message: 'Thêm sinh viên thành công!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. API Xóa sinh viên khỏi CSDL MySQL theo Mã SV
router.delete('/:ma_sv', async (req, res) => {
    try {
        await db.query('DELETE FROM sinh_vien WHERE ma_sv = ?', [req.params.ma_sv]);
        res.json({ success: true, message: 'Xóa sinh viên thành công!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;