# ShopEase

ShopEase is a responsive MERN e-commerce application with a React/Vite storefront and a Node.js/Express API backed by MongoDB.

## What’s included

- Customer registration, sign-in, JWT-protected pages, and email-based password reset.
- Product search, category/price filters, sorting, product details, verified-purchase reviews, and stock checks.
- MongoDB-backed cart, saved delivery addresses, COD and Razorpay checkout, order tracking, and eligible cancellation.
- Seller/admin dashboard for products, stock, orders, sales, and payment records.
- Seller-only product image uploads (JPG, PNG, WebP; up to 5 MB) stored in `backend/uploads`.
- Passwords are bcrypt-hashed. Razorpay signatures are verified by the API; card details are never stored.

## Requirements

- Node.js 20 or newer and npm.
- MongoDB Community Server or a MongoDB Atlas connection string.
- Optional: Razorpay test API keys for online checkout.
- Optional: SMTP credentials for password-reset email.

## Run locally

1. Start MongoDB, or create a database in MongoDB Atlas.
2. Configure and run the API:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   # Edit .env and set MONGODB_URI and a random JWT_SECRET (32+ characters).
   npm install
   npm run seed
   npm run dev
   ```

3. In a second terminal, configure and run the React app:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

4. Open <http://localhost:5173>. The API health check is at <http://localhost:5000/api/health>.

The backend listens on port `5000` by default. `CLIENT_URL` may contain a comma-separated list of allowed frontend origins. `VITE_API_URL` defaults to `http://localhost:5000/api`. If MongoDB Atlas SRV lookup fails in Node with `ECONNREFUSED`, set `MONGODB_DNS_SERVERS` in `backend/.env` to a comma-separated list of DNS server IPs configured on your computer.

## Seller access

New sign-ups and customer sign-ins are restricted to the customer role; a public registration request cannot assign itself seller access. Sellers use the separate `/seller-login` page. To grant seller access to a trusted account, register it first and update its role using the MongoDB shell:

```javascript
use shopease
db.users.updateOne({ email: "seller@example.com" }, { $set: { role: "seller" } })
```

Sign out and use Seller sign in after changing the role. The seller dashboard and product management APIs enforce the seller/admin role on the server.

For local testing, `npm run seed` creates this demo seller account when `NODE_ENV` is not `production` (existing account passwords are not overwritten):

| Login | Value |
| --- | --- |
| Seller ID | `seller@shopease.test` |
| Password | `ShopEaseSeller123!` |

This shared demo credential is for local testing only. The seed script skips it in production; create real seller accounts and assign their role through a trusted administrative process.

## Optional integrations

### Razorpay test mode

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env` to Razorpay **test-mode** credentials. The frontend loads Razorpay Checkout; the backend creates the payment order and verifies the returned HMAC signature. Leave these values unset to offer cash on delivery only. Never put the secret key in frontend variables.

### Password reset email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, and `CLIENT_URL` in `backend/.env`. Reset tokens are random, hashed before storage, expire after 30 minutes, and are sent only by email. Without SMTP settings, password-reset requests return an explicit configuration error.

## Project layout

```text
frontend/                 React 18 + Vite storefront
  src/components/         Shared layout and product components
  src/context/            Authentication and cart state
  src/pages/               Store, account, checkout, and seller screens
  src/services/            API client
backend/                  Express REST API
  config/                  MongoDB connection
  middleware/              Authentication, authorization, error handling
  models/                  Users, products, carts, orders, payments, reviews
  routes/                  Auth, catalog, cart, order, payment, seller APIs
  uploads/                 Runtime product images (created on first upload)
```

## Notes

- `backend/.env.example` and `frontend/.env.example` list the environment variables each app uses. Never commit `.env` files.
- Product images can be supplied as HTTPS URLs or uploaded in the seller dashboard. Local uploads are stored on the API server; use persistent storage or an object-storage service when deploying to ephemeral hosts.
- The storefront can still browse and search eight local sample products while the API is offline. These previews cannot be added to the cart or purchased; sign-in, cart persistence, checkout, and live inventory require the Express API and MongoDB to be configured and running.
- Use HTTPS, a production JWT secret, and production-grade MongoDB/SMTP/Razorpay settings when deploying.
