import SwiftUI

struct ProductCardView: View {
    let product: Product
    let onAddToCart: () -> Void

    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            AsyncImage(url: product.imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .failure:
                    Image(systemName: "photo")
                        .font(.largeTitle)
                        .foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color(.systemGray6))
                default:
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color(.systemGray6))
                }
            }
            .frame(height: 130)
            .clipped()

            VStack(alignment: .leading, spacing: 6) {
                Text(product.name)
                    .font(.system(.subheadline, weight: .semibold))
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                if let brands = product.brands, !brands.isEmpty {
                    Text(brands)
                        .font(.system(.caption2))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                HStack {
                    if let price = product.price {
                        Text(price, format: .currency(code: "EUR"))
                            .font(.system(.callout, weight: .bold))
                            .foregroundStyle(Color.accentColor)
                    } else if let qty = product.quantity, !qty.isEmpty {
                        Text(qty)
                            .font(.system(.caption, weight: .medium))
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Button(action: onAddToCart) {
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(width: 30, height: 30)
                            .background(Color.accentColor, in: Circle())
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
        }
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 4)
        .scaleEffect(isPressed ? 0.96 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
    }
}

#Preview {
    ProductCardView(
        product: Product(
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
        ),
        onAddToCart: {}
    )
    .frame(width: 180)
    .padding()
}
