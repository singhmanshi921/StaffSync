const Employee = require('../models/Employee');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const getEmployeeFilter = (user) => {
  if (user.role === 'Manager') {
    return { manager: user.id };
  }

  return {};
};

const addEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      department,
      designation,
      phone,
      joiningDate,
      managerId,
      email,
    } = req.body;

    if (!employeeId?.trim() || !department?.trim() || !designation?.trim()) {
      return res.status(400).json({
        message: 'Employee ID, department and designation are required',
      });
    }

    let manager = null;

    if (managerId) {
      manager = await User.findOne({
        _id: managerId,
        role: 'Manager',
      });

      if (!manager) {
        return res.status(400).json({
          message: 'Please select a valid manager',
        });
      }
    }

    const account = email ? await User.findOne({ email: email.trim().toLowerCase(), role: 'Employee' }) : null;
    if (!account) return res.status(400).json({ message: 'Register the employee account first, then enter its email here' });
    const existingProfile = await Employee.findOne({ user: account._id });
    if (existingProfile) return res.status(409).json({ message: 'This account already has an employee profile' });

    const employee = await Employee.create({
      user: account._id,
      manager: manager ? manager._id : null,
      employeeId: employeeId.trim(),
      department: department.trim(),
      designation: designation.trim(),
      phone,
      joiningDate,
    });

    res.status(201).json({
      message: 'Employee added successfully',
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Employee ID already exists',
      });
    }

    console.error('Add employee error:', error.message);

    res.status(500).json({
      message: 'Failed to add employee',
    });
  }
};

const getEmployees = async (req, res) => {
  try {
    const filter = req.user.role === 'Employee' ? { user: req.user.id } : getEmployeeFilter(req.user);
    const employees = await Employee.find(filter)
      .populate('user', 'name email')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 }).limit(500);

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error.message);

    res.status(500).json({
      message: 'Failed to fetch employees',
    });
  }
};

const getEmployeeCount = async (req, res) => {
  try {
    const count = await Employee.countDocuments(
      getEmployeeFilter(req.user)
    );

    res.json({
      totalEmployees: count,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to count employees',
    });
  }
};

const getDepartmentCount = async (req, res) => {
  try {
    const departments = await Employee.distinct(
      'department',
      getEmployeeFilter(req.user)
    );

    res.json({
      totalDepartments: departments.length,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to count departments',
    });
  }
};

// Employee performance report
const getEmployeePerformance = async (req, res) => {
  try {
    const filter = req.user.role === 'Employee' ? { user: req.user.id } : getEmployeeFilter(req.user);
    const employees = await Employee.find(filter)
      .populate('user', 'name email')
      .populate('manager', 'name')
      .select('employeeId department designation manager joiningDate')
      .sort({ employeeId: 1 });

    if (employees.length === 0) {
      return res.json({
        totalEmployees: 0,
        report: [],
      });
    }

    const employeeIds = employees.map((employee) => employee._id);

    const [attendanceStats, leaveStats] = await Promise.all([
      Attendance.aggregate([
        {
          $match: {
            employee: { $in: employeeIds },
          },
        },
        {
          $group: {
            _id: {
              employee: '$employee',
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
      ]),

      Leave.aggregate([
        {
          $match: {
            employee: { $in: employeeIds },
          },
        },
        {
          $group: {
            _id: {
              employee: '$employee',
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const attendanceMap = {};
    const leaveMap = {};

    attendanceStats.forEach((item) => {
      const id = item._id.employee.toString();

      if (!attendanceMap[id]) {
        attendanceMap[id] = {
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalAttendance: 0,
        };
      }

      if (item._id.status === 'Present') {
        attendanceMap[id].presentDays = item.count;
      }

      if (item._id.status === 'Absent') {
        attendanceMap[id].absentDays = item.count;
      }

      if (item._id.status === 'Late') {
        attendanceMap[id].lateDays = item.count;
      }

      attendanceMap[id].totalAttendance += item.count;
    });

    leaveStats.forEach((item) => {
      const id = item._id.employee.toString();

      if (!leaveMap[id]) {
        leaveMap[id] = {
          approvedLeaves: 0,
          pendingLeaves: 0,
          rejectedLeaves: 0,
        };
      }

      if (item._id.status === 'Approved') {
        leaveMap[id].approvedLeaves = item.count;
      }

      if (item._id.status === 'Pending') {
        leaveMap[id].pendingLeaves = item.count;
      }

      if (item._id.status === 'Rejected') {
        leaveMap[id].rejectedLeaves = item.count;
      }
    });

    const report = employees.map((employee) => {
      const id = employee._id.toString();

      const attendance = attendanceMap[id] || {
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalAttendance: 0,
      };

      const leaves = leaveMap[id] || {
        approvedLeaves: 0,
        pendingLeaves: 0,
        rejectedLeaves: 0,
      };

      const attendancePercentage =
        attendance.totalAttendance > 0
          ? Number(
              (
                (attendance.presentDays /
                  attendance.totalAttendance) *
                100
              ).toFixed(1)
            )
          : null;

      return {
        _id: employee._id,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        manager: employee.manager?.name || 'Not assigned',
        joiningDate: employee.joiningDate,
        ...attendance,
        attendancePercentage,
        ...leaves,
      };
    });

    res.json({
      totalEmployees: report.length,
      report,
    });
  } catch (error) {
    console.error('Employee performance error:', error.message);

    res.status(500).json({
      message: 'Failed to generate employee performance report',
    });
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeCount,
  getDepartmentCount,
  getEmployeePerformance,
};
