import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Access</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[#800000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[#800000]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#800000] text-white py-3 px-4 hover:bg-[#5a0000] transition-colors uppercase tracking-widest text-sm font-bold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
