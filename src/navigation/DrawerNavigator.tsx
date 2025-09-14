// src/navigation/DrawerNavigator.tsx
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../utils/AuthContext';

// Import Dashboards
import AdminDashboard from '../screens/AdminDashboard';
import FacultyDashboard from '../screens/Faculty/Dashboard';
import StudentDashboard from '../screens/Student/Dashboard';

// Import Admin Screens
import FeeManagementScreen from '../screens/Admin/FeeManagementScreen';
import AdminNoticesScreen from '../screens/Admin/NoticesScreen';
import StudentManagementScreen from '../screens/Admin/StudentManagementScreen';
import { UserManagementScreen } from '../screens/Admin/UserManagementScreen';

// Import Faculty Screens
import AttendanceScreen from '../screens/Faculty/AttendanceScreen';
import StudentsScreen from '../screens/Faculty/StudentsScreen';
import TimetableScreen from '../screens/Faculty/TimetableScreen';

// Import Student Screens
import StudentAttendanceScreen from '../screens/Student/AttendanceScreen';
import EventsScreen from '../screens/Student/EventsScreen';
import ExamResultsScreen from '../screens/Student/ExamResultsScreen';
import FeesScreen from '../screens/Student/FeesScreen';
import LibraryScreen from '../screens/Student/LibraryScreen';
import StudentNoticesScreen from '../screens/Student/NoticesScreen';
import ProfileScreen from '../screens/Student/ProfileScreen';
import StudentTimetableScreen from '../screens/Student/TimetableScreen';

const Drawer = createDrawerNavigator();

interface DrawerContentProps {
  navigation: any;
}

const CustomDrawerContent: React.FC<DrawerContentProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', route: 'Dashboard', icon: 'home-outline' },
        { name: 'User Management', route: 'UserManagement', icon: 'people-outline' },
        { name: 'Student Management', route: 'StudentManagement', icon: 'school-outline' },
        { name: 'Fee Management', route: 'FeeManagement', icon: 'card-outline' },
        { name: 'Attendance', route: 'Attendance', icon: 'checkmark-outline' },
        { name: 'Notices', route: 'AdminNotices', icon: 'megaphone-outline' },
      ];
    } else if (user?.role === 'faculty') {
      return [
        { name: 'Dashboard', route: 'Dashboard', icon: 'home-outline' },
        { name: 'Attendance', route: 'Attendance', icon: 'checkmark-outline' },
        { name: 'My Timetable', route: 'Timetable', icon: 'calendar-outline' },
        { name: 'My Students', route: 'Students', icon: 'people-outline' },
      ];
    } else if (user?.role === 'student') {
      return [
        { name: 'Dashboard', route: 'Dashboard', icon: 'home-outline' },
        { name: 'My Profile', route: 'Profile', icon: 'person-outline' },
        { name: 'Fees', route: 'Fees', icon: 'card-outline' },
        { name: 'Attendance', route: 'StudentAttendance', icon: 'checkmark-outline' },
        { name: 'Timetable', route: 'StudentTimetable', icon: 'calendar-outline' },
        { name: 'Results', route: 'StudentResults', icon: 'trophy-outline' },
        { name: 'Library', route: 'StudentLibrary', icon: 'library-outline' },
        { name: 'Notices', route: 'StudentNotices', icon: 'megaphone-outline' },
        { name: 'Events', route: 'StudentEvents', icon: 'calendar-outline' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <ScrollView style={styles.drawerContent}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.drawerItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color="#333"
              style={styles.drawerItemIcon}
            />
            <Text style={styles.drawerItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#dc3545" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const DrawerNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        headerStyle: {
          backgroundColor:
            user?.role === 'admin' ? '#1976d2' : user?.role === 'faculty' ? '#388e3c' : '#f57c00',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Dashboard Screen */}
      <Drawer.Screen
        name="Dashboard"
        component={
          user?.role === 'admin'
            ? AdminDashboard
            : user?.role === 'faculty'
            ? FacultyDashboard
            : StudentDashboard
        }
        options={{
          title: `${user?.role?.charAt(0).toUpperCase()}${user?.role?.slice(1)} Dashboard`,
          headerLeft: () => null, // This will show the hamburger menu
        }}
      />

      {/* Admin Screens */}
      {user?.role === 'admin' && (
        <>
          <Drawer.Screen
            name="UserManagement"
            component={UserManagementScreen}
            options={{ title: 'User Management' }}
          />
          <Drawer.Screen
            name="StudentManagement"
            component={StudentManagementScreen}
            options={{ title: 'Student Management' }}
          />
          <Drawer.Screen
            name="FeeManagement"
            component={FeeManagementScreen}
            options={{ title: 'Fee Management' }}
          />
          <Drawer.Screen
            name="AdminNotices"
            component={AdminNoticesScreen}
            options={{ title: 'Notices & Announcements' }}
          />
        </>
      )}

      {/* Faculty Screens */}
      {user?.role === 'faculty' && (
        <>
          <Drawer.Screen
            name="Timetable"
            component={TimetableScreen}
            options={{ title: 'My Timetable' }}
          />
          <Drawer.Screen
            name="Students"
            component={StudentsScreen}
            options={{ title: 'My Students' }}
          />
        </>
      )}

      {/* Student Screens */}
      {user?.role === 'student' && (
        <>
          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'My Profile' }}
          />
          <Drawer.Screen name="Fees" component={FeesScreen} options={{ title: 'Fee Status' }} />
          <Drawer.Screen
            name="StudentAttendance"
            component={StudentAttendanceScreen}
            options={{ title: 'My Attendance' }}
          />
          <Drawer.Screen
            name="StudentTimetable"
            component={StudentTimetableScreen}
            options={{ title: 'My Timetable' }}
          />
          <Drawer.Screen
            name="StudentResults"
            component={ExamResultsScreen}
            options={{ title: 'Exam Results' }}
          />
          <Drawer.Screen
            name="StudentLibrary"
            component={LibraryScreen}
            options={{ title: 'Library' }}
          />
          <Drawer.Screen
            name="StudentNotices"
            component={StudentNoticesScreen}
            options={{ title: 'Notices' }}
          />
          <Drawer.Screen
            name="StudentEvents"
            component={EventsScreen}
            options={{ title: 'Events' }}
          />
        </>
      )}

      {/* Shared Screens */}
      {(user?.role === 'admin' || user?.role === 'faculty') && (
        <Drawer.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{ title: 'Attendance Management' }}
        />
      )}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  drawerItemIcon: {
    marginRight: 15,
    width: 24,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
    marginLeft: 15,
  },
});

export default DrawerNavigator;
