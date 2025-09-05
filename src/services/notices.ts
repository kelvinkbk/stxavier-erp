// src/services/notices.ts
import { collection, addDoc, query, where, getDocs, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Notice } from '../types';

export const createNotice = async (noticeData: Omit<Notice, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const docRef = await addDoc(collection(db, 'notices'), {
      ...noticeData,
      createdAt: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating notice:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getNoticesForUser = async (userRole: 'admin' | 'faculty' | 'student'): Promise<Notice[]> => {
  try {
    const q = query(
      collection(db, 'notices'),
      where('audience', 'array-contains-any', ['all', userRole]),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notice));
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
};

export const getAllNotices = async (): Promise<Notice[]> => {
  try {
    const q = query(
      collection(db, 'notices'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notice));
  } catch (error) {
    console.error('Error fetching all notices:', error);
    return [];
  }
};
