import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function CreateAccount() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    if (!form.checkValidity() || data.password !== data.confirmPassword) {
      setValidated(true);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await register({
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: 'student',
      });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong creating your account.');
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
                <h1 className="card-title mb-5 h5">Create your CareerForge account</h1>
                <form className={validated ? 'was-validated' : ''} noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Full name</label>
                    <input id="fullName" name="fullName" type="text" className="form-control" placeholder="Jane Doe" required />
                    <div className="invalid-feedback">Please enter your name.</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input id="email" name="email" type="email" className="form-control" placeholder="name@example.com" required />
                    <div className="invalid-feedback">Please enter a valid email.</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input id="password" name="password" type="password" className="form-control" placeholder="Create a password" required minLength={6} />
                    <div className="invalid-feedback">Please provide a password (min 6 characters).</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" className="form-control" placeholder="Repeat password" required />
                    <div className="invalid-feedback">Passwords must match.</div>
                  </div>

                  <div className="mb-3 form-check">
                    <input id="terms" className="form-check-input" type="checkbox" required />
                    <label className="form-check-label small" htmlFor="terms">
                      I agree to the <a href="#" className="text-decoration-none">terms and privacy</a>
                    </label>
                    <div className="invalid-feedback">You must agree before continuing.</div>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>
                <p className="text-center small mt-4 mb-0">
                  Already have an account? <Link to="/login" className="link-primary fw-semibold">Log in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
