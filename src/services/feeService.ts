// src/services/feeService.ts
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Fee } from '../types';
import { generateId } from '../utils/helpers';

export interface FeeRecord {
  studentId: string;
  amount: number;
  dueDate: Date;
  description: string;
  category: 'tuition' | 'library' | 'lab' | 'exam' | 'transport' | 'hostel' | 'other';
  semester?: string;
  academicYear?: string;
}

export interface FeePayment {
  feeId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'bank_transfer' | 'cheque';
  paymentRef?: string;
  remarks?: string;
  receivedBy: string;
}

export interface FeeStats {
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  overdueFees: number;
  collectionPercentage: number;
}

export const createFee = async (feeData: FeeRecord): Promise<string> => {
  try {
    const feeId = generateId();
    const feeRef = doc(db, 'fees', feeId);
    
    // Validate the due date
    if (!feeData.dueDate || isNaN(feeData.dueDate.getTime())) {
      throw new Error('Invalid due date provided');
    }
    
    const fee: Fee = {
      id: feeId,
      studentId: feeData.studentId,
      amount: feeData.amount,
      dueDate: Timestamp.fromDate(feeData.dueDate),
      description: feeData.description,
      category: feeData.category,
      semester: feeData.semester,
      academicYear: feeData.academicYear,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await setDoc(feeRef, fee);
    return feeId;
  } catch (error) {
    console.error('Error creating fee:', error);
    throw error;
  }
};

export const getAllFees = async (): Promise<Fee[]> => {
  try {
    const q = query(collection(db, 'fees'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Fee);
  } catch (error) {
    console.error('Error getting fees:', error);
    return [];
  }
};

export const getStudentFees = async (studentId: string): Promise<Fee[]> => {
  try {
    const q = query(
      collection(db, 'fees'),
      where('studentId', '==', studentId),
      orderBy('dueDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Fee);
  } catch (error) {
    console.error('Error getting student fees:', error);
    return [];
  }
};

export const getFeesByStatus = async (status: 'paid' | 'pending' | 'overdue'): Promise<Fee[]> => {
  try {
    const q = query(
      collection(db, 'fees'),
      where('status', '==', status),
      orderBy('dueDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Fee);
  } catch (error) {
    console.error('Error getting fees by status:', error);
    return [];
  }
};

export const getFeesByCategory = async (category: string): Promise<Fee[]> => {
  try {
    const q = query(
      collection(db, 'fees'),
      where('category', '==', category),
      orderBy('dueDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Fee);
  } catch (error) {
    console.error('Error getting fees by category:', error);
    return [];
  }
};

export const updateFee = async (feeId: string, updates: Partial<Fee>): Promise<boolean> => {
  try {
    const feeRef = doc(db, 'fees', feeId);
    await updateDoc(feeRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating fee:', error);
    return false;
  }
};

export const deleteFee = async (feeId: string): Promise<boolean> => {
  try {
    const feeRef = doc(db, 'fees', feeId);
    await deleteDoc(feeRef);
    return true;
  } catch (error) {
    console.error('Error deleting fee:', error);
    return false;
  }
};

export const processFeePayment = async (paymentData: FeePayment): Promise<boolean> => {
  try {
    const feeRef = doc(db, 'fees', paymentData.feeId);
    const feeDoc = await getDoc(feeRef);
    
    if (!feeDoc.exists()) {
      throw new Error('Fee record not found');
    }
    
    const fee = feeDoc.data() as Fee;
    
    // Update fee status
    await updateDoc(feeRef, {
      status: 'paid',
      paidAmount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentRef: paymentData.paymentRef,
      paidAt: Timestamp.now(),
      receivedBy: paymentData.receivedBy,
      remarks: paymentData.remarks,
      updatedAt: Timestamp.now(),
    });
    
    // Create payment record
    const paymentId = generateId();
    const paymentRef = doc(db, 'payments', paymentId);
    
    await setDoc(paymentRef, {
      id: paymentId,
      feeId: paymentData.feeId,
      studentId: fee.studentId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      paymentRef: paymentData.paymentRef,
      receivedBy: paymentData.receivedBy,
      remarks: paymentData.remarks,
      createdAt: Timestamp.now(),
    });
    
    return true;
  } catch (error) {
    console.error('Error processing payment:', error);
    return false;
  }
};

export const getFeeStats = async (): Promise<FeeStats> => {
  try {
    const fees = await getAllFees();
    
    const totalFees = fees.length;
    const paidFees = fees.filter(fee => fee.status === 'paid').length;
    const pendingFees = fees.filter(fee => fee.status === 'pending').length;
    const overdueFees = fees.filter(fee => fee.status === 'overdue').length;
    
    const collectionPercentage = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;
    
    return {
      totalFees,
      paidFees,
      pendingFees,
      overdueFees,
      collectionPercentage,
    };
  } catch (error) {
    console.error('Error calculating fee stats:', error);
    return {
      totalFees: 0,
      paidFees: 0,
      pendingFees: 0,
      overdueFees: 0,
      collectionPercentage: 0,
    };
  }
};

export const getStudentFeeStats = async (studentId: string): Promise<{
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  fees: Fee[];
}> => {
  try {
    const fees = await getStudentFees(studentId);
    
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = fees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + (fee.paidAmount || fee.amount), 0);
    const pendingAmount = fees
      .filter(fee => fee.status === 'pending')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const overdueAmount = fees
      .filter(fee => fee.status === 'overdue')
      .reduce((sum, fee) => sum + fee.amount, 0);
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      fees,
    };
  } catch (error) {
    console.error('Error calculating student fee stats:', error);
    return {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      fees: [],
    };
  }
};

export const bulkCreateFees = async (feesData: FeeRecord[]): Promise<boolean> => {
  try {
    const batch = writeBatch(db);
    
    for (const feeData of feesData) {
      const feeId = generateId();
      const feeRef = doc(db, 'fees', feeId);
      
      const fee: Fee = {
        id: feeId,
        studentId: feeData.studentId,
        amount: feeData.amount,
        dueDate: Timestamp.fromDate(feeData.dueDate),
        description: feeData.description,
        category: feeData.category,
        semester: feeData.semester,
        academicYear: feeData.academicYear,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      batch.set(feeRef, fee);
    }
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error bulk creating fees:', error);
    return false;
  }
};

export const updateOverdueFees = async (): Promise<number> => {
  try {
    const pendingFeesQuery = query(
      collection(db, 'fees'),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(pendingFeesQuery);
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    const today = new Date();
    
    querySnapshot.docs.forEach((docSnapshot) => {
      const fee = docSnapshot.data() as Fee;
      const dueDate = fee.dueDate.toDate();
      
      if (dueDate < today) {
        batch.update(docSnapshot.ref, {
          status: 'overdue',
          updatedAt: Timestamp.now(),
        });
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error updating overdue fees:', error);
    return 0;
  }
};

export const generateFeeReport = async (
  startDate: Date,
  endDate: Date,
  category?: string
): Promise<{
  totalCollection: number;
  totalPending: number;
  categoryBreakdown: Record<string, { collected: number; pending: number; count: number }>;
  monthlyCollection: { month: string; amount: number }[];
}> => {
  try {
    let q = query(
      collection(db, 'fees'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );
    
    if (category) {
      q = query(
        collection(db, 'fees'),
        where('category', '==', category),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
    }
    
    const querySnapshot = await getDocs(q);
    const fees = querySnapshot.docs.map(doc => doc.data() as Fee);
    
    // Calculate totals
    const totalCollection = fees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + (fee.paidAmount || fee.amount), 0);
    
    const totalPending = fees
      .filter(fee => fee.status !== 'paid')
      .reduce((sum, fee) => sum + fee.amount, 0);
    
    // Category breakdown
    const categoryBreakdown: Record<string, { collected: number; pending: number; count: number }> = {};
    
    fees.forEach(fee => {
      if (!categoryBreakdown[fee.category]) {
        categoryBreakdown[fee.category] = { collected: 0, pending: 0, count: 0 };
      }
      
      categoryBreakdown[fee.category].count++;
      
      if (fee.status === 'paid') {
        categoryBreakdown[fee.category].collected += fee.paidAmount || fee.amount;
      } else {
        categoryBreakdown[fee.category].pending += fee.amount;
      }
    });
    
    // Monthly collection
    const monthlyData: Record<string, number> = {};
    
    fees.filter(fee => fee.status === 'paid' && fee.paidAt).forEach(fee => {
      const month = fee.paidAt.toDate().toISOString().substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + (fee.paidAmount || fee.amount);
    });
    
    const monthlyCollection = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return {
      totalCollection,
      totalPending,
      categoryBreakdown,
      monthlyCollection,
    };
  } catch (error) {
    console.error('Error generating fee report:', error);
    return {
      totalCollection: 0,
      totalPending: 0,
      categoryBreakdown: {},
      monthlyCollection: [],
    };
  }
};
