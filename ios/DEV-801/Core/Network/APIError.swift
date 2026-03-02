//
//  APIError.swift
//  DEV-801
//
//  Created by Alexandre Ricard on 28/02/2026.
//

import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int, data: Data?)
    case decodingError(Error)
    case networkError(Error)
    case unauthorized
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide."
        case .invalidResponse:
            return "Réponse invalide du serveur."
        case .httpError(let statusCode, _):
            return "Erreur HTTP \(statusCode)."
        case .decodingError:
            return "Erreur de décodage des données."
        case .networkError(let error):
            return error.localizedDescription
        case .unauthorized:
            return "Non autorisé. Veuillez vous reconnecter."
        case .unknown:
            return "Une erreur inconnue est survenue."
        }
    }
}
