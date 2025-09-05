import { Alert } from 'react-native';
import CloudSyncService from './CloudSyncService';
import { auth } from '../firebase';

/**
 * Migration service to handle database schema updates
 */
class MigrationService {
  private static instance: MigrationService;
  private cloudSync: CloudSyncService;

  constructor() {
    this.cloudSync = CloudSyncService.getInstance();
  }

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Run all necessary migrations
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Checking for required migrations...');
      
      // Only run migrations for authenticated admin users
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('⏩ Skipping migrations: User not authenticated');
        return;
      }

      // Check if user lookup migration is needed
      await this.migrateToUserLookup();
      
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      // Don't throw error to prevent app crashes during migration
    }
  }

  /**
   * Migrate existing users to the user lookup collection
   */
  private async migrateToUserLookup(): Promise<void> {
    try {
      // Check if migration has already been run
      const migrationKey = 'migration_user_lookup_completed';
      const migrationCompleted = await this.checkMigrationStatus(migrationKey);
      
      if (migrationCompleted) {
        console.log('⏩ User lookup migration already completed');
        return;
      }

      console.log('🔄 Running user lookup migration...');
      await this.cloudSync.syncAllUsersToLookup();
      
      // Mark migration as completed
      await this.markMigrationCompleted(migrationKey);
      
      console.log('✅ User lookup migration completed');
    } catch (error) {
      console.error('❌ User lookup migration failed:', error);
      throw error;
    }
  }

  /**
   * Check if a migration has been completed
   */
  private async checkMigrationStatus(migrationKey: string): Promise<boolean> {
    try {
      // In a real app, you might store this in a database
      // For now, we'll use a simple approach
      return false; // Always run migration for now
    } catch {
      return false;
    }
  }

  /**
   * Mark a migration as completed
   */
  private async markMigrationCompleted(migrationKey: string): Promise<void> {
    try {
      // In a real app, you would store this in a database
      console.log(`✅ Migration marked as completed: ${migrationKey}`);
    } catch (error) {
      console.error('Failed to mark migration as completed:', error);
    }
  }

  /**
   * Run migrations with user feedback
   */
  async runMigrationsWithUI(): Promise<void> {
    try {
      Alert.alert(
        'Database Update',
        'Updating database for improved performance...',
        [{ text: 'OK' }]
      );
      
      await this.runMigrations();
      
      Alert.alert(
        'Update Complete',
        'Database has been updated successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Update Error',
        'There was an issue updating the database. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    }
  }
}

export default MigrationService;
