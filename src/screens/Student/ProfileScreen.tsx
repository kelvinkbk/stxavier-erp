// src/screens/Student/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  regNo: string;
  department: string;
  year: number;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<StudentProfile>({
    id: '',
    name: '',
    email: '',
    regNo: '',
    department: '',
    year: 1,
    phone: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
    dateOfBirth: '',
    bloodGroup: '',
    emergencyContact: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!user?.uid) return;
      
      const docRef = doc(db, 'students', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as StudentProfile;
        setProfile(data);
        setFormData(data);
      } else {
        // If no student profile exists, use auth user data
        const userData = {
          id: user.uid,
          name: user.name || '',
          email: user.email || '',
          regNo: user.regNo || '',
          department: user.department || '',
          year: 1,
          phone: user.phone || '',
          address: '',
          guardianName: '',
          guardianPhone: '',
          dateOfBirth: '',
          bloodGroup: '',
          emergencyContact: '',
        };
        setProfile(userData);
        setFormData(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Update student document
      const docRef = doc(db, 'students', user.uid);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: new Date(),
      });

      setProfile(formData);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || formData);
    setEditing(false);
  };

  if (loading && !profile) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.regNo}>Reg. No: {profile?.regNo}</Text>
        <Text style={styles.department}>{profile?.department} - Year {profile?.year}</Text>
      </View>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter full name"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{profile?.email}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.phone || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              placeholder="DD/MM/YYYY"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.dateOfBirth || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Blood Group</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.bloodGroup}
              onChangeText={(text) => setFormData({ ...formData, bloodGroup: text })}
              placeholder="e.g., A+, B-, O+"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.bloodGroup || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Address</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter full address"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.address || 'Not set'}</Text>
          )}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Guardian Information</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Guardian Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.guardianName}
              onChangeText={(text) => setFormData({ ...formData, guardianName: text })}
              placeholder="Enter guardian name"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.guardianName || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Guardian Phone</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.guardianPhone}
              onChangeText={(text) => setFormData({ ...formData, guardianPhone: text })}
              placeholder="Enter guardian phone"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.guardianPhone || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Emergency Contact</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={formData.emergencyContact}
              onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
              placeholder="Enter emergency contact"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.emergencyContact || 'Not set'}</Text>
          )}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Registration Number</Text>
          <Text style={styles.fieldValue}>{profile?.regNo}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Department</Text>
          <Text style={styles.fieldValue}>{profile?.department}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Year</Text>
          <Text style={styles.fieldValue}>Year {profile?.year}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  regNo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  department: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  section: {
    margin: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
