const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const urlencodedParser = express.urlencoded({ extended: false });

router.post('/login', urlencodedParser, async (req, res) => {
    const { nomorPegawai, password } = req.body || req.query;

    try {
        const user = await db.promise().query('SELECT * FROM Users WHERE nomorPegawai = ? AND password = ?', [nomorPegawai, password]);

        if (!user[0] || user[0].length === 0) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const role = user[0][0].role;
        const namaKaryawan = user[0][0].namaKaryawan;
        const token = jwt.sign({ nomorPegawai, role, namaKaryawan }, 'secret_key', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
