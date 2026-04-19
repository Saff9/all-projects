import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchModels, generate, extractMemories } from "../../services/api";
import { Model, Message, ChatThread as ChatThreadType } from "../../types";
import { v4 as uuid } from "uuid";
import { addMessage, createThread } from "../../store/chatStore";
import { useCostTracker } from "../../hooks/useCostTracker";
import { useEncryption } from "../../hooks/useEncryption";
import { useMemoryStore } from "../../store/memoryStore";
import MessageInput from "./MessageInput";
import MediaPlayer from "../Media/MediaPlayer";
import DownloadButton from "../Media/DownloadButton";
import Spinner from "../Common/Spinner";
import { Copy, Bot, User, Check, Sparkles, Lock, AlertTriangle, RefreshCw, FileText, Code, Maximize2, Printer, Download, Globe, X } from "lucide-react";
import toast from "react-hot-toast";

interface ContextType {
  activeThread: ChatThreadType | null;
  onThreadUpdated: (thread: ChatThreadType) => void;
}

interface ArtifactData {
  title: string;
  content: string;
  language: string;
  type: "code" | "markdown";
}

export default function ChatThread() {
  const { activeThread, onThreadUpdated } = useOutletContext<ContextType>();
  
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [messages, setMessages] = useState<Message[]>(activeThread?.messages || []);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addCost } = useCostTracker();
  const { encrypt, decrypt, isLocked, unlock } = useEncryption();
  const { addFacts } = useMemoryStore();

  useEffect(() => {
    fetchModels().then((res) => {
      setModels(res);
      if (res.length > 0 && !selectedModel) {
        setSelectedModel(res[0]);
      }
    }).catch((err) => toast.error("Failed to load AI models: " + err.message));
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadMessages = async () => {
      if (!activeThread) {
        if (isMounted) setMessages([]);
        return;
      }

      if (isLocked) {
        if (isMounted) setMessages(activeThread.messages);
        return;
      }

      const decryptedMessages = await Promise.all(
        activeThread.messages.map(async (msg) => {
          if (msg.content.startsWith("ENC:")) {
            try {
              // Format: ENC:<iv>:<ciphertext> — iv is fixed length, rest is ciphertext
              const withoutPrefix = msg.content.slice(4); // remove "ENC:"
              const colonIdx = withoutPrefix.indexOf(":");
              if (colonIdx !== -1) {
                const iv = withoutPrefix.slice(0, colonIdx);
                const ciphertext = withoutPrefix.slice(colonIdx + 1);
                const decryptedContent = await decrypt(iv, ciphertext);
                return { ...msg, content: decryptedContent };
              }
            } catch (err) {
              console.error("Failed to decrypt message:", err);
              return { ...msg, content: "🔒 [Encrypted — unlock with your passphrase]" };
            }
          }
          return msg;
        })
      );

      if (isMounted) {
        setMessages(decryptedMessages);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [activeThread, isLocked, decrypt]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const executeGeneration = async (prompt: string, imageBase64?: string, retryMsgId?: string) => {
    if (!selectedModel) return toast.error("Please select an AI model first");
    if (isLocked) return toast.error("Please unlock storage first with your passphrase");

    setLoading(true);
    let currentThread = activeThread;
    if (!currentThread) {
      currentThread = await createThread(prompt.slice(0, 30) + "...");
      onThreadUpdated(currentThread);
    }

    let userMsgId = uuid();
    if (!retryMsgId) {
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        content: prompt,
        type: imageBase64 ? "image" : "text",
        mediaUrl: imageBase64,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      try {
        const encUser = await encrypt(prompt);
        await addMessage(currentThread.id, { ...userMsg, content: `ENC:${encUser.iv}:${encUser.ciphertext}` });
      } catch (e) {
        await addMessage(currentThread.id, userMsg);
      }
    } else {
      setMessages((prev) => prev.filter(m => m.id !== retryMsgId));
    }

    try {
      extractMemories(prompt).then((extractedFacts) => {
        if (extractedFacts && extractedFacts.length > 0) {
          addFacts(extractedFacts);
          toast.success(`🧠 Learned ${extractedFacts.length} new long-term memory facts!`);
        }
      }).catch(() => {});

      let assistantMsgId = uuid();
      const assistantMsgBase: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        type: selectedModel.type,
        timestamp: Date.now(),
        model: selectedModel.display_name,
        provider: selectedModel.provider,
      };

      if (selectedModel.type === "text") {
        setMessages((prev) => [...prev, assistantMsgBase]);
      }

      const result = await generate({
        provider: selectedModel.provider,
        model: selectedModel.model_id,
        prompt,
        generation_type: selectedModel.type,
        image: imageBase64,
        streaming: selectedModel.type === "text",
        onChunk: (chunk: string) => {
          setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: chunk } : m));
        },
      });

      if (result.cost) {
        addCost({ cost: result.cost, model: `${selectedModel.provider}/${selectedModel.model_id}` });
      }

      const finalAssistantMsg: Message = {
        ...assistantMsgBase,
        content: result.content,
        type: result.type,
        mediaUrl: result.type !== "text" ? result.content : undefined,
        cost: result.cost,
      };

      if (selectedModel.type === "text") {
        setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? finalAssistantMsg : m));
      } else {
        setMessages((prev) => [...prev, finalAssistantMsg]);
      }

      try {
        const encAssistant = await encrypt(result.content);
        await addMessage(currentThread.id, { ...finalAssistantMsg, content: `ENC:${encAssistant.iv}:${encAssistant.ciphertext}` });
      } catch (e) {
        await addMessage(currentThread.id, finalAssistantMsg);
      }
      
      onThreadUpdated(currentThread);
    } catch (err: any) {
      const errorMsg: Message = {
        id: uuid(),
        role: "assistant",
        content: prompt,
        type: "text",
        timestamp: Date.now(),
        model: selectedModel.display_name,
        provider: selectedModel.provider,
        error: err.message || "API Generation Failed. Please check your API keys or network connection.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (prompt: string, imageFile?: File) => {
    let imageBase64: string | undefined = undefined;
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
    }
    await executeGeneration(prompt, imageBase64);
  };

  const handleRetry = async (failedMsg: Message) => {
    await executeGeneration(failedMsg.content, undefined, failedMsg.id);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (msg: Message, format: "pdf" | "md" | "txt" | "html") => {
    const title = `code_craft_export_${msg.timestamp}`;
    if (format === "txt") {
      const blob = new Blob([msg.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported as Plain Text (.txt)");
    } else if (format === "md") {
      const mdContent = `# Code Craft AI Export (${msg.model || "AI Assistant"})\n\n${msg.content}`;
      const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported as Markdown (.md)");
    } else if (format === "html") {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Code Craft Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1f2937; background: #f9fafb; }
    pre { background: #111827; color: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <h1>Code Craft AI Export</h1>
  <p><strong>Model:</strong> ${msg.model || "AI Assistant"}</p>
  <hr>
  <div>${msg.content.replace(/\n/g, "<br>")}</div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported as HTML (.html)");
    } else if (format === "pdf") {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups to export PDF.");
        return;
      }
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Code Craft PDF Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #000; background: #fff; }
    pre { background: #f3f4f6; color: #111827; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; border: 1px solid #e5e7eb; }
    code { font-family: monospace; }
    @media print {
      body { padding: 0; margin: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <h2>Code Craft AI Export</h2>
  <p><strong>Model:</strong> ${msg.model || "AI Assistant"} | <strong>Date:</strong> ${new Date(msg.timestamp).toLocaleString()}</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;">
  <div>${msg.content.replace(/\n/g, "<br>")}</div>
  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("Generating PDF print view...");
    }
  };

  const handleExportArtifact = (artifact: ArtifactData, format: "pdf" | "md" | "txt" | "html") => {
    const title = artifact.title.replace(/[^a-zA-Z0-9_]/g, "_");
    if (format === "txt") {
      const blob = new Blob([artifact.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported Artifact as Plain Text (.txt)");
    } else if (format === "md") {
      const blob = new Blob([artifact.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported Artifact as Markdown (.md)");
    } else if (format === "html") {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${artifact.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1f2937; background: #f9fafb; }
    pre { background: #111827; color: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <h1>${artifact.title}</h1>
  <hr>
  ${artifact.type === "markdown" ? `<div>${artifact.content.replace(/\n/g, "<br>")}</div>` : `<pre><code>${artifact.content}</code></pre>`}
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported Artifact as HTML (.html)");
    } else if (format === "pdf") {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Popup blocked! Please allow popups to export PDF.");
        return;
      }
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${artifact.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #000; background: #fff; }
    pre { background: #f3f4f6; color: #111827; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; border: 1px solid #e5e7eb; }
    code { font-family: monospace; }
    @media print {
      body { padding: 0; margin: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <h2>${artifact.title}</h2>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;">
  ${artifact.type === "markdown" ? `<div>${artifact.content.replace(/\n/g, "<br>")}</div>` : `<pre><code>${artifact.content}</code></pre>`}
  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("Generating Artifact PDF print view...");
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 sm:p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-200 dark:border-amber-800/60 animate-bounce">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-mono">Encrypted Memory Locked</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-sans">Your local chat history is secured with military-grade AES-GCM encryption. Please enter your passphrase to unlock your AI memory.</p>
        <div className="w-full flex gap-2">
          <input
            type="password"
            value={passphraseInput}
            onChange={(e) => setPassphraseInput(e.target.value)}
            placeholder="Enter passphrase..."
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 font-mono"
            onKeyDown={(e) => e.key === "Enter" && unlock(passphraseInput)}
          />
          <button
            onClick={() => unlock(passphraseInput)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md active:scale-95 cursor-pointer"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      {/* Top Model Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md gap-3 z-10 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {models.map((m) => (
            <button
              key={m.model_id}
              onClick={() => setSelectedModel(m)}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition shrink-0 border cursor-pointer ${
                selectedModel?.model_id === m.model_id
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-xs"
              }`}
            >
              <img 
                src={m.logo_url} 
                alt={m.provider} 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-mono">{m.display_name}</span>
            </button>
          ))}
        </div>
        {selectedModel && (
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 px-2 sm:px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800/60 font-mono">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
              selectedModel.is_free 
                ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800" 
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
            }`}>
              {selectedModel.is_free ? "FREE" : "PAID"}
            </span>
            <span>Ctx: <strong className="text-gray-700 dark:text-gray-200">{selectedModel.context_length} tk</strong></span>
            <span>Cost: <strong className="text-gray-700 dark:text-gray-200">${selectedModel.cost_per_1k_tokens}/1k</strong></span>
            {selectedModel.tier && <span className="hidden md:inline bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px]">{selectedModel.tier}</span>}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Bot size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-mono">Welcome to Code Craft</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed font-sans">
              I am your autonomous AI assistant, designed to grow with you over time. I securely learn and retain only the most useful architectural context and coding preferences to assist you.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`group flex gap-2 sm:gap-3 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-1 ${
                msg.role === "user" ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-blue-500 border border-gray-100 dark:border-gray-700"
              }`}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`max-w-[95%] sm:max-w-[85%] flex flex-col gap-1`}>
                {/* Bubble card */}
                <div className={`rounded-2xl shadow-sm transition-all duration-200 overflow-hidden ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none px-4 py-3"
                    : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-800"
                }`}>
                  {msg.role === "user" ? (
                    <MarkdownContent content={msg.content} onOpenArtifact={(art) => setActiveArtifact(art)} />
                  ) : (
                    <div className="flex flex-col">
                      {/* Message Body */}
                      <div className="px-4 py-3.5">
                        {msg.error ? (
                          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-900 dark:text-red-200 text-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 font-bold">
                              <AlertTriangle size={16} className="text-red-500 shrink-0" />
                              <span>Generation Error</span>
                            </div>
                            <p className="font-mono bg-red-100/50 dark:bg-red-900/50 p-2 rounded-lg text-[11px] leading-relaxed break-words">{msg.error}</p>
                            <button
                              onClick={() => handleRetry(msg)}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition text-xs w-fit active:scale-95 cursor-pointer"
                            >
                              <RefreshCw size={12} />
                              <span>Retry</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <MarkdownContent content={msg.content} onOpenArtifact={(art) => setActiveArtifact(art)} />
                            {msg.type === "image" && msg.mediaUrl && (
                              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
                                <img src={msg.mediaUrl} alt="Generated" className="w-full h-auto object-cover max-h-[28rem]" />
                              </div>
                            )}
                            {msg.type === "video" && msg.mediaUrl && (
                              <MediaPlayer url={msg.mediaUrl} />
                            )}
                          </>
                        )}
                      </div>

                      {/* Premium Footer Bar */}
                      {!msg.error && (
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800/80 text-[11px] text-gray-500 dark:text-gray-400">
                          {/* Model badge & Cost */}
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {msg.model && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-[10px] truncate max-w-[120px] sm:max-w-[180px]" title={msg.model}>
                                <Bot size={11} className="text-blue-500 shrink-0" />
                                <span className="truncate">{msg.model}</span>
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                              msg.cost === undefined || msg.cost === 0
                                ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-100/30 dark:border-green-900/30"
                                : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100/30 dark:border-blue-900/30"
                            }`}>
                              {msg.cost === undefined || msg.cost === 0 ? "Free" : `$${msg.cost.toFixed(6)}`}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              title="Copy response"
                              className="p-1 rounded hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-400"
                            >
                              {copiedId === msg.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                            </button>

                            <div className="w-[1px] h-3 bg-gray-200 dark:bg-gray-800 mx-0.5" />

                            {/* Export buttons */}
                            <button
                              onClick={() => handleExport(msg, "pdf")}
                              title="Export as PDF"
                              className="p-1 rounded hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-400"
                            >
                              <Printer size={13} />
                            </button>

                            <button
                              onClick={() => handleExport(msg, "md")}
                              title="Export as Markdown (.md)"
                              className="p-1 rounded hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-400"
                            >
                              <FileText size={13} />
                            </button>

                            <button
                              onClick={() => handleExport(msg, "txt")}
                              title="Export as Text (.txt)"
                              className="p-1 rounded hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-400"
                            >
                              <FileText size={13} className="opacity-60" />
                            </button>

                            <button
                              onClick={() => handleExport(msg, "html")}
                              title="Export as HTML"
                              className="p-1 rounded hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer text-gray-400"
                            >
                              <Globe size={13} />
                            </button>

                            {msg.mediaUrl && (
                              <>
                                <div className="w-[1px] h-3 bg-gray-200 dark:bg-gray-800 mx-0.5" />
                                <DownloadButton url={msg.mediaUrl} filename={`media_${msg.timestamp}.${msg.type === "image" ? "png" : "mp4"}`} />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User action bar (only on hover) */}
                {msg.role === "user" && !msg.error && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-row-reverse">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy message"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-850 transition cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-2 sm:gap-3 flex-row items-center animate-fade-in">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-gray-800 text-blue-500 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-md animate-pulse">
              <Bot size={14} />
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">
              <Spinner size={16} />
              <span>{selectedModel?.display_name || "AI Model"} is generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSend} loading={loading} selectedModel={selectedModel} />

      {/* Claude AI Interactive Artifact Preview Modal */}
      {activeArtifact && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 font-bold font-mono text-sm">
                  {activeArtifact.type === "markdown" ? <FileText size={20} /> : <Code size={20} />}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono truncate">{activeArtifact.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Claude AI Interactive Artifact Preview</p>
                </div>
              </div>

              {/* Actions / Export Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => handleExportArtifact(activeArtifact, "pdf")} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition shadow-xs cursor-pointer"><Printer size={14} /><span>PDF</span></button>
                <button onClick={() => handleExportArtifact(activeArtifact, "md")} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition shadow-xs cursor-pointer"><Download size={14} /><span>MD</span></button>
                <button onClick={() => handleExportArtifact(activeArtifact, "txt")} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition shadow-xs cursor-pointer"><FileText size={14} /><span>TXT</span></button>
                <button onClick={() => handleExportArtifact(activeArtifact, "html")} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition shadow-xs cursor-pointer"><Globe size={14} /><span>HTML</span></button>
                <button onClick={() => { navigator.clipboard.writeText(activeArtifact.content); toast.success("Artifact content copied!"); }} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition shadow-md cursor-pointer"><Copy size={14} /><span>Copy</span></button>
                <button onClick={() => setActiveArtifact(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"><X size={18} /></button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900 font-sans leading-relaxed select-all">
              {activeArtifact.type === "markdown" ? (
                <div className="max-w-4xl mx-auto prose dark:prose-invert text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans space-y-1">
                  {parseMarkdownToReact(activeArtifact.content)}
                </div>
              ) : (
                <pre className="p-6 bg-gray-950 text-gray-100 rounded-2xl overflow-x-auto font-mono text-xs shadow-inner leading-normal border border-gray-800">
                  {activeArtifact.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to parse inline markdown styles (bold, italic, inline code, links)
function renderInlineStyles(text: string): React.ReactNode {
  const parts: { type: "text" | "code" | "bold" | "italic" | "link"; content: string; href?: string }[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    const codeIdx = remaining.indexOf("`");
    const boldIdx = remaining.indexOf("**");
    const italicIdx = remaining.indexOf("*");
    const linkIdx = remaining.indexOf("[");
    
    const indices = [
      { type: "code", index: codeIdx },
      { type: "bold", index: boldIdx },
      { type: "italic", index: italicIdx },
      { type: "link", index: linkIdx }
    ].filter(x => x.index !== -1).sort((a, b) => a.index - b.index);
    
    if (indices.length === 0) {
      parts.push({ type: "text", content: remaining });
      break;
    }
    
    const first = indices[0];
    if (first.index > 0) {
      parts.push({ type: "text", content: remaining.slice(0, first.index) });
      remaining = remaining.slice(first.index);
    }
    
    if (first.type === "code") {
      const closing = remaining.indexOf("`", 1);
      if (closing !== -1) {
        parts.push({ type: "code", content: remaining.slice(1, closing) });
        remaining = remaining.slice(closing + 1);
      } else {
        parts.push({ type: "text", content: "`" });
        remaining = remaining.slice(1);
      }
    } else if (first.type === "bold") {
      const closing = remaining.indexOf("**", 2);
      if (closing !== -1) {
        parts.push({ type: "bold", content: remaining.slice(2, closing) });
        remaining = remaining.slice(closing + 2);
      } else {
        parts.push({ type: "text", content: "**" });
        remaining = remaining.slice(2);
      }
    } else if (first.type === "italic") {
      const closing = remaining.indexOf("*", 1);
      if (closing !== -1) {
        parts.push({ type: "italic", content: remaining.slice(1, closing) });
        remaining = remaining.slice(closing + 1);
      } else {
        parts.push({ type: "text", content: "*" });
        remaining = remaining.slice(1);
      }
    } else if (first.type === "link") {
      const closingBracket = remaining.indexOf("]");
      if (closingBracket !== -1) {
        const openParen = remaining.indexOf("(", closingBracket);
        const closeParen = remaining.indexOf(")", closingBracket);
        if (openParen === closingBracket + 1 && closeParen !== -1) {
          const linkText = remaining.slice(1, closingBracket);
          const linkUrl = remaining.slice(openParen + 1, closeParen);
          parts.push({ type: "link", content: linkText, href: linkUrl });
          remaining = remaining.slice(closeParen + 1);
          continue;
        }
      }
      parts.push({ type: "text", content: "[" });
      remaining = remaining.slice(1);
    }
  }
  
  return parts.map((part, idx) => {
    switch (part.type) {
      case "code":
        return <code key={idx} className="bg-gray-100 dark:bg-gray-800 text-red-650 dark:text-red-400 px-1 py-0.5 rounded font-mono text-[11px] font-semibold">{part.content}</code>;
      case "bold":
        return <strong key={idx} className="font-bold text-gray-900 dark:text-white">{part.content}</strong>;
      case "italic":
        return <em key={idx} className="italic text-gray-700 dark:text-gray-300">{part.content}</em>;
      case "link":
        return (
          <a key={idx} href={part.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            {part.content}
          </a>
        );
      default:
        return part.content;
    }
  });
}

// Parses multiline markdown block text into beautiful react lists, headings, and quotes
function parseMarkdownToReact(text: string): React.ReactNode {
  const lines = text.split("\n");
  
  return lines.map((line, lineIdx) => {
    // 1. Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInlineStyles(headingMatch[2]);
      const className = 
        level === 1 ? "text-lg sm:text-xl font-bold text-gray-950 dark:text-white mt-4 mb-2 font-mono" :
        level === 2 ? "text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mt-3 mb-2 font-mono" :
        level === 3 ? "text-sm sm:text-base font-bold text-gray-900 dark:text-gray-250 mt-2.5 mb-1.5 font-mono" :
        "text-xs sm:text-sm font-bold text-gray-850 dark:text-gray-350 mt-2 mb-1 font-mono";
      const Tag = `h${level}` as any;
      return <Tag key={lineIdx} className={className}>{content}</Tag>;
    }
    
    // 2. Check for bullet list items
    const listMatch = line.match(/^(\*|-)\s+(.*)$/);
    if (listMatch) {
      const content = renderInlineStyles(listMatch[2]);
      return (
        <ul key={lineIdx} className="list-disc pl-4 my-1 space-y-0.5">
          <li className="text-gray-800 dark:text-gray-200">{content}</li>
        </ul>
      );
    }
    
    // 3. Check for numbered list items
    const numListMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      const content = renderInlineStyles(numListMatch[2]);
      return (
        <ol key={lineIdx} className="list-decimal pl-4 my-1 space-y-0.5">
          <li className="text-gray-800 dark:text-gray-200">{content}</li>
        </ol>
      );
    }
    
    // 4. Check for blockquotes
    if (line.startsWith("> ")) {
      const content = renderInlineStyles(line.slice(2));
      return (
        <blockquote key={lineIdx} className="border-l-4 border-gray-300 dark:border-gray-700 pl-3 py-0.5 my-1.5 italic text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-950/10 rounded-r-md">
          {content}
        </blockquote>
      );
    }
    
    // 5. Default paragraph
    if (line.trim() === "") {
      return <div key={lineIdx} className="h-1.5" />;
    }
    
    return (
      <p key={lineIdx} className="my-1 leading-relaxed text-gray-800 dark:text-gray-200 font-sans">
        {renderInlineStyles(line)}
      </p>
    );
  });
}

function MarkdownContent({ content, onOpenArtifact }: { content: string; onOpenArtifact: (artifact: ArtifactData) => void }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const blocks: { type: "text" | "code" | "artifact"; content: string; language?: string; title?: string }[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let currentLang = "";
  let textBuffer: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        const fullCode = codeBuffer.join("\n");
        if (lines.length > 15 || fullCode.length > 300) {
          blocks.push({ type: "artifact", content: fullCode, language: currentLang, title: `artifact_${uuid().slice(0,6)}.${currentLang || "md"}` });
        } else {
          blocks.push({ type: "code", content: fullCode, language: currentLang });
        }
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (textBuffer.length > 0) {
          blocks.push({ type: "text", content: textBuffer.join("\n") });
          textBuffer = [];
        }
        currentLang = line.trim().slice(3).trim() || "code";
        inCodeBlock = true;
      }
    } else {
      if (inCodeBlock) {
        codeBuffer.push(line);
      } else {
        textBuffer.push(line);
      }
    }
  }

  if (textBuffer.length > 0) {
    blocks.push({ type: "text", content: textBuffer.join("\n") });
  }
  if (codeBuffer.length > 0) {
    blocks.push({ type: "code", content: codeBuffer.join("\n"), language: currentLang });
  }

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed font-sans break-words w-full overflow-hidden">
      {blocks.map((block, idx) => {
        if (block.type === "artifact") {
          return (
            <div 
              key={idx}
              onClick={() => onOpenArtifact({ title: block.title || "artifact.md", content: block.content, language: block.language || "markdown", type: block.language === "markdown" ? "markdown" : "code" })}
              className="my-3 p-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 border border-gray-700/60 shadow-xl flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-200">
                  {block.language === "markdown" ? <FileText size={20} /> : <Code size={20} />}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate font-mono">{block.title}</h4>
                  <p className="text-[11px] text-gray-400 truncate">Click to open interactive Claude AI Artifact view</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCopyCode(block.content, idx); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition shadow-xs cursor-pointer"
                  title="Quick Copy"
                >
                  {copiedCodeIndex === idx ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md group-hover:bg-blue-500 transition">
                  <Maximize2 size={14} />
                </div>
              </div>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <div key={idx} className="my-3 rounded-xl overflow-hidden bg-gray-900 dark:bg-gray-950 border border-gray-700 shadow-lg font-mono text-xs w-full">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 text-gray-300">
                <span className="font-bold text-[11px] uppercase tracking-wider">{block.language}</span>
                <button
                  onClick={() => handleCopyCode(block.content, idx)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold text-[11px] transition active:scale-95 cursor-pointer shadow-xs"
                  title="Copy Code Snippet"
                >
                  {copiedCodeIndex === idx ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedCodeIndex === idx ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
              <div className="p-4 overflow-x-auto text-gray-100 whitespace-pre font-mono leading-normal select-all">
                {block.content}
              </div>
            </div>
          );
        }
        return (
          <div key={idx} className="space-y-1 font-sans">
            {parseMarkdownToReact(block.content)}
          </div>
        );
      })}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
