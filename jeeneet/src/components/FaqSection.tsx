// src/components/FaqSection.tsx
"use client";
import { useState } from "react";

const FAQS = [
  {
    q: "When will the JEE Main 2026 Session 2 Admit Card be released?",
    a: "The JEE Main 2026 Session 2 Admit Card is expected to be released on the official NTA portal (jeemain.nta.ac.in) approximately 3–5 days before the exam. Candidates should keep checking the official website regularly.",
  },
  {
    q: "How can I download my JEE 2026 Hall Ticket?",
    a: "Visit jeemain.nta.ac.in → Click 'Admit Card' → Enter your Application Number and Date of Birth → Download and print. Bring the printed copy along with a valid government photo ID.",
  },
  {
    q: "What documents are required at the JEE exam hall?",
    a: "You must carry: (1) Printed Admit Card, (2) Valid photo ID (Aadhar, Passport, Voter ID, PAN Card, or Driving Licence), (3) One passport-size photograph (same as on the application form).",
  },
  {
    q: "What is the exam pattern for JEE Main 2026 Session 2?",
    a: "JEE Main 2026 Paper 1 (B.E./B.Tech) consists of 90 questions (Physics, Chemistry, Mathematics — 30 each). Total marks: 300. Duration: 3 hours. Mode: Computer Based Test (CBT).",
  },
  {
    q: "Can I change my exam city for JEE Main 2026 Session 2?",
    a: "Exam city correction is usually allowed during a specific window announced by NTA. Once the admit card is released, the exam centre is fixed and cannot be changed.",
  },
  {
    q: "What time should I report at the JEE exam centre?",
    a: "Candidates should report at least 90 minutes before the exam start time. Entry to the exam hall is usually closed 30 minutes before the exam begins. Check your admit card for specific timings.",
  },
  {
    q: "What items are NOT allowed in the JEE exam hall?",
    a: "Mobile phones, smartwatches, calculators, electronic devices, books, notes, food items (except water), and any electronic gadgets are strictly prohibited inside the exam hall.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-7 bg-[#f7941d] rounded-full" />
        <h2 className="font-heading font-bold text-xl text-[#003580]">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-nta-border overflow-hidden">
            <button
              className="w-full flex justify-between items-center px-5 py-4 text-left font-heading font-semibold text-sm text-[#003580] hover:bg-blue-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{faq.q}</span>
              <span className="ml-4 text-lg shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 font-sans leading-relaxed border-t border-nta-border fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
