
const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getPendingLeaveCount,
} = require('../controllers/leaveController');

router.post('/', protect, applyLeave);
router.get('/', protect, getLeaves);
router.get(
  '/pending-count',
  protect,
  allowRoles('HR', 'Manager'),
  getPendingLeaveCount
);
router.patch('/:id/status', protect, allowRoles('HR', 'Manager'), updateLeaveStatus);

module.exports = router;
