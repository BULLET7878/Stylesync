# StyleSync — Full-Stack Fashion E-Commerce Platform

A production-ready fashion marketplace built with React + Node.js/Express + MongoDB. Single-seller model — the platform owner manages all products and orders; everyone else is a buyer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, Google OAuth 2.0 |
| Images | Cloudinary (multer-storage-cloudinary) |
| Payments | UPI Direct (UTR verification flow) |
| Deployment | Vercel (monorepo — frontend + backend serverless) |

---

## Project Structure

```
StyleSync/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register, login, Google OAuth, profile
│   │   ├── cartController.js       # Cart CRUD
│   │   ├── couponController.js     # Coupon validation & seeding
│   │   ├── orderController.js      # Orders, payment flow, shipping, stats
│   │   ├── paymentController.js    # Razorpay integration (placeholder)
│   │   ├── productController.js    # Product CRUD, reviews, search, seed
│   │   ├── selectionController.js  # Curated picks & outfit pairings
│   │   ├── uploadController.js     # Cloudinary image upload/delete
│   │   └── wishlistController.js   # Wishlist add/remove
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protect, seller/admin guards
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Coupon.js
│   │   ├── Order.js                # Includes tracking, courier, shippedAt
│   │   ├── Product.js              # Reviews, tags, views, section
│   │   ├── User.js                 # Roles: buyer | seller | admin
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── selectionRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userRoutes.js
│   │   └── wishlistRoutes.js
│   ├── utils/
│   │   ├── cloudinaryConfig.js     # Cloudinary + multer storage setup
│   │   └── generateToken.js        # JWT token generator
│   ├── .env                        # Environment variables (not in git)
│   ├── package.json
│   └── server.js                   # Express app entry point
│
├── frontend/
│   ├── public/
│   │   ├── assets/                 # Hero images (men, women, kids, fallback)
│   │   ├── icons.svg
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx          # Navbar + Outlet + Footer wrapper
│   │   │   ├── Navbar.jsx          # Sticky nav with search, cart, user menu
│   │   │   ├── ProductCard.jsx     # Reusable card with wishlist + add-to-cart
│   │   │   ├── ProtectedRoute.jsx  # Auth + role guard
│   │   │   └── UPIPaymentModal.jsx # QR code + UTR submission modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User auth state, login/logout/profile
│   │   │   ├── CartContext.jsx     # Cart state, local + server sync
│   │   │   ├── ProductContext.jsx  # Product search & filter state
│   │   │   └── WishlistContext.jsx # Wishlist state
│   │   ├── pages/
│   │   │   ├── Cart.jsx            # Cart with quantity controls & summary
│   │   │   ├── Checkout.jsx        # Shipping form, coupon, UPI payment
│   │   │   ├── Dashboard.jsx       # Buyer: orders, address, cancel, tracking
│   │   │   ├── Home.jsx            # Landing: hero, categories, trending, sale
│   │   │   ├── Info.jsx            # Static pages (About, Help, Privacy, etc.)
│   │   │   ├── Login.jsx           # Email + Google login
│   │   │   ├── OrderSuccess.jsx    # Confetti + order timeline
│   │   │   ├── ProductDetail.jsx   # Images, reviews, delivery check, pairings
│   │   │   ├── ProductEdit.jsx     # Seller: create/edit product with images
│   │   │   ├── Register.jsx        # Buyer registration
│   │   │   ├── SellerDashboard.jsx # Seller: stats, products, orders, shipping
│   │   │   ├── Shop.jsx            # Product grid with filters & list view
│   │   │   └── Wishlist.jsx        # Saved products
│   │   ├── App.jsx                 # Routes
│   │   ├── App.css
│   │   ├── index.css               # Tailwind + custom utilities
│   │   └── main.jsx                # React entry + context providers
│   ├── .env                        # Frontend env vars (not in git)
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI: lint + build on push/PR
│
├── vercel.json                     # Vercel monorepo build config
├── .gitignore
└── README.md
```

---

## Features

### Buyer
- Browse products with filters (category, section, price, rating, sort)
- Grid and list view toggle
- Product detail with image gallery, delivery pincode check, outfit pairings
- Add to cart (guest + logged-in sync), wishlist
- Checkout with auto pincode lookup, coupon codes, save address
- UPI payment via QR code + UTR submission
- Order history with status tracking, tracking number display
- Cancel unpaid orders
- Write reviews (verified purchase only)
- Recently viewed products

### Seller (Owner Only)
- Full seller dashboard with revenue chart, top products, category breakdown
- Product management: create, edit, delete with Cloudinary image upload
- Order management: verify UPI payments (confirm/reject), mark as shipped with courier + tracking number, mark as delivered
- Full delivery address visible for shipping
- Order filters: All / Verify / To Ship / Shipped / Done / Cancelled
- Order search by name, ID, city
- Expandable order rows with full address + item details

---

## API Routes

### Auth — `/api/auth`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register buyer |
| POST | `/login` | Public | Login |
| POST | `/google` | Public | Google OAuth |
| GET | `/profile` | Private | Get profile |
| PUT | `/profile` | Private | Update profile/address |

### Products — `/api/products`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List with filters |
| POST | `/` | Seller | Create product |
| GET | `/seller` | Seller | My products |
| GET | `/:id` | Public | Product detail |
| PUT | `/:id` | Seller | Update product |
| DELETE | `/:id` | Seller | Delete product |
| POST | `/:id/reviews` | Private | Add review |

### Orders — `/api/orders`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Private | Place order |
| GET | `/myorders` | Private | My orders |
| GET | `/seller` | Seller | All seller orders |
| GET | `/stats` | Seller | Analytics |
| PUT | `/:id/submit-payment` | Private | Submit UTR |
| PUT | `/:id/confirm-payment` | Seller | Confirm payment |
| PUT | `/:id/reject-payment` | Seller | Reject payment |
| PUT | `/:id/ship` | Seller | Mark shipped + tracking |
| PUT | `/:id/deliver` | Seller | Mark delivered |
| PUT | `/:id/cancel` | Private | Cancel order |

### Other
- `GET/POST/DELETE /api/cart` — Cart operations
- `GET/POST/DELETE /api/wishlist/:id` — Wishlist
- `POST /api/upload` — Image upload to Cloudinary
- `POST /api/coupons/validate` — Validate coupon
- `GET /api/featured/curated` — Curated picks
- `GET /api/featured/pairings/:id` — Outfit pairings

---

## Environment Variables

### `backend/.env`
```
PORT=5001
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SELLER_UPI_ID=your_upi_id
```

---

## Local Development

```bash
# Backend
cd backend && npm install && npm run dev   # :5001

# Frontend (new terminal)
cd frontend && npm install && npm run dev  # :5173
```

Seed sample products: `GET http://localhost:5001/api/products/seed`

---

## Deployment (Vercel)

The `vercel.json` at root handles the monorepo:
- Backend → `@vercel/node` serverless function
- Frontend → `@vercel/static-build` (Vite)
- All `/api/*` requests rewrite to the backend function

Set all environment variables in **Vercel Project Settings → Environment Variables**.

---

## Order Flow

```
Buyer places order
      ↓
Buyer pays via UPI → submits UTR number
      ↓
Status: Pending → Processing
      ↓
Seller confirms payment
      ↓
Seller ships → enters courier + tracking number
      ↓
Status: Shipped  (buyer sees tracking info)
      ↓
Seller marks delivered
      ↓
Status: Delivered → Buyer can write a review
```
