// src/screens/Faculty/Dashboard.tsx
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../utils/AuthContext';
import { NavigationDebug } from '../../utils/navigationDebug';
import { UniversalAlert } from '../../utils/universalAlert';

interface FacultyFeature {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const DashboardCard = ({ title, description, icon, color, onPress }: DashboardCardProps) => (
  <TouchableOpacity
    style={[styles.modernCard, { borderLeftColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Text style={[styles.cardIcon, { color: color }]}>{icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.modernCardTitle}>{title}</Text>
        <Text style={styles.modernCardDescription}>{description}</Text>
      </View>
    </View>
    <View style={styles.cardArrow}>
      <Text style={styles.arrowText}>›</Text>
    </View>
  </TouchableOpacity>
);

const QuickStatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, { color: color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

export default function FacultyDashboard({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();

  const facultyFeatures: FacultyFeature[] = [
    {
      title: 'Mark Attendance',
      description: 'Mark attendance for your classes',
      icon: '✓',
      color: '#10b981',
      onPress: () => {
        if (!NavigationDebug.safeNavigate(navigation, 'Attendance')) {
          UniversalAlert.error(
            'Unable to open Attendance screen. Please check that the screen is properly configured.'
          );
        }
      },
    },
    {
      title: 'My Timetable',
      description: 'View and manage your class schedule',
      icon: '📅',
      color: '#3b82f6',
      onPress: () => {
        if (!NavigationDebug.safeNavigate(navigation, 'Timetable')) {
          UniversalAlert.error(
            'Unable to open Timetable screen. Please check that the screen is properly configured.'
          );
        }
      },
    },
    {
      title: 'View Students',
      description: 'View students in your classes',
      icon: '👥',
      color: '#8b5cf6',
      onPress: () => {
        // Navigate to Students screen - implement view students functionality
        if (!NavigationDebug.safeNavigate(navigation, 'Students')) {
          // If Students screen doesn't exist, show a temporary alert
          UniversalAlert.info(
            'Students List',
            'Viewing students in your classes. This will show a list of all enrolled students with their details, attendance records, and performance metrics.'
          );
        }
      },
    },
    {
      title: 'Attendance Reports',
      description: 'View attendance reports for your classes',
      icon: '📊',
      color: '#f59e0b',
      onPress: () => {
        // Navigate to Attendance Reports screen
        if (!NavigationDebug.safeNavigate(navigation, 'AttendanceReports')) {
          // Show attendance reports functionality
          UniversalAlert.info(
            'Attendance Reports',
            'This will display comprehensive attendance reports including daily, weekly, and monthly summaries for all your classes. You can view attendance trends and generate reports for students.'
          );
        }
      },
    },
    {
      title: 'Exam Management',
      description: 'Create exams and enter marks',
      icon: '📝',
      color: '#ef4444',
      onPress: () => {
        // Navigate to Exam Management screen
        if (!NavigationDebug.safeNavigate(navigation, 'ExamManagement')) {
          // Show exam management functionality
          UniversalAlert.info(
            'Exam Management',
            'This section allows you to create, schedule, and manage examinations. You can set exam dates, create question papers, assign grades, and publish results for your subjects.'
          );
        }
      },
    },
    {
      title: 'Student Performance',
      description: 'View student performance analytics',
      icon: '📈',
      color: '#06b6d4',
      onPress: () => {
        // Navigate to Student Performance screen
        if (!NavigationDebug.safeNavigate(navigation, 'StudentPerformance')) {
          // Show student performance functionality
          UniversalAlert.info(
            'Student Performance',
            'View detailed performance analytics for your students including grades, assignment scores, test results, and progress tracking. Generate performance reports and identify students who need additional support.'
          );
        }
      },
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation?.openDrawer?.()}
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Good day,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.userDetails}>
              <Text style={styles.roleText}>Faculty</Text>
              <Text style={styles.departmentText}>{user?.department}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsRow}>
          <QuickStatCard title="Classes Today" value="4" color="#10b981" />
          <QuickStatCard title="Total Students" value="120" color="#3b82f6" />
          <QuickStatCard title="Pending Grades" value="8" color="#f59e0b" />
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Faculty Services</Text>
        <View style={styles.modernGrid}>
          {facultyFeatures.map((feature, index) => (
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
    backgroundColor: '#059669',
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
    color: '#d1fae5',
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
  roleText: {
    fontSize: 14,
    color: '#a7f3d0',
  },
  departmentText: {
    fontSize: 14,
    color: '#a7f3d0',
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
