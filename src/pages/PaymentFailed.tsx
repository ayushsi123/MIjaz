import { Link } from "react-router-dom";
import paymentFailedImg from "../imports/payment-failed.jpg";
import { AlertTriangle, ArrowLeft, RefreshCw, MessageSquare } from "lucide-react";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

export function PaymentFailed() {
  return (
    <div className="bg-[#FAF8F4] min-h-[calc(100vh-100px)] py-16 flex items-center" style={SANS}>
      <div className="max-w-md mx-auto px-6 text-center">
        
        {/* Image Display */}
        <div className="relative w-72 h-72 mx-auto mb-8 rounded-2xl overflow-hidden shadow-md border border-gray-150">
          <img 
            src={paymentFailedImg} 
            alt="Payment Failed Illustration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 right-4 bg-[#800000] text-white p-2 rounded-full shadow-lg">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-normal text-gray-900 mb-3 tracking-wide" style={CINZEL}>
          Payment Failed
        </h1>
        
        <p className="text-gray-500 text-xs leading-relaxed mb-8 max-w-sm mx-auto">
          We were unable to process your transaction. This can happen due to card verification issues, insufficient funds, or banking gateway timeouts. No money has been debited.
        </p>

        {/* Action Controls */}
        <div className="space-y-3">
          <Link
            to="/checkout"
            className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] text-white hover:text-black font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={12} /> Retry Checkout
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/"
              className="h-10 border border-gray-250 bg-white hover:border-[#800000] hover:text-[#800000] text-gray-600 font-bold uppercase text-[9px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={11} /> Go Home
            </Link>
            
            <a
              href="mailto:support@mijazluxury.com"
              className="h-10 border border-gray-250 bg-white hover:border-[#800000] hover:text-[#800000] text-gray-600 font-bold uppercase text-[9px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={11} /> Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
