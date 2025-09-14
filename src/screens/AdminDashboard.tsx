import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AutoRefreshSettings from '../components/AutoRefreshSettings';
import SyncDebugPanel from '../components/SyncDebugPanel';
import SyncStatusComponent from '../components/SyncStatusComponent';
import { auth } from '../firebase';
import { AdvancedUserService, UserFilter, UserStats } from '../services/advancedUserService';
import { LocalStorageService } from '../services/localStorage';
import MigrationService from '../services/MigrationService';
import PerformanceMonitor from '../services/PerformanceMonitor';
import SecurityService from '../services/SecurityService';
import { User } from '../types';
import { useAuth } from '../utils/AuthContext';
import { UniversalAlert } from '../utils/universalAlert';

interface AdminDashboardProps {
  navigation?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [showSyncDebug, setShowSyncDebug] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'student' as 'admin' | 'faculty' | 'student',
    department: '',
    regNo: '',
    password: '',
  });

  useEffect(() => {
    loadInitialData();

    // Start performance monitoring
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming('admin_dashboard_load');

    // Start auto-refresh with 30-second interval
    LocalStorageService.startAutoRefresh(30000);

    // Listen for auto-refresh data updates
    const unsubscribeDataUpdate = LocalStorageService.onDataUpdate(data => {
      console.log('📊 Auto-refresh: Dashboard data updated');
      // Refresh dashboard data when auto-refresh happens
      loadInitialData();
    });

    return () => {
      monitor.endTiming('admin_dashboard_load');
      LocalStorageService.stopAutoRefresh();
      unsubscribeDataUpdate();
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [userStats, allUsers] = await Promise.all([
        AdvancedUserService.getUserStatsAdvanced(),
        AdvancedUserService.getAllUsers(),
      ]);

      setStats(userStats);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      UniversalAlert.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const filter: UserFilter = {
      searchTerm: searchTerm || undefined,
      role: selectedRole || undefined,
    };

    const filtered = await AdvancedUserService.searchUsersAdvanced(filter);
    setFilteredUsers(filtered);
  };

  const handleBulkImport = async () => {
    if (!csvData.trim()) {
      UniversalAlert.error('Please enter CSV data');
      return;
    }

    setLoading(true);
    try {
      const result = await AdvancedUserService.importUsersFromCSVAdvanced(csvData);

      UniversalAlert.success(
        `Import Complete!\n\nSuccess: ${result.success}\nFailed: ${result.failed}\n\n${
          result.errors.length > 0
            ? `Errors:\n${result.errors
                .slice(0, 3)
                .map(e => `Row ${e.row}: ${e.error}`)
                .join('\n')}`
            : 'All users imported successfully!'
        }`
      );

      setShowBulkImport(false);
      setCsvData('');
      loadInitialData();
    } catch (error) {
      UniversalAlert.error('Failed to import users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.username || !newUserData.password) {
      UniversalAlert.error('Please fill in all required fields');
      return;
    }

    if (newUserData.password.length < 6) {
      UniversalAlert.error('Password must be at least 6 characters');
      return;
    }

    // Check username availability
    const isUsernameAvailable = await LocalStorageService.isUsernameAvailable(newUserData.username);
    if (!isUsernameAvailable) {
      UniversalAlert.error('Username is already taken');
      return;
    }

    setLoading(true);
    try {
      // ⚡ TEMPORARY FIX: Create user locally only (bypassing Firebase 400 error)
      // TODO: Enable Email/Password authentication in Firebase Console to remove this workaround

      let firebaseUser;
      let userData: User;

      try {
        // Try Firebase creation first
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newUserData.email,
          newUserData.password
        );
        firebaseUser = userCredential.user;

        userData = {
          uid: firebaseUser.uid,
          name: newUserData.name,
          email: newUserData.email,
          username: newUserData.username,
          role: newUserData.role,
          department: newUserData.department || undefined,
          regNo: newUserData.regNo || undefined,
          createdAt: new Date(),
        };
      } catch (firebaseError: any) {
        console.log('Firebase creation failed, creating locally only:', firebaseError.message);

        // Create user locally with generated UID
        const localUID = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        userData = {
          uid: localUID,
          name: newUserData.name,
          email: newUserData.email,
          username: newUserData.username,
          role: newUserData.role,
          department: newUserData.department || undefined,
          regNo: newUserData.regNo || undefined,
          createdAt: new Date(),
        };

        UniversalAlert.info(
          'Created Locally - User created in local storage only. Enable Firebase Email/Password authentication for cloud sync.'
        );
      }

      await LocalStorageService.saveUser(userData.uid, userData);

      // Security log
      const securityService = SecurityService.getInstance();
      await securityService.logSecurityEvent({
        id: `user_created_${Date.now()}`,
        timestamp: new Date(),
        event: 'USER_CREATED_BY_ADMIN',
        details: {
          newUserUid: userData.uid,
          newUserEmail: newUserData.email,
          newUserRole: newUserData.role,
        },
      });

      UniversalAlert.success(`User account created successfully for ${newUserData.name}`);

      // Reset form
      setNewUserData({
        name: '',
        email: '',
        username: '',
        role: 'student',
        department: '',
        regNo: '',
        password: '',
      });

      setShowCreateUser(false);
      loadInitialData();
    } catch (error: any) {
      UniversalAlert.error(error.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMigrations = async () => {
    UniversalAlert.confirm(
      'Run Database Migrations',
      'This will update the database structure for improved performance. This may take a few minutes.',
      async () => {
        setLoading(true);
        try {
          const migrationService = MigrationService.getInstance();
          await migrationService.runMigrations();
          UniversalAlert.success('Database migrations completed successfully');
        } catch (error) {
          UniversalAlert.error('Failed to run migrations. Please try again or contact support.');
          console.error('Migration error:', error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const exportUsers = async () => {
    try {
      setLoading(true);

      const filter: UserFilter = {
        searchTerm: searchTerm || undefined,
        role: selectedRole || undefined,
      };

      console.log('📊 Starting user export with filter:', filter);
      const exported = await AdvancedUserService.exportUsersAdvanced(filter);

      console.log('✅ Export completed successfully');
      UniversalAlert.success(
        `Export Complete!\n\nSuccessfully exported ${filteredUsers.length} users!\n\n📋 CSV: ${
          exported.csv.length
        } characters\n📄 JSON: ${
          exported.json.length
        } characters\n\n📅 Export timestamp: ${new Date().toLocaleString()}`
      );
    } catch (error: any) {
      console.error('❌ Export failed:', error);
      UniversalAlert.error(
        `Export Failed!\n\nError details: ${
          error.message || 'Unknown error occurred'
        }\n\nPlease check the console for more details.`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceStats = async () => {
    try {
      const monitor = PerformanceMonitor.getInstance();
      const data = await monitor.getPerformanceStats();
      setPerformanceData(data);
      setShowPerformanceStats(true);
    } catch (error) {
      UniversalAlert.error('Failed to load performance data');
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const security = SecurityService.getInstance();
      const logs = await security.getSecurityLogs(20);
      setSecurityLogs(logs);
      setShowSecurityLogs(true);
    } catch (error) {
      UniversalAlert.error('Failed to load security logs');
    }
  };

  const testNetworkPerformance = async () => {
    try {
      const monitor = PerformanceMonitor.getInstance();
      UniversalAlert.info('Testing network performance...');
      const result = await monitor.testNetworkPerformance();

      if (result) {
        UniversalAlert.success(
          `Network Test Result\n\nLatency: ${result.latency}ms\nConnection Type: ${result.connectionType}`
        );
      } else {
        UniversalAlert.error('Network test failed');
      }
    } catch (error) {
      UniversalAlert.error('Failed to test network');
    }
  };

  const triggerManualSync = async () => {
    try {
      UniversalAlert.info('Starting manual sync...');
      await LocalStorageService.triggerSync();
      UniversalAlert.success('Data synchronized across all devices!');
    } catch (error) {
      UniversalAlert.error('Failed to sync data');
    }
  };

  if (loading && !stats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Enhanced ERP Management</Text>
          {user && <Text style={styles.welcomeText}>Welcome, {user.name}</Text>}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Cross-Device Sync Status */}
        <View style={styles.syncContainer}>
          <SyncStatusComponent showDetails={true} />
          <TouchableOpacity style={styles.debugButton} onPress={() => setShowSyncDebug(true)}>
            <Ionicons name="bug" size={16} color="#666" />
            <Text style={styles.debugButtonText}>Debug</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Control Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cross-Device Synchronization</Text>
        <Text style={styles.syncDescription}>
          Your data automatically syncs across all devices. Use manual sync if you're experiencing
          issues.
        </Text>
        <TouchableOpacity style={styles.syncButton} onPress={triggerManualSync}>
          <Text style={styles.buttonText}>Force Manual Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Auto-Refresh Settings */}
      <AutoRefreshSettings />

      {/* Statistics Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.newUsersThisMonth}</Text>
            <Text style={styles.statLabel}>New This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.recentActivity}</Text>
            <Text style={styles.statLabel}>Recent Activity</Text>
          </View>
        </View>
      )}

      {/* Role Distribution */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users by Role</Text>
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <View key={role} style={styles.roleRow}>
              <Text style={styles.roleText}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
              <Text style={styles.roleCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Search and Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          <View style={styles.filterRow}>
            <Text>Role Filter:</Text>
            <View style={styles.roleButtons}>
              {['', 'admin', 'faculty', 'student'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleButton, selectedRole === role && styles.roleButtonActive]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === role && styles.roleButtonTextActive,
                    ]}
                  >
                    {role || 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.resultCount}>Found {filteredUsers.length} users</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => setShowCreateUser(true)}
          >
            <Text style={styles.actionButtonText}>➕ Create User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation?.navigate('UserManagement')}
          >
            <Text style={styles.actionButtonText}>👥 Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowBulkImport(true)}>
            <Text style={styles.actionButtonText}>Bulk Import</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={exportUsers}>
            <Text style={styles.actionButtonText}>Export Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={loadPerformanceStats}>
            <Text style={styles.actionButtonText}>Performance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={loadSecurityLogs}>
            <Text style={styles.actionButtonText}>Security Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={testNetworkPerformance}>
            <Text style={styles.actionButtonText}>Test Network</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.warningAction]}
            onPress={handleRunMigrations}
          >
            <Text style={styles.actionButtonText}>🔄 Run Migrations</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bulk Import Modal */}
      <Modal visible={showBulkImport} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bulk Import Users</Text>
            <TouchableOpacity onPress={() => setShowBulkImport(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalInstruction}>
            Paste CSV data with columns: name,email,username,role,department,regno,phone
          </Text>

          <TextInput
            style={styles.csvInput}
            multiline
            placeholder="name,email,username,role,department,regno,phone&#10;John Doe,john@example.com,johndoe,student,CS,2021001,1234567890"
            value={csvData}
            onChangeText={setCsvData}
          />

          <TouchableOpacity
            style={styles.importButton}
            onPress={handleBulkImport}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Importing...' : 'Import Users'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Performance Stats Modal */}
      <Modal visible={showPerformanceStats} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Performance Statistics</Text>
            <TouchableOpacity onPress={() => setShowPerformanceStats(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          {performanceData && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.perfStat}>
                Average Load Time: {performanceData.averageLoadTime.toFixed(2)}ms
              </Text>
              <Text style={styles.perfStat}>
                Network Latency: {performanceData.networkStats.averageLatency.toFixed(2)}ms
              </Text>
              <Text style={styles.perfStat}>
                Network Tests: {performanceData.networkStats.testCount}
              </Text>

              <Text style={styles.perfTitle}>Screen Performance:</Text>
              {Object.entries(performanceData.screenStats).map(([screen, stats]: [string, any]) => (
                <Text key={screen} style={styles.perfStat}>
                  {screen}: {stats.average.toFixed(2)}ms ({stats.count} loads)
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Security Logs Modal */}
      <Modal visible={showSecurityLogs} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Logs</Text>
            <TouchableOpacity onPress={() => setShowSecurityLogs(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {securityLogs.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <Text style={styles.logEvent}>{log.event}</Text>
                <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                {log.details && (
                  <Text style={styles.logDetails}>{JSON.stringify(log.details, null, 2)}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Sync Debug Panel */}
      <SyncDebugPanel visible={showSyncDebug} onClose={() => setShowSyncDebug(false)} />

      {/* Create User Modal */}
      <Modal visible={showCreateUser} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New User Account</Text>
          <Text style={styles.modalDescription}>
            Create a new user account with admin privileges. All fields marked with * are required.
          </Text>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={newUserData.name}
              onChangeText={text => setNewUserData(prev => ({ ...prev, name: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              value={newUserData.email}
              onChangeText={text => setNewUserData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Username *"
              value={newUserData.username}
              onChangeText={text => setNewUserData(prev => ({ ...prev, username: text }))}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password * (min 6 characters)"
              value={newUserData.password}
              onChangeText={text => setNewUserData(prev => ({ ...prev, password: text }))}
              secureTextEntry
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Role *</Text>
              <View style={styles.roleButtons}>
                {(['student', 'faculty', 'admin'] as const).map(roleOption => (
                  <TouchableOpacity
                    key={roleOption}
                    style={[
                      styles.roleButton,
                      newUserData.role === roleOption && styles.roleButtonActive,
                    ]}
                    onPress={() => setNewUserData(prev => ({ ...prev, role: roleOption }))}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        newUserData.role === roleOption && styles.roleButtonTextActive,
                      ]}
                    >
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Department (optional)"
              value={newUserData.department}
              onChangeText={text => setNewUserData(prev => ({ ...prev, department: text }))}
            />

            {newUserData.role === 'student' && (
              <TextInput
                style={styles.input}
                placeholder="Registration Number (optional)"
                value={newUserData.regNo}
                onChangeText={text => setNewUserData(prev => ({ ...prev, regNo: text }))}
              />
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateUser(false);
                setNewUserData({
                  name: '',
                  email: '',
                  username: '',
                  role: 'student',
                  department: '',
                  regNo: '',
                  password: '',
                });
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importButton, loading && styles.disabledButton]}
              onPress={handleCreateUser}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create User'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  headerContent: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  syncContainer: {
    marginTop: 15,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  syncDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  roleText: {
    fontSize: 16,
  },
  roleCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  filterRow: {
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  roleButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalInstruction: {
    padding: 15,
    fontSize: 14,
    color: '#666',
  },
  csvInput: {
    margin: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 200,
    textAlignVertical: 'top',
  },
  importButton: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  perfStat: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  perfTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  logEntry: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  logEvent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logDetails: {
    fontSize: 10,
    color: '#333',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  primaryAction: {
    backgroundColor: '#28a745',
  },
  warningAction: {
    backgroundColor: '#FF9500',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
});

export default AdminDashboard;
