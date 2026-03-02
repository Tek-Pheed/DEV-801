import Foundation
import Combine

struct CartItem: Identifiable {
    let id = UUID()
    let product: Product
    var quantity: Int
}

@MainActor
class CartManager: ObservableObject {
    @Published var items: [CartItem] = []

    var totalPrice: Double {
        items.reduce(0) { $0 + (($1.product.price ?? 0) * Double($1.quantity)) }
    }

    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    func addToCart(_ product: Product) {
        if let index = items.firstIndex(where: { $0.product == product }) {
            items[index].quantity += 1
        } else {
            items.append(CartItem(product: product, quantity: 1))
        }
    }

    func removeFromCart(_ item: CartItem) {
        items.removeAll { $0.id == item.id }
    }

    func decrementQuantity(_ item: CartItem) {
        if let index = items.firstIndex(where: { $0.id == item.id }) {
            if items[index].quantity > 1 {
                items[index].quantity -= 1
            } else {
                items.remove(at: index)
            }
        }
    }

    func incrementQuantity(_ item: CartItem) {
        if let index = items.firstIndex(where: { $0.id == item.id }) {
            items[index].quantity += 1
        }
    }
    
    func clearCart() {
        items.removeAll()
    }

    func getAllProduct() -> PaypalOrderModel {
        let order = PaypalOrderModel(
            products: items.map { item in
                ProductRequest(
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price ?? 0,
                    currency: "EUR",
                    imageUrl: item.product.imageFrontUrl ?? ""
                )
            }
        )
       return order
    }
}
