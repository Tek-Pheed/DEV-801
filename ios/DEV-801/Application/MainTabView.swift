import SwiftUI

struct MainTabView: View {
    @StateObject private var cartManager = CartManager()

    var body: some View {
        TabView {
            HomeView(cartManager: cartManager)
                .tabItem {
                    Label("Accueil", systemImage: "house.fill")
                }

            CartTabView(cartManager: cartManager)
                .tabItem {
                    Label("Panier", systemImage: "cart.fill")
                }
                .badge(cartManager.itemCount)

            BarcodeScannerView(cartManager: cartManager)
                .tabItem {
                    Label("Scanner", systemImage: "barcode.viewfinder")
                }

            ProfileView()
                .tabItem {
                    Label("Profil", systemImage: "person.fill")
                }
        }
    }
}

#Preview {
    MainTabView()
}
