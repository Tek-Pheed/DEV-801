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
    @Published var errorMessage: String?
    
    
    init() {
        
    }
    
    func login() async {
        isLoading = true
        errorMessage = nil
        
        do {
            // TASK: Ajouter l'appel de la methode pour ce login ici avec un try await
        } catch {
            errorMessage = "Erreur: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
}
