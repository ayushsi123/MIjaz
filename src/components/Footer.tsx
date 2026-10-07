import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import brandLogo from "../imports/logo.png";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;
const CORMORANT = { fontFamily: "'Cormorant Upright', serif" } as const;

export function Footer() {

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-10">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12" style={SANS}>
          {/* Column 1: Brand Info */}
          <div>
            <div className="mb-5 flex items-center">
              <img src={brandLogo} alt="Mijaz Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Artisanal luxury fragrances and oils. Crafted for those who wear their story as a scent.
            </p>
            <div className="flex gap-3 mb-6">
              {[
                { Icon: Instagram, link: "https://instagram.com" },
                { Icon: Facebook, link: "https://facebook.com" },
                { Icon: Twitter, link: "https://twitter.com" }
              ].map(({ Icon, link }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8.5 h-8.5 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
            <img
              src="https://images.unsplash.com/photo-1627634777217-c864268db30c?w=200&h=30&fit=crop&auto=format&q=50"
              alt="Supported payments"
              className="h-5.5 opacity-40 rounded-xs"
            />
          </div>

          {/* Column 2: Collections links */}
          <div>
            <h4 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.25em] mb-5 font-bold" style={CINZEL}>Collections</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-400">
              {[
                ["Perfumes", "/shop?category=Perfumes"],
                ["Perfume Oils", "/shop?category=Oils"]
              ].map(([label, path]) => (
                <Link key={label} to={path} className="hover:text-white transition-colors text-left">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: More links */}
          <div>
            <h4 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.25em] mb-5 font-bold" style={CINZEL}>More</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-400">
              {[
                ["Men's Collection", "/shop?gender=Men"],
                ["Women's Collection", "/shop?gender=Women"],
                ["Unisex Fragrances", "/shop?gender=Unisex"],
                ["New Arrivals", "/shop?filter=New Arrivals"],
                ["Best Sellers", "/shop?filter=Best Sellers"],
                ["Seasonal Picks", "/shop"]
              ].map(([label, path]) => (
                <Link key={label} to={path} className="hover:text-white transition-colors text-left">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Support & Newsletter */}
          <div>
            <h4 className="text-[#D4AF37] text-[10px] uppercase tracking-[0.25em] mb-5 font-bold" style={CINZEL}>Support</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-400 mb-6">
              {[
                ["Track My Order", "/profile?tab=orders"],
                ["Returns & Exchanges", "/about"],
                ["Shipping Policy", "/about"],
                ["Contact Us", "/about"],
                ["FAQs", "/about"]
              ].map(([label, path]) => (
                <Link key={label} to={path} className="hover:text-white transition-colors text-left">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="border-t border-white/5 pt-6 text-center text-gray-500 text-xs" style={SANS}>
          © 2026 Mijaz Luxury Fragrances. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
