const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 500
  },
  options: [{
    text: {
      type: String,
      required: true,
      maxlength: 200
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  allowMultiple: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  expiresAt: {
    type: Date
  },
  isClosed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Virtual for total votes
pollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((sum, opt) => sum + opt.votes.length, 0);
});

module.exports = mongoose.model('Poll', pollSchema);
