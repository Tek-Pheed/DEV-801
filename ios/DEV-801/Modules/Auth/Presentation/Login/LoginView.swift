//
//  LoginView.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 02/02/2026.
//

import SwiftUI

struct LoginView: View {
    @StateObject var viewModel: LoginViewModel = .init()
    
    var body: some View {
        VStack() {
            TextField("Email", text: $viewModel.email)
            SecureField("Password", text: $viewModel.password)
            
            Button {
                Task {
                    await viewModel.login()
                }
            } label: {
                Text("Se connecter")
            }

        }
    }
}
