// api/lib/auth.js - Authentication & Authorization Middleware
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendError } = require('./response');

const DEFAULT_JWT_SECRET = 'campuscart_development_jwt_secret_change_in_production';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be defined in production environment');
  }
  return secret || DEFAULT_JWT_SECRET;
}

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds.
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}

/**
 * Compares plaintext password against a stored bcrypt hash.
 */
async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generates a signed JWT session token with 7 days expiration.
 */
function generateToken(user) {
  const secret = getJwtSecret();
  const payload = {
    userId: user._id ? user._id.toString() : user.userId,
    email: user.email,
    name: user.name,
    role: user.role || 'student'
  };

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    issuer: 'CampusCart',
    subject: payload.userId
  });
}

/**
 * Verifies a JWT token and returns decoded payload.
 */
function verifyToken(token) {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret, { issuer: 'CampusCart' });
  } catch (err) {
    return null;
  }
}

/**
 * Extracts authentication token from Authorization header or cookie.
 */
function extractToken(req) {
  if (!req || !req.headers) return null;

  // 1. Check Authorization header: 'Bearer <token>'
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1].trim();
    }
  }

  // 2. Check Cookie header: 'campuscart_token=<token>'
  const cookieHeader = req.headers.cookie;
  if (cookieHeader && typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const c of cookies) {
      if (c.startsWith('campuscart_token=')) {
        return c.substring('campuscart_token='.length).trim();
      }
    }
  }

  return null;
}

/**
 * Authenticates request without blocking if token is missing/invalid.
 * Attaches req.user if valid.
 */
function authenticateUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (decoded) {
    req.user = decoded;
    return decoded;
  }
  return null;
}

/**
 * Higher-order middleware: Enforces valid user authentication.
 */
function requireAuth(handler) {
  return async (req, res) => {
    const user = authenticateUser(req);
    if (!user) {
      return sendError(res, 401, 'Authentication required. Please sign in to continue.', {
        code: 'UNAUTHORIZED'
      });
    }
    return await handler(req, res);
  };
}

/**
 * Higher-order middleware: Enforces admin role authorization.
 */
function requireAdmin(handler) {
  return async (req, res) => {
    const user = authenticateUser(req);
    if (!user) {
      return sendError(res, 401, 'Authentication required.', { code: 'UNAUTHORIZED' });
    }
    if (user.role !== 'admin') {
      return sendError(res, 403, 'Forbidden. Admin privileges required.', { code: 'FORBIDDEN' });
    }
    return await handler(req, res);
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
  authenticateUser,
  requireAuth,
  requireAdmin
};
