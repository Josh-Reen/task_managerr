// server/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  endDate: { type: Date }, // New field for task end date
  isArchived: { type: Boolean, default: false } // New field for archiving
});

module.exports = mongoose.model('Task', taskSchema);