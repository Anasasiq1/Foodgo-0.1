import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (admin: { username: string; name: string; role: string }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid username or password.');
      }

      if (data.token) {
        localStorage.setItem('foodgo_admin_token', data.token);
      }

      onLoginSuccess(data.admin);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F5F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-[#EF2A39] px-8 pt-8 pb-7 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-3xl font-black italic tracking-wider text-white drop-shadow-xs">
              Foodgo
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold text-white mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Console</span>
            </div>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-[#322A2E]">
              Administrator Sign In
            </h2>
            <p className="text-xs text-[#8E8E93] mt-1">
              Enter your authorized server credentials to access system controls.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-[#322A2E] mb-1.5">
                Admin Username
              </label>
              <div className="relative flex items-center bg-[#F8F9FA] rounded-2xl border border-gray-200/90 focus-within:border-[#EF2A39] focus-within:bg-white transition-all">
                <User className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full py-3.5 pl-11 pr-4 text-sm font-semibold text-[#322A2E] bg-transparent outline-none"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#322A2E] mb-1.5">
                Master Password
              </label>
              <div className="relative flex items-center bg-[#F8F9FA] rounded-2xl border border-gray-200/90 focus-within:border-[#EF2A39] focus-within:bg-white transition-all">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="w-full py-3.5 pl-11 pr-11 text-sm font-semibold text-[#322A2E] bg-transparent outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#322A2E] hover:bg-[#201A1D] text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(50,42,46,0.25)] transition-transform active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Information Footer */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#8E8E93]">
            <span>Secured via Bcrypt & HTTP Sessions</span>
            <span className="font-semibold text-emerald-600">● Server Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
