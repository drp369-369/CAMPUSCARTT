// api/lib/db.js - MongoDB Connection Helper with Serverless Connection Caching
const { MongoClient } = require('mongodb');

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Use global variable to cache connection across Vercel serverless function invocations
let cached = global._mongoCache;

if (!cached) {
  cached = global._mongoCache = { client: null, db: null, promise: null };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env or Vercel dashboard');
  }

  // If connection is already established and active, return cached instances
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  // If connection promise does not exist, create a new one
  if (!cached.promise) {
    const client = new MongoClient(uri, options);
    cached.promise = client.connect().then((connectedClient) => {
      const db = connectedClient.db('campuscart');
      cached.client = connectedClient;
      cached.db = db;
      return { client: connectedClient, db };
    });
  }

  return await cached.promise;
}

module.exports = { connectToDatabase };
