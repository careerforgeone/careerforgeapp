import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Placeholder data — wire this up to real endpoints on your backend
// (e.g. GET /api/admin/applicants, GET /api/admin/stats) once ready.
const stats = [
  { label: 'Applicants', value: '—' },
  { label: 'Active Cohort', value: '—' },
  { label: 'Mentors', value: '—' },
  { label: 'Partner Orgs', value: '—' },
];

const applicants = [
  { name: '—', track: '—', type: '—', status: '—' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <section className="py-lg-10 py-6 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-8 gap-3">
          <div>
            <span className="eyebrow">Admin Dashboard</span>
            <h1 className="fw-bold mt-2 mb-0 fs-3">Welcome back, {user?.name || 'Admin'}.</h1>
          </div>
          <button className="btn btn-outline-dark" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        <div className="row g-4 mb-6">
          {stats.map((s) => (
            <div className="col-6 col-lg-3" key={s.label}>
              <div className="card rounded-5 shadow-sm p-4 text-center">
                <div className="fs-3 fw-bold text-primary">{s.value}</div>
                <div className="text-xs text-uppercase text-muted">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card rounded-5 shadow-sm p-4">
              <h2 className="fs-6 text-uppercase text-muted mb-4">Recent Applicants</h2>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr className="text-xs text-uppercase text-muted">
                      <th>Name</th>
                      <th>Track</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((a, i) => (
                      <tr key={i}>
                        <td>{a.name}</td>
                        <td>{a.track}</td>
                        <td>{a.type}</td>
                        <td>
                          <span className="badge bg-dark bg-opacity-75 rounded-pill fw-normal">{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="small text-muted mb-0">
                Connect this table to your applications API to see real applicant data.
              </p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card rounded-5 shadow-sm p-4">
              <h2 className="fs-6 text-uppercase text-muted mb-4">Quick Actions</h2>
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-outline-dark text-start">Manage Courses &amp; Modules</button>
                <button className="btn btn-outline-dark text-start">Manage Mentors</button>
                <button className="btn btn-outline-dark text-start">Review Applications</button>
                <button className="btn btn-outline-dark text-start">Partner Organizations</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
