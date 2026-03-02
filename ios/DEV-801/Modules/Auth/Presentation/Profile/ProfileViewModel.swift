//
//  ProfileViewModel.swift
//  DEV-801
//
//  Created by Anastasia Bouby on 02/03/2026.
//

import Foundation
import Combine
struct UserProfile: Decodable, Equatable {
    let email: String
    let firstName: String
    let lastName: String
    let creationDate: Date
}

private struct ProfileResponse: Decodable {
    let result: Result

    struct Result: Decodable {
        let email: String
        let firstName: String
        let lastName: String
        let creationDate: String
    }
}

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var profile: UserProfile?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private var authToken: String? {
        return TokenStorage.shared.getToken()
    }

    private let baseURL = URL(string: "http://localhost:8080")!

    func fetchProfile() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            var request = URLRequest(url: baseURL.appendingPathComponent("/api/auth/profile"))
            request.httpMethod = "GET"
            request.setValue("application/json", forHTTPHeaderField: "Accept")

            if let token = authToken, !token.isEmpty {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }

            let (data, response) = try await URLSession.shared.data(for: request)

            guard let http = response as? HTTPURLResponse else {
                throw URLError(.badServerResponse)
            }
            guard (200..<300).contains(http.statusCode) else {
                if http.statusCode == 401 {
                    throw NSError(domain: "Profile", code: 401, userInfo: [NSLocalizedDescriptionKey: "Non autorisé. Veuillez vous reconnecter."])
                }
                throw NSError(domain: "Profile", code: http.statusCode, userInfo: [NSLocalizedDescriptionKey: "Erreur serveur (\(http.statusCode))."])
            }

            let decoder = JSONDecoder()
            let raw = try decoder.decode(ProfileResponse.self, from: data)

            let iso = ISO8601DateFormatter()
            iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            let date = iso.date(from: raw.result.creationDate) ?? ISO8601DateFormatter().date(from: raw.result.creationDate) ?? Date()

            self.profile = UserProfile(
                email: raw.result.email,
                firstName: raw.result.firstName,
                lastName: raw.result.lastName,
                creationDate: date
            )
        } catch {
            self.errorMessage = (error as NSError).localizedDescription
        }
    }
}

