const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

const getEmployeeFilter = (user) => {
  if (user.role === 'HR') {
    return {};
  }

  if (user.role === 'Manager') {
    return { manager: user.id };
  }

  return { user: user.id };
};

const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if ((req.user.role !== 'Employee' && !employeeId) || !leaveType || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        message: 'All leave fields are required',
      });
    }

    if (!['Casual', 'Sick', 'Earned', 'Other'].includes(leaveType)) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      return res.status(400).json({
        message: 'Please provide valid leave dates',
      });
    }

    const employee = await Employee.findOne({
      employeeId: employeeId.trim(),
      user: req.user.id,
    });

    if (!employee) {
      return res.status(404).json({
        message: req.user.role === 'Employee' ? 'Your employee profile is not linked yet. Please contact HR.' : 'Employee not found in your team',
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
    });

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave,
    });
  } catch (error) {
    console.error('Apply leave error:', error.message);
    res.status(500).json({
      message: 'Failed to submit leave application',
    });
  }
};

const getLeaves = async (req, res) => {
  try {
    const employeeFilter = getEmployeeFilter(req.user);
    const employees = await Employee.find(employeeFilter).select('_id');
    const employeeIds = employees.map((employee) => employee._id);

    const leaves = await Leave.find({
      employee: { $in: employeeIds },
    })
      .populate('employee', 'employeeId department designation manager user')
      .sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 100, 500));

    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch leave applications',
    });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be Approved or Rejected',
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: 'Leave application not found',
      });
    }

    const employee = await Employee.findOne({
      _id: leave.employee,
      ...getEmployeeFilter(req.user),
    });

    if (!employee) {
      return res.status(403).json({
        message: 'You cannot update this leave application',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        message: 'This leave application has already been reviewed',
      });
    }

    leave.status = status;
    await leave.save();

    // Employee.user currently identifies the user who created the record.
    // Notification delivery may need employee-login linking to be accurate.
    if (employee.user) {
      await Notification.create({
        recipient: employee.user,
        title: `Leave ${status}`,
        message: `Your ${leave.leaveType} leave request has been ${status.toLowerCase()}.`,
        type: 'Leave',
      });
    }

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    console.error('Update leave status error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid leave application ID' });
    }

    res.status(500).json({
      message: 'Failed to update leave status',
    });
  }
};

const getPendingLeaveCount = async (req, res) => {
  try {
    const employeeFilter = getEmployeeFilter(req.user);
    const employees = await Employee.find(employeeFilter).select('_id');
    const employeeIds = employees.map((employee) => employee._id);

    const count = await Leave.countDocuments({
      employee: { $in: employeeIds },
      status: 'Pending',
    });

    res.json({ pendingLeaves: count });
  } catch (error) {
    console.error('Pending leave count error:', error.message);
    res.status(500).json({
      message: 'Failed to count pending leaves',
    });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getPendingLeaveCount,
};