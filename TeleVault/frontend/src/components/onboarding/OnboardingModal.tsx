import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Bot,
  QrCode,
  Smartphone,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import QRCode from 'qrcode';
import { TeleVaultLogo } from '../common/TeleVaultLogo';
import { CryptoEngine } from '../../services/crypto';
import { TelegramService, DEFAULT_TELEGRAM_CLIENT } from '../../services/telegramService';
import { COUNTRIES, type Country } from '../../data/countries';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onOpenLegal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Master Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Step 2: Connection Method
  const [authTab, setAuthTab] = useState<'bot' | 'qr' | 'phone'>('bot');
  const [botToken, setBotToken] = useState('');
  const [botTargetChat, setBotTargetChat] = useState('');

  // QR Login State
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const qrPollingRef = useRef<number | null>(null);

  // Phone Login State
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0]
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [twoFA, setTwoFA] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tgError, setTgError] = useState('');

  // Advanced custom credentials
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customApiId, setCustomApiId] = useState('');
  const [customApiHash, setCustomApiHash] = useState('');

  // Step 3: Permissions & Terms
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [storagePerm, setStoragePerm] = useState(true);
  const [batteryPerm, setBatteryPerm] = useState(true);

  // Calculate Password Strength
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score <= 4) return { score: 3, label: 'Strong', color: 'bg-emerald-400' };
    return { score: 4, label: 'Excellent', color: 'bg-emerald-400' };
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Close country picker on outside click
  const handleClickOutside = (e: MouseEvent) => {
    if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
      setShowCountryPicker(false);
      setCountrySearch('');
    }
  };

  useEffect(() => {
    if (showCountryPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCountryPicker]);

  // QR Code Flow
  const initQRFlow = useCallback(async () => {
    setTgError('');
    setQrLoading(true);
    if (qrPollingRef.current) {
      clearInterval(qrPollingRef.current);
    }
    try {
      const apiId = customApiId.trim() ? parseInt(customApiId.trim(), 10) : DEFAULT_TELEGRAM_CLIENT.apiId;
      const apiHash = customApiHash.trim() || DEFAULT_TELEGRAM_CLIENT.apiHash;
      const res = await TelegramService.startQRLogin(apiId, apiHash);
      if (res.tokenUrl) {
        const dataUrl = await QRCode.toDataURL(res.tokenUrl, {
          width: 220,
          margin: 1,
          color: { dark: '#090a0f', light: '#ffffff' }
        });
        setQrImageUrl(dataUrl);

        const pollInterval = window.setInterval(async () => {
          try {
            const check = await TelegramService.waitQRLogin(res.sessionKey);
            if (check.success && check.user) {
              clearInterval(pollInterval);
              setStep(3);
            }
          } catch {
            // waiting
          }
        }, 3000);
        qrPollingRef.current = pollInterval;
      }
    } catch (err: any) {
      setTgError(err.message || 'Failed to initialize QR code.');
    } finally {
      setQrLoading(false);
    }
  }, [customApiId, customApiHash]);

  useEffect(() => {
    if (step === 2 && authTab === 'qr' && !qrImageUrl && !qrLoading) {
      initQRFlow();
    }
    return () => {
      if (qrPollingRef.current) {
        clearInterval(qrPollingRef.current);
      }
    };
  }, [step, authTab, qrImageUrl, qrLoading, initQRFlow]);

  if (!isOpen) return null;

  const fullPhoneNumber = selectedCountry.dial + phoneNumber.replace(/[\s-]/g, '');

  const handleCreateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password.length < 8) {
      setPasswordError('Master password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      let saltHex: string | null = null;
      try {
        const res = await fetch('http://localhost:8000/api/auth/setup-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ master_password: password })
        });
        if (res.ok) {
          const data = await res.json();
          saltHex = data.salt_hex;
        }
      } catch {}

      const salt = saltHex ? CryptoEngine.hexToBuf(saltHex) : CryptoEngine.generateSalt();
      const finalSaltHex = saltHex || CryptoEngine.bufToHex(salt);
      localStorage.setItem('televault_master_salt', finalSaltHex);
      await CryptoEngine.deriveKey(password, salt);
      const hash = await CryptoEngine.computeVerificationHash(password, salt);
      localStorage.setItem('televault_master_hash', hash);
      setStep(2);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to initialize encryption key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBotLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgError('');

    if (!botToken.trim()) {
      setTgError('Please enter your Telegram Bot Token from @BotFather.');
      return;
    }

    try {
      setIsLoading(true);
      const apiId = customApiId.trim() ? parseInt(customApiId.trim(), 10) : DEFAULT_TELEGRAM_CLIENT.apiId;
      const apiHash = customApiHash.trim() || DEFAULT_TELEGRAM_CLIENT.apiHash;

      await TelegramService.loginWithBotToken(botToken, botTargetChat, apiId, apiHash);
      setStep(3);
    } catch (err: any) {
      setTgError(err.message || 'Bot authorization failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTelegramCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgError('');

    if (!phoneNumber.trim()) {
      setTgError('Enter your phone number.');
      return;
    }

    try {
      setIsLoading(true);
      const apiId = customApiId.trim() ? parseInt(customApiId.trim(), 10) : DEFAULT_TELEGRAM_CLIENT.apiId;
      const apiHash = customApiHash.trim() || DEFAULT_TELEGRAM_CLIENT.apiHash;

      const res = await TelegramService.sendLoginCode(apiId, apiHash, fullPhoneNumber);
      if (res.phoneCodeHash) {
        setPhoneCodeHash(res.phoneCodeHash);
      }
      setCodeSent(true);
    } catch (err: any) {
      setTgError(err.message || 'Failed to send login code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTelegramCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgError('');

    try {
      setIsLoading(true);
      const apiId = customApiId.trim() ? parseInt(customApiId.trim(), 10) : DEFAULT_TELEGRAM_CLIENT.apiId;
      const apiHash = customApiHash.trim() || DEFAULT_TELEGRAM_CLIENT.apiHash;

      await TelegramService.verifyLoginCode(apiId, apiHash, fullPhoneNumber, phoneCode, twoFA, phoneCodeHash);
      setStep(3);
    } catch (err: any) {
      if (err.message?.includes('2FA')) {
        setShow2FA(true);
      } else {
        setTgError(err.message || 'Verification failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('televault_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e111a] border border-zinc-800 shadow-2xl p-6 text-zinc-100 overflow-y-auto max-h-[92vh] custom-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <TeleVaultLogo size={32} showText={true} />
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-200 ${
                  step === s
                    ? 'w-6 bg-zinc-200'
                    : step > s
                    ? 'w-3 bg-emerald-400'
                    : 'w-3 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Set Master Encryption Password
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Your password derives your 256-bit AES key locally. Telegram never sees your key.
              </p>
            </div>

            <form onSubmit={handleCreateMasterPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter strong encryption password..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/30 transition pr-9"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Strength</span>
                      <span className="font-medium text-zinc-300">{passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1 rounded-full overflow-hidden bg-zinc-800">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className={`h-full transition-all duration-150 ${
                            passwordStrength.score >= bar ? passwordStrength.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/30 transition"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-start gap-2.5 text-[11px] text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero-Knowledge: Key remains in your browser. Cannot be recovered if lost.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Deriving Keys...' : 'Continue'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Connect Telegram Cloud
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Select your connection method for encrypted MTProto storage.
              </p>
            </div>

            {!codeSent && (
              <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 gap-1">
                <button
                  type="button"
                  onClick={() => { setAuthTab('bot'); setTgError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'bot'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" /> Bot Token
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('qr'); setTgError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'qr'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> Scan QR
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('phone'); setTgError(''); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'phone'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Phone OTP
                </button>
              </div>
            )}

            {/* TAB 1: BOT TOKEN */}
            {authTab === 'bot' && (
              <form onSubmit={handleBotLogin} className="space-y-3 text-left">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-400">
                      Bot Token
                    </label>
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                    >
                      @BotFather <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456789:ABCdefGHIjklMNOpqr..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-600 transition"
                    autoFocus
                  />
                  <div className="mt-2.5">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Channel / Chat ID <span className="text-zinc-600">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={botTargetChat}
                      onChange={(e) => setBotTargetChat(e.target.value)}
                      placeholder="e.g. @my_vault_channel"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 transition"
                    />
                  </div>

                  <div className="mt-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
                    <div>1. Message <strong>@BotFather</strong> on Telegram → <code className="text-zinc-300">/newbot</code></div>
                    <div>2. Paste token here → Click <strong>Connect</strong></div>
                    <div>3. Open your bot in Telegram and click <strong>START</strong>!</div>
                  </div>
                </div>

                {tgError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{tgError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* TAB 2: QR */}
            {authTab === 'qr' && (
              <div className="space-y-3 text-center">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center space-y-2">
                  {qrLoading ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-zinc-300" />
                      <span className="text-xs">Generating QR...</span>
                    </div>
                  ) : qrImageUrl ? (
                    <div className="p-2.5 rounded-xl bg-white shadow-md">
                      <img src={qrImageUrl} alt="QR Code" className="w-44 h-44 rounded-md" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-zinc-400">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <span className="text-xs">QR not loaded</span>
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-400 max-w-xs">
                    Telegram → <strong>Settings</strong> → <strong>Devices</strong> → <strong>Link Desktop Device</strong>.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={initQRFlow}
                  disabled={qrLoading}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${qrLoading ? 'animate-spin' : ''}`} /> Refresh QR
                </button>

                {tgError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs text-left">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{tgError}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PHONE */}
            {authTab === 'phone' && !codeSent && (
              <form onSubmit={handleSendTelegramCode} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-1.5">
                    <div className="relative" ref={countryRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCountryPicker(!showCountryPicker);
                          setCountrySearch('');
                        }}
                        className="flex items-center gap-1 px-2.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs hover:border-zinc-700 transition cursor-pointer whitespace-nowrap"
                      >
                        <span className="text-sm">{selectedCountry.flag}</span>
                        <span className="font-mono text-zinc-400">{selectedCountry.dial}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                      </button>

                      {showCountryPicker && (
                        <div className="absolute top-full left-0 mt-1 w-64 max-h-52 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-50 overflow-hidden flex flex-col">
                          <div className="p-1.5 border-b border-zinc-800">
                            <div className="relative">
                              <Search className="absolute left-2 top-2 w-3 h-3 text-zinc-500" />
                              <input
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search country..."
                                className="w-full pl-7 pr-2 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {COUNTRIES
                              .filter(c =>
                                c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                c.dial.includes(countrySearch) ||
                                c.code.toLowerCase().includes(countrySearch.toLowerCase())
                              )
                              .map(c => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setShowCountryPicker(false);
                                    setCountrySearch('');
                                  }}
                                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                                    selectedCountry.code === c.code
                                      ? 'bg-zinc-800 text-white'
                                      : 'text-zinc-300 hover:bg-zinc-800/50'
                                  }`}
                                >
                                  <span>{c.flag}</span>
                                  <span className="flex-1 truncate">{c.name}</span>
                                  <span className="font-mono text-zinc-500 text-[10px]">{c.dial}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number"
                      className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 transition"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Advanced Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition font-medium"
                  >
                    <span>Custom API credentials (Optional)</span>
                    {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 grid grid-cols-2 gap-2 text-left">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">API ID</label>
                        <input
                          type="text"
                          value={customApiId}
                          onChange={(e) => setCustomApiId(e.target.value)}
                          placeholder="e.g. 29384756"
                          className="w-full px-2 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-0.5">API Hash</label>
                        <input
                          type="text"
                          value={customApiHash}
                          onChange={(e) => setCustomApiHash(e.target.value)}
                          placeholder="e.g. 9b8c7d..."
                          className="w-full px-2 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {tgError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs text-left">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{tgError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Code'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* OTP VERIFY */}
            {authTab === 'phone' && codeSent && (
              <form onSubmit={handleVerifyTelegramCode} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Telegram Login Code
                  </label>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-center text-lg font-mono focus:outline-none"
                    autoFocus
                  />
                </div>

                {show2FA && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      2-Step Verification Password
                    </label>
                    <input
                      type="password"
                      value={twoFA}
                      onChange={(e) => setTwoFA(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none"
                    />
                  </div>
                )}

                {tgError && (
                  <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs">
                    {tgError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCodeSent(false)}
                    className="w-1/3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Vault Ready
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Your encrypted storage channel is configured and cloaked.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Channel: <strong>TeleVault Storage</strong></span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Automatically muted and archived in Telegram to keep your chats clean.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Encrypted Cache</div>
                  <div className="text-[10px] text-zinc-500">In-memory decrypted preview pipeline</div>
                </div>
                <input
                  type="checkbox"
                  checked={storagePerm}
                  onChange={(e) => setStoragePerm(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-zinc-200 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/40 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Cross-Browser Sync</div>
                  <div className="text-[10px] text-zinc-500">Real-time sync across sessions</div>
                </div>
                <input
                  type="checkbox"
                  checked={batteryPerm}
                  onChange={(e) => setBatteryPerm(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-zinc-200 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded text-zinc-200 cursor-pointer"
                />
                <span className="text-[11px] text-zinc-400">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal('terms')}
                    className="text-zinc-200 underline cursor-pointer"
                  >
                    Terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal('privacy')}
                    className="text-zinc-200 underline cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              onClick={handleFinish}
              disabled={!agreeTerms}
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Open Drive
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
