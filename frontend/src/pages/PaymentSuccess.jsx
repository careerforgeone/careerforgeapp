import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState('checking');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setState('failed');
      return;
    }

    fetch(`${API_BASE}/api/payment/verify/${encodeURIComponent(reference)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.paymentStatus) throw new Error('Payment was not completed.');
        setState('success');
      })
      .catch(() => setState('failed'));
  }, [searchParams]);

  return (
    <section className="py-lg-13 py-8 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card rounded-5 shadow-sm">
              <div className="card-body p-6 text-center">
                {state === 'checking' && <p className="mb-0">Confirming your payment...</p>}
                {state === 'success' && (
                  <>
                    <h1 className="h5 mb-3">Payment successful.</h1>
                    <p className="mb-4">Your application has been received. The CareerForge team will be in touch soon.</p>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                  </>
                )}
                {state === 'failed' && (
                  <>
                    <h1 className="h5 mb-3">Payment could not be confirmed.</h1>
                    <p className="mb-4">Please contact support with your payment reference if you were charged.</p>
                    <Link to="/apply" className="btn btn-outline-dark">Return to application</Link>
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