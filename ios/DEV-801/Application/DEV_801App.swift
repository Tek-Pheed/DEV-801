//
//  DEV_801App.swift
//  DEV-801
//
//  Created by Anastasia Bouby on 02/02/2026.
//

import SwiftUI

@main
struct DEV_801App: App {
    @StateObject private var loginViewModel = LoginViewModel()

    var body: some Scene {
        WindowGroup {
            if loginViewModel.isAuthenticated {
                MainTabView()
            } else {
                LoginView(viewModel: loginViewModel)
            }
        }
    }
}
