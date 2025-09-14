// src/components/enhanced/EnhancedModal.tsx
// Advanced modal system with various types and features

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../../theme/design-system';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

export interface ModalAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  closeOnBackdrop?: boolean;
  closeOnBackButton?: boolean;
  showCloseButton?: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  position?: 'center' | 'bottom' | 'top' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  maxHeight?: number;
  children?: React.ReactNode;
  actions?: ModalAction[];
  loading?: boolean;
  scrollable?: boolean;
}

interface AlertModalProps extends Omit<BaseModalProps, 'children'> {
  type: 'alert';
  message: string;
  icon?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

interface ConfirmModalProps extends Omit<BaseModalProps, 'children'> {
  type: 'confirm';
  message: string;
  confirmTitle?: string;
  cancelTitle?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export interface CustomModalProps extends BaseModalProps {
  type: 'custom';
}

export type EnhancedModalProps = AlertModalProps | ConfirmModalProps | CustomModalProps;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const EnhancedModal: React.FC<EnhancedModalProps> = props => {
  const {
    visible,
    onClose,
    title,
    subtitle,
    closeOnBackdrop = true,
    closeOnBackButton = true,
    showCloseButton = true,
    animationType = 'fade',
    position = 'center',
    size = 'md',
    maxHeight,
    actions = [],
    loading = false,
    scrollable = true,
  } = props;

  const [modalVisible, setModalVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      startShowAnimation();
    } else {
      startHideAnimation();
    }
  }, [visible]);

  useEffect(() => {
    const handleBackPress = () => {
      if (visible && closeOnBackButton) {
        onClose();
        return true;
      }
      return false;
    };

    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }
  }, [visible, closeOnBackButton, onClose]);

  const startShowAnimation = () => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ];

    if (animationType === 'scale') {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'slide') {
      animations.push(
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const startHideAnimation = () => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ];

    if (animationType === 'scale') {
      animations.push(
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        })
      );
    } else if (animationType === 'slide') {
      animations.push(
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start(() => {
      setModalVisible(false);
    });
  };

  const getModalSize = () => {
    switch (size) {
      case 'sm':
        return { width: Math.min(screenWidth * 0.8, 400), maxHeight: screenHeight * 0.6 };
      case 'md':
        return { width: Math.min(screenWidth * 0.9, 500), maxHeight: screenHeight * 0.7 };
      case 'lg':
        return { width: Math.min(screenWidth * 0.95, 600), maxHeight: screenHeight * 0.8 };
      case 'xl':
        return { width: Math.min(screenWidth * 0.98, 800), maxHeight: screenHeight * 0.9 };
      default:
        return { width: 'auto', maxHeight: screenHeight * 0.8 };
    }
  };

  const getModalStyle = () => {
    const baseStyle = {
      opacity: fadeAnim,
    };

    if (animationType === 'scale') {
      return {
        ...baseStyle,
        transform: [{ scale: scaleAnim }],
      };
    } else if (animationType === 'slide' && position === 'bottom') {
      return {
        ...baseStyle,
        transform: [{ translateY: slideAnim }],
      };
    }

    return baseStyle;
  };

  const getContainerStyle = () => {
    const sizeStyles = getModalSize();

    switch (position) {
      case 'top':
        return [styles.modalContainer, styles.topPosition, sizeStyles];
      case 'bottom':
        return [styles.modalContainer, styles.bottomPosition, sizeStyles];
      case 'fullscreen':
        return [styles.modalContainer, styles.fullscreenPosition];
      default:
        return [styles.modalContainer, styles.centerPosition, sizeStyles];
    }
  };

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case 'success':
        return {
          borderColor: colors.success[300],
          backgroundColor: colors.success[50],
          iconColor: colors.success[600],
        };
      case 'warning':
        return {
          borderColor: colors.warning[300],
          backgroundColor: colors.warning[50],
          iconColor: colors.warning[600],
        };
      case 'error':
        return {
          borderColor: colors.error[300],
          backgroundColor: colors.error[50],
          iconColor: colors.error[600],
        };
      default:
        return {
          borderColor: colors.primary[300],
          backgroundColor: colors.primary[50],
          iconColor: colors.primary[600],
        };
    }
  };

  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>

        {showCloseButton && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (props.type === 'alert') {
      const variantStyles = getVariantStyles(props.variant);

      return (
        <View style={[styles.alertContainer, { backgroundColor: variantStyles.backgroundColor }]}>
          {props.icon && (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color: variantStyles.iconColor }]}>{props.icon}</Text>
            </View>
          )}
          <Text style={styles.message}>{props.message}</Text>
        </View>
      );
    }

    if (props.type === 'confirm') {
      const variantStyles = getVariantStyles(props.variant);

      return (
        <View style={[styles.confirmContainer, { backgroundColor: variantStyles.backgroundColor }]}>
          <Text style={styles.message}>{props.message}</Text>
        </View>
      );
    }

    if (props.type === 'custom') {
      return props.children;
    }

    return null;
  };

  const renderActions = () => {
    let modalActions = actions;

    // Add default actions for specific modal types
    if (props.type === 'alert' && actions.length === 0) {
      modalActions = [
        {
          title: 'OK',
          onPress: onClose,
          variant: 'primary' as const,
        },
      ];
    }

    if (props.type === 'confirm' && actions.length === 0) {
      modalActions = [
        {
          title: props.cancelTitle || 'Cancel',
          onPress: () => {
            props.onCancel?.();
            onClose();
          },
          variant: 'secondary' as const,
        },
        {
          title: props.confirmTitle || 'Confirm',
          onPress: () => {
            props.onConfirm();
            onClose();
          },
          variant: props.variant === 'error' ? 'error' : ('primary' as const),
        },
      ];
    }

    if (modalActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {modalActions.map((action, index) => (
          <EnhancedButton
            key={index}
            title={action.title}
            onPress={action.onPress}
            variant={action.variant || 'secondary'}
            loading={action.loading}
            disabled={action.disabled}
            style={{
              ...styles.actionButton,
              ...(index === modalActions.length - 1 ? styles.lastActionButton : {}),
            }}
          />
        ))}
      </View>
    );
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop && !loading) {
      onClose();
    }
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <Animated.View style={[getContainerStyle(), getModalStyle()]}>
          <EnhancedCard
            variant="elevated"
            padding={0}
            style={{
              ...styles.modal,
              ...(position === 'fullscreen' ? styles.fullscreenModal : {}),
              ...(maxHeight ? { maxHeight } : {}),
            }}
          >
            {/* Loading Overlay */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              </View>
            )}

            {renderHeader()}

            {/* Content */}
            {scrollable ? (
              <ScrollView
                style={styles.contentScrollable}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.contentContainer}>{renderContent()}</View>
              </ScrollView>
            ) : (
              <View style={styles.contentContainer}>{renderContent()}</View>
            )}

            {renderActions()}
          </EnhancedCard>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Hook for managing modals
