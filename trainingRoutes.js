const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  createTraining,
  getTrainings,
  updateTraining,
  deleteTraining,
} = require('../controllers/trainingController');

router.get(
  '/',
  protect,
  allowRoles('HR', 'Manager', 'Employee'),
  getTrainings
);

router.post(
  '/',
  protect,
  allowRoles('HR', 'Manager'),
  createTraining
);

router.put(
  '/:id',
  protect,
  allowRoles('HR'),
  updateTraining
);

router.delete(
  '/:id',
  protect,
  allowRoles('HR'),
  deleteTraining
);

module.exports = router;