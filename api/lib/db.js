// api/lib/db.js - MongoDB Atlas Connection & Collection Index Management
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const { MongoClient } = require('mongodb');

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let cached = global._mongoCache;
if (!cached) {
  cached = global._mongoCache = { client: null, db: null, promise: null, indexesInitialized: false };
}

/**
 * Connects to MongoDB Atlas with connection pooling and caching across serverless invocations.
 */
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const error = new Error('Please define the MONGODB_URI environment variable inside .env or Vercel dashboard');
    error.name = 'MongoConfigurationError';
    throw error;
  }

  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached.promise) {
    const client = new MongoClient(uri, options);
    cached.promise = client.connect().then(async (connectedClient) => {
      // Default to database name in URI or 'campuscart'
      const db = connectedClient.db();
      cached.client = connectedClient;
      cached.db = db;

      // Automatically initialize indexes once per process
      if (!cached.indexesInitialized) {
        initDatabaseIndexes(db).catch((err) => {
          console.warn('[MongoDB Index Warning]: Non-blocking index creation issue:', err.message);
        });
        cached.indexesInitialized = true;
      }

      return { client: connectedClient, db };
    });
  }

  return await cached.promise;
}

/**
 * Initializes appropriate indexes for users, products, and reports.
 */
async function initDatabaseIndexes(db) {
  try {
    const usersCollection = db.collection('users');
    const productsCollection = db.collection('products');
    const reportsCollection = db.collection('reports');

    // 1. Users Indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true, name: 'idx_users_email_unique' });
    await usersCollection.createIndex({ createdAt: -1 }, { name: 'idx_users_created_at' });

    // 2. Products Indexes
    await productsCollection.createIndex({ sellerId: 1 }, { name: 'idx_products_seller' });
    await productsCollection.createIndex({ status: 1, category: 1, price: 1 }, { name: 'idx_products_filter' });
    await productsCollection.createIndex({ createdAt: -1 }, { name: 'idx_products_created_at' });
    // Text search index for title and description
    await productsCollection.createIndex(
      { title: 'text', description: 'text' },
      { name: 'idx_products_text_search', weights: { title: 10, description: 3 } }
    );

    // 3. Reports Indexes
    await reportsCollection.createIndex({ productId: 1, status: 1 }, { name: 'idx_reports_product' });
    await reportsCollection.createIndex({ reportedBy: 1 }, { name: 'idx_reports_user' });
    await reportsCollection.createIndex({ createdAt: -1 }, { name: 'idx_reports_created_at' });

    console.log('[MongoDB] Schema indexes successfully verified and initialized.');
  } catch (err) {
    console.error('[MongoDB] Index initialization error:', err.message);
    throw err;
  }
}

/**
 * Collection helper accessors
 */
async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection('users');
}

async function getProductsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('products');
}

async function getReportsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('reports');
}

module.exports = {
  connectToDatabase,
  initDatabaseIndexes,
  getUsersCollection,
  getProductsCollection,
  getReportsCollection
};
