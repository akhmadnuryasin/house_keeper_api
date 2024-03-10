const express = require('express');
const bodyParser = require('body-parser');
const karyawanRoutes = require('./routes/karyawanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.use('/karyawan', karyawanRoutes);

app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
