// api/lib/db.js - MongoDB Connection Helper with Serverless Connection Caching
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env or Vercel dashboard');
  }

  // If cached connection exists and is still active, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create new connection if not cached
  const client = new MongoClient(uri, options);
  await client.connect();
  const db = client.db('campuscart');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = { connectToDatabase };
