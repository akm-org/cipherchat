import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';
import { generateSecureId } from '../utils/crypto';

interface AuthModalProps {
  onAccountCreated: (account: UserAccount, password: string) => void;
}

const RANDOM_NAMES = [
  'GhostProtocol', 'ShadowCipher', 'NeonSpecter', 'VortexNode',
  'AegisGuard', 'StealthOperative', 'ZeroEcho', 'SilentByte'
];

export const AuthModal: React.FC<AuthModalProps> = ({ onAccountCreated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomize = () => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setUsername(`${randomName}_${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please choose a username/alias');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Generate unique peer friend code: e.g. "cv_user_abc123"
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'node';
    const friendCode = `cv_${cleanUser}_${generateSecureId('', 6)}`;

    const newAccount: UserAccount = {
      id: generateSecureId('usr', 10),
      username: username.trim(),
      friendCode: friendCode,
      createdAt: Date.now(),
    };

    setTimeout(() => {
      onAccountCreated(newAccount, password);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl glow-border">
        {/* Header Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500/20 border border-emerald-400 rounded-full flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            CIPHER<span className="text-cyan-400">VAULT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Knowledge Ephemeral P2P Chat • No Cloud DB
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Username / Alias
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3" />
                Generate Alias
              </button>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Neo or Cipher_99"
              maxLength={24}
              required
              className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Vault Password <span className="text-[10px] text-slate-400 font-normal">(min 4 characters)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={4}
              required
              className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={4}
              required
              className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Security Features Callout */}
          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5">
            <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              HARDENED ARCHITECTURE
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>✓ Zero Cloud Database (100% Client-Side WebRTC)</div>
              <div>✓ 30-Minute Automatic Message Self-Destruct</div>
              <div>✓ Anti-Inspect & Anti-Export Lockout Active</div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-sm font-mono tracking-wide shadow-lg shadow-cyan-500/20 transition duration-200 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>GENERATING ENCRYPTED KEYS...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>INITIALIZE SECURE TERMINAL</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
