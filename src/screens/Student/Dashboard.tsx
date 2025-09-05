// src/screens/Student/Dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../utils/AuthContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

interface DashboardCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

const DashboardCard = ({ title, description, onPress }: DashboardCardProps) => (
  <Card style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
    <Button 
      title="Open" 
      onPress={onPress} 
      variant="secondary" 
      style={styles.cardButton}
    />
  </Card>
);

export default function StudentDashboard({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();

  const studentFeatures = [
    {
      title: 'My Profile',
      description: 'View and update your profile information',
      onPress: () => console.log('My Profile'),
    },
    {
      title: 'Attendance',
      description: 'View your attendance records',
      onPress: () => console.log('Attendance'),
    },
    {
      title: 'Timetable',
      description: 'View your class schedule',
      onPress: () => console.log('Timetable'),
    },
    {
      title: 'Fees',
      description: 'View fee status and payment history',
      onPress: () => console.log('Fees'),
    },
    {
      title: 'Exam Results',
      description: 'View your exam results and grades',
      onPress: () => console.log('Exam Results'),
    },
    {
      title: 'Library',
      description: 'Manage borrowed books and search catalog',
      onPress: () => console.log('Library'),
    },
    {
      title: 'Notices',
      description: 'View latest notices and announcements',
      onPress: () => console.log('Notices'),
    },
    {
      title: 'Events',
      description: 'View upcoming college events',
      onPress: () => console.log('Events'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.roleText}>Student</Text>
        {user?.regNo && <Text style={styles.regNoText}>Reg. No: {user.regNo}</Text>}
        {user?.department && <Text style={styles.departmentText}>{user.department}</Text>}
        <Button 
          title="Sign Out" 
          onPress={signOut} 
          variant="secondary" 
          style={styles.signOutButton}
        />
      </View>

      <View style={styles.grid}>
        {studentFeatures.map((feature, index) => (
          <DashboardCard
            key={index}
            title={feature.title}
            description={feature.description}
            onPress={feature.onPress}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#7b1fa2',
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#e1bee7',
    marginBottom: 4,
  },
  regNoText: {
    fontSize: 14,
    color: '#e1bee7',
    marginBottom: 4,
  },
  departmentText: {
    fontSize: 14,
    color: '#e1bee7',
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  grid: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardButton: {
    alignSelf: 'flex-start',
  },
});
