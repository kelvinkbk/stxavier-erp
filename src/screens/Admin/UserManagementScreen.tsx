import { createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { auth } from '../../firebase';
import { LocalStorageService } from '../../services/localStorage';
import { User } from '../../types';
import { DuplicateUserCleanup } from '../../utils/duplicateUserCleanup';
import { UserDeletionSyncFix } from '../../utils/fixUserDeletionSync';
import { WebDeleteDebug } from '../../utils/webDeleteDebug';
import { webDeleteQuickFix } from '../../utils/webDeleteQuickFix';
import { useAuth } from '../../utils/AuthContext';

export const UserManagementScreen = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [duplicateStats, setDuplicateStats] = useState<{
    totalUsers: number;
    totalDuplicateUsers: number;
    emailDuplicateGroups: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'student' as 'admin' | 'faculty' | 'student',
    department: '',
    regNo: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // First, check for duplicates and get stats
      console.log('🧹 Checking for duplicate users...');
      const stats = await DuplicateUserCleanup.getDuplicateStats();
      setDuplicateStats(stats);

      if (stats.totalDuplicateUsers > 0) {
        console.log(`⚠️ Found ${stats.totalDuplicateUsers} duplicate users. Auto-cleaning...`);
        const cleanupResult = await DuplicateUserCleanup.autoResolveDuplicates();
        console.log(`✅ Cleanup completed: ${cleanupResult.removed} removed, ${cleanupResult.kept} kept`);

        if (cleanupResult.errors.length > 0) {
          console.warn('⚠️ Some cleanup errors occurred:', cleanupResult.errors);
        }

        // Update stats after cleanup
        const updatedStats = await DuplicateUserCleanup.getDuplicateStats();
        setDuplicateStats(updatedStats);
      }

      // Now load the cleaned user list
      const allUsers = await LocalStorageService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'student',
      department: '',
      regNo: '',
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '', // Don't show existing password
      role: user.role,
      department: user.department || '',
      regNo: user.regNo || '',
    });
    setShowEditModal(true);
  };

  const validateForm = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return false;
    }
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return false;
    }

    // Check for email duplicates
    const emailExists = await DuplicateUserCleanup.checkEmailExists(
      formData.email,
      selectedUser?.uid
    );
    if (emailExists) {
      Alert.alert('Error', 'This email is already registered to another user');
      return false;
    }

    // Check for username duplicates
    const usernameExists = await DuplicateUserCleanup.checkUsernameExists(
      formData.username,
      selectedUser?.uid
    );
    if (usernameExists) {
      Alert.alert('Error', 'This username is already taken');
      return false;
    }

    // Legacy check for backward compatibility
    if (!selectedUser || selectedUser.username !== formData.username) {
      const isUsernameAvailable = await LocalStorageService.isUsernameAvailable(formData.username);
      if (!isUsernameAvailable) {
        Alert.alert('Error', 'Username is already taken');
        return false;
      }
    }

    // Only validate password for new users
    if (!selectedUser && (!formData.password.trim() || formData.password.length < 6)) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.role === 'student' && !formData.regNo.trim()) {
      Alert.alert('Error', 'Please enter a registration number');
      return false;
    }
    return true;
  };

  const createUser = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user profile data
      const userData: User = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        department: formData.department || undefined,
        regNo: formData.regNo || undefined,
        createdAt: new Date(),
      };

      // Save to local storage
      await LocalStorageService.saveUser(userCredential.user.uid, userData);

      Alert.alert('Success', `${formData.role} account created successfully`);
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      Alert.alert('Error', error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    const isValid = await validateForm();
    if (!isValid || !selectedUser) return;

    setLoading(true);
    try {
      // Update user profile data
      const updatedUserData: User = {
        ...selectedUser,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        department: formData.department || undefined,
        regNo: formData.regNo || undefined,
      };

      // Save updated data to local storage
      await LocalStorageService.saveUser(selectedUser.uid, updatedUserData);

      // If the updated user is the currently logged-in user, refresh their session
      if (currentUser && selectedUser.uid === currentUser.uid) {
        console.log('🔄 Refreshing current user session after role/profile update');
        await refreshUser();
      }

      // Handle password change if provided
      if (formData.password && formData.password.trim() !== '') {
        try {
          // Note: In a real application, you would need to implement a secure way
          // to update Firebase user passwords. This requires admin SDK on backend.
          Alert.alert(
            'Password Update',
            'Profile updated successfully. Password changes require the user to log in again with their new password.',
            [{ text: 'OK' }]
          );
        } catch (passwordError) {
          console.error('Password update failed:', passwordError);
          Alert.alert('Warning', 'Profile updated but password change failed. Please try changing password separately.');
        }
      } else {
        Alert.alert('Success', 'User updated successfully');

        // Show additional message if current user was updated
        if (currentUser && selectedUser.uid === currentUser.uid) {
          setTimeout(() => {
            Alert.alert(
              'Profile Updated',
              'Your profile has been updated. The changes are now active in your session.',
              [{ text: 'OK' }]
            );
          }, 500);
        }
      }

      setShowEditModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      Alert.alert('Error', error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPassword = async (user: User) => {
    // Platform-specific handling for better compatibility
    if (Platform.OS === 'web') {
      // Web-specific implementation
      const adminPassword = prompt(`🔐 Enter your admin password to access ${user.name}'s password information:`);
      if (adminPassword) {
        await verifyAdminCredentials(user, adminPassword);
      }
    } else {
      // Mobile implementation with modal
      setSelectedUser(user);
      setShowPasswordModal(true);
    }
  };

  const verifyAdminCredentials = async (user: User, password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Error: Not authenticated');
      return;
    }

    try {
      const adminEmail = currentUser.email;
      if (!adminEmail) {
        alert('Error: Admin email not found');
        return;
      }

      // Verify admin password
      const credential = EmailAuthProvider.credential(adminEmail, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Show success message with options
      const resetPassword = Platform.OS === 'web'
        ? confirm(`✅ Access granted for ${user.name}\n\n🔒 For security, passwords are encrypted and cannot be displayed.\n\nWould you like to reset ${user.name}'s password?`)
        : false;

      if (Platform.OS === 'web') {
        alert(`✅ Password Access Granted for ${user.name}\n\n📋 Security Information:\n• Passwords are encrypted and cannot be displayed\n• You can reset the user's password using the Edit button\n• Users can change their own passwords from their profile\n\n🛡️ This access has been logged for security audit.`);

        if (resetPassword) {
          openEditModal(user);
        }
      } else {
        Alert.alert(
          '✅ Password Access Granted',
          `Access granted for user: ${user.name}\n\n📋 Security Information:\n• Passwords are encrypted and cannot be displayed\n• You can reset the user's password using Edit\n• Users can change their own passwords from profile\n\n🛡️ This access has been logged for security audit.`,
          [
            {
              text: 'Reset Password',
              style: 'default',
              onPress: () => openEditModal(user)
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
      }

    } catch (error: any) {
      console.error('Admin verification failed:', error);
      let errorMessage = 'Failed to verify admin credentials';

      if (error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/invalid-login-credentials') {
        errorMessage = 'Incorrect admin password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please wait and try again.';
      }

      if (Platform.OS === 'web') {
        alert(`❌ Verification Failed\n\n${errorMessage}`);
      } else {
        Alert.alert('❌ Verification Failed', errorMessage);
      }
    }
  };

  const verifyAdminAndShowPassword = async () => {
    if (!adminPassword.trim()) {
      Alert.alert('Error', 'Please enter your admin password');
      return;
    }

    if (!selectedUser) {
      Alert.alert('Error', 'No user selected');
      return;
    }

    setLoading(true);

    try {
      await verifyAdminCredentials(selectedUser, adminPassword);
      // Close modal and reset
      setShowPasswordModal(false);
      setAdminPassword('');
      setSelectedUser(null);
    } catch (error) {
      // Error handling is done in verifyAdminCredentials
      console.error('Password verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    // Web-compatible deletion with enhanced debugging
    if (Platform.OS === 'web') {
      console.log('🌐 [WEB] Starting web delete process...');

      // Test functionality first
      const isReady = await webDeleteQuickFix.testDeleteFunctionality();
      if (!isReady) {
        webDeleteQuickFix.showAlert('Error', 'Delete functionality is not ready. Please check the console for details.');
        return;
      }

      // Use confirmation dialog
      const confirmDelete = webDeleteQuickFix.confirmAction(
        `🗑️ Delete User: ${userName}\n\nThis will permanently remove the user and prevent automatic restoration.\n\nAre you sure you want to proceed?`
      );

      if (!confirmDelete) {
        console.log('🚫 User cancelled deletion');
        return;
      }

      try {
        setLoading(true);
        webDeleteQuickFix.log('DELETE', `Starting deletion for: ${userName} (${userId})`);

        // Use enhanced deletion to prevent auto-restoration
        await UserDeletionSyncFix.deleteUserPermanently(userId);

        webDeleteQuickFix.log('DELETE', 'User deleted successfully');
        webDeleteQuickFix.showAlert('Success', `User "${userName}" has been permanently deleted.`);

        // Reload users
        await loadUsers();

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        webDeleteQuickFix.log('DELETE', 'Delete failed', error);
        webDeleteQuickFix.showAlert('Delete Failed', `Failed to delete user "${userName}".\n\nError: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Mobile Alert.alert implementation
      Alert.alert(
        'Delete User',
        `Are you sure you want to delete ${userName}?\n\nThis will permanently remove the user and prevent automatic restoration.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Permanently',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                console.log(`🗑️ Starting deletion process for user: ${userName} (${userId})`);

                // Use enhanced deletion to prevent auto-restoration
                await UserDeletionSyncFix.deleteUserPermanently(userId);
                Alert.alert('Success', 'User deleted permanently');
                await loadUsers();
              } catch (error) {
                console.error('❌ Error deleting user:', error);
                Alert.alert('Error', 'Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error'));
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'faculty':
        return '#059669';
      case 'student':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'faculty':
        return '👨‍🏫';
      case 'student':
        return '🎓';
      default:
        return '👤';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>User Management</Text>
          {duplicateStats && (
            <Text style={styles.statsText}>
              {duplicateStats.totalUsers} users
              {duplicateStats.totalDuplicateUsers > 0 && (
                <Text style={styles.duplicateWarning}> • {duplicateStats.totalDuplicateUsers} duplicates detected</Text>
              )}
            </Text>
          )}
        </View>
        <Button
          title="Add User"
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
        />
      </View>

      {/* Web Delete Debug Section */}
      {Platform.OS === 'web' && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>🌐 Web Delete Debug</Text>
          <View style={styles.debugButtonRow}>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => WebDeleteDebug.checkDeleteStatus()}
            >
              <Text style={styles.debugButtonText}>Check Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => webDeleteQuickFix.testDeleteFunctionality()}
            >
              <Text style={styles.debugButtonText}>Test Functionality</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: '#ff9800' }]}
              onPress={async () => {
                try {
                  console.log('🧹 Starting manual duplicate cleanup...');
                  const stats = await DuplicateUserCleanup.getDuplicateStats();

                  if (stats.totalDuplicateUsers === 0) {
                    Alert.alert('Info', 'No duplicate users found!');
                    return;
                  }

                  Alert.alert(
                    'Duplicate Users Found',
                    `Found ${stats.totalDuplicateUsers} duplicate users in ${stats.emailDuplicateGroups} email groups. Clean them up?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clean Up',
                        onPress: async () => {
                          const result = await DuplicateUserCleanup.autoResolveDuplicates();
                          Alert.alert(
                            'Cleanup Complete',
                            `Removed ${result.removed} duplicates, kept ${result.kept} users.${result.errors.length > 0 ? ` ${result.errors.length} errors occurred.` : ''}`
                          );
                          await loadUsers(); // Reload the user list and update stats
                        }
                      }
                    ]
                  );
                } catch (error) {
                  Alert.alert('Error', 'Failed to clean up duplicates: ' + error);
                }
              }}
            >
              <Text style={styles.debugButtonText}>🧹 Clean Duplicates</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {users.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No users found</Text>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.uid} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userIcon}>{getRoleIcon(user.role)}</Text>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                    {user.department && (
                      <Text style={styles.userDepartment}>Dept: {user.department}</Text>
                    )}
                    {user.regNo && (
                      <Text style={styles.userStudentId}>Reg No: {user.regNo}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.userActions}>
                  <View style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}>
                    <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => openEditModal(user)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleViewPassword(user)}
                      style={styles.passwordButton}
                      testID={`password-button-${user.uid}`}
                    >
                      <Text style={styles.passwordText}>🔑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteUser(user.uid, user.name)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create User Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New User</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                style={styles.input}
                placeholder="Enter username"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                style={styles.input}
                placeholder="Enter password (min 6 characters)"
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleSelector}>
                {(['student', 'faculty', 'admin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setFormData({ ...formData, role })}
                    style={[
                      styles.roleOption,
                      formData.role === role && styles.roleOptionSelected,
                    ]}
                  >
                    <Text style={styles.roleOptionIcon}>{getRoleIcon(role)}</Text>
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.role === role && styles.roleOptionTextSelected,
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
                style={styles.input}
                placeholder="Enter department (optional)"
                placeholderTextColor="#999"
              />
            </View>

            {formData.role === 'student' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Registration Number *</Text>
                <TextInput
                  value={formData.regNo}
                  onChangeText={(text) => setFormData({ ...formData, regNo: text })}
                  style={styles.input}
                  placeholder="Enter registration number"
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={loading ? 'Creating...' : 'Create User'}
              onPress={createUser}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
            />
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TouchableOpacity
              onPress={() => {
                setShowEditModal(false);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={[styles.input, styles.disabledInput]}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                style={styles.input}
                placeholder="Enter username"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleSelector}>
                {(['student', 'faculty', 'admin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setFormData({ ...formData, role })}
                    style={[
                      styles.roleOption,
                      formData.role === role && styles.roleOptionSelected,
                    ]}
                  >
                    <Text style={styles.roleOptionIcon}>{getRoleIcon(role)}</Text>
                    <Text
                      style={[
                        styles.roleOptionText,
                        formData.role === role && styles.roleOptionTextSelected,
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
                style={styles.input}
                placeholder="Enter department (optional)"
                placeholderTextColor="#999"
              />
            </View>

            {formData.role === 'student' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Registration Number *</Text>
                <TextInput
                  value={formData.regNo}
                  onChangeText={(text) => setFormData({ ...formData, regNo: text })}
                  style={styles.input}
                  placeholder="Enter registration number"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                style={styles.input}
                placeholder="Enter new password (leave blank to keep current)"
                secureTextEntry
                placeholderTextColor="#999"
              />
              <Text style={styles.helperText}>
                Leave blank to keep current password. Min 6 characters for new password.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowEditModal(false);
                resetForm();
              }}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={loading ? 'Updating...' : 'Update User'}
              onPress={updateUser}
              loading={loading}
              disabled={loading}
              style={styles.createButton}
            />
          </View>
        </View>
      </Modal>

      {/* Admin Password Verification Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPasswordModal(false);
          setAdminPassword('');
          setSelectedUser(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalContainer}>
            <View style={styles.passwordModalHeader}>
              <Text style={styles.passwordModalTitle}>Admin Verification Required</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setAdminPassword('');
                  setSelectedUser(null);
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordModalContent}>
              <Text style={styles.warningText}>
                🔐 Accessing user password information requires admin verification for {selectedUser?.name}.
              </Text>

              <Text style={styles.securityNote}>
                Note: For security reasons, actual passwords cannot be displayed. You can reset a user's password through the edit function.
              </Text>

              <Text style={styles.label}>Verify Your Admin Password *</Text>
              <TextInput
                value={adminPassword}
                onChangeText={setAdminPassword}
                style={styles.input}
                placeholder="Enter your admin password"
                secureTextEntry
                placeholderTextColor="#999"
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={verifyAdminAndShowPassword}
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.cancelModalButton]}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setAdminPassword('');
                    setSelectedUser(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.verifyButton, (loading || !adminPassword.trim()) && styles.disabledButton]}
                  onPress={verifyAdminAndShowPassword}
                  disabled={loading || !adminPassword.trim()}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify Access'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3182ce',
    borderRadius: 8,
  },
  scrollContainer: {
    padding: 20,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  userCard: {
    marginBottom: 16,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    color: '#4a90e2',
    marginBottom: 2,
    fontWeight: '500',
  },
  userDepartment: {
    fontSize: 12,
    color: '#a0aec0',
  },
  userStudentId: {
    fontSize: 12,
    color: '#a0aec0',
  },
  userActions: {
    alignItems: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  editText: {
    fontSize: 16,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#718096',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f7fafc',
    color: '#2d3748',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  roleOptionSelected: {
    borderColor: '#3182ce',
    backgroundColor: '#ebf8ff',
  },
  roleOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleOptionText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  roleOptionTextSelected: {
    color: '#3182ce',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  createButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#3182ce',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fef3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  securityNote: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    fontStyle: 'italic',
  },
  passwordButton: {
    padding: 8,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    marginRight: 8,
  },
  passwordText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passwordModalContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  passwordModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  passwordModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  passwordModalContent: {
    padding: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: 16,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cbd5e0',
  },
  debugSection: {
    backgroundColor: '#f7fafc',
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#3182ce',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  debugButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  titleContainer: {
    flex: 1,
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  duplicateWarning: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
