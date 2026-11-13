// api/lib/validation.js - Input Validation and Schema Guards
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal

const ALLOWED_CATEGORIES = ['textbooks', 'electronics', 'stationery', 'hostel', 'other'];
const ALLOWED_CONDITIONS = ['Brand New', 'Like New', 'Excellent', 'Gently Used', 'Fair'];
const ALLOWED_REPORT_REASONS = ['inappropriate', 'scam', 'fake_listing', 'duplicate', 'prohibited_item', 'other'];

/**
 * Validates a university email address.
 * Allowed domains can be configured through ALLOWED_EMAIL_DOMAINS environment variable.
 * Does not assume any domain implicitly unless configured by administration.
 */
function validateUniversityEmail(email) {
  if (typeof email !== 'string') return { valid: false, message: 'Email must be a string.' };
  const trimmed = email.trim().toLowerCase();

  // Basic RFC 5322 standard email structure regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Invalid email format.' };
  }

  const parts = trimmed.split('@');
  const domain = parts[1];

  // Check configured allowed domains if specified
  const configuredDomains = process.env.ALLOWED_EMAIL_DOMAINS;
  if (configuredDomains && configuredDomains.trim() !== '' && configuredDomains.trim() !== '*') {
    const allowedList = configuredDomains.split(',').map(d => d.trim().toLowerCase());
    if (!allowedList.includes(domain)) {
      return {
        valid: false,
        message: `Email domain '@${domain}' is not on the verified campus domain list. Allowed: ${allowedList.join(', ')}`
      };
    }
  }

  return { valid: true, email: trimmed, domain };
}

/**
 * Validates user registration payload.
 */
function validateUserRegistration(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!name || name.length < 2 || name.length > 100) {
    errors.push('Full name must be between 2 and 100 characters.');
  }

  const emailCheck = validateUniversityEmail(email);
  if (!emailCheck.valid) {
    errors.push(emailCheck.message);
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one letter and one number.');
  }

  // Optional profile fields sanitization
  const profile = {
    branch: typeof data.branch === 'string' ? data.branch.trim().slice(0, 50) : '',
    year: typeof data.year === 'string' ? data.year.trim().slice(0, 20) : '',
    phone: typeof data.phone === 'string' ? data.phone.trim().slice(0, 20) : '',
    hostelBlock: typeof data.hostelBlock === 'string' ? data.hostelBlock.trim().slice(0, 50) : '',
    bio: typeof data.bio === 'string' ? data.bio.trim().slice(0, 300) : ''
  };

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      name,
      email: emailCheck.email || email.toLowerCase(),
      password,
      profile
    }
  };
}

/**
 * Validates user login payload.
 */
function validateUserLogin(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email) errors.push('University email is required.');
  if (!password) errors.push('Password is required.');

  return {
    valid: errors.length === 0,
    errors,
    sanitized: { email, password }
  };
}

/**
 * Validates product creation payload.
 */
function validateProductListing(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  const category = typeof data.category === 'string' ? data.category.trim().toLowerCase() : '';
  const price = typeof data.price === 'number' ? data.price : parseFloat(data.price);
  const originalPrice = data.originalPrice ? (typeof data.originalPrice === 'number' ? data.originalPrice : parseFloat(data.originalPrice)) : null;
  const condition = typeof data.condition === 'string' ? data.condition.trim() : 'Gently Used';
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '';
  const location = typeof data.location === 'string' ? data.location.trim() : 'Campus Main Gate';

  if (!title || title.length < 3 || title.length > 150) {
    errors.push('Product title must be between 3 and 150 characters.');
  }

  if (!description || description.length < 10 || description.length > 2500) {
    errors.push('Product description must be between 10 and 2500 characters.');
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  if (isNaN(price) || price <= 0 || price > 500000) {
    errors.push('Price must be a valid positive number between 1 and 500,000.');
  }

  if (originalPrice !== null && (isNaN(originalPrice) || originalPrice < price)) {
    errors.push('Original price must be greater than or equal to the selling price.');
  }

  if (!ALLOWED_CONDITIONS.includes(condition)) {
    errors.push(`Condition must be one of: ${ALLOWED_CONDITIONS.join(', ')}.`);
  }

  if (imageUrl && !/^(https?:\/\/|\/assets\/|\/images\/|data:image\/)/i.test(imageUrl)) {
    errors.push('Image URL must be a valid web URL or asset reference.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      title,
      description,
      category,
      price: Math.round(price * 100) / 100,
      originalPrice: originalPrice ? Math.round(originalPrice * 100) / 100 : null,
      condition,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
      location,
      status: 'active'
    }
  };
}

/**
 * Validates report creation payload.
 */
function validateReport(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const productId = typeof data.productId === 'string' ? data.productId.trim() : '';
  const reason = typeof data.reason === 'string' ? data.reason.trim().toLowerCase() : '';
  const details = typeof data.details === 'string' ? data.details.trim().slice(0, 500) : '';

  if (!productId) {
    errors.push('Product ID is required.');
  }

  if (!ALLOWED_REPORT_REASONS.includes(reason)) {
    errors.push(`Report reason must be one of: ${ALLOWED_REPORT_REASONS.join(', ')}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      productId,
      reason,
      details,
      status: 'pending'
    }
  };
}

module.exports = {
  validateUniversityEmail,
  validateUserRegistration,
  validateUserLogin,
  validateProductListing,
  validateReport,
  ALLOWED_CATEGORIES,
  ALLOWED_CONDITIONS,
  ALLOWED_REPORT_REASONS
};

