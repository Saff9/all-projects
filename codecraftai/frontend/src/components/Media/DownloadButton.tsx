import { Download } from "lucide-react";

export default function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, "_blank");
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      title="Download Media" 
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-medium transition shadow-sm"
    >
      <Download size={14} />
      <span>Download</span>
    </button>
  );
}
