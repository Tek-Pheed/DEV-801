//
//  PaypalOrderModel.swift
//  DEV-801
//
//  Created by Anastasia Bouby on 02/03/2026.
//

import Foundation

struct ProductRequest: Encodable {
    let name: String
    let quantity: Int
    let price: Double
    let currency: String
    let imageUrl: String
}

struct PaypalOrderModel: Encodable {
    let products: [ProductRequest]
}

struct OrderValidationRequest: Encodable {
    let status: String
    let orderID: String
}
