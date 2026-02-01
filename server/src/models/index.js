const User = require('./User');
const Post = require('./Post');
const Notification = require('./Notification');
const { Message, Conversation } = require('./Message');
const Group = require('./Group');
const { MoodleCourse, MoodleSyncLog, UserMoodleMapping } = require('./Moodle');

module.exports = {
  User,
  Post,
  Notification,
  Message,
  Conversation,
  Group,
  MoodleCourse,
  MoodleSyncLog,
  UserMoodleMapping
};
