// About / Media page.
// Satisfies:  Video requirement (VideoPanel with <video>)
//             CSS3 multiple-columns (.about-columns)
//             CSS3 text-shadow (.hero-title, .page-title)

import VideoPanel from '../components/VideoPanel.jsx';

export default function AboutPage() {
  return (
    <div className="page-content">
      <h1 className="hero-title page-title">About FitTogether</h1>
      <p className="meta" style={{ marginBottom: 24 }}>
        Connecting fitness communities — one workout at a time.
      </p>

      {/* CSS3: multiple-columns */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="about-columns">
          <p>
            <strong>FitTogether</strong> is a social network built for people who love to move.
            Whether you are a seasoned marathon runner, a weekend cyclist, or someone
            just getting started in the gym, FitTogether gives you a place to connect
            with others who share your passion.
          </p>
          <p>
            Create or join <strong>workout groups</strong> that match your style and
            fitness level. Post questions, tips, events, and workout plans. Follow a
            personal feed of content from your groups and friends, and chat in real time
            with training partners right inside the app.
          </p>
          <p>
            The platform is built with a full MVC architecture using Node.js, Express,
            and MongoDB on the server, and React with jQuery Ajax on the client.
            Real-time messaging is powered by Socket.io, and the statistics dashboard
            uses D3.js charts that reflect live data from the database.
          </p>
          <p>
            Privacy controls let group managers decide who can join their community.
            Public groups are open to everyone. Private groups require an invitation
            or an approved join request from the manager. Posts inside private groups
            are never visible to non-members.
          </p>
        </div>
      </div>

      {/* HTML5 Video — course requirement */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }} className="page-title">Intro Video</h2>
        <VideoPanel />
        <p className="meta" style={{ marginTop: 8 }}>
          To show your own video: place <code>intro.mp4</code> inside{' '}
          <code>client/public/videos/</code> and refresh.
        </p>
      </div>

      {/* Tech stack summary */}
      <div className="card">
        <h2 style={{ marginTop: 0 }} className="page-title">Technology Stack</h2>
        <div className="about-columns">
          <div>
            <h4 style={{ margin: '0 0 6px' }}>Server</h4>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Node.js + Express (MVC)</li>
              <li>MongoDB + Mongoose</li>
              <li>express-session + bcrypt</li>
              <li>Socket.io (real-time chat)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ margin: '0 0 6px' }}>Client</h4>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>React 18 + Vite</li>
              <li>jQuery Ajax (centralized)</li>
              <li>D3.js (dynamic charts)</li>
              <li>CSS3 · HTML5 Video · Canvas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
