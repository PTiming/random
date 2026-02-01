const mongoose = require('mongoose');
const User = require('../models/User');

describe('User Model Test', () => {
  beforeAll(async () => {
    // Use in-memory database for testing
    await mongoose.connect('mongodb://localhost:27017/test-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a user successfully', async () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = new User(validUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.password).not.toBe(validUser.password); // Should be hashed
  });

  it('should fail to create user without required fields', async () => {
    const invalidUser = new User({
      email: 'test@example.com'
      // Missing username
    });

    let error;
    try {
      await invalidUser.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });
});
