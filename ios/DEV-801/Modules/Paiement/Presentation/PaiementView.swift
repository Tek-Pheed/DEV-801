import SwiftUI
import WebKit

private enum PaymentState {
    case loading
    case paying
    case validating
    case success
    case cancelled
    case error(String)
}

struct PaiementView: View {
    @ObservedObject var cartManager: CartManager
    let paymentMethod: PaymentMethod
    private let repository = PaypalRepository()

    @State private var paymentState: PaymentState = .loading
    @State private var webView = WKWebView()
    @Environment(\.dismiss) private var dismiss

    private var hideBackButton: Bool {
        switch paymentState {
        case .paying, .validating, .success, .cancelled:
            return true
        case .loading, .error:
            return false
        }
    }

    var body: some View {
        Group {
            switch paymentState {
            case .loading:
                loadingView
            case .paying:
                payingView
            case .validating:
                validatingView
            case .success:
                resultView(isSuccess: true)
            case .cancelled:
                resultView(isSuccess: false)
            case .error(let message):
                errorView(message: message)
            }
        }
        .navigationTitle("Paiement")
        .navigationBarBackButtonHidden(hideBackButton)
        .task {
            await startPayment()
        }
    }


    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Préparation du paiement...")
                .font(.system(.body, weight: .medium))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var payingView: some View {
        WebView(webView) { token, orderID, status in
            Task {
                await handleCallback(orderID: orderID, status: status)
            }
        }
    }

    private var validatingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Validation de la commande...")
                .font(.system(.body, weight: .medium))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func resultView(isSuccess: Bool) -> some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: isSuccess ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.system(size: 80))
                .foregroundStyle(isSuccess ? .green : .red)

            Text(isSuccess ? "Commande validée !" : "Commande annulée")
                .font(.system(.title2, weight: .bold))

            Text(
                isSuccess
                    ? "Votre paiement a été effectué avec succès."
                    : "Le paiement a été annulé."
            )
            .font(.system(.body))
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 40)

            Spacer()

            Button {
                if isSuccess {
                    cartManager.clearCart()
                }
                dismiss()
            } label: {
                Text("Retour")
                    .font(.system(.body, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        Color.accentColor,
                        in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                    )
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
    }

    private func errorView(message: String) -> some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 64))
                .foregroundStyle(.orange)

            Text("Erreur")
                .font(.system(.title2, weight: .bold))

            Text(message)
                .font(.system(.body))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Spacer()

            Button {
                dismiss()
            } label: {
                Text("Retour")
                    .font(.system(.body, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        Color.accentColor,
                        in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                    )
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
    }

    private func startPayment() async {
        do {
            let url = try await repository.fetchPaymentUrl(cartManager.getAllProduct(), method: paymentMethod)
            guard let paypalURL = URL(string: url) else {
                paymentState = .error("URL de paiement invalide")
                return
            }
            await MainActor.run {
                webView.load(URLRequest(url: paypalURL))
                paymentState = .paying
            }
        } catch {
            paymentState = .error(error.localizedDescription)
        }
    }

    @MainActor
    private func handleCallback(orderID: String, status: String) async {
        paymentState = .validating
        do {
            try await repository.validateOrder(orderID: orderID, status: status)
            paymentState = status == "Validated" ? .success : .cancelled
        } catch {
            paymentState = .error("Erreur lors de la validation : \(error.localizedDescription)")
        }
    }
}
