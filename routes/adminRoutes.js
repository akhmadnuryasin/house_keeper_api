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
    const { nomorKamar, statusBersih, status } = req.body;

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

        const result = await db.promise().query('UPDATE Kamar SET nomorKamar = ?, statusBersih = ?, status = ?, updatedBy = ? WHERE nomorKamar = ?', [nomorKamar, statusBersih, status, userId, req.params.nomorKamar]);

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

router.put('/editAbsensi/:id', urlencodedParser, async (req, res) => {
    const { jamMasuk, jamPulang, tanggal } = req.body;

    try {
        const currentTimestamp = new Date().toISOString().slice(0, 10);
        const absensiDate = tanggal ? tanggal : currentTimestamp;

        await db.promise().query('UPDATE Absensi SET jamMasuk = ?, jamPulang = ?, tanggal = ? WHERE id = ?', [jamMasuk, jamPulang, absensiDate, req.params.id]);
        res.json({ message: 'Data absensi updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// users routes

router.post('/users', urlencodedParser, async (req, res) => {
    try {
        const { nomorPegawai, password, role, nama } = req.body;

        if (!nomorPegawai || !password || !role || !nama) {
            return res.status(400).json({ message: 'Nomor Pegawai, password, role, dan nama diperlukan' });
        }

        const existingUser = await db.promise().query('SELECT * FROM Users WHERE nomorPegawai = ?', [nomorPegawai]);
        if (existingUser[0].length > 0) {
            return res.status(409).json({ message: 'Nomor Pegawai sudah digunakan' });
        }

        const newUser = {
            nomorPegawai,
            password,
            role,
            nama
        };

        const result = await db.promise().query('INSERT INTO Users (nomorPegawai, password, role, nama) VALUES (?, ?, ?, ?)', [newUser.nomorPegawai, newUser.password, newUser.role, newUser.nama]);

        res.status(201).json({ message: 'User created successfully', userId: result[0].insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/users', async (req, res) => {
    try {
        const users = await db.promise().query('SELECT * FROM Users');
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await db.promise().query('SELECT * FROM Users WHERE id = ?', [userId]);

        if (user[0].length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user[0][0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/users/:userId', urlencodedParser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { nomorPegawai, password, role, nama } = req.body;

        if (!nomorPegawai && (!password || !role || !nama)) {
            return res.status(400).json({ message: 'Nomor Pegawai, password, role, dan nama diperlukan' });
        }

        if (nomorPegawai) {
            const existingUser = await db.promise().query('SELECT * FROM Users WHERE nomorPegawai = ? AND id != ?', [nomorPegawai, userId]);
            if (existingUser[0].length > 0) {
                return res.status(409).json({ message: 'Nomor Pegawai sudah digunakan oleh pengguna lain' });
            }
        }

        const valuesToUpdate = [];
        let query = 'UPDATE Users SET';

        if (nomorPegawai) {
            query += ' nomorPegawai = ?,';
            valuesToUpdate.push(nomorPegawai);
        }
        if (password) {
            query += ' password = ?,';
            valuesToUpdate.push(password);
        }
        if (role) {
            query += ' role = ?,';
            valuesToUpdate.push(role);
        }
        if (nama) {
            query += ' nama = ?,';
            valuesToUpdate.push(nama);
        }

        query = query.slice(0, -1);

        query += ' WHERE id = ?';
        valuesToUpdate.push(userId);

        const result = await db.promise().query(query, valuesToUpdate);

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.delete('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.promise().query('DELETE FROM Users WHERE id = ?', [userId]);

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
