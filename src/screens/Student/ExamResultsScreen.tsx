// src/screens/Student/ExamResultsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';

interface ExamResult {
  id: string;
  subject: string;
  examType: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  date: string;
  remarks?: string;
}

interface Semester {
  id: string;
  name: string;
  results: ExamResult[];
  gpa: number;
}

export default function ExamResultsScreen() {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamResults();
  }, []);

  const loadExamResults = async () => {
    try {
      setLoading(true);
      // Mock exam results data
      const mockSemesters: Semester[] = [
        {
          id: '1',
          name: 'Semester 1 - 2025',
          gpa: 8.5,
          results: [
            {
              id: '1',
              subject: 'Mathematics',
              examType: 'Mid-term',
              maxMarks: 100,
              obtainedMarks: 85,
              grade: 'A',
              date: '2025-03-15',
              remarks: 'Excellent performance',
            },
            {
              id: '2',
              subject: 'Physics',
              examType: 'Mid-term',
              maxMarks: 100,
              obtainedMarks: 78,
              grade: 'B+',
              date: '2025-03-18',
            },
            {
              id: '3',
              subject: 'Chemistry',
              examType: 'Mid-term',
              maxMarks: 100,
              obtainedMarks: 92,
              grade: 'A+',
              date: '2025-03-20',
              remarks: 'Outstanding work',
            },
            {
              id: '4',
              subject: 'English',
              examType: 'Mid-term',
              maxMarks: 100,
              obtainedMarks: 80,
              grade: 'A-',
              date: '2025-03-22',
            },
          ],
        },
        {
          id: '2',
          name: 'Semester 2 - 2024',
          gpa: 8.2,
          results: [
            {
              id: '5',
              subject: 'Mathematics',
              examType: 'Final',
              maxMarks: 100,
              obtainedMarks: 88,
              grade: 'A',
              date: '2024-12-10',
            },
            {
              id: '6',
              subject: 'Physics',
              examType: 'Final',
              maxMarks: 100,
              obtainedMarks: 75,
              grade: 'B+',
              date: '2024-12-12',
            },
            {
              id: '7',
              subject: 'Chemistry',
              examType: 'Final',
              maxMarks: 100,
              obtainedMarks: 82,
              grade: 'A-',
              date: '2024-12-15',
            },
          ],
        },
      ];

      setSemesters(mockSemesters);
    } catch (error) {
      console.error('Error loading exam results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return '#4caf50';
      case 'A': return '#8bc34a';
      case 'A-': return '#cddc39';
      case 'B+': return '#ffeb3b';
      case 'B': return '#ffc107';
      case 'B-': return '#ff9800';
      case 'C+': return '#ff5722';
      case 'C': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const renderExamResult = ({ item }: { item: ExamResult }) => (
    <Card style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade) }]}>
          <Text style={styles.gradeText}>{item.grade}</Text>
        </View>
      </View>
      <View style={styles.resultDetails}>
        <Text style={styles.examTypeText}>{item.examType}</Text>
        <Text style={styles.marksText}>
          {item.obtainedMarks}/{item.maxMarks} ({Math.round((item.obtainedMarks / item.maxMarks) * 100)}%)
        </Text>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        {item.remarks && <Text style={styles.remarksText}>{item.remarks}</Text>}
      </View>
    </Card>
  );

  const renderSemester = (semester: Semester) => (
    <View key={semester.id} style={styles.semesterContainer}>
      <Card style={styles.semesterHeader}>
        <View style={styles.semesterTitleRow}>
          <Text style={styles.semesterTitle}>{semester.name}</Text>
          <View style={styles.gpaContainer}>
            <Text style={styles.gpaLabel}>GPA</Text>
            <Text style={styles.gpaValue}>{semester.gpa}</Text>
          </View>
        </View>
      </Card>
      
      <FlatList
        data={semester.results}
        renderItem={renderExamResult}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading exam results..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exam Results</Text>
        <Text style={styles.headerSubtitle}>Academic Performance Overview</Text>
      </View>

      {semesters.map(renderSemester)}

      {semesters.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No exam results available</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  semesterContainer: {
    marginBottom: 24,
  },
  semesterHeader: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  semesterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gpaContainer: {
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#666',
  },
  gpaValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  resultCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultDetails: {
    gap: 4,
  },
  examTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  marksText: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  remarksText: {
    fontSize: 12,
    color: '#4caf50',
    fontStyle: 'italic',
  },
  emptyCard: {
    margin: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
