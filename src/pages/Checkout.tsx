import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { CreditCard, ShoppingBag, ShieldCheck, MapPin, Truck, CheckCircle2, QrCode } from "lucide-react";

import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, runTransaction, setDoc } from "firebase/firestore";
import perfume50ml from "../imports/perfume-50ml.jpg";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function Checkout() {
  const { cart, cartTotal, clearCart, addOrder, profile, addAddress, products } = useCart();
  
  // Checkout flow steps: 'shipping' -> 'payment' -> 'confirmed'
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmed'>('shipping');
  
  const savedAddresses = profile?.addresses || [];
  const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];

  // Form fields
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(defaultAddr?.street || "");
  const [city, setCity] = useState(defaultAddr?.city || "");
  const [state, setState] = useState(defaultAddr?.state || "");
  const [pincode, setPincode] = useState(defaultAddr?.postalCode || "");
  const [saveAddress, setSaveAddress] = useState(!defaultAddr);
  const [saveAsLabel, setSaveAsLabel] = useState("Home");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "CC">("COD");
  const [ccNumber, setCcNumber] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvv, setCcCvv] = useState("");

  // Generated Order Details
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const validateShippingForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Enter a valid email address";
    if (phone.length < 10) errors.phone = "Enter a valid 10-digit phone number";
    if (!address.trim()) errors.address = "Delivery address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!state.trim()) errors.state = "State is required";
    if (pincode.length !== 6) errors.pincode = "Enter a valid 6-digit pincode";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      if (cartTotal < 1000 && paymentMethod === "COD") {
        setPaymentMethod("UPI");
      }
      setStep('payment');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (paymentMethod === "CC") {
      if (ccNumber.length < 16 || ccExpiry.length < 5 || ccCvv.length < 3) {
        alert("Please enter valid card details to complete payment.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Get the sequential Order ID via Transaction
      const orderId = await runTransaction(db, async (transaction) => {
        const settingsRef = doc(db, "settings", "homepage");
        const sfDoc = await transaction.get(settingsRef);
        
        let prefix = "MJZ-2026-27/";
        let seq = 1;

        if (sfDoc.exists()) {
          const data = sfDoc.data();
          if (data.invoicePrefix) prefix = data.invoicePrefix;
          if (data.nextInvoiceSequence) seq = data.nextInvoiceSequence;
        }

        const newSeqId = `${prefix}${seq.toString().padStart(3, '0')}`;
        
        // Update the sequence
        transaction.set(settingsRef, { nextInvoiceSequence: seq + 1 }, { merge: true });
        
        return newSeqId;
      });

      const today = new Date();
      const deliveryDate = new Date();
      deliveryDate.setDate(today.getDate() + 4);

      const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

      const newOrder = {
        orderId, // keeping the visual ID
        date: today.toLocaleDateString("en-IN", dateOptions),
        estDelivery: deliveryDate.toLocaleDateString("en-IN", dateOptions),
        items: cart.map(item => {
          const itemData: any = {
            productId: item.productId,
            name: item.name,
            size: item.size,
            price: item.price,
            qty: item.qty
          };
          // Only include img if it's defined and a string to avoid Firebase "undefined" error
          if (typeof item.img === "string") {
            itemData.img = item.img;
          }
          return itemData;
        }),
        total: cartTotal,
        status: "Processing" as const,
        shippingAddress: {
          name,
          email,
          phone,
          address: `${address}, ${city}, ${state} - ${pincode}`,
          state,
          pincode
        },
        paymentMethod,
        createdAt: serverTimestamp()
      };

      if (saveAddress) {
        addAddress({
          name,
          street: address,
          city,
          state,
          postalCode: pincode,
          country: "India",
          isDefault: savedAddresses.length === 0,
          label: saveAsLabel
        });
      }

      const docId = orderId.replace(/\//g, '-');
      await setDoc(doc(db, "orders", docId), newOrder);
      addOrder({ id: docId, ...newOrder });
      
      // Deduct stock
      for (const item of cart) {
        if (typeof item.productId === 'string') {
          const productRef = doc(db, "products", item.productId);
          try {
            await updateDoc(productRef, {
              [`stock.${item.size}`]: increment(-item.qty)
            });
          } catch (e) {
            console.error("Failed to deduct stock for", item.name, e);
          }
        }
      }

      setPlacedOrderId(orderId);
      setPlacedOrder(newOrder);
      setStep('confirmed');
      clearCart();
    } catch (error) {
      console.error("Failed to save order to Firebase:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && step !== 'confirmed') {
    return (
      <div className="py-32 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF8F4]" style={SANS}>
        <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4" style={CINZEL}>No Items to Checkout</h1>
        <p className="text-gray-400 text-xs mb-8">Add fragrances to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="bg-[#800000] text-white px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors">
          Browse Library
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Progress Bar (Only show if not confirmed) */}
        {step !== 'confirmed' && (
          <div className="flex items-center justify-center gap-4 md:gap-10 mb-12">
            <button
              onClick={() => setStep('shipping')}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${
                step === 'shipping' ? "border-[#800000] text-[#800000]" : "border-transparent text-gray-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#800000]/10 flex items-center justify-center text-[10px]">1</span>
              Shipping
            </button>
            <div className="w-8 md:w-20 h-px bg-gray-200" />
            <button
              disabled={step === 'shipping'}
              onClick={() => setStep('payment')}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${
                step === 'payment' ? "border-[#800000] text-[#800000]" : "border-transparent text-gray-400 disabled:opacity-50"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#800000]/10 flex items-center justify-center text-[10px]">2</span>
              Payment
            </button>
          </div>
        )}

        {/* Step 1: Shipping Details */}
        {step === 'shipping' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Column (7 cols) */}
            <form onSubmit={handleNextToPayment} className="lg:col-span-7 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2" style={CINZEL}>Shipping Address</h2>
              
              {savedAddresses.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {savedAddresses.map((addr: any) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setAddress(addr.street);
                        setCity(addr.city);
                        setState(addr.state);
                        setPincode(addr.postalCode);
                        setSaveAddress(false);
                      }}
                      className={`shrink-0 px-4 py-2 border rounded-lg text-left text-xs transition-colors ${
                        address === addr.street 
                          ? "border-[#800000] bg-[#800000]/5 text-[#800000]"
                          : "border-gray-200 text-gray-500 hover:border-[#D4AF37]"
                      }`}
                    >
                      <p className="font-bold uppercase tracking-wider">{addr.label || "Saved Address"}</p>
                      <p className="text-[10px] mt-0.5 max-w-[150px] truncate">{addr.street}, {addr.city}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setAddress("");
                      setCity("");
                      setState("");
                      setPincode("");
                      setSaveAddress(true);
                    }}
                    className="shrink-0 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:text-[#800000] hover:border-[#800000] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                  {formErrors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                  {formErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                />
                {formErrors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.email}</p>}
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  placeholder="Flat/House No., Street address, landmark"
                />
                {formErrors.address && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                  {formErrors.city && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                  {formErrors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.state}</p>}
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                  {formErrors.pincode && <p className="text-red-500 text-[10px] mt-1 font-semibold">{formErrors.pincode}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 text-[#800000] border-gray-300 rounded focus:ring-[#800000] cursor-pointer"
                  />
                  <label htmlFor="saveAddress" className="text-xs text-gray-500 cursor-pointer select-none font-medium tracking-wide">
                    Save this address to my profile
                  </label>
                </div>
                {saveAddress && (
                  <div className="flex items-center gap-2 ml-6">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Save As:</span>
                    {["Home", "Office", "Other"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSaveAsLabel(label)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all cursor-pointer ${
                          saveAsLabel === label 
                            ? "border-[#800000] bg-[#800000]/5 text-[#800000]"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#800000] text-white py-4 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  Continue to Payment
                </button>
              </div>
            </form>

            {/* Cart Summary Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2" style={CINZEL}>Order Details</h3>
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <img src={item.img || perfume50ml} alt={item.name} className="w-8 h-10 object-cover rounded-md border border-gray-50" />
                        <div>
                          <p className="font-semibold text-gray-800 truncate max-w-40">{item.name}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{item.size} x {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-700">Rs. {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-50 pt-4 flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">Grand Total</span>
                  <span className="font-bold text-xl text-[#800000]">Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Selector */}
        {step === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-xs space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2" style={CINZEL}>Payment Method</h2>
                <p className="text-xs text-gray-400">Choose your preferred secure payment channel.</p>
              </div>

              {/* Payment selector row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "COD", label: "Cash on Delivery", desc: cartTotal < 1000 ? "Unavailable for orders under Rs. 1000" : "Pay cash at doorstep" },
                  { id: "UPI", label: "UPI / QR Scan", desc: "Instant QR Payment" },
                  { id: "CC", label: "Credit Card", desc: "Visa/Mastercard/Amex" }
                ].map((m) => {
                  const isDisabled = m.id === "COD" && cartTotal < 1000;
                  return (
                  <button
                    key={m.id}
                    disabled={isDisabled}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between min-h-24 ${
                      isDisabled 
                        ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100"
                        : paymentMethod === m.id
                          ? "border-[#800000] bg-[#800000]/5 text-[#800000] font-semibold cursor-pointer"
                          : "border-gray-250 text-gray-500 hover:border-[#D4AF37] hover:text-black bg-white cursor-pointer"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{m.label}</span>
                    <span className={`text-[9px] leading-snug mt-2 ${isDisabled ? "text-red-500 font-semibold" : "text-gray-400"}`}>{m.desc}</span>
                  </button>
                )})}
              </div>

              {/* COD description */}
              {paymentMethod === "COD" && (
                <div className="bg-[#FAF8F4] border border-gray-150 p-4 rounded-xl text-xs text-gray-500 leading-relaxed">
                  You will pay cash or card to the courier delivery agent upon receiving the package. Standard free delivery remains active.
                </div>
              )}

              {/* UPI description */}
              {paymentMethod === "UPI" && (
                <div className="bg-[#FAF8F4] border border-gray-150 p-5 rounded-xl space-y-4 flex flex-col items-center">
                  <p className="text-xs text-gray-500 text-center">Scan this luxury merchant QR using any UPI app (GPay, PhonePe, Paytm) to clear payment.</p>
                  <div className="bg-white border border-gray-150 p-3 rounded-lg shadow-sm">
                    <QrCode size={120} className="text-gray-900" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">merchant id: mijaz@upi</span>
                </div>
              )}

              {/* Credit Card inputs */}
              {paymentMethod === "CC" && (
                <div className="bg-[#FAF8F4] border border-gray-150 p-5 rounded-xl space-y-4">
                  <div>
                    <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        maxLength={16}
                        value={ccNumber}
                        onChange={(e) => setCcNumber(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000] pl-10"
                      />
                      <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Expiration Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={ccExpiry}
                        onChange={(e) => setCcExpiry(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">CVV Code</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={ccCvv}
                        onChange={(e) => setCcCvv(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Guarantees */}
              <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                <button
                  onClick={() => setStep('shipping')}
                  className="text-xs text-[#800000] hover:text-[#D4AF37] font-semibold flex items-center transition-colors cursor-pointer"
                >
                  ← Back to Shipping
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="bg-[#800000] text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Processing Order..." : `Place Order (Rs. ${cartTotal.toLocaleString()})`}
                </button>
              </div>
            </div>

            {/* Address Summary Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5" style={CINZEL}>
                  <MapPin size={13} className="text-[#800000]" /> Ship Destination
                </h3>
                <div className="text-xs space-y-1.5 text-gray-600">
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p>{address}</p>
                  <p>{city}, {state} - {pincode}</p>
                  <p className="pt-2 border-t border-gray-50">Phone: {phone}</p>
                  <p>Email: {email}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5" style={CINZEL}>
                  <ShieldCheck size={13} className="text-green-600" /> Buyer Protection
                </h3>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  We use bank-grade 256-bit encryption. All products are backed by our signature freshness guarantee, allowing hassle-free exchanges.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Placed / Confirmed order */}
        {step === 'confirmed' && (
          <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-md">
            <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={CINZEL}>Order Placed Successfully</h1>
            <p className="text-xs text-gray-500 mb-6">Thank you for choosing Mijaz Luxury. Your order has been registered.</p>
            
            <div className="bg-[#FAF8F4] border border-gray-150 p-4 rounded-xl text-left text-xs space-y-2 mb-8">
              <p><strong className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Order Reference:</strong> <span className="font-semibold text-gray-900">{placedOrderId}</span></p>
              <p><strong className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Shipped To:</strong> <span className="text-gray-900">{name}</span></p>
              <p><strong className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Estimated Arrival:</strong> <span className="text-[#800000] font-semibold">{new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  import("../lib/pdfGenerator").then(({ generateInvoicePDF }) => {
                    generateInvoicePDF({
                      invoiceNo: placedOrderId,
                      date: placedOrder?.date || new Date().toLocaleDateString('en-GB'),
                      dueDate: placedOrder?.date || new Date().toLocaleDateString('en-GB'),
                      customerName: name,
                      email: email,
                      phone: phone,
                      address: `${address}, ${city}, ${state} - ${pincode}`,
                      state: state,
                      pincode: pincode,
                      items: placedOrder?.items.map((i: any) => ({
                        name: i.name,
                        desc: i.size,
                        qty: i.qty,
                        price: i.price,
                        amount: i.price * i.qty
                      })) || [],
                      subtotal: placedOrder?.total || cartTotal,
                      tax: 0,
                      total: placedOrder?.total || cartTotal,
                      paymentDetails: paymentMethod === 'COD' ? "Cash on Delivery" : `Paid via ${paymentMethod}`,
                      message: "Thank you for choosing Mijaz Luxury Perfumery.",
                      jobDesc: "Online Order"
                    });
                  });
                }}
                className="w-full bg-[#111] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#800000] transition-all flex items-center justify-center shadow-sm"
              >
                Download Invoice
              </button>
              <Link
                to="/profile?tab=orders"
                className="w-full bg-[#800000] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                Track Scent Delivery
              </Link>
              <Link
                to="/"
                className="w-full border border-gray-200 text-gray-600 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-all flex items-center justify-center bg-white"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
