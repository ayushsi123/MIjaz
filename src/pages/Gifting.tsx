import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

import { Sparkles, Gift, Send, Check, AlertCircle } from "lucide-react";
import perfume50ml from "../imports/perfume-50ml.jpg";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

interface SelectedItem {
  productId: number;
  name: string;
  size: string;
  price: number;
}

export function Gifting() {
  const navigate = useNavigate();
  const addToCart = useCart((state) => state.addToCart);
  const products = useCart((state) => state.products);

  // Items selection states
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Gifting Config States
  const [includeBox, setIncludeBox] = useState(false);
  const [includePolaroid, setIncludePolaroid] = useState(false);
  const [polaroidCaption, setPolaroidCaption] = useState("");
  const [includeWaxSeal, setIncludeWaxSeal] = useState(false);
  const [waxSealColor, setWaxSealColor] = useState<"Gold" | "Burgundy Red" | "Champagne Silver">("Gold");
  const [waxMessage, setWaxMessage] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  const [added, setAdded] = useState(false);

  // Toggle item in box selection
  const handleToggleItem = (productId: number, name: string, size: string, price: number) => {
    const isSelected = selectedItems.some(
      (item) => item.productId === productId && item.size === size
    );

    if (isSelected) {
      setSelectedItems(
        selectedItems.filter(
          (item) => !(item.productId === productId && item.size === size)
        )
      );
    } else {
      setSelectedItems([...selectedItems, { productId, name, size, price }]);
    }
  };

  // Calculate Live Totals
  const itemsTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const boxPrice = includeBox ? 200 : 0;
  const polaroidPrice = includePolaroid ? 99 : 0;
  const waxSealPrice = includeWaxSeal ? 49 : 0;
  const totalCost = itemsTotal + boxPrice + polaroidPrice + waxSealPrice;

  // Add Custom Box to Cart
  const handleAddCustomBoxToCart = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one fragrance or oil to include in your box!");
      return;
    }

    const uniqueId = 300 + (Date.now() % 100000);
    const boxContentsDesc = selectedItems.map((i) => `${i.name} (${i.size})`).join(", ");

    const productAdapter = {
      id: uniqueId,
      name: "Custom Curated Gift Box",
      category: "Gift Set",
      gender: "Unisex",
      occasion: "Gifting",
      sizes: ["Custom Box"],
      prices: { "Custom Box": totalCost * 1.2 },
      salePrices: { "Custom Box": totalCost },
      notes: selectedItems.map((i) => i.name),
      img: perfume50ml,
      description: `A custom curated Mijaz gift box containing: ${boxContentsDesc}.`
    };

    const giftingConfig = {
      isGift: true,
      recipientName,
      senderName,
      message: giftMessage,
      packaging: includeBox ? "Premium Rigid Cardboard Box (+ Rs. 200)" : "Standard Cardboard Box",
      polaroid: includePolaroid ? { enabled: true, caption: polaroidCaption } : undefined,
      waxSeal: includeWaxSeal ? { enabled: true, color: waxSealColor, letterMessage: waxMessage } : undefined,
      specialRequest: specialRequest || undefined
    };

    addToCart(productAdapter as any, "Custom Box", giftingConfig);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
      navigate("/cart");
    }, 600);
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16 pt-8">
          <p className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase mb-3 font-bold">Mijaz Custom Builder</p>
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 tracking-wide" style={CINZEL}>
            Design Your Gift Box
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Create a personalized gift casket. Select your scents, choose premium packaging, include printed polaroid photos, and add custom wax-sealed notes.
          </p>
        </div>

        {/* Builder Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          
          {/* Left Column: Scent Selector & Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Perfumes Casket Selection */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
              <div className="mb-4">
                <span className="bg-[#800000]/10 text-[#800000] text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-md">Step 1 of 3</span>
                <h2 className="text-base font-normal text-gray-900 mt-2 mb-1" style={CINZEL}>Select Fragrances for your Box</h2>
                <p className="text-xs text-gray-400">Choose from our premium extraits de parfum (sprays).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter((p) => p.category === "Perfume").map((prod) => (
                  <div key={prod.id} className="border border-gray-100 rounded-xl p-4 flex gap-3.5 bg-gray-50/50">
                    <img src={prod.img} alt={prod.name} className="w-12 h-16 object-cover rounded-md bg-[#faf8f4]" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[9px] text-gray-400 italic truncate mb-2.5">{prod.notes.join(" · ")}</p>
                      
                      {/* Sizes Toggles */}
                      <div className="flex gap-2">
                        {["20ml", "50ml"].map((size) => {
                          const price = size === "20ml" ? 350 : 600;
                          const isAdded = selectedItems.some(
                            (item) => item.productId === prod.id && item.size === size
                          );
                          return (
                            <button
                              key={size}
                              onClick={() => handleToggleItem(prod.id, prod.name, size, price)}
                              className={`flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                                isAdded
                                  ? "bg-[#800000] border-[#800000] text-white"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#D4AF37]"
                              }`}
                            >
                              {size} ({size === "20ml" ? "350" : "600"})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Perfume Oils Selection */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
              <div className="mb-4">
                <h2 className="text-base font-normal text-gray-900 mb-1" style={CINZEL}>Select Perfume Oils (Roll-Ons)</h2>
                <p className="text-xs text-gray-400">Choose from our highly concentrated attar oil elixirs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter((p) => p.category === "Oil").map((prod) => (
                  <div key={prod.id} className="border border-gray-100 rounded-xl p-4 flex gap-3.5 bg-gray-50/50">
                    <img src={prod.img} alt={prod.name} className="w-12 h-16 object-cover rounded-md bg-[#faf8f4]" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">{prod.name}</h4>
                      <p className="text-[9px] text-gray-400 italic truncate mb-2.5">{prod.notes.join(" · ")}</p>
                      
                      {/* Oil Size Selection */}
                      <button
                        onClick={() => handleToggleItem(prod.id, prod.name, "8ml", 350)}
                        className={`w-full py-1.5 rounded-md text-[9px] font-bold uppercase transition-all cursor-pointer border ${
                          selectedItems.some((item) => item.productId === prod.id && item.size === "8ml")
                            ? "bg-[#800000] border-[#800000] text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-[#D4AF37]"
                        }`}
                      >
                        8ml Oil (Rs. 350)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Customizer & Message Options (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              
              <div>
                <span className="bg-[#800000]/10 text-[#800000] text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-md">Step 2 of 3</span>
                <h2 className="text-base font-normal text-gray-900 mt-2 mb-1" style={CINZEL}>Casket Customization</h2>
                <p className="text-xs text-gray-400">Personalize wrapping formats and custom requests.</p>
              </div>

              {/* Packaging Rigid Box Checkbox */}
              <div 
                onClick={() => setIncludeBox(!includeBox)}
                className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  includeBox ? "border-[#800000] bg-[#800000]/2" : "border-gray-150 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Gift className="text-[#800000]" size={16} />
                  <div>
                    <p className="text-xs font-bold text-gray-800">Rigid Cardboard Gift Box Wrapping</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Wrapped inside our signature brand casket</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#800000]">+ Rs. 200</span>
              </div>

              {/* Polaroid customization */}
              <div className="border border-gray-150 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includePolaroid}
                      onChange={(e) => setIncludePolaroid(e.target.checked)}
                      className="w-4 h-4 text-[#800000] border-gray-300 rounded-sm focus:ring-[#800000] cursor-pointer"
                    />
                    Add Printed Polaroid Photo
                  </label>
                  <span className="text-xs font-bold text-[#800000]">+ Rs. 99</span>
                </div>
                {includePolaroid && (
                  <input
                    type="text"
                    required
                    value={polaroidCaption}
                    onChange={(e) => setPolaroidCaption(e.target.value)}
                    placeholder="Enter Polaroid Caption text..."
                    className="w-full h-9 px-3 bg-gray-50 border border-gray-250 rounded-lg text-xs outline-hidden focus:border-[#D4AF37] focus:bg-white"
                  />
                )}
              </div>

              {/* Wax Seal Customizer */}
              <div className="border border-gray-150 rounded-xl p-4 space-y-3.5">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeWaxSeal}
                      onChange={(e) => setIncludeWaxSeal(e.target.checked)}
                      className="w-4 h-4 text-[#800000] border-gray-300 rounded-sm focus:ring-[#800000] cursor-pointer"
                    />
                    Gold-Pressed Candle Wax Seal
                  </label>
                  <span className="text-xs font-bold text-[#800000]">+ Rs. 49</span>
                </div>
                 {includeWaxSeal && (
                  <div className="space-y-3.5">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Wax Color:</p>
                      <div className="flex gap-2">
                        {(["Gold", "Burgundy Red", "Champagne Silver"] as const).map((color) => (
                          <button
                            key={color}
                            onClick={() => setWaxSealColor(color)}
                            className={`flex-1 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer border ${
                              waxSealColor === color
                                ? "bg-[#800000] text-white border-[#800000]"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Wax-Sealed Letter Message:</p>
                      <textarea
                        value={waxMessage}
                        onChange={(e) => setWaxMessage(e.target.value)}
                        placeholder="Enter custom handwritten letter message to be sealed inside the wax envelope..."
                        className="w-full h-16 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-hidden focus:border-[#D4AF37] focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Special Request Text Area */}
              <div>
                <span className="bg-[#800000]/10 text-[#800000] text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-md">Step 3 of 3</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mt-2 mb-2" style={CINZEL}>Special Request Details</h3>
                <textarea
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="Enter custom request (e.g. customized box sizes, handwritten messages, custom ribbons, etc.)..."
                  className="w-full h-20 p-3 bg-gray-50 border border-gray-250 rounded-xl text-xs outline-hidden focus:border-[#D4AF37] focus:bg-white resize-none"
                />
                <div className="flex gap-2 mt-2 text-[10px] text-gray-400 leading-relaxed bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg">
                  <AlertCircle className="text-[#D4AF37] shrink-0" size={12} />
                  <span>Important Note: Special requests are subject to approval by the Mijaz team during order packing.</span>
                </div>
              </div>

              {/* Recipient Details Card */}
              <div className="bg-[#FAF8F4] p-4.5 rounded-xl border border-gray-150 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5" style={CINZEL}>
                  <Send size={11} /> Recipient Card Message
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="To: (Name)"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="h-9 px-3 bg-white border border-gray-250 rounded-lg text-xs outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="From: (Name)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="h-9 px-3 bg-white border border-gray-250 rounded-lg text-xs outline-hidden"
                  />
                </div>
                <textarea
                  placeholder="Enter gift message card text (max 200 characters)..."
                  maxLength={200}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full h-16 p-3 bg-white border border-gray-250 rounded-lg text-xs outline-hidden resize-none"
                />
              </div>

            </div>

            {/* Total Box Cost & Cart Action */}
            <div className="pt-6 border-t border-gray-100 mt-8 space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Box Price</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{selectedItems.length} items added to gift box</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalCost.toLocaleString()}</p>
              </div>

              <button
                onClick={handleAddCustomBoxToCart}
                disabled={selectedItems.length === 0}
                className="w-full h-12 bg-[#800000] hover:bg-[#D4AF37] text-white hover:text-black font-bold uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {added ? (
                  <>
                    <Check size={14} /> Added Box to Cart
                  </>
                ) : (
                  <>
                    <Gift size={14} /> Add Custom Box to Cart
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
