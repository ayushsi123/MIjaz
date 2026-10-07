import { Link } from "react-router-dom";
import notFoundImg from "../imports/not-found.jpg";
import { ArrowLeft, Home } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function NotFound() {
  return (
    <div className="bg-[#FAF8F4] min-h-[calc(100vh-100px)] py-16 flex items-center" style={SANS}>
      <div className="max-w-md mx-auto px-6 text-center">
        
        {/* Image Display */}
        <div className="relative w-72 h-72 mx-auto mb-8 rounded-2xl overflow-hidden shadow-md border border-gray-150">
          <img 
            src={notFoundImg} 
            alt="404 Not Found Illustration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-normal text-gray-900 mb-3 tracking-wide" style={CINZEL}>
          Page Not Found
        </h1>
        
        <p className="text-gray-500 text-xs leading-relaxed mb-8 max-w-sm mx-auto">
          The fragrance path you are trying to explore does not exist or has been relocated to another section of the salon library.
        </p>

        {/* Action Controls */}
        <Link
          to="/"
          className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] text-white hover:text-black font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home size={12} /> Return to Homepage
        </Link>

      </div>
    </div>
  );
}
