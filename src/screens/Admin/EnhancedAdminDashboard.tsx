// src/screens/Admin/EnhancedAdminDashboard.tsx
// Enhanced Admin Dashboard with Navigation Panel

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
import { adminNavigationItems, getStatsConfig } from '../../config/navigationConfig';
import { AdvancedUserService, UserStats } from '../../services/advancedUserService';
import { LocalStorageService } from '../../services/localStorage';
import { useAuth } from '../../utils/AuthContext';
import { NavigationDebug } from '../../utils/navigationDebug';
import { UniversalAlert } from '../../utils/universalAlert';

interface EnhancedAdminDashboardProps {
  navigation: any;
}

export const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadDashboardData();

    // Start auto-refresh
    LocalStorageService.startAutoRefresh(30000);

    return () => {
      LocalStorageService.stopAutoRefresh();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const userStats = await AdvancedUserService.getUserStatsAdvanced();
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
        item.subtitle || `Navigate to ${item.title} section of the ERP admin panel.`
      );
    }
  };

  const dashboardStats = stats
    ? [
        { title: 'Total Users', value: stats.totalUsers.toString(), color: colors.primary[600] },
        {
          title: 'New This Month',
          value: stats.newUsersThisMonth.toString(),
          color: colors.success[600],
        },
        {
          title: 'Recent Activity',
          value: stats.recentActivity.toString(),
          color: colors.warning[600],
        },
      ]
    : getStatsConfig('admin');

  const quickActions = [
    {
      title: 'Create User',
      icon: 'person-add',
      color: colors.success[600],
      onPress: () => {
        // Navigate to user creation or show modal
        UniversalAlert.info(
          'Create User',
          'Create a new user account with appropriate role and permissions.'
        );
      },
    },
    {
      title: 'Bulk Import',
      icon: 'cloud-upload',
      color: colors.primary[600],
      onPress: () => {
        UniversalAlert.info('Bulk Import', 'Import multiple user accounts from CSV file.');
      },
    },
    {
      title: 'Generate Report',
      icon: 'bar-chart',
      color: colors.warning[600],
      onPress: () => {
        UniversalAlert.info(
          'Generate Report',
          'Create comprehensive reports on system usage and user activity.'
        );
      },
    },
    {
      title: 'System Health',
      icon: 'pulse',
      color: colors.error[600],
      onPress: () => {
        UniversalAlert.info(
          'System Health',
          'Monitor system performance, security, and overall health status.'
        );
      },
    },
  ];

  if (loading && !stats) {
    return (
      <ResponsiveLayout style={styles.container}>
        <View style={styles.loadingContainer}>
          <EnhancedLoading type="spinner" text="Loading Admin Dashboard..." />
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
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </Text>
                    <View style={styles.adminBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={colors.text.inverse} />
                    </View>
                  </View>
                  <Stack spacing={1}>
                    <Text style={styles.welcomeText}>Admin Dashboard 🛡️</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userRole}>System Administrator</Text>
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

        {/* System Overview */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            <Grid cols={2} spacing={3}>
              <EnhancedCard variant="outlined" padding={4}>
                <Stack align="center" spacing={2}>
                  <Ionicons name="people" size={24} color={colors.primary[600]} />
                  <Text style={styles.overviewValue}>{stats.totalUsers}</Text>
                  <Text style={styles.overviewLabel}>Total Users</Text>
                </Stack>
              </EnhancedCard>

              <EnhancedCard variant="outlined" padding={4}>
                <Stack align="center" spacing={2}>
                  <Ionicons name="trending-up" size={24} color={colors.success[600]} />
                  <Text style={styles.overviewValue}>{stats.newUsersThisMonth}</Text>
                  <Text style={styles.overviewLabel}>New This Month</Text>
                </Stack>
              </EnhancedCard>
            </Grid>

            {/* Role Distribution */}
            <Text style={styles.subsectionTitle}>User Distribution</Text>
            <Stack spacing={2}>
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <EnhancedCard key={role} variant="flat" padding={3}>
                  <HStack align="center" justify="space-between">
                    <HStack align="center" spacing={3}>
                      <View
                        style={[styles.roleIndicator, { backgroundColor: getRoleColor(role) }]}
                      />
                      <Text style={styles.roleText}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </HStack>
                    <Text style={[styles.roleCount, { color: getRoleColor(role) }]}>{count}</Text>
                  </HStack>
                </EnhancedCard>
              ))}
            </Stack>
          </View>
        )}

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

        {/* Main Navigation */}
        <View style={styles.mainContent}>
          <NavigationPanelWithStats
            title="Administrative Tools"
            items={adminNavigationItems}
            onNavigate={handleNavigation}
            stats={dashboardStats}
            layout="grid"
            columns={1}
            showQuickAccess={true}
          />
        </View>

        {/* Recent System Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent System Activities</Text>
          <Stack spacing={3}>
            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.success[100] }]}>
                  <Ionicons name="person-add" size={16} color={colors.success[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>New User Registration</Text>
                  <Text style={styles.activityDescription}>John Smith added as Student</Text>
                </Stack>
                <Text style={styles.activityTime}>5 min ago</Text>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.primary[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Security Scan Completed</Text>
                  <Text style={styles.activityDescription}>System security check passed</Text>
                </Stack>
                <Text style={styles.activityTime}>1h ago</Text>
              </HStack>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <HStack align="center" spacing={3}>
                <View style={[styles.activityIcon, { backgroundColor: colors.warning[100] }]}>
                  <Ionicons name="sync" size={16} color={colors.warning[600]} />
                </View>
                <Stack spacing={1} style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>Data Sync Completed</Text>
                  <Text style={styles.activityDescription}>
                    Cross-device synchronization successful
                  </Text>
                </Stack>
                <Text style={styles.activityTime}>2h ago</Text>
              </HStack>
            </EnhancedCard>
          </Stack>
        </View>
      </ScrollView>
    </ResponsiveLayout>
  );
};

// Helper function to get role colors
const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return colors.error[600];
    case 'faculty':
      return colors.success[600];
    case 'student':
      return colors.primary[600];
    default:
      return colors.gray[600];
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
    borderLeftColor: colors.error[500],
  },

  userInfo: {
    flex: 1,
  },

  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.error[600],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: '700' as const,
    color: colors.text.inverse,
  },

  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success[600],
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
    color: colors.error[600],
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

  subsectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '500' as const,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[3],
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

  // Role Distribution Styles
  roleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  roleText: {
    fontSize: typography.sizes.base,
    fontWeight: '500' as const,
    color: colors.text.primary,
  },

  roleCount: {
    fontSize: typography.sizes.lg,
    fontWeight: '700' as const,
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

export default EnhancedAdminDashboard;
