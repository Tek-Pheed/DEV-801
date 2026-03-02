//
//  ProductRepository.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

final class ProductRepository {
    private let client = APIClient.shared

    func fetchProducts() async throws -> [Product] {
        try await client.request(ProductEndpoint.getAll)
    }

    func fetchProduct(id: String) async throws -> Product {
        let products: [Product] = try await client.request(ProductEndpoint.getById(id))
        guard let product = products.first else {
            throw APIError.invalidResponse
        }
        return product
    }

    func fetchProductByCode(code: String) async throws -> Product {
        try await client.request(ProductEndpoint.getByCode(code))
    }
}
