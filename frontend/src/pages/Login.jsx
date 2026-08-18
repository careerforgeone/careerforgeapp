import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    setError('');
    setLoading(true);
    const data = Object.fromEntries(new FormData(form));
    try {
      const user = await login(data.email, data.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong logging in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-lg-13 py-8 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card rounded-5 shadow-sm">
              <div className="card-body p-6">
                <h1 className="card-title mb-5 h5">Log in to CareerForge</h1>
                <form className={validated ? 'was-validated' : ''} noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input id="email" name="email" type="email" className="form-control" placeholder="name@example.com" required />
                    <div className="invalid-feedback">Please enter a valid email.</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input id="password" name="password" type="password" className="form-control" placeholder="Your password" required minLength={6} />
                    <div className="invalid-feedback">Please enter your password.</div>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                    {loading ? 'Logging in…' : 'Log In'}
                  </button>
                </form>
                <p className="text-center small mt-4 mb-0">
                  Don&apos;t have an account? <Link to="/create-account" className="link-primary fw-semibold">Create one</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
