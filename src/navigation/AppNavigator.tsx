// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../utils/AuthContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
// import RegisterScreen from '../screens/Auth/RegisterScreen'; // SECURITY: Disabled public registration

// Dashboard Screens
import { UserManagementScreen } from '../screens/Admin/UserManagementScreen';
import AdminDashboard from '../screens/AdminDashboard';
import FacultyDashboard from '../screens/Faculty/Dashboard';
import StudentDashboard from '../screens/Student/Dashboard';

// New ERP Management Screens
import FeeManagementScreen from '../screens/Admin/FeeManagementScreen';
import StudentManagementScreen from '../screens/Admin/StudentManagementScreen';
import AttendanceScreen from '../screens/Faculty/AttendanceScreen';
import StudentsScreen from '../screens/Faculty/StudentsScreen';
import TimetableScreen from '../screens/Faculty/TimetableScreen';

// Student Screens
import StudentAttendanceScreen from '../screens/Student/AttendanceScreen';
import EventsScreen from '../screens/Student/EventsScreen';
import ExamResultsScreen from '../screens/Student/ExamResultsScreen';
import FeesScreen from '../screens/Student/FeesScreen';
import LibraryScreen from '../screens/Student/LibraryScreen';
import StudentNoticesScreen from '../screens/Student/NoticesScreen';
import ProfileScreen from '../screens/Student/ProfileScreen';
import StudentTimetableScreen from '../screens/Student/TimetableScreen';

// Admin Screens
import AdminNoticesScreen from '../screens/Admin/NoticesScreen';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#1976d2" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} {...({} as any)}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* SECURITY: Public registration disabled - admin only user creation */}
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator {...({} as any)}>
      {user?.role === 'admin' && (
        <Stack.Screen
          name="Dashboard"
          component={AdminDashboard}
          options={{
            title: 'Admin Dashboard',
            headerStyle: { backgroundColor: '#1976d2' },
            headerTintColor: '#fff',
          }}
        />
      )}
      {user?.role === 'faculty' && (
        <Stack.Screen
          name="Dashboard"
          component={FacultyDashboard}
          options={{
            title: 'Faculty Dashboard',
            headerStyle: { backgroundColor: '#388e3c' },
            headerTintColor: '#fff',
          }}
        />
      )}
      {user?.role === 'student' && (
        <Stack.Screen
          name="Dashboard"
          component={StudentDashboard}
          options={{
            title: 'Student Dashboard',
            headerStyle: { backgroundColor: '#f57c00' },
            headerTintColor: '#fff',
          }}
        />
      )}
      {user?.role === 'admin' && (
        <>
          <Stack.Screen
            name="UserManagement"
            component={UserManagementScreen}
            options={{
              title: 'User Management',
              headerStyle: { backgroundColor: '#1976d2' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentManagement"
            component={StudentManagementScreen}
            options={{
              title: 'Student Management',
              headerStyle: { backgroundColor: '#1976d2' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="FeeManagement"
            component={FeeManagementScreen}
            options={{
              title: 'Fee Management',
              headerStyle: { backgroundColor: '#1976d2' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Notices"
            component={AdminNoticesScreen}
            options={{
              title: 'Notices & Announcements',
              headerStyle: { backgroundColor: '#1976d2' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
      {(user?.role === 'admin' || user?.role === 'faculty') && (
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{
            title: 'Attendance Management',
            headerStyle: { backgroundColor: '#1976d2' },
            headerTintColor: '#fff',
          }}
        />
      )}
      {user?.role === 'faculty' && (
        <>
          <Stack.Screen
            name="Timetable"
            component={TimetableScreen}
            options={{
              title: 'My Timetable',
              headerStyle: { backgroundColor: '#388e3c' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Students"
            component={StudentsScreen}
            options={{
              title: 'My Students',
              headerStyle: { backgroundColor: '#388e3c' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
      {user?.role === 'student' && (
        <>
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'My Profile',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Fees"
            component={FeesScreen}
            options={{
              title: 'Fee Status',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentAttendance"
            component={StudentAttendanceScreen}
            options={{
              title: 'My Attendance',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentTimetable"
            component={StudentTimetableScreen}
            options={{
              title: 'My Timetable',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentResults"
            component={ExamResultsScreen}
            options={{
              title: 'Exam Results',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentLibrary"
            component={LibraryScreen}
            options={{
              title: 'Library',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentNotices"
            component={StudentNoticesScreen}
            options={{
              title: 'Notices',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="StudentEvents"
            component={EventsScreen}
            options={{
              title: 'Events',
              headerStyle: { backgroundColor: '#f57c00' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
