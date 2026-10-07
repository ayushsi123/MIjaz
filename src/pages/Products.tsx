import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { NOTES } from "../data/products";
import { useCart } from "../hooks/useCart";
import { ProductCard } from "../components/ProductCard";
import { SlidersHorizontal, Search, RotateCcw, ChevronDown, Check } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const products = useCart((state) => state.products);

  // Active filters from URL query parameters
  const activeCategory = searchParams.get("category") || "";
  const activeGender = searchParams.get("gender") || "";
  const activeNote = searchParams.get("note") || "";
  const activeSort = searchParams.get("sort") || "popular";

  // Category mapping: map URL parameters like "Perfume Spray" or "Perfume" to data category
  const getMappedCategory = (param: string) => {
    if (!param) return "";
    if (param.toLowerCase().includes("spray") || param.toLowerCase() === "perfume" || param.toLowerCase() === "perfumes") return "Perfume";
    if (param.toLowerCase().includes("oil")) return "Oil";
    return param;
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Maintain search query if exists
    if (searchQuery) newParams.set("search", searchQuery);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search
    const searchVal = (searchParams.get("search") || "").toLowerCase().trim();
    if (searchVal) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchVal) ||
          p.notes.some((n) => n.toLowerCase().includes(searchVal)) ||
          p.description.toLowerCase().includes(searchVal)
      );
    }

    // 2. Category Filter
    const catVal = getMappedCategory(activeCategory);
    if (catVal) {
      result = result.filter((p) => p.category === catVal);
    }

    // 3. Gender Filter
    if (activeGender) {
      result = result.filter((p) => p.gender === activeGender);
    }

    // 4. Scent Note Filter
    if (activeNote) {
      result = result.filter((p) => p.notes.includes(activeNote));
    }

    // 5. Sorting
    if (activeSort === "price-low") {
      result.sort((a, b) => {
        const aPrice = Object.values(a.salePrices)[0];
        const bPrice = Object.values(b.salePrices)[0];
        return aPrice - bPrice;
      });
    } else if (activeSort === "price-high") {
      result.sort((a, b) => {
        const aPrice = Object.values(a.salePrices)[0];
        const bPrice = Object.values(b.salePrices)[0];
        return bPrice - aPrice;
      });
    } else if (activeSort === "rating") {
      // Mock sorting: higher IDs are newer/more popular
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [searchParams, activeCategory, activeGender, activeNote, activeSort]);

  const hasActiveFilters = activeCategory || activeGender || activeNote || searchParams.get("search");

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10" style={SANS}>
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-10 pt-4">
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-3 tracking-wide" style={CINZEL}>
            The Fragrance Library
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Browse our curated collection of luxury extraits de parfum and high-concentration oils, crafted for timeless presence.
          </p>
        </div>
        {/* Scent Profile Filter Bar */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs mb-8">
          <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.25em] font-bold text-center mb-3.5" style={CINZEL}>Shop by Scent Profile</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
            {NOTES.map((note) => {
              const isSelected = activeNote === note;
              return (
                <button
                  key={note}
                  onClick={() => handleFilterChange("note", isSelected ? "" : note)}
                  className={`py-1.5 px-3.5 border text-xs rounded-full transition-all text-center cursor-pointer ${
                    isSelected 
                      ? "border-[#800000] bg-[#800000] text-white shadow-xs font-semibold"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#800000] hover:text-[#800000] hover:bg-white"
                  }`}
                  style={SANS}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFilterChange("search", searchQuery);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleFilterChange("search", "");
                }}
                className="absolute right-3 top-2 text-[10px] text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Info & Actions */}
          <div className="flex gap-3 w-full md:w-auto justify-between md:justify-end items-center">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold hover:border-black cursor-pointer bg-white"
            >
              <SlidersHorizontal size={13} /> Filters
            </button>

            <span className="text-xs text-gray-500 font-medium">
              Showing {filteredProducts.length} Fragrances
            </span>

            {/* Sorting Dropdown */}
            <div className="relative flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-lg bg-white">
              <span className="text-[11px] text-gray-400">Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="text-xs font-semibold text-gray-800 outline-hidden bg-transparent border-none pr-4 cursor-pointer"
              >
                <option value="popular">Bestsellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center mb-8">
            <span className="text-xs text-gray-400 font-medium">Active Filters:</span>
            {activeCategory && (
              <span className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] text-gray-700 flex items-center gap-1.5 shadow-2xs">
                Category: {getMappedCategory(activeCategory) === "Perfume" ? "Spray" : "Oil"}
                <button onClick={() => handleFilterChange("category", "")} className="text-gray-400 hover:text-black font-bold">×</button>
              </span>
            )}
            {activeGender && (
              <span className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] text-gray-700 flex items-center gap-1.5 shadow-2xs">
                Gender: {activeGender}
                <button onClick={() => handleFilterChange("gender", "")} className="text-gray-400 hover:text-black font-bold">×</button>
              </span>
            )}
            {activeNote && (
              <span className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] text-gray-700 flex items-center gap-1.5 shadow-2xs">
                Note: {activeNote}
                <button onClick={() => handleFilterChange("note", "")} className="text-gray-400 hover:text-black font-bold">×</button>
              </span>
            )}
            {searchParams.get("search") && (
              <span className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] text-gray-700 flex items-center gap-1.5 shadow-2xs">
                Keyword: "{searchParams.get("search")}"
                <button onClick={() => { setSearchQuery(""); handleFilterChange("search", ""); }} className="text-gray-400 hover:text-black font-bold">×</button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[#800000] text-xs font-semibold hover:text-[#D4AF37] flex items-center gap-1 ml-2 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} /> Reset All
            </button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="flex gap-8">
          {/* Left Sidebar Filter Section (Desktop only) */}
          <aside className="w-60 shrink-0 hidden lg:block space-y-6">
            {/* Category Filter */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-2xs">
              <h3 className="text-xs text-[#800000] font-bold uppercase tracking-wider mb-4" style={CINZEL}>Category</h3>
              <div className="space-y-2">
                {[
                  { label: "All Products", val: "" },
                  { label: "Perfume Sprays", val: "Perfume" },
                  { label: "Concentrated Oils", val: "Oil" }
                ].map((c) => (
                  <button
                    key={c.label}
                    onClick={() => handleFilterChange("category", c.val)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex justify-between items-center transition-all ${
                      getMappedCategory(activeCategory) === c.val
                        ? "bg-[#800000]/5 text-[#800000] font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    {c.label}
                    {getMappedCategory(activeCategory) === c.val && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-2xs">
              <h3 className="text-xs text-[#800000] font-bold uppercase tracking-wider mb-4" style={CINZEL}>Scent Gender</h3>
              <div className="space-y-2">
                {[
                  { label: "All Genders", val: "" },
                  { label: "Men's Picks", val: "Men" },
                  { label: "Women's Picks", val: "Women" },
                  { label: "Unisex Blends", val: "Unisex" }
                ].map((g) => (
                  <button
                    key={g.label}
                    onClick={() => handleFilterChange("gender", g.val)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex justify-between items-center transition-all ${
                      activeGender === g.val
                        ? "bg-[#800000]/5 text-[#800000] font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    {g.label}
                    {activeGender === g.val && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Scent Profile Notes */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-2xs">
              <h3 className="text-xs text-[#800000] font-bold uppercase tracking-wider mb-4" style={CINZEL}>Olfactory Profile</h3>
              <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                <button
                  onClick={() => handleFilterChange("note", "")}
                  className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                    !activeNote
                      ? "border-[#800000] bg-[#800000]/5 text-[#800000] font-semibold"
                      : "border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  All Notes
                </button>
                {NOTES.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleFilterChange("note", n)}
                    className={`text-[10px] px-2.5 py-1 rounded-md border transition-all ${
                      activeNote === n
                        ? "border-[#800000] bg-[#800000]/5 text-[#800000] font-semibold"
                        : "border-gray-200 text-gray-500 hover:border-[#D4AF37]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl p-20 text-center shadow-xs">
                <SlidersHorizontal size={40} className="text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Fragrances Found</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  We couldn't find any match. Try adjusting your filters or search keywords.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-[#800000] text-white text-xs px-6 py-2.5 font-bold uppercase tracking-wider rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Slide-in filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-80 max-w-full bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                <h2 className="font-bold text-sm uppercase tracking-wider" style={CINZEL}>Filter Library</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-black text-lg font-bold"
                >
                  ×
                </button>
              </div>

              {/* Mobile Filter Category */}
              <div className="mb-6">
                <h3 className="text-xs text-[#800000] font-bold uppercase tracking-wider mb-3" style={CINZEL}>Category</h3>
                <div className="space-y-1.5">
                  {[
                    { label: "All Products", val: "" },
                    { label: "Perfume Sprays", val: "Perfume" },
                    { label: "Concentrated Oils", val: "Oil" }
                  ].map((c) => (
                    <button
                      key={c.label}
                      onClick={() => handleFilterChange("category", c.val)}
                      className={`w-full text-left text-xs py-2 px-3 rounded-lg flex justify-between items-center transition-all ${
                        getMappedCategory(activeCategory) === c.val
                          ? "bg-[#800000]/5 text-[#800000] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      {c.label}
                      {getMappedCategory(activeCategory) === c.val && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Filter Gender */}
              <div className="mb-6">
                <h3 className="text-xs text-[#800000] font-bold uppercase tracking-wider mb-3" style={CINZEL}>Gender</h3>
                <div className="space-y-1.5">
                  {[
                    { label: "All Genders", val: "" },
                    { label: "Men's Picks", val: "Men" },
                    { label: "Women's Picks", val: "Women" },
                    { label: "Unisex Blends", val: "Unisex" }
                  ].map((g) => (
                    <button
                      key={g.label}
                      onClick={() => handleFilterChange("gender", g.val)}
                      className={`w-full text-left text-xs py-2 px-3 rounded-lg flex justify-between items-center transition-all ${
                        activeGender === g.val
                          ? "bg-[#800000]/5 text-[#800000] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      {g.label}
                      {activeGender === g.val && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Filter Notes */}
              <div className="mb-6">
                <h3 className="text-xs text-[#800000] font-bold uppercase tracking-wider mb-3" style={CINZEL}>Notes</h3>
                <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto">
                  <button
                    onClick={() => handleFilterChange("note", "")}
                    className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                      !activeNote
                        ? "border-[#800000] bg-[#800000]/5 text-[#800000] font-semibold"
                        : "border-gray-200 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    All Notes
                  </button>
                  {NOTES.map((n) => (
                    <button
                      key={n}
                      onClick={() => handleFilterChange("note", n)}
                      className={`text-[10px] px-2.5 py-1 rounded-md border transition-all ${
                        activeNote === n
                          ? "border-[#800000] bg-[#800000]/5 text-[#800000] font-semibold"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-[#800000] text-white py-3 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
