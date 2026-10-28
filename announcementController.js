const Notification = require('../models/Notification');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: 'Title and message are required'
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      createdBy: req.user.id
    });
    const users = await User.find({
  _id: { $ne: req.user.id },
}).select('_id');

if (users.length > 0) {
  await Notification.insertMany(
    users.map((user) => ({
      recipient: user._id,
      title: `New Announcement: ${announcement.title}`,
      message: announcement.message,
      type: 'Announcement',
    }))
  );
}
    res.status(201).json({
      message: 'Announcement published successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      message: 'Failed to publish announcement'
    });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 }).limit(100);

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      message: 'Failed to fetch announcements'
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements
};