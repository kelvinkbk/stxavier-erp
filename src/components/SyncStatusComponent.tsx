import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LocalStorageService } from '../services/localStorage';
import CloudSyncService, { SyncStatus } from '../services/CloudSyncService';

interface SyncStatusComponentProps {
  style?: any;
  showDetails?: boolean;
}

const SyncStatusComponent: React.FC<SyncStatusComponentProps> = ({ 
  style, 
  showDetails = false 
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Get initial sync status
    updateSyncStatus();
    
    // Update sync status every 10 seconds
    const interval = setInterval(updateSyncStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const updateSyncStatus = () => {
    const cloudSync = CloudSyncService.getInstance();
    const status = cloudSync.getSyncStatus();
    setSyncStatus(status);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await LocalStorageService.triggerSync();
      updateSyncStatus();
      Alert.alert(
        'Sync Complete', 
        'Your data has been synchronized across all devices!'
      );
    } catch (error) {
      Alert.alert(
        'Sync Failed', 
        'Unable to sync data. Please check your internet connection.'
      );
    } finally {
      setSyncing(false);
    }
  };

  const getSyncStatusColor = () => {
    if (!syncStatus) return '#999';
    if (syncStatus.syncInProgress || syncing) return '#FF9500';
    if (!syncStatus.isOnline) return '#FF3B30';
    if (syncStatus.pendingChanges > 0) return '#FF9500';
    return '#34C759';
  };

  const getSyncStatusText = () => {
    if (!syncStatus) return 'Unknown';
    if (syncStatus.syncInProgress || syncing) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} pending`;
    return 'Synced';
  };

  const getLastSyncText = () => {
    if (!syncStatus) return '';
    const now = new Date();
    const lastSync = new Date(syncStatus.lastSync);
    const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!showDetails) {
    // Compact sync indicator
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, style]} 
        onPress={handleManualSync}
        disabled={syncing}
      >
        <View style={[styles.syncDot, { backgroundColor: getSyncStatusColor() }]} />
        <Text style={styles.compactText}>{getSyncStatusText()}</Text>
        {syncing && <ActivityIndicator size="small" color="#666" style={{ marginLeft: 5 }} />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View style={[styles.syncDot, { backgroundColor: getSyncStatusColor() }]} />
          <Text style={styles.statusText}>{getSyncStatusText()}</Text>
          {syncing && <ActivityIndicator size="small" color="#666" style={{ marginLeft: 10 }} />}
        </View>
        
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleManualSync}
          disabled={syncing}
        >
          <Text style={styles.syncButtonText}>
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {syncStatus && (
        <View style={styles.details}>
          <Text style={styles.detailText}>
            Last sync: {getLastSyncText()}
          </Text>
          {syncStatus.lastError && (
            <Text style={styles.errorText}>
              Error: {syncStatus.lastError.length > 50 
                ? syncStatus.lastError.substring(0, 50) + '...' 
                : syncStatus.lastError}
            </Text>
          )}
          {syncStatus.pendingChanges > 0 && (
            <Text style={styles.pendingText}>
              {syncStatus.pendingChanges} operation(s) pending
            </Text>
          )}
          {syncStatus.autoRefreshEnabled && syncStatus.nextRefresh && (
            <Text style={styles.detailText}>
              Next auto-refresh: {new Date(syncStatus.nextRefresh).toLocaleTimeString()}
            </Text>
          )}
          <Text style={styles.detailText}>
            Status: {syncStatus.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 5,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  compactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  syncButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  pendingText: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '600',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default SyncStatusComponent;
