import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Gift, MapPin, Ticket } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, products } = useCart();
  const navigate = useNavigate();

  // Promo Code States
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const formattedCode = promoCode.trim().toUpperCase();

    if (formattedCode === "WELCOME10") {
      setAppliedPromo("WELCOME10 (10% Off)");
      setDiscountAmount(Math.round(cartTotal * 0.1));
      setPromoCode("");
    } else if (formattedCode === "MIJAZGIFT") {
      setAppliedPromo("MIJAZGIFT (Rs. 500 Off)");
      setDiscountAmount(Math.min(cartTotal, 500));
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code. Try 'WELCOME10' or 'MIJAZGIFT'");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo("");
    setDiscountAmount(0);
  };

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header */}
        <div className="mb-10 pt-4">
          <h1 className="text-3xl font-normal text-gray-900 tracking-wide" style={CINZEL}>Shopping Bag</h1>
          <p className="text-gray-500 text-xs mt-1">Review your selections and customize gifting configurations before checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-20 text-center shadow-xs">
            <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Bag is Empty</h2>
            <p className="text-gray-400 text-xs mb-8 max-w-xs mx-auto">
              Indulge in our exquisite collection of premium scents to add to your library.
            </p>
            <Link
              to="/shop"
              className="bg-[#800000] text-white px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              Browse Fragrances
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                // Find matching product in local database or set mock
                const prod = products.find((p) => p.id === item.productId);
                const displayImg = prod?.img || item.img;
                
                return (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row gap-5"
                  >
                    {/* Image */}
                    <div className="w-24 h-28 bg-[#faf8f4] border border-gray-50 rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0">
                      <img src={displayImg} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-[#800000] mt-1 font-semibold">
                            Size: {item.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-gray-900">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Gifting details if configured */}
                      {item.giftingConfig && item.giftingConfig.isGift && (
                        <div className="bg-[#FAF8F4] border border-gray-150 p-3.5 rounded-xl my-3 text-[10px] space-y-2 text-gray-500">
                          <div className="flex items-center gap-1.5 text-gray-700 font-bold uppercase tracking-wider text-[8px]">
                            <Gift size={11} className="text-[#800000]" /> Gifting Casket Configured ({item.giftingConfig.packaging})
                          </div>
                          {item.giftingConfig.recipientName && (
                            <p><strong className="text-gray-700">To:</strong> {item.giftingConfig.recipientName} <strong className="text-gray-700 ml-2">From:</strong> {item.giftingConfig.senderName}</p>
                          )}
                          {item.giftingConfig.message && (
                            <p className="italic">"{item.giftingConfig.message}"</p>
                          )}
                          
                          {/* Split Shipments Display */}
                          {item.giftingConfig.splitAddresses && (
                            <div className="border-t border-gray-200/60 pt-2 space-y-1.5">
                              <p className="font-semibold text-[9px] text-[#800000] flex items-center gap-1"><MapPin size={9} /> Split Destinations:</p>
                              {item.giftingConfig.splitAddresses.map((dest, idx) => (
                                <p key={idx} className="pl-2 border-l border-[#800000]/30 leading-snug">
                                  <strong>Dest #{idx+1}:</strong> {dest.name} ({dest.phone}) — {dest.address}
                                  {dest.note && <span className="block italic text-[9px] text-gray-400">Card note: "{dest.note}"</span>}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quantity & Delete Actions */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center border border-gray-250 rounded-lg">
                          <button
                            onClick={() => updateQty(item.productId, item.size, -1)}
                            className="px-2.5 py-1 text-gray-500 hover:text-[#800000] cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-semibold w-8 text-center select-none">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.size, 1)}
                            className="px-2.5 py-1 text-gray-500 hover:text-[#800000] cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-sm text-[#800000]">
                            Rs. {(item.price * item.qty).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-2 text-left">
                <Link to="/shop" className="text-xs text-[#800000] hover:text-[#D4AF37] font-semibold flex items-center gap-1 transition-colors">
                  ← Add More Scent Bottles
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Promo code input */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5" style={CINZEL}>
                  <Ticket size={13} className="text-[#D4AF37]" /> Promotional Offer
                </h3>
                <form onSubmit={handleApplyPromo} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-hidden focus:border-[#800000] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-[#800000] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {promoError && <p className="text-red-500 text-[10px] font-semibold">{promoError}</p>}
                {appliedPromo && (
                  <div className="flex justify-between items-center bg-green-50 border border-green-150 p-2.5 rounded-lg text-[10px] text-green-700 font-semibold mt-2">
                    <span>Active: {appliedPromo}</span>
                    <button onClick={handleRemovePromo} className="text-red-500 hover:text-red-700 font-bold text-xs ml-2">×</button>
                  </div>
                )}
                <div className="text-[9px] text-gray-400 mt-2 font-medium">
                  Try "WELCOME10" for 10% discount or "MIJAZGIFT" for Rs. 500 off.
                </div>
              </div>

              {/* Order total card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2" style={CINZEL}>Order Summary</h3>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-medium">
                    <span>Discount Code</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Standard Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 border-b border-gray-50 pb-4">
                  <span>Estimated Taxes (GST)</span>
                  <span className="font-medium text-gray-900">Included</span>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-bold text-sm text-gray-900">Grand Total</span>
                  <span className="font-bold text-xl text-[#800000]">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-[#800000] text-white py-4 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
