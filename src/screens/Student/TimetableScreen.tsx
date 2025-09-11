// src/screens/Student/TimetableScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';

interface TimeSlot {
  time: string;
  subject: string;
  faculty: string;
  room: string;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export default function StudentTimetableScreen() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      // Mock timetable data for now
      const mockTimetable: DaySchedule[] = [
        {
          day: 'Monday',
          slots: [
            { time: '9:00 - 10:00', subject: 'Mathematics', faculty: 'Dr. Smith', room: 'Room 101' },
            { time: '10:00 - 11:00', subject: 'Physics', faculty: 'Prof. Johnson', room: 'Room 102' },
            { time: '11:30 - 12:30', subject: 'Chemistry', faculty: 'Dr. Brown', room: 'Lab 1' },
            { time: '2:00 - 3:00', subject: 'English', faculty: 'Ms. Davis', room: 'Room 201' },
          ],
        },
        {
          day: 'Tuesday',
          slots: [
            { time: '9:00 - 10:00', subject: 'Computer Science', faculty: 'Prof. Wilson', room: 'Lab 2' },
            { time: '10:00 - 11:00', subject: 'Mathematics', faculty: 'Dr. Smith', room: 'Room 101' },
            { time: '11:30 - 12:30', subject: 'Physics Lab', faculty: 'Prof. Johnson', room: 'Lab 3' },
            { time: '2:00 - 3:00', subject: 'History', faculty: 'Dr. Taylor', room: 'Room 301' },
          ],
        },
        {
          day: 'Wednesday',
          slots: [
            { time: '9:00 - 10:00', subject: 'Biology', faculty: 'Dr. Anderson', room: 'Lab 4' },
            { time: '10:00 - 11:00', subject: 'Chemistry', faculty: 'Dr. Brown', room: 'Lab 1' },
            { time: '11:30 - 12:30', subject: 'Mathematics', faculty: 'Dr. Smith', room: 'Room 101' },
            { time: '2:00 - 3:00', subject: 'Physical Education', faculty: 'Coach Miller', room: 'Gym' },
          ],
        },
        {
          day: 'Thursday',
          slots: [
            { time: '9:00 - 10:00', subject: 'English', faculty: 'Ms. Davis', room: 'Room 201' },
            { time: '10:00 - 11:00', subject: 'Computer Science', faculty: 'Prof. Wilson', room: 'Lab 2' },
            { time: '11:30 - 12:30', subject: 'Physics', faculty: 'Prof. Johnson', room: 'Room 102' },
            { time: '2:00 - 3:00', subject: 'Art', faculty: 'Ms. Garcia', room: 'Art Room' },
          ],
        },
        {
          day: 'Friday',
          slots: [
            { time: '9:00 - 10:00', subject: 'History', faculty: 'Dr. Taylor', room: 'Room 301' },
            { time: '10:00 - 11:00', subject: 'Biology', faculty: 'Dr. Anderson', room: 'Lab 4' },
            { time: '11:30 - 12:30', subject: 'Chemistry Lab', faculty: 'Dr. Brown', room: 'Lab 1' },
            { time: '2:00 - 3:00', subject: 'Music', faculty: 'Prof. Lee', room: 'Music Room' },
          ],
        },
      ];

      setTimetable(mockTimetable);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSlot = (slot: TimeSlot, index: number) => (
    <View key={index} style={styles.slotCard}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{slot.time}</Text>
      </View>
      <View style={styles.detailsColumn}>
        <Text style={styles.subjectText}>{slot.subject}</Text>
        <Text style={styles.facultyText}>{slot.faculty}</Text>
        <Text style={styles.roomText}>{slot.room}</Text>
      </View>
    </View>
  );

  const renderDay = (daySchedule: DaySchedule) => (
    <Card key={daySchedule.day} style={styles.dayCard}>
      <Text style={styles.dayTitle}>{daySchedule.day}</Text>
      {daySchedule.slots.map((slot, index) => renderTimeSlot(slot, index))}
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading timetable..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Timetable</Text>
        <Text style={styles.headerSubtitle}>
          {user?.department && `${user.department} Department`}
        </Text>
      </View>

      {timetable.map(renderDay)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  dayCard: {
    margin: 16,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  slotCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detailsColumn: {
    flex: 2,
    paddingLeft: 16,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  facultyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  roomText: {
    fontSize: 12,
    color: '#999',
  },
});
