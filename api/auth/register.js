// api/auth/register.js - Student Registration Endpoint
// POST /api/auth/register
const { getUsersCollection } = require('../lib/db');
const { validateUserRegistration } = require('../lib/validation');
const { hashPassword, generateToken } = require('../lib/auth');
const { sendSuccess, sendError, handleApiError } = require('../lib/response');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendError(res, 405, `HTTP method ${req.method} not allowed. Use POST.`);
  }

  try {
    const validation = validateUserRegistration(req.body);
    if (!validation.valid) {
      return sendError(res, 422, 'Validation failed.', validation.errors);
    }

    const { name, email, password, profile } = validation.sanitized;
    const usersCollection = await getUsersCollection();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this university email already exists.');
    }

    // Hash password and store user
    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const newUserDoc = {
      name,
      email,
      password: hashedPassword,
      role: 'student',
      profile: {
        branch: profile.branch || '',
        year: profile.year || '',
        phone: profile.phone || '',
        hostelBlock: profile.hostelBlock || '',
        bio: profile.bio || ''
      },
      isVerified: true,
      createdAt: now,
      updatedAt: now
    };

    const insertResult = await usersCollection.insertOne(newUserDoc);
    newUserDoc._id = insertResult.insertedId;

    // Generate JWT session token
    const token = generateToken(newUserDoc);

    // Set cookie for browser session support
    res.setHeader('Set-Cookie', `campuscart_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);

    return sendSuccess(res, {
      token,
      user: {
        id: newUserDoc._id.toString(),
        name: newUserDoc.name,
        email: newUserDoc.email,
        role: newUserDoc.role,
        profile: newUserDoc.profile,
        createdAt: newUserDoc.createdAt
      }
    }, 'Student registered successfully', 201);
  } catch (err) {
    return handleApiError(res, err, 'Registration');
  }
};

