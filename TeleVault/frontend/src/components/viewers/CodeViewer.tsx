import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeViewerProps {
  fileName: string;
  fileSizeFormatted: string;
  fileContent?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  fileName,
  fileSizeFormatted,
  fileContent,
}) => {
  const [copied, setCopied] = useState(false);

  const defaultContent = `#!/usr/bin/env python3
"""
TeleVault Zero-Knowledge Cryptographic Client
Decrypted dynamically from private Telegram channel.
"""

import asyncio
from televault.crypto import AESGCMDecryptor, Argon2KDF
from telethon import TelegramClient

async def load_cloud_vault(session_token: str, master_pass: str):
    key = Argon2KDF.derive_key(master_pass)
    client = TelegramClient(session_token)
    await client.connect()
    
    vault_stream = await client.stream_channel_chunks(
        channel_id="🛡️ TeleVault Storage",
        decryptor=AESGCMDecryptor(key)
    )
    
    print("[TeleVault] ${fileName} verified & decrypted successfully!")
    return vault_stream

if __name__ == "__main__":
    asyncio.run(load_cloud_vault("vault_session", "master_secret"))
`;

  const codeToShow = fileContent || defaultContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeToShow.trim().split('\n');

  return (
    <div className="w-full rounded-2xl bg-[#090e15] border border-white/5 overflow-hidden flex flex-col font-mono text-xs">
      {/* Code Viewer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111823] border-b border-white/5">
        <div className="flex items-center gap-2 text-[#7f8c99]">
          <Terminal className="w-4 h-4 text-[#2aabee]" />
          <span className="text-white font-semibold">{fileName}</span>
          <span className="text-[11px] font-normal">({fileSizeFormatted})</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#4fae4e]" />
              <span className="text-[#4fae4e]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#7f8c99]" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Lines Display */}
      <div className="p-4 max-h-[55vh] overflow-y-auto overflow-x-auto select-text leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="pr-4 select-none text-[#5e6b77] text-right w-8">
                  {idx + 1}
                </td>
                <td className="text-[#f5f5f5] whitespace-pre font-mono">
                  {line.startsWith('#') || line.startsWith('//') || line.startsWith('/*') ? (
                    <span className="text-[#7f8c99] italic">{line}</span>
                  ) : line.includes('def ') || line.includes('function ') || line.includes('import ') ? (
                    <span className="text-[#2aabee]">{line}</span>
                  ) : line.includes('"') || line.includes("'") ? (
                    <span className="text-[#4fae4e]">{line}</span>
                  ) : (
                    line
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
