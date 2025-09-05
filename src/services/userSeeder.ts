// src/services/userSeeder.ts
import { LocalStorageService } from './localStorage';
import { User } from '../types';

export class UserSeeder {
  // One-time function to ensure your admin user exists
  static async ensureAdminExists(): Promise<void> {
    try {
      // Replace with your actual admin user details
      const adminUID = 'YOUR_ADMIN_UID_HERE'; // You'll need to replace this
      const existingAdmin = await LocalStorageService.getUser(adminUID);
      
      if (!existingAdmin) {
        console.log('Creating admin user for cross-platform compatibility...');
        
        const adminUser: User = {
          uid: adminUID,
          name: 'Admin User',
          email: 'admin@stxavier.edu', // Replace with your admin email
          username: 'admin',
          role: 'admin',
          createdAt: new Date(),
        };
        
        await LocalStorageService.saveUser(adminUID, adminUser);
        console.log('Admin user created successfully');
      }
    } catch (error) {
      console.error('Error ensuring admin exists:', error);
    }
  }

  // Function to create a user manually for cross-platform sync
  static async createUserForPlatform(
    uid: string, 
    name: string, 
    email: string, 
    username: string,
    role: 'admin' | 'faculty' | 'student',
    department?: string,
    regNo?: string
  ): Promise<void> {
    try {
      const userData: User = {
        uid,
        name,
        email,
        username,
        role,
        department,
        regNo,
        createdAt: new Date(),
      };
      
      await LocalStorageService.saveUser(uid, userData);
      console.log(`User ${name} (${role}) created for UID: ${uid}`);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}
