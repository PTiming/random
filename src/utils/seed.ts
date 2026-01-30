import pool from '../config/database';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create default roles
    console.log('Creating default roles...');
    
    const adminRole = await pool.query(
      `INSERT INTO roles (name, description, is_system_role)
       VALUES ('Admin', 'System administrator with full access', true)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`
    );

    const instructorRole = await pool.query(
      `INSERT INTO roles (name, description, is_system_role)
       VALUES ('Instructor', 'Course instructor with teaching permissions', true)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`
    );

    const studentRole = await pool.query(
      `INSERT INTO roles (name, description, is_system_role)
       VALUES ('Student', 'Student with learning access', true)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`
    );

    console.log('✅ Roles created');

    // Create default permissions
    console.log('Creating default permissions...');

    const permissions = [
      // User permissions
      { resource: 'user', action: 'create', context_level: 'system', description: 'Create users' },
      { resource: 'user', action: 'read', context_level: 'system', description: 'Read all users' },
      { resource: 'user', action: 'update', context_level: 'system', description: 'Update any user' },
      { resource: 'user', action: 'delete', context_level: 'system', description: 'Delete users' },

      // Course permissions
      { resource: 'course', action: 'create', context_level: 'system', description: 'Create courses' },
      { resource: 'course', action: 'read', context_level: 'system', description: 'Read all courses' },
      { resource: 'course', action: 'update', context_level: 'course', description: 'Update course' },
      { resource: 'course', action: 'delete', context_level: 'system', description: 'Delete courses' },

      // Enrollment permissions
      { resource: 'enrollment', action: 'create', context_level: 'course', description: 'Enroll users' },
      { resource: 'enrollment', action: 'read', context_level: 'course', description: 'Read enrollments' },
      { resource: 'enrollment', action: 'update', context_level: 'course', description: 'Update enrollments' },
      { resource: 'enrollment', action: 'delete', context_level: 'course', description: 'Unenroll users' },

      // Grade permissions
      { resource: 'grade', action: 'create', context_level: 'course', description: 'Create grades' },
      { resource: 'grade', action: 'read', context_level: 'course', description: 'Read grades' },
      { resource: 'grade', action: 'update', context_level: 'course', description: 'Update grades' },

      // Assignment permissions
      { resource: 'assignment', action: 'create', context_level: 'course', description: 'Create assignments' },
      { resource: 'assignment', action: 'read', context_level: 'course', description: 'Read assignments' },
      { resource: 'assignment', action: 'update', context_level: 'course', description: 'Update assignments' },
      { resource: 'assignment', action: 'delete', context_level: 'course', description: 'Delete assignments' },

      // Role permissions
      { resource: 'role', action: 'create', context_level: 'system', description: 'Create roles' },
      { resource: 'role', action: 'read', context_level: 'system', description: 'Read roles' },
      { resource: 'role', action: 'update', context_level: 'system', description: 'Update roles' },
      { resource: 'role', action: 'delete', context_level: 'system', description: 'Delete roles' },

      // System permissions
      { resource: 'system', action: 'execute', context_level: 'system', description: 'Execute system operations' },
    ];

    for (const perm of permissions) {
      await pool.query(
        `INSERT INTO permissions (resource, action, context_level, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (resource, action, context_level) DO NOTHING`,
        [perm.resource, perm.action, perm.context_level, perm.description]
      );
    }

    console.log('✅ Permissions created');

    // Assign permissions to Admin role (full access)
    console.log('Assigning permissions to Admin role...');
    
    const allPermissions = await pool.query('SELECT id FROM permissions');
    
    if (adminRole.rows.length > 0 || adminRole.rowCount === 0) {
      const adminRoleId = adminRole.rows[0]?.id || (await pool.query("SELECT id FROM roles WHERE name = 'Admin'")).rows[0].id;
      
      for (const perm of allPermissions.rows) {
        await pool.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [adminRoleId, perm.id]
        );
      }
    }

    console.log('✅ Admin permissions assigned');

    // Assign permissions to Instructor role
    console.log('Assigning permissions to Instructor role...');
    
    if (instructorRole.rows.length > 0 || instructorRole.rowCount === 0) {
      const instructorRoleId = instructorRole.rows[0]?.id || (await pool.query("SELECT id FROM roles WHERE name = 'Instructor'")).rows[0].id;
      
      const instructorPerms = await pool.query(
        `SELECT id FROM permissions WHERE
         (resource = 'course' AND action IN ('create', 'read', 'update')) OR
         (resource = 'enrollment' AND action IN ('create', 'read', 'update')) OR
         (resource = 'grade' AND action IN ('create', 'read', 'update')) OR
         (resource = 'assignment' AND action IN ('create', 'read', 'update', 'delete')) OR
         (resource = 'user' AND action = 'read')`
      );

      for (const perm of instructorPerms.rows) {
        await pool.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [instructorRoleId, perm.id]
        );
      }
    }

    console.log('✅ Instructor permissions assigned');

    // Assign permissions to Student role
    console.log('Assigning permissions to Student role...');
    
    if (studentRole.rows.length > 0 || studentRole.rowCount === 0) {
      const studentRoleId = studentRole.rows[0]?.id || (await pool.query("SELECT id FROM roles WHERE name = 'Student'")).rows[0].id;
      
      const studentPerms = await pool.query(
        `SELECT id FROM permissions WHERE
         (resource = 'course' AND action = 'read') OR
         (resource = 'assignment' AND action = 'read') OR
         (resource = 'grade' AND action = 'read')`
      );

      for (const perm of studentPerms.rows) {
        await pool.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [studentRoleId, perm.id]
        );
      }
    }

    console.log('✅ Student permissions assigned');

    // Create a default admin user
    console.log('Creating default admin user...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name)
       VALUES ('admin', 'admin@lms.local', $1, 'System', 'Administrator')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [adminPassword]
    );

    if (adminUser.rows.length > 0) {
      const adminUserId = adminUser.rows[0].id;
      const adminRoleId = (await pool.query("SELECT id FROM roles WHERE name = 'Admin'")).rows[0].id;
      
      await pool.query(
        `INSERT INTO user_roles (user_id, role_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [adminUserId, adminRoleId]
      );
      
      console.log('✅ Default admin user created (email: admin@lms.local, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding
seedDatabase();
