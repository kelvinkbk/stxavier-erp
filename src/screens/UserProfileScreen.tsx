import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { LocalStorageService } from '../services/localStorage';
import SyncStatusComponent from '../components/SyncStatusComponent';
import AutoRefreshSettings from '../components/AutoRefreshSettings';
import { User } from '../types';

interface UserProfileScreenProps {
  navigation: any;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userData = await LocalStorageService.getUser(currentUser.uid);
        if (userData) {
          setUser(userData);
          setEditedUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      Alert.alert('Success', 'Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'New password is too weak');
      } else {
        Alert.alert('Error', error.message || 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !auth.currentUser) return;

    // Validate username if changed
    if (editedUser.username && editedUser.username !== user.username) {
      const isUsernameAvailable = await LocalStorageService.isUsernameAvailable(editedUser.username);
      if (!isUsernameAvailable) {
        Alert.alert('Error', 'Username is already taken');
        return;
      }
    }

    setSaving(true);
    try {
      const updatedUser: User = {
        ...user,
        ...editedUser,
        // Prevent changing critical fields
        uid: user.uid,
        email: user.email,
        createdAt: user.createdAt,
      };

      await LocalStorageService.saveUser(auth.currentUser.uid, updatedUser);
      
      // Trigger sync after profile update
      try {
        await LocalStorageService.triggerSync();
      } catch (syncError) {
        console.warn('Sync failed after profile update:', syncError);
      }

      setUser(updatedUser);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const triggerManualSync = async () => {
    try {
      Alert.alert('Info', 'Starting manual sync...');
      await LocalStorageService.triggerSync();
      Alert.alert('Success', 'Data synchronized across all devices!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>No user data found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Profile</Text>
        
        {/* Cross-Device Sync Status */}
        <View style={styles.syncContainer}>
          <SyncStatusComponent showDetails={true} />
        </View>
      </View>

      {/* Sync Control Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cross-Device Synchronization</Text>
        <Text style={styles.syncDescription}>
          Your profile data automatically syncs across all devices. Use manual sync if needed.
        </Text>
        <TouchableOpacity style={styles.syncButton} onPress={triggerManualSync}>
          <Text style={styles.buttonText}>Force Manual Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <TouchableOpacity
            style={[styles.editButton, editing && styles.editButtonActive]}
            onPress={() => setEditing(!editing)}
          >
            <Text style={[styles.editButtonText, editing && styles.editButtonTextActive]}>
              {editing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={editedUser.name || ''}
              onChangeText={(text) => setEditedUser(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
            />
          ) : (
            <Text style={styles.fieldValue}>{user.name}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={[styles.fieldValue, styles.readOnly]}>{user.email}</Text>
          <Text style={styles.readOnlyNote}>Email cannot be changed</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Username</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={editedUser.username || ''}
              onChangeText={(text) => setEditedUser(prev => ({ ...prev, username: text }))}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.fieldValue}>@{user.username}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Role</Text>
          <Text style={[styles.fieldValue, styles.roleText]}>{user.role.toUpperCase()}</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Department</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={editedUser.department || ''}
              onChangeText={(text) => setEditedUser(prev => ({ ...prev, department: text }))}
              placeholder="Enter your department"
            />
          ) : (
            <Text style={styles.fieldValue}>{user.department || 'Not specified'}</Text>
          )}
        </View>

        {user.role === 'student' && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Registration Number</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={editedUser.regNo || ''}
                onChangeText={(text) => setEditedUser(prev => ({ ...prev, regNo: text }))}
                placeholder="Enter your registration number"
              />
            ) : (
              <Text style={styles.fieldValue}>{user.regNo || 'Not specified'}</Text>
            )}
          </View>
        )}

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Phone</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={editedUser.phone || ''}
              onChangeText={(text) => setEditedUser(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{user.phone || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Member Since</Text>
          <Text style={styles.fieldValue}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>

        {editing && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Auto-Refresh Settings */}
      <AutoRefreshSettings />

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        {/* Password Change Section */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowPasswordModal(true)}
        >
          <Text style={styles.actionButtonText}>🔒 Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalContainer}>
            <View style={styles.passwordModalHeader}>
              <Text style={styles.passwordModalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordModalContent}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Current Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                  placeholder="Enter current password"
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>New Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                  placeholder="Enter new password (min 6 characters)"
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirm New Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Confirm new password"
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, changingPassword && styles.saveButtonDisabled]}
                onPress={handlePasswordChange}
                disabled={changingPassword}
              >
                <Text style={styles.buttonText}>
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  syncContainer: {
    marginTop: 15,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  syncDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonActive: {
    backgroundColor: '#FF3B30',
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  editButtonTextActive: {
    color: 'white',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#666',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  readOnly: {
    backgroundColor: '#e9e9e9',
    color: '#999',
  },
  readOnlyNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  roleText: {
    backgroundColor: '#007AFF',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalContainer: {
    backgroundColor: 'white',
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 0,
  },
  passwordModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  passwordModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  passwordModalContent: {
    padding: 20,
  },
});

export default UserProfileScreen;
