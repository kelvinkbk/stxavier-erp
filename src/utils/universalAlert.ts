// src/utils/universalAlert.ts
// Universal alert system that works on both web and mobile

import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export class UniversalAlert {
  
  /**
   * Show alert that works on both web and mobile
   */
  static alert(
    title: string, 
    message?: string, 
    buttons?: AlertButton[]
  ): void {
    if (Platform.OS === 'web') {
      // Web implementation using browser dialogs
      this.webAlert(title, message, buttons);
    } else {
      // Mobile implementation using React Native Alert
      this.mobileAlert(title, message, buttons);
    }
  }
  
  /**
   * Simple alert for web using browser alert()
   */
  static webAlert(
    title: string, 
    message?: string, 
    buttons?: AlertButton[]
  ): void {
    const fullMessage = message ? `${title}\n\n${message}` : title;
    
    if (buttons && buttons.length > 1) {
      // For multiple buttons, use confirm dialog
      const confirmButton = buttons.find(btn => btn.style !== 'cancel');
      const cancelButton = buttons.find(btn => btn.style === 'cancel');
      
      const confirmed = confirm(fullMessage);
      
      if (confirmed && confirmButton?.onPress) {
        confirmButton.onPress();
      } else if (!confirmed && cancelButton?.onPress) {
        cancelButton.onPress();
      }
    } else {
      // Simple alert
      alert(fullMessage);
      // Only call onPress if we have buttons and the first button has an onPress function
      if (buttons && buttons.length > 0 && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  }
  
  /**
   * Mobile alert using React Native Alert
   */
  static mobileAlert(
    title: string, 
    message?: string, 
    buttons?: AlertButton[]
  ): void {
    Alert.alert(title, message, buttons as any);
  }
  
  /**
   * Show error alert
   */
  static error(message: string, onPress?: () => void): void {
    this.alert('Error', message, onPress ? [{ text: 'OK', onPress }] : [{ text: 'OK' }]);
  }
  
  /**
   * Show success alert
   */
  static success(message: string, onPress?: () => void): void {
    this.alert('Success', message, onPress ? [{ text: 'OK', onPress }] : [{ text: 'OK' }]);
  }
  
  /**
   * Show info alert
   */
  static info(title: string, message?: string, onPress?: () => void): void {
    this.alert(title, message, onPress ? [{ text: 'OK', onPress }] : [{ text: 'OK' }]);
  }
  
  /**
   * Show warning alert
   */
  static warning(message: string, onPress?: () => void): void {
    this.alert('Warning', message, onPress ? [{ text: 'OK', onPress }] : [{ text: 'OK' }]);
  }
  
  /**
   * Show confirmation dialog
   */
  static confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ): void {
    this.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm }
    ]);
  }
  
  /**
   * Enhanced log and alert for debugging
   */
  static debugAlert(title: string, message: string, data?: any): void {
    console.log(`[DEBUG ALERT] ${title}: ${message}`, data || '');
    this.alert(`🐛 ${title}`, message);
  }
}

export default UniversalAlert;
