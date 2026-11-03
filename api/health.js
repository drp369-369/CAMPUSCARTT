// api/health.js - Vercel Serverless Health Check Endpoint
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
