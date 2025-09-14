// src/screens/Student/Dashboard.tsx
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../utils/AuthContext';
import { NavigationDebug } from '../../utils/navigationDebug';
import { UniversalAlert } from '../../utils/universalAlert';

const { width } = Dimensions.get('window');

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const DashboardCard = ({ title, description, icon, color, onPress }: DashboardCardProps) => (
  <TouchableOpacity style={[styles.modernCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={[styles.cardIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.modernCardTitle}>{title}</Text>
        <Text style={styles.modernCardDescription}>{description}</Text>
      </View>
    </View>
    <View style={styles.cardArrow}>
      <Text style={styles.arrowText}>→</Text>
    </View>
  </TouchableOpacity>
);

const QuickStatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <View style={[styles.statCard, { borderColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

export default function StudentDashboard({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();

  const studentFeatures = [
    {
      title: 'My Profile',
      description: 'View and update your profile information',
      icon: '👤',
      color: '#3B82F6',
      onPress: () => {
        if (!NavigationDebug.safeNavigate(navigation, 'Profile')) {
          UniversalAlert.error(
            'Unable to open Profile screen. Please check that the screen is properly configured.'
          );
        }
      },
    },
    {
      title: 'Fees',
      description: 'View fee status and payment history',
      icon: '💰',
      color: '#10B981',
      onPress: () => {
        if (!NavigationDebug.safeNavigate(navigation, 'Fees')) {
          UniversalAlert.error(
            'Unable to open Fees screen. Please check that the screen is properly configured.'
          );
        }
      },
    },
    {
      title: 'Attendance',
      description: 'View your attendance records',
      icon: '📊',
      color: '#F59E0B',
      onPress: () => {
        // Navigate to Student Attendance screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentAttendance')) {
          // Show attendance functionality for students
          UniversalAlert.info(
            'Attendance Records',
            'View your attendance records including daily attendance, monthly summaries, and attendance percentage. Track your presence across all subjects and identify areas where attendance needs improvement.'
          );
        }
      },
    },
    {
      title: 'Timetable',
      description: 'View your class schedule',
      icon: '🕒',
      color: '#8B5CF6',
      onPress: () => {
        // Navigate to Student Timetable screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentTimetable')) {
          // Show timetable functionality for students
          UniversalAlert.info(
            'Class Timetable',
            'View your complete class schedule including subject-wise timings, room numbers, faculty assignments, and weekly schedules. Stay updated with any schedule changes or announcements.'
          );
        }
      },
    },
    {
      title: 'Exam Results',
      description: 'View your exam results and grades',
      icon: '📋',
      color: '#EF4444',
      onPress: () => {
        // Navigate to Student Results screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentExamResults')) {
          // Show exam results functionality for students
          UniversalAlert.info(
            'Exam Results & Grades',
            'Access your exam results, grades, and academic performance reports. View subject-wise marks, semester results, grade analysis, and overall academic progress tracking.'
          );
        }
      },
    },
    {
      title: 'Library',
      description: 'Manage borrowed books and search catalog',
      icon: '📚',
      color: '#06B6D4',
      onPress: () => {
        // Navigate to Student Library screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentLibrary')) {
          // Show library functionality for students
          UniversalAlert.info(
            'Library Management',
            'Access the library system to search for books, view your borrowed books, check due dates, renew books, and browse the complete catalog. Manage your reading list and book reservations.'
          );
        }
      },
    },
    {
      title: 'Notices',
      description: 'View latest notices and announcements',
      icon: '📢',
      color: '#F97316',
      onPress: () => {
        // Navigate to Student Notices screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentNotices')) {
          // Show notices functionality for students
          UniversalAlert.info(
            'Notices & Announcements',
            'Stay updated with the latest college notices, announcements, and important updates. View academic notices, exam schedules, event announcements, and official communications.'
          );
        }
      },
    },
    {
      title: 'Events',
      description: 'View upcoming college events',
      icon: '🎉',
      color: '#EC4899',
      onPress: () => {
        // Navigate to Student Events screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentEvents')) {
          // Show events functionality for students
          UniversalAlert.info(
            'College Events',
            'Discover upcoming college events, cultural programs, workshops, seminars, and extracurricular activities. Register for events, view event details, and stay connected with campus life.'
          );
        }
      },
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.modernHeader}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation?.openDrawer?.()}
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back! 👋</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.userDetails}>
              {user?.regNo && <Text style={styles.regNoText}>📝 {user.regNo}</Text>}
              {user?.department && <Text style={styles.departmentText}>🏛️ {user.department}</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={signOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsRow}>
          <QuickStatCard title="Attendance" value="85%" color="#10B981" />
          <QuickStatCard title="Pending Fees" value="₹0" color="#3B82F6" />
          <QuickStatCard title="Books Issued" value="3" color="#F59E0B" />
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Student Services</Text>
        <View style={styles.modernGrid}>
          {studentFeatures.map((feature, index) => (
            <DashboardCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onPress={feature.onPress}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modernHeader: {
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 8,
    marginRight: 10,
    marginTop: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  regNoText: {
    fontSize: 14,
    color: '#cbd5e0',
  },
  departmentText: {
    fontSize: 14,
    color: '#cbd5e0',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  servicesContainer: {
    padding: 20,
  },
  modernGrid: {
    gap: 12,
  },
  modernCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  modernCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 2,
  },
  modernCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#9ca3af',
  },
});
