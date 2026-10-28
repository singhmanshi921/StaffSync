const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const getEmployeeFilter = (user) => {
  if (user.role === 'Manager') return { manager: user.id };
  if (user.role === 'Employee') return { user: user.id };
  return {};
};

const markAttendance = async (req, res) => {
  try {
    const { employeeId, status, date } = req.body;

    if (!employeeId || !status) {
      return res.status(400).json({
        message: 'Employee ID and status are required',
      });
    }

    if (!['Present', 'Absent', 'Late'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid attendance status',
      });
    }

    if (req.user.role === 'Employee' && (!['Present', 'Late'].includes(status) || (date && new Date(date).toDateString() !== new Date().toDateString()))) {
      return res.status(400).json({ message: 'Employees may only mark themselves Present or Late for today' });
    }
    const employeeFilter = req.user.role === 'Employee' ? { user: req.user.id } : { employeeId, ...getEmployeeFilter(req.user) };
    const employee = await Employee.findOne(employeeFilter);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found in your team',
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();

    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid attendance date',
      });
    }

    attendanceDate.setUTCHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        employee: employee._id,
        date: attendanceDate,
      },
      {
        employee: employee._id,
        date: attendanceDate,
        status,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    console.error('Mark attendance error:', error.message);

    res.status(500).json({
      message: 'Failed to mark attendance',
    });
  }
};

const getAttendance = async (req, res) => {
  try {
    const employees = await Employee.find(
      getEmployeeFilter(req.user)
    ).select('_id');

    const employeeIds = employees.map((employee) => employee._id);

    const records = await Attendance.find({
      employee: { $in: employeeIds },
    })
      .populate('employee', 'employeeId department designation')
      .sort({ date: -1 }).limit(Math.min(Number(req.query.limit) || 100, 500));

    res.json(records);
  } catch (error) {
    console.error('Get attendance error:', error.message);

    res.status(500).json({
      message: 'Failed to fetch attendance',
    });
  }
};

const getPresentTodayCount = async (req, res) => {
  try {
    const employees = await Employee.find(
      getEmployeeFilter(req.user)
    ).select('_id');

    const employeeIds = employees.map((employee) => employee._id);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const count = await Attendance.countDocuments({
      employee: { $in: employeeIds },
      status: 'Present',
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({ presentToday: count });
  } catch (error) {
    console.error('Present count error:', error.message);

    res.status(500).json({
      message: 'Failed to count present employees',
    });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getPresentTodayCount,
};