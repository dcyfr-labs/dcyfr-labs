import { Redis } from '@upstash/redis';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Parse Redis URL to extract credentials for Upstash REST API
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  const token = parsed.password;
  const host = parsed.hostname;
  const port = parsed.port;
  // Convert to Upstash REST API format
  const restUrl = `https://${host}:${port}`;
  return { url: restUrl, token };
}

const redis = process.env.REDIS_URL ? (() => {
  const { url, token } = parseRedisUrl(process.env.REDIS_URL);
  return new Redis({ url, token });
})() : null;

/**
 * Secure Session Manager
 * 
 * Provides encrypted session storage in Redis for authentication across all environments.
 * Features:
 * - AES-256-GCM encryption for all session data
 * - Automatic session expiration
 * - Cross-environment compatibility (Dev, Preview, Production)
 * - Secure session token generation
 * - Built-in CSRF protection
 */

interface SessionData {
  userId?: string;
  email?: string;
  permissions?: string[];
  lastActivity?: number;
  csrfToken?: string;
  [key: string]: any;
}

interface EncryptedData {
  iv: string;
  authTag: string;
  encrypted: string;
}

export class SecureSessionManager {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly DEFAULT_EXPIRY = 24 * 60 * 60; // 24 hours in seconds
  private static readonly ALGORITHM = 'aes-256-gcm';
  
