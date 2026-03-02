//
//  LoginView.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 02/02/2026.
//

import SwiftUI

struct LoginView: View {
    @ObservedObject var viewModel: LoginViewModel
    
    var body: some View {
        NavigationStack() {
            VStack() {
                
                VStack(alignment: .leading) {
                    Text("Email")
                        .foregroundColor(.secondary)
                    
                    HStack() {
                        Image(systemName: "envelope")
                        
                        TextField("Email", text: $viewModel.email)
                    }
                    .padding()
                    .glassEffect()
                }
                
                VStack(alignment: .leading) {
                    Text("Password")
                        .foregroundColor(.secondary)
                    
                    HStack() {
                        Image(systemName: "key")
                            .rotationEffect(.degrees(45))
                        
                        SecureField("Password", text: $viewModel.password)
                    }
                    .padding()
                    .glassEffect()
                }
                .padding(.vertical)
                
                Button {
                    Task {
                        await viewModel.login()
                    }
                } label: {
                    Text("Sign in")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.glassProminent)

                Spacer()
                
                HStack() {
                    Text("Don't have an account ?")
                    NavigationLink("Sign up", destination: RegisterView())
                }
                

            }
            .padding()
            .navigationTitle("Sign in")
        }
    }
}

#Preview {
    LoginView(viewModel: LoginViewModel())
}
