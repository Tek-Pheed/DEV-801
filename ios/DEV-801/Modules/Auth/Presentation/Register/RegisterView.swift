//
//  RegisterView.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 02/02/2026.
//

import SwiftUI

struct RegisterView: View {
    @StateObject var viewModel: RegisterViewModel = .init()
    
    var body: some View {
        ZStack() {
            VStack() {
                
                HStack() {
                    VStack(alignment: .leading) {
                        Text("First Name")
                            .foregroundColor(.secondary)
                        
                        HStack() {
                            Image(systemName: "person")
                            
                            TextField("First name", text: $viewModel.firstname)
                        }
                        .padding()
                        .glassEffect()
                    }
                    
                    VStack(alignment: .leading) {
                        Text("Last name")
                            .foregroundColor(.secondary)
                        
                        HStack() {
                            Image(systemName: "person")
                            
                            TextField("Last name", text: $viewModel.lastname)
                        }
                        .padding()
                        .glassEffect()
                    }
                }
                .padding(.vertical)
                
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
                
                VStack(alignment: .leading) {
                    Text("Confirm password")
                        .foregroundColor(.secondary)
                    
                    HStack() {
                        Image(systemName: "key")
                            .rotationEffect(.degrees(45))
                        
                        SecureField("Confirm Password", text: $viewModel.confirmPassword)
                    }
                    .padding()
                    .glassEffect()
                }
                
                Button {
                    Task {
                        await viewModel.register()
                    }
                } label: {
                    Text("Sign up")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.glassProminent)
                .padding(.vertical)

                Spacer()
                

            }
            
            if ($viewModel.isLoading.wrappedValue) {
                ProgressView()
            }
            
        }
        .padding()
        .navigationTitle("Sign up")
    }
}

#Preview {
    RegisterView()
}
