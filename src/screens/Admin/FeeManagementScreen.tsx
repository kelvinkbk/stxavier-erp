// src/screens/Admin/FeeManagementScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Fee, Student } from '../../types';
import {
  getAllFees,
  createFee,
  updateFee,
  deleteFee,
  processFeePayment,
  getFeeStats,
  getStudentFees,
  bulkCreateFees,
  getFeesByStatus,
  FeeRecord,
  FeePayment,
} from '../../services/feeService';
import StudentService from '../../services/studentService';
import { useAuth } from '../../utils/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function FeeManagementScreen() {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    overdueFees: 0,
    collectionPercentage: 0,
  });

  // Form states
  const [formData, setFormData] = useState(() => {
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const formattedDate = defaultDueDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return {
      studentId: '',
      amount: '',
      dueDate: formattedDate,
      description: '',
      category: 'tuition' as const,
      semester: '',
      academicYear: '',
    };
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash' as const,
    paymentRef: '',
    remarks: '',
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load fees based on filter
      let feesData: Fee[] = [];
      if (filterStatus === 'all') {
        feesData = await getAllFees();
      } else {
        feesData = await getFeesByStatus(filterStatus);
      }
      
      setFees(feesData);
      
      // Load students
      const studentsData = await StudentService.getAllStudents();
      setStudents(studentsData);
      
      // Load stats
      const statsData = await getFeeStats();
      setStats(statsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddFee = async () => {
    try {
      if (!formData.studentId || !formData.amount || !formData.dueDate || !formData.description) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      // Validate and parse the due date
      let dueDate: Date;
      if (formData.dueDate) {
        dueDate = new Date(formData.dueDate);
        // Check if the date is valid
        if (isNaN(dueDate.getTime())) {
          Alert.alert('Error', 'Please enter a valid due date (YYYY-MM-DD format)');
          return;
        }
      } else {
        // Default to 30 days from now if no date provided
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
      }

      const feeRecord: FeeRecord = {
        studentId: formData.studentId,
        amount: parseFloat(formData.amount),
        dueDate: dueDate,
        description: formData.description,
        category: formData.category,
        semester: formData.semester,
        academicYear: formData.academicYear,
      };

      await createFee(feeRecord);
      Alert.alert('Success', 'Fee added successfully');
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error adding fee:', error);
      Alert.alert('Error', 'Failed to add fee');
    }
  };

  const handleProcessPayment = async () => {
    try {
      if (!selectedFee || !paymentData.amount) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }

      const payment: FeePayment = {
        feeId: selectedFee.id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentRef: paymentData.paymentRef,
        remarks: paymentData.remarks,
        receivedBy: user?.uid || '',
      };

      const success = await processFeePayment(payment);
      
      if (success) {
        Alert.alert('Success', 'Payment processed successfully');
        setShowPaymentModal(false);
        setSelectedFee(null);
        resetPaymentForm();
        loadData();
      } else {
        Alert.alert('Error', 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const handleDeleteFee = (fee: Fee) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this fee for ${getStudentName(fee.studentId)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteFee(fee.id);
            if (success) {
              Alert.alert('Success', 'Fee deleted successfully');
              loadData();
            } else {
              Alert.alert('Error', 'Failed to delete fee');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    const formattedDate = defaultDueDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    setFormData({
      studentId: '',
      amount: '',
      dueDate: formattedDate,
      description: '',
      category: 'tuition',
      semester: '',
      academicYear: '',
    });
  };

  const resetPaymentForm = () => {
    setPaymentData({
      amount: '',
      paymentMethod: 'cash',
      paymentRef: '',
      remarks: '',
    });
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'overdue': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  const filteredFees = fees.filter(fee => {
    const studentName = getStudentName(fee.studentId).toLowerCase();
    const description = fee.description.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return studentName.includes(query) || description.includes(query);
  });

  const renderFeeItem = ({ item }: { item: Fee }) => (
    <Card style={styles.feeCard}>
      <View style={styles.feeHeader}>
        <View style={styles.feeInfo}>
          <Text style={styles.studentName}>{getStudentName(item.studentId)}</Text>
          <Text style={styles.feeDescription}>{item.description}</Text>
          <Text style={styles.feeDetails}>
            ₹{item.amount} • {item.category} • Due: {formatDate(item.dueDate.toDate())}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.feeActions}>
        {item.status !== 'paid' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={() => {
              setSelectedFee(item);
              setPaymentData(prev => ({ ...prev, amount: item.amount.toString() }));
              setShowPaymentModal(true);
            }}
          >
            <Text style={styles.actionButtonText}>Pay</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteFee(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading fees..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fee Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Fee</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Collection Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>{stats.paidFees}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff9800' }]}>{stats.pendingFees}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f44336' }]}>{stats.overdueFees}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.collectionPercentage}%</Text>
            <Text style={styles.statLabel}>Collection</Text>
          </View>
        </View>
      </Card>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'paid', 'overdue'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.activeFilterTab,
            ]}
            onPress={() => setFilterStatus(status as any)}
          >
            <Text style={[
              styles.filterTabText,
              filterStatus === status && styles.activeFilterTabText,
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student name or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Fees List */}
      <FlatList
        data={filteredFees}
        renderItem={renderFeeItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No fees found</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Fee Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Fee</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Student Selection */}
            <Text style={styles.fieldLabel}>Student *</Text>
            <View style={styles.pickerContainer}>
              {/* Simple text input for demo - in real app, use a proper picker */}
              <TextInput
                style={styles.input}
                placeholder="Select student..."
                value={formData.studentId}
                onChangeText={(text) => setFormData(prev => ({ ...prev, studentId: text }))}
              />
            </View>
            
            <Text style={styles.fieldLabel}>Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={formData.amount}
              onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
              keyboardType="numeric"
            />
            
            <Text style={styles.fieldLabel}>Due Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.dueDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
            />
            
            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={styles.input}
              placeholder="Fee description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />
            
            <Text style={styles.fieldLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="tuition"
              value={formData.category}
              onChangeText={(text) => setFormData(prev => ({ ...prev, category: text as any }))}
            />
            
            <Text style={styles.fieldLabel}>Semester</Text>
            <TextInput
              style={styles.input}
              placeholder="Semester"
              value={formData.semester}
              onChangeText={(text) => setFormData(prev => ({ ...prev, semester: text }))}
            />
            
            <Text style={styles.fieldLabel}>Academic Year</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-25"
              value={formData.academicYear}
              onChangeText={(text) => setFormData(prev => ({ ...prev, academicYear: text }))}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title="Add Fee"
              onPress={handleAddFee}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Process Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedFee && (
            <View style={styles.modalContent}>
              <Card style={styles.feeInfoCard}>
                <Text style={styles.feeInfoTitle}>Fee Details</Text>
                <Text>Student: {getStudentName(selectedFee.studentId)}</Text>
                <Text>Description: {selectedFee.description}</Text>
                <Text>Amount: ₹{selectedFee.amount}</Text>
              </Card>
              
              <Text style={styles.fieldLabel}>Payment Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter payment amount"
                value={paymentData.amount}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, amount: text }))}
                keyboardType="numeric"
              />
              
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <TextInput
                style={styles.input}
                placeholder="cash"
                value={paymentData.paymentMethod}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, paymentMethod: text as any }))}
              />
              
              <Text style={styles.fieldLabel}>Payment Reference</Text>
              <TextInput
                style={styles.input}
                placeholder="Transaction ID or reference"
                value={paymentData.paymentRef}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, paymentRef: text }))}
              />
              
              <Text style={styles.fieldLabel}>Remarks</Text>
              <TextInput
                style={styles.input}
                placeholder="Additional notes"
                value={paymentData.remarks}
                onChangeText={(text) => setPaymentData(prev => ({ ...prev, remarks: text }))}
                multiline
              />
            </View>
          )}
          
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setShowPaymentModal(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title="Process Payment"
              onPress={handleProcessPayment}
              style={styles.modalButton}
            />
          </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#2196f3',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listContainer: {
    padding: 16,
  },
  feeCard: {
    marginBottom: 12,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feeInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  feeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  feeDetails: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  feeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  feeInfoCard: {
    marginBottom: 16,
  },
  feeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
