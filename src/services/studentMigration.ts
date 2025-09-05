// src/services/studentMigration.ts
import { LocalStorageService } from './localStorage';
import { StudentService } from './studentService';
import { Student, User } from '../types';

export class StudentMigration {
  /**
   * Migrate users with role 'student' to the students collection
   */
  static async migrateUsersToStudents(): Promise<{ success: boolean; migrated: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;

    try {
      console.log('🔄 Starting student migration...');
      
      // Get all users
      const users = await LocalStorageService.getAllUsers();
      console.log(`📊 Found ${users.length} total users`);
      
      // Filter users with student role
      const studentUsers = users.filter(user => user.role === 'student');
      console.log(`👥 Found ${studentUsers.length} student users to migrate`);
      
      if (studentUsers.length === 0) {
        return { success: true, migrated: 0, errors: ['No student users found to migrate'] };
      }

      // Check if students already exist to avoid duplicates
      const existingStudents = await StudentService.getAllStudents();
      const existingEmails = new Set(existingStudents.map(s => s.email));
      
      for (const user of studentUsers) {
        try {
          // Skip if student already exists
          if (existingEmails.has(user.email)) {
            console.log(`⏭️ Skipping ${user.name} - already exists in students collection`);
            continue;
          }

          // Create student record from user data
          const studentData: Omit<Student, 'id' | 'createdAt'> = {
            name: user.name,
            email: user.email,
            regNo: user.regNo || `STU${Date.now()}${Math.floor(Math.random() * 1000)}`, // Generate if missing
            department: user.department || 'General',
            year: this.extractYearFromRegNo(user.regNo) || 1,
            phone: user.phone || '',
            address: '',
            guardianName: '',
            guardianPhone: '',
            courses: this.getDefaultCourses(user.department || 'General'),
          };

          const result = await StudentService.createStudent(studentData);
          
          if (result.success) {
            migrated++;
            console.log(`✅ Migrated ${user.name} to students collection`);
          } else {
            errors.push(`Failed to migrate ${user.name}: ${result.error}`);
          }
        } catch (error) {
          const errorMsg = `Error migrating ${user.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log(`🎉 Migration completed: ${migrated} students migrated`);
      return { success: true, migrated, errors };
      
    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      return { success: false, migrated, errors: [errorMsg, ...errors] };
    }
  }

  /**
   * Extract year from registration number
   */
  private static extractYearFromRegNo(regNo?: string): number | null {
    if (!regNo) return null;
    
    // Try to extract year from common formats like "2024CS001", "CS2024001", etc.
    const yearMatch = regNo.match(/20(\d{2})/);
    if (yearMatch) {
      const year = parseInt(`20${yearMatch[1]}`);
      const currentYear = new Date().getFullYear();
      // Calculate academic year (1st, 2nd, 3rd, 4th)
      return Math.min(Math.max(currentYear - year + 1, 1), 4);
    }
    
    return 1; // Default to 1st year
  }

  /**
   * Get default courses based on department
   */
  private static getDefaultCourses(department: string): string[] {
    const courseMap: { [key: string]: string[] } = {
      'Computer Science': [
        'Programming Fundamentals',
        'Data Structures',
        'Database Management',
        'Computer Networks',
        'Software Engineering'
      ],
      'Electronics': [
        'Circuit Analysis',
        'Digital Electronics',
        'Microprocessors',
        'Communication Systems',
        'VLSI Design'
      ],
      'Mathematics': [
        'Calculus',
        'Linear Algebra',
        'Statistics',
        'Discrete Mathematics',
        'Mathematical Analysis'
      ],
      'Physics': [
        'Classical Mechanics',
        'Thermodynamics',
        'Electromagnetism',
        'Quantum Physics',
        'Optics'
      ],
      'Chemistry': [
        'Organic Chemistry',
        'Inorganic Chemistry',
        'Physical Chemistry',
        'Analytical Chemistry',
        'Biochemistry'
      ],
      'Commerce': [
        'Accounting',
        'Business Studies',
        'Economics',
        'Business Mathematics',
        'Commercial Law'
      ],
      'General': [
        'English',
        'Mathematics',
        'Science',
        'Social Studies',
        'Computer Applications'
      ]
    };

    return courseMap[department] || courseMap['General'];
  }

  /**
   * Create sample students for testing (if no users exist)
   */
  static async createSampleStudents(): Promise<void> {
    const sampleStudents = [
      {
        name: 'Kel Student',
        email: 'kel@student.com',
        regNo: 'CS2024001',
        department: 'Computer Science',
        year: 1,
        phone: '9876543210',
        address: '123 Student Street, City',
        guardianName: 'Kel Parent',
        guardianPhone: '9876543211',
        courses: ['Programming Fundamentals', 'Data Structures', 'Database Management']
      },
      {
        name: 'Robin Shinu',
        email: 'robinshinu5@student.com',
        regNo: 'CS2024002',
        department: 'Computer Science',
        year: 2,
        phone: '9876543212',
        address: '456 Learning Lane, City',
        guardianName: 'Robin Parent',
        guardianPhone: '9876543213',
        courses: ['Software Engineering', 'Computer Networks', 'Database Management']
      },
      {
        name: 'Sample Student 1',
        email: 'sample1@college.edu',
        regNo: 'EC2024001',
        department: 'Electronics',
        year: 1,
        phone: '9876543214',
        address: '789 Electronics Ave, City',
        guardianName: 'Sample Parent 1',
        guardianPhone: '9876543215',
        courses: ['Circuit Analysis', 'Digital Electronics', 'Microprocessors']
      },
      {
        name: 'Sample Student 2',
        email: 'sample2@college.edu',
        regNo: 'ME2024001',
        department: 'Mathematics',
        year: 3,
        phone: '9876543216',
        address: '321 Math Street, City',
        guardianName: 'Sample Parent 2',
        guardianPhone: '9876543217',
        courses: ['Calculus', 'Linear Algebra', 'Statistics']
      }
    ];

    console.log('🔄 Creating sample students...');
    let created = 0;

    for (const student of sampleStudents) {
      try {
        const result = await StudentService.createStudent(student);
        if (result.success) {
          created++;
          console.log(`✅ Created sample student: ${student.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create sample student ${student.name}:`, error);
      }
    }

    console.log(`🎉 Sample data creation completed: ${created}/${sampleStudents.length} students created`);
  }

  /**
   * Sync all user data to ensure students are created for new student users
   */
  static async syncUsersWithStudents(): Promise<void> {
    try {
      const result = await this.migrateUsersToStudents();
      console.log(`📊 Sync completed: ${result.migrated} students synced`);
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Some sync errors occurred:', result.errors);
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  }
}
