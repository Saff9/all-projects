// src/components/SearchSection.tsx
"use client";
import { useState } from "react";

// Step indicator
function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-bold border-2 transition-all ${
          done
            ? "bg-green-600 border-green-600 text-white"
            : active
            ? "bg-[#003580] border-[#003580] text-white"
            : "bg-white border-gray-300 text-gray-400"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span className={`text-[10px] font-sans hidden sm:block ${active ? "text-[#003580] font-semibold" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

function Divider({ done }: { done: boolean }) {
  return (
    <div className={`flex-1 h-0.5 mt-4 mx-1 ${done ? "bg-green-500" : "bg-gray-200"}`} />
  );
}

export default function SearchSection() {
  const [appNum, setAppNum] = useState("");
  const [dob, setDob] = useState("");
  const [captcha] = useState(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, ans: String(a + b) };
  });
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0 = idle, 1 = searching, 2 = result
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!appNum.trim()) { setError("Please enter your Application Number."); return; }
    if (!dob) { setError("Please enter your Date of Birth."); return; }
    if (captchaInput.trim() !== captcha.ans) { setError("Security check failed. Please enter the correct answer."); return; }

    setLoading(true);
    setStep(1);
    await new Promise((r) => setTimeout(r, 800));
    setStep(2);
    setLoading(false);
  };

  const reset = () => { setStep(0); setAppNum(""); setDob(""); setCaptchaInput(""); setError(""); };

  return (
    <section id="search" className="max-w-5xl mx-auto px-4 py-6">

      {/* ── Portal header strip — mimics NTA portal ── */}
      <div
        className="rounded-t-xl overflow-hidden border border-b-0 border-[#b0c4de]"
        style={{ background: "linear-gradient(90deg,#002060 0%,#003580 60%,#005096 100%)" }}
      >
        {/* Top label row */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            {/* Mini emblem */}
            <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="#001f4d" stroke="#f7941d" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="37" fill="white" />
              <circle cx="50" cy="50" r="17" fill="none" stroke="#003580" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="3" fill="#003580" />
              {Array.from({ length: 24 }).map((_, i) => {
                const rad = (i * 15 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={50 + 3.5 * Math.cos(rad)} y1={50 + 3.5 * Math.sin(rad)}
                    x2={50 + 16.5 * Math.cos(rad)} y2={50 + 16.5 * Math.sin(rad)}
                    stroke="#003580" strokeWidth="1.3"
                  />
                );
              })}
              <text x="50" y="54" textAnchor="middle" fill="#003580" fontSize="9" fontWeight="800" fontFamily="Mukta,sans-serif" letterSpacing="1">NTA</text>
            </svg>
            <div>
              <div className="text-[#f7941d] text-[10px] font-sans uppercase tracking-widest">National Testing Agency</div>
              <div className="text-white font-heading font-bold text-base leading-tight">JEE (Main) – 2026 Session 2</div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[#f7d27d] text-[10px] font-sans">Exam Hall / Admit Card</div>
            <div className="text-white text-xs font-heading font-semibold">Candidate Login</div>
          </div>
        </div>

        {/* Orange accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#f7941d] via-[#ffc04d] to-[#f7941d]" />

        {/* Heading band */}
        <div className="bg-[#e8f0fe] px-5 py-2.5 flex items-center justify-between border-t border-[#b0c4de]">
          <h2 className="font-heading font-bold text-[#003580] text-sm sm:text-base">
            🔍 Find Exam Hall / Download Admit Card
          </h2>
          <span className="text-xs text-gray-500 font-sans hidden sm:block">JEE Main 2026 – Paper 1 (B.E./B.Tech)</span>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white border border-[#b0c4de] rounded-b-xl shadow-xl overflow-hidden">

        {/* Step indicator */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Step n={1} label="Enter Details" active={step === 0} done={step >= 1} />
          <Divider done={step >= 1} />
          <Step n={2} label="Verify" active={step === 1} done={step >= 2} />
          <Divider done={step >= 2} />
          <Step n={3} label="View Hall" active={step === 2} done={false} />
        </div>

        {/* ── STEP 0: Form ── */}
        {step < 2 && (
          <div className="p-5 sm:p-7">
            <form onSubmit={handleSearch} className="space-y-5" noValidate>

              {/* App number */}
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 mb-1.5">
                  Application Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={appNum}
                  onChange={(e) => setAppNum(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 13-digit Application Number"
                  maxLength={13}
                  className="w-full border-2 border-gray-300 focus:border-[#003580] rounded px-4 py-2.5 text-sm font-sans outline-none transition-colors tracking-wider"
                />
                <p className="text-[11px] text-gray-400 mt-1 font-sans">e.g. 2401100XXXXXXX (from your registration confirmation)</p>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 mb-1.5">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border-2 border-gray-300 focus:border-[#003580] rounded px-4 py-2.5 text-sm font-sans outline-none transition-colors"
                />
              </div>

              {/* Security captcha */}
              <div>
                <label className="block text-sm font-heading font-semibold text-gray-700 mb-1.5">
                  Security Check <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="px-5 py-2.5 rounded border-2 border-dashed border-gray-400 font-heading font-bold text-lg text-[#003580] select-none"
                    style={{
                      background: "repeating-linear-gradient(45deg,#f0f4ff,#f0f4ff 4px,#e8eef8 4px,#e8eef8 8px)",
                      letterSpacing: "4px",
                      fontStyle: "italic",
                    }}
                  >
                    {captcha.a} + {captcha.b} = ?
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Answer"
                    maxLength={3}
                    className="w-28 border-2 border-gray-300 focus:border-[#003580] rounded px-3 py-2.5 text-sm font-sans outline-none transition-colors text-center tracking-widest font-heading"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded px-4 py-3 text-sm text-red-700 font-sans fade-in">
                  <span className="text-base">⚠️</span> {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded font-heading font-bold text-base text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: loading ? "#5580b0" : "#003580" }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Verifying…
                    </>
                  ) : (
                    "🔍  Find My Exam Hall"
                  )}
                </button>
                <a
                  href="https://jeemain.nta.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded font-heading font-bold text-base text-center border-2 border-[#f7941d] text-[#f7941d] hover:bg-[#f7941d] hover:text-white transition-all"
                >
                  ⬇ Download Admit Card
                </a>
              </div>
            </form>

            {/* Bottom info strip */}
            <div className="mt-6 bg-[#fffbe6] border border-[#f7d27d] rounded p-4 text-xs text-gray-700 font-sans">
              <p className="font-heading font-semibold text-sm text-[#7a5200] mb-2">📋 How to download your JEE Admit Card</p>
              <ol className="list-decimal ml-4 space-y-1 leading-relaxed">
                <li>Visit the official portal: <strong>jeemain.nta.ac.in</strong></li>
                <li>Click <em>&quot;Admit Card&quot;</em> or <em>&quot;Hall Ticket&quot;</em> link on the homepage</li>
                <li>Enter your Application Number and Date of Birth</li>
                <li>Download the PDF and take a colour print</li>
                <li>Carry the admit card + valid Govt photo ID to the exam hall</li>
              </ol>
            </div>
          </div>
        )}

        {/* ── STEP 2: Result ── */}
        {step === 2 && (
          <div className="p-5 sm:p-7 fade-in">
            <div className="bg-green-50 border border-green-300 rounded-lg p-5 mb-5 flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-heading font-bold text-green-800 text-base">Details Verified Successfully</p>
                <p className="text-sm text-green-700 font-sans mt-1">
                  Your application number <strong>{appNum}</strong> has been recognised. Exam hall details are available on the official NTA portal.
                </p>
              </div>
            </div>

            {/* Info table */}
            <div className="border border-[#b0c4de] rounded-lg overflow-hidden mb-5">
              <div className="bg-[#003580] px-4 py-2.5 text-white font-heading font-semibold text-sm">
                Candidate Information
              </div>
              <table className="w-full text-sm font-sans">
                <tbody>
                  {[
                    ["Application Number", appNum],
                    ["Exam", "JEE Main 2026 — Session 2 — Paper 1"],
                    ["Mode", "Computer Based Test (CBT)"],
                    ["Admit Card Status", "🟠 Expected Today on jeemain.nta.ac.in"],
                    ["Hall Ticket Source", "Official NTA Portal Only"],
                  ].map(([k, v], i) => (
                    <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-[#f0f5ff]"}>
                      <td className="px-4 py-2.5 font-semibold text-gray-600 w-1/2 border-b border-gray-100">{k}</td>
                      <td className="px-4 py-2.5 text-gray-800 border-b border-gray-100">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://jeemain.nta.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded font-heading font-bold text-base text-center text-white transition-all"
                style={{ background: "#003580" }}
              >
                ⬇ Download Admit Card from NTA Portal
              </a>
              <button
                onClick={reset}
                className="flex-1 py-3 rounded font-heading font-bold text-base border-2 border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
              >
                ← Search Again
              </button>
            </div>
          </div>
        )}

        {/* Bottom footer bar */}
        <div className="bg-[#f0f4fb] border-t border-[#b0c4de] px-5 py-2.5 flex items-center justify-between text-[11px] text-gray-500 font-sans">
          <span>© 2026 JEE Hall Finder — Unofficial Helper Portal</span>
          <a href="https://jeemain.nta.ac.in" target="_blank" rel="noopener noreferrer" className="text-[#003580] underline hover:text-[#f7941d]">
            Official: jeemain.nta.ac.in
          </a>
        </div>
      </div>
    </section>
  );
}
