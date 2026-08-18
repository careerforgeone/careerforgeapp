// Embeds a YouTube video by ID using the privacy-enhanced domain.
// IMPORTANT: true "Private" YouTube videos cannot be embedded or played by
// anyone outside the owner's own Google account — YouTube blocks that by
// design. For simulation videos participants can watch via a dashboard
// like this, the video needs to be set to "Unlisted" (not searchable, but
// playable by anyone with the link/ID) rather than "Private".
export default function VideoEmbed({ youtubeId, title }) {
  return (
    <div className="ratio ratio-16x9 rounded-4 overflow-hidden bg-dark">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
