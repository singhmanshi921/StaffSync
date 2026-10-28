const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const express = require('express');
const cors = require('cors');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const managerRoutes = require('./routes/managerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
require('dotenv').config();

const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Manager = require('./models/Manager');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - startedAt;
    if (elapsed > 500) console.warn(`Slow request ${req.method} ${req.path}: ${elapsed}ms (${res.statusCode})`);
  });
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to StaffSync HR Management System!',
    status: 'Backend server is running',
    database: 'Available'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || !process.env.MONGO_URI) throw new Error('JWT_SECRET and MONGO_URI must be configured');
  await connectDB();
  if (process.env.HR_EMAIL && process.env.HR_PASSWORD && process.env.HR_NAME) {
    const email = process.env.HR_EMAIL.trim().toLowerCase();
    if (!(await User.exists({ email }))) {
      const password = await bcrypt.hash(process.env.HR_PASSWORD, 12);
      await User.create({ name: process.env.HR_NAME.trim(), email, password, role: 'HR' });
      console.log('Initial HR account created from environment settings');
    }
  }
  const managers = await User.find({ role: 'Manager' }).select('_id');
  for (const manager of managers) await Manager.updateOne({ user: manager._id }, { $setOnInsert: { user: manager._id } }, { upsert: true });
  app.listen(PORT, () => console.log('StaffSync server running on port ' + PORT));
};
startServer();
