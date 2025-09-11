// src/utils/navigationDebug.ts
// Navigation debugging utility

export class NavigationDebug {
  /**
   * Test navigation functionality for dashboards
   */
  static testNavigation(navigation: any, screenName: string): boolean {
    console.log(`🧪 Testing navigation to: ${screenName}`);
    
    if (!navigation) {
      console.error('❌ Navigation object is null/undefined');
      return false;
    }
    
    if (!navigation.navigate) {
      console.error('❌ Navigation.navigate function is missing');
      return false;
    }
    
    try {
      // Try to get navigation state
      const state = navigation.getState?.();
      console.log('📊 Navigation state:', state?.routeNames || 'Unknown');
      
      // List available routes
      if (state?.routeNames) {
        console.log('📋 Available routes:', state.routeNames);
        
        if (!state.routeNames.includes(screenName)) {
          console.warn(`⚠️ Route '${screenName}' not found in available routes`);
          return false;
        }
      }
      
      console.log(`✅ Navigation to '${screenName}' should work`);
      return true;
    } catch (error) {
      console.error(`❌ Navigation test failed for '${screenName}':`, error);
      return false;
    }
  }
  
  /**
   * Get list of available routes
   */
  static getAvailableRoutes(navigation: any): string[] {
    try {
      const state = navigation.getState?.();
      return state?.routeNames || [];
    } catch {
      return [];
    }
  }
  
  /**
   * Safe navigation with error handling
   */
  static safeNavigate(navigation: any, screenName: string, params?: any): boolean {
    if (!this.testNavigation(navigation, screenName)) {
      return false;
    }
    
    try {
      navigation.navigate(screenName, params);
      console.log(`✅ Successfully navigated to: ${screenName}`);
      return true;
    } catch (error) {
      console.error(`❌ Navigation failed for '${screenName}':`, error);
      return false;
    }
  }
  
  /**
   * Debug all navigation issues in one go
   */
  static debugAllNavigation(navigation: any): {
    isWorking: boolean;
    availableRoutes: string[];
    issues: string[];
  } {
    const issues: string[] = [];
    const availableRoutes = this.getAvailableRoutes(navigation);
    
    if (!navigation) {
      issues.push('Navigation object is missing');
    }
    
    if (!navigation?.navigate) {
      issues.push('Navigation.navigate function is missing');
    }
    
    if (availableRoutes.length === 0) {
      issues.push('No routes available or unable to get route list');
    }
    
    const result = {
      isWorking: issues.length === 0,
      availableRoutes,
      issues
    };
    
    console.log('🔍 Navigation Debug Report:', result);
    return result;
  }
}

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).NavigationDebug = NavigationDebug;
}

export default NavigationDebug;
