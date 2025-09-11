// src/screens/Admin/NoticesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';
import { collection, addDoc, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  audience: string[];
  createdBy: string;
  formattedDate: string;
}

export default function NoticesScreen() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: ['all'] as string[],
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const noticesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate() || new Date();
        
        return {
          id: doc.id,
          ...data,
          formattedDate: createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString(),
        } as Notice;
      });

      setNotices(noticesData);
    } catch (error) {
      console.error('Error loading notices:', error);
      Alert.alert('Error', 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'notices'), {
        title: formData.title.trim(),
        content: formData.content.trim(),
        audience: formData.audience,
        createdBy: user?.email,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Notice created successfully');
      setFormData({ title: '', content: '', audience: ['all'] });
      setShowCreateModal(false);
      loadNotices();
    } catch (error) {
      console.error('Error creating notice:', error);
      Alert.alert('Error', 'Failed to create notice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this notice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'notices', noticeId));
              Alert.alert('Success', 'Notice deleted');
              loadNotices();
            } catch (error) {
              console.error('Error deleting notice:', error);
              Alert.alert('Error', 'Failed to delete notice');
            }
          },
        },
      ]
    );
  };

  const toggleAudience = (audienceType: string) => {
    if (audienceType === 'all') {
      setFormData({ ...formData, audience: ['all'] });
    } else {
      const currentAudience = formData.audience.filter(a => a !== 'all');
      if (currentAudience.includes(audienceType)) {
        const newAudience = currentAudience.filter(a => a !== audienceType);
        setFormData({ 
          ...formData, 
          audience: newAudience.length > 0 ? newAudience : ['all'] 
        });
      } else {
        setFormData({ ...formData, audience: [...currentAudience, audienceType] });
      }
    }
  };

  const renderNoticeCard = ({ item }: { item: Notice }) => (
    <Card style={styles.noticeCard}>
      <View style={styles.noticeHeader}>
        <View style={styles.noticeInfo}>
          <Text style={styles.noticeTitle}>{item.title}</Text>
          <Text style={styles.noticeDate}>{item.formattedDate}</Text>
          <Text style={styles.noticeBy}>By: {item.createdBy}</Text>
        </View>
        {user?.role === 'admin' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNotice(item.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.noticeContent}>{item.content}</Text>
      
      <View style={styles.audienceContainer}>
        <Text style={styles.audienceLabel}>Audience: </Text>
        {item.audience.map((aud, index) => (
          <View key={aud} style={styles.audienceBadge}>
            <Text style={styles.audienceText}>
              {aud.charAt(0).toUpperCase() + aud.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );

  if (loading && notices.length === 0) {
    return <LoadingSpinner message="Loading notices..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notices & Announcements</Text>
        {user?.role === 'admin' && (
          <Button
            title="Create Notice"
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          />
        )}
      </View>

      <FlatList
        data={notices}
        renderItem={renderNoticeCard}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notices available</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Notice Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Notice</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter notice title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                placeholder="Enter notice content"
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Audience</Text>
              <View style={styles.audienceOptions}>
                {['all', 'students', 'faculty'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.audienceOption,
                      formData.audience.includes(option) && styles.selectedAudienceOption
                    ]}
                    onPress={() => toggleAudience(option)}
                  >
                    <Text style={[
                      styles.audienceOptionText,
                      formData.audience.includes(option) && styles.selectedAudienceText
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Create Notice"
              onPress={handleCreateNotice}
              loading={loading}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4caf50',
  },
  listContainer: {
    padding: 16,
  },
  noticeCard: {
    marginBottom: 16,
    padding: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  noticeDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  noticeBy: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noticeContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  audienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  audienceLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  audienceBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  audienceText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  audienceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAudienceOption: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  audienceOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedAudienceText: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#4caf50',
  },
});
