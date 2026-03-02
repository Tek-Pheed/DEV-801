# Backend — DEV-801

REST API built with Express 5 and TypeScript, connected to MongoDB via Mongoose. It handles authentication, a product catalog (sourced from OpenFoodFacts), order management, and payments through Stripe & PayPal.

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Express 5** | HTTP framework |
| **TypeScript 5.9** | Language |
| **MongoDB / Mongoose 9** | Database |
| **JWT / bcryptjs** | Authentication |
| **Stripe** | Card payments |
| **PayPal** | Alternative payments |
| **Swagger** | API documentation |
| **Pino** | Logging |
| **Jest / Supertest** | Unit testing |
| **pnpm** | Package manager |

## Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Entry point, Express & MongoDB setup
│   ├── controllers/                # Route handlers
│   │   ├── auth.controller.ts      # Login / Register
│   │   ├── history.controller.ts   # Order history
│   │   ├── order.controller.ts     # Order CRUD & validation
│   │   ├── paypal.controller.ts    # PayPal payment
│   │   ├── ping.controller.ts      # Health check
│   │   ├── products.controller.ts  # Product catalog
│   │   └── stripe.controller.ts    # Stripe payment
│   ├── services/                   # Business logic
│   │   ├── auth.service.ts
│   │   ├── history.service.ts
│   │   ├── order.service.ts
│   │   ├── paypal.service.ts
│   │   ├── products.service.ts
│   │   └── stripe.service.ts
│   ├── schemas/                    # Mongoose models
│   │   ├── users.schema.ts
│   │   ├── products.schema.ts
│   │   ├── order.schema.ts
│   │   └── history.schema.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts      # JWT verification
│   └── utils/
│       ├── converter.ts            # Conversion utilities
│       ├── jwt.ts                  # Token generation & verification
│       ├── logger.ts               # Pino configuration
│       ├── openFoodFacts.ts        # Product migration from OpenFoodFacts
│       └── swagger.ts              # Swagger configuration
├── tests/                          # Unit tests (mirrors src/ structure)
├── Dockerfile
├── package.json
├── tsconfig.json
└── jest.config.ts
```

## API Routes

| Method | Route | Description | Auth Required |
|--------|-------|-------------|:---:|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive a JWT | No |
| `GET` | `/api/products` | List all products | Yes |
| `GET` | `/api/products/:productID` | Get product by ID | Yes |
| `GET` | `/api/products/:code` | Get product by barcode | Yes |
| `GET` | `/api/orders` | Get all orders for the authenticated user | Yes |
| `POST` | `/api/orders/validate` | Update an order's status | Yes |
| `POST` | `/api/stripe/pay` | Create a Stripe payment link | Yes |
| `GET` | `/api/stripe/invoices` | Get Stripe invoices for the user | Yes |
| `GET` | `/api/stripe/payment_callback` | Stripe payment callback | No |
| `POST` | `/api/paypal/pay` | Create a PayPal payment link | Yes |
| `GET` | `/api/paypal/payment_callback` | PayPal payment callback | No |
| `GET` | `/api/history` | Get order history for the user | Yes |
| `GET` | `/api/` | Ping / Health check | No |
| `GET` | `/docs` | Swagger documentation | No |

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| email | String | Unique |
| password | String | Hashed with bcrypt |
| firstName | String | |
| lastName | String | |
| creationDate | Date | Default: now |

### Product (OpenFoodFacts)
| Field | Type | Notes |
|-------|------|-------|
| code | String | Unique barcode |
| brands | String | |
| categories | String | |
| product_name | String | |
| image_front_url | String | |
| ingredients_text_fr | String | French ingredients |
| nutriscore_grade | String | A to E |
| quantity | String | |
| price | Number | Optional |
| allergens_tags | String[] | Optional |

### Order
| Field | Type | Notes |
|-------|------|-------|
| userID | ObjectId | References User |
| products | OrderItem[] | Embedded documents |
| status | String | Pending / Validated / Canceled |
| orderDate | Date | Default: now |
| method | String | Stripe or PayPal |

### OrderItem (embedded in Order)
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| price | Number | |
| quantity | Number | |
| currency | String | Default: EUR |
| imageURL | String | Optional |

### History
| Field | Type | Notes |
|-------|------|-------|
| orderID | ObjectId | References Order |
| userID | ObjectId | References User |

## Scripts

```bash
pnpm dev              # Start in development mode (nodemon + ts-node)
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run the compiled version
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage report
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `MONGO_URI` | MongoDB connection URI |
| `SECRET` | Secret key for JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret |

## Data Migration

On startup, the backend automatically runs a migration that fetches French food products from the OpenFoodFacts API and inserts them into MongoDB.
