import type { LoreCard, GamePhase, SkillCheck, RollResult, ActionPath } from '../types/game';

export interface GameSession {
  id: string;
  name: string;
  timestamp: number;
  glory: number;
  narrativeDice: number;
  phase: GamePhase;
  hand: LoreCard[];
  activeCards: LoreCard[];
  selectedCards: LoreCard[];
  introScene: string;
  currentChallenge: SkillCheck | null;
  availableActions: ActionPath[];
  lastResult: RollResult | null;
  transitionScene: string;
}

const SESSIONS_KEY = 'glesolas_sessions';
const AUTO_SAVE_KEY = 'glesolas_autosave';

export class SessionManager {
  static getAllSessions(): GameSession[] {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveSession(session: Omit<GameSession, 'id' | 'timestamp' | 'name'>, sessionName?: string): GameSession {
    const sessions = this.getAllSessions();

    const newSession: GameSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: sessionName || `Session ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
    };

    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    return newSession;
  }

  static updateSession(sessionId: string, updates: Partial<Omit<GameSession, 'id' | 'timestamp'>>): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.id === sessionId);

    if (index !== -1) {
      sessions[index] = {
        ...sessions[index],
        ...updates,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  static loadSession(sessionId: string): GameSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  static deleteSession(sessionId: string): void {
    const sessions = this.getAllSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  static autoSave(session: Omit<GameSession, 'id' | 'timestamp' | 'name'>, currentSessionId?: string | null): string {
    // First, save to auto-save slot for quick recovery
    const autoSave: GameSession = {
      ...session,
      id: AUTO_SAVE_KEY,
      name: 'Auto Save',
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSave));

    // Then, also save/update in the sessions list
    const sessions = this.getAllSessions();

    if (currentSessionId && currentSessionId !== AUTO_SAVE_KEY) {
      // Update existing session
      const index = sessions.findIndex(s => s.id === currentSessionId);
      if (index !== -1) {
        sessions[index] = {
          ...sessions[index],
          ...session,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
        return currentSessionId;
      }
    }

    // Create new session if no current session ID or not found
    const newSession: GameSession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Auto Session ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
    };
    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    return newSession.id;
  }

  static loadAutoSave(): GameSession | null {
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static clearAutoSave(): void {
    localStorage.removeItem(AUTO_SAVE_KEY);
  }
}
