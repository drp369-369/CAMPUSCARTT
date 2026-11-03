# CampusCart REST API Documentation

CampusCart provides a RESTful API built on Vercel Serverless Functions with Node.js and MongoDB Atlas.

## Base URL
- **Local Development:** `http://localhost:3000/api`
- **Production (Vercel):** `https://<your-vercel-deployment>.vercel.app/api`

---

## Authentication & Headers

Protected endpoints require a JSON Web Token (JWT) passed via either:
1. `Authorization: Bearer <token>` HTTP header.
2. `campuscart_token` HTTP-only session cookie (automatically set upon register/login).

Standard headers:
```http
Content-Type: application/json
Accept: application/json
```

---

## Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": "Error description",
  "details": [ ... ]
}
```

---

## 1. System Endpoints

### `GET /api/health`
Checks API health, environment status, and active deployment version.

- **Auth Required:** No
- **Response (200 OK):**
```json
{
  "status": "ok",
  "app": "CampusCart API",
  "tagline": "Your Campus. Your Marketplace.",
  "environment": "development",
  "timestamp": "2026-11-03T15:30:00.000Z",
  "version": "0.1.0"
}
```

---

## 2. Authentication Endpoints

### `POST /api/auth/register`
Registers a new university student account.

- **Auth Required:** No
- **Request Body:**
```json
{
  "name": "Sneha Patel",
  "email": "sneha.p@student.rvu.edu.in",
  "password": "Password123",
  "branch": "ECE",
  "year": "Final Year",
  "phone": "+91 98765 43210",
  "hostelBlock": "Block C",
  "bio": "Final year electronics student selling academic supplies."
}
```
- **Validation Rules:**
  - `name`: String, 2-100 characters.
  - `email`: Valid university email format. Checked against `ALLOWED_EMAIL_DOMAINS` if configured.
  - `password`: Minimum 8 characters, at least 1 letter and 1 number.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "672778a1bc4f1a2345678901",
      "name": "Sneha Patel",
      "email": "sneha.p@student.rvu.edu.in",
      "role": "student",
      "profile": {
        "branch": "ECE",
        "year": "Final Year",
        "phone": "+91 98765 43210",
        "hostelBlock": "Block C",
        "bio": "Final year electronics student selling academic supplies."
      },
      "createdAt": "2026-11-03T15:30:00.000Z"
    }
  }
}
```

---

### `POST /api/auth/login`
Authenticates a student and issues a JWT token.

- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "sneha.p@student.rvu.edu.in",
  "password": "Password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "672778a1bc4f1a2345678901",
      "name": "Sneha Patel",
      "email": "sneha.p@student.rvu.edu.in",
      "role": "student",
      "profile": { ... },
      "createdAt": "2026-11-03T15:30:00.000Z"
    }
  }
}
```

---

### `POST /api/auth/logout`
Clears session cookies and logs out the student.

- **Auth Required:** No
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### `GET /api/auth/me`
Retrieves current authenticated student profile.

- **Auth Required:** Yes (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "672778a1bc4f1a2345678901",
    "name": "Sneha Patel",
    "email": "sneha.p@student.rvu.edu.in",
    "role": "student",
    "profile": {
      "branch": "ECE",
      "year": "Final Year",
      "phone": "+91 98765 43210",
      "hostelBlock": "Block C",
      "bio": "Final year electronics student selling academic supplies."
    },
    "createdAt": "2026-11-03T15:30:00.000Z",
    "updatedAt": "2026-11-03T15:30:00.000Z"
  }
}
```

---

### `PUT /api/auth/me`
Updates profile information for the authenticated user.

- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
```json
{
  "name": "Sneha Patel",
  "branch": "ECE",
  "year": "Final Year",
  "hostelBlock": "Block C, Room 302",
  "bio": "Updated bio text"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

## 3. Product Listings Endpoints

### `GET /api/products`
Retrieves listings with multi-attribute filtering, full-text search, and pagination.

- **Auth Required:** No
- **Query Parameters:**
  - `id`: (Optional) Single product ID to retrieve detailed listing.
  - `q` / `search`: (Optional) Keyword search across title, description, and location.
  - `category`: (Optional) Filter by category: `textbooks`, `electronics`, `stationery`, `hostel`, `other`.
  - `minPrice`: (Optional) Minimum price in ₹.
  - `maxPrice`: (Optional) Maximum price in ₹.
  - `sellerId`: (Optional) Filter by specific seller.
  - `status`: (Optional) `active` (default), `sold`, `archived`, or `all`.
  - `sort`: (Optional) `newest` (default), `price_asc`, `price_desc`, `oldest`.
  - `page`: (Optional) Page number (default: 1).
  - `limit`: (Optional) Items per page (default: 20, max: 50).
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "products": [
      {
        "id": "672778a1bc4f1a2345678902",
        "title": "Casio fx-991EX ClassWiz Scientific Calculator",
        "description": "Original Casio calculator with natural textbook display.",
        "category": "stationery",
        "price": 850,
        "originalPrice": 1595,
        "condition": "Excellent",
        "imageUrl": "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd",
        "location": "Block C, Tech Hostel",
        "status": "active",
        "sellerId": "672778a1bc4f1a2345678901",
        "seller": {
          "name": "Sneha Patel",
          "email": "sneha.p@student.rvu.edu.in",
          "role": "student"
        },
        "createdAt": "2026-11-03T15:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `POST /api/products`
Creates a new campus listing.

- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
```json
{
  "title": "Higher Engineering Mathematics – B.S. Grewal",
  "description": "Barely used for two semesters. Clean pages, no highlights.",
  "category": "textbooks",
  "price": 450,
  "originalPrice": 899,
  "condition": "Like New",
  "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  "location": "Block A, Men's Hostel"
}
```
- **Validation Rules:**
  - `title`: 3 to 150 characters.
  - `description`: 10 to 2500 characters.
  - `category`: `textbooks` | `electronics` | `stationery` | `hostel` | `other`.
  - `price`: Positive number (1 to 500,000).
  - `condition`: `Brand New` | `Like New` | `Excellent` | `Gently Used` | `Fair`.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Product listed successfully",
  "data": {
    "id": "672778a1bc4f1a2345678903",
    "title": "Higher Engineering Mathematics – B.S. Grewal",
    "description": "...",
    "category": "textbooks",
    "price": 450,
    "originalPrice": 899,
    "condition": "Like New",
    "imageUrl": "https://...",
    "location": "Block A, Men's Hostel",
    "status": "active",
    "sellerId": "672778a1bc4f1a2345678901",
    "seller": { ... },
    "createdAt": "2026-11-03T15:30:00.000Z",
    "updatedAt": "2026-11-03T15:30:00.000Z"
  }
}
```

---

### `PUT /api/products?id=<productId>` (or `PUT /api/products/<productId>`)
Updates an existing listing. Only the seller who created the listing (or an admin) is authorized.

- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:** Any subset of mutable fields:
```json
{
  "price": 400,
  "status": "sold",
  "description": "Price dropped for quick sale."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Product listing updated successfully",
  "data": { ... }
}
```

---

### `DELETE /api/products?id=<productId>` (or `DELETE /api/products/<productId>`)
Permanently removes a product listing. Only the seller who created the listing (or an admin) is authorized.

- **Auth Required:** Yes (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Product listing deleted successfully",
  "data": {
    "id": "672778a1bc4f1a2345678903"
  }
}
```

---

## 4. Moderation & Reporting Endpoints

### `POST /api/reports`
Submits a report against an active listing for campus moderation.

- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
```json
{
  "productId": "672778a1bc4f1a2345678903",
  "reason": "fake_listing",
  "details": "Item appears to be an unauthorized seller using stock images."
}
```
- **Allowed Reasons:**
  - `inappropriate`
  - `scam`
  - `fake_listing`
  - `duplicate`
  - `prohibited_item`
  - `other`
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Report submitted successfully for campus moderation.",
  "data": {
    "id": "672778a1bc4f1a2345678904",
    "productId": "672778a1bc4f1a2345678903",
    "reason": "fake_listing",
    "status": "pending",
    "createdAt": "2026-11-03T15:30:00.000Z"
  }
}
```

---

### `GET /api/reports`
Retrieves reports. Students receive only reports they filed; admins receive all pending/resolved reports.

- **Auth Required:** Yes (`Bearer <token>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "reports": [
      {
        "id": "672778a1bc4f1a2345678904",
        "productId": "672778a1bc4f1a2345678903",
        "productTitle": "Higher Engineering Mathematics – B.S. Grewal",
        "reason": "fake_listing",
        "details": "...",
        "status": "pending",
        "createdAt": "2026-11-03T15:30:00.000Z"
      }
    ]
  }
}
```

---

## 5. HTTP Status Code Summary

| Status Code | Meaning | Typical Usage |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | `GET` requests, `PUT` updates, `DELETE` removals |
| `201 Created` | Resource created | `POST` registration, `POST` product, `POST` report |
| `400 Bad Request` | Malformed parameters | Invalid ObjectId format, missing required ID |
| `401 Unauthorized` | Authentication failed | Missing/expired JWT, invalid login credentials |
| `403 Forbidden` | Authorization denied | Updating or deleting another student's listing |
| `404 Not Found` | Resource not found | Product, user or report ID does not exist |
| `405 Method Not Allowed` | Invalid HTTP verb | Sending POST to GET-only endpoint |
| `409 Conflict` | Unique key violation | Registering with an already-registered email |
| `422 Unprocessable Entity`| Validation failure | Password too short, invalid category/condition |
| `500 Server Error` | Unhandled error | Unexpected server exception |
| `503 Service Unavailable`| Database unavailable | `MONGODB_URI` not set or Atlas network blocked |
