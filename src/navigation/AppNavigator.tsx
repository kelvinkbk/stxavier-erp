// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../utils/AuthContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
// import RegisterScreen from '../screens/Auth/RegisterScreen'; // SECURITY: Disabled public registration

// Dashboard Screens
import AdminDashboard from '../screens/Admin/Dashboard';
import FacultyDashboard from '../screens/Faculty/Dashboard';
import StudentDashboard from '../screens/Student/Dashboard';
import { UserManagementScreen } from '../screens/Admin/UserManagementScreen';

// New ERP Management Screens
import StudentManagementScreen from '../screens/Admin/StudentManagementScreen';
import FeeManagementScreen from '../screens/Admin/FeeManagementScreen';
import AttendanceScreen from '../screens/Faculty/AttendanceScreen';

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
