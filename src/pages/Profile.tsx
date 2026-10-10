import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { User, MapPin, Package, ClipboardList, CheckCircle2, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";
import { Address } from "../types";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import perfume50ml from "../imports/perfume-50ml.jpg";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

const getStatusColor = (status: string) => {
  if (status === "Cancelled") return "text-red-600";
  if (status === "Delivered" || status === "Out") return "text-green-600";
  if (status === "Shipped" || status === "In Transit") return "text-blue-600";
  return "text-[#D4AF37]";
};

const getStatusBg = (status: string) => {
  if (status === "Cancelled") return "bg-red-600";
  if (status === "Delivered" || status === "Out") return "bg-green-600";
  if (status === "Shipped" || status === "In Transit") return "bg-blue-600";
  return "bg-[#D4AF37]";
};

export function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "addresses";

  const { profile, updateProfile, addAddress, removeAddress, updateAddress, setTrackingOrder, setTrackModalOpen } = useCart();

  // Tab switching
  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };

  // Personal Info Form States
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [scentPref, setScentPref] = useState(profile.scentPreference || "Oud & Smoky");
  const [isSaved, setIsSaved] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState<"Home" | "Office" | "Other">("Home");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPincode, setNewPincode] = useState("");
  
  // Real orders from Firebase
  const [firebaseOrders, setFirebaseOrders] = useState<any[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setScentPref(profile.scentPreference || "Oud & Smoky");

    const emails = Array.from(new Set([
      profile.email,
      ...profile.orders.map(o => o.shippingAddress?.email)
    ].filter(Boolean))).slice(0, 10); // Firestore 'in' max 10

    if (emails.length === 0) return;

    const q = query(
      collection(db, "orders"),
      where("shippingAddress.email", "in", emails)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))
        .sort((a, b) => {
           const tA = a.createdAt?.seconds || 0;
           const tB = b.createdAt?.seconds || 0;
           return tB - tA;
        });
      setFirebaseOrders(ordersList);
    }, (err) => {
      console.error("Error fetching firebase orders", err);
    });
    
    return () => unsubscribe();
  }, [profile.email, profile.orders]);

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const orderRef = doc(db, "orders", orderToCancel);
      await updateDoc(orderRef, {
        status: "Cancelled",
        updates: [
          { date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), status: "Cancelled", location: "System" }
        ]
      });
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      console.error("Error cancelling order", err);
      alert("Failed to cancel order.");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile,
      name,
      email,
      phone,
      scentPreference: scentPref
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newStreet.trim()) return;

    if (editingAddressId) {
      updateAddress(editingAddressId, {
        name: newName,
        label: newTag,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPincode,
        country: "India"
      });
      setEditingAddressId(null);
    } else {
      addAddress({
        name: newName,
        label: newTag,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPincode,
        country: "India",
        isDefault: profile.addresses.length === 0
      });
    }

    setNewName("");
    setNewPhone("");
    setNewStreet("");
    setNewCity("");
    setNewState("");
    setNewPincode("");
    setShowAddressForm(false);
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setNewTag(addr.label);
    setNewName(addr.name);
    setNewStreet(addr.street);
    setNewCity(addr.city);
    setNewState(addr.state);
    setNewPincode(addr.postalCode);
    setShowAddressForm(true);
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen pb-16" style={SANS}>
      {/* Black Header Column with red profile card */}
      <div className="bg-black text-white py-10 mb-10">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-6">
          {/* Circular red avatar with gold initial */}
          <div className="w-16 h-16 rounded-full bg-[#800000] border-2 border-[#D4AF37]/50 flex items-center justify-center font-bold text-white text-2xl shadow-md" style={CINZEL}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-wide" style={SANS}>{name}</h1>
            <p className="text-gray-400 text-xs mt-0.5">{email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex justify-center md:justify-start gap-8 border-b border-gray-250 mb-10 text-sm">
          {[
            { id: "personal", label: "Personal Info" },
            { id: "addresses", label: "Address Book" },
            { id: "orders", label: "Order History" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`pb-3.5 font-semibold text-xs uppercase tracking-wider transition-all relative ${
                activeTab === t.id
                  ? "text-[#800000] border-b-2 border-[#800000]"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Address Book */}
        {activeTab === "addresses" && (
          <div className="space-y-8">
            {/* Address cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.addresses.map((a) => (
                <div
                  key={a.id}
                  className="bg-white border border-gray-100 p-6 rounded-2xl relative shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* tag badge on top-right */}
                  <span className="absolute top-4 right-4 bg-[#FAF0E6] text-[#D4AF37] font-bold text-[8px] px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                    {a.label}
                  </span>

                  <h3 className="font-semibold text-xs text-gray-900 mb-2">{a.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium mb-4">
                    {a.street}, {a.city}, {a.state} — {a.postalCode}
                  </p>

                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider pt-3 border-t border-gray-50">
                    <button
                      onClick={() => startEditAddress(a)}
                      className="text-[#D4AF37] hover:text-[#800000] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeAddress(a.id)}
                      className="text-[#800000] hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Dash block to trigger form */}
            {!showAddressForm && (
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setNewTag("Home");
                  setNewName("");
                  setNewStreet("");
                  setNewCity("");
                  setNewState("");
                  setNewPincode("");
                  setShowAddressForm(true);
                }}
                className="w-full md:w-80 border-2 border-dashed border-gray-250 hover:border-black text-gray-400 hover:text-black p-5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/50"
              >
                <Plus size={14} /> <span className="text-xs font-semibold uppercase tracking-wider">Add New Address</span>
              </button>
            )}

            {/* Address custom build Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs space-y-4 max-w-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2" style={CINZEL}>
                  {editingAddressId ? "Edit Address" : "New Address Details"}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Tag</label>
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Receiver Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="E.g. Aisha Khan"
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Address Details (Street / Area)</label>
                  <input
                    type="text"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="E.g. 42, Rose Garden Lane"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-semibold uppercase block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="400050"
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                    className="text-xs text-gray-400 hover:text-black font-semibold px-4 py-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#800000] text-white text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-lg hover:bg-black transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB: Order History */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1" style={CINZEL}>Order Ledger</h2>
              <p className="text-xs text-gray-400">Track active scent packaging boxes and view order reports.</p>
            </div>

            {(firebaseOrders.length > 0 ? firebaseOrders : profile.orders).length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-xs">
                <ClipboardList className="mx-auto text-gray-200 mb-4" size={40} />
                <p className="text-gray-400 text-xs mb-6 font-medium">You haven't placed any orders yet.</p>
                <Link
                  to="/shop"
                  className="bg-[#800000] text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                  Explore Fragrances
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {(firebaseOrders.length > 0 ? firebaseOrders : profile.orders).map((order) => (
                  <div key={order.orderId || order.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs relative">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 tracking-wide uppercase mb-1">
                          ORDER #{order.orderId || order.id}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                          {order.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getStatusBg(order.status)} ${
                          order.status !== "Cancelled" ? "animate-pulse" : ""
                        }`} />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 mb-6" />

                    {/* Items */}
                    <div className="space-y-6">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-14 bg-[#FAF8F4] rounded overflow-hidden shrink-0">
                              <img src={item.img || perfume50ml} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 tracking-wide mb-1" style={SANS}>{item.name}</p>
                              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{item.size} <span className="mx-1.5">•</span> Qty {item.qty}</p>
                            </div>
                          </div>
                          <p className="font-bold text-sm text-gray-900" style={SANS}>Rs. {(item.price * item.qty).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 my-6" />

                    {/* Footer */}
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pt-1">Total</p>
                      <div className="text-right">
                        <p className="font-bold text-base text-gray-900 mb-4" style={SANS}>
                          Rs. {order.total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-4 justify-end">
                          {(order.status === "Placed" || order.status === "Processing") && (
                            <button
                              onClick={() => {
                                setOrderToCancel(order.id);
                                setCancelModalOpen(true);
                              }}
                              className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                          <button
                            onClick={() => {
                              import("../lib/pdfGenerator").then(({ generateInvoicePDF }) => {
                                generateInvoicePDF({
                                  invoiceNo: order.orderId || order.id,
                                  date: order.date || new Date().toLocaleDateString('en-GB'),
                                  dueDate: order.date || new Date().toLocaleDateString('en-GB'),
                                  customerName: order.shippingAddress?.name || profile.name,
                                  email: order.shippingAddress?.email || profile.email,
                                  phone: order.shippingAddress?.phone || profile.phone,
                                  address: order.shippingAddress?.address || "N/A",
                                  state: order.shippingAddress?.state || "Delhi",
                                  pincode: order.shippingAddress?.pincode || "",
                                  items: order.items.map((i: any) => ({
                                    name: i.name,
                                    desc: i.size,
                                    qty: i.qty,
                                    price: i.price,
                                    amount: i.price * i.qty
                                  })),
                                  subtotal: order.total,
                                  tax: 0,
                                  total: order.total,
                                  paymentDetails: order.paymentMethod === 'COD' ? "Cash on Delivery" : `Paid via ${order.paymentMethod}`,
                                  message: "Thank you for choosing Mijaz Luxury Perfumery.",
                                  jobDesc: "Online Order"
                                });
                              });
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Invoice
                          </button>
                          <button
                            onClick={() => {
                              setTrackingOrder(order);
                              setTrackModalOpen(true);
                            }}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#800000] hover:text-[#D4AF37] transition-colors cursor-pointer"
                          >
                            Track Order
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Personal Info */}
        {activeTab === "personal" && (
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-xs space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1" style={CINZEL}>Patron Details</h2>
              <p className="text-xs text-gray-400">Manage account information and scent profiles.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">Preferred Scent Profile</label>
                <select
                  value={scentPref}
                  onChange={(e) => setScentPref(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                >
                  <option value="Oud & Smoky">Oud & Smoky (Dark woods, dry leather)</option>
                  <option value="Floral & Fresh">Floral & Fresh ( Bulgarian rose, lily, white musk)</option>
                  <option value="Spicy & Amber">Spicy & Amber (Cardamom, cinnamon, ambergris)</option>
                  <option value="Citrus & Aquatic">Citrus & Aquatic (Fresh mint, ocean breeze)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-[#800000] text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
                {isSaved && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Saved successfully
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900" style={CINZEL}>Cancel Order?</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancelModalOpen(false);
                    setOrderToCancel(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Cancel It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
