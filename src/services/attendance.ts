// src/services/attendance.ts
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
} from 'firebase/firestore';
import { db } from '../firebase';
import { Attendance } from '../types';
import { generateId } from '../utils/helpers';

export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

export interface AttendanceSubmission {
  success: boolean;
  error?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

export const markAttendance = async (
  classId: string,
  date: string,
  attendanceData: AttendanceRecord[],
  markedBy: string
): Promise<AttendanceSubmission> => {
  try {
    const batch = writeBatch(db);
    
    for (const record of attendanceData) {
      const attendanceId = `${record.studentId}_${date}`;
      const attendanceRef = doc(db, 'attendance', attendanceId);
      
      const attendanceDoc: Attendance = {
        id: attendanceId,
        studentId: record.studentId,
        date,
        status: record.status,
        classId,
        markedBy,
        markedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      batch.set(attendanceRef, attendanceDoc, { merge: true });
    }
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark attendance',
    };
  }
};

export const getClassAttendance = async (
  classId: string,
  date: string
): Promise<Attendance[]> => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('date', '==', date),
      classId !== 'all' ? where('classId', '==', classId) : where('classId', '!=', null)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Attendance);
  } catch (error) {
    console.error('Error getting class attendance:', error);
    return [];
  }
};

export const getStudentAttendance = async (
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<Attendance[]> => {
  try {
    let q = query(
      collection(db, 'attendance'),
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );
    
    if (startDate && endDate) {
      q = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Attendance);
  } catch (error) {
    console.error('Error getting student attendance:', error);
    return [];
  }
};

export const getAttendanceStats = async (
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceStats> => {
  try {
    const attendanceRecords = await getStudentAttendance(studentId, startDate, endDate);
    
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'late').length;
    
    const attendancePercentage = totalDays > 0 
      ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) 
      : 0;
    
    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage,
    };
  } catch (error) {
    console.error('Error calculating attendance stats:', error);
    return {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      attendancePercentage: 0,
    };
  }
};

export const getAttendanceByDateRange = async (
  startDate: string,
  endDate: string,
  classId?: string
): Promise<Attendance[]> => {
  try {
    let q = query(
      collection(db, 'attendance'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    if (classId && classId !== 'all') {
      q = query(
        collection(db, 'attendance'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        where('classId', '==', classId),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Attendance);
  } catch (error) {
    console.error('Error getting attendance by date range:', error);
    return [];
  }
};

export const updateAttendanceRecord = async (
  attendanceId: string,
  updates: Partial<Attendance>
): Promise<boolean> => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    await updateDoc(attendanceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return false;
  }
};

export const deleteAttendanceRecord = async (attendanceId: string): Promise<boolean> => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    await deleteDoc(attendanceRef);
    return true;
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return false;
  }
};

export const getClassAttendanceReport = async (
  classId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalStudents: number;
  averageAttendance: number;
  dailyStats: {
    date: string;
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  }[];
}> => {
  try {
    const attendanceRecords = await getAttendanceByDateRange(startDate, endDate, classId);
    
    // Group by date
    const dateGroups = attendanceRecords.reduce((groups, record) => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    }, {} as Record<string, Attendance[]>);
    
    // Calculate daily stats
    const dailyStats = Object.entries(dateGroups).map(([date, records]) => {
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const total = records.length;
      const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;
      
      return {
        date,
        present,
        absent,
        late,
        total,
        percentage,
      };
    });
    
    // Sort by date
    dailyStats.sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate overall stats
    const totalStudents = Math.max(...dailyStats.map(stat => stat.total), 0);
    const averageAttendance = dailyStats.length > 0
      ? Math.round(dailyStats.reduce((sum, stat) => sum + stat.percentage, 0) / dailyStats.length)
      : 0;
    
    return {
      totalStudents,
      averageAttendance,
      dailyStats,
    };
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return {
      totalStudents: 0,
      averageAttendance: 0,
      dailyStats: [],
    };
  }
};

export const getStudentAttendanceReport = async (
  studentId: string,
  startDate: string,
  endDate: string
): Promise<{
  stats: AttendanceStats;
  records: Attendance[];
  monthlyBreakdown: {
    month: string;
    presentDays: number;
    totalDays: number;
    percentage: number;
  }[];
}> => {
  try {
    const records = await getStudentAttendance(studentId, startDate, endDate);
    const stats = await getAttendanceStats(studentId, startDate, endDate);
    
    // Group by month
    const monthGroups = records.reduce((groups, record) => {
      const month = record.date.substring(0, 7); // YYYY-MM
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(record);
      return groups;
    }, {} as Record<string, Attendance[]>);
    
    // Calculate monthly breakdown
    const monthlyBreakdown = Object.entries(monthGroups).map(([month, monthRecords]) => {
      const presentDays = monthRecords.filter(r => r.status === 'present').length;
      const lateDays = monthRecords.filter(r => r.status === 'late').length;
      const totalDays = monthRecords.length;
      const percentage = totalDays > 0 
        ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) 
        : 0;
      
      return {
        month,
        presentDays: presentDays + lateDays,
        totalDays,
        percentage,
      };
    });
    
    // Sort by month
    monthlyBreakdown.sort((a, b) => a.month.localeCompare(b.month));
    
    return {
      stats,
      records,
      monthlyBreakdown,
    };
  } catch (error) {
    console.error('Error generating student attendance report:', error);
    return {
      stats: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0,
      },
      records: [],
      monthlyBreakdown: [],
    };
  }
};
