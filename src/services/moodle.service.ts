import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  auth?: string;
  suspended?: number;
  lastaccess?: number;
}

export interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  categoryid: number;
  summary?: string;
  startdate?: number;
  enddate?: number;
  visible?: number;
}

export interface MoodleEnrollment {
  id: number;
  userid: number;
  courseid: number;
  roleid: number;
  timestart: number;
  timeend: number;
  status: number;
}

export interface MoodleGrade {
  id: number;
  userid: number;
  itemid: number;
  rawgrade: number;
  rawgrademax: number;
  feedback?: string;
  timecreated: number;
  timemodified: number;
}

export class MoodleService {
  private client: AxiosInstance;
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = config.moodle.url;
    this.token = config.moodle.token;
    
    this.client = axios.create({
      baseURL: `${this.baseUrl}/webservice/rest/server.php`,
      params: {
        wstoken: this.token,
        moodlewsrestformat: 'json',
      },
    });
  }

  /**
   * Generic method to call Moodle Web Service
   */
  private async call<T>(wsfunction: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.client.get('', {
        params: {
          wsfunction,
          ...params,
        },
      });

      if (response.data.exception) {
        throw new Error(response.data.message || 'Moodle API error');
      }

      return response.data;
    } catch (error: any) {
      console.error(`Moodle API error (${wsfunction}):`, error.message);
      throw error;
    }
  }

  // ==================== User Management ====================

  /**
   * Get users from Moodle
   */
  async getUsers(criteria: Array<{ key: string; value: string }> = []): Promise<MoodleUser[]> {
    const params: Record<string, any> = {};
    criteria.forEach((c, index) => {
      params[`criteria[${index}][key]`] = c.key;
      params[`criteria[${index}][value]`] = c.value;
    });

    const response = await this.call<{ users: MoodleUser[] }>('core_user_get_users', params);
    return response.users || [];
  }

  /**
   * Create user in Moodle
   */
  async createUser(user: Partial<MoodleUser>): Promise<MoodleUser> {
    const params: Record<string, any> = {
      'users[0][username]': user.username,
      'users[0][firstname]': user.firstname,
      'users[0][lastname]': user.lastname,
      'users[0][email]': user.email,
      'users[0][auth]': user.auth || 'manual',
    };

    const response = await this.call<Array<{ id: number }>>('core_user_create_users', params);
    if (response && response[0]) {
      return { ...user, id: response[0].id } as MoodleUser;
    }
    throw new Error('Failed to create user in Moodle');
  }

  /**
   * Update user in Moodle
   */
  async updateUser(user: Partial<MoodleUser> & { id: number }): Promise<void> {
    const params: Record<string, any> = {
      'users[0][id]': user.id,
    };

    if (user.username) params['users[0][username]'] = user.username;
    if (user.firstname) params['users[0][firstname]'] = user.firstname;
    if (user.lastname) params['users[0][lastname]'] = user.lastname;
    if (user.email) params['users[0][email]'] = user.email;

    await this.call('core_user_update_users', params);
  }

  /**
   * Delete user in Moodle
   */
  async deleteUser(userId: number): Promise<void> {
    const params = {
      'userids[0]': userId,
    };
    await this.call('core_user_delete_users', params);
  }

  // ==================== Course Management ====================

  /**
   * Get courses from Moodle
   */
  async getCourses(courseIds?: number[]): Promise<MoodleCourse[]> {
    const params: Record<string, any> = {};
    
    if (courseIds && courseIds.length > 0) {
      params['options[ids]'] = courseIds;
    }

    const response = await this.call<MoodleCourse[]>('core_course_get_courses', params);
    return response || [];
  }

  /**
   * Create course in Moodle
   */
  async createCourse(course: Partial<MoodleCourse>): Promise<MoodleCourse> {
    const params: Record<string, any> = {
      'courses[0][fullname]': course.fullname,
      'courses[0][shortname]': course.shortname,
      'courses[0][categoryid]': course.categoryid || 1,
    };

    if (course.summary) params['courses[0][summary]'] = course.summary;
    if (course.startdate) params['courses[0][startdate]'] = course.startdate;
    if (course.enddate) params['courses[0][enddate]'] = course.enddate;

    const response = await this.call<MoodleCourse[]>('core_course_create_courses', params);
    if (response && response[0]) {
      return response[0];
    }
    throw new Error('Failed to create course in Moodle');
  }

  /**
   * Update course in Moodle
   */
  async updateCourse(course: Partial<MoodleCourse> & { id: number }): Promise<void> {
    const params: Record<string, any> = {
      'courses[0][id]': course.id,
    };

    if (course.fullname) params['courses[0][fullname]'] = course.fullname;
    if (course.shortname) params['courses[0][shortname]'] = course.shortname;
    if (course.summary) params['courses[0][summary]'] = course.summary;

    await this.call('core_course_update_courses', params);
  }

  /**
   * Delete course in Moodle
   */
  async deleteCourse(courseId: number): Promise<void> {
    const params = {
      'courseids[0]': courseId,
    };
    await this.call('core_course_delete_courses', params);
  }

  // ==================== Enrollment Management ====================

  /**
   * Get enrolled users in a course
   */
  async getEnrolledUsers(courseId: number): Promise<MoodleUser[]> {
    const params = {
      courseid: courseId,
    };
    const response = await this.call<MoodleUser[]>('core_enrol_get_enrolled_users', params);
    return response || [];
  }

  /**
   * Enroll user in course
   */
  async enrollUser(userId: number, courseId: number, roleId: number = 5): Promise<void> {
    const params = {
      'enrolments[0][roleid]': roleId,
      'enrolments[0][userid]': userId,
      'enrolments[0][courseid]': courseId,
    };
    await this.call('enrol_manual_enrol_users', params);
  }

  /**
   * Unenroll user from course
   */
  async unenrollUser(userId: number, courseId: number): Promise<void> {
    const params = {
      'enrolments[0][userid]': userId,
      'enrolments[0][courseid]': courseId,
    };
    await this.call('enrol_manual_unenrol_users', params);
  }

  // ==================== Grade Management ====================

  /**
   * Get grades for a course
   */
  async getGrades(courseId: number, userId?: number): Promise<any> {
    const params: Record<string, any> = {
      courseid: courseId,
    };

    if (userId) {
      params.userid = userId;
    }

    return await this.call('core_grades_get_grades', params);
  }

  /**
   * Update grade
   */
  async updateGrade(
    courseId: number,
    userId: number,
    itemId: number,
    grade: number
  ): Promise<void> {
    const params = {
      source: 'mod/assignment',
      courseid: courseId,
      component: 'mod_assign',
      activityid: itemId,
      itemnumber: 0,
      'grades[0][studentid]': userId,
      'grades[0][grade]': grade,
    };

    await this.call('core_grades_update_grades', params);
  }

  // ==================== Role Management ====================

  /**
   * Get all roles
   */
  async getRoles(): Promise<any[]> {
    return await this.call('core_role_get_all_roles', {});
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleId: number, contextId: number): Promise<void> {
    const params = {
      'assignments[0][roleid]': roleId,
      'assignments[0][userid]': userId,
      'assignments[0][contextid]': contextId,
    };
    await this.call('core_role_assign_roles', params);
  }

  /**
   * Unassign role from user
   */
  async unassignRole(userId: number, roleId: number, contextId: number): Promise<void> {
    const params = {
      'unassignments[0][roleid]': roleId,
      'unassignments[0][userid]': userId,
      'unassignments[0][contextid]': contextId,
    };
    await this.call('core_role_unassign_roles', params);
  }
}

export default new MoodleService();
