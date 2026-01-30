export interface User {
  id: string;
  moodle_id?: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile?: Record<string, any>;
  preferences?: Record<string, any>;
  last_sync?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  moodle_role_id?: number;
  name: string;
  description?: string;
  parent_role_id?: string;
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  context_level: 'system' | 'course' | 'module';
  description?: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at: Date;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  context_id?: string;
  context_type?: string;
  assigned_at: Date;
}

export interface Course {
  id: string;
  moodle_id?: number;
  name: string;
  description?: string;
  category_id?: string;
  start_date?: Date;
  end_date?: Date;
  status: 'draft' | 'published' | 'archived';
  settings?: Record<string, any>;
  last_sync?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Enrollment {
  id: string;
  moodle_enrollment_id?: number;
  user_id: string;
  course_id: string;
  role_id: string;
  status: 'active' | 'suspended' | 'completed';
  enrolled_at: Date;
  last_sync?: Date;
}

export interface Grade {
  id: string;
  moodle_grade_id?: number;
  user_id: string;
  course_id: string;
  assignment_id?: string;
  grade_value: number;
  max_grade: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  last_sync?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Assignment {
  id: string;
  moodle_assignment_id?: number;
  course_id: string;
  name: string;
  description?: string;
  due_date?: Date;
  max_grade: number;
  settings?: Record<string, any>;
  last_sync?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  direction: 'lms_to_moodle' | 'moodle_to_lms';
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  retry_count: number;
  created_at: Date;
  completed_at?: Date;
}

export enum ResourceType {
  USER = 'user',
  COURSE = 'course',
  ENROLLMENT = 'enrollment',
  GRADE = 'grade',
  ASSIGNMENT = 'assignment',
  CONTENT = 'content',
  ROLE = 'role',
  SYSTEM = 'system'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute'
}
