// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { User } from "../../types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { LocalStorageService } from "../../services/localStorage";
import SyncStatusComponent from "../../components/SyncStatusComponent";
import { UniversalAlert } from "../../utils/universalAlert";

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<'admin' | 'faculty' | 'student'>('student');
  const [department, setDepartment] = useState("");
  const [regNo, setRegNo] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!email || !password || !name || !username) {
      UniversalAlert.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      UniversalAlert.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      UniversalAlert.error("Password must be at least 6 characters");
      return;
    }

    // Check username availability
    const isUsernameAvailable = await LocalStorageService.isUsernameAvailable(username);
    if (!isUsernameAvailable) {
      UniversalAlert.error("Username is already taken");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData: User = {
        uid: firebaseUser.uid,
        name,
        email,
        username,
        role,
        department: department || undefined,
        regNo: regNo || undefined,
        createdAt: new Date(),
      };

      await LocalStorageService.saveUser(firebaseUser.uid, userData);
      console.log('User data saved successfully for UID:', firebaseUser.uid);
      
      // Trigger sync after successful registration
      try {
        await LocalStorageService.triggerSync();
      } catch (syncError) {
        console.warn('Sync failed after registration:', syncError);
      }
      
      UniversalAlert.success("Account created successfully!");
    } catch (err: any) {
      UniversalAlert.error(err.message || "Unknown error");
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join St. Xavier ERP</Text>
        
        <TextInput
          placeholder="Full Name *"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        <TextInput
          placeholder="Username *"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Role *</Text>
        <View style={styles.roleContainer}>
          {['student', 'faculty', 'admin'].map((roleOption) => (
            <Button
              key={roleOption}
              title={roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
              onPress={() => setRole(roleOption as 'admin' | 'faculty' | 'student')}
              variant={role === roleOption ? 'primary' : 'secondary'}
              style={styles.roleButton}
            />
          ))}
        </View>
        
        <TextInput
          placeholder="Department"
          value={department}
          onChangeText={setDepartment}
          style={styles.input}
        />
        
        {role === 'student' && (
          <TextInput
            placeholder="Registration Number"
            value={regNo}
            onChangeText={setRegNo}
            style={styles.input}
          />
        )}
        
        <TextInput
          placeholder="Password *"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          autoComplete="password"
        />
        
        <TextInput
          placeholder="Confirm Password *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />
        
        <Button
          title="Register"
          onPress={onRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        />
        
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate("Login")}
          variant="text"
          style={styles.linkButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  syncStatusContainer: {
    marginBottom: 10,
  },
  card: {
    // Card styles are handled by our custom Card component
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1976d2",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  roleButton: {
    flex: 1,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 8,
    alignSelf: "center",
  },
});
