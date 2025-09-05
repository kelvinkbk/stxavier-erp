// src/services/studentService.ts
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Student } from '../types';
import { generateRegNo } from '../utils/helpers';

export class StudentService {
  private static readonly COLLECTION_NAME = 'students';

  /**
   * Create a new student record
   */
  static async createStudent(studentData: Omit<Student, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Generate registration number if not provided
      if (!studentData.regNo) {
        studentData.regNo = generateRegNo(studentData.department, studentData.year);
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...studentData,
        createdAt: new Date(),
      });

      console.log('✅ Student created:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error creating student:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all students
   */
  static async getAllStudents(): Promise<Student[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.COLLECTION_NAME), orderBy('name'))
      );
      
      const students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Student);
      });

      console.log(`✅ Retrieved ${students.length} students`);
      return students;
    } catch (error) {
      console.error('❌ Error getting students:', error);
      return [];
    }
  }

  /**
   * Get students by department
   */
  static async getStudentsByDepartment(department: string): Promise<Student[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, this.COLLECTION_NAME),
          where('department', '==', department.toLowerCase()),
          orderBy('name')
        )
      );
      
      const students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Student);
      });

      return students;
    } catch (error) {
      console.error('❌ Error getting students by department:', error);
      return [];
    }
  }

  /**
   * Get students by year
   */
  static async getStudentsByYear(year: number): Promise<Student[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, this.COLLECTION_NAME),
          where('year', '==', year),
          orderBy('name')
        )
      );
      
      const students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Student);
      });

      return students;
    } catch (error) {
      console.error('❌ Error getting students by year:', error);
      return [];
    }
  }

  /**
   * Update student record
   */
  static async updateStudent(
    studentId: string, 
    updates: Partial<Omit<Student, 'id' | 'createdAt'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const studentRef = doc(db, this.COLLECTION_NAME, studentId);
      await updateDoc(studentRef, {
        ...updates,
        updatedAt: new Date(),
      });

      console.log('✅ Student updated:', studentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating student:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete student record
   */
  static async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, studentId));
      console.log('✅ Student deleted:', studentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Search students by name or registration number
   */
  static async searchStudents(searchTerm: string): Promise<Student[]> {
    try {
      // Get all students and filter locally (Firestore doesn't support case-insensitive search)
      const allStudents = await this.getAllStudents();
      
      const filteredStudents = allStudents.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredStudents;
    } catch (error) {
      console.error('❌ Error searching students:', error);
      return [];
    }
  }

  /**
   * Get student statistics
   */
  static async getStudentStats(): Promise<{
    totalStudents: number;
    byDepartment: { [key: string]: number };
    byYear: { [key: number]: number };
  }> {
    try {
      const students = await this.getAllStudents();
      
      const stats = {
        totalStudents: students.length,
        byDepartment: {} as { [key: string]: number },
        byYear: {} as { [key: number]: number },
      };

      students.forEach(student => {
        // Count by department
        const dept = student.department.toLowerCase();
        stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;

        // Count by year
        stats.byYear[student.year] = (stats.byYear[student.year] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting student stats:', error);
      return {
        totalStudents: 0,
        byDepartment: {},
        byYear: {},
      };
    }
  }
}

export default StudentService;
