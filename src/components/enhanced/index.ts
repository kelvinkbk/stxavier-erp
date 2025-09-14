// src/components/enhanced/index.ts
// Enhanced Components Export Index

// Core Enhanced Components
export { EnhancedButton } from './EnhancedButton';
export { EnhancedCard } from './EnhancedCard';

// Navigation Components
export {
  FloatingNavButton,
  NavigationPanel,
  NavigationPanelWithStats,
  type NavigationItem,
} from '../navigation/NavigationPanel';

// Layout Components
export {
  FlexLayout,
  Grid,
  HStack,
  ResponsiveLayout,
  SafeArea,
  Stack,
  useResponsiveValue,
} from './ResponsiveLayout';

// Advanced UI Components
export { AdvancedSearch, type SearchFilter, type SearchResult } from './AdvancedSearch';

export { EnhancedTable, type TableColumn, type TableProps } from './EnhancedTable';

export {
  EnhancedModal,
  useModal,
  type CustomModalProps,
  type EnhancedModalProps,
  type ModalAction,
} from './EnhancedModal';

export {
  EnhancedLoading,
  LoadingCard,
  LoadingProvider,
  SkeletonCircle,
  SkeletonLine,
  useLoading,
  type LoadingProps,
} from './EnhancedLoading';

// Enhanced Dashboard Components
export { EnhancedAdminDashboard } from '../../screens/Admin/EnhancedAdminDashboard';
export { EnhancedFacultyDashboard } from '../../screens/Faculty/EnhancedFacultyDashboard';
export { EnhancedStudentDashboard } from '../../screens/Student/EnhancedDashboard';

// Re-export design system for convenience
export {
  borderRadius,
  breakpoints,
  colors,
  shadows,
  spacing,
  typography,
} from '../../theme/design-system';
