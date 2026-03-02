//
//  ProfileView.swift
//  DEV-801
//
//  Created by Anastasia Bouby on 02/03/2026.
//

import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.profile == nil {
                    ProgressView("Chargement du profil...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = viewModel.errorMessage, viewModel.profile == nil {
                    ContentUnavailableView {
                        Label("Erreur", systemImage: "exclamationmark.triangle")
                    } description: {
                        Text(error)
                    } actions: {
                        Button("Réessayer") {
                            Task { await viewModel.fetchProfile() }
                        }
                    }
                } else if let profile = viewModel.profile {
                    ScrollView {
                        VStack(spacing: 16) {
                            headerSection(profile)
                            infoCard(profile)
                        }
                        .padding(20)
                    }
                    .background(Color(.systemGroupedBackground))
                }
                else {
                    Text("Aucune donnée")
                }
            }
            .navigationTitle("Profil")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await viewModel.fetchProfile()
            }
        }
    }

    private func headerSection(_ profile: UserProfile) -> some View {
        VStack(spacing: 8) {
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(Color.accentColor)

            Text("\(profile.firstName) \(profile.lastName)")
                .font(.system(.title2, weight: .bold))

            Text(profile.email)
                .font(.system(.subheadline))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private func infoCard(_ profile: UserProfile) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Informations")
                .font(.system(.subheadline, weight: .semibold))
                .foregroundStyle(.secondary)

            HStack(spacing: 12) {
                Image(systemName: "envelope.fill")
                    .foregroundStyle(Color.accentColor)
                Text(profile.email)
                    .font(.system(.subheadline))
            }

            Divider()

            HStack(spacing: 12) {
                Image(systemName: "calendar")
                    .foregroundStyle(Color.accentColor)
                Text(
                        profile.creationDate,
                        format: .dateTime
                            .day()
                            .month(.wide)
                            .year()
                            .hour()
                            .minute()
                    )
                    .environment(\.locale, Locale(identifier: "fr_FR"))
                .font(.system(.subheadline))
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
    }

    

    

    private func statusColor(for status: String) -> Color {
        switch status {
        case "Validated": return .green
        case "Pending": return .orange
        case "Canceled": return .red
        default: return .gray
        }
    }
}

#Preview {
    ProfileView()
}
