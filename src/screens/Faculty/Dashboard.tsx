// src/screens/Faculty/Dashboard.tsx
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

export default function FacultyDashboard({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();

  const facultyFeatures = [
    {
      title: 'Mark Attendance',
      description: 'Mark attendance for your classes',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      title: 'View Students',
      description: 'View students in your classes',
      onPress: () => console.log('View Students'),
    },
    {
      title: 'My Timetable',
      description: 'View your class schedule',
      onPress: () => console.log('My Timetable'),
    },
    {
      title: 'Attendance Reports',
      description: 'View attendance reports for your classes',
      onPress: () => console.log('Attendance Reports'),
    },
    {
      title: 'Exam Management',
      description: 'Create exams and enter marks',
      onPress: () => console.log('Exam Management'),
    },
    {
      title: 'Student Performance',
      description: 'View student performance analytics',
      onPress: () => console.log('Student Performance'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.roleText}>Faculty</Text>
        <Text style={styles.departmentText}>{user?.department}</Text>
        <Button 
          title="Sign Out" 
          onPress={signOut} 
          variant="secondary" 
          style={styles.signOutButton}
        />
      </View>

      <View style={styles.grid}>
        {facultyFeatures.map((feature, index) => (
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
    backgroundColor: '#388e3c',
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
    color: '#c8e6c9',
    marginBottom: 4,
  },
  departmentText: {
    fontSize: 14,
    color: '#c8e6c9',
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
