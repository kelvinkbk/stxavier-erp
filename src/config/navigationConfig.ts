// src/config/navigationConfig.ts
// Navigation configurations for different user roles

import { NavigationItem } from '../components/navigation/NavigationPanel';

// Admin Navigation Items
export const adminNavigationItems: NavigationItem[] = [
  {
    id: 'user-management',
    title: 'User Management',
    subtitle: 'Manage users, roles and permissions',
    icon: '👥',
    color: '#3B82F6',
    screenName: 'UserManagement',
    roles: ['admin'],
  },
  {
    id: 'student-management',
    title: 'Student Management',
    subtitle: 'Manage student records and enrollment',
    icon: '🎓',
    color: '#10B981',
    screenName: 'StudentManagement',
    roles: ['admin'],
  },
  {
    id: 'fee-management',
    title: 'Fee Management',
    subtitle: 'Handle fee collection and payments',
    icon: '💰',
    color: '#F59E0B',
    screenName: 'FeeManagement',
    roles: ['admin'],
  },
  {
    id: 'attendance-management',
    title: 'Attendance Management',
    subtitle: 'Track and manage attendance records',
    icon: '📊',
    color: '#8B5CF6',
    screenName: 'Attendance',
    roles: ['admin', 'faculty'],
  },
  {
    id: 'notices',
    title: 'Notices & Announcements',
    subtitle: 'Create and manage official notices',
    icon: '📢',
    color: '#EF4444',
    screenName: 'Notices',
    roles: ['admin'],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    subtitle: 'Generate comprehensive reports',
    icon: '📈',
    color: '#06B6D4',
    screenName: 'Reports',
    roles: ['admin'],
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    subtitle: 'Configure system preferences',
    icon: '⚙️',
    color: '#6B7280',
    screenName: 'Settings',
    roles: ['admin'],
  },
  {
    id: 'backup-restore',
    title: 'Backup & Restore',
    subtitle: 'Manage data backup and recovery',
    icon: '💾',
    color: '#7C3AED',
    screenName: 'BackupRestore',
    roles: ['admin'],
  },
];

// Faculty Navigation Items
export const facultyNavigationItems: NavigationItem[] = [
  {
    id: 'my-dashboard',
    title: 'My Dashboard',
    subtitle: 'View your teaching overview',
    icon: '🏠',
    color: '#3B82F6',
    screenName: 'Dashboard',
    roles: ['faculty'],
  },
  {
    id: 'my-students',
    title: 'My Students',
    subtitle: 'View and manage your assigned students',
    icon: '👨‍🎓',
    color: '#10B981',
    screenName: 'Students',
    roles: ['faculty'],
  },
  {
    id: 'attendance',
    title: 'Attendance',
    subtitle: 'Mark and track student attendance',
    icon: '✅',
    color: '#F59E0B',
    screenName: 'Attendance',
    roles: ['faculty'],
  },
  {
    id: 'my-timetable',
    title: 'My Timetable',
    subtitle: 'View your class schedule',
    icon: '🕒',
    color: '#8B5CF6',
    screenName: 'Timetable',
    roles: ['faculty'],
  },
  {
    id: 'assignments',
    title: 'Assignments',
    subtitle: 'Create and manage assignments',
    icon: '📝',
    color: '#EF4444',
    screenName: 'Assignments',
    roles: ['faculty'],
  },
  {
    id: 'exams-grades',
    title: 'Exams & Grades',
    subtitle: 'Manage exams and grade students',
    icon: '📋',
    color: '#06B6D4',
    screenName: 'ExamsGrades',
    roles: ['faculty'],
  },
  {
    id: 'class-notices',
    title: 'Class Notices',
    subtitle: 'Send notices to your students',
    icon: '📪',
    color: '#F97316',
    screenName: 'ClassNotices',
    roles: ['faculty'],
  },
  {
    id: 'performance-reports',
    title: 'Performance Reports',
    subtitle: 'View student performance analytics',
    icon: '📊',
    color: '#84CC16',
    screenName: 'PerformanceReports',
    roles: ['faculty'],
  },
];

