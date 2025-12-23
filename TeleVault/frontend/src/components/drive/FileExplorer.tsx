import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Code,
  File,
  Star,
  Download,
  Trash2,
  RotateCcw,
  Eye,
  LayoutGrid,
  List,
  ShieldCheck,
  ChevronRight,
  Upload,
  FolderPlus,
  Lock
} from 'lucide-react';
import type { FileItem, FolderItem } from '../../types';
import { VFSService } from '../../services/vfsService';

interface FileExplorerProps {
  files: FileItem[];
  folders: FolderItem[];
  currentFolderId: string | null;
  onNavigateFolder: (id: string | null) => void;
  onPreviewFile: (file: FileItem) => void;
  onDownloadFile: (file: FileItem) => void;
  onToggleFavorite: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash?: () => void;
  onUploadClick: () => void;
  onCreateFolderClick?: () => void;
  isTrashView?: boolean;
  isFavoritesView?: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  folders,
  currentFolderId,
  onNavigateFolder,
  onPreviewFile,
  onDownloadFile,
  onToggleFavorite,
  onMoveToTrash,
  onRestoreFromTrash,
  onPermanentDelete,
  onEmptyTrash,
  onUploadClick,
  onCreateFolderClick,
  isTrashView = false,
  isFavoritesView = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);

  const breadcrumbs = VFSService.getBreadcrumbs(currentFolderId, folders);

  const getFileCategoryIcon = (category: string) => {
    switch (category) {
      case 'images':
        return ImageIcon;
      case 'videos':
        return Film;
      case 'audio':
        return Music;
      case 'documents':
        return FileText;
      case 'archives':
        return Archive;
      case 'code':
        return Code;
      default:
        return File;
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      className="flex-1 flex flex-col h-[calc(100vh-53px)] overflow-hidden bg-[#090a0f] relative select-none"
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-zinc-950/90 backdrop-blur-md border border-dashed border-zinc-500 flex flex-col items-center justify-center animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-200 mb-3 shadow-xl animate-bounce">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Drop files to encrypt and upload</h3>
          <p className="text-xs text-zinc-400 mt-1">Files are encrypted locally with AES-256 before upload</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-[#0c0f17] shrink-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-xs text-zinc-400 overflow-x-auto py-0.5">
          {isTrashView ? (
            <div className="flex items-center gap-1.5 text-rose-400 font-medium px-2 py-0.5 rounded-md bg-rose-950/30 border border-rose-800/40">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Recycle Bin</span>
              <span className="text-[10px] px-1 rounded bg-rose-900/40 font-mono text-rose-300">
                {files.length}
              </span>
            </div>
          ) : isFavoritesView ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium px-2 py-0.5 rounded-md bg-amber-950/30 border border-amber-800/40">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Starred</span>
              <span className="text-[10px] px-1 rounded bg-amber-900/40 font-mono text-amber-200">
                {files.length}
              </span>
            </div>
          ) : (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id || 'root'}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                <button
                  onClick={() => onNavigateFolder(crumb.id)}
                  className={`px-2 py-1 rounded-md transition shrink-0 cursor-pointer text-xs ${
                    idx === breadcrumbs.length - 1
                      ? 'text-zinc-100 font-medium bg-zinc-800/70 border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))
          )}
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isTrashView && files.length > 0 && onEmptyTrash && (
            <button
              onClick={onEmptyTrash}
              title="Permanently remove all trashed files"
              className="px-2.5 py-1 rounded-md bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium border border-rose-800/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Empty</span>
            </button>
          )}

          {onCreateFolderClick && !isTrashView && !isFavoritesView && (
            <button
              onClick={onCreateFolderClick}
              title="New Folder"
              className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid"
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List"
              className={`p-1 rounded transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Explorer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 md:pb-6 custom-scrollbar">
        {/* Folders Section */}
        {!isTrashView && folders.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 px-0.5">
              Folders
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => onNavigateFolder(folder.id)}
                  className="group p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/70 hover:border-zinc-700 transition flex items-center gap-2.5 cursor-pointer"
                >
                  <FolderIcon className="w-4 h-4 shrink-0" style={{ color: folder.color || '#94a3b8' }} />
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                    {folder.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 px-0.5">
            <span>
              {isTrashView
                ? `Recycle Bin (${files.length})`
                : isFavoritesView
                ? `Starred (${files.length})`
                : `Files (${files.length})`}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono normal-case flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500/70" /> Client E2EE
            </span>
          </div>

          {files.length === 0 ? (
            /* Minimalist Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-zinc-800/80 bg-zinc-900/20 my-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
                {isTrashView ? (
                  <Trash2 className="w-5 h-5 text-rose-400" />
                ) : isFavoritesView ? (
                  <Star className="w-5 h-5 text-amber-400" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-xs font-semibold text-zinc-200 mb-1">
                {isTrashView
                  ? 'Recycle Bin is empty'
                  : isFavoritesView
                  ? 'No starred files'
                  : 'No files in this folder'}
              </h3>
              <p className="text-[11px] text-zinc-500 max-w-xs mb-4 leading-normal">
                {isTrashView
                  ? 'Files moved to the Recycle Bin will be shown here.'
                  : isFavoritesView
                  ? 'Star files for quick access.'
                  : 'Drag and drop files here or click upload to store them encrypted.'}
              </p>
              {!isTrashView && !isFavoritesView && (
                <button
                  onClick={onUploadClick}
                  className="py-1.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition cursor-pointer"
                >
                  Upload Files
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Refined Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {files.map((file) => {
                const CategoryIcon = getFileCategoryIcon(file.category);
                const hasMediaThumbnail =
                  (file.category === 'images' || file.category === 'videos') && Boolean(file.downloadUrl);

                return (
                  <div
                    key={file.id}
                    className="group relative rounded-xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 p-3 transition flex flex-col justify-between"
                  >
                    {/* Thumbnail / Icon Header */}
                    {hasMediaThumbnail ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-black border border-zinc-800/80 mb-2.5">
                        {file.category === 'images' ? (
                          <div
                            onClick={() => onPreviewFile(file)}
                            className="w-full h-full cursor-pointer flex items-center justify-center p-0.5 bg-zinc-950"
                          >
                            <img
                              src={file.downloadUrl}
                              alt={file.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition duration-200"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => onPreviewFile(file)}
                            className="w-full h-full cursor-pointer flex items-center justify-center bg-zinc-950 relative"
                          >
                            <video
                              src={file.downloadUrl}
                              className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-zinc-900/90 text-zinc-200 flex items-center justify-center border border-zinc-700">
                                <Film className="w-4 h-4 ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Favorite button */}
                        {!isTrashView && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(file.id);
                            }}
                            className={`absolute top-2 right-2 p-1 rounded-md backdrop-blur-sm transition cursor-pointer border ${
                              file.isFavorite
                                ? 'bg-amber-400 text-black border-amber-400'
                                : 'bg-black/60 hover:bg-black/80 text-zinc-300 border-white/10 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${file.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-2.5">
                        <div
                          onClick={() => onPreviewFile(file)}
                          className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 cursor-pointer hover:text-white transition"
                        >
                          <CategoryIcon className="w-4 h-4" />
                        </div>

                        {!isTrashView && (
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(file.id)}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              file.isFavorite
                                ? 'text-amber-300'
                                : 'text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mb-2.5">
                      <h4
                        onClick={() => onPreviewFile(file)}
                        className="text-xs font-medium text-zinc-200 group-hover:text-white truncate cursor-pointer"
                        title={file.name}
                      >
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-mono">
                        <span>{VFSService.formatBytes(file.size)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-emerald-400/80">
                          <Lock className="w-2.5 h-2.5" /> AES
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {isTrashView ? (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          onClick={() => onRestoreFromTrash(file.id)}
                          className="flex-1 py-1 px-2 rounded-md bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 text-[11px] font-medium flex items-center justify-center gap-1 transition cursor-pointer border border-emerald-800/40"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onPermanentDelete(file.id)}
                          className="py-1 px-2.5 rounded-md bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-[11px] font-medium flex items-center justify-center gap-1 transition cursor-pointer border border-rose-800/40"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <button
                          onClick={() => onPreviewFile(file)}
                          className="text-[11px] font-medium text-zinc-400 hover:text-zinc-100 flex items-center gap-1 cursor-pointer transition"
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDownloadFile(file)}
                            title="Download"
                            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onMoveToTrash(file.id)}
                            title="Move to Recycle Bin"
                            className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Table List View */
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden">
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-6 sm:col-span-5 flex items-center gap-2">Name</div>
                <div className="hidden sm:block sm:col-span-2">Security</div>
                <div className="hidden md:block md:col-span-2">Size</div>
                <div className="hidden lg:block lg:col-span-1">Chunks</div>
                <div className="col-span-6 sm:col-span-5 md:col-span-3 lg:col-span-2 text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-zinc-800/60">
                {files.map((file) => {
                  const CategoryIcon = getFileCategoryIcon(file.category);

                  return (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center hover:bg-zinc-800/40 transition text-xs select-none group"
                    >
                      {/* Name */}
                      <div
                        onClick={() => onPreviewFile(file)}
                        className="col-span-6 sm:col-span-5 flex items-center gap-2.5 truncate cursor-pointer pr-2"
                      >
                        {file.category === 'images' && file.downloadUrl ? (
                          <div className="w-7 h-7 rounded-md overflow-hidden bg-black border border-zinc-800 shrink-0 flex items-center justify-center">
                            <img src={file.downloadUrl} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-400 shrink-0">
                            <CategoryIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="truncate min-w-0">
                          <span className="font-medium text-zinc-200 group-hover:text-white truncate block">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 sm:hidden">
                            {VFSService.formatBytes(file.size)}
                          </span>
                        </div>
                      </div>

                      {/* Security */}
                      <div className="hidden sm:flex sm:col-span-2 items-center gap-1.5 text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/50 text-[10px] font-mono text-emerald-400">
                          AES-256
                        </span>
                      </div>

                      {/* Size */}
                      <div className="hidden md:block md:col-span-2 font-mono text-[11px] text-zinc-400">
                        {VFSService.formatBytes(file.size)}
                      </div>

                      {/* Chunks */}
                      <div className="hidden lg:block lg:col-span-1 font-mono text-[11px] text-zinc-500">
                        {file.chunkCount} part(s)
                      </div>

                      {/* Actions */}
                      <div className="col-span-6 sm:col-span-5 md:col-span-3 lg:col-span-2 flex items-center justify-end gap-1">
                        {isTrashView ? (
                          <>
                            <button
                              onClick={() => onRestoreFromTrash(file.id)}
                              title="Restore"
                              className="px-2 py-1 rounded-md bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 text-xs font-medium flex items-center gap-1 transition cursor-pointer border border-emerald-800/40"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span className="hidden sm:inline">Restore</span>
                            </button>
                            <button
                              onClick={() => onPermanentDelete(file.id)}
                              title="Delete"
                              className="px-2 py-1 rounded-md bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-xs font-medium flex items-center gap-1 transition cursor-pointer border border-rose-800/40"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onToggleFavorite(file.id)}
                              title={file.isFavorite ? 'Unstar' : 'Star'}
                              className={`p-1.5 rounded-md transition cursor-pointer ${
                                file.isFavorite
                                  ? 'text-amber-300'
                                  : 'text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => onPreviewFile(file)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDownloadFile(file)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onMoveToTrash(file.id)}
                              className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                              title="Move to Recycle Bin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
