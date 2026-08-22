import { useState } from 'react';
import { Link } from 'react-router-dom';
import avatar1 from '../assets/avatars/avatar-1.jpg';
import avatar2 from '../assets/avatars/avatar-2.jpg';
import avatar3 from '../assets/avatars/avatar-3.jpg';
import avatar4 from '../assets/avatars/avatar-4.jpg';
import avatar5 from '../assets/avatars/avatar-5.jpg';
import avatar6 from '../assets/avatars/avatar-6.jpg';
import { heroImage, trainingImage, mentorsImage, partnershipsImage } from '../assets/images/images.js';
import dataTrackIcon from '../assets/images/tracks/data-track.svg';
import productTrackIcon from '../assets/images/tracks/product-track.svg';
import softwareTrackIcon from '../assets/images/tracks/software-track.svg';
import designTrackIcon from '../assets/images/tracks/design-track.svg';
import trainStageIcon from '../assets/images/stages/train-stage.svg';
import simulateStageIcon from '../assets/images/stages/simulate-stage.svg';
import mentorStageIcon from '../assets/images/stages/mentor-stage.svg';
import buildStageIcon from '../assets/images/stages/build-stage.svg';
import reviewStageIcon from '../assets/images/stages/review-stage.svg';
import coachStageIcon from '../assets/images/stages/coach-stage.svg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://careerforge-new-api.onrender.com';

const stages = [
  { num: '01', name: 'Train', tag: 'Structured Training', icon: trainStageIcon,
    desc: "Complete a structured curriculum covering the tools, workflows, and track fundamentals you'll need — before you ever touch a simulation." },
  { num: '02', name: 'Simulate', tag: 'Job Simulations', icon: simulateStageIcon,
    desc: 'Step into real-world job simulations built around the actual tools, workflows, and pressure of your target role — not a classroom version of it.' },
  { num: '03', name: 'Mentor', tag: 'Expert Mentorship', icon: mentorStageIcon,
    desc: "Get paired one-on-one with an industry mentor who's held the role you're training for and can show you what the job actually requires." },
  { num: '04', name: 'Build', tag: 'Live Internship', icon: buildStageIcon,
    desc: 'Work on a live internship project with a real partner organization and real deadlines — the kind of work that goes in a portfolio, not a drawer.' },
  { num: '05', name: 'Review', tag: 'Performance Reviews', icon: reviewStageIcon,
    desc: 'Sit through structured performance reviews, the same way you would as an employee, so you know exactly where you stand and what to fix.' },
  { num: '06', name: 'Coach', tag: 'Career Coaching', icon: coachStageIcon,
    desc: 'Finish with dedicated career coaching — positioning, interviews, negotiation — so the transformation shows up in an actual offer.' },
];

const tracks = [
  { name: 'Data Track', duration: '8 Weeks', icon: dataTrackIcon, desc: 'Excel, SQL, Python, and Power BI — from clean data to a decision-ready dashboard.' },
  { name: 'Product Track', duration: '8 Weeks', icon: productTrackIcon, desc: 'Discovery, specs, and roadmaps for a live product brief from a partner organization.' },
  { name: 'Software Track', duration: '10 Weeks', icon: softwareTrackIcon, desc: 'Ship features against a real codebase, real code review, and a real release cycle.' },
  { name: 'Design Track', duration: '8 Weeks', icon: designTrackIcon, desc: 'Research, wireframes, and a shipped UI — reviewed the way a design team reviews.' },
];

const mentors = [
  { name: '[Mentor Name]', role: 'Data Track Mentor', avatar: avatar4 },
  { name: '[Mentor Name]', role: 'Product Track Mentor', avatar: avatar6 },
  { name: '[Mentor Name]', role: 'Software Track Mentor', avatar: avatar5 },
  { name: '[Mentor Name]', role: 'Design Track Mentor', avatar: avatar2 },
];

