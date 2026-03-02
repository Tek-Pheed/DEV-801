# iOS — DEV-801

Native iOS application built with SwiftUI, allowing users to browse a food product catalog, scan barcodes, manage a shopping cart, and complete payments.

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Swift** | Language |
| **SwiftUI** | UI framework |
| **MVVM** | Architecture pattern |
| **URLSession** | Networking |
| **AVFoundation** | Camera / Barcode scanning |
| **WebKit** | Payment webview (Stripe) |
| **UserDefaults** | Token storage |

## Architecture

The application follows a **layered MVVM architecture** with modular feature organization.

```mermaid
graph TB
    subgraph Application["Application Layer"]
        App[DEV_801App]
    end

    subgraph Modules["Feature Modules"]
        subgraph Auth["Auth Module"]
            direction TB
            AuthV["Views<br/>LoginView · RegisterView"]
            AuthVM["ViewModels<br/>LoginViewModel · RegisterViewModel"]
            AuthR["AuthRepository"]
            AuthE["AuthEndpoint"]
            AuthM["AuthModels<br/>LoginRequest · RegisterRequest · LoginResponse"]
        end

        subgraph Home["Home Module"]
            direction TB
            HomeV["Views<br/>HomeView · ProductCardView<br/>ProductDetailView · CartSheetView<br/>BarcodeScannerView"]
            HomeVM["CartManager"]
            HomeR["ProductRepository"]
            HomeE["ProductEndpoint"]
            HomeM["Product · CartItem"]
        end

        subgraph Payment["Payment Module"]
            direction TB
            PayV["PaiementView<br/>(Stripe WebView)"]
        end
    end

    subgraph Core["Core Layer"]
        APIClient["APIClient<br/>(Singleton)"]
        APIEndpoint["APIEndpoint<br/>(Protocol)"]
        APIError["APIError"]
        TokenStorage["TokenStorage<br/>(Singleton)"]
    end

    subgraph External["External"]
        Backend["Express API<br/>localhost:8080"]
    end

    App --> AuthV
    App --> HomeV

    AuthV --> AuthVM
    AuthVM --> AuthR
    AuthR --> AuthE
    AuthE -.-> APIEndpoint
    AuthR --> APIClient

    HomeV --> HomeVM
    HomeV --> HomeR
    HomeR --> HomeE
    HomeE -.-> APIEndpoint
    HomeR --> APIClient

    HomeV --> PayV

    AuthVM --> TokenStorage
    HomeE --> TokenStorage
    APIClient --> Backend
```

### Layer Responsibilities

| Layer | Responsibility | Key Components |
|-------|---------------|----------------|
| **Application** | App entry point, root navigation based on auth state | `DEV_801App` |
| **Core / Network** | Shared HTTP client, endpoint protocol, error handling, token persistence | `APIClient`, `APIEndpoint`, `APIError`, `TokenStorage` |
| **Module / Data** | Data access, API endpoint definitions, request/response models | `AuthRepository`, `ProductRepository`, `AuthEndpoint`, `ProductEndpoint` |
| **Module / Presentation** | UI and presentation logic, user interaction handling | Views, ViewModels, `CartManager` |

### Key Components

**APIClient** — Singleton HTTP client wrapping `URLSession`. Handles request execution, response validation, JSON decoding (with snake_case conversion), and error mapping. Exposes `request<T: Decodable>()` for typed responses and `requestVoid()` for empty responses.

**APIEndpoint** — Protocol defining `baseURL`, `path`, `method`, `headers`, `body`, and `queryItems`. Each feature module provides its own enum conforming to this protocol (e.g. `AuthEndpoint`, `ProductEndpoint`).

**TokenStorage** — Singleton managing the JWT token in `UserDefaults`. Provides `save(token:)`, `getToken()`, `clear()`, and an `isAuthenticated` computed property.

**CartManager** — `ObservableObject` managing the shopping cart state in memory. Provides add, remove, increment/decrement operations and computed `totalPrice`/`itemCount` properties.

**CameraViewController** — `UIViewController` wrapping `AVCaptureSession` for barcode scanning. Supports EAN-8, EAN-13, UPC-E, Code 128, Code 39, Code 93, and QR codes. Bridged to SwiftUI via `UIViewControllerRepresentable`.

## Data Flow Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginView
    participant LoginViewModel
    participant AuthRepository
    participant APIClient
    participant Backend
    participant TokenStorage

    User->>LoginView: Enter email & password
    LoginView->>LoginViewModel: login()
    LoginViewModel->>LoginViewModel: isLoading = true
    LoginViewModel->>AuthRepository: login(email, password)
    AuthRepository->>AuthRepository: Create LoginRequest
    AuthRepository->>APIClient: request(AuthEndpoint.login)
    APIClient->>APIClient: Build URLRequest from endpoint
    APIClient->>Backend: POST /api/auth/login
    Backend-->>APIClient: { token: "jwt..." }
    APIClient-->>AuthRepository: LoginResponse
    AuthRepository-->>LoginViewModel: LoginResponse
    LoginViewModel->>TokenStorage: save(token)
    LoginViewModel->>LoginViewModel: isAuthenticated = true
    LoginView-->>User: Navigate to HomeView
