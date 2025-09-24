
// lib/jwt.ts
import jwt from 'jsonwebtoken';

// Get secrets from environment variables
const JWT_ACCESS_SECRET = process.env.NEXT_JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.NEXT_JWT_REFRESH_SECRET;

// Validate that secrets are set
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables');
}

export interface TokenPayload {
  userId: string;
  email: string;
  isSuperuser?: boolean;
  isStaff?: boolean;
  permissions?: string[];
}

/**
 * Generate an access token (short-lived, 15 minutes)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET as string, {
    expiresIn: '15m', // Short-lived access token
    issuer: 'hum-awaz-app',
    audience: 'hum-awaz-users',
  });
}

/**
 * Generate a refresh token (long-lived, 7 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET as string, {
    expiresIn: '7d', // Longer-lived refresh token
    issuer: 'hum-awaz-app',
    audience: 'hum-awaz-users',
  });
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET as string) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET as string) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode token without verification (for inspection)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired without throwing verification error
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get remaining time until token expiration in seconds
 */
export function getTokenExpiryTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  } catch (error) {
    return null;
  }
}
