// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Ticket,
//   LayoutDashboard,
//   MessageSquare,
//   ShieldCheck,
//   BarChart3,
//   Zap,
//   Clock3,
//   ArrowRight,
//   CheckCircle2
// } from "lucide-react";

// function Landing({ user }) {
//   const navigate = useNavigate();

//   return (
//     <div className="landing">
//       <nav className="landing-nav">
//         <Link to="/" className="brand">
//           <span className="brand-mark">
//             <Ticket size={21} />
//           </span>
//           Resolve<span>Hub</span>
//         </Link>

//         <div className="nav-actions">
//           {user ? (
//             <button
//               type="button"
//               className="btn btn-light"
//               onClick={() => navigate("/dashboard")}
//             >
//               Open Dashboard <ArrowRight size={17} />
//             </button>
//           ) : (
//             <>
//               <Link to="/login" className="nav-link">
//                 Login
//               </Link>

//               <Link to="/register" className="btn btn-light">
//                 Get Started
//               </Link>
//             </>
//           )}
//         </div>
//       </nav>

//       <section className="hero">
//         <div className="hero-copy">
//           <div className="eyebrow">
//             <Zap size={15} /> MODERN CUSTOMER SUPPORT
//           </div>

//           <h1>
//             Resolve issues.
//             <br />
//             <span>Build trust.</span>
//           </h1>

//           <p>
//             A polished support ticket platform for customers, agents and
//             admins. Create tickets, collaborate in one place and close every
//             issue with confidence.
//           </p>

//           <div className="hero-actions">
//             <Link
//               to={user ? "/dashboard" : "/register"}
//               className="btn btn-white"
//             >
//               Start a Ticket <ArrowRight size={18} />
//             </Link>

//             <button
//               type="button"
//               className="btn btn-ghost"
//               onClick={() =>
//                 document
//                   .getElementById("features")
//                   ?.scrollIntoView({ behavior: "smooth" })
//               }
//             >
//               Explore Features
//             </button>
//           </div>

//           <div className="hero-proof">
//             <span>
//               <ShieldCheck size={17} /> Role-based access
//             </span>

//             <span>
//               <Clock3 size={17} /> SLA-ready workflow
//             </span>

//             <span>
//               <MessageSquare size={17} /> Team collaboration
//             </span>
//           </div>
//         </div>

//         <div className="hero-card-wrap">
//           <div className="floating-card mini-card">
//             <span className="dot green"></span>

//             <div>
//               <b>Ticket #1025</b>
//               <small>Resolved in 2h 14m</small>
//             </div>

//             <CheckCircle2 size={22} />
//           </div>

//           <div className="dashboard-preview">
//             <div className="preview-top">
//               <span>Support overview</span>
//               <span className="preview-pill">Today</span>
//             </div>

//             <div className="preview-stats">
//               <div>
//                 <small>Open tickets</small>
//                 <strong>24</strong>
//                 <em>↓ 12%</em>
//               </div>

//               <div>
//                 <small>Resolution rate</small>
//                 <strong>94%</strong>
//                 <em>↑ 8%</em>
//               </div>
//             </div>

//             <div className="preview-chart">
//               <div className="chart-bars">
//                 {[42, 58, 48, 72, 65, 83, 76, 91, 69, 84, 96].map(
//                   (h, i) => (
//                     <i key={i} style={{ height: `${h}%` }} />
//                   )
//                 )}
//               </div>
//             </div>

//             <div className="preview-list">
//               {[
//                 "Laptop not charging",
//                 "Unable to login",
//                 "Payment problem"
//               ].map((x, i) => (
//                 <div key={x}>
//                   <span className={`status-dot s${i}`}></span>
//                   <b>{x}</b>
//                   <small>#{1025 - i}</small>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       <section id="features" className="feature-section">
//         <div className="section-heading">
//           <div className="eyebrow dark">ONE WORKSPACE</div>

//           <h2>Everything your support team needs.</h2>

//           <p>
//             From first report to final resolution, keep every conversation and
//             status update connected.
//           </p>
//         </div>

//         <div className="feature-grid">
//           {[
//             [
//               LayoutDashboard,
//               "Smart dashboards",
//               "See ticket health, priorities and workload at a glance."
//             ],
//             [
//               MessageSquare,
//               "Collaborative replies",
//               "Keep customers and agents in the same conversation."
//             ],
//             [
//               ShieldCheck,
//               "Secure RBAC",
//               "Separate customer, agent and admin capabilities."
//             ],
//             [
//               BarChart3,
//               "Actionable reports",
//               "Track volume, resolution rates and urgent issues."
//             ]
//           ].map(([Icon, title, text]) => (
//             <div className="feature-card" key={title}>
//               <div className="feature-icon">
//                 <Icon size={22} />
//               </div>

