import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { LocalStorageService } from '../services/localStorage';

interface AutoRefreshSettingsProps {
  style?: any;
}

const AutoRefreshSettings: React.FC<AutoRefreshSettingsProps> = ({ style }) => {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [customInterval, setCustomInterval] = useState('30');

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    const status = LocalStorageService.getAutoRefreshStatus();
    setAutoRefreshEnabled(status.enabled);
    setRefreshInterval(status.interval / 1000); // Convert to seconds
    setNextRefresh(status.nextRefresh);
    setLastRefresh(status.lastRefresh);
  };

  const toggleAutoRefresh = async () => {
    try {
      if (autoRefreshEnabled) {
        LocalStorageService.stopAutoRefresh();
        Alert.alert('Auto-Refresh Disabled', 'Data will no longer refresh automatically');
      } else {
        LocalStorageService.startAutoRefresh(refreshInterval * 1000);
        Alert.alert('Auto-Refresh Enabled', `Data will refresh every ${refreshInterval} seconds`);
      }
      updateStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle auto-refresh');
    }
  };

  const handleForceRefresh = async () => {
    try {
      Alert.alert('Refreshing...', 'Forcing data refresh now');
      await LocalStorageService.forceRefresh();
      Alert.alert('Success', 'Data refreshed successfully!');
      updateStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    }
  };

  const handleIntervalChange = () => {
    const newInterval = parseInt(customInterval);
    if (isNaN(newInterval) || newInterval < 5) {
      Alert.alert('Invalid Interval', 'Please enter a number greater than 5 seconds');
      return;
    }

    LocalStorageService.setAutoRefreshInterval(newInterval * 1000);
    setRefreshInterval(newInterval);
    setShowSettings(false);
    
    if (autoRefreshEnabled) {
      Alert.alert('Interval Updated', `Auto-refresh now set to ${newInterval} seconds`);
    }
    updateStatus();
  };

  const getTimeUntilNext = (): string => {
    if (!nextRefresh || !autoRefreshEnabled) return 'N/A';
    
    const now = new Date();
    const diff = nextRefresh.getTime() - now.getTime();
    
    if (diff <= 0) return 'Refreshing...';
    
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString();
  };

  const presetIntervals = [
    { label: '10 seconds', value: 10 },
    { label: '30 seconds', value: 30 },
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 }
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 Auto-Refresh</Text>
        <Switch
          value={autoRefreshEnabled}
          onValueChange={toggleAutoRefresh}
          trackColor={{ false: '#767577', true: '#34C759' }}
          thumbColor={autoRefreshEnabled ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusValue,
            { color: autoRefreshEnabled ? '#34C759' : '#FF6B6B' }
          ]}>
            {autoRefreshEnabled ? '✅ Active' : '⏹️ Disabled'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Interval:</Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Text style={[styles.statusValue, styles.clickable]}>
              {refreshInterval}s ⚙️
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Next refresh:</Text>
          <Text style={styles.statusValue}>{getTimeUntilNext()}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Last refresh:</Text>
          <Text style={styles.statusValue}>{formatTime(lastRefresh)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleForceRefresh}>
        <Text style={styles.refreshButtonText}>🔄 Refresh Now</Text>
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Auto-Refresh Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Preset Intervals</Text>
          {presetIntervals.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetButton,
                refreshInterval === preset.value && styles.presetButtonActive
              ]}
              onPress={() => {
                setCustomInterval(preset.value.toString());
                LocalStorageService.setAutoRefreshInterval(preset.value * 1000);
                setRefreshInterval(preset.value);
                updateStatus();
              }}
            >
              <Text style={[
                styles.presetButtonText,
                refreshInterval === preset.value && styles.presetButtonTextActive
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Custom Interval</Text>
          <View style={styles.customContainer}>
            <TextInput
              style={styles.customInput}
              value={customInterval}
              onChangeText={setCustomInterval}
              placeholder="Enter seconds"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleIntervalChange}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            Minimum interval: 5 seconds{'\n'}
            Lower intervals may impact performance and battery life.
          </Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  clickable: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    marginBottom: 10,
  },
  presetButton: {
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  presetButtonActive: {
    backgroundColor: '#007AFF',
  },
  presetButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  presetButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  customContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#666',
    margin: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default AutoRefreshSettings;
