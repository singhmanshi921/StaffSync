const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const {
  addEmployee,
  getEmployees,
  getEmployeeCount,
  getDepartmentCount,
  getEmployeePerformance,
} = require('../controllers/employeeController');

router.get(
  '/performance',
  protect,
  allowRoles('HR', 'Manager'),
  getEmployeePerformance
);

router.post('/', protect, allowRoles('HR'), addEmployee);

router.get(
  '/',
  protect,
  allowRoles('HR', 'Manager', 'Employee'),
  getEmployees
);

router.get(
  '/count',
  protect,
  allowRoles('HR', 'Manager'),
  getEmployeeCount
);

router.get(
  '/department-count',
  protect,
  allowRoles('HR', 'Manager'),
  getDepartmentCount
);

module.exports = router;