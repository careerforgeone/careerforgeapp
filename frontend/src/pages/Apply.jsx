import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://careerforge-new-api.onrender.com';
const TRACKS = ['Data', 'Product', 'Software', 'Design'];

export default function Apply() {
  const [searchParams] = useSearchParams();
  const [applicationType, setApplicationType] = useState('Training');
  const [track, setTrack] = useState('Data');
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [startingPayment, setStartingPayment] = useState(false);

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

    setError('');
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Unable to start payment.');
      setSubmittedApplication(data);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function proceedToPayment() {
    setError('');
    setStartingPayment(true);
    try {
      const res = await fetch(`${API_BASE}/api/payment/initialize/${submittedApplication.application_id}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Unable to start payment.');
      window.location.assign(data.authorizationUrl);
    } catch (paymentError) {
      setError(paymentError.message);
    } finally {
      setStartingPayment(false);
    }
  }

  return (
    <section className="py-lg-13 py-8 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card rounded-5 shadow-sm">
              <div className="card-body p-6">
                {submittedApplication ? (
                  <div className="text-center py-4">
                    <h1 className="h5 mb-3">Application submitted successfully.</h1>
                    <p className="mb-2">Application ID: <strong>{submittedApplication.application_id}</strong></p>
                    <p className="mb-4">
                      Payment required: <strong>₦{(submittedApplication.payment_amount / 100).toLocaleString('en-NG')}</strong>
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={proceedToPayment}
                      disabled={startingPayment}
                    >
                      {startingPayment ? 'Opening Payment…' : 'Proceed to Payment'}
                    </button>
                    {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
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

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label htmlFor="country" className="form-label">Country</label>
                          <select id="country" name="country" className="form-select" defaultValue="Nigeria" required>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Kenya">Kenya</option>
                            <option value="South Africa">South Africa</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United States">United States</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="invalid-feedback">Please select your country.</div>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="state" className="form-label">State / Province</label>
                          <input id="state" name="state" type="text" className="form-control" required />
                          <div className="invalid-feedback">Please enter your state or province.</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="phoneNumber" className="form-label">Phone number</label>
                        <div className="input-group">
                          <select id="countryCode" name="countryCode" className="form-select flex-grow-0" style={{ width: '125px' }} defaultValue="+234" aria-label="Country calling code" required>
                            <option value="+234">+234 NG</option>
                            <option value="+233">+233 GH</option>
                            <option value="+254">+254 KE</option>
                            <option value="+27">+27 ZA</option>
                            <option value="+44">+44 UK</option>
                            <option value="+1">+1 US/CA</option>
                          </select>
                          <input id="phoneNumber" name="phoneNumber" type="tel" className="form-control" placeholder="801 234 5678" required />
                        </div>
                        <div className="invalid-feedback">Please enter your phone number.</div>
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
                        <label htmlFor="hearAboutUs" className="form-label">How did you hear about us?</label>
                        <select id="hearAboutUs" name="hearAboutUs" className="form-select" defaultValue="" required>
                          <option value="" disabled>Select an option</option>
                          <option value="Social media">Social media</option>
                          <option value="Friend or colleague">Friend or colleague</option>
                          <option value="Search engine">Search engine</option>
                          <option value="Event or community">Event or community</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="invalid-feedback">Please select an option.</div>
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
                          {error === 'cv-too-large' ? 'Your CV file is larger than 5MB. Please upload a smaller file.' : error}
                        </div>
                      )}

                      <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                        {submitting
                          ? 'Submitting…'
                          : applicationType === 'Internship'
                          ? 'Proceed to Payment'
                          : 'Proceed to Payment'}
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
