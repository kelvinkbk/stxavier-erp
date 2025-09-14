import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import BackgroundService from './src/services/BackgroundService';
import { AuthProvider } from './src/utils/AuthContext';

// Platform-specific SafeAreaProvider import
let SafeAreaProvider;
try {
  const safeAreaModule = require('react-native-safe-area-context');
  SafeAreaProvider = safeAreaModule.SafeAreaProvider;
} catch (error) {
  // Fallback for web or if module fails to load
  SafeAreaProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
}

export default function App() {
  // Initialize background services
  useEffect(() => {
    const initializeBackgroundServices = async () => {
      try {
        const backgroundService = BackgroundService.getInstance();
        await backgroundService.initialize();
        console.log('Background services initialized');
      } catch (error) {
        console.error('Failed to initialize background services:', error);
      }
    };

    initializeBackgroundServices();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
