// src/screens/Student/EnhancedDashboard.tsx
// Enhanced Student Dashboard with Navigation Panel

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  EnhancedButton,
  EnhancedCard,
  HStack,
  NavigationPanelWithStats,
  ResponsiveLayout,
  Stack,
  colors,
  spacing,
  typography,
} from '../../components/enhanced';
import { getStatsConfig, studentNavigationItems } from '../../config/navigationConfig';
import { useAuth } from '../../utils/AuthContext';
import { NavigationDebug } from '../../utils/navigationDebug';
import { UniversalAlert } from '../../utils/universalAlert';

interface EnhancedStudentDashboardProps {
  navigation: any;
}

export const EnhancedStudentDashboard: React.FC<EnhancedStudentDashboardProps> = ({
  navigation,
}) => {
  const { user, signOut } = useAuth();

  const handleNavigation = (screenName: string, item: any) => {
    if (!NavigationDebug.safeNavigate(navigation, screenName)) {
      // Show feature info if navigation fails
      UniversalAlert.info(
        item.title,
        item.subtitle || `Navigate to ${item.title} section of the ERP system.`
      );
    }
  };

  const stats = getStatsConfig('student');

  return (
    <ResponsiveLayout style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <EnhancedCard variant="elevated" padding={6} style={styles.headerCard}>
            <HStack align="center" justify="space-between">
              <View style={styles.userInfo}>
                <HStack align="center" spacing={3}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'S'}
                    </Text>
                  </View>
                  <Stack spacing={1}>
                    <Text style={styles.welcomeText}>Welcome back! 👋</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <HStack spacing={4}>
                      {user?.regNo && <Text style={styles.userDetail}>📝 {user.regNo}</Text>}
                      {user?.department && (
                        <Text style={styles.userDetail}>🏛️ {user.department}</Text>
                      )}
                    </HStack>
                  </Stack>
                </HStack>
              </View>

              <EnhancedButton
                title="Sign Out"
                variant="secondary"
                size="sm"
                onPress={signOut}
                style={styles.signOutButton}
              />
            </HStack>
          </EnhancedCard>
        </View>

        {/* Main Navigation */}
        <View style={styles.mainContent}>
          <NavigationPanelWithStats
            title="Student Services"
            items={studentNavigationItems}
            onNavigate={handleNavigation}
            stats={stats}
            layout="grid"
            columns={2}
            showQuickAccess={true}
          />
        </View>

        {/* Recent Activities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <Stack spacing={3}>
            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.success[100] }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Attendance Marked</Text>
                  <Text style={styles.activityDescription}>Mathematics - 10:00 AM</Text>
                </Stack>
                <Text style={styles.activityTime}>2h ago</Text>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="document-text" size={16} color={colors.primary[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>New Assignment Posted</Text>
                  <Text style={styles.activityDescription}>Physics Lab Report - Due: Friday</Text>
                </Stack>
                <Text style={styles.activityTime}>5h ago</Text>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.warning[100] }]}>
                  <Ionicons name="notifications" size={16} color={colors.warning[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Fee Reminder</Text>
                  <Text style={styles.activityDescription}>Semester fee due by 15th March</Text>
                </Stack>
                <Text style={styles.activityTime}>1d ago</Text>
              </HStack>
            </EnhancedCard>
          </Stack>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <HStack spacing={3}>
            <EnhancedButton
              title="📊 View Attendance"
              variant="primary"
              style={{ flex: 1 }}
              onPress={() =>
                handleNavigation('StudentAttendance', {
                  title: 'My Attendance',
                  subtitle: 'View your attendance records',
                })
              }
            />
            <EnhancedButton
              title="💰 Check Fees"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() =>
                handleNavigation('Fees', {
                  title: 'Fee Status',
                  subtitle: 'View fee status and payment history',
                })
              }
            />
          </HStack>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Stack spacing={2}>
            <EnhancedCard variant="flat" padding={4} style={styles.eventCard}>
              <HStack align="center" spacing={3}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateNumber}>15</Text>
                  <Text style={styles.eventDateMonth}>MAR</Text>
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>Mid-term Examinations</Text>
                  <Text style={styles.eventTime}>9:00 AM - 12:00 PM</Text>
                </Stack>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="flat" padding={4} style={styles.eventCard}>
              <HStack align="center" spacing={3}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateNumber}>20</Text>
                  <Text style={styles.eventDateMonth}>MAR</Text>
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>Science Fair</Text>
                  <Text style={styles.eventTime}>10:00 AM - 4:00 PM</Text>
                </Stack>
              </HStack>
            </EnhancedCard>
          </Stack>
        </View>
      </ScrollView>
    </ResponsiveLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
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
    borderLeftColor: colors.primary[500],
  },

  userInfo: {
    flex: 1,
  },

  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: '700' as const,
    color: colors.text.inverse,
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

  userDetail: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },

  signOutButton: {
    minWidth: 80,
  },

  mainContent: {
    padding: spacing[4],
  },

  section: {
    padding: spacing[4],
    paddingTop: 0,
  },

  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },

  // Recent Activities Styles
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

  // Events Styles
  eventCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[400],
  },

  eventDate: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  eventDateNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: '700' as const,
    color: colors.primary[700],
  },

  eventDateMonth: {
    fontSize: typography.sizes.xs,
    fontWeight: '500' as const,
    color: colors.primary[600],
  },

  eventTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  eventTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});

export default EnhancedStudentDashboard;