  /**
   * Get encryption key from environment (must be 32 bytes for AES-256)
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.SESSION_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('SESSION_ENCRYPTION_KEY not configured. Generate with: openssl rand -base64 32');
    }
    
    // Ensure key is exactly 32 bytes for AES-256
    return Buffer.from(createHash('sha256').update(key).digest());
  }

  /**
   * Generate a cryptographically secure session token
   */
  static generateSessionToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return randomBytes(24).toString('base64url');
  }

  /**
   * Encrypt sensitive session data
   */
  private static encrypt(data: string): EncryptedData {
    const key = this.getEncryptionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted
    };
  }

  /**
   * Decrypt session data
   */
  private static decrypt(encryptedData: EncryptedData): string {
    const key = this.getEncryptionKey();
    const decipher = createDecipheriv(this.ALGORITHM, key, Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Create a new secure session
   */
  static async createSession(
    sessionData: SessionData, 
    expirySeconds: number = this.DEFAULT_EXPIRY
  ): Promise<{ sessionToken: string; csrfToken: string }> {
    if (!redis) {
      throw new Error('Redis not configured. Set REDIS_URL environment variable.');
    }

    const sessionToken = this.generateSessionToken();
    const csrfToken = this.generateCSRFToken();
    
    // Add metadata to session
    const enrichedData: SessionData = {
      ...sessionData,
      csrfToken,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (expirySeconds * 1000)
    };

    // Encrypt the session data
    const encryptedData = this.encrypt(JSON.stringify(enrichedData));
    
    // Store in Redis with expiration
    const key = `${this.SESSION_PREFIX}${sessionToken}`;
    await redis.setex(key, expirySeconds, JSON.stringify(encryptedData));

    console.log(`🔐 Created secure session: ${sessionToken.substring(0, 8)}... (expires in ${expirySeconds}s)`);
    
    return { sessionToken, csrfToken };
  }

  /**
   * Retrieve and decrypt session data
   */
  static async getSession(sessionToken: string): Promise<SessionData | null> {
    if (!redis || !sessionToken) {
      return null;
    }

    try {
      const key = `${this.SESSION_PREFIX}${sessionToken}`;
      const encryptedString = await redis.get<string>(key);
      
      if (!encryptedString) {
        return null; // Session not found or expired
      }

      // Parse encrypted data
      const encryptedData: EncryptedData = JSON.parse(encryptedString);
      
      // Decrypt session data
      const decryptedString = this.decrypt(encryptedData);
      const sessionData: SessionData = JSON.parse(decryptedString);

      // Check if session has expired (double-check beyond Redis TTL)
      if (sessionData.expiresAt && sessionData.expiresAt <= Date.now()) {
        await this.destroySession(sessionToken);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Update session data (with automatic encryption)
   */
  static async updateSession(
    sessionToken: string, 
    updates: Partial<SessionData>,
    extendExpiry: boolean = true
  ): Promise<boolean> {
    if (!redis) return false;

    try {
      const currentSession = await this.getSession(sessionToken);
      if (!currentSession) {
        return false; // Session not found
      }

      // Merge updates
      const updatedSession: SessionData = {
        ...currentSession,
        ...updates,
        lastActivity: Date.now()
      };

      // Calculate remaining TTL or extend
      let expirySeconds = this.DEFAULT_EXPIRY;
      if (!extendExpiry && currentSession.expiresAt) {
        expirySeconds = Math.max(60, Math.floor((currentSession.expiresAt - Date.now()) / 1000));
      } else {
        updatedSession.expiresAt = Date.now() + (this.DEFAULT_EXPIRY * 1000);
      }

      // Re-encrypt and store
      const encryptedData = this.encrypt(JSON.stringify(updatedSession));
      const key = `${this.SESSION_PREFIX}${sessionToken}`;
      await redis.setex(key, expirySeconds, JSON.stringify(encryptedData));

      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  /**
   * Destroy a session
   */
  static async destroySession(sessionToken: string): Promise<boolean> {
    if (!redis || !sessionToken) return false;

    try {
      const key = `${this.SESSION_PREFIX}${sessionToken}`;
      const result = await redis.del(key);
      
      console.log(`🗑️  Destroyed session: ${sessionToken.substring(0, 8)}...`);
      return result === 1;
    } catch (error) {
      console.error('Error destroying session:', error);
      return false;
    }
  }

  /**
   * Validate CSRF token
   */
  static async validateCSRF(sessionToken: string, csrfToken: string): Promise<boolean> {
    const session = await this.getSession(sessionToken);
    return session?.csrfToken === csrfToken;
  }

  /**
   * Clean up expired sessions (run periodically via Inngest)
   */
  static async cleanupExpiredSessions(): Promise<{ cleaned: number }> {
    if (!redis) return { cleaned: 0 };

    try {
      // Get all session keys
      const keys = await redis.keys(`${this.SESSION_PREFIX}*`);
      let cleaned = 0;

      for (const key of keys) {
        try {
          const encryptedString = await redis.get<string>(key);
          if (!encryptedString) continue;

          const encryptedData: EncryptedData = JSON.parse(encryptedString);
          const decryptedString = this.decrypt(encryptedData);
          const sessionData: SessionData = JSON.parse(decryptedString);

          // Remove if expired
          if (sessionData.expiresAt && sessionData.expiresAt <= Date.now()) {
            await redis.del(key);
            cleaned++;
          }
        } catch (error) {
          // If we can't decrypt/parse, remove the corrupted session
          await redis.del(key);
          cleaned++;
        }
      }

      console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
      return { cleaned };
    } catch (error) {
      console.error('Error during session cleanup:', error);
      return { cleaned: 0 };
    }
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  }> {
    if (!redis) return { totalSessions: 0, activeSessions: 0, expiredSessions: 0 };

    try {
      const keys = await redis.keys(`${this.SESSION_PREFIX}*`);
      let activeSessions = 0;
      let expiredSessions = 0;

      for (const key of keys) {
        try {
          const encryptedString = await redis.get<string>(key);
          if (!encryptedString) {
            expiredSessions++;
            continue;
          }

          const encryptedData: EncryptedData = JSON.parse(encryptedString);
          const decryptedString = this.decrypt(encryptedData);
          const sessionData: SessionData = JSON.parse(decryptedString);

          if (sessionData.expiresAt && sessionData.expiresAt > Date.now()) {
            activeSessions++;
          } else {
            expiredSessions++;
          }
        } catch (error) {
          expiredSessions++; // Count corrupted sessions as expired
        }
      }

      return {
        totalSessions: keys.length,
        activeSessions,
        expiredSessions
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { totalSessions: 0, activeSessions: 0, expiredSessions: 0 };
    }
  }

  /**
   * Revoke all sessions for a specific user
   */
  static async revokeUserSessions(userId: string): Promise<{ revoked: number }> {
    if (!redis || !userId) return { revoked: 0 };

    try {
      const keys = await redis.keys(`${this.SESSION_PREFIX}*`);
      let revoked = 0;

      for (const key of keys) {
        try {
          const encryptedString = await redis.get<string>(key);
          if (!encryptedString) continue;

          const encryptedData: EncryptedData = JSON.parse(encryptedString);
          const decryptedString = this.decrypt(encryptedData);
          const sessionData: SessionData = JSON.parse(decryptedString);

          if (sessionData.userId === userId) {
            await redis.del(key);
            revoked++;
          }
        } catch (error) {
          // Skip corrupted sessions
          continue;
        }
      }

      console.log(`🔒 Revoked ${revoked} sessions for user: ${userId}`);
      return { revoked };
    } catch (error) {
      console.error('Error revoking user sessions:', error);
      return { revoked: 0 };
    }
  }
}