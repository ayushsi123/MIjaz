import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Product } from "../types";
import perfume50ml from "../imports/perfume-50ml.jpg";

// Font Styles
const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;

function Stars({ rating = 5, count = 0 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
          <polygon
            points="6,1 7.5,4.5 11,4.5 8.5,7 9.5,11 6,8.5 2.5,11 3.5,7 1,4.5 4.5,4.5"
            fill={i <= Math.floor(rating) ? "#D4AF37" : i - 0.5 <= rating ? "url(#half)" : "#E5E7EB"}
            stroke="none"
          />
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
        </svg>
      ))}
      <span className="text-[10px] text-gray-400 ml-1" style={SANS}>
        ({count})
      </span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCart((state) => state.addToCart);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  // Price range across all sizes (e.g. "Rs. 2,100 - 3,400")
  const saleValues = Object.values(product.salePrices);
  const minSale = Math.min(...saleValues);
  const maxSale = Math.max(...saleValues);
  const origValues = Object.values(product.prices);
  const maxOrig = Math.max(...origValues);
  
  const priceRange =
    minSale === maxSale
      ? `Rs. ${minSale.toLocaleString()}`
      : `Rs. ${minSale.toLocaleString()} - ${maxSale.toLocaleString()}`;

  const displayImage = product.img || perfume50ml;

  // Calculate real review stats
  const reviews = product.reviews || [];
  const count = reviews.length;
  const avgRating = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300" style={SANS}>
      {/* Image Area (portrait ratio 3:4) */}
      <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-[#f5f3f0] block cursor-pointer" style={{ aspectRatio: "3/4" }}>
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Sale Badge */}
        <div className="absolute top-3 left-0">
          <span className="bg-[#D4AF37] text-black text-[8px] font-bold px-2.5 py-1 tracking-widest uppercase rounded-r-md" style={SANS}>
            Sale
          </span>
        </div>

        {/* Badges (gender, occasion) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[8px] font-bold px-2 py-0.5 shadow-sm uppercase tracking-wide rounded-md">
            {product.gender}
          </span>
          {product.occasion && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-500 text-[8px] px-2 py-0.5 shadow-sm uppercase tracking-wide rounded-md">
              {product.occasion}
            </span>
          )}
        </div>
      </Link>

      {/* Product Details Area */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5">
        {/* Name */}
        <Link to={`/product/${product.id}`} className="hover:text-[#800000] transition-colors block cursor-pointer">
          <h3 className="text-[12px] font-semibold text-gray-900 leading-snug mb-1">
            {product.name}{" "}
            <span className="font-normal text-gray-500">
              | {product.category === "Oil" ? "Eau De Parfum Oil" : "Eau De Parfum"}
            </span>
          </h3>
        </Link>
        <p className="text-[10px] text-gray-400 italic line-clamp-1 mb-1.5 leading-tight">
          {product.description}
        </p>

        {/* Ratings */}
        <div className="flex items-center gap-1 mb-2">
          <Stars rating={avgRating} count={count} />
        </div>

        {/* Size Selection */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-2.5 py-0.5 text-[10px] border rounded-md transition-colors ${
                selectedSize === size
                  ? "border-[#800000] text-[#800000] bg-[#800000]/5 font-semibold"
                  : "border-gray-300 text-gray-500 hover:border-[#D4AF37]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Prices */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[12px] font-bold text-[#800000]">
            Rs. {product.salePrices[selectedSize]?.toLocaleString() || priceRange}
          </span>
          {product.prices[selectedSize] && product.salePrices[selectedSize] < product.prices[selectedSize] && (
            <span className="text-[10px] text-gray-400 line-through">
              Rs. {product.prices[selectedSize].toLocaleString()}
            </span>
          )}
        </div>

        {/* Scent notes */}
        <p className="text-[9px] text-gray-500 mb-3.5 leading-relaxed italic">
          {product.notes.join(" | ")}
        </p>

        {/* Add to Cart Trigger */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-200 mt-auto rounded-lg ${
            added
              ? "bg-green-600 text-white"
              : "bg-[#D4AF37] text-black hover:bg-[#800000] hover:text-white"
          }`}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
