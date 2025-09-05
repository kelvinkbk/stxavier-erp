import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator
} from 'react-native';
import { AdvancedUserService, UserStats, UserFilter, BulkUserData } from '../services/advancedUserService';
import SecurityService from '../services/SecurityService';
import PerformanceMonitor from '../services/PerformanceMonitor';
import { LocalStorageService } from '../services/localStorage';
import SyncStatusComponent from '../components/SyncStatusComponent';
import { User } from '../types';

const AdminDashboard: React.FC = () => {
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

  useEffect(() => {
    loadInitialData();
    // Start performance monitoring
    const monitor = PerformanceMonitor.getInstance();
    monitor.startTiming('admin_dashboard_load');
    
    return () => {
      monitor.endTiming('admin_dashboard_load');
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [userStats, allUsers] = await Promise.all([
        AdvancedUserService.getUserStatsAdvanced(),
        AdvancedUserService.getAllUsers()
      ]);
      
      setStats(userStats);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const filter: UserFilter = {
      searchTerm: searchTerm || undefined,
      role: selectedRole || undefined
    };
    
    const filtered = await AdvancedUserService.searchUsersAdvanced(filter);
    setFilteredUsers(filtered);
  };

  const handleBulkImport = async () => {
    if (!csvData.trim()) {
      Alert.alert('Error', 'Please enter CSV data');
      return;
    }

    setLoading(true);
    try {
      const result = await AdvancedUserService.importUsersFromCSVAdvanced(csvData);
      
      Alert.alert(
        'Import Complete',
        `Success: ${result.success}\nFailed: ${result.failed}\n\n${
          result.errors.length > 0 
            ? `Errors:\n${result.errors.slice(0, 3).map(e => `Row ${e.row}: ${e.error}`).join('\n')}`
            : 'All users imported successfully!'
        }`
      );
      
      setShowBulkImport(false);
      setCsvData('');
      loadInitialData();
    } catch (error) {
      Alert.alert('Error', 'Failed to import users');
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    try {
      const filter: UserFilter = {
        searchTerm: searchTerm || undefined,
        role: selectedRole || undefined
      };
      
      const exported = await AdvancedUserService.exportUsersAdvanced(filter);
      
      Alert.alert(
        'Export Complete',
        `Exported ${filteredUsers.length} users\n\nCSV Length: ${exported.csv.length} characters\nJSON Length: ${exported.json.length} characters`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export users');
    }
  };

  const loadPerformanceStats = async () => {
    try {
      const monitor = PerformanceMonitor.getInstance();
      const data = await monitor.getPerformanceStats();
      setPerformanceData(data);
      setShowPerformanceStats(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load performance data');
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const security = SecurityService.getInstance();
      const logs = await security.getSecurityLogs(20);
      setSecurityLogs(logs);
      setShowSecurityLogs(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load security logs');
    }
  };

  const testNetworkPerformance = async () => {
    try {
      const monitor = PerformanceMonitor.getInstance();
      Alert.alert('Info', 'Testing network performance...');
      const result = await monitor.testNetworkPerformance();
      
      if (result) {
        Alert.alert(
          'Network Test Result',
          `Latency: ${result.latency}ms\nConnection Type: ${result.connectionType}`
        );
      } else {
        Alert.alert('Error', 'Network test failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test network');
    }
  };

  const triggerManualSync = async () => {
    try {
      Alert.alert('Info', 'Starting manual sync...');
      await LocalStorageService.triggerSync();
      Alert.alert('Success', 'Data synchronized across all devices!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
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
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Enhanced ERP Management</Text>
        
        {/* Cross-Device Sync Status */}
        <View style={styles.syncContainer}>
          <SyncStatusComponent showDetails={true} />
        </View>
      </View>

      {/* Sync Control Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cross-Device Synchronization</Text>
        <Text style={styles.syncDescription}>
          Your data automatically syncs across all devices. Use manual sync if you're experiencing issues.
        </Text>
        <TouchableOpacity style={styles.syncButton} onPress={triggerManualSync}>
          <Text style={styles.buttonText}>Force Manual Sync</Text>
        </TouchableOpacity>
      </View>

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
                  style={[
                    styles.roleButton,
                    selectedRole === role && styles.roleButtonActive
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    selectedRole === role && styles.roleButtonTextActive
                  ]}>
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

        <Text style={styles.resultCount}>
          Found {filteredUsers.length} users
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowBulkImport(true)}
          >
            <Text style={styles.actionButtonText}>Bulk Import</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={exportUsers}
          >
            <Text style={styles.actionButtonText}>Export Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={loadPerformanceStats}
          >
            <Text style={styles.actionButtonText}>Performance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={loadSecurityLogs}
          >
            <Text style={styles.actionButtonText}>Security Logs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={testNetworkPerformance}
          >
            <Text style={styles.actionButtonText}>Test Network</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bulk Import Modal */}
      <Modal
        visible={showBulkImport}
        animationType="slide"
        presentationStyle="pageSheet"
      >
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
            <Text style={styles.buttonText}>
              {loading ? 'Importing...' : 'Import Users'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Performance Stats Modal */}
      <Modal
        visible={showPerformanceStats}
        animationType="slide"
        presentationStyle="pageSheet"
      >
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
      <Modal
        visible={showSecurityLogs}
        animationType="slide"
        presentationStyle="pageSheet"
      >
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
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleString()}
                </Text>
                {log.details && (
                  <Text style={styles.logDetails}>
                    {JSON.stringify(log.details, null, 2)}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
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
});

export default AdminDashboard;
