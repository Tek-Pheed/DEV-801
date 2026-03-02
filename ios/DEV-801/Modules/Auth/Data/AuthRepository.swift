//
//  AuthRepository.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

final class AuthRepository {
    private let client: APIClient

    init(client: APIClient = .shared) {
        self.client = client
    }

    func login(email: String, password: String) async throws -> LoginResponse {
        let request = LoginRequest(email: email, password: password)
        return try await client.request(AuthEndpoint.login(request))
    }

    func register(firstname: String, lastname: String, email: String, password: String) async throws {
        let request = RegisterRequest(
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password
        )
        try await client.requestVoid(AuthEndpoint.register(request))
    }
}
