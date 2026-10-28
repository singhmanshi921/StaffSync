const mongoose = require('mongoose');
const managerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  teamName: { type: String, trim: true, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Manager', managerSchema);