export const useModal = () => {
  const [modals, setModals] = useState<{ id: string; props: EnhancedModalProps }[]>([]);

  const showModal = (props: Omit<EnhancedModalProps, 'visible' | 'onClose'>) => {
    const id = Date.now().toString();
    const modalProps: EnhancedModalProps = {
      ...props,
      visible: true,
      onClose: () => closeModal(id),
    } as EnhancedModalProps;

    setModals(prev => [...prev, { id, props: modalProps }]);
    return id;
  };

  const closeModal = (id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  const closeAllModals = () => {
    setModals([]);
  };

  // Convenience methods
  const showAlert = (message: string, options?: Partial<AlertModalProps>) => {
    return showModal({
      type: 'alert',
      message,
      ...options,
    } as AlertModalProps);
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    options?: Partial<ConfirmModalProps>
  ) => {
    return showModal({
      type: 'confirm',
      message,
      onConfirm,
      ...options,
    } as ConfirmModalProps);
  };

  const ModalContainer = () => (
    <>
      {modals.map(({ id, props }) => (
        <EnhancedModal key={id} {...props} />
      ))}
    </>
  );

  return {
    showModal,
    closeModal,
    closeAllModals,
    showAlert,
    showConfirm,
    ModalContainer,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  backdropTouchable: {
    flex: 1,
  },

  modalContainer: {
    maxWidth: '90%',
    maxHeight: '80%',
  },

  centerPosition: {
    // Default centered position
  },

  topPosition: {
    position: 'absolute',
    top: spacing[8],
    alignSelf: 'center',
  },

  bottomPosition: {
    position: 'absolute',
    bottom: spacing[8],
    alignSelf: 'center',
  },

  fullscreenPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: '100%',
    maxHeight: '100%',
  },

  modal: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },

  fullscreenModal: {
    borderRadius: 0,
    flex: 1,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  loadingContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    ...shadows.lg,
  },

  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing[6],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  titleContainer: {
    flex: 1,
    marginRight: spacing[4],
  },

  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },

  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.relaxed,
  },

  closeButton: {
    padding: spacing[2],
    marginTop: -spacing[2],
    marginRight: -spacing[2],
  },

  closeButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.text.secondary,
  },

  contentContainer: {
    padding: spacing[6],
    paddingTop: spacing[4],
  },

  contentScrollable: {
    maxHeight: screenHeight * 0.6,
  },

  alertContainer: {
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  confirmContainer: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  iconContainer: {
    marginBottom: spacing[4],
  },

  icon: {
    fontSize: 48,
  },

  message: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    padding: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },

  actionButton: {
    minWidth: 80,
  },

  lastActionButton: {
    // Additional styles for the last action button
  },
});

export default EnhancedModal;
