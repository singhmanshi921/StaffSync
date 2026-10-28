const User = require('../models/User');
const Employee = require('../models/Employee');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const employee = await Employee.findOne({ user: user._id });

    res.json({
      user,
      employee
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department, designation } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already registered'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        email: normalizedEmail
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const employee = await Employee.findOneAndUpdate(
      { user: user._id },
      {
        phone: typeof phone === 'string' ? phone.trim() : '',
        department: typeof department === 'string' ? department.trim() : '',
        designation: typeof designation === 'string' ? designation.trim() : ''
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      message: 'Profile updated successfully',
      user,
      employee
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};