import { MoodleService } from '../moodle.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MoodleService', () => {
  let moodleService: MoodleService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh instance
    moodleService = new MoodleService();
    
    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      get: jest.fn(),
    };
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
  });

  describe('getUsers', () => {
    it('should fetch users from Moodle', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', firstname: 'John', lastname: 'Doe', email: 'john@example.com' },
        { id: 2, username: 'user2', firstname: 'Jane', lastname: 'Smith', email: 'jane@example.com' },
      ];

      // Mock the axios get method
      const mockGet = jest.fn().mockResolvedValue({
        data: { users: mockUsers },
      });
      
      // Override the client.get method
      (moodleService as any).client.get = mockGet;

      const result = await moodleService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockGet).toHaveBeenCalledWith('', {
        params: { wsfunction: 'core_user_get_users' },
      });
    });

    it('should handle Moodle API errors', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        data: { exception: true, message: 'API Error' },
      });
      
      (moodleService as any).client.get = mockGet;

      await expect(moodleService.getUsers()).rejects.toThrow('API Error');
    });
  });

  describe('createUser', () => {
    it('should create a user in Moodle', async () => {
      const newUser = {
        username: 'newuser',
        firstname: 'New',
        lastname: 'User',
        email: 'new@example.com',
      };

      const mockGet = jest.fn().mockResolvedValue({
        data: [{ id: 123 }],
      });
      
      (moodleService as any).client.get = mockGet;

      const result = await moodleService.createUser(newUser);

      expect(result.id).toBe(123);
      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          wsfunction: 'core_user_create_users',
        }),
      });
    });
  });

  describe('getCourses', () => {
    it('should fetch courses from Moodle', async () => {
      const mockCourses = [
        { id: 1, fullname: 'Course 1', shortname: 'C1' },
        { id: 2, fullname: 'Course 2', shortname: 'C2' },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        data: mockCourses,
      });
      
      (moodleService as any).client.get = mockGet;

      const result = await moodleService.getCourses();

      expect(result).toEqual(mockCourses);
      expect(mockGet).toHaveBeenCalledWith('', {
        params: { wsfunction: 'core_course_get_courses' },
      });
    });
  });

  describe('enrollUser', () => {
    it('should enroll a user in a course', async () => {
      const mockGet = jest.fn().mockResolvedValue({
        data: {},
      });
      
      (moodleService as any).client.get = mockGet;

      await moodleService.enrollUser(1, 2, 5);

      expect(mockGet).toHaveBeenCalledWith('', {
        params: expect.objectContaining({
          wsfunction: 'enrol_manual_enrol_users',
          'enrolments[0][userid]': 1,
          'enrolments[0][courseid]': 2,
          'enrolments[0][roleid]': 5,
        }),
      });
    });
  });
});
