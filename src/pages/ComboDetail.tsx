import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { ShoppingBag, ChevronRight, Check } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";


const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

interface GiftComboItem {
  productId: string | number;
  size: string;
}

interface GiftCombo {
  id: string | number;
  name: string;
  description: string;
  items: GiftComboItem[];
  img: string;
}

export function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, products } = useCart();

  const [combo, setCombo] = useState<GiftCombo | null>(null);

  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {


        if (id) {
          const comboRef = doc(db, "combos", id);
          const comboSnap = await getDoc(comboRef);
          if (comboSnap.exists()) {
            setCombo({ id: comboSnap.id, ...comboSnap.data() } as GiftCombo);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF8F4]" style={SANS}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Curated Set...</p>
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="py-32 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF8F4]" style={SANS}>
        <h1 className="text-3xl font-bold text-gray-800 mb-4" style={CINZEL}>Combo Not Found</h1>
        <p className="text-gray-500 mb-8">The curated set you are looking for does not exist.</p>
        <Link to="/combos" className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-[#D4AF37] hover:text-black transition-colors">
          Return to Combos
        </Link>
      </div>
    );
  }

  const base = (combo.items || []).reduce((sum, item) => {
    const prod = products.find((p) => String(p.id) === String(item.productId));
    if (!prod) return sum;
    const price = prod.salePrices?.[item.size] ?? prod.prices?.[item.size] ?? prod.price ?? 0;
    return sum + Number(price);
  }, 0);
  const discount = combo.discountPercentage ?? 0;
  const comboPrice = base === 0 ? 0 : Math.max(0, Math.floor(base * (1 - discount / 100)));

  const getComboItemLabels = () => {
    return (combo.items || []).map((item) => {
      const prod = products.find((p) => String(p.id) === String(item.productId));
      if (!prod) return `${item.size} Unknown Item`;
      return `${item.size} ${prod.name} ${prod.category === "Oil" ? "Oil" : "Spray"}`;
    });
  };

  const handleAddToCart = () => {
    const productAdapter = {
      id: combo.id,
      name: combo.name,
      category: "Gift Set",
      gender: "Unisex",
      occasion: "Gifting",
      sizes: ["Standard Set"],
      prices: { "Standard Set": comboPrice * 1.2 },
      salePrices: { "Standard Set": comboPrice },
      notes: ["Rose", "Oud", "Musk"],
      img: combo.img,
      description: combo.description
    };

    const giftingConfig = {
      isGift: true,
      recipientName: "Gift Receiver",
      senderName: "Gift Sender",
      message: "Enjoy this curated fragrance set!",
      packaging: "Standard Cardboard Box"
    };

    addToCart(productAdapter as any, "Standard Set", giftingConfig);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const comboItems = getComboItemLabels();

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-10">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link to="/combos" className="hover:text-black">Curated Caskets</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600 truncate">{combo.name}</span>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md">
              <img
                src={combo.img}
                alt={combo.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-md">
                Combo Set
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7 flex flex-col">
            <h1 className="text-4xl md:text-5xl text-gray-900 mb-4 font-normal" style={CINZEL}>
              {combo.name}
            </h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {combo.description}
            </p>

            {/* Items Inside */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000] mb-4">What's Inside</h3>
              <div className="space-y-3">
                {comboItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-[#D4AF37]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-bold text-[#800000]">
                Rs. {comboPrice.toLocaleString()}
              </span>
              {base > comboPrice && (
                <span className="text-lg text-gray-400 line-through">
                  Rs. {((base || 0)).toLocaleString()}
                </span>
              )}
              {combo.discountPercentage && combo.discountPercentage > 0 ? (
                <span className="text-xs text-green-600 font-semibold ml-2 bg-green-50 px-2 py-0.5 rounded-md">
                  {combo.discountPercentage}% OFF
                </span>
              ) : null}
            </div>

            {/* Call to Action */}
            <div className="flex gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  added
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-[#800000] text-white hover:bg-[#D4AF37] hover:text-black"
                }`}
              >
                <ShoppingBag size={14} />
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
