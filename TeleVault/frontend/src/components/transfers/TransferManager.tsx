import React, { useState } from 'react';
import {
  UploadCloud,
  DownloadCloud,
  ChevronDown,
  ChevronUp,
  X,
  Pause,
  Play,
  CheckCircle2,
  Activity,
  AlertCircle
} from 'lucide-react';
import type { TransferTask } from '../../types';
import { VFSService } from '../../services/vfsService';

interface TransferManagerProps {
  transfers: TransferTask[];
  onCancelTransfer: (id: string) => void;
  onTogglePause: (id: string) => void;
  onClearCompleted: () => void;
}

export const TransferManager: React.FC<TransferManagerProps> = ({
  transfers,
  onCancelTransfer,
  onTogglePause,
  onClearCompleted,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (transfers.length === 0) return null;

  const activeCount = transfers.filter((t) => t.status === 'transferring' || t.status === 'queued').length;
  const completedCount = transfers.filter((t) => t.status === 'completed').length;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm select-none">
      <div className="rounded-xl bg-[#0e111a] border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 cursor-pointer hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-2">
            <Activity className={`w-3.5 h-3.5 text-zinc-300 ${activeCount > 0 ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium text-zinc-200">
              Transfers ({activeCount} active{completedCount > 0 ? `, ${completedCount} done` : ''})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {completedCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearCompleted();
                }}
                className="text-[10px] font-medium text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
              >
                Clear
              </button>
            )}
            <button className="text-zinc-500 hover:text-zinc-300 p-0.5">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Task List */}
        {isExpanded && (
          <div className="max-h-56 overflow-y-auto p-3 space-y-2.5 divide-y divide-zinc-800/60 custom-scrollbar">
            {transfers.map((task) => (
              <div key={task.id} className="pt-2 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {task.type === 'upload' ? (
                      <UploadCloud className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    ) : (
                      <DownloadCloud className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span className="text-zinc-200 font-medium truncate max-w-[180px]" title={task.fileName}>
                      {task.fileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 font-medium">
                      {task.progress}%
                    </span>

                    {task.status !== 'completed' && task.status !== 'error' && (
                      <button
                        onClick={() => onTogglePause(task.id)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                      >
                        {task.status === 'paused' ? (
                          <Play className="w-3 h-3 text-zinc-300" />
                        ) : (
                          <Pause className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => onCancelTransfer(task.id)}
                      className="text-zinc-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${task.progress}%` }}
                    className={`h-full transition-all duration-200 rounded-full ${
                      task.status === 'completed'
                        ? 'bg-emerald-400'
                        : task.status === 'paused'
                        ? 'bg-amber-400'
                        : task.status === 'error'
                        ? 'bg-rose-500'
                        : 'bg-zinc-200'
                    }`}
                  />
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>
                    {VFSService.formatBytes(task.size)} • {task.chunksCompleted}/{task.chunksTotal}
                  </span>
                  {task.status === 'transferring' && (
                    <span className="text-zinc-400">
                      {VFSService.formatBytes(task.speedBytesPerSec)}/s
                    </span>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> {task.type === 'upload' ? 'Encrypted' : 'Decrypted'}
                    </span>
                  )}
                  {task.status === 'error' && (
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Error
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
