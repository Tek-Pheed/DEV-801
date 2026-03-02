import Foundation

final class PaypalRepository {
    private let client = APIClient.shared

    func fetchPaymentUrl(_ order: PaypalOrderModel, method: PaymentMethod) async throws -> String {
        return try await client.request(PaypalEndpoint.getLink(order, method))
    }

    func validateOrder(orderID: String, status: String) async throws {
        try await client.requestVoid(
            OrderEndpoint.validate(
                OrderValidationRequest(status: status, orderID: orderID)
            )
        )
    }
}
