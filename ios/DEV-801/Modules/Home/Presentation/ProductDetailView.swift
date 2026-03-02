//
//  ProductDetailView.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import SwiftUI

struct ProductDetailView: View {
    let productId: String
    let onAddToCart: (Product) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var product: Product?
    @State private var isLoading = true
    @State private var errorMessage: String?

    private let repository = ProductRepository()

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = errorMessage {
                    ContentUnavailableView {
                        Label("Erreur", systemImage: "exclamationmark.triangle")
                    } description: {
                        Text(error)
                    } actions: {
                        Button("Réessayer") {
                            Task { await loadProduct() }
                        }
                    }
                } else if let product {
                    productContent(product)
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .task {
                await loadProduct()
            }
        }
    }

    private func loadProduct() async {
        isLoading = true
        errorMessage = nil
        do {
            product = try await repository.fetchProduct(id: productId)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    @ViewBuilder
    private func productContent(_ product: Product) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                productImage(product)
                productInfo(product)
            }
        }
        .safeAreaInset(edge: .bottom) {
            addToCartButton(product)
        }
    }

    private func productImage(_ product: Product) -> some View {
        AsyncImage(url: product.imageURL) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .scaledToFit()
            case .failure:
                Image(systemName: "photo")
                    .font(.system(size: 60))
                    .foregroundStyle(.tertiary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 280)
                    .background(Color(.systemGray6))
            default:
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .frame(height: 280)
                    .background(Color(.systemGray6))
            }
        }
        .frame(maxWidth: .infinity)
        .frame(maxHeight: 320)
        .clipped()
        .background(.white)
    }

    private func productInfo(_ product: Product) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            headerSection(product)

            if let nutriscore = product.nutriscoreGrade, !nutriscore.isEmpty {
                nutriscoreSection(nutriscore)
            }

            if let quantity = product.quantity, !quantity.isEmpty {
                detailRow(icon: "scalemass", title: "Quantité", value: quantity)
            }

            if let brands = product.brands, !brands.isEmpty {
                detailRow(icon: "building.2", title: "Marque", value: brands)
            }

            if let code = product.code {
                detailRow(icon: "barcode", title: "Code-barres", value: code)
            }

            if !product.cleanAllergens.isEmpty {
                allergensSection(product.cleanAllergens)
            }

            if let ingredients = product.ingredientsTextFr, !ingredients.isEmpty {
                ingredientsSection(ingredients)
            }
        }
        .padding(20)
    }

    private func headerSection(_ product: Product) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(product.name)
                .font(.system(.title2, weight: .bold))

            if let brands = product.brands, !brands.isEmpty {
                Text(brands)
                    .font(.system(.subheadline))
                    .foregroundStyle(.secondary)
            }

            if let price = product.price {
                Text(price, format: .currency(code: "EUR"))
                    .font(.system(.title3, weight: .bold))
                    .foregroundStyle(Color.accentColor)
                    .padding(.top, 4)
            }
        }
    }

    private func nutriscoreSection(_ grade: String) -> some View {
        sectionCard {
            HStack(spacing: 12) {
                Image(systemName: "leaf.fill")
                    .foregroundStyle(nutriscoreColor(grade))
                    .font(.title3)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Nutri-Score")
                        .font(.system(.caption, weight: .medium))
                        .foregroundStyle(.secondary)

                    Text(grade.uppercased())
                        .font(.system(.title2, weight: .black))
                        .foregroundStyle(nutriscoreColor(grade))
                }

                Spacer()

                HStack(spacing: 4) {
                    ForEach(["a", "b", "c", "d", "e"], id: \.self) { letter in
                        Text(letter.uppercased())
                            .font(.system(.caption2, weight: .bold))
                            .foregroundStyle(letter == grade.lowercased() ? .white : nutriscoreColor(letter).opacity(0.6))
                            .frame(width: 28, height: 28)
                            .background(
                                letter == grade.lowercased()
                                    ? nutriscoreColor(letter)
                                    : nutriscoreColor(letter).opacity(0.15),
                                in: RoundedRectangle(cornerRadius: 6)
                            )
                    }
                }
            }
        }
    }

    private func nutriscoreColor(_ grade: String) -> Color {
        switch grade.lowercased() {
        case "a": return .green
        case "b": return Color(red: 0.5, green: 0.8, blue: 0.2)
        case "c": return .yellow
        case "d": return .orange
        case "e": return .red
        default: return .gray
        }
    }

    private func detailRow(icon: String, title: String, value: String) -> some View {
        sectionCard {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundStyle(Color.accentColor)
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(.caption, weight: .medium))
                        .foregroundStyle(.secondary)
                    Text(value)
                        .font(.system(.subheadline, weight: .medium))
                }

                Spacer()
            }
        }
    }

    private func allergensSection(_ allergens: [String]) -> some View {
        sectionCard {
            VStack(alignment: .leading, spacing: 10) {
                Label("Allergènes", systemImage: "exclamationmark.triangle.fill")
                    .font(.system(.subheadline, weight: .semibold))
                    .foregroundStyle(.orange)

                FlowLayout(spacing: 8) {
                    ForEach(allergens, id: \.self) { allergen in
                        Text(allergen)
                            .font(.system(.caption, weight: .medium))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.orange.opacity(0.1), in: Capsule())
                            .foregroundStyle(.orange)
                    }
                }
            }
        }
    }

    private func ingredientsSection(_ text: String) -> some View {
        sectionCard {
            VStack(alignment: .leading, spacing: 10) {
                Label("Ingrédients", systemImage: "list.bullet")
                    .font(.system(.subheadline, weight: .semibold))

                Text(text)
                    .font(.system(.caption))
                    .foregroundStyle(.secondary)
                    .lineSpacing(4)
            }
        }
    }

    private func addToCartButton(_ product: Product) -> some View {
        Button {
            onAddToCart(product)
            dismiss()
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "cart.badge.plus")
                Text("Ajouter au panier")
            }
            .font(.system(.body, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial)
    }

    @ViewBuilder
    private func sectionCard<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        content()
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}
