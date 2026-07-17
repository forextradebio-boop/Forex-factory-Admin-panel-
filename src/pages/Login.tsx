import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Eye, EyeOff, KeyRound, ShieldAlert, Sparkles, LogIn } from "lucide-react";

export const Login: React.FC = () => {
  const { login, verifyOtp } = useAuth();
  const [email, setEmail] = useState("admin@trading.com");
  const [password, setPassword] = useState("admin123");
  const [rememberMe, setRememberMe] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP flow state
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // First attempt standard login
      await login(email, password, rememberMe);
      
      // If we made it here without error, trigger second-factor OTP prompt (simulate real secure trading API)
      setRequiresOtp(true);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Hint: use admin@trading.com / admin123");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setLoading(true);

    try {
      const success = await verifyOtp(otpCode);
      if (success) {
        // Auth is fully complete now, trigger browser reload to load the main app state
        window.location.href = "/";
      }
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP code. Try entering '123456'");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="w-full max-w-md border border-slate-800 bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl relative z-10 p-8">
        
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4 animate-bounce">
            <KeyRound size={24} className="text-slate-950" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">AURA ENTERPRISE</h2>
          <p className="text-xs text-slate-400 mt-1">Admin Operations Control Panel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {!requiresOtp ? (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Admin Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trading.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-800 bg-slate-950/40 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-lg border border-slate-800 bg-slate-950/40 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950/40"
                />
                Remember login session
              </label>
              <button
                type="button"
                onClick={() => alert("Contact System Engineer or check admin.service.ts fallback config.")}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs tracking-wide shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn size={14} />
              {loading ? "Authenticating security..." : "Sign in to Dashboard"}
            </button>

            <div className="pt-4 border-t border-slate-800/60 text-center">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Protected and encrypted system. Fallback credentials provided on failure.
              </p>
            </div>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2 mb-2">
              <Sparkles size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Security Multi-Factor Authenticator</p>
                <p className="mt-0.5 text-slate-300 leading-normal">Enter the 6-digit OTP code sent to your authenticator app. (Demo OTP is <b>123456</b>)</p>
              </div>
            </div>

            {otpError && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {otpError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="0 0 0 0 0 0"
                className="w-full text-center py-3 text-lg font-mono tracking-[0.5em] rounded-lg border border-slate-800 bg-slate-950/40 text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequiresOtp(false)}
                className="flex-1 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
              >
                Back to credentials
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Confirm Verification"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
