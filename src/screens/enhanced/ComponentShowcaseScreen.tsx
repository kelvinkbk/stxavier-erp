// src/screens/enhanced/ComponentShowcaseScreen.tsx
// Comprehensive showcase of all enhanced components

import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  AdvancedSearch,
  EnhancedButton,
  EnhancedCard,
  EnhancedLoading,
  EnhancedTable,
  Grid,
  HStack,
  LoadingCard,
  ResponsiveLayout,
  SkeletonLine,
  Stack,
  borderRadius,
  colors,
  spacing,
  typography,
  useModal,
  type CustomModalProps,
  type SearchFilter,
  type TableColumn,
} from '../../components/enhanced';

// Sample data for table
const sampleData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Teacher',
    status: 'Active',
    joinDate: '2023-02-20',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Student',
    status: 'Inactive',
    joinDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Teacher',
    status: 'Active',
    joinDate: '2023-01-30',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'Student',
    status: 'Active',
    joinDate: '2023-04-05',
  },
];

export const ComponentShowcaseScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLoadingDemo, setShowLoadingDemo] = useState(false);

  const { showModal, showAlert, showConfirm, ModalContainer } = useModal();

  // Table columns configuration
  const tableColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
      render: (value, item) => <Text style={styles.nameText}>{value}</Text>,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Teacher', label: 'Teacher' },
        { value: 'Student', label: 'Student' },
      ],
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
      render: value => (
        <View
          style={[
            styles.statusBadge,
            value === 'Active' ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              value === 'Active' ? styles.statusTextActive : styles.statusTextInactive,
            ]}
          >
            {value}
          </Text>
        </View>
      ),
    },
    {
      key: 'joinDate',
      title: 'Join Date',
      sortable: true,
      align: 'center',
    },
  ];

  // Search filters configuration
  const searchFilters: SearchFilter[] = [
    {
      id: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Teacher', label: 'Teacher' },
        { value: 'Student', label: 'Student' },
      ],
      value: null,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
      value: null,
    },
    {
      id: 'joinYear',
      label: 'Join Year',
      type: 'text',
      placeholder: 'Enter year (e.g., 2023)',
      value: '',
    },
  ];

  const handleSearch = (query: string, filters: SearchFilter[]) => {
    let filteredData = sampleData;

    // Apply text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredData = filteredData.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.email.toLowerCase().includes(searchTerm) ||
          item.role.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.value) {
        if (filter.id === 'role' || filter.id === 'status') {
          filteredData = filteredData.filter(item => item[filter.id] === filter.value);
        } else if (filter.id === 'joinYear') {
          filteredData = filteredData.filter(item => item.joinDate.includes(filter.value));
        }
      }
    });

    return {
      items: filteredData,
      totalCount: filteredData.length,
    };
  };

  const demoLoadingStates = async () => {
    setShowLoadingDemo(true);

    // Simulate different loading states
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowLoadingDemo(false);
  };

  const showCustomModal = () => {
    const modalProps: Omit<CustomModalProps, 'visible' | 'onClose'> = {
      type: 'custom',
      title: 'Custom Modal Example',
      subtitle: 'This modal contains custom content',
      size: 'md',
      children: (
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>This is a custom modal with enhanced features:</Text>

          <Stack spacing={3} style={{ marginTop: spacing[4] }}>
            <EnhancedCard variant="outlined" padding={3}>
              <Text style={styles.featureText}>✅ Responsive sizing</Text>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={3}>
              <Text style={styles.featureText}>✅ Custom animations</Text>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={3}>
              <Text style={styles.featureText}>✅ Flexible positioning</Text>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={3}>
              <Text style={styles.featureText}>✅ Keyboard handling</Text>
            </EnhancedCard>
          </Stack>

          <HStack spacing={3} justify="space-between" style={{ marginTop: spacing[6] }}>
            <EnhancedButton
              title="Secondary Action"
              variant="secondary"
              onPress={() => Alert.alert('Secondary action pressed!')}
              style={{ flex: 1 }}
            />
            <EnhancedButton
              title="Primary Action"
              variant="primary"
              onPress={() => Alert.alert('Primary action pressed!')}
              style={{ flex: 1 }}
            />
          </HStack>
        </View>
      ),
    } as const;

    showModal(modalProps);
  };

  return (
    <ResponsiveLayout style={styles.container}>
      {/* Header */}
      <EnhancedCard variant="elevated" padding={6} style={styles.headerCard}>
        <Stack spacing={2} align="center">
          <Text style={styles.title}>Enhanced Components Showcase</Text>
          <Text style={styles.subtitle}>
            Demonstrating all enhanced ERP components with modern design and functionality
          </Text>
        </Stack>
      </EnhancedCard>

      {/* Component Sections */}
      <Stack spacing={6} style={styles.content}>
        {/* Buttons Section */}
        <EnhancedCard variant="outlined" padding={6}>
          <Text style={styles.sectionTitle}>Enhanced Buttons</Text>
          <Text style={styles.sectionDescription}>
            Modern button component with various variants, sizes, and states
          </Text>

          <Grid cols={2} spacing={3} style={{ marginTop: spacing[4] }}>
            <EnhancedButton title="Primary" variant="primary" onPress={() => {}} />
            <EnhancedButton title="Secondary" variant="secondary" onPress={() => {}} />
            <EnhancedButton title="Success" variant="success" onPress={() => {}} />
            <EnhancedButton title="Warning" variant="warning" onPress={() => {}} />
            <EnhancedButton title="Error" variant="error" onPress={() => {}} />
            <EnhancedButton title="Ghost" variant="ghost" onPress={() => {}} />
          </Grid>

          <HStack spacing={3} style={{ marginTop: spacing[4] }}>
            <EnhancedButton title="Small" size="sm" variant="primary" onPress={() => {}} />
            <EnhancedButton title="Medium" size="md" variant="primary" onPress={() => {}} />
            <EnhancedButton title="Large" size="lg" variant="primary" onPress={() => {}} />
          </HStack>
        </EnhancedCard>

        {/* Cards Section */}
        <EnhancedCard variant="outlined" padding={6}>
          <Text style={styles.sectionTitle}>Enhanced Cards</Text>
          <Text style={styles.sectionDescription}>
            Flexible card component with multiple variants and elevation levels
          </Text>

          <Grid cols={2} spacing={4} style={{ marginTop: spacing[4] }}>
            <EnhancedCard variant="default" padding={4}>
              <Text style={styles.cardTitle}>Default Card</Text>
              <Text style={styles.cardText}>Standard card design</Text>
            </EnhancedCard>

            <EnhancedCard variant="elevated" padding={4}>
              <Text style={styles.cardTitle}>Elevated Card</Text>
              <Text style={styles.cardText}>Card with shadow elevation</Text>
            </EnhancedCard>

            <EnhancedCard variant="outlined" padding={4}>
              <Text style={styles.cardTitle}>Outlined Card</Text>
              <Text style={styles.cardText}>Card with border outline</Text>
            </EnhancedCard>

            <EnhancedCard variant="flat" padding={4}>
              <Text style={styles.cardTitle}>Flat Card</Text>
              <Text style={styles.cardText}>Minimalist flat design</Text>
            </EnhancedCard>
          </Grid>
        </EnhancedCard>

        {/* Modals Section */}
        <EnhancedCard variant="outlined" padding={6}>
          <Text style={styles.sectionTitle}>Enhanced Modals</Text>
          <Text style={styles.sectionDescription}>
            Advanced modal system with various types and animations
          </Text>

          <HStack spacing={3} style={{ marginTop: spacing[4] }}>
            <EnhancedButton
              title="Show Alert"
              variant="primary"
              onPress={() =>
                showAlert('This is an enhanced alert modal!', {
                  title: 'Alert Example',
                  variant: 'info',
                  icon: '💡',
                })
              }
            />

            <EnhancedButton
              title="Show Confirm"
              variant="warning"
              onPress={() =>
                showConfirm(
                  'Are you sure you want to perform this action?',
                  () => Alert.alert('Confirmed!'),
                  {
                    title: 'Confirm Action',
                    variant: 'warning',
                    confirmTitle: 'Yes, Do It',
                    cancelTitle: 'Cancel',
                  }
                )
              }
            />

            <EnhancedButton title="Custom Modal" variant="secondary" onPress={showCustomModal} />
          </HStack>
        </EnhancedCard>

        {/* Table Section */}
        <EnhancedCard variant="outlined" padding={6}>
          <Text style={styles.sectionTitle}>Enhanced Table</Text>
          <Text style={styles.sectionDescription}>
            Advanced data table with sorting, filtering, pagination, and selection
          </Text>

          <EnhancedButton
            title={showTable ? 'Hide Table Demo' : 'Show Table Demo'}
            variant="primary"
            onPress={() => setShowTable(!showTable)}
            style={{ marginTop: spacing[4] }}
          />

          {showTable && (
            <View style={{ marginTop: spacing[4] }}>
              <EnhancedTable
                data={sampleData}
                columns={tableColumns}
                keyExtractor={item => item.id}
                selectable
                multiSelect
                onSelectionChange={setSelectedUsers}
                searchable
                searchPlaceholder="Search users..."
                pagination={{
                  enabled: true,
                  pageSize: 3,
                  showPageInfo: true,
                  showPageSizeSelector: true,
                  pageSizeOptions: [3, 5, 10],
                }}
                striped
                hoverable
                actions={[
                  {
                    title: 'Edit',
                    variant: 'primary',
                    onPress: user => Alert.alert('Edit User', `Editing ${user.name}`),
                  },
                  {
                    title: 'Delete',
                    variant: 'error',
                    onPress: user => Alert.alert('Delete User', `Deleting ${user.name}`),
                  },
                ]}
              />
            </View>
          )}
        </EnhancedCard>

        {/* Search Section */}
        <EnhancedCard variant="outlined" padding={6}>
          <Text style={styles.sectionTitle}>Advanced Search</Text>
          <Text style={styles.sectionDescription}>
            Comprehensive search with filters, suggestions, and real-time results
          </Text>

          <EnhancedButton
            title={showSearch ? 'Hide Search Demo' : 'Show Search Demo'}
            variant="primary"
            onPress={() => setShowSearch(!showSearch)}
            style={{ marginTop: spacing[4] }}
          />

          {showSearch && (
            <View style={{ marginTop: spacing[4], height: 400 }}>
              <AdvancedSearch
                data={sampleData}
                onSearch={handleSearch}
                onResultSelect={user => Alert.alert('Selected User', user.name)}
                filters={searchFilters}
                placeholder="Search users by name, email, or role..."
                showResultCount
                recentSearches={['John', 'Teacher', 'Active users']}
                renderResult={(user, index) => (
                  <EnhancedCard
                    key={user.id}
                    variant="outlined"
                    padding={4}
                    style={{ marginBottom: spacing[2] }}
                  >
                    <HStack spacing={3} align="center">
                      <View style={styles.userAvatar}>
                        <Text style={styles.userInitial}>{user.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <Stack spacing={1} style={{ flex: 1 }}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <HStack spacing={2}>
                          <Text style={styles.userRole}>{user.role}</Text>
                          <View
                            style={[
                              styles.statusDot,
                              user.status === 'Active'
                                ? styles.statusDotActive
                                : styles.statusDotInactive,
                            ]}
                          />
                        </HStack>
                      </Stack>
                    </HStack>
                  </EnhancedCard>
                )}
              />
            </View>
          )}
        </EnhancedCard>

        {/* Loading Section */}
        <EnhancedCard variant="outlined" padding={6}>
          <Text style={styles.sectionTitle}>Enhanced Loading</Text>
          <Text style={styles.sectionDescription}>
            Various loading states and skeleton components for better UX
          </Text>

          <Grid cols={2} spacing={4} style={{ marginTop: spacing[4] }}>
            <View style={styles.loadingDemo}>
              <Text style={styles.loadingTitle}>Spinner</Text>
              <EnhancedLoading type="spinner" size="md" />
            </View>

            <View style={styles.loadingDemo}>
              <Text style={styles.loadingTitle}>Dots</Text>
              <EnhancedLoading type="dots" size="md" />
            </View>

            <View style={styles.loadingDemo}>
              <Text style={styles.loadingTitle}>Pulse</Text>
              <EnhancedLoading type="pulse" size="md" />
            </View>

            <View style={styles.loadingDemo}>
              <Text style={styles.loadingTitle}>Progress</Text>
              <EnhancedLoading type="progress" progress={65} text="Loading" />
            </View>
          </Grid>

          <Stack spacing={3} style={{ marginTop: spacing[6] }}>
            <Text style={styles.loadingTitle}>Skeleton Components</Text>
            <LoadingCard rows={4} showAvatar showImage />

            <View>
              <SkeletonLine height={20} width="60%" style={{ marginBottom: spacing[2] }} />
              <SkeletonLine height={14} width="100%" style={{ marginBottom: spacing[1] }} />
              <SkeletonLine height={14} width="80%" style={{ marginBottom: spacing[1] }} />
              <SkeletonLine height={14} width="90%" />
            </View>
          </Stack>

          <EnhancedButton
            title="Demo Full Screen Loading"
            variant="secondary"
            onPress={demoLoadingStates}
            style={{ marginTop: spacing[4] }}
          />

          {showLoadingDemo && (
            <EnhancedLoading type="spinner" text="Loading components..." overlay fullScreen />
          )}
        </EnhancedCard>
      </Stack>

      {/* Modal Container */}
      <ModalContainer />
    </ResponsiveLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },

  headerCard: {
    margin: spacing[4],
    marginBottom: 0,
  },

  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },

  content: {
    padding: spacing[4],
  },

  sectionTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },

  sectionDescription: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.relaxed,
  },

  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '500' as const,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },

  cardText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  modalContent: {
    paddingVertical: spacing[2],
  },

  modalText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },

  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },

  nameText: {
    fontWeight: '500' as const,
    color: colors.text.primary,
  },

  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },

  statusActive: {
    backgroundColor: colors.success[100],
  },

  statusInactive: {
    backgroundColor: colors.gray[100],
  },

  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500' as const,
  },

  statusTextActive: {
    color: colors.success[700],
  },

  statusTextInactive: {
    color: colors.gray[700],
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  userInitial: {
    fontSize: typography.sizes.lg,
    fontWeight: '600' as const,
    color: colors.primary[700],
  },

  userName: {
    fontSize: typography.sizes.base,
    fontWeight: '500' as const,
    color: colors.text.primary,
  },

  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  userRole: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing[1],
  },

  statusDotActive: {
    backgroundColor: colors.success[500],
  },

  statusDotInactive: {
    backgroundColor: colors.gray[400],
  },

  loadingDemo: {
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },

  loadingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
});

export default ComponentShowcaseScreen;
