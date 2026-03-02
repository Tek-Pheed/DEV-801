import Foundation

enum OrderEndpoint: APIEndpoint {
    case getAll
    case validate(OrderValidationRequest)

    var path: String {
        switch self {
        case .getAll:
            return "/orders/"
        case .validate:
            return "/orders/validate"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getAll:
            return .GET
        case .validate:
            return .POST
        }
    }

    var headers: [String: String] {
        var h = ["Content-Type": "application/json"]
        if let token = TokenStorage.shared.getToken() {
            h["Authorization"] = "Bearer \(token)"
        }
        return h
    }

    var body: Encodable? {
        switch self {
        case .getAll:
            return nil
        case .validate(let request):
            return request
        }
    }
}
