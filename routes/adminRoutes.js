const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const extractUserDataMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
        const token = authorizationHeader.split(' ')[1];
        if (token) {
            try {
                const decodedToken = jwt.verify(token, 'secret_key');
                req.userData = decodedToken;
            } catch (error) {
                console.error('Error decoding token:', error.message);
                req.userData = null;
            }
        }
    }
    next();
};

router.use(extractUserDataMiddleware);

router.get('/listKamar', async (req, res) => {
    try {
        const kamarList = await db.promise().query('SELECT * FROM Kamar');
        res.json(kamarList[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/editKamar/:nomorKamar', urlencodedParser, async (req, res) => {
    const { statusBersih, status } = req.body;

    try {
        if (!req.userData || !req.userData.nomorPegawai) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.userData.nomorPegawai;

        if (!['sudah', 'belum'].includes(statusBersih)) {
            return res.status(400).json({ message: 'Invalid statusBersih value' });
        }
        if (!['terisi', 'kosong'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const result = await db.promise().query('UPDATE Kamar SET statusBersih = ?, status = ?, updatedBy = ? WHERE nomorKamar = ?', [statusBersih, status, userId, req.params.nomorKamar]);

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: 'Kamar not found' });
        }


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

router.put('/editAbsensi/:nomorPegawai', urlencodedParser, async (req, res) => {
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
