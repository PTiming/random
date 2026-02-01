const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Access or create one-on-one chat
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId param not sent with request' });
    }

    // Check if chat already exists
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users')
      .populate('latestMessage');

    chat = await User.populate(chat, {
      path: 'latestMessage.sender',
      select: 'username avatar',
    });

    if (chat.length > 0) {
      res.json(chat[0]);
    } else {
      // Create new chat
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users');
      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('users')
      .populate('groupAdmin')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar',
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const { users, name } = req.body;

    if (!users || !name) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    let parsedUsers = JSON.parse(users);

    if (parsedUsers.length < 2) {
      return res.status(400).json({ message: 'More than 2 users required for group chat' });
    }

    parsedUsers.push(req.user._id);

    const groupChat = await Chat.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users')
      .populate('groupAdmin');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rename group chat
// @route   PUT /api/chats/rename
// @access  Private
const renameGroupChat = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate('users')
      .populate('groupAdmin');

    if (!updatedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add user to group
// @route   PUT /api/chats/groupadd
// @access  Private
const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate('users')
      .populate('groupAdmin');

    if (!added) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove user from group
// @route   PUT /api/chats/groupremove
// @access  Private
const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate('users')
      .populate('groupAdmin');

    if (!removed) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(removed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};
