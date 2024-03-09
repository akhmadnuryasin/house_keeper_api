const express = require('express');
const bodyParser = require('body-parser');
const karyawanRoutes = require('./routes/karyawanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Use Auth Routes
app.use('/auth', authRoutes);

// Use Karyawan Routes
app.use('/karyawan', karyawanRoutes);

// Use Admin Routes
app.use('/admin', adminRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
