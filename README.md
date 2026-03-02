# DEV-801

A mobile food commerce application built as part of the DEV-801 module at Epitech. The project consists of a TypeScript/Express REST API backend and a native iOS application built with SwiftUI.

## Architecture Overview

```
┌──────────────┐         ┌──────────────────┐
│  iOS App     │  HTTP   │  Express API     │
│  (SwiftUI)   │◄───────►│  (TypeScript)    │
│              │  :8080  │                  │
│  - Auth      │         │  - Auth (JWT)    │
│  - Products  │         │  - Products      │
│  - Cart      │         │  - Orders        │
│  - Payment   │         │  - Stripe/PayPal │
└──────────────┘         └────────┬─────────┘
                                  │ Mongoose
                                  ▼
                          ┌──────────────┐
                          │   MongoDB    │
                          │   (mongo:8)  │
                          └──────────────┘
                                  ▲
                                  │ Migration
                          ┌──────────────┐
                          │ OpenFoodFacts│
                          │     API      │
                          └──────────────┘
```

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Backend** | Node.js, Express 5, TypeScript, MongoDB (Mongoose), JWT, Stripe, PayPal |
| **iOS** | Swift, SwiftUI, MVVM |
| **Infrastructure** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Product Data** | OpenFoodFacts API |

## Project Structure

```
DEV-801/
├── backend/               # Express/TypeScript REST API
├── ios/                   # SwiftUI iOS application
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## Class Diagram

Data structures and their relationships:

```mermaid
classDiagram
    class User {
        +String email
        +String password
        +String firstName
        +String lastName
        +Date creationDate
    }

    class Product {
        +String code
        +String brands
        +String categories
        +String product_name
        +String image_front_url
        +String ingredients_text_fr
        +String nutriscore_grade
        +String quantity
        +Number price
        +String[] allergens_tags
    }

    class OrderItem {
        +String name
        +Number price
        +Number quantity
        +String currency
        +String imageURL
    }

    class Order {
        +ObjectId _id
        +ObjectId userID
        +OrderItem[] products
        +OrderStatus status
        +Date orderDate
        +String method
    }

    class History {
        +ObjectId orderID
        +ObjectId userID
    }

    class OrderStatus {
        <<enumeration>>
        Pending
        Validated
        Canceled
    }

    User "1" --> "*" Order : places
    Order "1" *-- "1..*" OrderItem : contains
    Order --> "1" OrderStatus : has status
    User "1" --> "*" History : has
    History "*" --> "1" Order : references
```

## Activity Diagrams

### Authentication Flow

```mermaid
flowchart TD
    A([User opens app]) --> B{Authenticated?}
    B -- Yes --> H([Home Screen])
    B -- No --> C([Login Screen])

    C --> D{Has account?}
    D -- No --> E[Fill registration form]
    E --> F[POST /api/auth/register]
    F --> G{Success?}
    G -- Yes --> C
    G -- No --> E

    D -- Yes --> I[Enter email & password]
    I --> J[POST /api/auth/login]
    J --> K{Valid credentials?}
    K -- Yes --> L[Store JWT token]
    L --> H
    K -- No --> I
```

### Product Browsing & Purchase Flow

```mermaid
flowchart TD
    A([Home Screen]) --> B[GET /api/products]
    B --> C[Display product catalog]

    C --> D{User action}
    D -- Browse --> E[Select product]
    E --> F[View product details]
    F --> G[Add to cart]
    G --> D

    D -- Scan --> S[Open barcode scanner]
    S --> T[GET /api/products/:code]
    T --> F

    D -- Checkout --> I{Choose payment method}

    I -- Stripe --> J[POST /api/stripe/pay]
    J --> K[Create order in DB]
    K --> L[Generate Stripe payment link]
    L --> M[User completes payment]
    M --> N[GET /api/stripe/payment_callback]

    I -- PayPal --> O[POST /api/paypal/pay]
    O --> P[Create order in DB]
    P --> Q[Generate PayPal payment link]
    Q --> R[User completes payment]
    R --> U[GET /api/paypal/payment_callback]

    N --> V[POST /api/orders/validate]
    U --> V
    V --> W[Update order status]
    W --> X([Order confirmed])
```

### Order Management Flow

```mermaid
flowchart TD
    A([User]) --> B[GET /api/orders]
    B --> C[Display user orders]
    C --> D{Order status}
    D -- Pending --> E[Awaiting payment confirmation]
    D -- Validated --> F[Order completed]
    D -- Canceled --> G[Order was canceled]

    A --> H[GET /api/history]
    H --> I[Display order history]
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Xcode 15+ (for the iOS app)
- pnpm 10+ (for backend development)

### Run the Backend with Docker

```bash
docker compose up --build
```

This starts:
- The **backend** at `http://localhost:8080`
- **MongoDB** at `localhost:27017`

Swagger documentation is available at `http://localhost:8080/docs`.

### Run the Backend in Development Mode

```bash
cd backend
pnpm install
pnpm dev
```

### Run the iOS App

Open `ios/DEV-801.xcodeproj` in Xcode, then run on a simulator or device.

> The iOS app connects to `http://localhost:8080/api` by default.

## CI/CD

- **backend.yml**: automated build and tests on every push
- **mirror.yml**: syncs the `master` branch to a mirror repository
