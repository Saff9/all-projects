import ReactPlayer from "react-player";

export default function MediaPlayer({ url }: { url: string }) {
  return (
    <div className="aspect-video rounded-2xl overflow-hidden mt-2 border border-gray-200 dark:border-gray-800 shadow-lg bg-black">
      <ReactPlayer url={url} controls width="100%" height="100%" />
    </div>
  );
}
