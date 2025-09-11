// src/screens/Student/NoticesScreen.tsx
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'general' | 'urgent' | 'event';
  date: string;
  author: string;
  isRead: boolean;
}

type CategoryFilter = 'all' | 'academic' | 'general' | 'urgent' | 'event';

export default function NoticesScreen() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      // Mock notices data
      const mockNotices: Notice[] = [
        {
          id: '1',
          title: 'Mid-semester Exam Schedule Released',
          content: 'The mid-semester examination schedule for all courses has been published. Please check your individual timetables for specific dates and timings. All exams will be conducted in the main examination hall.',
          category: 'academic',
          date: '2025-09-05',
          author: 'Academic Office',
          isRead: false,
        },
        {
          id: '2',
          title: 'Library Hours Extended',
          content: 'Due to upcoming exams, the library will remain open until 10 PM on weekdays and 8 PM on weekends starting from September 10th. Students are requested to follow library guidelines.',
          category: 'general',
          date: '2025-09-04',
          author: 'Library Administration',
          isRead: true,
        },
        {
          id: '3',
          title: 'URGENT: Fee Payment Deadline',
          content: 'This is a reminder that the deadline for semester fee payment is September 15th, 2025. Late fees will be applicable after this date. Please contact the accounts office for any queries.',
          category: 'urgent',
          date: '2025-09-03',
          author: 'Accounts Department',
          isRead: false,
        },
        {
          id: '4',
          title: 'Annual Sports Day - Registration Open',
          content: 'Registration for Annual Sports Day is now open! Events include athletics, cricket, football, badminton, and more. Register at the sports office before September 20th.',
          category: 'event',
          date: '2025-09-02',
          author: 'Sports Committee',
          isRead: true,
        },
        {
          id: '5',
          title: 'Career Guidance Workshop',
          content: 'A career guidance workshop will be conducted on September 25th in the main auditorium. Industry experts will provide insights on career opportunities and interview preparation.',
          category: 'event',
          date: '2025-09-01',
          author: 'Placement Cell',
          isRead: false,
        },
      ];

      setNotices(mockNotices);
    } catch (error) {
      console.error('Error loading notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return '#2196f3';
      case 'urgent': return '#f44336';
      case 'event': return '#4caf50';
      case 'general': return '#ff9800';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '📚';
      case 'urgent': return '⚠️';
      case 'event': return '🎉';
      case 'general': return 'ℹ️';
      default: return '📋';
    }
  };

  const markAsRead = (noticeId: string) => {
    setNotices(prev =>
      prev.map(notice =>
        notice.id === noticeId ? { ...notice, isRead: true } : notice
      )
    );
  };

  const categories = [
    { key: 'all', label: 'All', icon: '📋', color: '#666' },
    { key: 'urgent', label: 'Urgent', icon: '⚠️', color: '#f44336' },
    { key: 'academic', label: 'Academic', icon: '📚', color: '#2196f3' },
    { key: 'event', label: 'Events', icon: '🎉', color: '#4caf50' },
    { key: 'general', label: 'General', icon: 'ℹ️', color: '#ff9800' },
  ] as const;

  const getFilteredNotices = () => {
    if (activeCategory === 'all') return notices;
    return notices.filter(notice => notice.category === activeCategory);
  };

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === 'all') return notices.length;
    return notices.filter(notice => notice.category === category).length;
  };

  const renderCategoryTab = (category: typeof categories[number]) => {
    const isActive = activeCategory === category.key;
    const count = getCategoryCount(category.key as CategoryFilter);

    return (
      <TouchableOpacity
        key={category.key}
        style={[
          styles.categoryTab,
          isActive && { ...styles.activeCategoryTab, borderBottomColor: category.color }
        ]}
        onPress={() => setActiveCategory(category.key as CategoryFilter)}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={[
          styles.categoryLabel,
          isActive && { ...styles.activeCategoryLabel, color: category.color }
        ]}>
          {category.label}
        </Text>
        {count > 0 && (
          <View style={[styles.categoryCount, { backgroundColor: category.color }]}>
            <Text style={styles.categoryCountText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderNotice = ({ item }: { item: Notice }) => (
    <Card
      style={!item.isRead ? [styles.noticeCard, styles.unreadCard] : styles.noticeCard}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.noticeHeader}>
        <View style={styles.categoryRow}>
          <Text style={styles.noticeCategoryIcon}>{getCategoryIcon(item.category)}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.contentText} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.authorRow}>
        <Text style={styles.authorText}>— {item.author}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading notices..." />;
  }

  const filteredNotices = getFilteredNotices();
  const unreadCount = filteredNotices.filter(notice => !notice.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notices & Announcements</Text>
        {unreadCount > 0 && (
          <Text style={styles.unreadCountText}>
            {unreadCount} unread notice{unreadCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Category Navigation Bar */}
      <View style={styles.categoryNavContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryNavContent}
        >
          {categories.map(renderCategoryTab)}
        </ScrollView>
      </View>

      <FlatList
        data={filteredNotices}
        renderItem={renderNotice}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {activeCategory === 'all'
                ? 'No notices available'
                : `No ${activeCategory} notices available`
              }
            </Text>
          </Card>
        }
      />
    </View>
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
  unreadCountText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  categoryNavContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  categoryNavContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 40,
  },
  activeCategoryTab: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomWidth: 2,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 6,
  },
  activeCategoryLabel: {
    fontWeight: 'bold',
  },
  categoryCount: {
    backgroundColor: '#666',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  categoryCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noticeCard: {
    marginBottom: 12,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeCategoryIcon: {
    fontSize: 16,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f44336',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  authorRow: {
    alignItems: 'flex-end',
  },
  authorText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
