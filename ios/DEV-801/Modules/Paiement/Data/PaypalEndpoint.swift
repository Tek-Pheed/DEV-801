//
//  PaypalEndpoint.swift
//  DEV-801
//
//  Created by Anastasia Bouby on 02/03/2026.
//

import Foundation

enum PaymentMethod: String {
    case paypal
    case stripe
}

enum PaypalEndpoint: APIEndpoint {
    case getLink(PaypalOrderModel, PaymentMethod)

    var path: String {
        switch self {
        case .getLink(_, let method):
            return "/\(method.rawValue)/pay"
        }
    }

    var method: HTTPMethod {
        .POST
    }

    var headers: [String: String] {
        var h = ["Content-Type": "application/json"]
        if let token = TokenStorage.shared.getToken() {
            h["Authorization"] = "Bearer \(token)"
        }
        return h
    }
    
    var body: Encodable? {
        switch self {
        case .getLink(let request, _):
            return request
        }
    }
}
