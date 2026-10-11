import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Thank you! Your message has been received. Our team will contact you within 24 hours.");
      setName("");
      setEmail("");
      setPhone("");
      setOrderId("");
      setMessage("");
    }, 800);
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600 font-medium">Contact Us</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-2 font-bold">Concierge & Customer Care</p>
          <h1 className="text-3xl md:text-5xl font-normal text-gray-900 mb-4 tracking-wide" style={CINZEL}>
            Get In Touch
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Have a question regarding your order, seeking a personalized fragrance recommendation, or planning custom wedding favors? We are here to assist.
          </p>
        </div>

        {/* Two-Column Grid: Contact Channels + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          
          {/* Left Column: Direct Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* WhatsApp Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:border-[#25D366]/40 transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#25D366] block mb-1">Fastest Response</span>
                  <h3 className="font-bold text-gray-900 text-base mb-1" style={CINZEL}>WhatsApp Concierge</h3>
                  <p className="text-xs text-gray-500 mb-3">Chat with our scent specialists for immediate assistance.</p>
                  <a
                    href="https://wa.me/919999999999?text=Hello%20Mijaz%20Luxury,%20I%20would%20like%20to%20inquire%20about"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
                  >
                    Open WhatsApp Chat →
                  </a>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#800000]/10 flex items-center justify-center text-[#800000] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#800000] block mb-1">Email Support</span>
                  <h3 className="font-bold text-gray-900 text-base mb-1" style={CINZEL}>support@mijaz.in</h3>
                  <p className="text-xs text-gray-500 mb-2">We typically reply within 12–24 business hours.</p>
                  <a href="mailto:support@mijaz.in" className="text-xs font-bold text-[#800000] hover:underline">
                    Send an email →
                  </a>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#997d1e] shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Working Hours</h3>
                  <p className="text-xs text-gray-600 font-medium">Monday to Saturday</p>
                  <p className="text-xs text-gray-500">10:00 AM – 7:00 PM IST</p>
                  <p className="text-[11px] text-gray-400 mt-1">Closed on Sundays & National Holidays</p>
                </div>
              </div>
            </div>

            {/* Studio Address Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Atelier & Studio</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Mijaz Luxury Artisanal Perfumes<br />
                    New Delhi – 110001, India
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xs">
            <h2 className="text-2xl text-gray-900 font-normal mb-2" style={CINZEL}>Send Us A Message</h2>
            <p className="text-xs text-gray-500 mb-6">Fill in the form below and our team will get back to you shortly.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full border border-gray-200 p-3 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border border-gray-200 p-3 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-200 p-3 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Order ID <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. MJZ-2026-27/045"
                    className="w-full border border-gray-200 p-3 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Subject / Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:border-[#800000] outline-hidden transition"
                >
                  <option value="General Inquiry">General Scent Inquiry</option>
                  <option value="Order Tracking">Order Status / Tracking</option>
                  <option value="Damaged Shipment">Damaged Shipment / Replacement</option>
                  <option value="Bulk Wedding / Corporate Gifting">Bulk Wedding / Corporate Gifting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our concierge assist you today?"
                  className="w-full border border-gray-200 p-3 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden transition resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#800000] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#5a0000] transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:bg-gray-400"
              >
                {submitting ? "Sending..." : (
                  <>
                    <Send size={15} /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Quick FAQ Link Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-xs">
          <p className="text-xs text-gray-600 mb-2">
            Looking for quick answers about shipping timelines or our <b>strict no-return policy</b>?
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-wider text-[#800000]">
            <Link to="/faqs" className="hover:underline">Visit FAQs Page →</Link>
            <span>·</span>
            <Link to="/returns-exchanges" className="hover:underline">Returns & Exchanges Policy →</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
