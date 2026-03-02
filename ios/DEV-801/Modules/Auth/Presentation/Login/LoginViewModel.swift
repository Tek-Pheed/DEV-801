//
//  LoginViewModel.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 02/02/2026.
//

import SwiftUI
import Combine
import Foundation

@MainActor
final class LoginViewModel : ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var isAuthenticated = false
    @Published var errorMessage: String?

    private let authRepository: AuthRepository

    init(authRepository: AuthRepository = AuthRepository()) {
        self.authRepository = authRepository
        self.isAuthenticated = TokenStorage.shared.isAuthenticated
    }

    func login() async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await authRepository.login(email: email, password: password)
            TokenStorage.shared.save(token: response.token)
            isAuthenticated = true
            print("Login !")
        } catch {
            errorMessage = "Erreur: \(error.localizedDescription)"
            print(errorMessage)
        }

        isLoading = false
    }
}
