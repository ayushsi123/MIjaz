import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRelatedProducts } from "../data/products";
import { useCart } from "../hooks/useCart";
import { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { ShoppingBag, ChevronRight, Award, Truck, ShieldCheck, Heart, Sparkles } from "lucide-react";
import perfume50ml from "../imports/perfume-50ml.jpg";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, products } = useCart();
  const product = products.find((p) => String(p.id) === String(id));

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"narrative" | "longevity" | "packaging">("narrative");
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const defaultReviews: any[] = [];
  
  const [reviews, setReviews] = useState(product?.reviews || defaultReviews);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      getRelatedProducts(product, products).then(setRelated);
      if (product.reviews) {
        setReviews(product.reviews);
      } else {
        setReviews(defaultReviews);
      }
    }
    // Scroll to top when product ID changes
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) {
    return (
      <div className="py-32 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF8F4]" style={SANS}>
        <h1 className="text-3xl font-bold text-gray-800 mb-4" style={CINZEL}>Fragrance Not Found</h1>
        <p className="text-gray-500 mb-8">The scent you are looking for does not exist in our library.</p>
        <Link to="/shop" className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-[#D4AF37] hover:text-black transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const displayImage = product.img || perfume50ml;

  const isOutOfStock = product.stock ? product.stock[selectedSize] <= 0 : false;

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;
    
    const newReview = { name: reviewName, rating: reviewRating, date: "Just now", comment: reviewText };
    const updatedReviews = [newReview, ...reviews];
    
    // Update local state
    setReviews(updatedReviews);
    
    // Update Firebase if it's a real Firebase product (string ID)
    if (typeof product.id === 'string') {
      try {
        await updateDoc(doc(db, "products", product.id), {
          reviews: updatedReviews
        });
      } catch (error) {
        console.error("Error updating reviews in Firebase", error);
      }
    }
    
    setReviewName("");
    setReviewText("");
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12" style={SANS}>
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-10">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-gray-600 truncate">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Left Column: Image Gallery (40% width) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-md">
                Extraits de Parfum
              </span>
            </div>
            
            {/* Auxiliary visual notes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                  <Award className="mx-auto text-[#D4AF37] mb-1.5" size={20} />
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">100% Pure</span>
                </div>
              </div>
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                  <Sparkles className="mx-auto text-[#D4AF37] mb-1.5" size={20} />
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">Long Wear</span>
                </div>
              </div>
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                  <Truck className="mx-auto text-[#D4AF37] mb-1.5" size={20} />
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">Gift Wrap</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Details (60% width) */}
          <div className="lg:col-span-7 flex flex-col">
            <div>
              {/* Scent Gender / Occasion */}
              <div className="flex gap-2 mb-3.5">
                <span className="bg-[#800000]/5 text-[#800000] text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                  {product.gender}
                </span>
                {product.occasion && (
                  <span className="bg-gray-200/50 text-gray-600 text-[9px] tracking-wider px-2.5 py-1 rounded-md uppercase">
                    {product.occasion}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl text-gray-900 mb-2 font-normal" style={CINZEL}>
                {product.name}
              </h1>
              <p className="text-sm text-gray-400 mb-6 italic">
                {product.category === "Oil" ? "Eau De Parfum Concentrated Oil" : "Eau De Parfum Natural Spray"}
              </p>

              {/* Scent Profile notes */}
              <div className="flex gap-2 items-center mb-6">
                <span className="text-xs text-gray-400">Olfactory notes:</span>
                <span className="text-xs font-semibold text-[#800000] tracking-wide">{product.notes.join(" · ")}</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-3xl font-bold text-[#800000]">
                  Rs. {product.salePrices[selectedSize]?.toLocaleString()}
                </span>
                {product.prices[selectedSize] > product.salePrices[selectedSize] && (
                  <span className="text-lg text-gray-400 line-through">
                    Rs. {product.prices[selectedSize].toLocaleString()}
                  </span>
                )}
                <span className={`text-xs font-semibold ml-2 px-2 py-0.5 rounded-md ${isOutOfStock ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>

              {/* Scent Variant Sizes */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select Size</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 border text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center min-w-20 ${
                        selectedSize === size
                          ? "border-[#800000] text-[#800000] bg-[#800000]/5 shadow-sm"
                          : "border-gray-200 bg-white text-gray-500 hover:border-[#D4AF37] hover:text-black"
                      }`}
                    >
                      <span>{size}</span>
                      <span className="text-[9px] font-normal text-gray-400 mt-0.5">
                        Rs. {product.salePrices[size]?.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex gap-3 mb-10">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : added
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-[#800000] text-white hover:bg-[#D4AF37] hover:text-black"
                  }`}
                >
                  <ShoppingBag size={14} />
                  {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart" : "Add to Cart"}
                </button>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`p-4 border rounded-lg transition-all flex items-center justify-center bg-white cursor-pointer ${
                    wishlisted
                      ? "border-red-200 text-red-500 bg-red-50"
                      : "border-gray-200 text-gray-400 hover:text-black hover:border-black"
                  }`}
                >
                  <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Guarantees list */}
              <div className="border-t border-b border-gray-150 py-4 flex justify-between text-[11px] text-gray-500 font-medium mb-8">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-600" /> Secure Checkout</span>
                <span className="flex items-center gap-1.5"><Truck size={14} className="text-[#800000]" /> Free Pan-India Delivery</span>
                <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#D4AF37]" /> Premium Card Box Packing</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {[
                  { id: "narrative", label: "Narrative" },
                  { id: "longevity", label: "Wear Guide" },
                  { id: "packaging", label: "Gifting Details" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-wider transition-colors border-b-2 text-center ${
                      activeTab === t.id
                        ? "border-[#800000] text-[#800000] bg-white"
                        : "border-transparent text-gray-400 hover:text-black"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-6 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {activeTab === "narrative" && (
                  <p>{product.narrative || ""}</p>
                )}
                {activeTab === "longevity" && (
                  <p>{product.wearGuide || ""}</p>
                )}
                {activeTab === "packaging" && (
                  <p>{product.giftingDetails || ""}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Reviews Section */}
        <section className="mb-20 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider" style={CINZEL}>Customer Reflections</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews list (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {reviews.map((r, i) => (
                <div key={i} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-xs text-gray-900">{r.name}</span>
                    <span className="text-[10px] text-gray-400">{r.date}</span>
                  </div>
                  {/* Star row */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <span key={si} className={`text-xs ${si < r.rating ? "text-[#D4AF37]" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>

            {/* Write a review form (5 cols) */}
            <div className="lg:col-span-5 bg-[#FAF8F4] p-5 rounded-xl border border-gray-150">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={CINZEL}>Add Scent Review</h3>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000]"
                  >
                    <option value={5}>5 Stars - Exquisite</option>
                    <option value={4}>4 Stars - High Quality</option>
                    <option value={3}>3 Stars - Decent</option>
                    <option value={2}>2 Stars - Weak Longevity</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs outline-hidden focus:border-[#800000] resize-none"
                    placeholder="Describe scent projection, dry-down, or longevity..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#800000] text-white py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related Products Grid */}
        {related.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <h2 className="text-2xl text-gray-900 font-normal" style={CINZEL}>Scent Recommendations</h2>
              <p className="text-xs text-gray-400 mt-1">Scent stories matching this fragrance profile</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
