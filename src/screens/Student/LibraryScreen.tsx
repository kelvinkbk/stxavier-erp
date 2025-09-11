// src/screens/Student/LibraryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'available' | 'borrowed' | 'reserved';
}

interface BorrowedBook {
  id: string;
  book: Book;
  borrowDate: string;
  dueDate: string;
  status: 'borrowed' | 'overdue' | 'returned';
}

export default function LibraryScreen() {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadBorrowedBooks();
  }, []);

  const loadBorrowedBooks = async () => {
    try {
      setLoading(true);
      // Mock borrowed books data
      const mockBorrowedBooks: BorrowedBook[] = [
        {
          id: '1',
          book: {
            id: 'b1',
            title: 'Introduction to Algorithms',
            author: 'Thomas H. Cormen',
            isbn: '978-0262033848',
            category: 'Computer Science',
            status: 'borrowed',
          },
          borrowDate: '2025-08-15',
          dueDate: '2025-09-15',
          status: 'borrowed',
        },
        {
          id: '2',
          book: {
            id: 'b2',
            title: 'Calculus: Early Transcendentals',
            author: 'James Stewart',
            isbn: '978-1285741550',
            category: 'Mathematics',
            status: 'borrowed',
          },
          borrowDate: '2025-08-20',
          dueDate: '2025-09-20',
          status: 'borrowed',
        },
        {
          id: '3',
          book: {
            id: 'b3',
            title: 'Physics for Scientists',
            author: 'Raymond A. Serway',
            isbn: '978-1133947271',
            category: 'Physics',
            status: 'borrowed',
          },
          borrowDate: '2025-07-10',
          dueDate: '2025-08-10',
          status: 'overdue',
        },
      ];

      setBorrowedBooks(mockBorrowedBooks);
    } catch (error) {
      console.error('Error loading borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      // Mock search results
      const mockResults: Book[] = [
        {
          id: 'b4',
          title: 'Data Structures and Algorithms in Java',
          author: 'Robert Lafore',
          isbn: '978-0672324536',
          category: 'Computer Science',
          status: 'available' as const,
        },
        {
          id: 'b5',
          title: 'Linear Algebra and Its Applications',
          author: 'David C. Lay',
          isbn: '978-0321982384',
          category: 'Mathematics',
          status: 'available' as const,
        },
        {
          id: 'b6',
          title: 'Organic Chemistry',
          author: 'Paula Yurkanis Bruice',
          isbn: '978-0134042282',
          category: 'Chemistry',
          status: 'reserved' as const,
        },
      ].filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed': return '#2196f3';
      case 'overdue': return '#f44336';
      case 'returned': return '#4caf50';
      case 'available': return '#4caf50';
      case 'reserved': return '#ff9800';
      default: return '#666';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderBorrowedBook = ({ item }: { item: BorrowedBook }) => {
    const daysUntilDue = getDaysUntilDue(item.dueDate);
    const isOverdue = daysUntilDue < 0;

    return (
      <Card style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <Text style={styles.bookTitle}>{item.book.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.authorText}>by {item.book.author}</Text>
        <Text style={styles.categoryText}>{item.book.category}</Text>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
          <Text style={[styles.daysText, { color: isOverdue ? '#f44336' : '#666' }]}>
            {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
          </Text>
        </View>
        {item.status === 'borrowed' && (
          <Button
            title={isOverdue ? "Renew (Overdue)" : "Renew Book"}
            variant={isOverdue ? "primary" : "secondary"}
            style={styles.renewButton}
            onPress={() => {/* Handle renew */}}
          />
        )}
      </Card>
    );
  };

  const renderSearchResult = ({ item }: { item: Book }) => (
    <Card style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.authorText}>by {item.author}</Text>
      <Text style={styles.categoryText}>{item.category}</Text>
      <Text style={styles.isbnText}>ISBN: {item.isbn}</Text>
      {item.status === 'available' && (
        <Button
          title="Reserve Book"
          variant="primary"
          style={styles.reserveButton}
          onPress={() => {/* Handle reserve */}}
        />
      )}
    </Card>
  );

  if (loading) {
    return <LoadingSpinner message="Loading library data..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Search Section */}
      <Card style={styles.searchCard}>
        <Text style={styles.sectionTitle}>Search Library Catalog</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, or category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchBooks}
          />
          <Button
            title="Search"
            onPress={searchBooks}
            loading={searching}
            style={styles.searchButton}
          />
        </View>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Borrowed Books */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Borrowed Books</Text>
        {borrowedBooks.length > 0 ? (
          <FlatList
            data={borrowedBooks}
            renderItem={renderBorrowedBook}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No borrowed books</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchCard: {
    margin: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  searchButton: {
    minWidth: 80,
  },
  bookCard: {
    marginBottom: 12,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  isbnText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
  },
  daysText: {
    fontSize: 12,
    fontWeight: '500',
  },
  renewButton: {
    marginTop: 8,
  },
  reserveButton: {
    marginTop: 8,
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