const testimonials = [
  { quote: "The internship project was the first time I had to defend my work to someone who wasn't grading me — they were relying on me.",
    name: '[Participant Name]', track: 'Data Track, Cohort 1', avatar: avatar1 },
  { quote: "My mentor didn't just review my work — she showed me how she'd actually approach the problem on the job.",
    name: '[Participant Name]', track: 'Product Track, Cohort 1', avatar: avatar3 },
  { quote: "The performance review stage was uncomfortable in exactly the way a real one is. That's what made it useful.",
    name: '[Participant Name]', track: 'Software Track, Cohort 1', avatar: avatar4 },
];

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
      e.target.reset();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="alert alert-primary rounded-4">
        Thanks — your message was sent successfully. The team will get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Name</label>
          <input name="name" type="text" className="form-control" required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-control" required />
        </div>
        <div className="col-12">
          <label className="form-label">Message</label>
          <textarea name="message" className="form-control" rows="4" required />
        </div>
      </div>
      {error && (
        <div className="alert alert-danger mt-3">
          Something went wrong submitting the form — please try again or email
          hello@careerforge.example.
        </div>
      )}
      <button type="submit" className="btn btn-primary mt-4" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="py-lg-13 py-8 bg-white position-relative" id="hero">
        <div className="circle-bg d-none d-lg-block" />
        <div className="container">
          <div className="row align-items-center gy-8">
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-10 text-primary px-4 py-3 fw-normal border border-primary rounded-pill">
                Career Acceleration Programme
              </span>
              <h1 className="display-4 fw-bold mt-4">
                Careers aren&apos;t found.
                <br />
                They&apos;re <span className="text-primary">forged.</span>
              </h1>
              <p className="my-6 lead fw-normal">
                Structured training, real job simulations, expert mentorship, live internship
                projects, performance reviews, and one-on-one coaching — built to close the gap
                between what you&apos;ve learned and what employers actually need.
              </p>
              <div className="d-flex flex-md-row flex-column justify-content-start gap-3">
                <Link to="/apply" className="btn btn-primary">
                  <span>Apply Now</span>
                </Link>
                <a href="#process" className="btn btn-outline-dark">
                  <span>See How It Works</span>
                </a>
              </div>
              <div className="d-flex gap-6 mt-8">
                <div>
                  <div className="fs-4 fw-bold text-primary">06</div>
                  <small className="text-uppercase text-xs">Forge Stages</small>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-primary">1:1</div>
                  <small className="text-uppercase text-xs">Mentor Pairing</small>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-primary">100%</div>
                  <small className="text-uppercase text-xs">Real-World Projects</small>
                </div>
              </div>
            </div>
            <div className="col-lg-5 mx-auto">
              <div className="card p-3 rounded-5 shadow-sm">
                <div className="position-relative">
                  <img src={heroImage} alt="CareerForge participant working on a laptop" className="rounded-5 hero-photo" />
                  <div className="position-absolute bottom-0 start-0 ms-n8 mb-n8 d-none d-lg-block">
                    <div className="bg-white shadow-sm rounded-pill d-flex align-items-center gap-2 px-3 py-2 border" style={{ width: 180 }}>
                      <div className="icon-shape icon-md rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold">
                        6
                      </div>
                      <div className="d-flex flex-column text-xs lh-sm">
                        <span className="fw-bold">Forge Stages</span>
                        <span>One Transformation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE GAP WE CLOSE */}
      <section className="py-lg-13 py-8 bg-light bg-opacity-25" id="about">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-7 mx-auto mb-10">
              <span className="eyebrow justify-content-center">The Gap We Close</span>
              <h2 className="fw-bold mt-4 mb-4">Qualified on paper. Untested in practice.</h2>
              <p className="mb-0">
                Most training ends where the job actually begins. CareerForge exists in that gap —
                the space between finishing a course and being ready for the work.
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card h-100 rounded-5 shadow-sm p-6">
                <h3 className="fs-5 mb-3">Where most programmes stop</h3>
                <p className="mb-0">
                  Certificates, lectures, and theory. You leave knowing the concepts, but
                  you&apos;ve never had to apply them under real pressure, real deadlines, or real
                  feedback from someone who&apos;s done the job.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 rounded-5 shadow-sm p-6 border-primary">
                <h3 className="fs-5 mb-3 text-primary">Where CareerForge starts</h3>
                <p className="mb-0">
                  You train on the fundamentals, step into simulated roles, get paired with a
                  mentor who&apos;s walked the path, ship a live internship project, get reviewed
                  like an employee — and get coached until you&apos;re not just qualified, but
                  ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORGE PROCESS */}
      <section className="py-lg-13 py-8" id="process">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-6 mx-auto mb-10">
              <span className="eyebrow justify-content-center">The Forge Process</span>
              <h2 className="fw-bold mt-4 mb-4">Six stages. One transformation.</h2>
              <p className="mb-0">
                Each stage raises the heat — from raw potential to workplace-ready. The process is
                sequential and cumulative; you don&apos;t skip a stage, you pass through it.
              </p>
            </div>
          </div>
          <div className="row g-4">
            {stages.map((s) => (
              <div className="col-lg-4 col-md-6" key={s.num}>
                <div className="card h-100 rounded-5 shadow-sm card-lift overflow-hidden">
                  <img src={s.icon} alt={`${s.name} illustration`} className="track-icon" />
                  <div className="card-body p-6">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="icon-shape icon-md rounded-circle bg-primary bg-opacity-10 text-primary fw-bold">
                        {s.num}
                      </div>
                      <h3 className="fs-5 mb-0">{s.name}</h3>
                    </div>
                    <p className="mb-4">{s.desc}</p>
                    <span className="badge bg-dark bg-opacity-75 rounded-pill fw-normal text-xs">
                      {s.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINING & INTERNSHIP */}
      <section className="py-lg-13 py-8 bg-light bg-opacity-25" id="training">
        <div className="container">
          <div className="row align-items-center gy-6 mb-10">
            <div className="col-lg-6">
              <span className="eyebrow">Training &amp; Internship</span>
              <h2 className="fw-bold mt-4 mb-4">Four tracks, structured curriculum, real internship projects.</h2>
              <p className="mb-0">
                Every track runs through the same six-stage Forge Process — training, simulation,
                mentorship, a live internship project, structured review, and career coaching.
              </p>
            </div>
            <div className="col-lg-6">
              <img src={trainingImage} alt="Training workspace" className="rounded-5 section-photo shadow-sm" />
            </div>
          </div>
          <div className="row g-4">
            {tracks.map((t) => (
              <div className="col-lg-3 col-md-6" key={t.name}>
                <div className="card h-100 rounded-5 shadow-sm card-lift overflow-hidden">
                  <img src={t.icon} alt={`${t.name} illustration`} className="track-icon" />
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h3 className="fs-6 mb-0">{t.name}</h3>
                    </div>
                    <span className="badge bg-dark bg-opacity-75 rounded-pill fw-normal text-xs mb-3">
                      {t.duration}
                    </span>
                    <p className="mb-3 small">{t.desc}</p>
                    <Link to={`/apply?track=${encodeURIComponent(t.name)}`} className="link-primary fw-semibold small">
                      Apply &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENTORS */}
      <section className="py-lg-13 py-8" id="mentors">
        <div className="container">
          <div className="row align-items-center gy-6 mb-10">
            <div className="col-lg-6">
              <img src={mentorsImage} alt="Mentors collaborating" className="rounded-5 section-photo shadow-sm" />
            </div>
            <div className="col-lg-6">
              <span className="eyebrow">Mentors</span>
              <h2 className="fw-bold mt-4 mb-4">Learn from people who&apos;ve done the job.</h2>
              <p className="mb-0">
                Every track is paired with a practitioner mentor — not a facilitator reading from a
                slide deck.
              </p>
            </div>
          </div>
          <div className="row g-4">
            {mentors.map((m, i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <div className="card h-100 rounded-5 text-center p-6 shadow-sm card-lift">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="rounded-circle mb-4 mx-auto avatar avatar-xl border border-3 border-primary border-opacity-25"
                  />
                  <h3 className="h6 fw-bold mb-1">{m.name}</h3>
                  <span className="text-muted text-xs">{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERSHIPS */}
      <section className="py-lg-13 py-8 bg-light bg-opacity-25" id="partnerships">
        <div className="container">
          <div className="row align-items-center gy-6">
            <div className="col-lg-6">
              <span className="eyebrow">Partnerships</span>
              <h2 className="fw-bold mt-4 mb-4">Supply the brief. Hire the forge.</h2>
              <p className="mb-6">
                Organizations bring live project or internship briefs to a cohort, and get first
                look at hiring-ready participants once they&apos;ve shipped.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3 mb-6">
                <li className="d-flex gap-3">
                  <span className="fw-bold text-primary">01</span>
                  <span>Share a brief — the project, problem, or role you need covered.</span>
                </li>
                <li className="d-flex gap-3">
                  <span className="fw-bold text-primary">02</span>
                  <span>We staff a track — a cohort works your brief as their live internship project.</span>
                </li>
                <li className="d-flex gap-3">
                  <span className="fw-bold text-primary">03</span>
                  <span>Hire from the forge — get first look once they&apos;ve shipped and been reviewed.</span>
                </li>
              </ul>
              <a href="#contact" className="btn btn-primary">Get In Touch</a>
            </div>
            <div className="col-lg-6">
              <img src={partnershipsImage} alt="Partnership handshake" className="rounded-5 section-photo shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* PROOF OF HEAT */}
      <section className="py-lg-13 py-8" id="stories">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-6 mx-auto mb-10">
              <span className="eyebrow justify-content-center">Proof Of Heat</span>
              <h2 className="fw-bold mt-4 mb-4">Forged, then hired.</h2>
              <p className="mb-0">Replace these with real testimonials from your cohorts as they come in.</p>
            </div>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div className="col-lg-4 col-12" key={i}>
                <div className="card rounded-5 shadow-sm h-100 border">
                  <div className="card-body p-6">
                    <p className="fw-semibold">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-7 pt-5 border-top d-flex gap-3 align-items-center">
                      <img src={t.avatar} alt="" className="avatar avatar-md rounded-circle" />
                      <div>
                        <h6 className="mb-0">{t.name}</h6>
                        <small className="text-muted">{t.track}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-lg-13 py-8 bg-light bg-opacity-25" id="contact">
        <div className="container">
          <div className="row g-5 justify-content-center">
            <div className="col-lg-5">
              <span className="eyebrow">Contact</span>
              <h2 className="fw-bold mt-4 mb-4">Get in touch.</h2>
              <p className="mb-4">
                Questions about tracks, timelines, or partnerships? Send a note and the team will
                follow up.
              </p>
              <a href="mailto:hello@careerforge.example" className="link-primary fw-semibold">
                hello@careerforge.example
              </a>
            </div>
            <div className="col-lg-6">
              <div className="card rounded-5 shadow-sm p-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-lg-13 py-8 bg-ink text-white">
        <div className="container text-center">
          <span className="eyebrow justify-content-center">Ready?</span>
          <h2 className="fw-bold mt-4 mb-4 text-white">Come get forged.</h2>
          <p className="mb-8 text-white-50">
            Apply to a track, or get in touch first if you&apos;ve got questions.
          </p>
          <div className="d-flex flex-md-row flex-column justify-content-center gap-3">
            <Link to="/apply" className="btn btn-primary">
              Apply Now
            </Link>
            <a href="#contact" className="btn btn-outline-light">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
