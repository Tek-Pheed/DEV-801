import SwiftUI

extension String: @retroactive Identifiable {
    public var id: String { self }
}

struct HomeView: View {
    @ObservedObject var cartManager: CartManager
    @State private var selectedCategory = "Tout"
    @State private var searchText = ""

    @State private var products: [Product] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var selectedProductId: String?

    private let repository = ProductRepository()

    private let columns = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]

    private var availableCategories: [String] {
        let cats = Set(products.map(\.category))
        return ["Tout"] + cats.sorted()
    }

    private let displayLimit = 20

    private var filteredProducts: [Product] {
        var result = products
        if selectedCategory != "Tout" {
            result = result.filter { $0.category == selectedCategory }
        }
        if !searchText.isEmpty {
            result = result.filter {
                $0.name.localizedCaseInsensitiveContains(searchText)
            }
        }
        return Array(result.prefix(displayLimit))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()

                if isLoading && products.isEmpty {
                    ProgressView("Chargement des produits...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = errorMessage, products.isEmpty {
                    ContentUnavailableView {
                        Label("Erreur", systemImage: "exclamationmark.triangle")
                    } description: {
                        Text(error)
                    } actions: {
                        Button("Réessayer") {
                            Task { await loadProducts() }
                        }
                    }
                } else {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 24) {
                            headerSection
                            searchBar
                            categoryPicker
                            productsGrid
                        }
                        .padding(.bottom, 80)
                    }
                    .refreshable {
                        await loadProducts()
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await loadProducts()
            }
            .sheet(item: $selectedProductId) { productId in
                ProductDetailView(productId: productId) { product in
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                        cartManager.addToCart(product)
                    }
                }
                .presentationDragIndicator(.visible)
                .presentationCornerRadius(24)
            }
        }
    }

    private func loadProducts() async {
        isLoading = true
        errorMessage = nil
        do {
            products = try await repository.fetchProducts()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Bonjour 👋")
                .font(.system(.title2, weight: .bold))

            Text("Qu'est-ce qui vous ferait plaisir ?")
                .font(.system(.subheadline))
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
    }

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.tertiary)
                .font(.system(size: 16, weight: .medium))

            TextField("Rechercher un produit...", text: $searchText)
                .font(.system(.subheadline))
        }
        .padding(12)
        .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
        .padding(.horizontal, 20)
    }

    private var categoryPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(availableCategories, id: \.self) { category in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            selectedCategory = category
                        }
                    } label: {
                        Text(category)
                            .font(.system(.subheadline, weight: selectedCategory == category ? .semibold : .medium))
                            .foregroundStyle(selectedCategory == category ? .white : .primary)
                            .padding(.horizontal, 18)
                            .padding(.vertical, 10)
                            .background(
                                selectedCategory == category
                                    ? AnyShapeStyle(Color.accentColor)
                                    : AnyShapeStyle(Color(.systemBackground)),
                                in: Capsule()
                            )
                            .overlay {
                                if selectedCategory != category {
                                    Capsule()
                                        .strokeBorder(Color(.systemGray4), lineWidth: 1)
                                }
                            }
                    }
                }
            }
            .padding(.horizontal, 20)
        }
    }

    private var productsGrid: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(filteredProducts) { product in
                ProductCardView(product: product) {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                        cartManager.addToCart(product)
                    }
                }
                .onTapGesture {
                    selectedProductId = product.id
                }
            }
        }
        .padding(.horizontal, 20)
        .animation(.spring(response: 0.35), value: filteredProducts.map(\.id))
    }
}

#Preview {
    HomeView(cartManager: CartManager())
}
