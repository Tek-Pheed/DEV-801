import SwiftUI
import AVFoundation

struct BarcodeScannerView: View {
    @ObservedObject var cartManager: CartManager
    @State private var scannedCode: String?
    @State private var product: Product?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var torchOn = false
    @State private var addedToCart = false

    private let repository = ProductRepository()

    var body: some View {
        NavigationStack {
            ZStack {
                if let product {
                    productResultView(product)
                } else {
                    scannerView
                }
            }
            .navigationTitle("Scanner")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if product == nil {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            torchOn.toggle()
                        } label: {
                            Image(systemName: torchOn ? "flashlight.on.fill" : "flashlight.off.fill")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundStyle(torchOn ? .yellow : .secondary)
                        }
                    }
                }
            }
        }
    }

    private var scannerView: some View {
        ZStack {
            CameraPreview(onCodeScanned: handleScannedCode, torchOn: $torchOn)
                .ignoresSafeArea()

            VStack {
                Spacer()

                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(.white.opacity(0.6), lineWidth: 2)
                    .frame(width: 280, height: 160)
                    .background(.clear)

                Spacer()

                VStack(spacing: 12) {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                        Text("Recherche du produit...")
                            .font(.system(.subheadline, weight: .medium))
                            .foregroundStyle(.white)
                    } else if let error = errorMessage {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.title2)
                            .foregroundStyle(.orange)
                        Text(error)
                            .font(.system(.subheadline, weight: .medium))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)
                        Button("Scanner à nouveau") {
                            errorMessage = nil
                            scannedCode = nil
                        }
                        .font(.system(.subheadline, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(.white.opacity(0.2), in: Capsule())
                    } else {
                        Image(systemName: "barcode.viewfinder")
                            .font(.title2)
                            .foregroundStyle(.white)
                        Text("Placez le code-barres dans le cadre")
                            .font(.system(.subheadline, weight: .medium))
                            .foregroundStyle(.white)
                    }
                }
                .padding(24)
                .frame(maxWidth: .infinity)
                .background(.ultraThinMaterial.opacity(0.8))
            }
        }
    }

    private func productResultView(_ product: Product) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                AsyncImage(url: product.imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 240)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    case .failure:
                        Image(systemName: "photo")
                            .font(.system(size: 50))
                            .foregroundStyle(.tertiary)
                            .frame(height: 200)
                    default:
                        ProgressView()
                            .frame(height: 200)
                    }
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text(product.name)
                        .font(.system(.title2, weight: .bold))

                    if let brands = product.brands, !brands.isEmpty {
                        Text(brands)
                            .font(.system(.subheadline))
                            .foregroundStyle(.secondary)
                    }

                    if let price = product.price {
                        Text(price, format: .currency(code: "EUR"))
                            .font(.system(.title3, weight: .bold))
                            .foregroundStyle(Color.accentColor)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                if let nutriscore = product.nutriscoreGrade, !nutriscore.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(["a", "b", "c", "d", "e"], id: \.self) { letter in
                            Text(letter.uppercased())
                                .font(.system(.caption2, weight: .bold))
                                .foregroundStyle(letter == nutriscore.lowercased() ? .white : nutriscoreColor(letter).opacity(0.6))
                                .frame(width: 36, height: 36)
                                .background(
                                    letter == nutriscore.lowercased()
                                        ? nutriscoreColor(letter)
                                        : nutriscoreColor(letter).opacity(0.15),
                                    in: RoundedRectangle(cornerRadius: 8)
                                )
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                if let code = product.code {
                    HStack(spacing: 8) {
                        Image(systemName: "barcode")
                            .foregroundStyle(.secondary)
                        Text(code)
                            .font(.system(.caption, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground))
        .safeAreaInset(edge: .bottom) {
            HStack(spacing: 12) {
                Button {
                    self.product = nil
                    scannedCode = nil
                    errorMessage = nil
                    addedToCart = false
                } label: {
                    Image(systemName: "barcode.viewfinder")
                        .font(.system(.body, weight: .semibold))
                        .foregroundStyle(Color.accentColor)
                        .frame(width: 54, height: 54)
                        .background(Color.accentColor.opacity(0.1), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                }

                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                        cartManager.addToCart(product)
                        addedToCart = true
                    }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: addedToCart ? "checkmark" : "cart.badge.plus")
                        Text(addedToCart ? "Ajouté !" : "Ajouter au panier")
                    }
                    .font(.system(.body, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background(
                        addedToCart ? Color.green : Color.accentColor,
                        in: RoundedRectangle(cornerRadius: 16, style: .continuous)
                    )
                }
                .disabled(addedToCart)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial)
        }
    }

    private func handleScannedCode(_ code: String) {
        guard scannedCode == nil, !isLoading else { return }
        scannedCode = code

        Task {
            await fetchProduct(code: code)
        }
    }

    private func fetchProduct(code: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let result = try await repository.fetchProductByCode(code: code)
            product = result
        } catch {
            errorMessage = "Produit introuvable pour le code \(code)"
            scannedCode = nil
        }
        isLoading = false
    }

    private func nutriscoreColor(_ grade: String) -> Color {
        switch grade.lowercased() {
        case "a": return .green
        case "b": return Color(red: 0.5, green: 0.8, blue: 0.2)
        case "c": return .yellow
        case "d": return .orange
        case "e": return .red
        default: return .gray
        }
    }
}

struct CameraPreview: UIViewControllerRepresentable {
    let onCodeScanned: (String) -> Void
    @Binding var torchOn: Bool

    func makeUIViewController(context: Context) -> CameraViewController {
        let controller = CameraViewController()
        controller.onCodeScanned = onCodeScanned
        return controller
    }

    func updateUIViewController(_ uiViewController: CameraViewController, context: Context) {
        uiViewController.setTorch(on: torchOn)
    }
}

final class CameraViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    var onCodeScanned: ((String) -> Void)?

    private let captureSession = AVCaptureSession()
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var hasScanned = false

    override func viewDidLoad() {
        super.viewDidLoad()
        setupCamera()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if !captureSession.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.captureSession.startRunning()
            }
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if captureSession.isRunning {
            captureSession.stopRunning()
        }
    }

    private func setupCamera() {
        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device) else { return }

        if captureSession.canAddInput(input) {
            captureSession.addInput(input)
        }

        let output = AVCaptureMetadataOutput()
        if captureSession.canAddOutput(output) {
            captureSession.addOutput(output)
            output.setMetadataObjectsDelegate(self, queue: .main)
            output.metadataObjectTypes = [
                .ean8,
                .ean13,
                .upce,
                .code128,
                .code39,
                .code93,
                .qr
            ]
        }

        let layer = AVCaptureVideoPreviewLayer(session: captureSession)
        layer.videoGravity = .resizeAspectFill
        layer.frame = view.bounds
        view.layer.addSublayer(layer)
        previewLayer = layer

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }
    }

    func setTorch(on: Bool) {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch else { return }
        try? device.lockForConfiguration()
        device.torchMode = on ? .on : .off
        device.unlockForConfiguration()
    }

    func metadataOutput(
        _ output: AVCaptureMetadataOutput,
        didOutput metadataObjects: [AVMetadataObject],
        from connection: AVCaptureConnection
    ) {
        guard !hasScanned,
              let object = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let code = object.stringValue else { return }

        hasScanned = true
        AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
        onCodeScanned?(code)
    }

    func resetScanner() {
        hasScanned = false
    }
}
