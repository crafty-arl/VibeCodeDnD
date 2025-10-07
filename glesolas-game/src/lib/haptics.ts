/**
 * Haptic Feedback Utilities for Mobile Touch Interactions
 * Provides tactile feedback for enhanced mobile UX
 */

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticFeedback {
  vibrate: (pattern: number | number[]) => void;
  impact: (style: HapticFeedbackType) => void;
  selection: () => void;
  notification: (type: 'success' | 'warning' | 'error') => void;
}

class HapticsManager implements HapticFeedback {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  /**
   * Generic vibration pattern
   */
  vibrate(pattern: number | number[]) {
    if (!this.isSupported) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Haptic feedback failed:', e);
    }
  }

  /**
   * Impact feedback - for button presses and interactions
   */
  impact(style: HapticFeedbackType = 'light') {
    if (!this.isSupported) return;

    const patterns: Record<HapticFeedbackType, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: 15,
      warning: 25,
      error: 40,
    };

    this.vibrate(patterns[style]);
  }

  /**
   * Selection feedback - for picker/slider changes
   */
  selection() {
    this.vibrate(5);
  }

  /**
   * Notification feedback - for alerts and confirmations
   */
  notification(type: 'success' | 'warning' | 'error') {
    const patterns: Record<string, number[]> = {
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };

    this.vibrate(patterns[type]);
  }
}

export const haptics = new HapticsManager();

/**
 * React Hook for haptic feedback
 */
export function useHaptics() {
  const triggerHaptic = (type: HapticFeedbackType = 'light') => {
    haptics.impact(type);
  };

  return {
    triggerHaptic,
    haptics,
  };
}
