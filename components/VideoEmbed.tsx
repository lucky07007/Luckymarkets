export function VideoEmbed({ videoId }: { videoId?: string }) {
  if (!videoId) return null;
  return (
    <div className="video-embed" style={{ margin: "20px 0" }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Luckymarkets video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