//               <h3>{title}</h3>
//               <p>{text}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <footer className="landing-footer">
//         <span>© 2026 ResolveHub</span>
//         <span>Support Ticket System</span>
//       </footer>
//     </div>
//   );
// }

// export default Landing;







import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ticket,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Zap,
  Clock3,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

function Landing({ user }) {
  const navigate = useNavigate();

  const words = ["Assurance", "Relationships", "Confidence"];

  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (!deleting && displayText === currentWord) {
      const timer = setTimeout(() => {
        setDeleting(true);
      }, 2200);

      return () => clearTimeout(timer);
    }

    if (deleting && displayText === "") {
      setDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timer = setTimeout(() => {
      if (deleting) {
        setDisplayText(
          currentWord.substring(0, displayText.length - 1)
        );
      } else {
        setDisplayText(
          currentWord.substring(0, displayText.length + 1)
        );
      }
    }, deleting ? 110 : 170);

    return () => clearTimeout(timer);
  }, [displayText, deleting, wordIndex]);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Ticket size={21} />
          </span>
          Resolve<span>Hub</span>
        </Link>

        <div className="nav-actions">
          {user ? (
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate("/dashboard")}
            >
              Open Dashboard
              <ArrowRight size={17} />
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>

              <Link to="/register" className="btn btn-light">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Zap size={15} />
            MODERN CUSTOMER SUPPORT
          </div>

          <h1>
            <span className="hero-line">
              Resolve issues.
            </span>

            <span className="hero-line">
              Build
            </span>

            <span className="hero-line animated-headline">
              <span className="animated-word">
                {displayText}
                <span className="typing-cursor">|</span>
              </span>

              <span className="headline-dot">
                .
              </span>
            </span>
          </h1>

          <p>
            A polished support ticket platform for customers, agents and
            admins. Create tickets, collaborate in one place and close every
            issue with confidence.
          </p>

          <div className="hero-actions">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="btn btn-white"
            >
              Start a Ticket
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Features
            </button>
          </div>

          <div className="hero-proof">
            <span>
              <ShieldCheck size={17} />
              Role-based access
            </span>

            <span>
              <Clock3 size={17} />
              SLA-ready workflow
            </span>

            <span>
              <MessageSquare size={17} />
              Team collaboration
            </span>
          </div>
        </div>

        <div className="hero-card-wrap">
          <div className="floating-card mini-card">
            <span className="dot green"></span>

            <div>
              <b>Ticket #1025</b>
              <small>Resolved in 2h 14m</small>
            </div>

            <CheckCircle2 size={22} />
          </div>

          <div className="dashboard-preview">
            <div className="preview-top">
              <span>Support overview</span>
              <span className="preview-pill">
                Today
              </span>
            </div>

            <div className="preview-stats">
              <div>
                <small>Open tickets</small>
                <strong>24</strong>
                <em>↓ 12%</em>
              </div>

              <div>
                <small>Resolution rate</small>
                <strong>94%</strong>
                <em>↑ 8%</em>
              </div>
            </div>

            <div className="preview-chart">
              <div className="chart-bars">
                {[42, 58, 48, 72, 65, 83, 76, 91, 69, 84, 96].map(
                  (h, i) => (
                    <i
                      key={i}
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="preview-list">
              {[
                "Laptop not charging",
                "Unable to login",
                "Payment problem"
              ].map((x, i) => (
                <div key={x}>
                  <span className={`status-dot s${i}`}></span>

                  <b>{x}</b>

                  <small>
                    #{1025 - i}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="feature-section"
      >
        <div className="section-heading">
          <div className="eyebrow dark">
            ONE WORKSPACE
          </div>

          <h2>
            Everything your support team needs.
          </h2>

          <p>
            From first report to final resolution, keep every
            conversation and status update connected.
          </p>
        </div>

        <div className="feature-grid">
          {[
            [
              LayoutDashboard,
              "Smart dashboards",
              "See ticket health, priorities and workload at a glance."
            ],
            [
              MessageSquare,
              "Collaborative replies",
              "Keep customers and agents in the same conversation."
            ],
            [
              ShieldCheck,
              "Secure RBAC",
              "Separate customer, agent and admin capabilities."
            ],
            [
              BarChart3,
              "Actionable reports",
              "Track volume, resolution rates and urgent issues."
            ]
          ].map(([Icon, title, text]) => (
            <div
              className="feature-card"
              key={title}
            >
              <div className="feature-icon">
                <Icon size={22} />
              </div>

              <h3>{title}</h3>

              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>
          © 2026 ResolveHub
        </span>

        <span>
          Support Ticket System
        </span>
      </footer>
    </div>
  );
}

export default Landing;