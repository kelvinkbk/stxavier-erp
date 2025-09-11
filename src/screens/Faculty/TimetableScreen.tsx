// src/screens/Faculty/TimetableScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  class: string;
  department: string;
  faculty: string;
}

export default function TimetableScreen() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    time: '',
    subject: '',
    room: '',
    class: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '12:15 PM - 1:15 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
  ];

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const q = query(
        collection(db, 'timetable'),
        where('faculty', '==', user?.email)
      );
      const querySnapshot = await getDocs(q);
      const timetableData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimetableEntry));
      setTimetable(timetableData);
    } catch (error) {
      console.error('Error loading timetable:', error);
      Alert.alert('Error', 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!formData.day || !formData.time || !formData.subject || !formData.room || !formData.class) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'timetable'), {
        ...formData,
        faculty: user?.email,
        department: user?.department,
        createdAt: new Date(),
      });
      
      Alert.alert('Success', 'Class added to timetable');
      setFormData({ day: '', time: '', subject: '', room: '', class: '' });
      setShowAddModal(false);
      loadTimetable();
    } catch (error) {
      console.error('Error adding class:', error);
      Alert.alert('Error', 'Failed to add class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (entryId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'timetable', entryId));
              Alert.alert('Success', 'Class deleted');
              loadTimetable();
            } catch (error) {
              console.error('Error deleting class:', error);
              Alert.alert('Error', 'Failed to delete class');
            }
          },
        },
      ]
    );
  };

  const renderTimetableGrid = () => {
    return (
      <View style={styles.gridContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.timeHeader}>Time</Text>
          {days.map(day => (
            <Text key={day} style={styles.dayHeader}>{day.slice(0, 3)}</Text>
          ))}
        </View>
        
        {timeSlots.map(timeSlot => (
          <View key={timeSlot} style={styles.timeRow}>
            <Text style={styles.timeCell}>{timeSlot}</Text>
            {days.map(day => {
              const entry = timetable.find(t => t.day === day && t.time === timeSlot);
              return (
                <TouchableOpacity
                  key={`${day}-${timeSlot}`}
                  style={[styles.classCell, entry && styles.filledCell]}
                  onPress={() => entry && handleDeleteClass(entry.id)}
                >
                  {entry ? (
                    <View>
                      <Text style={styles.subjectText}>{entry.subject}</Text>
                      <Text style={styles.roomText}>{entry.room}</Text>
                      <Text style={styles.classText}>{entry.class}</Text>
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>Free</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  if (loading && timetable.length === 0) {
    return <LoadingSpinner message="Loading timetable..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Timetable</Text>
        <Button
          title="Add Class"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderTimetableGrid()}
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Class</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Day *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dayPicker}>
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        formData.day === day && styles.selectedDayButton
                      ]}
                      onPress={() => setFormData({ ...formData, day })}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        formData.day === day && styles.selectedDayText
                      ]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Time Slot *</Text>
              <ScrollView style={styles.timePickerContainer}>
                {timeSlots.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      formData.time === time && styles.selectedTimeButton
                    ]}
                    onPress={() => setFormData({ ...formData, time })}
                  >
                    <Text style={[
                      styles.timeButtonText,
                      formData.time === time && styles.selectedTimeText
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                placeholder="Enter subject name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Room *</Text>
              <TextInput
                style={styles.input}
                value={formData.room}
                onChangeText={(text) => setFormData({ ...formData, room: text })}
                placeholder="Enter room number"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Class *</Text>
              <TextInput
                style={styles.input}
                value={formData.class}
                onChangeText={(text) => setFormData({ ...formData, class: text })}
                placeholder="Enter class name (e.g., CSE-3A)"
              />
            </View>

            <Button
              title="Add Class"
              onPress={handleAddClass}
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
    backgroundColor: '#4caf50',
  },
  gridContainer: {
    padding: 16,
    minWidth: 800,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1976d2',
    borderRadius: 8,
    marginBottom: 2,
  },
  timeHeader: {
    width: 120,
    padding: 12,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dayHeader: {
    flex: 1,
    padding: 12,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 100,
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  timeCell: {
    width: 120,
    padding: 12,
    backgroundColor: '#e3f2fd',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#1976d2',
  },
  classCell: {
    flex: 1,
    minHeight: 80,
    padding: 8,
    backgroundColor: '#fff',
    marginHorizontal: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  filledCell: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  subjectText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  roomText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  classText: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dayPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedDayButton: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  dayButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
  },
  timePickerContainer: {
    maxHeight: 200,
  },
  timeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  selectedTimeButton: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  timeButtonText: {
    color: '#666',
    textAlign: 'center',
  },
  selectedTimeText: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#4caf50',
  },
});
