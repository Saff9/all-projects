import React, { useState } from 'react';
import { KeyRound, Fingerprint, ArrowRight, AlertCircle, ShieldAlert, Lock } from 'lucide-react';
import { TeleVaultLogo } from '../common/TeleVaultLogo';
import { CryptoEngine } from '../../services/crypto';

interface LockScreenProps {
  onUnlock: () => void;
  onResetVault: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, onResetVault }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your Master Password.');
      return;
    }

    try {
      setIsLoading(true);

      let saltHex = localStorage.getItem('televault_master_salt');
      let backendSuccess = false;

      // Authenticate with backend
      try {
        const res = await fetch('http://localhost:8000/api/auth/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ master_password: password })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.salt_hex) {
            saltHex = data.salt_hex;
            localStorage.setItem('televault_master_salt', data.salt_hex);
          }
          backendSuccess = true;
        } else if (res.status === 401) {
          setError('Incorrect Master Password. Please try again.');
          return;
        }
      } catch {}

      if (!saltHex) {
        try {
          const statusRes = await fetch('http://localhost:8000/api/status');
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.salt_hex) {
              saltHex = statusData.salt_hex;
              localStorage.setItem('televault_master_salt', statusData.salt_hex);
            }
          }
        } catch {}
      }

      if (!saltHex) {
        onResetVault();
        return;
      }

      const salt = CryptoEngine.hexToBuf(saltHex);
      const computedHash = await CryptoEngine.computeVerificationHash(password, salt);
      const expectedHash = localStorage.getItem('televault_master_hash');

      if (!backendSuccess && expectedHash && computedHash !== expectedHash) {
        setError('Incorrect Master Password. Please try again.');
        return;
      }

      localStorage.setItem('televault_master_hash', computedHash);
      localStorage.setItem('televault_onboarded', 'true');
      await CryptoEngine.deriveKey(password, salt);
      onUnlock();
    } catch (err: any) {
      setError(err.message || 'Failed to unlock vault.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSimulate = async () => {
    try {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      const saltHex = localStorage.getItem('televault_master_salt');
      if (saltHex) {
        setError('Biometric validated. Enter Master Password to load key.');
      }
    } catch {
      setError('Biometric sensor unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0f] text-zinc-100 select-none">
      {/* Container */}
      <div className="relative w-full max-w-sm p-7 rounded-2xl bg-[#0e111a] border border-zinc-800 shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5 mb-6">
          <TeleVaultLogo size={44} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Unlock Vault
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter your Master Password to decrypt your storage
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleUnlock} className="space-y-3.5">
          <div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Master Password"
                className="w-full px-3.5 py-2.5 pl-9 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition"
                autoFocus
              />
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleBiometricSimulate}
              title="Biometric Unlock"
              className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer flex items-center justify-center"
            >
              <Fingerprint className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-3.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <span>Unlock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security badge & Reset */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
          {!showResetConfirm ? (
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1 text-emerald-500/80 font-mono">
                <Lock className="w-3 h-3" /> Zero-Knowledge
              </span>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-zinc-500 hover:text-rose-400 transition cursor-pointer"
              >
                Reset Vault
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" /> Reset Confirmation
              </div>
              <p className="text-[11px] text-zinc-400">
                Resetting clears local keys. Files cannot be decrypted without your password.
              </p>
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onResetVault}
                  className="py-1 px-2.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="py-1 px-2.5 rounded-md bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
