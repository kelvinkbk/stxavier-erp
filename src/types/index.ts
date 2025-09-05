// src/types/index.ts
export interface User {
  uid: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'faculty' | 'student';
  collegeId?: string;
  department?: string;
  regNo?: string;
  phone?: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  regNo: string;
  department: string;
  year: number;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  profilePhoto?: string;
  courses: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  phone?: string;
  subjects: string[];
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  classId: string;
  markedBy: string;
  markedAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: any; // Firestore Timestamp
  status: 'paid' | 'pending' | 'overdue';
  paymentRef?: string;
  description: string;
  category: 'tuition' | 'library' | 'lab' | 'exam' | 'transport' | 'hostel' | 'other';
  semester?: string;
  academicYear?: string;
  paidAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'online' | 'bank_transfer' | 'cheque';
  receivedBy?: string;
  remarks?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  paidAt?: any; // Firestore Timestamp
}

export interface Timetable {
  id: string;
  classId: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  facultyId: string;
  room?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  audience: ('all' | 'students' | 'faculty')[];
  createdBy: string;
  attachments?: string[];
}

export interface Library {
  id: string;
  bookId: string;
  title: string;
  author: string;
  borrowerId?: string;
  dueDate?: Date;
  status: 'available' | 'borrowed' | 'reserved';
  issuedAt?: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  audience: ('all' | 'students' | 'faculty')[];
  createdBy: string;
  createdAt: Date;
}

export interface Exam {
  id: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  room: string;
  totalMarks: number;
  passingMarks: number;
  createdBy: string;
}

export interface Mark {
  id: string;
  studentId: string;
  examId: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
  createdAt: Date;
}
