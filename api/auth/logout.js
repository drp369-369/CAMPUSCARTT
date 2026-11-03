// api/auth/logout.js - Student Logout Endpoint
// POST /api/auth/logout
const { sendSuccess } = require('../lib/response');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Clear cookie
  res.setHeader('Set-Cookie', 'campuscart_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

  return sendSuccess(res, null, 'Logged out successfully');
};
