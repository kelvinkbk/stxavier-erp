import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalStorageService } from '../services/localStorage';
import CloudSyncService from '../services/CloudSyncService';

interface SyncDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

const SyncDebugPanel: React.FC<SyncDebugPanelProps> = ({ visible, onClose }) => {
  const [syncDetails, setSyncDetails] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const cloudSync = CloudSyncService.getInstance();

  useEffect(() => {
    if (visible) {
      loadSyncDetails();
    }
  }, [visible]);

  const loadSyncDetails = () => {
    const details = cloudSync.getSyncDetails();
    setSyncDetails(details);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadSyncDetails();
    setRefreshing(false);
  };

  const runSyncTest = async () => {
    const results: string[] = [];
    
    try {
      results.push('🧪 Starting sync diagnostic tests...');
      
      // Test 1: Network connectivity
      const syncStatus = cloudSync.getSyncStatus();
      results.push(`📶 Network Status: ${syncStatus.isOnline ? 'ONLINE' : 'OFFLINE'}`);
      
      // Test 2: Local storage read/write
      try {
        await LocalStorageService.saveData('test_key', { test: 'data' });
        const testData = await LocalStorageService.getData('test_key');
        results.push(`💾 Local Storage: ${testData ? 'WORKING' : 'FAILED'}`);
        await LocalStorageService.removeData('test_key');
      } catch (error) {
        results.push(`💾 Local Storage: FAILED - ${error}`);
      }
      
      // Test 3: Cloud connectivity
      try {
        const users = await cloudSync.getAllUsersFromCloud();
        results.push(`☁️ Cloud Read: WORKING (${users.length} users)`);
      } catch (error) {
        results.push(`☁️ Cloud Read: FAILED - ${error}`);
      }
      
      // Test 4: Pending sync queue
      const pendingCount = syncDetails?.pendingQueue?.length || 0;
      results.push(`📤 Pending Syncs: ${pendingCount} operations`);
      
      // Test 5: Auto-refresh status
      const autoRefreshStatus = cloudSync.getAutoRefreshStatus();
      results.push(`🔄 Auto-refresh: ${autoRefreshStatus.enabled ? 'ENABLED' : 'DISABLED'}`);
      
      // Test 6: Force sync test
      if (pendingCount > 0) {
        try {
          await cloudSync.forceSyncPending();
          results.push(`🔨 Force Sync: COMPLETED`);
        } catch (error) {
          results.push(`🔨 Force Sync: FAILED - ${error}`);
        }
      }
      
      results.push('✅ Diagnostic tests completed');
      
    } catch (error) {
      results.push(`❌ Test suite failed: ${error}`);
    }
    
    setTestResults(results);
    loadSyncDetails(); // Refresh details after test
  };

  const clearError = () => {
    cloudSync.clearError();
    loadSyncDetails();
    Alert.alert('Success', 'Error state cleared');
  };

  const forceSyncAll = async () => {
    try {
      await cloudSync.forceSyncPending();
      await LocalStorageService.triggerSync();
      loadSyncDetails();
      Alert.alert('Success', 'Force sync completed');
    } catch (error) {
      Alert.alert('Error', `Force sync failed: ${error}`);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.headerText}>🔧 Sync Debug Panel</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {syncDetails && (
            <>
              {/* Sync Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Sync Status</Text>
                <View style={styles.statusGrid}>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <Text style={[styles.statusValue, { 
                      color: syncDetails.status.syncInProgress ? '#ff9500' : '#34c759' 
                    }]}>
                      {syncDetails.status.syncInProgress ? 'SYNCING' : 'IDLE'}
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Network</Text>
                    <Text style={[styles.statusValue, { 
                      color: syncDetails.status.isOnline ? '#34c759' : '#ff3b30' 
                    }]}>
                      {syncDetails.status.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Auto-Refresh</Text>
                    <Text style={[styles.statusValue, { 
                      color: syncDetails.status.autoRefreshEnabled ? '#34c759' : '#666' 
                    }]}>
                      {syncDetails.status.autoRefreshEnabled ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>Pending</Text>
                    <Text style={[styles.statusValue, { 
                      color: syncDetails.status.pendingChanges > 0 ? '#ff9500' : '#34c759' 
                    }]}>
                      {syncDetails.status.pendingChanges}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Error Status */}
              {syncDetails.status.lastError && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>❌ Last Error</Text>
                  <Text style={styles.errorText}>{syncDetails.status.lastError}</Text>
                  <Text style={styles.metaText}>
                    Retry Count: {syncDetails.status.retryCount}
                  </Text>
                </View>
              )}

              {/* Timing Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏰ Timing Info</Text>
                <Text style={styles.metaText}>
                  Last Sync: {syncDetails.status.lastSync.toLocaleString()}
                </Text>
                {syncDetails.status.nextRefresh && (
                  <Text style={styles.metaText}>
                    Next Refresh: {syncDetails.status.nextRefresh.toLocaleString()}
                  </Text>
                )}
              </View>

              {/* Pending Operations */}
              {syncDetails.pendingQueue.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📤 Pending Operations</Text>
                  {syncDetails.pendingQueue.map((item: any, index: number) => (
                    <View key={index} style={styles.pendingItem}>
                      <Text style={styles.pendingText}>
                        {item.operation.toUpperCase()} - {item.id}
                      </Text>
                      <Text style={styles.metaText}>
                        Retries: {item.retryCount} | {new Date(item.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Active Listeners */}
              {syncDetails.activeListeners.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📡 Active Listeners</Text>
                  {syncDetails.activeListeners.map((listener: string, index: number) => (
                    <Text key={index} style={styles.listenerText}>• {listener}</Text>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧪 Test Results</Text>
              {testResults.map((result, index) => (
                <Text key={index} style={styles.testResult}>{result}</Text>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={runSyncTest}>
            <Text style={styles.actionText}>🧪 Run Tests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={forceSyncAll}>
            <Text style={styles.actionText}>🔨 Force Sync</Text>
          </TouchableOpacity>
          
          {syncDetails?.status.lastError && (
            <TouchableOpacity style={styles.actionButton} onPress={clearError}>
              <Text style={styles.actionText}>🧹 Clear Error</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 4,
  },
  metaText: {
    color: '#666',
    fontSize: 12,
  },
  pendingItem: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  pendingText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  listenerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  testResult: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SyncDebugPanel;
