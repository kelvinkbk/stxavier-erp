// src/screens/Admin/StudentManagementScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Student } from '../../types';
import StudentService from '../../services/studentService';
import { StudentMigration } from '../../services/studentMigration';
import { validateEmail, validatePhone } from '../../utils/helpers';

interface StudentManagementScreenProps {
  navigation: any;
}

export default function StudentManagementScreen({ navigation }: StudentManagementScreenProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regNo: '',
    department: '',
    year: 1,
    phone: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
    courses: [],
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentData = await StudentService.getAllStudents();
      setStudents(studentData);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    if (formData.year < 1 || formData.year > 4) {
      errors.year = 'Year must be between 1 and 4';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (formData.guardianPhone && !validatePhone(formData.guardianPhone)) {
      errors.guardianPhone = 'Please enter a valid guardian phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (editingStudent) {
        // Update existing student
        const result = await StudentService.updateStudent(editingStudent.id, formData);
        if (result.success) {
          Alert.alert('Success', 'Student updated successfully');
          await loadStudents();
          resetForm();
        } else {
          Alert.alert('Error', result.error || 'Failed to update student');
        }
      } else {
        // Create new student
        const result = await StudentService.createStudent(formData);
        if (result.success) {
          Alert.alert('Success', 'Student created successfully');
          await loadStudents();
          resetForm();
        } else {
          Alert.alert('Error', result.error || 'Failed to create student');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      regNo: student.regNo,
      department: student.department,
      year: student.year,
      phone: student.phone || '',
      address: student.address || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      courses: student.courses || [],
    });
    setShowAddModal(true);
  };

  const handleDelete = (student: Student) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${student.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await StudentService.deleteStudent(student.id);
            if (result.success) {
              Alert.alert('Success', 'Student deleted successfully');
              await loadStudents();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete student');
            }
          },
        },
      ]
    );
  };

  const handleMigrateUsers = () => {
    Alert.alert(
      'Migrate Users to Students',
      'This will create student records from existing users with student role. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Migrate',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await StudentMigration.migrateUsersToStudents();
              
              if (result.success) {
                Alert.alert(
                  'Migration Complete',
                  `Successfully migrated ${result.migrated} students.\n\n${result.errors.length > 0 ? 'Some errors occurred:\n' + result.errors.join('\n') : ''}`,
                  [{ text: 'OK', onPress: () => loadStudents() }]
                );
              } else {
                Alert.alert('Migration Failed', result.errors.join('\n'));
              }
            } catch (error) {
              Alert.alert('Error', 'Migration failed. Please try again.');
              console.error('Migration error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCreateSample = () => {
    Alert.alert(
      'Create Sample Students',
      'This will create sample student records for testing. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              setLoading(true);
              await StudentMigration.createSampleStudents();
              Alert.alert('Success', 'Sample students created successfully!', [
                { text: 'OK', onPress: () => loadStudents() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to create sample students. Please try again.');
              console.error('Sample creation error:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      regNo: '',
      department: '',
      year: 1,
      phone: '',
      address: '',
      guardianName: '',
      guardianPhone: '',
      courses: [],
    });
    setFormErrors({});
    setEditingStudent(null);
    setShowAddModal(false);
  };

  const renderStudentCard = ({ item: student }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentReg}>Reg No: {student.regNo}</Text>
          <Text style={styles.studentDept}>{student.department.toUpperCase()} - Year {student.year}</Text>
        </View>
        <View style={styles.studentActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(student)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(student)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.studentDetails}>
        <Text style={styles.detailText}>📧 {student.email}</Text>
        {student.phone && <Text style={styles.detailText}>📱 {student.phone}</Text>}
        {student.guardianName && (
          <Text style={styles.detailText}>👨‍👩‍👧‍👦 Guardian: {student.guardianName}</Text>
        )}
      </View>
    </Card>
  );

  if (loading && students.length === 0) {
    return <LoadingSpinner message="Loading students..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Student Management</Text>
        <View style={styles.headerButtons}>
          <Button
            title="Sample Data"
            onPress={handleCreateSample}
            style={styles.sampleButton}
          />
          <Button
            title="Migrate Users"
            onPress={handleMigrateUsers}
            style={styles.migrateButton}
          />
          <Button
            title="Add Student"
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students by name, reg no, department..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Students List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Add/Edit Student Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </Text>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter full name"
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
            </View>

            {/* Registration Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Registration Number</Text>
              <TextInput
                style={styles.input}
                value={formData.regNo}
                onChangeText={(text) => setFormData({ ...formData, regNo: text })}
                placeholder="Auto-generated if empty"
              />
            </View>

            {/* Department */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Department *</Text>
              <TextInput
                style={[styles.input, formErrors.department && styles.inputError]}
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
                placeholder="e.g., BCA, MCA, BSc"
              />
              {formErrors.department && <Text style={styles.errorText}>{formErrors.department}</Text>}
            </View>

            {/* Year */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Year *</Text>
              <TextInput
                style={[styles.input, formErrors.year && styles.inputError]}
                value={formData.year.toString()}
                onChangeText={(text) => setFormData({ ...formData, year: parseInt(text) || 1 })}
                placeholder="1, 2, 3, or 4"
                keyboardType="numeric"
              />
              {formErrors.year && <Text style={styles.errorText}>{formErrors.year}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, formErrors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Guardian Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guardian Name</Text>
              <TextInput
                style={styles.input}
                value={formData.guardianName}
                onChangeText={(text) => setFormData({ ...formData, guardianName: text })}
                placeholder="Enter guardian name"
              />
            </View>

            {/* Guardian Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guardian Phone</Text>
              <TextInput
                style={[styles.input, formErrors.guardianPhone && styles.inputError]}
                value={formData.guardianPhone}
                onChangeText={(text) => setFormData({ ...formData, guardianPhone: text })}
                placeholder="Enter guardian phone"
                keyboardType="phone-pad"
              />
              {formErrors.guardianPhone && <Text style={styles.errorText}>{formErrors.guardianPhone}</Text>}
            </View>

            <Button
              title={editingStudent ? 'Update Student' : 'Create Student'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  migrateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff9800',
    marginRight: 8,
  },
  sampleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentReg: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  studentDept: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  studentDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#1976d2',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});
