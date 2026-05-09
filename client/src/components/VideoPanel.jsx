// HTML5 <video> element — satisfies the course Video requirement.
// Place your intro video at client/public/videos/intro.mp4 (or .webm).

export default function VideoPanel() {
  return (
    <div className="video-panel">
      <video
        controls
        poster="/videos/poster.jpg"
        style={{ width: '100%', borderRadius: 12, background: '#000' }}
      >
        <source src="/videos/intro.mp4" type="video/mp4" />
        <source src="/videos/intro.webm" type="video/webm" />
        <p style={{ color: '#6b7280', padding: 16 }}>
          Your browser does not support HTML5 video.
          Place <code>intro.mp4</code> in <code>client/public/videos/</code>.
        </p>
      </video>
      <p className="meta" style={{ marginTop: 8 }}>
        FitTogether — connecting fitness communities.
      </p>
    </div>
  );
}
