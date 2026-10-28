const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    }).sort({ createdAt: -1 }).limit(100);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch notifications',
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id,
      },
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid notification ID',
      });
    }

    console.error('Mark notification error:', error.message);
    res.status(500).json({
      message: 'Failed to update notification',
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications error:', error.message);
    res.status(500).json({
      message: 'Failed to update notifications',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};