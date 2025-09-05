// Manual Migration Script
// Copy and paste this into your browser console while the app is running

console.log('🔄 Starting manual migration...');

// This script manually creates the user lookup collection
// Run this in the browser console if you can't find the migration button

const runManualMigration = async () => {
  try {
    console.log('📱 Checking if Firebase is available...');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase not available in console. Please run this from within the app.');
      return;
    }
    
    const db = firebase.firestore();
    
    console.log('🔄 Getting all users from main collection...');
    
    // Get all users from the main users collection
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push(doc.data());
    });
    
    console.log(`📊 Found ${users.length} users to migrate`);
    
    // Create lookup entries for each user
    for (const user of users) {
      try {
        console.log(`🔄 Creating lookup entry for: ${user.username}`);
        
        await db.collection('user_lookup').doc(user.uid).set({
          uid: user.uid,
          username: user.username,
          email: user.email,
          lastUpdated: new Date()
        });
        
        console.log(`✅ Created lookup entry for: ${user.username}`);
      } catch (error) {
        console.error(`❌ Failed to create lookup for ${user.username}:`, error);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('🔄 You can now try logging in with usernames without permission errors.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Run the migration
runManualMigration();
