import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LocalStorageService } from '../../services/localStorage';
import { User } from '../../types';

export const UserManagementScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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
    
    // Check username availability only for new users or if username changed
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

      Alert.alert('Success', 'User updated successfully');
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

  const deleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalStorageService.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>User Management</Text>
        <Button
          title="Add User"
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
        />
      </View>

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

            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Note: Password cannot be changed through this interface
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
  warningContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fef3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});
