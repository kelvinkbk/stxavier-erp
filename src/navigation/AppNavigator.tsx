// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import DrawerNavigator from './DrawerNavigator';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
// import RegisterScreen from '../screens/Auth/RegisterScreen'; // SECURITY: Disabled public registration

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
  return <DrawerNavigator />;
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <NavigationContainer>{user ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
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
