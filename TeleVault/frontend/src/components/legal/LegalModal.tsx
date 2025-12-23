import React from 'react';
import { X, ShieldCheck, FileText, Lock, Globe, CheckCircle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#0d131f] border border-cyan-500/30 shadow-2xl shadow-cyan-950/70 flex flex-col text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            {type === 'privacy' ? (
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-white">
                {type === 'privacy' ? 'Zero-Knowledge Privacy Policy' : 'Terms of Service & Usage'}
              </h2>
              <p className="text-xs text-slate-400">Effective Date: September 2026 • Version 1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm leading-relaxed text-slate-300">
          {type === 'privacy' ? (
            <>
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> The Zero-Knowledge Guarantee
                </div>
                <p className="text-xs text-slate-300">
                  TeleVault is built with a mathematically verifiable Zero-Knowledge architecture. Your files, folder names, and cryptographic keys never leave your device in plaintext. All encryption (AES-256-GCM) occurs client-side using a key derived from your Master Password via PBKDF2/Argon2id.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">1. No Data Collection or Telemetry</h3>
                <p>
                  TeleVault does not run user-tracking scripts, analytics beacons, or remote telemetry. We do not maintain any central servers or databases containing your personal information, IP address, browsing behavior, or file catalogs.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">2. Local Storage of Credentials</h3>
                <p>
                  Your Telegram API credentials (`api_id`, `api_hash`), phone number, and Telegram MTProto session strings are stored strictly on your local device within protected storage. TeleVault developers have zero technical means to access or view your Telegram sessions.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">3. Storage on Telegram Infrastructure</h3>
                <p>
                  Files uploaded via TeleVault are transmitted directly from your device to Telegram MTProto data centers. Because all data is encrypted before transmission:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-slate-400">
                  <li>Telegram servers only receive randomized, encrypted binary byte chunks.</li>
                  <li>Telegram cannot identify file contents, media previews, or real filenames.</li>
                  <li>In the event of a subpoena or server breach at Telegram, your data remains indecipherable ciphertext without your local Master Password.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">4. Your Responsibility for Master Passwords</h3>
                <p>
                  Because TeleVault does not hold your decryption keys, <strong>password recovery is impossible</strong>. If you lose or forget your Master Password, your encrypted files cannot be decrypted by anyone.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" /> Third-Party Client Terms
                </div>
                <p className="text-xs text-slate-300">
                  TeleVault is an open client tool utilizing Telegram's official MTProto protocol. By using TeleVault, you agree to comply with all applicable local laws and Telegram's Terms of Service.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">1. Fair Use & Rate Limits</h3>
                <p>
                  TeleVault provides automated chunking and transfer management. You agree not to abuse Telegram's network infrastructure, circumvent Telegram rate limits, or engage in automated mass spamming. The app includes built-in backoff algorithms to prevent flood-wait penalties.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">2. Prohibited Content</h3>
                <p>
                  You may not use TeleVault to store, distribute, or back up illegal material, copyrighted content without authorization, malicious software, or content violating Telegram's Acceptable Use Policy.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">3. Warranty Disclaimer</h3>
                <p>
                  TeleVault is provided "AS IS", without warranties of any kind, either express or implied. While the software uses industry-standard cryptographic algorithms (AES-256-GCM, PBKDF2), the authors and contributors are not liable for any data loss, account restriction, or loss of encryption keys.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">4. Intellectual Property & Independence</h3>
                <p>
                  TeleVault is an independent open-source project and is not affiliated with, sponsored by, or endorsed by Telegram FZ-LLC.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Understood & Acknowledged
          </button>
        </div>
      </div>
    </div>
  );
};
