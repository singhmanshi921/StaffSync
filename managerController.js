const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Manager = require('../models/Manager');

const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'Manager' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      totalManagers: managers.length,
      managers,
    });
  } catch (error) {
    console.error('Get managers error:', error.message);
    res.status(500).json({ message: 'Failed to fetch managers' });
  }
};

const addManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Manager',
    });

    await Manager.create({ user: manager._id });

    res.status(201).json({
      message: 'Manager added successfully',
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
      },
    });
  } catch (error) {
    console.error('Add manager error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered',
      });
    }

    res.status(500).json({ message: 'Failed to add manager' });
  }
};

const deleteManager = async (req, res) => {
  try {
    const manager = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'Manager',
    });

    if (!manager) {
      return res.status(404).json({
        message: 'Manager not found',
      });
    }

    await Manager.findOneAndDelete({ user: manager._id });
    res.json({ message: 'Manager deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid manager ID',
      });
    }

    console.error('Delete manager error:', error.message);
    res.status(500).json({ message: 'Failed to delete manager' });
  }
};

module.exports = {
  getManagers,
  addManager,
  deleteManager,
};