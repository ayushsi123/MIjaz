import { Link } from "react-router-dom";
import { ChevronRight, ShieldAlert, CheckCircle2, Clock, Video, Mail, Phone } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function ReturnsPolicy() {
  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600 font-medium">Returns & Exchanges</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-2 font-bold">Policy & Customer Care</p>
          <h1 className="text-3xl md:text-5xl font-normal text-gray-900 mb-4 tracking-wide" style={CINZEL}>
            Returns & Exchanges Policy
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Please read our policy carefully before placing your order.
          </p>
        </div>

        {/* Prominent No-Return Alert Banner */}
        <div className="bg-[#800000]/5 border-2 border-[#800000]/20 rounded-2xl p-6 md:p-8 mb-12 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#800000] text-white rounded-xl shrink-0 mt-0.5">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#800000] mb-2" style={CINZEL}>
                Important: Strict No Return & No Refund Policy
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                Due to personal hygiene, safety regulations, and the delicate nature of luxury artisanal fragrances, <b>all purchases of perfumes and concentrated oils made on Mijaz are final</b>. Once an order is delivered, <b>we strictly DO NOT accept returns, exchanges, or refunds</b> based on personal scent preference or change of mind.
              </p>
              <p className="text-xs text-gray-500 italic">
                This policy ensures that every customer receives 100% genuine, factory-sealed, and untampered products directly from our atelier.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Detail Sections */}
        <div className="space-y-8 bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xs mb-12">
          
          {/* Section 1 */}
          <section className="border-b border-gray-100 pb-8">
            <h3 className="text-xl text-gray-900 font-semibold mb-3" style={CINZEL}>
              1. Why Are Fragrances Non-Returnable?
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Perfumes and botanical oils are classified as personal cosmetic goods under strict health and safety guidelines. Once a sealed package leaves our facility and is opened:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>It cannot be resold or re-bottled to another customer under any circumstances.</li>
              <li>Fragrance notes evolve uniquely on each individual depending on skin chemistry, pH balance, climate, and body temperature. Scent perception is highly subjective and does not constitute a product defect.</li>
              <li>We maintain strict quality control to guarantee absolute purity and longevity for every client.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="border-b border-gray-100 pb-8">
            <h3 className="text-xl text-gray-900 font-semibold mb-3" style={CINZEL}>
              2. Damaged in Transit or Defective Sprayer
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              While we pack our glass flacons with multi-layered shock-absorbing protective foam, rare transit mishaps can occur. If your bottle arrives broken or with a mechanical sprayer defect:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <Video className="text-[#800000] mb-2" size={20} />
                <h4 className="font-bold text-xs uppercase text-gray-800 mb-1">Step 1: Unboxing Video</h4>
                <p className="text-xs text-gray-500">
                  You <b>must record a continuous, unedited unboxing video</b> starting from the sealed outer courier parcel.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <Clock className="text-[#800000] mb-2" size={20} />
                <h4 className="font-bold text-xs uppercase text-gray-800 mb-1">Step 2: Notify Within 48 Hours</h4>
                <p className="text-xs text-gray-500">
                  Notify our support team within <b>48 hours</b> of delivery along with your Order ID and the unboxing video.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <CheckCircle2 className="text-[#800000] mb-2" size={20} />
                <h4 className="font-bold text-xs uppercase text-gray-800 mb-1">Step 3: Free Replacement</h4>
                <p className="text-xs text-gray-500">
                  Once verified, we will ship a brand-new replacement bottle to you at zero additional cost.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">
              * Claims reported after 48 hours of delivery or claims without an unboxing video cannot be entertained.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-b border-gray-100 pb-8">
            <h3 className="text-xl text-gray-900 font-semibold mb-3" style={CINZEL}>
              3. Order Cancellation Policy
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Orders can only be cancelled <b>within 2 hours of placement</b> or before dispatch (whichever is earlier).
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Once an order has been packed, assigned an Air Waybill (AWB), and handed over to our courier partner (BlueDart / Delhivery), cancellation is not possible and shipments cannot be recalled.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-xl text-gray-900 font-semibold mb-3" style={CINZEL}>
              4. Incorrect Address or Failed Deliveries
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please ensure your delivery address and phone number are accurate at checkout. In the event of repeated customer unavailability, incorrect delivery address, or refusal of Cash on Delivery parcels, the customer will be liable for re-dispatch shipping charges.
            </p>
          </section>
        </div>

        {/* Customer Support CTA */}
        <div className="bg-[#FAF8F4] border border-gray-200 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-normal text-gray-900 mb-2" style={CINZEL}>Need Help With An Existing Order?</h3>
          <p className="text-gray-500 text-xs mb-6 max-w-md mx-auto">
            Our concierge team is available Mon–Sat (10:00 AM – 7:00 PM IST) to assist with any questions or claims.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="bg-[#800000] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#5a0000] transition flex items-center gap-2"
            >
              <Mail size={16} /> Contact Support
            </Link>
            <a
              href="https://wa.me/919999999999?text=Hello%20Mijaz%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20order"
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1ebc59] transition flex items-center gap-2 shadow-sm"
            >
              <Phone size={16} /> Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
