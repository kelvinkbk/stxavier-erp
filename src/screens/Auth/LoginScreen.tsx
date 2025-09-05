// src/screens/Auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, TextInput } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { LocalStorageService } from "../../services/localStorage";
import SecurityService from "../../services/SecurityService";
import PerformanceMonitor from "../../services/PerformanceMonitor";
import SyncStatusComponent from "../../components/SyncStatusComponent";

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [loginInput, setLoginInput] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Start performance monitoring for login screen
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming('login_screen_load');
    
    return () => {
      monitor.endTiming('login_screen_load');
    };
  }, []);

  const onLogin = async () => {
    if (!loginInput || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const securityService = SecurityService.getInstance();
    const monitor = PerformanceMonitor.getInstance();
    
    // Start timing login process
    monitor.startTiming('user_login_process');

    setLoading(true);
    
    let email = loginInput;
    let resolvedEmail = loginInput;
    
    try {
      // Check if input is username (doesn't contain @)
      if (!loginInput.includes('@')) {
        // Find user by username
        const userData = await LocalStorageService.getUserByUsername(loginInput);
        if (!userData) {
          throw new Error("Username not found");
        }
        email = userData.email;
        resolvedEmail = userData.email;
        console.log('Login with username:', loginInput, 'resolved to email:', email);
      }

      // Record login attempt
      await securityService.recordLoginAttempt(resolvedEmail, true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sync user data on login for cross-device compatibility
      try {
        const userData = await LocalStorageService.getUser(userCredential.user.uid);
        if (userData) {
          // Update user data with current timestamp (within User type constraints)
          const updatedUserData = { ...userData };
          await LocalStorageService.saveUser(userCredential.user.uid, updatedUserData);
          
          // Trigger sync to get latest data from other devices
          await LocalStorageService.triggerSync();
          console.log('🔄 User data synced on login');
          
          // Start auto-refresh for this session (30 seconds interval)
          LocalStorageService.startAutoRefresh(30000);
          console.log('🔄 Auto-refresh started for session');
          
          // Setup real-time sync for this session
          LocalStorageService.setupRealtimeSync(userCredential.user.uid, (updatedUser) => {
            console.log('🔄 Real-time user update received:', updatedUser.email);
          });
        }
      } catch (syncError) {
        console.warn('⚠️ Sync failed, using local data:', syncError);
      }
      
      // Record login timing
      await monitor.endTiming('user_login_process');
      
      console.log('Login successful for user:', userCredential.user.email);
      // Navigation will be handled by AuthContext
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Record failed login attempt
      await securityService.recordLoginAttempt(resolvedEmail, false);
      
      // End timing for failed login
      await monitor.endTiming('user_login_process');
      
      Alert.alert("Login failed", err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cross-Device Sync Status */}
      <View style={styles.syncStatusContainer}>
        <SyncStatusComponent showDetails={false} />
      </View>
      
      <Card style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>St. Xavier ERP</Text>
          <Text style={styles.subtitle}>Educational Management System</Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email or Username"
            value={loginInput}
            onChangeText={setLoginInput}
            style={styles.input}
            keyboardType="default"
            autoCapitalize="none"
            autoComplete="username"
            placeholderTextColor="#999"
          />
          
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            autoComplete="password"
            placeholderTextColor="#999"
          />
          
          <Button
            title="Login"
            onPress={onLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />
          
          {/* SECURITY: Public registration disabled - admin only */}
          {/* 
          <Button
            title="Don't have an account? Register"
            onPress={() => navigation.navigate("Register")}
            variant="text"
            style={styles.linkButton}
          />
          */}
          
          <View style={styles.adminNoteContainer}>
            <Text style={styles.adminNote}>
              📝 New accounts must be created by administrators only.
            </Text>
            <Text style={styles.adminSubNote}>
              Contact your system administrator for account creation.
            </Text>
          </View>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.versionText}>Enhanced Version 2.0</Text>
          <Text style={styles.featuresText}>✨ Username Login • 🔒 Advanced Security • ⚡ Performance Optimized • 🔄 Cross-Device Sync</Text>
          <Text style={styles.contactText}>Need help? Contact admin@stxavier.edu</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  syncStatusContainer: {
    marginBottom: 10,
  },
  card: {
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  linkButton: {
    alignSelf: 'center',
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  contactText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  adminNoteContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#856404',
  },
  adminNote: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  adminSubNote: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});
