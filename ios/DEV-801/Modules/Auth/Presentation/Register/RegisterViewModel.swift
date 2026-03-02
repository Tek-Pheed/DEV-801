//
//  RegisterViewModel.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 02/02/2026.
//

import SwiftUI
import Combine
import Foundation

@MainActor
final class RegisterViewModel : ObservableObject {
    @Published var firstname = ""
    @Published var lastname = ""
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var isLoading = false
    @Published var isRegistered = false
    @Published var errorMessage: String?

    private let authRepository: AuthRepository

    init(authRepository: AuthRepository = AuthRepository()) {
        self.authRepository = authRepository
    }

    func register() async {
        isLoading = true
        errorMessage = nil

        guard password == confirmPassword, password.count > 0 else {
            errorMessage = "Les mots de passe ne correspondent pas."
            isLoading = false
            return
        }

        do {
            try await authRepository.register(
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password
            )
            isRegistered = true
        } catch {
            errorMessage = "Erreur: \(error.localizedDescription)"
        }

        isLoading = false
    }
}
