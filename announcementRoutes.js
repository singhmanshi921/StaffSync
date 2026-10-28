const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  createAnnouncement,
  getAnnouncements
} = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);

router.post('/', protect, allowRoles('HR'), createAnnouncement);

module.exports = router;