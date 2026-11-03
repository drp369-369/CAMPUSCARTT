// api/products/index.js - Products API Collection Endpoint
// Supports: GET /api/products (list, filter, search, single item by ?id=...)
//           POST /api/products (create new listing, authenticated)
//           PUT /api/products (update listing, authenticated owner)
//           DELETE /api/products (delete listing, authenticated owner)
const { ObjectId } = require('mongodb');
const { getProductsCollection } = require('../lib/db');
const { validateProductListing } = require('../lib/validation');
const { authenticateUser } = require('../lib/auth');
const { sendSuccess, sendError, handleApiError } = require('../lib/response');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Early Authentication checks for write operations
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const user = authenticateUser(req);
    if (!user) {
      return sendError(res, 401, 'Authentication required to perform this action.');
    }
  }

  const query = req.query || {};

  try {
    // ----------------------------------------------------
    // POST: Create a new product listing (Authenticated)
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const user = req.user; // Attached by authenticateUser
      const validation = validateProductListing(req.body);
      if (!validation.valid) {
        return sendError(res, 422, 'Validation failed.', validation.errors);
      }

      const productsCollection = await getProductsCollection();
      const now = new Date();
      const productDoc = {
        ...validation.sanitized,
        sellerId: user.userId,
        seller: {
          name: user.name,
          email: user.email,
          role: user.role
        },
        createdAt: now,
        updatedAt: now
      };

      const result = await productsCollection.insertOne(productDoc);
      productDoc._id = result.insertedId;

      return sendSuccess(res, {
        id: productDoc._id.toString(),
        ...productDoc
      }, 'Product listed successfully', 201);
    }

    // ----------------------------------------------------
    // PUT: Update product listing (Authenticated Owner)
    // ----------------------------------------------------
    if (req.method === 'PUT') {
      const user = req.user;
      const productId = (req.body && req.body.id) || query.id;
      if (!productId) {
        return sendError(res, 400, 'Product ID is required for update.');
      }

      let objectId;
      try {
        objectId = new ObjectId(productId);
      } catch {
        return sendError(res, 400, 'Invalid product ID format.');
      }

      const productsCollection = await getProductsCollection();
      const existing = await productsCollection.findOne({ _id: objectId });
      if (!existing) {
        return sendError(res, 404, 'Product listing not found.');
      }

      // Authorization check: only seller or admin can update
      if (existing.sellerId !== user.userId && user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden. You can only update your own listings.');
      }

      const body = req.body || {};
      const updates = {};

      if (typeof body.title === 'string' && body.title.trim().length >= 3) {
        updates.title = body.title.trim().slice(0, 150);
      }
      if (typeof body.description === 'string' && body.description.trim().length >= 10) {
        updates.description = body.description.trim().slice(0, 2500);
      }
      if (typeof body.category === 'string') {
        updates.category = body.category.toLowerCase().trim();
      }
      if (body.price !== undefined) {
        const p = parseFloat(body.price);
        if (!isNaN(p) && p > 0) updates.price = Math.round(p * 100) / 100;
      }
      if (body.originalPrice !== undefined) {
        const op = parseFloat(body.originalPrice);
        if (!isNaN(op) && op > 0) updates.originalPrice = Math.round(op * 100) / 100;
      }
      if (typeof body.condition === 'string') {
        updates.condition = body.condition.trim();
      }
      if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
        updates.imageUrl = body.imageUrl.trim();
      }
      if (typeof body.location === 'string') {
        updates.location = body.location.trim();
      }
      if (['active', 'sold', 'archived'].includes(body.status)) {
        updates.status = body.status;
      }

      if (Object.keys(updates).length === 0) {
        return sendError(res, 400, 'No valid fields provided for update.');
      }

      updates.updatedAt = new Date();

      await productsCollection.updateOne({ _id: objectId }, { $set: updates });
      const updatedProduct = await productsCollection.findOne({ _id: objectId });

      return sendSuccess(res, {
        id: updatedProduct._id.toString(),
        ...updatedProduct
      }, 'Product listing updated successfully');
    }

    // ----------------------------------------------------
    // DELETE: Delete product listing (Authenticated Owner)
    // ----------------------------------------------------
    if (req.method === 'DELETE') {
      const user = req.user;
      const productId = (req.body && req.body.id) || query.id;
      if (!productId) {
        return sendError(res, 400, 'Product ID is required for deletion.');
      }

      let objectId;
      try {
        objectId = new ObjectId(productId);
      } catch {
        return sendError(res, 400, 'Invalid product ID format.');
      }

      const productsCollection = await getProductsCollection();
      const existing = await productsCollection.findOne({ _id: objectId });
      if (!existing) {
        return sendError(res, 404, 'Product listing not found.');
      }

      // Authorization check: only seller or admin can delete
      if (existing.sellerId !== user.userId && user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden. You can only delete your own listings.');
      }

      await productsCollection.deleteOne({ _id: objectId });

      return sendSuccess(res, { id: productId }, 'Product listing deleted successfully');
    }

    // ----------------------------------------------------
    // GET: Single product by ID or list with filters
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const productId = query.id;

      // Check for valid ObjectId before DB call if querying by ID
      if (productId) {
        let objectId;
        try {
          objectId = new ObjectId(productId);
        } catch {
          return sendError(res, 400, 'Invalid product ID format.');
        }

        const productsCollection = await getProductsCollection();
        const product = await productsCollection.findOne({ _id: objectId });
        if (!product) {
          return sendError(res, 404, 'Product listing not found.');
        }

        return sendSuccess(res, {
          id: product._id.toString(),
          title: product.title,
          description: product.description,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          condition: product.condition,
          imageUrl: product.imageUrl,
          location: product.location,
          status: product.status,
          sellerId: product.sellerId,
          seller: product.seller || {},
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        });
      }

      // Filter & Search Query Builder
      const filter = {};

      if (query.status && query.status !== 'all') {
        filter.status = query.status;
      } else if (!query.status) {
        filter.status = 'active';
      }

      if (query.category && query.category !== 'all') {
        filter.category = query.category.toLowerCase().trim();
      }

      if (query.sellerId) {
        filter.sellerId = query.sellerId;
      }

      const minPrice = parseFloat(query.minPrice);
      const maxPrice = parseFloat(query.maxPrice);
      if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        filter.price = {};
        if (!isNaN(minPrice)) filter.price.$gte = minPrice;
        if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
      }

      const keyword = (query.q || query.search || '').trim();
      if (keyword) {
        filter.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { location: { $regex: keyword, $options: 'i' } }
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (query.sort === 'price_asc') {
        sortOptions = { price: 1, createdAt: -1 };
      } else if (query.sort === 'price_desc') {
        sortOptions = { price: -1, createdAt: -1 };
      } else if (query.sort === 'oldest') {
        sortOptions = { createdAt: 1 };
      }

      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
      const skip = (page - 1) * limit;

      const productsCollection = await getProductsCollection();
      const [products, totalCount] = await Promise.all([
        productsCollection.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
        productsCollection.countDocuments(filter)
      ]);

      const formattedProducts = products.map(p => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        condition: p.condition,
        imageUrl: p.imageUrl,
        location: p.location,
        status: p.status,
        sellerId: p.sellerId,
        seller: p.seller || {},
        createdAt: p.createdAt
      }));

      return sendSuccess(res, {
        products: formattedProducts,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      });
    }

    return sendError(res, 405, `HTTP method ${req.method} not allowed.`);
  } catch (err) {
    return handleApiError(res, err, 'Products Endpoint');
  }
};
