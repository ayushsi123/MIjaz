import { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { X, Phone, Mail, ChevronRight, RefreshCw, MessageSquare } from "lucide-react";
import brandLogo from "../imports/logo.png";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const loginStore = useCart((state) => state.login);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<"choice" | "phone" | "otp" | "google-phone" | "email">("choice");
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  
  // Timer for OTP simulation
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer trigger
  useEffect(() => {
    let interval: any;
    if (method === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [method, timer]);

  if (!isOpen) return null;

  const handleBackToChoice = () => {
    setMethod("choice");
    setError("");
    setSuccess("");
  };

  // Google Login Flow simulation
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      if (mode === "signup") {
        // Sign Up via Google requires confirming/verifying phone number
        setMethod("google-phone");
        setName("Aisha Khan");
        setEmail("aisha.khan@gmail.com");
      } else {
        // Direct Login
        loginStore("Aisha Khan", "aisha.khan@google.com", "+91 98765 43210");
        setSuccess("Welcome back! Logged in with Google.");
        setTimeout(() => {
          onClose();
          handleBackToChoice();
        }, 1200);
      }
    }, 1000);
  };

  // Google Phone verification submit
  const handleGooglePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      setMethod("otp");
      setTimer(60);
      setSuccess("Verification OTP sent to +91 " + phoneNumber);
    }, 800);
  };

  // Send OTP Flow
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      setMethod("otp");
      setTimer(60);
      setSuccess("OTP sent successfully to +91 " + phoneNumber);
    }, 800);
  };

  // Verify OTP Flow
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234") {
      setError("Invalid OTP code. Use test code '1234'");
      return;
    }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      // Log in
      loginStore(
        name || "Mijaz Enthusiast",
        email || `user_${phoneNumber}@mijaz.com`,
        `+91 ${phoneNumber}`
      );
      setSuccess(mode === "login" ? "Successfully logged in!" : "Account created successfully!");
      setTimeout(() => {
        onClose();
        handleBackToChoice();
      }, 1200);
    }, 1000);
  };

  // Email login/signup
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name");
      return;
    }

    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      loginStore(
        mode === "signup" ? name : "Aisha Khan",
        email,
        "+91 98765 43210"
      );
      setSuccess(mode === "login" ? "Welcome back!" : "Account created successfully!");
      setTimeout(() => {
        onClose();
        handleBackToChoice();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div 
        className="relative bg-[#FAF8F4] w-full max-w-[440px] rounded-2xl shadow-2xl border border-gray-150 overflow-hidden flex flex-col p-6 md:p-8"
        style={SANS}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Branding Logo */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <img src={brandLogo} alt="Mijaz Logo" className="h-14 w-auto object-contain mb-2" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#800000] font-bold" style={CINZEL}>
            {mode === "login" ? "Authenticating Luxury" : "Register with Mijaz"}
          </p>
        </div>

        {/* Toast Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl text-center font-semibold">
            {success}
          </div>
        )}

        {/* Mode Selector (Login / Sign Up) - Only visible on Choice & Email steps */}
        {(method === "choice" || method === "email") && (
          <div className="flex bg-gray-100/80 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setMode("login");
                handleBackToChoice();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                handleBackToChoice();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-[#800000] mb-4" size={32} />
            <p className="text-xs text-gray-500 tracking-wide font-medium">Securing connection to Mijaz...</p>
          </div>
        ) : (
          <>
            {/* METHOD CHOICE BLOCK */}
            {method === "choice" && (
              <div className="space-y-3.5">
                {/* Google Auth Button */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full h-11 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {mode === "login" ? "Continue with Google" : "Sign Up with Google"}
                </button>

                {/* Phone Auth Button */}
                <button
                  onClick={() => setMethod("phone")}
                  className="w-full h-11 bg-[#111111] hover:bg-[#800000] text-white rounded-xl flex items-center justify-center gap-3 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <Phone size={14} />
                  {mode === "login" ? "Login with Phone Number" : "Sign Up with Phone Number"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6 select-none">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Email Selector link */}
                <button
                  onClick={() => setMethod("email")}
                  className="w-full h-11 border border-dashed border-gray-300 rounded-xl hover:border-gray-500 flex items-center justify-center gap-3 transition-colors text-xs text-gray-500 font-semibold cursor-pointer"
                >
                  <Mail size={14} />
                  Continue with Email & Password
                </button>
              </div>
            )}

            {/* PHONE NUMBER INPUT BLOCK */}
            {method === "phone" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aisha Khan"
                        className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aisha.khan@email.com"
                        className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 select-none">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full h-11 pl-12 pr-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Send OTP Code
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleBackToChoice}
                  className="w-full text-center text-[10px] text-gray-400 hover:text-[#800000] font-bold uppercase tracking-wider mt-2 block"
                >
                  Cancel & Back
                </button>
              </form>
            )}

            {/* GOOGLE SIGN UP - PHONE CONFIRMATION STEP */}
            {method === "google-phone" && (
              <form onSubmit={handleGooglePhoneSubmit} className="space-y-4">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150 mb-2">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Connected Google account: <strong className="text-[#800000]">aisha.khan@gmail.com</strong>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Please link a mobile phone number to finish setting up your account.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Confirm Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 select-none">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full h-11 pl-12 pr-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Verify Number (Get OTP)
                  <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* OTP VERIFICATION CODE BLOCK */}
            {method === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#800000]/5 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="text-[#800000]" size={20} />
                  </div>
                  <p className="text-xs text-gray-500">
                    We've sent a 4-digit verification code to your phone. Use test code <strong className="text-gray-900">1234</strong>.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1 text-center">Enter 4-Digit OTP</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{4}"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="E.g. 1234"
                    className="w-full h-11 text-center bg-white border border-gray-300 rounded-xl text-lg font-bold tracking-[0.4em] text-gray-800 focus:border-[#D4AF37] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                >
                  Confirm & Verify Scent
                </button>

                <div className="flex justify-between items-center text-[10px] text-gray-400 px-1 pt-2">
                  <span>
                    {timer > 0 ? `Resend OTP in ${timer}s` : (
                      <button
                        type="button"
                        onClick={() => {
                          setTimer(60);
                          setSuccess("OTP resent successfully!");
                        }}
                        className="text-[#800000] font-bold uppercase cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToChoice}
                    className="font-bold uppercase text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
              </form>
            )}

            {/* EMAIL CREDENTIALS INPUT BLOCK */}
            {method === "email" && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aisha Khan"
                      className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aisha.khan@email.com"
                    className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#D4AF37] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
                >
                  {mode === "login" ? "Sign In to Library" : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={handleBackToChoice}
                  className="w-full text-center text-[10px] text-gray-400 hover:text-[#800000] font-bold uppercase tracking-wider mt-2 block"
                >
                  Other Login Methods
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
