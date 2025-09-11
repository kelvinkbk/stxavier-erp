import { LocalStorageService } from '../services/localStorage';
import { User } from '../types';

/**
 * Utility to detect and clean up duplicate user entries
 */
export class DuplicateUserCleanup {

  /**
   * Find duplicate users based on email or username
   */
  static async findDuplicates(): Promise<{
    emailDuplicates: { [email: string]: User[] };
    usernameDuplicates: { [username: string]: User[] };
  }> {
    try {
      const allUsers = await LocalStorageService.getAllUsers();

      const emailGroups: { [email: string]: User[] } = {};
      const usernameGroups: { [username: string]: User[] } = {};

      // Group users by email and username
      allUsers.forEach(user => {
        // Group by email
        if (!emailGroups[user.email]) {
          emailGroups[user.email] = [];
        }
        emailGroups[user.email].push(user);

        // Group by username
        if (!usernameGroups[user.username]) {
          usernameGroups[user.username] = [];
        }
        usernameGroups[user.username].push(user);
      });

      // Filter to only duplicates (groups with more than 1 user)
      const emailDuplicates: { [email: string]: User[] } = {};
      const usernameDuplicates: { [username: string]: User[] } = {};

      Object.entries(emailGroups).forEach(([email, users]) => {
        if (users.length > 1) {
          emailDuplicates[email] = users;
        }
      });

      Object.entries(usernameGroups).forEach(([username, users]) => {
        if (users.length > 1) {
          usernameDuplicates[username] = users;
        }
      });

      return { emailDuplicates, usernameDuplicates };

    } catch (error) {
      console.error('Error finding duplicates:', error);
      return { emailDuplicates: {}, usernameDuplicates: {} };
    }
  }

  /**
   * Automatically resolve duplicates by keeping the most recent entry
   */
  static async autoResolveDuplicates(): Promise<{
    removed: number;
    kept: number;
    errors: string[];
  }> {
    try {
      const { emailDuplicates, usernameDuplicates } = await this.findDuplicates();
      const errors: string[] = [];
      let removedCount = 0;
      let keptCount = 0;

      // Process email duplicates
      for (const [email, users] of Object.entries(emailDuplicates)) {
        try {
          const result = await this.resolveDuplicateGroup(users, `email: ${email}`);
          removedCount += result.removed;
          keptCount += result.kept;
        } catch (error) {
          errors.push(`Failed to resolve email duplicates for ${email}: ${error}`);
        }
      }

      // Process username duplicates (if not already resolved by email)
      for (const [username, users] of Object.entries(usernameDuplicates)) {
        try {
          // Check if these users still exist (might have been removed by email duplicate resolution)
          const stillExistingUsers = [];
          for (const user of users) {
            const exists = await LocalStorageService.getUser(user.uid);
            if (exists) {
              stillExistingUsers.push(user);
            }
          }

          if (stillExistingUsers.length > 1) {
            const result = await this.resolveDuplicateGroup(stillExistingUsers, `username: ${username}`);
            removedCount += result.removed;
            keptCount += result.kept;
          }
        } catch (error) {
          errors.push(`Failed to resolve username duplicates for ${username}: ${error}`);
        }
      }

      console.log(`🧹 Duplicate cleanup completed: ${removedCount} removed, ${keptCount} kept`);
      return { removed: removedCount, kept: keptCount, errors };

    } catch (error) {
      console.error('Error in auto resolve duplicates:', error);
      return { removed: 0, kept: 0, errors: [String(error)] };
    }
  }

  /**
   * Resolve a group of duplicate users by keeping the most recent one
   */
  private static async resolveDuplicateGroup(users: User[], context: string): Promise<{
    removed: number;
    kept: number;
  }> {
    if (users.length <= 1) {
      return { removed: 0, kept: users.length };
    }

    console.log(`🔍 Resolving ${users.length} duplicates for ${context}`);

    // Sort by creation date (most recent first)
    const sortedUsers = users.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Keep the most recent user
    const userToKeep = sortedUsers[0];
    const usersToRemove = sortedUsers.slice(1);

    console.log(`✅ Keeping user: ${userToKeep.email} (${userToKeep.uid}) - Created: ${userToKeep.createdAt}`);

    // Remove duplicate users
    let removedCount = 0;
    for (const user of usersToRemove) {
      try {
        console.log(`🗑️ Removing duplicate: ${user.email} (${user.uid}) - Created: ${user.createdAt}`);

        // Delete from local storage
        await LocalStorageService.deleteUser(user.uid);

        // Note: We don't delete from Firebase Auth here as that requires the user to be signed in
        // The Firebase Auth user will be cleaned up separately if needed

        removedCount++;
      } catch (error) {
        console.error(`Failed to remove duplicate user ${user.uid}:`, error);
      }
    }

    return { removed: removedCount, kept: 1 };
  }

  /**
   * Check if email already exists before creating new user
   */
  static async checkEmailExists(email: string, excludeUid?: string): Promise<boolean> {
    try {
      const users = await LocalStorageService.getAllUsers();
      return users.some(user =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.uid !== excludeUid
      );
    } catch (error) {
      console.error('Error checking email exists:', error);
      return false;
    }
  }

  /**
   * Check if username already exists before creating new user
   */
  static async checkUsernameExists(username: string, excludeUid?: string): Promise<boolean> {
    try {
      const users = await LocalStorageService.getAllUsers();
      return users.some(user =>
        user.username.toLowerCase() === username.toLowerCase() &&
        user.uid !== excludeUid
      );
    } catch (error) {
      console.error('Error checking username exists:', error);
      return false;
    }
  }

  /**
   * Get duplicate statistics
   */
  static async getDuplicateStats(): Promise<{
    totalUsers: number;
    emailDuplicateGroups: number;
    usernameDuplicateGroups: number;
    totalDuplicateUsers: number;
  }> {
    try {
      const { emailDuplicates, usernameDuplicates } = await this.findDuplicates();
      const allUsers = await LocalStorageService.getAllUsers();

      const emailDuplicateGroups = Object.keys(emailDuplicates).length;
      const usernameDuplicateGroups = Object.keys(usernameDuplicates).length;

      let totalDuplicateUsers = 0;
      Object.values(emailDuplicates).forEach(users => {
        totalDuplicateUsers += users.length - 1; // Subtract 1 to keep one original
      });

      return {
        totalUsers: allUsers.length,
        emailDuplicateGroups,
        usernameDuplicateGroups,
        totalDuplicateUsers
      };
    } catch (error) {
      console.error('Error getting duplicate stats:', error);
      return {
        totalUsers: 0,
        emailDuplicateGroups: 0,
        usernameDuplicateGroups: 0,
        totalDuplicateUsers: 0
      };
    }
  }
}
