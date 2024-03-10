const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

router.use((req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, 'secret_key');
        if (decodedToken.role !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        req.userData = decodedToken;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Authentication failed' });
    }
});

router.get('/listKamar', async (req, res) => {
    try {
        const kamarList = await db.promise().query('SELECT * FROM Kamar');
        res.json(kamarList[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/editKamar/:nomorKamar', async (req, res) => {
    const { statusBersih } = req.body;

    try {
        await db.promise().query('UPDATE Kamar SET statusBersih = ? WHERE nomorKamar = ?', [statusBersih, req.params.nomorKamar]);
        res.json({ message: 'Status kamar updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/listAbsensi', async (req, res) => {
    try {
        const absensiList = await db.promise().query('SELECT * FROM Absensi');
        res.json(absensiList[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/editAbsensi/:nomorPegawai', async (req, res) => {
    const { jamMasuk, jamPulang, tanggal } = req.body;

    try {
        await db.promise().query('UPDATE Absensi SET jamMasuk = ?, jamPulang = ?, tanggal = ? WHERE nomorPegawai = ?', [jamMasuk, jamPulang, tanggal, req.params.nomorPegawai]);
        res.json({ message: 'Data absensi updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
