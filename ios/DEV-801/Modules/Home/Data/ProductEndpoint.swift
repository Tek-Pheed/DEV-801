//
//  ProductEndpoint.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

enum ProductEndpoint: APIEndpoint {
    case getAll
    case getById(String)
    case getByCode(String)

    var path: String {
        switch self {
        case .getAll:
            return "/products/"
        case .getById(let productId):
            return "/products/\(productId)"
        case .getByCode(let code):
            return "/products/code/\(code)"
        }
    }

    var method: HTTPMethod {
        .GET
    }

    var headers: [String: String] {
        var h = ["Content-Type": "application/json"]
        if let token = TokenStorage.shared.getToken() {
            h["Authorization"] = "Bearer \(token)"
        }
        return h
    }
}
