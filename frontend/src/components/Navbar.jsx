import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logoMark from '../assets/images/brand/careerforge-mark.png';

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#training', label: 'Training & Internship' },
  { href: '#mentors', label: 'Mentors' },
  { href: '#partnerships', label: 'Partnerships' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleAnchorClick(e, href) {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // wait for Home to mount, then scroll
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
    const collapse = document.getElementById('navbarSupportedContent');
    if (collapse?.classList.contains('show')) {
      collapse.classList.remove('show');
    }
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-inline-flex gap-1 align-items-center lh-1" to="/">
          <img src={logoMark} alt="CareerForge" height="32" className="d-block" />
          <span className="fw-bold ms-1">CareerForge</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {links.map((l) => (
              <li className="nav-item" key={l.href}>
                <a href={l.href} className="nav-link" onClick={(e) => handleAnchorClick(e, l.href)}>
                  {l.label}
                </a>
              </li>
            ))}
            {user && (
              <li className="nav-item">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link">
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex gap-3 align-items-center">
            {user ? (
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log Out
              </button>
            ) : (
              <Link to="/login" className="btn btn-outline-dark">
                Log In
              </Link>
            )}
            <Link to="/apply" className="btn btn-primary">
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
