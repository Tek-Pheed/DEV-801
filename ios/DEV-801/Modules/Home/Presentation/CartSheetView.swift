import SwiftUI

struct CartSheetView: View {
    @ObservedObject var cartManager: CartManager
    @Binding var selectedDetent: PresentationDetent
    @State private var selectedPaymentMethod: PaymentMethod?

    private var isCollapsed: Bool {
        selectedDetent == .height(60)
    }

    var body: some View {
        VStack(spacing: 0) {
            if isCollapsed {
                collapsedBar
            } else {
                NavigationStack {
                    VStack(spacing: 0) {
                        cartHeader
                        cartItemsList
                        checkoutSection
                    }
                    .navigationDestination(item: $selectedPaymentMethod) { method in
                        PaiementView(cartManager: cartManager, paymentMethod: method)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .animation(.easeInOut(duration: 0.2), value: isCollapsed)
    }

    private var collapsedBar: some View {
        HStack {
            Image(systemName: "cart.fill")
                .foregroundStyle(Color.accentColor)

            Text("\(cartManager.itemCount) article\(cartManager.itemCount > 1 ? "s" : "")")
                .font(.system(.subheadline, weight: .medium))
                .foregroundStyle(.secondary)

            Spacer()

            Text(cartManager.totalPrice, format: .currency(code: "EUR"))
                .font(.system(.subheadline, weight: .bold))
        }
        .padding(.horizontal, 20)
        .padding(.top, 4)
    }

    private var cartHeader: some View {
        HStack {
            Image(systemName: "cart.fill")
                .font(.title3)
                .foregroundStyle(Color.accentColor)

            Text("Mon Panier")
                .font(.system(.title3, weight: .bold))

            Spacer()

            Text("\(cartManager.itemCount)")
                .font(.system(.caption, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 24, height: 24)
                .background(Color.accentColor, in: Circle())
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
        .padding(.bottom, 12)
    }

    private var cartItemsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(cartManager.items) { item in
                    cartItemRow(item)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 4)
        }
    }

    private func cartItemRow(_ item: CartItem) -> some View {
        HStack(spacing: 12) {
            AsyncImage(url: item.product.imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .failure:
                    Image(systemName: "photo")
                        .foregroundStyle(.tertiary)
                default:
                    ProgressView()
                }
            }
            .frame(width: 56, height: 56)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.product.name)
                    .font(.system(.subheadline, weight: .semibold))
                    .lineLimit(1)

                if let price = item.product.price {
                    Text(price, format: .currency(code: "EUR"))
                        .font(.system(.caption, weight: .medium))
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            HStack(spacing: 12) {
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        cartManager.decrementQuantity(item)
                    }
                } label: {
                    Image(systemName: "minus")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(Color.accentColor)
                        .frame(width: 28, height: 28)
                        .background(Color.accentColor.opacity(0.12), in: Circle())
                }

                Text("\(item.quantity)")
                    .font(.system(.body, weight: .semibold))
                    .frame(minWidth: 20)

                Button {
                    withAnimation(.spring(response: 0.3)) {
                        cartManager.incrementQuantity(item)
                    }
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(Color.accentColor)
                        .frame(width: 28, height: 28)
                        .background(Color.accentColor.opacity(0.12), in: Circle())
                }
            }
        }
        .padding(12)
        .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var checkoutSection: some View {
        VStack(spacing: 12) {
            Divider()

            HStack {
                Text("Total")
                    .font(.system(.body, weight: .medium))
                    .foregroundStyle(.secondary)

                Spacer()

                Text(cartManager.totalPrice, format: .currency(code: "EUR"))
                    .font(.system(.title3, weight: .bold))
            }
            .padding(.horizontal, 20)

            HStack(spacing: 12) {
                Button {
                    selectedPaymentMethod = .paypal
                } label: {
                    Label("PayPal", systemImage: "creditcard")
                        .font(.system(.body, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color.blue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }

                Button {
                    selectedPaymentMethod = .stripe
                } label: {
                    Label("Stripe", systemImage: "creditcard.fill")
                        .font(.system(.body, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color.purple, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
        }
    }
}

#Preview {
    let sampleProduct = Product(
        mongoId: "abc123",
        code: "123",
        productName: "Croissant",
        brands: "Boulangerie",
        categories: "Viennoiseries",
        nutriscoreGrade: "d",
        imageFrontUrl: nil,
        quantity: "100g",
        allergensTags: nil,
        ingredientsTextFr: nil,
        price: 1.20
    )

    NavigationStack {
        Color.clear
            .sheet(isPresented: .constant(true)) {
                CartSheetView(cartManager: {
                    let manager = CartManager()
                    manager.addToCart(sampleProduct)
                    return manager
                }(), selectedDetent: .constant(.medium))
                .presentationDetents([.height(60), .medium, .large])
                .presentationDragIndicator(.visible)
            }
    }
}
