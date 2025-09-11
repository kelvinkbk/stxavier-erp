// src/screens/Student/EventsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../utils/AuthContext';
import { UniversalAlert } from '../../utils/universalAlert';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'cultural' | 'sports' | 'workshop' | 'social';
  organizer: string;
  isRegistrationOpen: boolean;
  isRegistered: boolean;
  maxParticipants?: number;
  currentParticipants?: number;
}

export default function EventsScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Mock events data
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Annual Cultural Fest 2025',
          description: 'Join us for the biggest cultural celebration of the year! Dance, music, drama, and much more. Show your talents and enjoy performances by fellow students.',
          date: '2025-10-15',
          time: '10:00 AM',
          location: 'Main Auditorium',
          category: 'cultural',
          organizer: 'Cultural Committee',
          isRegistrationOpen: true,
          isRegistered: false,
          maxParticipants: 500,
          currentParticipants: 234,
        },
        {
          id: '2',
          title: 'Tech Workshop: AI & Machine Learning',
          description: 'Learn about the latest trends in AI and Machine Learning. Industry experts will conduct hands-on sessions covering popular frameworks and real-world applications.',
          date: '2025-09-25',
          time: '2:00 PM',
          location: 'Computer Lab 1',
          category: 'workshop',
          organizer: 'Tech Club',
          isRegistrationOpen: true,
          isRegistered: true,
          maxParticipants: 50,
          currentParticipants: 42,
        },
        {
          id: '3',
          title: 'Inter-College Cricket Tournament',
          description: 'Cheer for our college cricket team as they compete against other colleges in the district championship. Free entry for all students!',
          date: '2025-09-20',
          time: '9:00 AM',
          location: 'College Cricket Ground',
          category: 'sports',
          organizer: 'Sports Committee',
          isRegistrationOpen: false,
          isRegistered: false,
        },
        {
          id: '4',
          title: 'Career Guidance Seminar',
          description: 'Get insights from industry professionals about career opportunities, interview preparation, and skill development. Perfect for final year students.',
          date: '2025-09-30',
          time: '11:00 AM',
          location: 'Lecture Hall A',
          category: 'academic',
          organizer: 'Placement Cell',
          isRegistrationOpen: true,
          isRegistered: false,
          maxParticipants: 200,
          currentParticipants: 156,
        },
        {
          id: '5',
          title: 'Blood Donation Camp',
          description: 'Be a hero! Donate blood and save lives. Medical team will be present to ensure safe donation. Light refreshments will be provided.',
          date: '2025-09-18',
          time: '9:00 AM',
          location: 'Medical Center',
          category: 'social',
          organizer: 'NSS Unit',
          isRegistrationOpen: true,
          isRegistered: false,
          maxParticipants: 100,
          currentParticipants: 67,
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return '#2196f3';
      case 'cultural': return '#e91e63';
      case 'sports': return '#4caf50';
      case 'workshop': return '#ff9800';
      case 'social': return '#9c27b0';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '🎓';
      case 'cultural': return '🎭';
      case 'sports': return '⚽';
      case 'workshop': return '🔧';
      case 'social': return '🤝';
      default: return '📅';
    }
  };

  const handleRegistration = (event: Event) => {
    if (event.isRegistered) {
      UniversalAlert.confirm(
        'Unregister from Event',
        `Are you sure you want to unregister from "${event.title}"?`,
        () => {
          setEvents(prev => 
            prev.map(e => 
              e.id === event.id ? { ...e, isRegistered: false, currentParticipants: (e.currentParticipants || 0) - 1 } : e
            )
          );
          UniversalAlert.success('Successfully unregistered from the event!');
        }
      );
    } else {
      setEvents(prev => 
        prev.map(e => 
          e.id === event.id ? { ...e, isRegistered: true, currentParticipants: (e.currentParticipants || 0) + 1 } : e
        )
      );
      UniversalAlert.success('Successfully registered for the event!');
    }
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const event = new Date(eventDate);
    const today = new Date();
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const daysUntil = getDaysUntilEvent(item.date);
    const isPast = isEventPast(item.date);
    const isFull = item.maxParticipants && item.currentParticipants && item.currentParticipants >= item.maxParticipants;

    return (
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
            </View>
          </View>
          {!isPast && (
            <Text style={styles.daysText}>
              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
            </Text>
          )}
        </View>

        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Organizer:</Text>
            <Text style={styles.detailValue}>{item.organizer}</Text>
          </View>
        </View>

        {item.maxParticipants && (
          <View style={styles.participantsRow}>
            <Text style={styles.participantsText}>
              {item.currentParticipants}/{item.maxParticipants} participants
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((item.currentParticipants / item.maxParticipants) * 100, 100)}%`,
                    backgroundColor: isFull ? '#f44336' : '#4caf50'
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {item.isRegistrationOpen && !isPast && (
          <Button
            title={item.isRegistered ? 'Unregister' : isFull ? 'Full' : 'Register'}
            variant={item.isRegistered ? 'secondary' : 'primary'}
            disabled={!item.isRegistered && isFull}
            onPress={() => handleRegistration(item)}
            style={styles.registerButton}
          />
        )}

        {isPast && (
          <Text style={styles.pastEventText}>This event has ended</Text>
        )}
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>College Events</Text>
        <Text style={styles.headerSubtitle}>Discover and join exciting events</Text>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events available</Text>
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
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventCard: {
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 20,
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
  daysText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  participantsRow: {
    marginVertical: 12,
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  registerButton: {
    marginTop: 12,
  },
  pastEventText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 12,
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
