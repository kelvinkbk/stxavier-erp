// src/components/navigation/NavigationPanel.tsx
// Modern navigation panel for home screen sections

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../utils/AuthContext';
import {
  EnhancedCard,
  Grid,
  HStack,
  ResponsiveLayout,
  Stack,
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../enhanced';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface NavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  screenName?: string;
  onPress?: () => void;
  badge?: string | number;
  disabled?: boolean;
  roles?: ('admin' | 'faculty' | 'student')[];
}

interface NavigationPanelProps {
  title?: string;
  items: NavigationItem[];
  onNavigate?: (screenName: string, item: NavigationItem) => void;
  style?: any;
  layout?: 'grid' | 'list' | 'horizontal';
  columns?: number;
  showQuickAccess?: boolean;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  title = 'Navigation',
  items,
  onNavigate,
  style,
  layout = 'grid',
  columns = 2,
  showQuickAccess = true,
}) => {
  const { user } = useAuth();
  const [showAllItems, setShowAllItems] = useState(false);

  // Filter items based on user role
  const filteredItems = items.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const handleItemPress = (item: NavigationItem) => {
    if (item.disabled) return;

    if (item.onPress) {
      item.onPress();
    } else if (item.screenName && onNavigate) {
      onNavigate(item.screenName, item);
    }
  };

  const quickAccessItems = showQuickAccess ? filteredItems.slice(0, 6) : [];
  const allItems = filteredItems;

  const renderNavigationItem = (
    item: NavigationItem,
    index: number,
    isQuickAccess: boolean = false
  ) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.navigationItem,
        layout === 'horizontal' && styles.horizontalItem,
        item.disabled && styles.disabledItem,
      ]}
      onPress={() => handleItemPress(item)}
      disabled={item.disabled}
      activeOpacity={0.7}
    >
      <EnhancedCard
        variant="elevated"
        padding={isQuickAccess ? 4 : 3}
        style={{
          ...styles.itemCard,
          ...(layout === 'horizontal' && styles.horizontalCard),
          borderLeftColor: item.color,
          borderLeftWidth: 4,
        }}
      >
        <View style={styles.itemContent}>
          {/* Icon Container */}
          <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
            <Text style={[styles.itemIcon, { color: item.color }]}>{item.icon}</Text>
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <HStack align="center" justify="space-between">
              <Text
                style={[styles.itemTitle, layout === 'horizontal' && styles.horizontalTitle]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: item.color }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </HStack>

            {item.subtitle && (
              <Text
                style={[styles.itemSubtitle, layout === 'horizontal' && styles.horizontalSubtitle]}
                numberOfLines={2}
              >
                {item.subtitle}
              </Text>
            )}
          </View>

          {/* Arrow (for list/grid layout) */}
          {layout !== 'horizontal' && (
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </View>
          )}
        </View>
      </EnhancedCard>
    </TouchableOpacity>
  );

  const renderGridLayout = (items: NavigationItem[], isQuickAccess: boolean = false) => (
    <Grid cols={columns} spacing={3}>
      {items.map((item, index) => renderNavigationItem(item, index, isQuickAccess))}
    </Grid>
  );

  const renderListLayout = (items: NavigationItem[], isQuickAccess: boolean = false) => (
    <Stack spacing={2}>
      {items.map((item, index) => renderNavigationItem(item, index, isQuickAccess))}
    </Stack>
  );

  const renderHorizontalLayout = (items: NavigationItem[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      <HStack spacing={3} style={styles.horizontalContainer}>
        {items.map((item, index) => renderNavigationItem(item, index, false))}
      </HStack>
    </ScrollView>
  );

  const renderItems = (items: NavigationItem[], isQuickAccess: boolean = false) => {
    switch (layout) {
      case 'list':
        return renderListLayout(items, isQuickAccess);
      case 'horizontal':
        return renderHorizontalLayout(items);
      default:
        return renderGridLayout(items, isQuickAccess);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <HStack align="center" justify="space-between" style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showQuickAccess && filteredItems.length > 6 && (
          <TouchableOpacity onPress={() => setShowAllItems(true)} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons
              name="grid-outline"
              size={16}
              color={colors.primary[600]}
              style={{ marginLeft: spacing[1] }}
            />
          </TouchableOpacity>
        )}
      </HStack>

      {/* Quick Access Items */}
      {showQuickAccess && quickAccessItems.length > 0 && (
        <View style={styles.quickAccessContainer}>{renderItems(quickAccessItems, true)}</View>
      )}

      {/* All Items (if not showing quick access or in horizontal layout) */}
      {(!showQuickAccess || layout === 'horizontal') && (
        <View style={styles.allItemsContainer}>{renderItems(allItems, false)}</View>
      )}

      {/* Full Navigation Modal */}
      <Modal
        visible={showAllItems}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAllItems(false)}
      >
        <ResponsiveLayout style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Services</Text>
            <TouchableOpacity onPress={() => setShowAllItems(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalGrid}>{renderGridLayout(allItems, false)}</View>
          </ScrollView>
        </ResponsiveLayout>
      </Modal>
    </View>
  );
};

