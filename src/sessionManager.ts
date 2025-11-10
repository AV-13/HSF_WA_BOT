/**
 * Session manager for tracking user conversations
 */

import { BOT_CONFIG } from './config.js';

export interface UserSession {
  userId: string;
  isFirstTime: boolean;
  lastIntent?: string;
  lastMessageTime: number;
  messageCount: number;
}

class SessionManager {
  private sessions: Map<string, UserSession> = new Map();

  /**
   * Gets or creates a session for a user
   */
  getSession(userId: string): UserSession {
    let session = this.sessions.get(userId);

    if (!session) {
      session = {
        userId,
        isFirstTime: true,
        lastMessageTime: Date.now(),
        messageCount: 0,
      };
      this.sessions.set(userId, session);
    }

    return session;
  }

  /**
   * Updates a user's session
   */
  updateSession(userId: string, updates: Partial<UserSession>): void {
    const session = this.getSession(userId);
    Object.assign(session, updates, { lastMessageTime: Date.now() });
    this.sessions.set(userId, session);
  }

  /**
   * Checks if session has timed out
   */
  isSessionExpired(userId: string): boolean {
    const session = this.sessions.get(userId);
    if (!session) return true;

    const timeSinceLastMessage = Date.now() - session.lastMessageTime;
    return timeSinceLastMessage > BOT_CONFIG.sessionTimeout;
  }

  /**
   * Increments message count for a user
   */
  incrementMessageCount(userId: string): void {
    const session = this.getSession(userId);
    session.messageCount++;
    this.updateSession(userId, { messageCount: session.messageCount });
  }

  /**
   * Marks user as no longer first-time
   */
  markAsReturning(userId: string): void {
    this.updateSession(userId, { isFirstTime: false });
  }

  /**
   * Sets the last intent for context-aware responses
   */
  setLastIntent(userId: string, intent: string): void {
    this.updateSession(userId, { lastIntent: intent });
  }

  /**
   * Clears expired sessions (cleanup)
   */
  clearExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.lastMessageTime > BOT_CONFIG.sessionTimeout) {
        this.sessions.delete(userId);
      }
    }
  }

  /**
   * Gets total active sessions
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}

export const sessionManager = new SessionManager();