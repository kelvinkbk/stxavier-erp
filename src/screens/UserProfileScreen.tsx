import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { signOut } from 'firebase/auth';
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

  const handleSaveProfile = async () => {
    if (!user || !auth.currentUser) return;

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
          <Text style={[styles.fieldValue, styles.readOnly]}>{user.username}</Text>
          <Text style={styles.readOnlyNote}>Username cannot be changed</Text>
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
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
});

export default UserProfileScreen;
