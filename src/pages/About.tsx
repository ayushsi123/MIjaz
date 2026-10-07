import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Compass, ShieldCheck, Mail, Send, CheckCircle2 } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function About() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) return;
    setSubmitted(true);
    setContactName("");
    setContactEmail("");
    setContactMsg("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Banner Section */}
        <section className="text-center py-10 mb-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3">Est. 2018</p>
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-wide" style={CINZEL}>
            The Mijaz Story
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            We do not create perfumes to follow trends. We blend them to capture the fleeting, intimate moments of existence.
          </p>
        </section>

        {/* Philosophy Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-square bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs p-8 flex flex-col justify-center">
            <Compass className="text-[#800000] mb-6" size={40} />
            <h2 className="text-2xl text-gray-900 mb-4 font-normal" style={CINZEL}>Obsessive Ingredient Sourcing</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              We travel to remote corners of the globe to source raw botanicals. From wild-harvested agarwood (Assam Oud) in northeastern India to organic rose Otto in Bulgaria, our ingredients are 100% traceably and ethically obtained.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Each extract is verified for purity and oil concentration load before entering our maceration tanks, ensuring a scent that stays true on your skin.
            </p>
          </div>
          
          <div className="aspect-square bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs p-8 flex flex-col justify-center">
            <Heart className="text-[#800000] mb-6" size={40} />
            <h2 className="text-2xl text-gray-900 mb-4 font-normal" style={CINZEL}>Hand-Poured Artisan Craftsmanship</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              All Mijaz fragrances and concentrated roll-on oils are matured and hand-poured in micro-batches under temperature-controlled cellars. We do not rush the process; some of our oud macerations rest for over six months to achieve deep scent complexity.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              This deliberate slowness enables our signature 10+ hour longevity and rich projection dry-downs.
            </p>
          </div>
        </section>

        {/* Corporate Policies */}
        <section className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xs mb-20">
          <h2 className="text-2xl text-gray-900 font-normal mb-8 text-center" style={CINZEL}>Policies & Guarantees</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#800000]">Pan-India Shipping</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We offer free standard shipping on all orders nationwide. Deliveries to major metros average 3-4 working days, and 5-6 days for other regions. Tracking links are generated automatically.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#800000]">Returns & Exchanges</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fragrance is highly personal. If a scent isn't to your liking, we offer hassle-free exchanges or returns within 7 days of delivery, provided the bottle is unopened. Contact support below.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#800000]">Wax-Seal Authenticity</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                All bottles feature batch numbers and are packaged inside embossed caskets with wax-seal validation, certifying pure extracts direct from our cellars.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Contact Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl text-gray-900 font-normal" style={CINZEL}>Connect With Our Cellar</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Have questions regarding custom gifting combos, bulk order corporate rates, or looking for personal scent profile advice? Reach out directly and one of our master blenders will contact you.
            </p>
            <div className="space-y-2 text-xs text-gray-600 font-medium">
              <p className="flex items-center gap-2"><Mail size={13} className="text-[#800000]" /> cellar@mijaz.com</p>
              <p className="flex items-center gap-2"><Send size={13} className="text-[#800000]" /> Master Blender Desk, Sector 5, Bengaluru</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700" style={CINZEL}>Inquiry Form</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Message Detail</label>
              <textarea
                required
                rows={5}
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000] resize-none"
                placeholder="How can we assist you with your fragrance search?"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#800000] text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                Send Inquiry
              </button>
              {submitted && (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Message sent successfully!
                </span>
              )}
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
