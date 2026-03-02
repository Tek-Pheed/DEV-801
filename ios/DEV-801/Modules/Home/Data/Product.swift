import Foundation

struct Product: Identifiable, Equatable, Decodable {
    let mongoId: String?
    let code: String?
    let productName: String?
    let brands: String?
    let categories: String?
    let nutriscoreGrade: String?
    let imageFrontUrl: String?
    let quantity: String?
    let allergensTags: [String]?
    let ingredientsTextFr: String?
    let price: Double?

    enum CodingKeys: String, CodingKey {
        case mongoId = "_id"
        case code
        case productName
        case brands
        case categories
        case nutriscoreGrade
        case imageFrontUrl
        case quantity
        case allergensTags
        case ingredientsTextFr
        case price
    }

    var id: String { mongoId ?? code ?? UUID().uuidString }

    var name: String {
        productName ?? "Produit inconnu"
    }

    var category: String {
        categories?
            .components(separatedBy: ",")
            .first?
            .trimmingCharacters(in: .whitespaces) ?? "Autre"
    }

    var imageURL: URL? {
        guard let urlString = imageFrontUrl else { return nil }
        return URL(string: urlString)
    }

    var allCategories: [String] {
        categories?
            .components(separatedBy: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty } ?? []
    }

    var cleanAllergens: [String] {
        allergensTags?
            .map { $0.replacingOccurrences(of: "en:", with: "") }
            .map { $0.capitalized } ?? []
    }

    static func == (lhs: Product, rhs: Product) -> Bool {
        lhs.id == rhs.id
    }
}
