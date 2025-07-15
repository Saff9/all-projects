import { useState } from "react";
import { SendHorizonal } from "lucide-react";

export default function ChatInput({ onSend }: { onSend: (query: string) => void }) {
  const [text, setText] = useState("");

  return (
    <div className="p-4 border-t border-gray-800 flex">
      <input
        className="flex-1 bg-transparent border border-gray-700 rounded-xl px-4 py-2 focus:outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend(text)}
        placeholder="Ask me anything..."
      />
      <button
        className="ml-2 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-xl"
        onClick={() => onSend(text)}
      >
        <SendHorizonal size={18} />
      </button>
    </div>
  );
}
