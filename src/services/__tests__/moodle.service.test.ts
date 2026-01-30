import { MoodleService } from '../moodle.service';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../config', () => ({
  config: {
    moodle: {
      url: 'https://test-moodle.com',
      token: 'test-token',
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MoodleService', () => {
  let moodleService: MoodleService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    };
    
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
    
    // Create a fresh instance
    moodleService = new MoodleService();
  });

  describe('getUsers', () => {
    it('should fetch users from Moodle', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', firstname: 'John', lastname: 'Doe', email: 'john@example.com' },
        { id: 2, username: 'user2', firstname: 'Jane', lastname: 'Smith', email: 'jane@example.com' },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { users: mockUsers },
      });

      const result = await moodleService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
        params: { wsfunction: 'core_user_get_users' },
      });
    });

    it('should handle Moodle API errors', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { exception: true, message: 'API Error' },
      });

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

      mockAxiosInstance.get.mockResolvedValue({
        data: [{ id: 123 }],
      });

      const result = await moodleService.createUser(newUser);

      expect(result.id).toBe(123);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
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

      mockAxiosInstance.get.mockResolvedValue({
        data: mockCourses,
      });

      const result = await moodleService.getCourses();

      expect(result).toEqual(mockCourses);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
        params: { wsfunction: 'core_course_get_courses' },
      });
    });
  });

  describe('enrollUser', () => {
    it('should enroll a user in a course', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {},
      });

      await moodleService.enrollUser(1, 2, 5);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
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
