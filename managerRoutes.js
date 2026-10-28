const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  getManagers,
  addManager,
  deleteManager,
} = require('../controllers/managerController');

router.get('/', protect, allowRoles('HR'), getManagers);
router.post('/', protect, allowRoles('HR'), addManager);
router.delete('/:id', protect, allowRoles('HR'), deleteManager);

module.exports = router;