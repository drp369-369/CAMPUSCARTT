// api/auth/me.js - Authenticated User Profile Endpoint
// GET /api/auth/me, PUT /api/auth/me
const { ObjectId } = require('mongodb');
const { getUsersCollection } = require('../lib/db');
const { requireAuth } = require('../lib/auth');
const { sendSuccess, sendError, handleApiError } = require('../lib/response');

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const userId = req.user.userId;

  try {
    const usersCollection = await getUsersCollection();
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch {
      return sendError(res, 400, 'Invalid user ID format.');
    }

    if (req.method === 'GET') {
      const user = await usersCollection.findOne(
        { _id: objectId },
        { projection: { password: 0 } }
      );

      if (!user) {
        return sendError(res, 404, 'User profile not found.');
      }

      return sendSuccess(res, {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const updates = {};

      if (typeof body.name === 'string' && body.name.trim().length >= 2) {
        updates.name = body.name.trim().slice(0, 100);
      }

      const allowedProfileFields = ['branch', 'year', 'phone', 'hostelBlock', 'bio'];
      for (const field of allowedProfileFields) {
        if (typeof body[field] === 'string') {
          updates[`profile.${field}`] = body[field].trim().slice(0, 300);
        } else if (body.profile && typeof body.profile[field] === 'string') {
          updates[`profile.${field}`] = body.profile[field].trim().slice(0, 300);
        }
      }

      if (Object.keys(updates).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update.');
      }

      updates.updatedAt = new Date();

      const result = await usersCollection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after', projection: { password: 0 } }
      );

      const updatedUser = result.value || result;
      return sendSuccess(res, {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile || {},
        updatedAt: updatedUser.updatedAt
      }, 'Profile updated successfully');
    }

    return sendError(res, 405, `HTTP method ${req.method} not allowed.`);
  } catch (err) {
    return handleApiError(res, err, 'User Profile');
  }
};

module.exports = requireAuth(handler);
