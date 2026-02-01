const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  syncType: {
    type: String,
    enum: ['user', 'course', 'enrollment', 'grade', 'full'],
    required: true
  },
  direction: {
    type: String,
    enum: ['to_moodle', 'from_moodle', 'bidirectional'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'partial'],
    default: 'pending'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    enum: ['User', 'Course', 'Grade']
  },
  moodleId: {
    type: Number,
    default: null
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  errorMessage: {
    type: String,
    default: null
  },
  errorDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'webhook', 'scheduled', 'system'],
    default: 'system'
  },
  initiatedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient log queries
syncLogSchema.index({ syncType: 1, status: 1 });
syncLogSchema.index({ createdAt: -1 });
syncLogSchema.index({ entityId: 1, entityModel: 1 });

module.exports = mongoose.model('SyncLog', syncLogSchema);
