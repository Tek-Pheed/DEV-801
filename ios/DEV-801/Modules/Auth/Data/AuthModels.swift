//
//  AuthModels.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

struct LoginRequest: Encodable {
    let email: String
    let password: String
}

struct RegisterRequest: Encodable {
    let firstname: String
    let lastname: String
    let email: String
    let password: String
}

struct LoginResponse: Decodable {
    let token: String
}
