import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, FileText, Image } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { chatService } from '../../services/chat';
import { fileService } from '../../services/files';

interface ChatInputProps {
  conversationId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedProvider,
    selectedModel,
    addMessage,
    setStreamingMessage,
    appendStreamingToken,
    setStreamingMessageId,
    clearStreaming,
    addToast,
  } = useStore();

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    const fileIds: string[] = [];
    for (const file of files) {
      try {
        const response = await fileService.uploadFile(
          file,
          conversationId,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
          }
        );
        fileIds.push(response.id);
      } catch (error) {
        addToast({
          type: 'error',
          message: `Failed to upload ${file.name}`,
        });
      }
    }
    return fileIds;
  };

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;
    if (!selectedProvider || !selectedModel) {
      addToast({
        type: 'error',
        message: 'Please select a provider and model',
      });
      return;
    }

    const content = message.trim();
    setMessage('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Upload files first
      const fileIds = await uploadFiles();
      setFiles([]);
      setUploadProgress({});

      // Add user message to UI
      const userMessage = {
        id: `temp-${Date.now()}`,
        role: 'user' as const,
        content,
        created_at: new Date().toISOString(),
        file_ids: fileIds,
      };
      addMessage(userMessage);

      // Stream the response
      setStreamingMessage('');
      let fullResponse = '';
      let hasStarted = false;
      let hasError = false;

      await chatService.streamMessage(
        conversationId,
        {
          content,
          provider: selectedProvider,
          model: selectedModel,
          file_ids: fileIds,
        },
        {
          onStart: (data) => {
            hasStarted = true;
            setStreamingMessageId(data.message_id);
          },
          onToken: (data) => {
            if (!hasError) {
              fullResponse += data.token;
              appendStreamingToken(data.token);
            }
          },
          onError: (data) => {
            hasError = true;
            addToast({
              type: 'error',
              message: data.error,
            });
            clearStreaming();
            setIsLoading(false);
          },
          onDone: () => {
            // Only add message if we started and didn't error
            if (hasStarted && !hasError) {
              const assistantMessage = {
                id: `temp-assistant-${Date.now()}`,
                role: 'assistant' as const,
                content: fullResponse,
                created_at: new Date().toISOString(),
              };
              addMessage(assistantMessage);
            }
            clearStreaming();
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Send error:', error);
      addToast({
        type: 'error',
        message: 'Failed to send message',
      });
      setIsLoading(false);
      clearStreaming();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const canSend = (message.trim().length > 0 || files.length > 0) && !isLoading;

  return (
    <div className="border-t border-[var(--border-primary)] bg-[var(--bg-primary)]">
      {/* File attachments */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm"
            >
              <span className="text-[var(--text-tertiary)]">{getFileIcon(file)}</span>
              <span className="text-[var(--text-primary)] truncate max-w-[120px]">
                {file.name}
              </span>
              <span className="text-[var(--text-tertiary)] text-xs">
                {fileService.formatFileSize(file.size)}
              </span>
              {uploadProgress[file.name] !== undefined && (
                <div className="w-14 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] transition-all duration-300"
                    style={{ width: `${uploadProgress[file.name]}%` }}
                  />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--accent-error)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 pr-20 resize-none focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] placeholder:text-[var(--text-tertiary)] transition-all duration-200"
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 text-xs text-[var(--text-tertiary)]">
            {message.length > 0 && <span>{message.length} chars</span>}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`p-3 rounded-xl transition-all duration-200 ${
            canSend
              ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] shadow-sm'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Provider indicator */}
      <div className="px-4 pb-3 text-center">
        {selectedProvider && selectedModel ? (
          <span className="text-xs text-[var(--text-tertiary)]">
            Using <span className="text-[var(--accent-primary)] font-medium">{selectedProvider}</span>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-secondary)]">{selectedModel}</span>
          </span>
        ) : (
          <span className="text-xs text-[var(--text-tertiary)]">
            Select a provider to start chatting
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
