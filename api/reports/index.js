// api/reports/index.js - Listing Reports & Moderation Endpoint
// Supports: POST /api/reports (Submit report, authenticated)
//           GET /api/reports (List reports, user or admin)
const { ObjectId } = require('mongodb');
const { getReportsCollection, getProductsCollection } = require('../lib/db');
const { validateReport } = require('../lib/validation');
const { requireAuth } = require('../lib/auth');
const { sendSuccess, sendError, handleApiError } = require('../lib/response');

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const user = req.user;

  try {
    const reportsCollection = await getReportsCollection();

    // ----------------------------------------------------
    // POST: Submit a listing report
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const validation = validateReport(req.body);
      if (!validation.valid) {
        return sendError(res, 422, 'Validation failed.', validation.errors);
      }

      const { productId, reason, details, status } = validation.sanitized;

      let objectId;
      try {
        objectId = new ObjectId(productId);
      } catch {
        return sendError(res, 400, 'Invalid product ID format.');
      }

      // Check if product exists
      const productsCollection = await getProductsCollection();
      const product = await productsCollection.findOne({ _id: objectId });
      if (!product) {
        return sendError(res, 404, 'The product you are attempting to report does not exist.');
      }

      const now = new Date();
      const reportDoc = {
        productId: objectId.toString(),
        productTitle: product.title,
        reportedBy: user.userId,
        reporterEmail: user.email,
        reason,
        details,
        status: status || 'pending',
        createdAt: now,
        updatedAt: now
      };

      const result = await reportsCollection.insertOne(reportDoc);
      reportDoc._id = result.insertedId;

      return sendSuccess(res, {
        id: reportDoc._id.toString(),
        productId: reportDoc.productId,
        reason: reportDoc.reason,
        status: reportDoc.status,
        createdAt: reportDoc.createdAt
      }, 'Report submitted successfully for campus moderation.', 201);
    }

    // ----------------------------------------------------
    // GET: List reports (Admin views all; Students view own reports)
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const query = req.query || {};
      const filter = {};

      if (user.role === 'admin') {
        if (query.status) filter.status = query.status;
      } else {
        // Students can only see reports they submitted
        filter.reportedBy = user.userId;
      }

      const reports = await reportsCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      const formatted = reports.map(r => ({
        id: r._id.toString(),
        productId: r.productId,
        productTitle: r.productTitle,
        reason: r.reason,
        details: r.details,
        status: r.status,
        createdAt: r.createdAt
      }));

      return sendSuccess(res, { reports: formatted });
    }

    return sendError(res, 405, `HTTP method ${req.method} not allowed.`);
  } catch (err) {
    return handleApiError(res, err, 'Reports Endpoint');
  }
};

module.exports = requireAuth(handler);

