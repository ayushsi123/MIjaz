import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp, Search, HelpCircle, ShieldAlert, Sparkles, Truck, CreditCard } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

interface FAQItem {
  q: string;
  a: string;
  category: "Returns & Exchanges" | "Fragrance & Quality" | "Shipping & Orders" | "Payments & COD";
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "Returns & Exchanges",
    q: "Can I return or exchange a perfume if I do not like the scent?",
    a: "No. Due to personal hygiene, health regulations, and the intimate nature of artisanal cosmetics, Mijaz maintains a strict NO RETURN, NO EXCHANGE, and NO REFUND policy once an order is delivered. Scent preferences are deeply personal and react differently to individual skin chemistries; therefore, subjective dislike does not qualify for return or exchange."
  },
  {
    category: "Returns & Exchanges",
    q: "What should I do if my package arrives broken or damaged?",
    a: "If your flacon arrives damaged in transit or has a mechanical spray pump defect, we will gladly send a free replacement. You must record an unedited unboxing video starting from the sealed outer courier package and share it with us via WhatsApp or email (support@mijaz.in) within 48 hours of delivery."
  },
  {
    category: "Returns & Exchanges",
    q: "Can I cancel my order before it ships?",
    a: "Yes, cancellations are permitted strictly within 2 hours of placing the order before it enters our fulfillment and dispatch cycle. Once an Air Waybill (AWB) is generated and handed to the courier partner, the shipment cannot be recalled or cancelled."
  },
  {
    category: "Fragrance & Quality",
    q: "How long do Mijaz fragrances last on skin and clothes?",
    a: "All our formulations are blended at Extrait de Parfum concentration with a rich 30%+ oil load, aged and macerated for months. On skin, projection averages 8–12+ hours, while on fabric and clothing, the scent easily lingers for 24+ hours."
  },
  {
    category: "Fragrance & Quality",
    q: "Are Mijaz perfumes safe and IFRA certified?",
    a: "Yes, 100%. We source ethically harvested botanical extracts and pure essential oils adhering strictly to global IFRA (International Fragrance Association) safety standards. Our products are free from harmful parabens, cruelty-free, and skin-friendly."
  },
  {
    category: "Fragrance & Quality",
    q: "How should I store my luxury fragrance bottles?",
    a: "Always store your flacons in a cool, shaded environment away from direct sunlight, bathrooms, or high heat fluctuations. Proper storage ensures your perfume matures gracefully and retains its original aromatic potency for years."
  },
  {
    category: "Shipping & Orders",
    q: "How long will my order take to arrive?",
    a: "We process and dispatch all orders within 24–48 hours. Metro cities (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata) typically receive delivery in 2–4 business days. Rest of India takes 4–6 business days."
  },
  {
    category: "Shipping & Orders",
    q: "How can I track my order status?",
    a: "Once dispatched, an automated tracking link with your AWB tracking number will be sent via SMS and email. You can also view your live order status anytime in your Profile under the Orders tab."
  },
  {
    category: "Payments & COD",
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, Cash on Delivery is available across most serviceable pin codes in India. Please note that courier delivery executives cannot allow open-box test sprays prior to collecting payment."
  },
  {
    category: "Payments & COD",
    q: "Which online payment methods do you accept?",
    a: "We accept all major credit/debit cards (Visa, Mastercard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), Net Banking, and popular digital wallets via secure, encrypted Razorpay checkout."
  }
];

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Returns & Exchanges", "Fragrance & Quality", "Shipping & Orders", "Payments & COD"];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600 font-medium">FAQs</span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-2 font-bold">Frequently Asked Questions</p>
          <h1 className="text-3xl md:text-5xl font-normal text-gray-900 mb-4 tracking-wide" style={CINZEL}>
            Everything You Need To Know
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Find quick answers about our artisanal fragrances, shipping schedules, and order policies.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. returns, delivery, lasting)..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-xs shadow-xs focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#800000] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notice Card for Returns Policy */}
        <div className="p-4 bg-[#800000]/5 border border-[#800000]/20 rounded-2xl mb-8 flex items-start gap-3">
          <ShieldAlert size={20} className="text-[#800000] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 leading-relaxed">
            <b>Note on Returns:</b> As luxury fragrances are intimate personal cosmetic goods, <b>all sales are strictly non-returnable upon delivery</b>. For complete details on transit replacement eligibility, review our{" "}
            <Link to="/returns-exchanges" className="text-[#800000] underline font-bold hover:text-black">
              Returns & Exchanges Policy
            </Link>
            .
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 mb-16">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <HelpCircle size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 font-medium">No questions matched your search.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-3 text-xs text-[#800000] font-bold uppercase hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition"
                  >
                    <span className="font-semibold text-gray-900 text-sm md:text-base pr-2">
                      {faq.q}
                    </span>
                    <span className="text-[#800000] shrink-0 p-1 rounded-full bg-[#800000]/5">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-in fade-in-50 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-xs">
          <h3 className="text-xl font-normal text-gray-900 mb-2" style={CINZEL}>Still Have Questions?</h3>
          <p className="text-gray-500 text-xs mb-6 max-w-md mx-auto">
            Our concierge team is always delighted to assist you with scent consultations, order assistance, or custom gifting inquiries.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/contact"
              className="bg-[#800000] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#5a0000] transition"
            >
              Contact Our Concierge
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
