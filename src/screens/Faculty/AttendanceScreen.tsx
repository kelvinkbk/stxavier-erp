// src/screens/Faculty/AttendanceScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Student, Attendance } from '../../types';
import StudentService from '../../services/studentService';
import { markAttendance, getClassAttendance } from '../../services/attendance';
import { useAuth } from '../../utils/AuthContext';
import { formatDate } from '../../utils/helpers';
import { DebugAuth } from '../../services/debugAuth';

interface AttendanceRecord {
  student: Student;
  status: 'present' | 'absent' | 'late';
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    loadStudents();
    loadTodayAttendance();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      let studentData: Student[] = [];
      
      if (user?.department) {
        studentData = await StudentService.getStudentsByDepartment(user.department);
      } else {
        studentData = await StudentService.getAllStudents();
      }

      setStudents(studentData);
      
      // Initialize attendance records
      const attendanceRecords = studentData.map(student => ({
        student,
        status: 'present' as const,
      }));
      setAttendance(attendanceRecords);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const today = formatDate(new Date());
      const todayAttendance = await getClassAttendance('all', today);
      
      // Update attendance records with existing data
      setAttendance(prev => 
        prev.map(record => {
          const existingAttendance = todayAttendance.find(
            att => att.studentId === record.student.id
          );
          return existingAttendance 
            ? { ...record, status: existingAttendance.status }
            : record;
        })
      );
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    await loadTodayAttendance();
    setRefreshing(false);
  };

  const updateAttendanceStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev =>
      prev.map(record =>
        record.student.id === studentId
          ? { ...record, status }
          : record
      )
    );
  };

  const submitAttendance = async () => {
    try {
      setSubmitting(true);
      
      const attendanceData = attendance.map(record => ({
        studentId: record.student.id,
        status: record.status,
      }));

      const result = await markAttendance(
        selectedClass,
        formatDate(selectedDate),
        attendanceData,
        user?.uid || ''
      );

      if (result.success) {
        Alert.alert('Success', 'Attendance marked successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Alert.alert('Error', 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const debugAuth = async () => {
    await DebugAuth.checkCurrentAuth();
    await DebugAuth.createTestAttendance();
  };

  const markAllPresent = () => {
    setAttendance(prev =>
      prev.map(record => ({ ...record, status: 'present' as const }))
    );
  };

  const markAllAbsent = () => {
    setAttendance(prev =>
      prev.map(record => ({ ...record, status: 'absent' as const }))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      default: return '#666';
    }
  };

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const total = attendance.length;

    return { present, absent, late, total };
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <Card style={styles.attendanceCard}>
      <View style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.student.name}</Text>
          <Text style={styles.studentDetails}>
            {item.student.regNo} • {item.student.department.toUpperCase()} Year {item.student.year}
          </Text>
        </View>
        
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              styles.presentButton,
              item.status === 'present' && styles.activeButton,
            ]}
            onPress={() => updateAttendanceStatus(item.student.id, 'present')}
          >
            <Text style={[
              styles.statusText,
              item.status === 'present' && styles.activeText,
            ]}>
              P
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              styles.lateButton,
              item.status === 'late' && styles.activeButton,
            ]}
            onPress={() => updateAttendanceStatus(item.student.id, 'late')}
          >
            <Text style={[
              styles.statusText,
              item.status === 'late' && styles.activeText,
            ]}>
              L
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.statusButton,
              styles.absentButton,
              item.status === 'absent' && styles.activeButton,
            ]}
            onPress={() => updateAttendanceStatus(item.student.id, 'absent')}
          >
            <Text style={[
              styles.statusText,
              item.status === 'absent' && styles.activeText,
            ]}>
              A
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  const stats = getAttendanceStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.date}>{formatDate(selectedDate)}</Text>
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Today's Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff9800' }]}>{stats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f44336' }]}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, styles.presentAllButton]}
            onPress={markAllPresent}
          >
            <Text style={styles.quickButtonText}>Mark All Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, styles.absentAllButton]}
            onPress={markAllAbsent}
          >
            <Text style={styles.quickButtonText}>Mark All Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, styles.debugButton]}
            onPress={debugAuth}
          >
            <Text style={styles.quickButtonText}>Debug Auth</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Attendance List */}
      <FlatList
        data={attendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.student.id}
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

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Submit Attendance"
          onPress={submitAttendance}
          loading={submitting}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  presentAllButton: {
    backgroundColor: '#4caf50',
  },
  absentAllButton: {
    backgroundColor: '#f44336',
  },
  debugButton: {
    backgroundColor: '#9c27b0',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  attendanceCard: {
    marginBottom: 8,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 12,
    color: '#666',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  presentButton: {
    borderColor: '#4caf50',
  },
  lateButton: {
    borderColor: '#ff9800',
  },
  absentButton: {
    borderColor: '#f44336',
  },
  activeButton: {
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeText: {
    color: '#fff',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    width: '100%',
  },
});
