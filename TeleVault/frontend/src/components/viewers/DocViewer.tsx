import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ShieldCheck
} from 'lucide-react';

interface DocViewerProps {
  fileName: string;
  fileSizeFormatted: string;
}

export const DocViewer: React.FC<DocViewerProps> = ({
  fileName,
  fileSizeFormatted,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [zoom, setZoom] = useState(100);

  return (
    <div className="w-full flex flex-col items-center select-none space-y-4">
      {/* Top Document Controls Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0e1621] border border-white/5 text-xs text-white">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#2aabee]" />
          <span className="font-semibold">{fileName}</span>
          <span className="text-[#7f8c99] font-mono">({fileSizeFormatted})</span>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-[#7f8c99]">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#7f8c99]">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(75, z - 15))}
            className="p-1 hover:text-white cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span>{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(150, z + 15))}
            className="p-1 hover:text-white cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document Canvas Sheet */}
      <div
        style={{ transform: `scale(${zoom / 100})` }}
        className="w-full max-w-xl min-h-[460px] bg-white text-slate-900 rounded-xl shadow-2xl p-8 transition-transform duration-200 border border-slate-200 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200">
            <div className="text-lg font-bold tracking-tight text-slate-900">
              TeleVault Security Architecture
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Page {currentPage}
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900">
              1. Zero-Knowledge Cryptographic Guarantees
            </p>
            <p>
              TeleVault implements authenticated <strong>AES-256-GCM</strong> encryption with <strong>PBKDF2-HMAC-SHA256</strong> key derivation (600,000 rounds). At no point does raw plaintext or user master keys leave the client runtime.
            </p>

            <p className="font-semibold text-slate-900 pt-2">
              2. Private Storage Channel Isolation
            </p>
            <p>
              Uploaded chunks are stored as arbitrary binary attachments inside a dedicated Telegram private storage channel. The channel is muted and automatically categorized into the user’s Archive folder to eliminate chat view clutter.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1 text-[#2fae50] font-medium">
            <ShieldCheck className="w-3 h-3" /> End-to-End Decrypted In-Memory
          </span>
          <span>Confidential Personal Document</span>
        </div>
      </div>
    </div>
  );
};
