import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let webView: WKWebView
    var onCallbackDetected: ((_ token: String, _ orderID: String, _ status: String) -> Void)?

    init(
        _ webView: WKWebView = WKWebView(),
        onCallbackDetected: ((_ token: String, _ orderID: String, _ status: String) -> Void)? = nil
    ) {
        self.webView = webView
        self.onCallbackDetected = onCallbackDetected
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(onCallbackDetected: onCallbackDetected)
    }

    func makeUIView(context: Context) -> WKWebView {
        webView.navigationDelegate = context.coordinator
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate {
        var onCallbackDetected: ((_ token: String, _ orderID: String, _ status: String) -> Void)?

        init(onCallbackDetected: ((_ token: String, _ orderID: String, _ status: String) -> Void)?) {
            self.onCallbackDetected = onCallbackDetected
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            if let url = navigationAction.request.url,
               url.absoluteString.contains("payment_callback") {
                let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
                let token = components?.queryItems?.first { $0.name == "token" }?.value ?? ""
                let orderID = components?.queryItems?.first { $0.name == "orderID" }?.value ?? ""
                let status = components?.queryItems?.first { $0.name == "status" }?.value ?? ""

                onCallbackDetected?(token, orderID, status)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }
    }
}
