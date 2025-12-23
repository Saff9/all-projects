import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  Calendar,
  Layers,
  Database,
  Lock,
  Info,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import type { FileItem } from '../../types';
import { VFSService } from '../../services/vfsService';
import { BlobRegistry } from '../../services/blobRegistry';
import { TelegramService } from '../../services/telegramService';
import { VideoViewer } from '../viewers/VideoViewer';
import { ImageViewer } from '../viewers/ImageViewer';
import { AudioViewer } from '../viewers/AudioViewer';
import { CodeViewer } from '../viewers/CodeViewer';
import { DocViewer } from '../viewers/DocViewer';

interface MediaPreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | undefined>(undefined);
  const [activeText, setActiveText] = useState<string | undefined>(undefined);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!file) {
      setActiveUrl(undefined);
      setActiveText(undefined);
      setIsLoadingUrl(false);
      setDownloadProgress(0);
      return;
    }

    let isMounted = true;
    setIsLoadingUrl(true);
    setDownloadProgress(0);

    const loadMedia = async () => {
      try {
        // 1. Check local BlobRegistry first (memory / IndexedDB)
        const liveUrl = await BlobRegistry.getLiveUrl(file.id);
        if (!isMounted) return;
        if (liveUrl) {
          setActiveUrl(liveUrl);
          const cachedText = BlobRegistry.getText(file.id) || file.textContent;
          if (cachedText) setActiveText(cachedText);
          setIsLoadingUrl(false);
          return;
        }

        // 2. Decrypt on-demand from Telegram chunks if message IDs exist
        if (file.telegramMessageIds && file.telegramMessageIds.length > 0) {
          const decryptedBlob = await TelegramService.downloadAndDecryptFile(
            file,
            (percent) => {
              if (isMounted) setDownloadProgress(percent);
            }
          );
          if (!isMounted) return;

          let textContent: string | undefined;
          if (file.category === 'code' || file.category === 'documents') {
            try {
              textContent = await decryptedBlob.text();
            } catch {}
          }

          const registeredUrl = BlobRegistry.register(file.id, decryptedBlob, textContent);
          setActiveUrl(registeredUrl);
          if (textContent) setActiveText(textContent);
          setIsLoadingUrl(false);
          return;
        }

        // 3. Fallback to downloadUrl if present
        if (file.downloadUrl) {
          setActiveUrl(file.downloadUrl);
        }
        setIsLoadingUrl(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('[MediaPreviewModal] Media load notice:', err);
        if (file.downloadUrl) {
          setActiveUrl(file.downloadUrl);
        }
        setIsLoadingUrl(false);
      }
    };

    loadMedia();

    return () => {
      isMounted = false;
    };
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const formattedSize = VFSService.formatBytes(file.size);
  const currentMediaSrc = activeUrl || file.downloadUrl;

  const handleCopyId = () => {
    if (file.telegramMessageIds.length > 0) {
      navigator.clipboard.writeText(file.telegramMessageIds.join(', '));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const renderActiveViewer = () => {
    switch (file.category) {
      case 'videos':
        return (
          <VideoViewer
            fileName={file.name}
            fileSizeFormatted={formattedSize}
            src={currentMediaSrc}
          />
        );
      case 'images':
        return (
          <ImageViewer
            fileName={file.name}
            fileSizeFormatted={formattedSize}
            src={currentMediaSrc}
          />
        );
      case 'audio':
        return (
          <AudioViewer
            fileName={file.name}
            fileSizeFormatted={formattedSize}
            src={currentMediaSrc}
          />
        );
      case 'code':
        return (
          <CodeViewer
            fileName={file.name}
            fileSizeFormatted={formattedSize}
            fileContent={activeText || file.textContent}
          />
        );
      case 'documents':
      default:
        return (
          <DocViewer
            fileName={file.name}
            fileSizeFormatted={formattedSize}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#0e111a] border border-zinc-800 shadow-2xl flex flex-col text-zinc-100 overflow-hidden">
        {/* Lightbox Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-[#090a0f]">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <h3 className="text-xs font-semibold text-white truncate">{file.name}</h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                {formattedSize} • {file.category.toUpperCase()} • E2EE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              title="Info"
              className={`p-1.5 rounded-lg transition cursor-pointer border ${
                showInfo
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDownload(file)}
              className="py-1 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer border border-zinc-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Viewer Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-black/40 custom-scrollbar">
          {isLoadingUrl ? (
            <div className="flex flex-col items-center gap-3 text-zinc-400 p-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#2aabee]" />
              <div className="text-center">
                <span className="text-xs font-semibold text-zinc-200">
                  Decrypting {file.name}...
                </span>
                {downloadProgress > 0 && (
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    {downloadProgress}% decrypted
                  </p>
                )}
              </div>
            </div>
          ) : (
            renderActiveViewer()
          )}
        </div>

        {/* Metadata Drawer */}
        {showInfo && (
          <div className="p-4 border-t border-zinc-800 bg-[#090a0f] space-y-2.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-zinc-500 flex items-center gap-1 mb-0.5 text-[10px]">
                  <Layers className="w-3 h-3" /> Chunks
                </div>
                <div className="text-xs font-medium text-zinc-200">{file.chunkCount} Parts</div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-zinc-500 flex items-center gap-1 mb-0.5 text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-500/80" /> Cipher
                </div>
                <div className="text-xs font-medium text-emerald-400 font-mono">AES-256-GCM</div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
                <div className="text-zinc-500 flex items-center gap-1 mb-0.5 text-[10px]">
                  <Calendar className="w-3 h-3" /> Date
                </div>
                <div className="text-xs font-medium text-zinc-200">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="text-zinc-500 flex items-center gap-1 mb-0.5 text-[10px]">
                    <Database className="w-3 h-3" /> Telegram Msg
                  </div>
                  <div className="text-xs font-mono text-zinc-300 truncate max-w-[90px]">
                    {file.telegramMessageIds.join(', ') || 'Auto'}
                  </div>
                </div>
                {file.telegramMessageIds.length > 0 && (
                  <button
                    onClick={handleCopyId}
                    title="Copy Msg IDs"
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