// Navigation Panel with Stats
interface NavPanelWithStatsProps extends NavigationPanelProps {
  stats?: {
    title: string;
    value: string | number;
    color: string;
    subtitle?: string;
  }[];
}

export const NavigationPanelWithStats: React.FC<NavPanelWithStatsProps> = ({
  stats = [],
  ...navigationProps
}) => {
  return (
    <Stack spacing={6}>
      {/* Stats Section */}
      {stats.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <Grid
            cols={stats.length <= 2 ? stats.length : 3}
            spacing={3}
            style={{ marginTop: spacing[3] }}
          >
            {stats.map((stat, index) => (
              <EnhancedCard key={index} variant="outlined" padding={4} style={styles.statCard}>
                <Stack align="center" spacing={1}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  {stat.subtitle && <Text style={styles.statSubtitle}>{stat.subtitle}</Text>}
                </Stack>
              </EnhancedCard>
            ))}
          </Grid>
        </View>
      )}

      {/* Navigation Panel */}
      <NavigationPanel {...navigationProps} />
    </Stack>
  );
};

// Floating Action Button for Navigation
interface FloatingNavButtonProps {
  items: NavigationItem[];
  onNavigate?: (screenName: string, item: NavigationItem) => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingNavButton: React.FC<FloatingNavButtonProps> = ({
  items,
  onNavigate,
  position = 'bottom-right',
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredItems = items
    .filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return user?.role && item.roles.includes(user.role);
    })
    .slice(0, 5); // Limit to 5 items for floating menu

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-left':
        return { ...baseStyles, bottom: 20, left: 20 };
      case 'top-right':
        return { ...baseStyles, top: 100, right: 20 };
      case 'top-left':
        return { ...baseStyles, top: 100, left: 20 };
      default:
        return { ...baseStyles, bottom: 20, right: 20 };
    }
  };

  const handleItemPress = (item: NavigationItem) => {
    setIsExpanded(false);

    if (item.onPress) {
      item.onPress();
    } else if (item.screenName && onNavigate) {
      onNavigate(item.screenName, item);
    }
  };

  return (
    <View style={[styles.floatingContainer, getPositionStyles()]}>
      {/* Expanded Menu Items */}
      {isExpanded && (
        <View style={styles.floatingMenu}>
          {filteredItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.floatingMenuItem, { backgroundColor: item.color }]}
              onPress={() => handleItemPress(item)}
            >
              <Text style={styles.floatingMenuIcon}>{item.icon}</Text>
              <Text style={styles.floatingMenuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Floating Button */}
      <TouchableOpacity
        style={[styles.floatingButton, isExpanded && styles.floatingButtonExpanded]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isExpanded ? 'close' : 'menu'}
          size={24}
          color="white"
          style={[isExpanded && { transform: [{ rotate: '180deg' }] }]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginBottom: spacing[4],
  },

  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
  },

  viewAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.primary[600],
  },

  quickAccessContainer: {
    marginBottom: spacing[4],
  },

  allItemsContainer: {
    flex: 1,
  },

  navigationItem: {
    flex: 1,
  },

  horizontalItem: {
    width: screenWidth * 0.7,
    maxWidth: 280,
  },

  disabledItem: {
    opacity: 0.5,
  },

  itemCard: {
    height: '100%',
    minHeight: 80,
  },

  horizontalCard: {
    minHeight: 100,
  },

  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },

  itemIcon: {
    fontSize: 20,
  },

  textContainer: {
    flex: 1,
    marginRight: spacing[2],
  },

  itemTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600' as const,
    color: colors.text.primary,
    flex: 1,
  },

  horizontalTitle: {
    fontSize: typography.sizes.lg,
  },

  itemSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
    lineHeight: typography.lineHeights.relaxed,
  },

  horizontalSubtitle: {
    fontSize: typography.sizes.base,
  },

  arrowContainer: {
    padding: spacing[1],
  },

  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },

  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700' as const,
    color: colors.text.inverse,
  },

  horizontalScroll: {
    flexGrow: 0,
  },

  horizontalContainer: {
    paddingHorizontal: spacing[4],
  },

  // Stats Styles
  statCard: {
    backgroundColor: colors.background,
  },

  statValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700' as const,
  },

  statTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  statSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingTop: Platform.OS === 'ios' ? 60 : spacing[6],
  },

  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  closeButton: {
    padding: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },

  modalContent: {
    flex: 1,
  },

  modalGrid: {
    padding: spacing[6],
  },

  // Floating Action Button Styles
  floatingContainer: {
    alignItems: 'flex-end',
  },

  floatingMenu: {
    marginBottom: spacing[3],
    alignItems: 'flex-end',
    gap: spacing[2],
  },

  floatingMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    minWidth: 120,
    ...shadows.lg,
  },

  floatingMenuIcon: {
    fontSize: 16,
    marginRight: spacing[2],
  },

  floatingMenuText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.inverse,
  },

  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },

  floatingButtonExpanded: {
    backgroundColor: colors.gray[600],
  },
});

export default NavigationPanel;
