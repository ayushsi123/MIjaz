import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, ChevronDown, X, Plus, Minus, Package, Wind, Droplet, Sparkles, Leaf, Crown, Gift, FlaskConical, Flame, Menu } from "lucide-react";
import { useCart } from "../hooks/useCart";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ProductCard } from "../components/ProductCard";
import { AuthModal } from "./AuthModal";
import brandLogo from "../imports/logo.png";
import perfume50ml from "../imports/perfume-50ml.jpg";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;
const CORMORANT = { fontFamily: "'Cormorant Upright', serif" } as const;

export function Navbar() {
  const navigate = useNavigate();
  const {
    cart,
    updateQty,
    removeFromCart,
    cartDrawerOpen,
    setCartDrawerOpen,
    profile,
    isLoggedIn,
    logout,
    products
  } = useCart();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (collectionsRef.current && !collectionsRef.current.contains(event.target as Node)) {
        setCollectionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const megaCategories = [
    { label: "Perfumes", icon: <Wind size={18} className="text-[#800000]" /> },
    { label: "Perfume Oils", icon: <Droplet size={18} className="text-[#800000]" /> },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Announcement Bar */}
      <div className="bg-[#111111] text-white text-center py-2 text-[11px] font-normal tracking-wide" style={SANS}>
        Free Shipping above 999 INR &nbsp;|&nbsp; FLAT 10% OFF On Orders above 2499 INR (Automatically Applied) &nbsp;|&nbsp; COD Eligible Above 999 INR
      </div>

      {/* Main Nav (Flexible Row Layout) */}
      <nav className="border-b border-gray-100 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 h-[68px] flex items-center justify-between">
          
          {/* Left Column: Logo + Navigation links */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="lg:hidden flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="text-gray-800 hover:text-[#800000] transition-colors cursor-pointer p-1 -ml-1">
                    <Menu size={24} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-white" style={SANS}>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <img src={brandLogo} alt="Mijaz Logo" className="h-8 w-auto object-contain" />
                  </div>
                  
                  {/* Mobile Search Form */}
                  <div className="p-4 border-b border-gray-100">
                    <form onSubmit={(e) => {
                      handleSearchSubmit(e);
                      setMobileMenuOpen(false);
                    }} className="flex items-center border border-gray-300 overflow-hidden h-[36px] rounded-md bg-white">
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="px-3 text-xs outline-none text-gray-700 placeholder:text-gray-400 flex-1 h-full"
                        style={SANS}
                      />
                      <button type="submit" className="bg-[#D4AF37] hover:bg-[#800000] transition-colors px-3 h-full flex items-center justify-center shrink-0 cursor-pointer">
                        <Search size={14} className="text-white" strokeWidth={2.5} />
                      </button>
                    </form>
                  </div>

                  <div className="flex flex-col p-4 space-y-4">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold uppercase tracking-wider text-gray-800">Home</Link>
                    <Link to="/shop?filter=New Arrivals" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold uppercase tracking-wider text-gray-800">New Arrivals</Link>
                    <Link to="/combos" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold uppercase tracking-wider text-gray-800">Combos</Link>
                    <Link to="/gifting" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold uppercase tracking-wider text-gray-800">Gifting</Link>
                    <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold uppercase tracking-wider text-gray-800">About</Link>
                    
                    <div className="pt-4 border-t border-gray-100 mt-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">Shop Categories</p>
                      <div className="space-y-3 flex flex-col">
                        <Link to="/shop?category=Perfumes" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-600">Perfumes</Link>
                        <Link to="/shop?category=Perfume Oils" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-600">Perfume Oils</Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link to="/" className="flex items-center shrink-0">
              <img src={brandLogo} alt="Mijaz Logo" className="h-12 w-auto object-contain" />
            </Link>

            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/"
                className="text-[11px] font-semibold uppercase tracking-wider text-gray-800 hover:text-[#800000] transition-colors whitespace-nowrap"
                style={SANS}
              >
                Home
              </Link>

              {/* Collections Hover Dropdown */}
              <div
                className="relative"
                ref={collectionsRef}
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button
                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-800 hover:text-[#800000] transition-colors whitespace-nowrap uppercase tracking-wider cursor-pointer"
                  style={SANS}
                >
                  Collections
                  <ChevronDown size={10} className={`transition-transform duration-200 ${collectionsOpen ? "rotate-180" : ""}`} />
                </button>

                {collectionsOpen && (
                  <div
                    className="absolute top-full left-0 bg-white border border-gray-100 shadow-xl z-50 w-[460px] translate-y-3 rounded-lg overflow-hidden"
                  >
                    <div className="p-5">
                      <p className="text-[10px] text-[#800000] uppercase tracking-[0.25em] font-bold mb-4" style={CINZEL}>Browse Collections</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {megaCategories.map((cat) => (
                          <Link
                            key={cat.label}
                            to={`/shop?category=${encodeURIComponent(cat.label)}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="flex flex-col items-center gap-2 p-3 border border-gray-50 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group rounded-lg"
                          >
                            {cat.icon}
                            <span className="text-[9px] text-gray-600 group-hover:text-[#800000] text-center leading-tight" style={SANS}>
                              {cat.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex gap-5">
                        {["Men's Picks", "Women's Picks", "New Arrivals", "Best Sellers"].map((l) => (
                          <Link
                            key={l}
                            to={`/shop?filter=${encodeURIComponent(l)}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="text-[11px] text-gray-500 hover:text-[#800000] transition-colors"
                            style={SANS}
                          >
                            {l}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/shop?filter=New Arrivals"
                className="text-[11px] font-semibold text-gray-800 hover:text-[#800000] transition-colors uppercase tracking-wider whitespace-nowrap"
                style={SANS}
              >
                New Arrivals
              </Link>

              <Link
                to="/combos"
                className="text-[11px] font-semibold text-gray-800 hover:text-[#800000] transition-colors uppercase tracking-wider whitespace-nowrap"
                style={SANS}
              >
                Combos
              </Link>

              <Link
                to="/gifting"
                className="text-[11px] font-semibold text-gray-800 hover:text-[#800000] transition-colors uppercase tracking-wider whitespace-nowrap"
                style={SANS}
              >
                Gifting
              </Link>



              <Link
                to="/about"
                className="text-[11px] font-semibold text-gray-800 hover:text-[#800000] transition-colors whitespace-nowrap uppercase tracking-wider"
                style={SANS}
              >
                About
              </Link>
            </div>
          </div>

          {/* Right Column: Search + Profile + Cart */}
          <div className="flex items-center justify-end gap-3.5">
            <div className="w-px h-4 bg-gray-200 shrink-0 hidden lg:block" />

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center border border-gray-300 overflow-hidden h-[30px] rounded-md bg-white">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="px-2.5 text-[11px] outline-hidden text-gray-700 placeholder:text-gray-400 w-24 h-full"
                style={SANS}
              />
              <button type="submit" className="bg-[#D4AF37] hover:bg-[#800000] transition-colors px-2.5 h-full flex items-center justify-center shrink-0 cursor-pointer">
                <Search size={11} className="text-white" strokeWidth={2.5} />
              </button>
            </form>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    setProfileDropdownOpen(!profileDropdownOpen);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="text-[11px] font-semibold text-gray-700 hover:text-[#800000] transition-colors whitespace-nowrap uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                style={SANS}
              >
                {isLoggedIn ? "Account" : "Sign In"}
                {isLoggedIn && <ChevronDown size={8} />}
              </button>
              
              {profileDropdownOpen && isLoggedIn && (
                <div className="absolute right-0 top-[35px] bg-white border border-gray-100 shadow-xl min-w-[200px] z-50 rounded-lg" style={SANS}>
                  <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
                    <p className="text-[12px] font-semibold text-gray-900">{profile.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{profile.email}</p>
                  </div>
                  {[
                    ["My Orders", "/profile?tab=orders"],
                    ["Address Book", "/profile?tab=addresses"],
                    ["Personal Info", "/profile?tab=personal"]
                  ].map(([label, path]) => (
                    <Link
                      key={label}
                      to={path}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2.5 text-[11px] text-gray-700 hover:bg-gray-50 hover:text-[#800000] border-b border-gray-50/50 last:border-0"
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-[11px] text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-colors font-semibold cursor-pointer border-t border-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Trigger using animated Sheet drawer */}
            <Sheet open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  className="relative text-gray-600 hover:text-[#800000] transition-colors shrink-0 cursor-pointer"
                >
                  <ShoppingCart size={19} strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none" style={SANS}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-white" style={SANS}>
                <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between">
                  <SheetTitle className="text-md uppercase tracking-wider" style={CINZEL}>Shopping Cart</SheetTitle>
                </SheetHeader>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingCart size={40} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm" style={SANS}>Your cart is currently empty.</p>
                      <button
                        onClick={() => {
                          setCartDrawerOpen(false);
                          navigate("/shop");
                        }}
                        className="mt-4 bg-[#D4AF37] text-black text-xs px-6 py-2.5 font-bold uppercase tracking-wider hover:bg-[#800000] hover:text-white transition-all rounded-lg cursor-pointer"
                      >
                        Browse Perfumes
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={`${item.productId}-${item.size}`} className="flex gap-3 border-b border-gray-50 pb-4">
                          <div className="w-16 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                            <img src={item.img || prod?.img || perfume50ml} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-xs text-gray-900 truncate leading-snug">{item.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.size}</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.productId, item.size)}
                                className="text-gray-300 hover:text-red-500 cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-gray-200 rounded-md scale-90 origin-left">
                                <button
                                  onClick={() => updateQty(item.productId, item.size, -1)}
                                  className="px-1.5 py-0.5 text-gray-500 hover:text-[#800000] cursor-pointer"
                                >
                                  <Minus size={9} />
                                </button>
                                <span className="text-xs w-6 text-center">{item.qty}</span>
                                <button
                                  onClick={() => updateQty(item.productId, item.size, 1)}
                                  className="px-1.5 py-0.5 text-gray-500 hover:text-[#800000] cursor-pointer"
                                >
                                  <Plus size={9} />
                                </button>
                              </div>
                              <span className="text-xs font-bold text-[#800000]">
                                Rs. {(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Subtotal and checkout action */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-[#800000]">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                      Shipping, taxes, and discounts are calculated during checkout.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setCartDrawerOpen(false);
                          navigate("/cart");
                        }}
                        className="w-full border border-gray-300 text-gray-700 py-3 text-xs font-bold uppercase tracking-wider hover:border-black hover:text-black transition-all bg-white rounded-lg cursor-pointer"
                      >
                        View Full Cart
                      </button>
                      <button
                        onClick={() => {
                          setCartDrawerOpen(false);
                          navigate("/checkout");
                        }}
                        className="w-full bg-[#800000] text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black transition-all rounded-lg cursor-pointer"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

          </div>
        </div>
      </nav>
    </div>
  );
}
