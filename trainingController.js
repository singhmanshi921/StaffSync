const Training = require('../models/Training');

const createTraining = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title?.trim() || !description?.trim() || !date) {
      return res.status(400).json({
        message: 'Title, description and date are required',
      });
    }

    const trainingDate = new Date(date);

    if (Number.isNaN(trainingDate.getTime())) {
      return res.status(400).json({
        message: 'Please provide a valid training date',
      });
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      date: trainingDate,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: 'Training program added successfully',
      training,
    });
  } catch (error) {
    console.error('Create training error:', error.message);

    res.status(500).json({
      message: 'Failed to create training program',
    });
  }
};

const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate('createdBy', 'name')
      .sort({ date: 1 }).limit(100);

    res.json(trainings);
  } catch (error) {
    console.error('Get trainings error:', error.message);

    res.status(500).json({
      message: 'Failed to load training programs',
    });
  }
};

const updateTraining = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title?.trim() || !description?.trim() || !date) {
      return res.status(400).json({
        message: 'Title, description and date are required',
      });
    }

    const trainingDate = new Date(date);

    if (Number.isNaN(trainingDate.getTime())) {
      return res.status(400).json({
        message: 'Please provide a valid training date',
      });
    }

    const training = await Training.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim(),
        date: trainingDate,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('createdBy', 'name');

    if (!training) {
      return res.status(404).json({
        message: 'Training program not found',
      });
    }

    res.json({
      message: 'Training program updated successfully',
      training,
    });
  } catch (error) {
    console.error('Update training error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid training ID',
      });
    }

    res.status(500).json({
      message: 'Failed to update training program',
    });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({
        message: 'Training program not found',
      });
    }

    res.json({
      message: 'Training program deleted successfully',
    });
  } catch (error) {
    console.error('Delete training error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid training ID',
      });
    }

    res.status(500).json({
      message: 'Failed to delete training program',
    });
  }
};

module.exports = {
  createTraining,
  getTrainings,
  updateTraining,
  deleteTraining,
};