// api/auth/login.js - Student Login Endpoint
// POST /api/auth/login
const { getUsersCollection } = require('../lib/db');
const { validateUserLogin } = require('../lib/validation');
const { comparePassword, generateToken } = require('../lib/auth');
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
    const validation = validateUserLogin(req.body);
    if (!validation.valid) {
      return sendError(res, 422, 'Validation failed.', validation.errors);
    }

    const { email, password } = validation.sanitized;
    const usersCollection = await getUsersCollection();

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid university email or password.');
    }

    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) {
      return sendError(res, 401, 'Invalid university email or password.');
    }

    const token = generateToken(user);

    // Set cookie
    res.setHeader('Set-Cookie', `campuscart_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);

    return sendSuccess(res, {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        profile: user.profile || {},
        createdAt: user.createdAt
      }
    }, 'Login successful');
  } catch (err) {
    return handleApiError(res, err, 'Login');
  }
};

