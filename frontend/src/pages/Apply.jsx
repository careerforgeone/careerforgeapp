import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

//const API_BASE = 'https://careerforge-api-i1v3.onrender.com';
const API_BASE = 'http://localhost:8000';
const TRACKS = ['Data', 'Product', 'Software', 'Design'];

export default function Apply() {
  const [searchParams] = useSearchParams();
  const [applicationType, setApplicationType] = useState('Training');
  const [track, setTrack] = useState('Data');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const pre = searchParams.get('track');
    if (pre) {
      const match = TRACKS.find(
        (t) => t.toLowerCase() === pre.toLowerCase() || pre.toLowerCase().includes(t.toLowerCase())
      );
      if (match) setTrack(match);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }

    const cvInput = form.querySelector('input[name="cv"]');
    if (applicationType === 'Internship' && cvInput?.files?.[0]) {
      const maxBytes = 5 * 1024 * 1024;
      if (cvInput.files[0].size > maxBytes) {
        setError('cv-too-large');
        return;
      }
    }

    setError(false);
    setSubmitting(true);
    // multipart/form-data so the actual résumé file can be uploaded — do NOT
    // set a Content-Type header manually, the browser sets the correct
    // multipart boundary for us when the body is a FormData instance.
    const formData = new FormData(form);
    formData.set('applicationType', applicationType);
    try {
      const res = await fetch(`${API_BASE}/api/apply`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
      form.reset();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-lg-13 py-8 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card rounded-5 shadow-sm">
              <div className="card-body p-6">
                {submitted ? (
                  <div className="text-center py-6">
                    <h1 className="card-title mb-3 h5">Application received.</h1>
                    <p className="mb-4">Your application was submitted successfully. The team will be in touch soon.</p>
                    <Link to="/" className="btn btn-outline-dark">
                      Back to Home
                    </Link>
                  </div>
                ) : (
                  <>
                    <h1 className="card-title mb-4 h5">Apply to CareerForge</h1>

                    <div className="btn-group w-100 mb-5" role="group" aria-label="Application type">
                      <button
                        type="button"
                        className={`btn ${applicationType === 'Training' ? 'btn-primary' : 'btn-outline-dark'}`}
                        onClick={() => setApplicationType('Training')}
                      >
                        Training Applicant
                      </button>
                      <button
                        type="button"
                        className={`btn ${applicationType === 'Internship' ? 'btn-primary' : 'btn-outline-dark'}`}
                        onClick={() => setApplicationType('Internship')}
                      >
                        Internship Applicant
                      </button>
                    </div>

                    <form className={validated ? 'was-validated' : ''} noValidate onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">Full name</label>
                        <input id="fullName" name="name" type="text" className="form-control" placeholder="Jane Doe" required />
                        <div className="invalid-feedback">Please enter your name.</div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input id="email" name="email" type="email" className="form-control" placeholder="name@example.com" required />
                        <div className="invalid-feedback">Please enter a valid email.</div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="track" className="form-label">Track</label>
                        <select
                          id="track"
                          name="track"
                          className="form-select"
                          value={track}
                          onChange={(e) => setTrack(e.target.value)}
                        >
                          {TRACKS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
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

                      {applicationType === 'Internship' && (
                        <>
                          <hr className="my-4" />
                          <p className="text-uppercase text-xs text-muted mb-3">Internship Requirements</p>

                          <div className="mb-3">
                            <label htmlFor="cvFile" className="form-label">CV / Resume (PDF or Word doc)</label>
                            <input
                              id="cvFile"
                              name="cv"
                              type="file"
                              className="form-control"
                              accept=".pdf,.doc,.docx"
                              required
                            />
                            <div className="invalid-feedback">A CV file is required for internship applicants.</div>
                            <div className="form-text">PDF or Word doc, up to 5MB.</div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="portfolioUrl" className="form-label">GitHub / Portfolio URL</label>
                            <input id="portfolioUrl" name="portfolioUrl" type="url" className="form-control" placeholder="https://" required />
                            <div className="invalid-feedback">A GitHub or portfolio link is required.</div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="linkedinUrl" className="form-label">LinkedIn URL</label>
                            <input id="linkedinUrl" name="linkedinUrl" type="url" className="form-control" placeholder="https://" required />
                            <div className="invalid-feedback">A LinkedIn link is required.</div>
                          </div>
                        </>
                      )}

                      <div className="mb-3 form-check">
                        <input id="terms" className="form-check-input" type="checkbox" required />
                        <label className="form-check-label small" htmlFor="terms">
                          I agree to the <a href="#" className="text-decoration-none">terms and privacy</a>
                        </label>
                        <div className="invalid-feedback">You must agree before continuing.</div>
                      </div>

                      {error && (
                        <div className="alert alert-danger">
                          {error === 'cv-too-large'
                            ? 'Your CV file is larger than 5MB — please upload a smaller file.'
                            : 'Something went wrong submitting the form — please try again or email hello@careerforge.example.'}
                        </div>
                      )}

                      <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                        {submitting
                          ? 'Submitting…'
                          : applicationType === 'Internship'
                          ? 'Submit Internship Application'
                          : 'Apply Now'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
