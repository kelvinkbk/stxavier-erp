// src/screens/Faculty/EnhancedFacultyDashboard.tsx
// Enhanced Faculty Dashboard with Navigation Panel

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedLoading,
  Grid,
  HStack,
  NavigationPanelWithStats,
  ResponsiveLayout,
  Stack,
  colors,
  spacing,
  typography,
} from '../../components/enhanced';
import { facultyNavigationItems, getStatsConfig } from '../../config/navigationConfig';
import { AdvancedUserService, UserStats } from '../../services/advancedUserService';
import { useAuth } from '../../utils/AuthContext';
import { NavigationDebug } from '../../utils/navigationDebug';
import { UniversalAlert } from '../../utils/universalAlert';

interface EnhancedFacultyDashboardProps {
  navigation: any;
}

export const EnhancedFacultyDashboard: React.FC<EnhancedFacultyDashboardProps> = ({
  navigation,
}) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load faculty-specific stats
      const userStats = await AdvancedUserService.getUserStatsAdvanced();
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load faculty dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleNavigation = (screenName: string, item: any) => {
    if (!NavigationDebug.safeNavigate(navigation, screenName)) {
      // Show feature info if navigation fails
      UniversalAlert.info(
        item.title,
        item.subtitle || `Navigate to ${item.title} section of the faculty portal.`
      );
    }
  };

  const dashboardStats = getStatsConfig('faculty');

  const upcomingClasses = [
    {
      subject: 'Computer Science 101',
      time: '10:00 AM - 11:30 AM',
      room: 'Lab 3A',
      students: 28,
      type: 'lecture',
    },
    {
      subject: 'Data Structures',
      time: '2:00 PM - 3:30 PM',
      room: 'Room 205',
      students: 32,
      type: 'practical',
    },
    {
      subject: 'Database Systems',
      time: '4:00 PM - 5:30 PM',
      room: 'Lab 2B',
      students: 25,
      type: 'lab',
    },
  ];

  const quickActions = [
    {
      title: 'Take Attendance',
      icon: 'checkmark-circle',
      color: colors.success[600],
      onPress: () => {
        UniversalAlert.info('Take Attendance', "Mark student attendance for today's classes.");
      },
    },
    {
      title: 'Grade Assignments',
      icon: 'star',
      color: colors.warning[600],
      onPress: () => {
        UniversalAlert.info('Grade Assignments', 'Review and grade pending student assignments.');
      },
    },
    {
      title: 'Create Quiz',
      icon: 'document-text',
      color: colors.primary[600],
      onPress: () => {
        UniversalAlert.info('Create Quiz', 'Create new quiz or assessment for your students.');
      },
    },
    {
      title: 'Announcements',
      icon: 'megaphone',
      color: colors.purple[600],
      onPress: () => {
        UniversalAlert.info('Announcements', 'Send announcements to students in your classes.');
      },
    },
  ];

  if (loading && !stats) {
    return (
      <ResponsiveLayout style={styles.container}>
        <View style={styles.loadingContainer}>
          <EnhancedLoading type="spinner" text="Loading Faculty Dashboard..." />
        </View>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <EnhancedCard variant="elevated" padding={6} style={styles.headerCard}>
            <HStack align="center" justify="space-between">
              <View style={styles.userInfo}>
                <HStack align="center" spacing={3}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'F'}
                    </Text>
                    <View style={styles.facultyBadge}>
                      <Ionicons name="school" size={12} color={colors.text.inverse} />
                    </View>
                  </View>
                  <Stack spacing={1}>
                    <Text style={styles.welcomeText}>Faculty Dashboard 📚</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userRole}>Professor • Computer Science</Text>
                  </Stack>
                </HStack>
              </View>

              <Stack spacing={2} align="trailing">
                <EnhancedButton
                  title="Sign Out"
                  variant="secondary"
                  size="sm"
                  onPress={signOut}
                  style={styles.signOutButton}
                />
                <Text style={styles.lastSync}>Last sync: {new Date().toLocaleTimeString()}</Text>
              </Stack>
            </HStack>
          </EnhancedCard>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <Grid cols={2} spacing={3}>
            <EnhancedCard variant="outlined" padding={4}>
              <Stack align="center" spacing={2}>
                <Ionicons name="calendar" size={24} color={colors.primary[600]} />
                <Text style={styles.overviewValue}>3</Text>
                <Text style={styles.overviewLabel}>Classes Today</Text>
              </Stack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <Stack align="center" spacing={2}>
                <Ionicons name="people" size={24} color={colors.success[600]} />
                <Text style={styles.overviewValue}>85</Text>
                <Text style={styles.overviewLabel}>Total Students</Text>
              </Stack>
            </EnhancedCard>
          </Grid>

          <Grid cols={2} spacing={3}>
            <EnhancedCard variant="outlined" padding={4}>
              <Stack align="center" spacing={2}>
                <Ionicons name="document-text" size={24} color={colors.warning[600]} />
                <Text style={styles.overviewValue}>12</Text>
                <Text style={styles.overviewLabel}>Pending Grades</Text>
              </Stack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <Stack align="center" spacing={2}>
                <Ionicons name="notifications" size={24} color={colors.purple[600]} />
                <Text style={styles.overviewValue}>5</Text>
                <Text style={styles.overviewLabel}>New Messages</Text>
              </Stack>
            </EnhancedCard>
          </Grid>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Grid cols={2} spacing={3}>
            {quickActions.map((action, index) => (
              <EnhancedCard key={index} variant="outlined" padding={4}>
                <Stack align="center" spacing={3} onPress={action.onPress}>
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </Stack>
              </EnhancedCard>
            ))}
          </Grid>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Stack spacing={3}>
            {upcomingClasses.map((classItem, index) => (
              <EnhancedCard key={index} variant="outlined" padding={4}>
                <HStack align="center" spacing={3}>
                  <View
                    style={[
                      styles.classTypeIcon,
                      { backgroundColor: getClassTypeColor(classItem.type) },
                    ]}
                  >
                    <Ionicons
                      name={getClassTypeIcon(classItem.type)}
                      size={16}
                      color={colors.text.inverse}
                    />
                  </View>

                  <Stack spacing={1} style={{ flex: 1 }}>
                    <Text style={styles.classSubject}>{classItem.subject}</Text>
                    <Text style={styles.classTime}>{classItem.time}</Text>
                    <HStack align="center" spacing={2}>
                      <Text style={styles.classInfo}>📍 {classItem.room}</Text>
                      <Text style={styles.classInfo}>👥 {classItem.students} students</Text>
                    </HStack>
                  </Stack>

                  <EnhancedButton
                    title="Join"
                    variant="primary"
                    size="sm"
                    onPress={() => {
                      UniversalAlert.info(
                        'Join Class',
                        `Starting ${classItem.subject} in ${classItem.room}`
                      );
                    }}
                  />
                </HStack>
              </EnhancedCard>
            ))}
          </Stack>
        </View>

        {/* Main Navigation */}
        <View style={styles.mainContent}>
          <NavigationPanelWithStats
            title="Faculty Portal"
            items={facultyNavigationItems}
            onNavigate={handleNavigation}
            stats={dashboardStats}
            layout="grid"
            columns={1}
            showQuickAccess={true}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <Stack spacing={3}>
            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.success[100] }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Attendance Recorded</Text>
                  <Text style={styles.activityDescription}>
                    Computer Science 101 - 28/30 present
                  </Text>
                </Stack>
                <Text style={styles.activityTime}>30 min ago</Text>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.warning[100] }]}>
                  <Ionicons name="star" size={16} color={colors.warning[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Assignment Graded</Text>
                  <Text style={styles.activityDescription}>
                    Data Structures Lab - 5 assignments
                  </Text>
                </Stack>
                <Text style={styles.activityTime}>2h ago</Text>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.purple[100] }]}>
                  <Ionicons name="megaphone" size={16} color={colors.purple[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Announcement Posted</Text>
                  <Text style={styles.activityDescription}>
                    Exam schedule updated for all classes
                  </Text>
                </Stack>
                <Text style={styles.activityTime}>1d ago</Text>
              </HStack>
            </EnhancedCard>
          </Stack>
        </View>
      </ScrollView>
    </ResponsiveLayout>
  );
};

