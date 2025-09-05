// src/services/fees.ts
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Fee } from '../types';

export const createFeeRecord = async (feeData: Omit<Fee, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const docRef = await addDoc(collection(db, 'fees'), {
      ...feeData,
      createdAt: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating fee record:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getStudentFees = async (studentId: string): Promise<Fee[]> => {
  try {
    const q = query(
      collection(db, 'fees'),
      where('studentId', '==', studentId),
      orderBy('dueDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Fee));
  } catch (error) {
    console.error('Error fetching student fees:', error);
    return [];
  }
};

export const updateFeePayment = async (
  feeId: string,
  paymentRef: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const feeRef = doc(db, 'fees', feeId);
    await updateDoc(feeRef, {
      status: 'paid',
      paymentRef,
      paidAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating fee payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getPendingFees = async (): Promise<Fee[]> => {
  try {
    const q = query(
      collection(db, 'fees'),
      where('status', '==', 'pending'),
      orderBy('dueDate', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Fee));
  } catch (error) {
    console.error('Error fetching pending fees:', error);
    return [];
  }
};
