import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Only shown once payment is verified as successful — see the guard below
// the receipt. Configure this per-deployment rather than hard-coding it.
const CLASSROOM_URL = import.meta.env.VITE_GOOGLE_CLASSROOM_URL;

function formatNaira(amountKobo) {
  if (typeof amountKobo !== 'number') return '\u2014';
  return `\u20A6${(amountKobo / 100).toLocaleString('en-NG')}`;
}

function formatDate(iso) {
  if (!iso) return '\u2014';
  try {
    return new Date(iso).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  // 'checking' | 'success' | 'pending' | 'failed'
  const [state, setState] = useState('checking');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setState('failed');
      return;
    }

    fetch(`${API_BASE}/api/payment/verify/${encodeURIComponent(reference)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Payment could not be verified.');

        if (data.paymentStatus) {
          setReceipt(data);
          setState('success');
        } else if (data.status === 'failed' || data.status === 'abandoned' || data.status === 'mismatch') {
          setState('failed');
        } else {
          // e.g. still "pending" on Paystack's side
          setState('pending');
        }
      })
      .catch(() => setState('failed'));
  }, [searchParams]);

  return (
    <section className="py-lg-13 py-8 bg-light bg-opacity-25 min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card rounded-5 shadow-sm">
              <div className="card-body p-6">
                {state === 'checking' && (
                  <p className="mb-0 text-center">Confirming your payment&hellip;</p>
                )}

                {state === 'pending' && (
                  <div className="text-center py-4">
                    <h1 className="h5 mb-3">Payment still processing.</h1>
                    <p className="mb-4">
                      Paystack hasn&rsquo;t confirmed this transaction yet. This page will update once it
                      does &mdash; you can also refresh in a minute.
                    </p>
                  </div>
                )}

                {state === 'failed' && (
                  <div className="text-center py-4">
                    <h1 className="h5 mb-3">Payment could not be confirmed.</h1>
                    <p className="mb-4">
                      If you were charged, please contact support with your payment reference and
                      we&rsquo;ll sort it out. No payment record was created on our side without a
                      verified transaction.
                    </p>
                    <Link to="/apply" className="btn btn-outline-dark">Return to application</Link>
                  </div>
                )}

                {state === 'success' && receipt && (
                  <div className="text-center">
                    <p className="text-uppercase text-muted small mb-1 fw-semibold" style={{ letterSpacing: '0.08em' }}>
                      CareerForge
                    </p>
                    <h1 className="h5 mb-4">Application Payment Receipt</h1>

                    <table className="table table-borderless text-start mb-4">
                      <tbody>
                        <tr>
                          <td className="text-muted">Application ID</td>
                          <td className="text-end fw-semibold">{receipt.application.id}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Applicant Name</td>
                          <td className="text-end fw-semibold">{receipt.application.name}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Email</td>
                          <td className="text-end fw-semibold">{receipt.application.email}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Amount Paid</td>
                          <td className="text-end fw-semibold">{formatNaira(receipt.payment.amount)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Payment Status</td>
                          <td className="text-end fw-semibold text-success">Successful</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Payment Reference</td>
                          <td className="text-end fw-semibold">{receipt.payment.reference}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Payment Date</td>
                          <td className="text-end fw-semibold">{formatDate(receipt.payment.paidAt)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="mb-4">
                      Your application has been successfully registered and your payment has been confirmed.
                    </p>

                    <hr className="my-4" />

                    <p className="mb-3">Your payment has been confirmed. You can now join the CareerForge classroom.</p>
                    {CLASSROOM_URL ? (
                      <a
                        href={CLASSROOM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        Join Google Classroom
                      </a>
                    ) : (
                      <p className="text-muted small mb-0">
                        Classroom link is not configured yet &mdash; set VITE_GOOGLE_CLASSROOM_URL.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
