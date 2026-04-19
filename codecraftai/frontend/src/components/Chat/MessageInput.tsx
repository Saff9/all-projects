import { useState, useRef, useEffect } from "react";
import { Model } from "../../types";
import { useSkillsStore } from "../../store/skillsStore";
import { useMemoryStore } from "../../store/memoryStore";
import SkillsPanel from "./SkillsPanel";
import { Send, Image as ImageIcon, Video, FileText, Trash2, Globe, Sparkles, Brain, Cpu } from "lucide-react";
import toast from "react-hot-toast";

interface MessageInputProps {
  onSend: (prompt: string, imageFile?: File) => Promise<void>;
  loading: boolean;
  selectedModel: Model | null;
}

export default function MessageInput({ onSend, loading, selectedModel }: MessageInputProps) {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [skillIndicator, setSkillIndicator] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getActiveSkillIds } = useSkillsStore();
  const { facts } = useMemoryStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format. Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller image.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    toast.success("Image attachment staged successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !imageFile) return;

    const currentPrompt = prompt;
    const currentImage = imageFile || undefined;

    setPrompt("");
    setImageFile(null);
    setImagePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Simulate Agent Skills real-time indicator
    const activeSkills = getActiveSkillIds();
    if (activeSkills.length > 0) {
      if (activeSkills.includes("open_claw")) setSkillIndicator("Open Claw is navigating web & parsing AST...");
      else if (activeSkills.includes("hermes")) setSkillIndicator("Hermes is enforcing structured JSON schema...");
      else if (activeSkills.includes("pi")) setSkillIndicator("Pi is reflecting on conversational sentiment...");
      else if (activeSkills.includes("open_code_ai")) setSkillIndicator("Open Code AI is verifying git diffs...");
      
      await new Promise((r) => setTimeout(r, 1200));
      setSkillIndicator(null);
    }

    await onSend(currentPrompt, currentImage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getAttachmentButtonConfig = () => {
    if (!selectedModel) return { label: "Attach Image", icon: ImageIcon, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900" };
    if (selectedModel.type === "video") return { label: "Upload Image (to Video)", icon: Video, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 animate-pulse" };
    if (selectedModel.type === "image") return { label: "Reference Image", icon: ImageIcon, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900" };
    return { label: "Attach Vision Image", icon: FileText, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900" };
  };

  const activeSkillsCount = getActiveSkillIds().length;
  const buttonConfig = getAttachmentButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition duration-200 relative ${
        isDragging ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 border-2 border-dashed" : ""
      }`}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-xs flex items-center justify-center z-10 rounded-t-2xl animate-fade-in pointer-events-none">
          <div className="bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
            <ImageIcon size={18} /> Drop Image File to Attach to Prompt
          </div>
        </div>
      )}

      {/* Skills Indicator Banner */}
      {skillIndicator && (
        <div className="mb-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-200 text-xs font-mono flex items-center gap-2.5 animate-pulse shadow-inner">
          <Cpu size={16} className="text-blue-500 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{skillIndicator}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Staged Image Preview */}
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md group animate-scale-up">
            <img src={imagePreview} alt="Staged Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
              title="Remove Image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-2 shadow-inner focus-within:border-blue-500 dark:focus-within:border-blue-500 transition duration-200">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDragging ? "Drop image to attach..." : "Ask Code Craft anything... (Press Ctrl + Enter to send)"}
            rows={1}
            disabled={loading || !!skillIndicator}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none font-sans leading-relaxed max-h-[12rem] overflow-y-auto"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center gap-1.5 pb-1 pr-1 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Dedicated Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || !!skillIndicator}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer hover:opacity-80 active:scale-95 ${buttonConfig.color}`}
              title={buttonConfig.label}
            >
              <ButtonIcon size={14} />
              <span className="hidden sm:inline font-mono">{buttonConfig.label}</span>
            </button>

            {/* Agent Skills Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSkillsOpen(true)}
              disabled={loading || !!skillIndicator}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                activeSkillsCount > 0
                  ? "bg-blue-600 text-white border-blue-500 shadow-blue-500/20"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
              title="Configure Agent Skills"
            >
              <Sparkles size={14} className={activeSkillsCount > 0 ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
              <span className="hidden md:inline font-mono">Skills ({activeSkillsCount})</span>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!prompt.trim() && !imageFile) || !!skillIndicator}
              className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              title="Send Message (Ctrl + Enter)"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Agent Skills Drawer Panel */}
      <SkillsPanel isOpen={isSkillsOpen} onClose={() => setIsSkillsOpen(false)} />
    </div>
  );
}
