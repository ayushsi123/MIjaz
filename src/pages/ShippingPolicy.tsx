import { Link } from "react-router-dom";
import { ChevronRight, Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function ShippingPolicy() {
  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600 font-medium">Shipping Policy</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-2 font-bold">Fast & Insured Delivery</p>
          <h1 className="text-3xl md:text-5xl font-normal text-gray-900 mb-4 tracking-wide" style={CINZEL}>
            Shipping & Delivery Policy
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Delivering artisanal luxury fragrances with utmost care, tamper-proof packaging, and express couriers across India.
          </p>
        </div>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#800000]/10 flex items-center justify-center text-[#800000] shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Free Shipping</h3>
              <p className="text-xs text-gray-500">On all prepaid orders & orders above ₹999 across India.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#800000]/10 flex items-center justify-center text-[#800000] shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">24-48 Hours Dispatch</h3>
              <p className="text-xs text-gray-500">Hand-checked and dispatched quickly from our atelier.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#800000]/10 flex items-center justify-center text-[#800000] shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Tamper-Proof Box</h3>
              <p className="text-xs text-gray-500">Multi-layer shock-resistant luxury packaging.</p>
            </div>
          </div>
        </div>

        {/* Detailed Shipping Info */}
        <div className="space-y-8 bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xs mb-12">
          
          {/* Section 1 */}
          <section className="border-b border-gray-100 pb-8">
            <h3 className="text-xl text-gray-900 font-semibold mb-3 flex items-center gap-2" style={CINZEL}>
              <MapPin size={20} className="text-[#800000]" />
              Estimated Delivery Timelines
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              All orders are packed and dispatched from our primary facility in New Delhi. Depending on your geographical location, estimated transit times are as follows:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800000] block mb-1">Metro Cities</span>
                <p className="text-lg font-bold text-gray-900 mb-1">2 – 4 Days</p>
                <p className="text-xs text-gray-500">Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800000] block mb-1">Tier 2 & 3 Cities</span>
                <p className="text-lg font-bold text-gray-900 mb-1">4 – 6 Days</p>
                <p className="text-xs text-gray-500">State capitals and major regional distribution hubs</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800000] block mb-1">Remote & North-East</span>
                <p className="text-lg font-bold text-gray-900 mb-1">5 – 8 Days</p>
                <p className="text-xs text-gray-500">Jammu & Kashmir, Assam, North-Eastern states, island regions</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="border-b border-gray-100 pb-8">
            <h3 className="text-xl text-gray-900 font-semibold mb-3 flex items-center gap-2" style={CINZEL}>
              <PackageCheck size={20} className="text-[#800000]" />
              Courier Partners & Order Tracking
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We partner exclusively with top-tier courier networks including <b>BlueDart, Delhivery, Express Air, and DTDC</b> to ensure reliable and swift delivery.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Once your shipment is handed over to the courier, an automated message with your live tracking number (AWB) is dispatched to your registered phone number and email address. You can track your parcel in real-time at any hour.
            </p>
            <div className="mt-4">
              <Link to="/profile?tab=orders" className="text-[#800000] font-bold text-xs uppercase tracking-wider hover:underline flex items-center gap-1">
                Click here to track your existing order →
              </Link>
            </div>
          </section>

          {/* Section 3 */}
          <section className="border-b border-gray-100 pb-8">
            <h3 className="text-xl text-gray-900 font-semibold mb-3" style={CINZEL}>
              Cash on Delivery (COD) Terms
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We offer Cash on Delivery (COD) across serviceable postal codes in India.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Courier delivery agents are not authorized to allow open-box delivery or test sprays prior to receiving the payment amount.</li>
              <li>Please keep exact cash or UPI payment ready when the delivery executive arrives.</li>
              <li>Unjustified refusal of Cash on Delivery shipments at the doorstep may result in restrictions on future COD ordering for that customer account.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <b>Delivery & Return Notice:</b> As stated in our{" "}
                <Link to="/returns-exchanges" className="underline font-bold hover:text-black">
                  Returns & Exchanges Policy
                </Link>
                , all perfume sales are final upon delivery. Fragrances cannot be returned after delivery due to hygiene and safety standards. Please inspect outer parcel condition and record an unboxing video when receiving your package.
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
