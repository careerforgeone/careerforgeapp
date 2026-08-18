import { Link } from 'react-router-dom';
import logoMark from '../assets/images/brand/careerforge-mark.png';

export default function Footer() {
  return (
    <footer className="pt-lg-13 bg-ink text-light py-8">
      <div className="container">
        <div className="row gy-8">
          <div className="col-md-4">
            <Link className="d-inline-flex gap-1 align-items-center lh-1 text-white" to="/">
              <img src={logoMark} alt="CareerForge" height="32" className="d-block" />
              <span className="fw-bold ms-1">CareerForge</span>
            </Link>
            <p className="mt-4 mb-6 text-white-50">
              An immersive career acceleration programme bridging the gap between learning and employment.
            </p>
          </div>

          <div className="col-md-8">
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <h4 className="fs-6 text-uppercase text-white-50 mb-4">Programme</h4>
                <ul className="list-unstyled lh-lg small">
                  <li><a href="/#about" className="text-white-50">About</a></li>
                  <li><a href="/#training" className="text-white-50">Training &amp; Internship</a></li>
                  <li><a href="/#mentors" className="text-white-50">Mentors</a></li>
                  <li><a href="/#partnerships" className="text-white-50">Partnerships</a></li>
                </ul>
              </div>
              <div className="col-lg-4 col-md-6">
                <h4 className="fs-6 text-uppercase text-white-50 mb-4">Get Started</h4>
                <ul className="list-unstyled lh-lg small">
                  <li><Link to="/apply" className="text-white-50">Apply Now</Link></li>
                  <li><a href="/#contact" className="text-white-50">Contact</a></li>
                  <li><a href="mailto:hello@careerforge.example" className="text-white-50">Email Us</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary mt-8 pt-6 row small">
          <div className="col-12 d-flex flex-column flex-md-row justify-content-between text-white-50">
            <p className="mb-2 mb-md-0">&copy; 2026 CareerForge. All rights reserved.</p>
            <p className="mb-0 fst-italic">Careers aren&apos;t found. They&apos;re forged.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
