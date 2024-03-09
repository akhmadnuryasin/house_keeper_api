// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan nama pengguna MySQL Anda
    password: '', // Ganti dengan kata sandi MySQL Anda
    database: 'hotel_management',
});

module.exports = db;