// Student Navigation Items
export const studentNavigationItems: NavigationItem[] = [
  {
    id: 'my-profile',
    title: 'My Profile',
    subtitle: 'View and update your profile information',
    icon: '👤',
    color: '#3B82F6',
    screenName: 'Profile',
    roles: ['student'],
  },
  {
    id: 'my-fees',
    title: 'Fee Status',
    subtitle: 'View fee status and payment history',
    icon: '💰',
    color: '#10B981',
    screenName: 'Fees',
    roles: ['student'],
  },
  {
    id: 'my-attendance',
    title: 'My Attendance',
    subtitle: 'View your attendance records',
    icon: '📊',
    color: '#F59E0B',
    screenName: 'StudentAttendance',
    roles: ['student'],
  },
  {
    id: 'my-timetable',
    title: 'My Timetable',
    subtitle: 'View your class schedule',
    icon: '🕒',
    color: '#8B5CF6',
    screenName: 'StudentTimetable',
    roles: ['student'],
  },
  {
    id: 'exam-results',
    title: 'Exam Results',
    subtitle: 'View your exam results and grades',
    icon: '📋',
    color: '#EF4444',
    screenName: 'StudentResults',
    roles: ['student'],
  },
  {
    id: 'library',
    title: 'Library',
    subtitle: 'Manage borrowed books and search catalog',
    icon: '📚',
    color: '#06B6D4',
    screenName: 'StudentLibrary',
    roles: ['student'],
  },
  {
    id: 'notices',
    title: 'Notices',
    subtitle: 'View latest notices and announcements',
    icon: '📢',
    color: '#F97316',
    screenName: 'StudentNotices',
    roles: ['student'],
  },
  {
    id: 'events',
    title: 'Events',
    subtitle: 'View upcoming college events',
    icon: '🎉',
    color: '#EC4899',
    screenName: 'StudentEvents',
    roles: ['student'],
  },
  {
    id: 'assignments',
    title: 'Assignments',
    subtitle: 'View and submit assignments',
    icon: '📄',
    color: '#8B5CF6',
    screenName: 'StudentAssignments',
    roles: ['student'],
  },
  {
    id: 'study-materials',
    title: 'Study Materials',
    subtitle: 'Access course materials and resources',
    icon: '📖',
    color: '#059669',
    screenName: 'StudyMaterials',
    roles: ['student'],
  },
];

// Quick Actions (common across roles)
export const quickActionsItems: NavigationItem[] = [
  {
    id: 'search',
    title: 'Search',
    subtitle: 'Find students, faculty, or records',
    icon: '🔍',
    color: '#6B7280',
    screenName: 'Search',
    roles: ['admin', 'faculty', 'student'],
  },
  {
    id: 'help-support',
    title: 'Help & Support',
    subtitle: 'Get help and contact support',
    icon: '❓',
    color: '#84CC16',
    screenName: 'HelpSupport',
    roles: ['admin', 'faculty', 'student'],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    subtitle: 'Share your feedback and suggestions',
    icon: '💬',
    color: '#F97316',
    screenName: 'Feedback',
    roles: ['admin', 'faculty', 'student'],
  },
];

// Get navigation items based on user role
export const getNavigationItems = (role: 'admin' | 'faculty' | 'student'): NavigationItem[] => {
  switch (role) {
    case 'admin':
      return [...adminNavigationItems, ...quickActionsItems];
    case 'faculty':
      return [...facultyNavigationItems, ...quickActionsItems];
    case 'student':
      return [...studentNavigationItems, ...quickActionsItems];
    default:
      return quickActionsItems;
  }
};

// Get stats based on user role
export const getStatsConfig = (role: 'admin' | 'faculty' | 'student') => {
  switch (role) {
    case 'admin':
      return [
        { title: 'Total Users', value: '1,234', color: '#3B82F6' },
        { title: 'Active Students', value: '980', color: '#10B981' },
        { title: 'Faculty', value: '45', color: '#F59E0B' },
      ];
    case 'faculty':
      return [
        { title: 'My Students', value: '120', color: '#3B82F6' },
        { title: 'Classes Today', value: '4', color: '#10B981' },
        { title: 'Pending Tasks', value: '7', color: '#F59E0B' },
      ];
    case 'student':
      return [
        { title: 'Attendance', value: '85%', color: '#10B981' },
        { title: 'Pending Fees', value: '₹0', color: '#3B82F6' },
        { title: 'Books Issued', value: '3', color: '#F59E0B' },
      ];
    default:
      return [];
  }
};
