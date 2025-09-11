// src/screens/Student/FeesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Fee } from '../../types';

interface FeeDisplay extends Fee {
  formattedDueDate: string;
  formattedPaidAt?: string;
  isOverdue: boolean;
}

export default function FeesScreen() {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      if (!user?.uid) return;

      const q = query(
        collection(db, 'fees'),
        where('studentId', '==', user.uid),
        orderBy('dueDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const feesData = querySnapshot.docs.map(doc => {
        const data = doc.data() as Fee;
        const dueDate = data.dueDate?.toDate() || new Date();
        const paidAt = data.paidAt?.toDate();
        
        return {
          ...data,
          id: doc.id,
          formattedDueDate: dueDate.toLocaleDateString(),
          formattedPaidAt: paidAt?.toLocaleDateString(),
          isOverdue: data.status === 'pending' && dueDate < new Date(),
        } as FeeDisplay;
      });

      setFees(feesData);
    } catch (error) {
      console.error('Error loading fees:', error);
      Alert.alert('Error', 'Failed to load fees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFees();
  };

  const getFilteredFees = () => {
    switch (selectedFilter) {
      case 'pending':
        return fees.filter(fee => fee.status === 'pending');
      case 'paid':
        return fees.filter(fee => fee.status === 'paid');
      default:
        return fees;
    }
  };

  const getTotalStats = () => {
    const totalPending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.paidAmount || f.amount), 0);
    const overdueCount = fees.filter(f => f.isOverdue).length;

    return { totalPending, totalPaid, overdueCount };
  };

  const handlePaymentInquiry = (fee: FeeDisplay) => {
    Alert.alert(
      'Payment Information',
      `For payment of ${fee.description} (₹${fee.amount}), please contact the accounts office or use the online payment portal.\n\nDue Date: ${fee.formattedDueDate}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'Contact Office', onPress: () => Alert.alert('Contact', 'Phone: +91-XXXX-XXXX\nEmail: accounts@college.edu') }
      ]
    );
  };

  const renderFeeCard = ({ item }: { item: FeeDisplay }) => {
    const getStatusColor = () => {
      if (item.status === 'paid') return '#4caf50';
      if (item.isOverdue) return '#f44336';
      return '#ff9800';
    };

    const getStatusText = () => {
      if (item.status === 'paid') return 'PAID';
      if (item.isOverdue) return 'OVERDUE';
      return 'PENDING';
    };

    return (
      <Card style={styles.feeCard}>
        <View style={styles.feeHeader}>
          <View style={styles.feeInfo}>
            <Text style={styles.feeDescription}>{item.description}</Text>
            <Text style={styles.feeCategory}>{item.category.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.feeDetails}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount:</Text>
            <Text style={styles.amountValue}>₹{item.amount}</Text>
          </View>
          
          {item.status === 'paid' && item.paidAmount && item.paidAmount !== item.amount && (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Paid:</Text>
              <Text style={[styles.amountValue, { color: '#4caf50' }]}>₹{item.paidAmount}</Text>
            </View>
          )}

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date:</Text>
            <Text style={[styles.dateValue, item.isOverdue && { color: '#f44336' }]}>
              {item.formattedDueDate}
            </Text>
          </View>

          {item.formattedPaidAt && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Paid On:</Text>
              <Text style={styles.dateValue}>{item.formattedPaidAt}</Text>
            </View>
          )}

          {item.paymentMethod && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Payment Method:</Text>
              <Text style={styles.dateValue}>{item.paymentMethod.replace('_', ' ').toUpperCase()}</Text>
            </View>
          )}

          {item.paymentRef && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Reference:</Text>
              <Text style={styles.dateValue}>{item.paymentRef}</Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePaymentInquiry(item)}
          >
            <Text style={styles.payButtonText}>Payment Info</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  const stats = getTotalStats();
  const filteredFees = getFilteredFees();

  if (loading && fees.length === 0) {
    return <LoadingSpinner message="Loading fees..." />;
  }

  return (
    <View style={styles.container}>
      {/* Stats Summary */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Fee Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f44336' }]}>₹{stats.totalPending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>₹{stats.totalPaid}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff9800' }]}>{stats.overdueCount}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </Card>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'paid'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter as any)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fees List */}
      <FlatList
        data={filteredFees}
        renderItem={renderFeeCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' ? 'No fees found' : `No ${selectedFilter} fees`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    margin: 16,
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#1976d2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  feeCard: {
    marginBottom: 12,
    padding: 16,
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
  feeDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  feeCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  feeDetails: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
  payButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
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
});
