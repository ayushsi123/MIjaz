import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { X, Truck } from "lucide-react";
import { useCart } from "../hooks/useCart";



// Components
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";

// Pages
import { Home } from "../pages/Home";
import { Products } from "../pages/Products";
import { ProductDetail } from "../pages/ProductDetail";
import { Gifting } from "../pages/Gifting";
import { Combos } from "../pages/Combos";
import { ComboDetail } from "../pages/ComboDetail";
import { Cart } from "../pages/Cart";
import { Checkout } from "../pages/Checkout";
import { Profile } from "../pages/Profile";
import { About } from "../pages/About";
import { PaymentFailed } from "../pages/PaymentFailed";
import { NotFound } from "../pages/NotFound";
import { AdminLogin } from "../pages/AdminLogin";
import { Admin } from "../pages/Admin";

// Font Styles
const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;

export default function App() {
  const {
    trackModalOpen,
    setTrackModalOpen,
    trackingOrder,
    setTrackingOrder,
    setProducts
  } = useCart();

  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    const fetchFirebaseProducts = async () => {
      try {
        const { getDocs, collection } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        const querySnapshot = await getDocs(collection(db, "products"));
        
        if (!querySnapshot.empty) {
          const liveProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any;
          setProducts(liveProducts);
        } else {
          // If Firestore is empty, load hardcoded products into Zustand
          const { INITIAL_PRODUCTS } = await import("../data/products");
          setProducts(INITIAL_PRODUCTS);
        }
        setProductsLoaded(true);
      } catch (err) {
        console.error("Firebase product sync failed, using static fallbacks:", err);
        const { INITIAL_PRODUCTS } = await import("../data/products");
        setProducts(INITIAL_PRODUCTS);
        setProductsLoaded(true);
      }
    };
    fetchFirebaseProducts();
  }, []);

  const handleCloseTrackModal = () => {
    setTrackingOrder(null);
    setTrackModalOpen(false);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white flex flex-col justify-between" style={SANS}>
        <Navbar />
        
        {/* Main Content Area */}
        <main className="pt-[100px] flex-grow">
          {!productsLoaded ? (
            <div className="flex justify-center items-center h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/gifting" element={<Gifting />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/combo/:id" element={<ComboDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </main>
        <Footer />

        {/* Global Track Order Modal */}
        {trackModalOpen && trackingOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-gray-900" style={SANS}>
                  Track Order #{trackingOrder.id}
                </h3>
                <button onClick={handleCloseTrackModal} className="cursor-pointer text-gray-400 hover:text-gray-600">
                  <X size={17} />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="mb-6">
                <div className="flex justify-between text-[9px] text-gray-400 mb-2.5 uppercase tracking-wider font-semibold">
                  <span className={trackingOrder.status === "Placed" ? "text-[#800000] font-bold" : ""}>Placed</span>
                  <span className={trackingOrder.status === "Packed" ? "text-[#800000] font-bold" : ""}>Packed</span>
                  <span className={trackingOrder.status === "Shipped" || trackingOrder.status === "In Transit" ? "text-[#800000] font-bold" : ""}>Shipped</span>
                  <span className={trackingOrder.status === "Out" ? "text-[#800000] font-bold" : ""}>Out</span>
                  <span className={trackingOrder.status === "Delivered" ? "text-green-600 font-bold" : ""}>Delivered</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#800000] to-[#D4AF37] rounded-full transition-all duration-500"
                    style={{
                      width:
                        trackingOrder.status === "Placed"
                          ? "15%"
                          : trackingOrder.status === "Packed"
                          ? "40%"
                          : trackingOrder.status === "Shipped" || trackingOrder.status === "In Transit"
                          ? "65%"
                          : trackingOrder.status === "Out"
                          ? "85%"
                          : "100%"
                    }}
                  />
                </div>
              </div>

              {/* Tracking Details */}
              <div className="space-y-3.5 text-xs mb-6 border-b border-gray-100 pb-5" style={SANS}>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`font-semibold ${
                      trackingOrder.status === "Delivered"
                        ? "text-green-600"
                        : trackingOrder.status === "In Transit"
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    {trackingOrder.status}
                  </span>
                </div>
                {trackingOrder.carrier && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carrier</span>
                    <span className="font-semibold text-gray-900">
                      {trackingOrder.carrier} {trackingOrder.trackingNumber ? `· #${trackingOrder.trackingNumber}` : ""}
                    </span>
                  </div>
                )}
                {trackingOrder.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Delivery</span>
                    <span className="font-semibold text-gray-900">{trackingOrder.estimatedDelivery}</span>
                  </div>
                )}
              </div>

              {/* Updates List */}
              {trackingOrder.updates && trackingOrder.updates.length > 0 && (
                <div className="mb-6 max-h-40 overflow-y-auto pr-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3">Activity Log</p>
                  <div className="relative border-l border-gray-100 pl-4 space-y-4">
                    {trackingOrder.updates.map((up, idx) => (
                      <div key={idx} className="relative text-xs">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border ${
                            idx === 0
                              ? "bg-[#D4AF37] border-[#D4AF37]"
                              : "bg-white border-gray-200"
                          }`}
                        />
                        <p className={`font-semibold ${idx === 0 ? "text-gray-900" : "text-gray-500"}`}>{up.status}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{up.location} · {up.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCloseTrackModal}
                className="w-full bg-[#D4AF37] text-black py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#800000] hover:text-white transition-colors cursor-pointer"
                style={SANS}
              >
                Close Tracking
              </button>
            </div>
          </div>
        )}

        <Toaster position="bottom-right" richColors />
      </div>
    </Router>
  );
}
