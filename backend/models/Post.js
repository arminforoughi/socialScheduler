const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  scheduledDate: Date,
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  caption: String,
  imageUrl: String,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
  },
  userId: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema); 