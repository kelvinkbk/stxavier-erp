// Quick Admin User Recovery Script
// Run this in browser console to recreate your admin user

console.log('🔧 Recreating Admin User...');

// Your admin user data
const adminUser = {
  uid: 'FvCoQfpwHhOXAhoHt39Q6LnH5hG2', // Your Firebase UID
  name: 'System Administrator',
  email: 'kelvinkbk2006@gmail.com',
  username: 'admin',
  role: 'admin',
  department: 'Administration',
  createdAt: new Date(),
};

// Save to localStorage
const saveAdminUser = async () => {
  try {
    // Save user data
    localStorage.setItem(`user_${adminUser.uid}`, JSON.stringify(adminUser));
    
    // Save username mapping
    const usernameMappings = JSON.parse(localStorage.getItem('usernameMappings') || '{}');
    usernameMappings[adminUser.username] = adminUser.uid;
    localStorage.setItem('usernameMappings', JSON.stringify(usernameMappings));
    
    // Save email mapping
    const emailMappings = JSON.parse(localStorage.getItem('emailMappings') || '{}');
    emailMappings[adminUser.email] = adminUser.uid;
    localStorage.setItem('emailMappings', JSON.stringify(emailMappings));
    
    console.log('✅ Admin user recreated successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔄 Please refresh the page and try logging in');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to recreate admin user:', error);
    return false;
  }
};

// Execute
saveAdminUser();
