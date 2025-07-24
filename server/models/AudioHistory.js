import mongoose from 'mongoose';

const audioHistorySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  voice: {
    type: String,
    required: true,
    enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'priya', 'meera', 'anjali', 'kavya', 'diya', 'zara', 'neha', 'isha', 'riya', 'aisha', 'maya', 'sana']
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  }
});

// Index for better query performance
audioHistorySchema.index({ createdAt: -1 });
audioHistorySchema.index({ voice: 1 });

export default mongoose.model('AudioHistory', audioHistorySchema); 