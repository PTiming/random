module.exports = {
  baseUrl: process.env.MOODLE_URL,
  token: process.env.MOODLE_TOKEN,
  webhookSecret: process.env.MOODLE_WEBHOOK_SECRET,
  endpoints: {
    webservice: '/webservice/rest/server.php',
    // Common Moodle web service functions
    functions: {
      // User functions
      createUsers: 'core_user_create_users',
      updateUsers: 'core_user_update_users',
      getUsers: 'core_user_get_users',
      getUsersByField: 'core_user_get_users_by_field',
      deleteUsers: 'core_user_delete_users',
      
      // Course functions
      getCourses: 'core_course_get_courses',
      getCoursesByField: 'core_course_get_courses_by_field',
      createCourses: 'core_course_create_courses',
      updateCourses: 'core_course_update_courses',
      deleteCourses: 'core_course_delete_courses',
      
      // Enrollment functions
      enrollUsers: 'enrol_manual_enrol_users',
      unenrollUsers: 'enrol_manual_unenrol_users',
      getEnrolledUsers: 'core_enrol_get_enrolled_users',
      getUserCourses: 'core_enrol_get_users_courses',
      
      // Grade functions
      getGrades: 'core_grades_get_grades',
      updateGrades: 'core_grades_update_grades',
      getCourseGrades: 'gradereport_user_get_grades_table',
      
      // Assignment functions
      getAssignments: 'mod_assign_get_assignments',
      getSubmissions: 'mod_assign_get_submissions',
      
      // Completion functions
      getCourseCompletion: 'core_completion_get_course_completion_status',
      getActivitiesCompletion: 'core_completion_get_activities_completion_status'
    }
  }
};
