import { useRef, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Package, Wind, Droplet } from "lucide-react";
import { BLENDS, CATEGORIES, NOTES } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import heroBanner from "../imports/hero.png";
import categoryMen from "../imports/category-men.jpg";
import categoryWomen from "../imports/category-women.jpg";
import categoryUnisex from "../imports/category-unisex.jpg";
import categoryPerfumeRange from "../imports/category-perfume-range.jpg";
import categoryOilRange from "../imports/category-oil-range.jpg";

// Typography bindings
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;
const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;

export function Home() {
  const navigate = useNavigate();
  const blendsRef = useRef<HTMLDivElement>(null);
  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, dir: "l" | "r") => {
    ref.current?.scrollBy({ left: dir === "r" ? 320 : -320, behavior: "smooth" });
  };
  const [homepageSettings, setHomepageSettings] = useState<any>({});
  const { products } = useCart();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHomepageSettings(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching homepage settings", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-black" style={{ height: "calc(100vh - 100px)", minHeight: 520 }}>
        <img
          src={homepageSettings.heroBanner || heroBanner}
          alt="Mijaz hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4" style={SANS}>Exclusively Crafted · Est. 2018</p>
          <h1 className="text-white text-6xl md:text-[88px] leading-none mb-4 tracking-wide" style={CINZEL}>MIJAZ</h1>
          <p className="text-white/70 text-sm md:text-base mb-10 max-w-lg tracking-wide leading-relaxed" style={SANS}>
            Wear your story as a scent. Artisanal perfumes and oils crafted from the world's most precious botanical ingredients.
          </p>
        </div>
      </section>

      {/* ── GENDER CATEGORIES GRID ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-[1440px] mx-auto mt-12 mb-12">
        {[
          { label: "Men", sub: "Bold · Woody · Intense", img: homepageSettings.categoryMen || categoryMen, query: "gender=Men" },
          { label: "Women", sub: "Floral · Fresh · Romantic", img: homepageSettings.categoryWomen || categoryWomen, query: "gender=Women" },
          { label: "Unisex", sub: "Versatile · Sophisticated", img: homepageSettings.categoryUnisex || categoryUnisex, query: "gender=Unisex" },
        ].map(({ label, sub, img, query }) => (
          <Link key={label} to={`/shop?${query}`} className="relative h-[320px] overflow-hidden group block rounded-2xl shadow-xs hover:shadow-md transition-all">
            <img
              src={img}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-2xl"
            />
            {/* Extremely light overlay, keeping images bright and clear */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300 rounded-2xl" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="text-white text-2xl tracking-[0.2em] uppercase mb-1 drop-shadow-md font-semibold" style={CINZEL}>{label}</h3>
              <p className="text-white/95 text-[10px] tracking-widest uppercase drop-shadow-xs font-bold" style={SANS}>{sub}</p>
              <div className="mt-4 w-8 h-px bg-[#D4AF37] group-hover:w-16 transition-all duration-300" />
            </div>
          </Link>
        ))}
      </section>

      {/* ── PRODUCT RANGES GRID ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 max-w-[1440px] mx-auto mb-16">
        {[
          { label: "Shop Perfumes", sub: "Extraits De Parfum · Sprays", img: homepageSettings.categoryPerfumeRange || categoryPerfumeRange, query: "category=Perfumes" },
          { label: "Shop Perfume Oils", sub: "Concentrated Elixirs · Roll-Ons", img: homepageSettings.categoryOilRange || categoryOilRange, query: "category=Oils" },
        ].map(({ label, sub, img, query }) => (
          <Link key={label} to={`/shop?${query}`} className="relative h-[240px] overflow-hidden group block rounded-2xl shadow-xs hover:shadow-md transition-all">
            <img
              src={img}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-2xl"
            />
            {/* Soft transparent overlay */}
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-300 rounded-2xl" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="text-white text-xl tracking-[0.2em] uppercase mb-1 drop-shadow-md font-semibold" style={CINZEL}>{label}</h3>
              <p className="text-white/90 text-[10px] tracking-widest uppercase drop-shadow-xs font-bold" style={SANS}>{sub}</p>
              <div className="mt-3 w-8 h-px bg-[#D4AF37] group-hover:w-16 transition-all duration-300" />
            </div>
          </Link>
        ))}
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 px-6 max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase mb-3" style={SANS}>Our Range</p>
          <h2 className="text-3xl text-black mb-4 font-normal" style={CINZEL}>Featured Bestsellers</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed" style={SANS}>
            Indulge in the enchanting world of perfumes with Mijaz — where every bottle holds a story, and every drop is crafted with obsessive attention to longevity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.filter((p) => p.category === "Perfume").slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/shop"
            className="inline-block border border-black text-black px-10 py-3.5 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-colors rounded-lg"
            style={SANS}
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* ── SIGNATURE BLENDS SLIDER ── */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase mb-2" style={SANS}>Specials</p>
              <h2 className="text-3xl text-white font-normal" style={CINZEL}>Recommended</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollSlider(blendsRef, "l")}
                className="w-9 h-9 border border-white/10 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center justify-center rounded-full cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollSlider(blendsRef, "r")}
                className="w-9 h-9 border border-white/10 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center justify-center rounded-full cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={blendsRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {BLENDS.map((blend) => (
              <Link
                key={blend.name}
                to={`/shop?search=${encodeURIComponent(blend.name)}`}
                className="flex-shrink-0 w-52 group relative overflow-hidden rounded-xl block"
              >
                <div className="w-full" style={{ aspectRatio: "9/13" }}>
                  <img
                    src={blend.img}
                    alt={blend.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl mb-1" style={CINZEL}>{blend.name}</h3>
                  <p className="text-white/60 text-[10px] uppercase tracking-wide" style={SANS}>{blend.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>







      {/* ── PROMO BANNER 2 ── */}
      <section className="relative h-80 overflow-hidden flex items-center mx-6 rounded-xl my-4">
        <img
          src={homepageSettings.promoBanner || "https://images.unsplash.com/photo-1705936118918-870095881e61?w=1400&h=500&fit=crop&auto=format"}
          alt="Botanical extracts"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-[#800000]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/80 text-[10px] tracking-[0.35em] uppercase mb-3" style={SANS}>Concentrated Luxury</p>
          <h2 className="text-white text-4xl mb-4 font-normal" style={CINZEL}>Concentrated Perfume Oils</h2>
          <p className="text-white/70 text-xs md:text-sm mb-6 max-w-sm leading-relaxed" style={SANS}>
            Suspended in organic jojoba and coconut carriers, these rich oils melt into your skin to produce a uniquely personal scent trail.
          </p>
          <Link
            to="/shop?category=Oil"
            className="border border-white text-white px-9 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors rounded-lg"
            style={SANS}
          >
            Explore Perfume Oils
          </Link>
        </div>
      </section>

      {/* ── OILS GRID ── */}
      <section className="py-20 px-6 max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase mb-3" style={SANS}>Roll-On & Attar</p>
          <h2 className="text-3xl text-black font-normal mb-3" style={CINZEL}>Elixirs & Concentrated Oils</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto" style={SANS}>A selection of our finest hand-poured oils, offering unparalleled scent longevity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.filter((p) => p.category === "Oil").map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {/* Pad with standard products */}
          {products.filter((p) => p.category === "Perfume").slice(4, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
