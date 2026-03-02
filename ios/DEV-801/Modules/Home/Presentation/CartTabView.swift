import SwiftUI

struct CartTabView: View {
    @ObservedObject var cartManager: CartManager
    @State private var selectedPaymentMethod: PaymentMethod?

    var body: some View {
        NavigationStack {
            Group {
                if cartManager.items.isEmpty {
                    ContentUnavailableView {
                        Label("Panier vide", systemImage: "cart")
                    } description: {
                        Text("Ajoutez des produits depuis l'accueil ou le scanner")
                    }
                } else {
                    VStack(spacing: 0) {
                        cartItemsList
                        checkoutSection
                    }
                }
            }
            .navigationTitle("Mon Panier")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(item: $selectedPaymentMethod) { method in
                PaiementView(cartManager: cartManager, paymentMethod: method)
            }
        }
    }

    private var cartItemsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(cartManager.items) { item in
                    cartItemRow(item)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
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
    CartTabView(cartManager: CartManager())
}
