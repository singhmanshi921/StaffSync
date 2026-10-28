
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  markAttendance,
  getAttendance,
  getPresentTodayCount,
} = require('../controllers/attendanceController');

router.post('/', protect, allowRoles('HR', 'Manager', 'Employee'), markAttendance);
router.get('/', protect, allowRoles('HR', 'Manager', 'Employee'), getAttendance);
router.get(
  '/present-today',
  protect,
  allowRoles('HR', 'Manager'),
  getPresentTodayCount
);

module.exports = router;
