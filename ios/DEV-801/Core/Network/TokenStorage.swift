//
//  TokenStorage.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

final class TokenStorage {
    static let shared = TokenStorage()

    private let key = "auth_token"

    private init() {}

    func save(token: String) {
        UserDefaults.standard.set(token, forKey: key)
    }

    func getToken() -> String? {
        UserDefaults.standard.string(forKey: key)
    }

    func clear() {
        UserDefaults.standard.removeObject(forKey: key)
    }

    var isAuthenticated: Bool {
        getToken() != nil
    }
}