// Helper functions
const getClassTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'lecture':
      return colors.primary[600];
    case 'practical':
      return colors.success[600];
    case 'lab':
      return colors.warning[600];
    default:
      return colors.gray[600];
  }
};

const getClassTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type.toLowerCase()) {
    case 'lecture':
      return 'school';
    case 'practical':
      return 'code';
    case 'lab':
      return 'flask';
    default:
      return 'book';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingBottom: spacing[6],
  },

  header: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },

  headerCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
  },

  userInfo: {
    flex: 1,
  },

  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.success[600],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: '700' as const,
    color: colors.text.inverse,
  },

  facultyBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },

  userRole: {
    fontSize: typography.sizes.sm,
    color: colors.success[600],
    fontWeight: '500' as const,
  },

  signOutButton: {
    minWidth: 80,
  },

  lastSync: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },

  section: {
    padding: spacing[4],
    paddingTop: 0,
  },

  mainContent: {
    padding: spacing[4],
    paddingTop: 0,
  },

  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },

  // Overview Styles
  overviewValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700' as const,
    color: colors.text.primary,
  },

  overviewLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Quick Actions Styles
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Schedule Styles
  classTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  classSubject: {
    fontSize: typography.sizes.base,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  classTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },

  classInfo: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },

  // Activity Styles
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activityTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  activityDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  activityTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
});

export default EnhancedFacultyDashboard;
