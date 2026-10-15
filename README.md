# ShopKart

ShopKart is a full-stack e-commerce application. The frontend is built with React and Vite, and the backend uses Node.js, Express, and MongoDB.

## Features

- Customer registration, login, profile, and logout
- Product browsing, search, category filtering, and product details
- Shopping cart and wishlist
- Order history and order details
- Razorpay checkout and payment verification

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB database, either local or hosted by MongoDB Atlas
- Razorpay test keys to exercise checkout

## Project structure

```text
backend/
  controllers/    Request handlers
  middlewares/    Authentication middleware
  models/         MongoDB models
  routes/         Express routes
  index.js        Backend entry point
frontend/
  src/
    components/   Shared React components
    context/      Shared cart state
    pages/        Application pages
    services/     API client
```

## Local setup

### 1. Configure the backend

Open a terminal in the project folder and install the backend dependencies:

```powershell
cd backend
npm ci
```

Create a local environment file by copying the provided example:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and set the values for your environment:

```dotenv
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Use your own MongoDB connection string and Razorpay test credentials. Keep `.env` private; do not commit credentials or add them to frontend code.

Start MongoDB if you are running it locally. Then start the backend from the `backend` directory:

```powershell
npm run dev
```

The API listens on port `5000` by default. You can check that the server started by opening `http://localhost:5000/`; it should respond with `ShopKart Backend is running`.

### 2. Start the frontend

Open a second terminal in the project folder:

```powershell
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

For local development, the frontend API client uses `http://localhost:5000`, and the backend allows credentialed requests from `http://localhost:5173`. If you change either port or host, update the corresponding frontend API base URL and backend CORS origin to match.

### 3. Try the application

1. Register an account and sign in.
2. Browse products, add items to your cart or wishlist, and review your profile.
3. Add products to MongoDB before browsing if the database starts empty. There is no product-seeding script in this repository; the backend exposes `POST /products` for creating products.
4. To test payment, configure Razorpay **test** credentials in the backend environment and use Razorpay's test payment details.

Checkout requires an authenticated account, a non-empty cart, valid shipping details, and working Razorpay configuration. Opening checkout does not clear the cart. The cart is cleared only after payment verification succeeds.

## Useful commands

Run these commands from the relevant folder:

| Folder | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the backend with nodemon |
| `backend` | `npm start` | Start the backend with Node.js |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Create a production frontend build in `frontend/dist` |
| `frontend` | `npm run preview` | Preview the production build locally |
| `frontend` | `npm run lint` | Run Oxlint |

The frontend does not define a test script, and the backend's `npm test` script is a placeholder that exits with an error.

## Application routes

| Route | Page |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account |
| `/home` | Profile and shopping home |
| `/products` | Product listing and filters |
| `/products/:id` | Product details |
| `/wishlist` | Saved products |
| `/cart` | Shopping cart |
| `/checkout` | Shipping details and Razorpay checkout |
| `/order-success/:id` | Order confirmation |
| `/orders` | Order history |
| `/orders/:id` | Order details |

## Troubleshooting

- **MongoDB connection fails:** Confirm MongoDB is running (for a local database) and that `MONGO_URI` is valid.
- **The frontend cannot reach the API:** Confirm the backend is running on port `5000`. Check that the browser origin is `http://localhost:5173`, which is the origin currently allowed by the backend.
- **Login or cart requests do not retain authentication:** The application uses credentialed requests and authentication cookies. Use the configured local frontend and backend origins, and ensure the browser accepts local cookies.
- **No products appear:** The repository does not include a product seed script. Add product records to the connected database before browsing.
- **Razorpay checkout cannot start:** Verify the backend Razorpay test key ID and secret, and confirm the browser can load Razorpay Checkout.