```

### Product Browsing Flow

```mermaid
sequenceDiagram
    participant User
    participant HomeView
    participant ProductRepository
    participant APIClient
    participant Backend
    participant TokenStorage

    HomeView->>HomeView: .task { loadProducts() }
    HomeView->>ProductRepository: fetchProducts()
    ProductRepository->>APIClient: request(ProductEndpoint.getAll)
    APIClient->>TokenStorage: getToken()
    TokenStorage-->>APIClient: JWT token
    APIClient->>Backend: GET /api/products (Bearer token)
    Backend-->>APIClient: [Product]
    APIClient-->>ProductRepository: [Product]
    ProductRepository-->>HomeView: [Product]
    HomeView->>HomeView: Update products state
    HomeView-->>User: Display product grid

    User->>HomeView: Tap on product
    HomeView->>ProductDetailView: Present sheet(productId)
    ProductDetailView->>ProductRepository: fetchProduct(id)
    ProductRepository->>APIClient: request(ProductEndpoint.getById)
    APIClient->>Backend: GET /api/products/:id
    Backend-->>APIClient: Product
    APIClient-->>ProductRepository: Product
    ProductRepository-->>ProductDetailView: Product
    ProductDetailView-->>User: Display product details
```

### Barcode Scanning Flow

```mermaid
sequenceDiagram
    participant User
    participant HomeView
    participant BarcodeScannerView
    participant CameraViewController
    participant ProductRepository
    participant APIClient
    participant Backend
    participant CartManager

    User->>HomeView: Tap scanner button
    HomeView->>BarcodeScannerView: Present fullScreenCover
    BarcodeScannerView->>CameraViewController: Start AVCaptureSession
    CameraViewController->>CameraViewController: Detect barcode metadata
    CameraViewController-->>BarcodeScannerView: onCodeScanned(code)
    BarcodeScannerView->>ProductRepository: fetchProductByCode(code)
    ProductRepository->>APIClient: request(ProductEndpoint.getByCode)
    APIClient->>Backend: GET /api/products/code/:code
    Backend-->>APIClient: Product
    APIClient-->>ProductRepository: Product
    ProductRepository-->>BarcodeScannerView: Product
    BarcodeScannerView-->>User: Display product result

    User->>BarcodeScannerView: Tap "Add to cart"
    BarcodeScannerView->>HomeView: onProductFound(product)
    HomeView->>CartManager: addToCart(product)
    CartManager->>CartManager: Update items array
    BarcodeScannerView-->>HomeView: dismiss()
```

### Cart & Checkout Flow

```mermaid
sequenceDiagram
    participant User
    participant ProductCardView
    participant CartManager
    participant CartSheetView
    participant PaiementView

    User->>ProductCardView: Tap "+" button
    ProductCardView->>CartManager: addToCart(product)
    CartManager->>CartManager: Insert or increment quantity
    CartManager-->>CartSheetView: @Published items updated

    CartSheetView-->>User: Show cart (collapsed bar or expanded list)
    User->>CartSheetView: Adjust quantities
    CartSheetView->>CartManager: incrementQuantity / decrementQuantity
    CartManager-->>CartSheetView: Updated items & totalPrice

    User->>CartSheetView: Tap "Commander"
    CartSheetView->>PaiementView: NavigationLink
    PaiementView->>PaiementView: Load Stripe checkout URL in WebView
    PaiementView-->>User: Stripe payment page
```

## Project Structure

```
ios/DEV-801/
├── Application/
│   └── DEV_801App.swift            # Entry point, auth-based navigation
├── Core/
│   └── Network/
│       ├── APIClient.swift         # Shared HTTP client (Singleton)
│       ├── APIEndpoint.swift       # Endpoint protocol definition
│       ├── APIError.swift          # Network error types
│       └── TokenStorage.swift      # JWT token management (Singleton)
├── Modules/
│   ├── Auth/
│   │   ├── Data/
│   │   │   ├── AuthEndpoint.swift      # Login / Register endpoints
│   │   │   ├── AuthModels.swift        # Request / Response models
│   │   │   └── AuthRepository.swift    # Data access layer
│   │   └── Presentation/
│   │       ├── Login/
│   │       │   ├── LoginView.swift
│   │       │   └── LoginViewModel.swift
│   │       └── Register/
│   │           ├── RegisterView.swift
│   │           └── RegisterViewModel.swift
│   ├── Home/
│   │   ├── Data/
│   │   │   ├── CartManager.swift           # Cart state (ObservableObject)
│   │   │   ├── Product.swift               # Product model (Decodable)
│   │   │   ├── ProductEndpoint.swift       # Product API endpoints
│   │   │   └── ProductRepository.swift     # Data access layer
│   │   └── Presentation/
│   │       ├── BarcodeScannerView.swift     # AVFoundation barcode scanner
│   │       ├── CartSheetView.swift          # Cart sheet (collapsible)
│   │       ├── HomeView.swift              # Main screen (product grid)
│   │       ├── ProductCardView.swift       # Product card component
│   │       └── ProductDetailView.swift     # Product detail sheet
│   └── Paiement/
│       └── Presentation/
│           └── PaiementView.swift          # Stripe payment (WebView)
└── Resources/
    └── Assets.xcassets/
```

## Modules

### Auth
Handles login and registration. The JWT token received from the backend is stored locally via `TokenStorage`. App navigation at launch depends on the authentication state (`LoginViewModel.isAuthenticated`).

### Home
Displays the food product catalog fetched from the backend. Features include:
- Browsing products in a grid layout with category filtering and search
- Viewing product details (nutriscore, brand, category, allergens, ingredients)
- Scanning a barcode via the device camera to find a product
- Adding products to an in-memory cart managed by `CartManager`

### Payment
Loads a Stripe checkout page in a `WKWebView` to finalize an order.

## Configuration

The app connects to the backend at `http://localhost:8080/api` by default. To change the URL, edit the `baseURL` property in the `APIEndpoint` protocol extension (`Core/Network/APIEndpoint.swift`).

## Prerequisites

- **Xcode 15+**
- **iOS 17+**
- Backend running locally (see the backend README)

## Running the App

1. Open `ios/DEV-801.xcodeproj` in Xcode
2. Select a simulator or device
3. Run with **Cmd + R**
