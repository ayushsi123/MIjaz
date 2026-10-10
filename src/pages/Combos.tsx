import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Check, ShoppingBag } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";


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

export function Combos() {
  const { addToCart, products } = useCart();
  const navigate = useNavigate();
  
  const [combos, setCombos] = useState<GiftCombo[]>([]);

  const [loading, setLoading] = useState(true);
  
  const [selectedCombo, setSelectedCombo] = useState<GiftCombo | null>(null);
  const [addedComboId, setAddedComboId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {


        const comboSnap = await getDocs(collection(db, "combos"));
        const comboData = comboSnap.docs.map(d => ({ id: d.id, ...d.data() })) as GiftCombo[];
        setCombos(comboData);
        if (comboData.length > 0) {
          setSelectedCombo(comboData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getComboPrice = (combo: GiftCombo) => {
    const base = (combo.items || []).reduce((sum, item) => {
      const prod = products.find((p) => String(p.id) === String(item.productId));
      if (!prod) return sum;
      const price = prod.salePrices?.[item.size] ?? prod.prices?.[item.size] ?? prod.price ?? 0;
      return sum + Number(price);
    }, 0);
    if (base === 0) return 0;
    const discount = combo.discountPercentage ?? 0;
    return Math.max(0, Math.floor(base * (1 - discount / 100)));
  };

  const getComboItemLabels = (combo: GiftCombo) => {
    return (combo.items || []).map((item) => {
      const prod = products.find((p) => String(p.id) === String(item.productId));
      if (!prod) return `${item.size} Unknown Item`;
      return `${item.size} ${prod.name} ${prod.category === "Oil" ? "Oil" : "Spray"}`;
    });
  };

  const handleAddComboToCart = (combo: GiftCombo) => {
    const comboPrice = getComboPrice(combo);

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
    setAddedComboId(combo.id);
    
    setTimeout(() => {
      setAddedComboId(null);
      navigate("/cart");
    }, 800);
  };

  if (loading) {
    return (
      <div className="bg-[#FAF8F4] min-h-screen py-32 text-center" style={SANS}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Curated Sets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <p className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase mb-3 font-bold" style={SANS}>Curated Caskets</p>
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 tracking-wide" style={CINZEL}>
            Luxury Combo Sets
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Discover our handpicked collection of fragrance pairings and travel wardrobes, priced strictly as the sum of their individual catalog prices.
          </p>
        </div>

        {combos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No combos available at the moment. Please check back later or have an admin create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {combos.map((combo) => {
              const isSelected = selectedCombo?.id === combo.id;
              const isAdding = addedComboId === combo.id;
              const comboPrice = getComboPrice(combo);
              const basePrice = (combo.items || []).reduce((sum, item) => {
                const prod = products.find((p) => String(p.id) === String(item.productId));
                if (!prod) return sum;
                const price = prod.salePrices?.[item.size] ?? prod.prices?.[item.size] ?? prod.price ?? 0;
                return sum + Number(price);
              }, 0);
              const comboItems = getComboItemLabels(combo);
              
              return (
                <div 
                  key={combo.id}
                  onClick={() => navigate(`/combo/${combo.id}`)}
                  className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer border-gray-100`}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-[#f5f3f0] overflow-hidden">
                    <img 
                      src={combo.img} 
                      alt={combo.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <span className="absolute top-3 left-3 bg-[#D4AF37] text-black text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-md">
                      Combo Set
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1" style={CINZEL}>
                        {combo.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
                        {combo.description}
                      </p>
                      
                      {/* Items List */}
                      <div className="space-y-1 mb-6">
                        <p className="text-[9px] font-bold text-[#800000] uppercase tracking-wider mb-1">What's Inside:</p>
                        {comboItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-[9px] text-gray-500">
                            <Check size={10} className="text-[#D4AF37] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider">Price</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#800000]">Rs. {comboPrice.toLocaleString()}</p>
                          {basePrice > comboPrice && (
                            <p className="text-[10px] text-gray-400 line-through">Rs. {basePrice.toLocaleString()}</p>
                          )}
                          {combo.discountPercentage && combo.discountPercentage > 0 ? (
                            <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-1">
                              {combo.discountPercentage}% OFF
                            </span>
                          ) : null}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddComboToCart(combo);
                        }}
                        disabled={isAdding}
                        className="bg-[#800000] hover:bg-[#D4AF37] text-white hover:text-black py-2 px-3.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {isAdding ? (
                          <>
                            <Check size={11} /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={11} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
