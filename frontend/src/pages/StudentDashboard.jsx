import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import VideoEmbed from '../components/VideoEmbed.jsx';

// Placeholder data — wire this up to real endpoints on your backend
// (e.g. GET /api/me/enrollment, GET /api/me/modules) once ready.
// The YouTube IDs below are official public sample videos standing in for
// your real (Unlisted) simulation recordings — swap in real IDs.
const stageOrder = ['Train', 'Simulate', 'Mentor', 'Build', 'Review', 'Coach'];

const modules = [
  { id: 1, title: 'Simulation 1 — Client Kickoff Brief', youtubeId: 'M7lc1UVf-VE', duration: '18 min' },
  { id: 2, title: 'Simulation 2 — Working the Brief', youtubeId: 'aqz-KE-bpKQ', duration: '24 min' },
  { id: 3, title: 'Simulation 3 — Presenting Your Work', youtubeId: 'ysz5S6PUM-U', duration: '15 min' },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(modules[0]);
  const currentStageIndex = 1; // e.g. participant is on "Simulate" — wire to real progress data

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <section className="py-lg-10 py-6 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-8 gap-3">
          <div>
            <span className="eyebrow">Student Dashboard</span>
            <h1 className="fw-bold mt-2 mb-0 fs-3">Welcome back, {user?.name || 'there'}.</h1>
          </div>
          <button className="btn btn-outline-dark" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* Forge Process progress */}
        <div className="card rounded-5 shadow-sm p-6 mb-6">
          <h2 className="fs-6 text-uppercase text-muted mb-4">Your Forge Progress</h2>
          <div className="row g-3">
            {stageOrder.map((stage, i) => (
              <div className="col" key={stage}>
                <div
                  className={
                    'text-center p-3 rounded-4 ' +
                    (i === currentStageIndex
                      ? 'bg-primary text-white'
                      : i < currentStageIndex
                      ? 'bg-dark text-white'
                      : 'bg-light')
                  }
                >
                  <div className="fw-bold small">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-xs text-uppercase">{stage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="row g-4">
          {/* Video player + list */}
          <div className="col-lg-8">
            <div className="card rounded-5 shadow-sm p-4 mb-4">
              <VideoEmbed youtubeId={activeModule.youtubeId} title={activeModule.title} />
              <h3 className="fs-6 mt-4 mb-1">{activeModule.title}</h3>
              <span className="text-muted small">{activeModule.duration}</span>
            </div>

            <div className="card rounded-5 shadow-sm p-4">
              <h3 className="fs-6 text-uppercase text-muted mb-3">Simulation Library</h3>
              <ul className="list-unstyled mb-0">
                {modules.map((m) => (
                  <li key={m.id}>
                    <button
                      className={
                        'btn w-100 text-start mb-2 d-flex justify-content-between align-items-center ' +
                        (m.id === activeModule.id ? 'btn-primary' : 'btn-light')
                      }
                      onClick={() => setActiveModule(m)}
                    >
                      <span>{m.title}</span>
                      <span className="text-xs">{m.duration}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Side info */}
          <div className="col-lg-4">
            <div className="card rounded-5 shadow-sm p-4 mb-4">
              <h3 className="fs-6 text-uppercase text-muted mb-3">Your Track</h3>
              <p className="mb-0 fw-semibold">Data Track</p>
              <p className="mb-0 small text-muted">Cohort 1 · 8 Weeks</p>
            </div>
            <div className="card rounded-5 shadow-sm p-4">
              <h3 className="fs-6 text-uppercase text-muted mb-3">Your Mentor</h3>
              <p className="mb-0 fw-semibold">Assigned once training begins</p>
              <p className="mb-0 small text-muted">You&apos;ll see contact details here.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
