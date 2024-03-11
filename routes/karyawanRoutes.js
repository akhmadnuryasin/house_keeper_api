const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const urlencodedParser = express.urlencoded({ extended: false });

const extractUserIdMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
        const token = authorizationHeader.split(' ')[1];

        if (token) {
            try {
                const decodedToken = jwt.verify(token, 'secret_key');
                req.user = { id: decodedToken.nomorPegawai };
            } catch (error) {
                console.error('Error decoding token:', error.message);
                req.user = { id: undefined };
            }
        } else {
            req.user = { id: undefined };
        }
    } else {
        req.user = { id: undefined };
    }

    next();
};

router.use(extractUserIdMiddleware);

router.get('/absensi', async (req, res) => {
    try {
        const nomorPegawai = req.user.id;
        const absensiList = await db.promise().query('SELECT * FROM Absensi WHERE nomorPegawai = ?', [nomorPegawai]);
        res.json(absensiList[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/kamar', async (req, res) => {
    try {
        const kamarList = await db.promise().query('SELECT * FROM Kamar');
        res.json(kamarList[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/kamar/:nomorKamar', urlencodedParser, async (req, res) => {
    const { statusBersih } = req.body;
    const userId = req.user && req.user.id;

    try {
        await db.promise().query('UPDATE Kamar SET statusBersih = ?, updatedBy = ? WHERE nomorKamar = ?', [statusBersih, userId, req.params.nomorKamar]);

        res.json({ message: 'Status kamar updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
