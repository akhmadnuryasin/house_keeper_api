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
        const namaKaryawan = user[0][0].nama;

        let userType;
        if (role === 'admin') {
            userType = 'Admin';
        } else if (role === 'karyawan') {
            userType = 'Karyawan';
        } else {
            userType = 'Unknown';
        }

        const tokenPayload = {
            nomorPegawai,
            role,
            namaKaryawan
        };

        const token = jwt.sign(tokenPayload, 'secret_key', { expiresIn: '1h' });

        res.json({ token, userType, nomorPegawai, nama: namaKaryawan }); // Menambahkan nama ke respons JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
