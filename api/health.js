// api/health.js - Vercel Serverless Health Check Endpoint
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `HTTP method ${req.method} is not supported on this endpoint. Use GET.`
    });
  }

  const responsePayload = {
    status: 'ok',
    app: 'CampusCart API',
    tagline: 'Your Campus. Your Marketplace.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  };

  return res.status(200).json(responsePayload);
};
