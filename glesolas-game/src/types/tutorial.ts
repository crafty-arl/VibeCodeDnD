export type TutorialStep =
  | 'welcome'
  | 'game-modes'
  | 'campaign-intro'
  | 'stats-explained'
  | 'deck-selection'
  | 'intro-scene'
  | 'challenge-explained'
  | 'card-selection'
  | 'stat-requirements'
  | 'action-paths'
  | 'resolution'
  | 'rewards'
  | 'next-encounter'
  | 'complete';

export interface TutorialState {
  active: boolean;
  currentStep: TutorialStep;
  completed: boolean;
  skipped: boolean;
}

export interface TutorialStepConfig {
  id: TutorialStep;
  title: string;
  message: string;
  target?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  canSkip?: boolean;
  autoAdvance?: boolean;
}
