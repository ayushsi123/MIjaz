import { useState, useEffect, useRef } from "react";
import { useCart } from "../hooks/useCart";
import { 
  X, 
  Phone, 
  Mail, 
  ChevronRight, 
  RefreshCw, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck 
} from "lucide-react";
import brandLogo from "../imports/logo.png";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { formatAuthError, syncUserProfileWithFirestore } from "../lib/authService";
import { toast } from "sonner";

const SANS = { fontFamily: "'DM Sans', sans-serif" } as const;
const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const loginStore = useCart((state) => state.login);
  const setUserSession = useCart((state) => state.setUserSession);

  // Modal navigation
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<"choice" | "phone" | "otp" | "email" | "forgot">("choice");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone Auth Confirmation Result
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // OTP Countdown Timer
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Reset states when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setSuccess("");
      setIsLoading(false);
      setMethod("choice");
      setOtpCode("");
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {
          // ignore
        }
        (window as any).recaptchaVerifier = null;
      }
    }
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (method === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [method, timer]);

  // Focus OTP input when transitioning to OTP view
  useEffect(() => {
    if (method === "otp") {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [method]);

  if (!isOpen) return null;

  const handleBackToChoice = () => {
    setMethod("choice");
    setError("");
    setSuccess("");
    setIsLoading(false);
  };

  // Helper to cleanup and get fresh reCAPTCHA
  const initRecaptchaVerifier = () => {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      (window as any).recaptchaVerifier = null;
    }

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        setError("reCAPTCHA expired. Please try sending OTP again.");
      }
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  // 1. GOOGLE AUTHENTICATION FLOW
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setLoadingText("Connecting with Google...");
    setError("");
    setSuccess("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const profile = await syncUserProfileWithFirestore(user);
      setUserSession(profile);
      loginStore(profile.name, profile.email, profile.phone, user.uid);

      toast.success(`Welcome ${profile.name || "back"}!`);
      setSuccess(`Signed in as ${profile.email}`);

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(formatAuthError(err));
      }
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  // 2. SEND PHONE OTP FLOW
  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name");
      return;
    }

    setIsLoading(true);
    setLoadingText("Sending SMS OTP to your phone...");
    setError("");
    setSuccess("");

    try {
      const verifier = initRecaptchaVerifier();
      const formattedPhone = `+91${cleanPhone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);

      setConfirmationResult(confirmation);
      setMethod("otp");
      setTimer(60);
      setSuccess(`OTP sent to +91 ${cleanPhone}`);
      toast.success("Verification code sent to your phone");
    } catch (err: any) {
      console.error("Phone OTP send error:", err);
      setError(formatAuthError(err));
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  // 3. RESEND PHONE OTP
  const handleResendPhoneOTP = async () => {
    if (timer > 0) return;
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) return;

    setIsLoading(true);
    setLoadingText("Resending SMS OTP...");
    setError("");

    try {
      const verifier = initRecaptchaVerifier();
      const formattedPhone = `+91${cleanPhone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setTimer(60);
      setSuccess("A fresh OTP code has been sent!");
      toast.success("New OTP sent via SMS");
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  // 4. VERIFY OTP FLOW
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP code.");
      setMethod("phone");
      return;
    }

    setIsLoading(true);
    setLoadingText("Verifying security code...");
    setError("");
    setSuccess("");

    try {
      const result = await confirmationResult.confirm(cleanCode);
      const user = result.user;

      if (name.trim()) {
        try {
          await updateProfile(user, { displayName: name.trim() });
        } catch (e) {
          console.warn("Could not set display name on phone user:", e);
        }
      }

      const cleanPhone = `+91 ${phoneNumber.replace(/\D/g, "")}`;
      const profile = await syncUserProfileWithFirestore(user, {
        name: name.trim() || undefined,
        phone: cleanPhone,
        email: email.trim() || undefined
      });

      setUserSession(profile);
      loginStore(profile.name, profile.email, profile.phone, user.uid);

      toast.success(mode === "login" ? "Successfully logged in!" : "Welcome to Mijaz Luxury!");
      setSuccess("Phone number verified successfully!");

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("OTP confirmation error:", err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  // 5. EMAIL & PASSWORD AUTH FLOW (LOGIN & SIGNUP)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
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
    setLoadingText(mode === "login" ? "Signing into Mijaz..." : "Creating your luxury account...");
    setError("");
    setSuccess("");

    try {
      if (mode === "signup") {
        // Create user with email and password
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = result.user;

        // Set user display name
        if (name.trim()) {
          await updateProfile(user, { displayName: name.trim() });
        }

        const cleanPhone = phoneNumber ? `+91 ${phoneNumber.replace(/\D/g, "")}` : "";
        const profile = await syncUserProfileWithFirestore(user, {
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail
        });

        setUserSession(profile);
        loginStore(profile.name, profile.email, profile.phone, user.uid);

        toast.success("Account created successfully!");
        setSuccess("Welcome to Mijaz! Account created.");
      } else {
        // Sign in existing user
        const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = result.user;

        const profile = await syncUserProfileWithFirestore(user);
        setUserSession(profile);
        loginStore(profile.name, profile.email, profile.phone, user.uid);

        toast.success(`Welcome back, ${profile.name || "Customer"}!`);
        setSuccess("Signed in successfully!");
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Email auth error:", err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  // 6. FORGOT PASSWORD FLOW
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter the email address associated with your account");
      return;
    }

    setIsLoading(true);
    setLoadingText("Sending reset link...");
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccess(`Password reset instructions have been dispatched to ${cleanEmail}. Check your inbox!`);
      toast.success("Password reset email sent");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      {/* Hidden container for Firebase invisible RecaptchaVerifier */}
      <div id="recaptcha-container"></div>

      <div 
        className="relative bg-[#FAF8F4] w-full max-w-[440px] rounded-2xl shadow-2xl border border-gray-150 overflow-hidden flex flex-col p-6 md:p-8"
        style={SANS}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Top Branding Logo */}
        <div className="flex flex-col items-center mb-6 mt-1">
          <img src={brandLogo} alt="Mijaz Logo" className="h-12 w-auto object-contain mb-2" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#800000] font-bold" style={CINZEL}>
            {mode === "login" ? "Authenticating Luxury" : "Register with Mijaz"}
          </p>
          <div className="w-12 h-0.5 bg-[#D4AF37]/40 mt-1 rounded-full" />
        </div>

        {/* Toast Alerts in Modal */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
            <span className="leading-snug">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 font-medium">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-snug">{success}</span>
          </div>
        )}

        {/* Mode Selector (Sign In / Create Account) - Visible on Choice, Email & Phone steps */}
        {(method === "choice" || method === "email" || method === "phone") && (
          <div className="flex bg-gray-200/70 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
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
                setError("");
                setSuccess("");
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

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="py-14 flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <RefreshCw className="animate-spin text-[#800000]" size={32} />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck size={14} className="text-[#D4AF37]" />
              </div>
            </div>
            <p className="text-xs text-gray-700 tracking-wide font-semibold text-center">{loadingText || "Processing security request..."}</p>
            <p className="text-[10px] text-gray-400 mt-1">Securing connection with Mijaz Fragrances</p>
          </div>
        ) : (
          <>
            {/* METHOD CHOICE BLOCK */}
            {method === "choice" && (
              <div className="space-y-3">
                {/* Google Auth Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full h-11 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors text-xs font-semibold text-gray-700 shadow-2xs hover:shadow-sm cursor-pointer"
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
                  type="button"
                  onClick={() => {
                    setMethod("phone");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full h-11 bg-[#111111] hover:bg-[#800000] text-white rounded-xl flex items-center justify-center gap-2.5 transition-colors text-xs font-semibold shadow-2xs hover:shadow-sm cursor-pointer"
                >
                  <Phone size={14} />
                  {mode === "login" ? "Login with Phone OTP" : "Sign Up with Phone OTP"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4 select-none">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Email Selector link */}
                <button
                  type="button"
                  onClick={() => {
                    setMethod("email");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full h-11 border border-dashed border-gray-300 rounded-xl hover:border-gray-500 bg-white/50 hover:bg-white flex items-center justify-center gap-2.5 transition-colors text-xs text-gray-600 font-semibold cursor-pointer"
                >
                  <Mail size={14} className="text-gray-400" />
                  Continue with Email & Password
                </button>

                <p className="text-[10px] text-gray-400 text-center pt-2 leading-relaxed">
                  By continuing, you agree to Mijaz Fragrances Terms of Service and Privacy Policy.
                </p>
              </div>
            )}

            {/* PHONE NUMBER STEP */}
            {method === "phone" && (
              <form onSubmit={handleSendPhoneOTP} className="space-y-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {mode === "login" ? "Enter your phone number" : "Create account with mobile"}
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToChoice}
                    className="text-[11px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    All Options
                  </button>
                </div>

                {mode === "signup" && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sameer Sheikh"
                        className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sameer@example.com"
                        className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">10-Digit Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none pr-2 border-r border-gray-200">
                      <span className="text-xs">🇮🇳</span>
                      <span className="text-xs font-bold text-gray-700">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full h-11 pl-20 pr-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden tracking-wider font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">We'll send a 6-digit SMS verification code to this number.</p>
                </div>

                <button
                  type="submit"
                  disabled={phoneNumber.length !== 10}
                  className={`w-full h-11 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                    phoneNumber.length === 10
                      ? "bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Send Verification Code
                  <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* OTP VERIFICATION STEP */}
            {method === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-1">
                  <div className="w-12 h-12 rounded-full bg-[#800000]/10 flex items-center justify-center mx-auto mb-2 text-[#800000]">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900" style={CINZEL}>Enter Verification Code</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Code sent to <span className="font-semibold text-gray-900">+91 {phoneNumber}</span>
                  </p>
                </div>

                <div>
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full h-12 text-center bg-white border-2 border-gray-300 rounded-xl text-xl font-mono font-bold tracking-[0.5em] text-gray-900 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden shadow-inner"
                  />
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">Enter the 6-digit code received via SMS</p>
                </div>

                <button
                  type="submit"
                  disabled={otpCode.length !== 6}
                  className={`w-full h-11 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                    otpCode.length === 6
                      ? "bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Verify & Sign In
                  <ChevronRight size={14} />
                </button>

                <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                  <span>
                    {timer > 0 ? (
                      <span className="text-gray-400">Resend code in <strong className="text-gray-700">{timer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendPhoneOTP}
                        className="text-[#800000] font-bold hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("phone");
                      setError("");
                      setSuccess("");
                    }}
                    className="font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
                  >
                    Edit Phone Number
                  </button>
                </div>
              </form>
            )}

            {/* EMAIL & PASSWORD STEP */}
            {method === "email" && (
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {mode === "login" ? "Sign In with Email" : "Create Account with Email"}
                  </span>
                  <button
                    type="button"
                    onClick={handleBackToChoice}
                    className="text-[11px] text-gray-400 hover:text-[#800000] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    All Options
                  </button>
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Farhan Ali"
                      className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Mobile Number (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 select-none">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="98765 43210"
                        className="w-full h-10 pl-12 pr-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMethod("forgot");
                          setError("");
                          setSuccess("");
                        }}
                        className="text-[10px] font-semibold text-[#800000] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "Min. 6 characters" : "Enter your password"}
                      className="w-full h-10 pl-3.5 pr-10 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 mt-1 bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  {mode === "login" ? "Sign In to Mijaz" : "Create Luxury Account"}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD STEP */}
            {method === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-[#800000]/10 flex items-center justify-center mx-auto mb-2 text-[#800000]">
                    <KeyRound size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900" style={CINZEL}>Reset Your Password</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Enter the email registered with your Mijaz account. We will send you instructions to securely reset your password.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 px-3.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#800000] hover:bg-[#D4AF37] hover:text-black text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod("email");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-900 font-semibold mt-2 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  Back to Sign In
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
