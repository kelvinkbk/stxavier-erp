// src/screens/Admin/Dashboard.tsx
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

export default function AdminDashboard({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();

  const adminFeatures = [
    {
      title: 'User Management',
      description: 'Manage students, faculty, and staff accounts',
      onPress: () => navigation.navigate('UserManagement'),
    },
    {
      title: 'Student Records',
      description: 'View and manage student profiles and enrollment',
      onPress: () => navigation.navigate('StudentManagement'),
    },
    {
      title: 'Faculty Management',
      description: 'Manage faculty profiles and assignments',
      onPress: () => console.log('Faculty Management'),
    },
    {
      title: 'Attendance Management',
      description: 'Mark attendance and view analytics',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      title: 'Fee Management',
      description: 'Manage fees, payments, and financial records',
      onPress: () => navigation.navigate('FeeManagement'),
    },
    {
      title: 'Timetable Management',
      description: 'Create and manage class schedules',
      onPress: () => console.log('Timetable Management'),
    },
    {
      title: 'Notices & Circulars',
      description: 'Create and broadcast announcements',
      onPress: () => console.log('Notices'),
    },
    {
      title: 'Exam Management',
      description: 'Schedule exams and manage results',
      onPress: () => console.log('Exam Management'),
    },
    {
      title: 'Library Management',
      description: 'Manage books, borrowing, and returns',
      onPress: () => console.log('Library Management'),
    },
    {
      title: 'Events',
      description: 'Create and manage college events',
      onPress: () => console.log('Events'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.roleText}>Administrator</Text>
        <Button 
          title="Sign Out" 
          onPress={signOut} 
          variant="secondary" 
          style={styles.signOutButton}
        />
      </View>

      <View style={styles.grid}>
        {adminFeatures.map((feature, index) => (
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
    backgroundColor: '#1976d2',
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
    color: '#e3f2fd',
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
