import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/utils/AuthContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';

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
