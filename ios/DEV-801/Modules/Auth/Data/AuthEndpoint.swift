//
//  AuthEndpoint.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

enum AuthEndpoint: APIEndpoint {
    case login(LoginRequest)
    case register(RegisterRequest)

    var path: String {
        switch self {
        case .login:
            return "/auth/login"
        case .register:
            return "/auth/register"
        }
    }

    var method: HTTPMethod {
        .POST
    }

    var body: Encodable? {
        switch self {
        case .login(let request):
            return request
        case .register(let request):
            return request
        }
    }
}
