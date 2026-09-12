// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Ticket, ArrowRight } from "lucide-react";
// import api from "../api";

// function Auth({ mode, onAuth }) {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: ""
//   });

//   const [error, setError] = useState("");

//   const navigate = useNavigate();
//   const register = mode === "register";

//   const submit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const { data } = await api.post(
//         `/auth/${register ? "register" : "login"}`,
//         form
//       );

//       onAuth(data);
//       navigate("/dashboard");
//     } catch (e) {
//       setError(
//         e.response?.data?.message ||
//         "Something went wrong"
//       );
//     }
//   };

//   return (
//     <div className="auth-shell">
//       <div className="auth-brand">
//         <Link to="/" className="brand">
//           <span className="brand-mark">
//             <Ticket size={21} />
//           </span>
//           Resolve<span>Hub</span>
//         </Link>

//         <Link
//           to="/"
//           className="auth-back"
//         >
//           <span>←</span>
//           Back to Home
//         </Link>
//       </div>

//       <div className="auth-layout">
//         <div className="auth-art">
//           <div className="eyebrow">
//             WELCOME TO ResolveHub
//           </div>

//           <h1>
//             {register
//               ? "Support that feels effortless."
//               : "Welcome back to your support hub."}
//           </h1>

//           <p>
//             Manage requests, collaborate with your
//             support team and keep customers informed
//             from one beautiful workspace.
//           </p>

//           <div className="auth-art-stats">
//             <span>
//               <b>24/7</b>
//               <small>Support workflow</small>
//             </span>

//             <span>
//               <b>3</b>
//               <small>User roles</small>
//             </span>

//             <span>
//               <b>100%</b>
//               <small>Trackable</small>
//             </span>
//           </div>
//         </div>

//         <form
//           className="auth-card"
//           onSubmit={submit}
//         >
//           <div className="auth-card-head">
//             <div className="feature-icon">
//               <Ticket size={22} />
//             </div>

//             <h2>
//               {register
//                 ? "Create your account"
//                 : "Sign in"}
//             </h2>

//             <p>
//               {register
//                 ? "Start managing support requests today."
//                 : "Enter your credentials to continue."}
//             </p>
//           </div>

//           {register && (
//             <label>
//               Full name

//               <input
//                 required
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     name: e.target.value
//                   })
//                 }
//                 placeholder="Rahul Sharma"
//               />
//             </label>
//           )}

//           <label>
//             Email

//             <input
//               type="email"
//               required
//               value={form.email}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   email: e.target.value
//                 })
//               }
//               placeholder="you@example.com"
//             />
//           </label>

//           <label>
//             Password

//             <input
//               type="password"
//               required
//               value={form.password}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   password: e.target.value
//                 })
//               }
//               placeholder="••••••••"
//             />
//           </label>

//           {error && (
//             <div className="error-box">
//               {error}
//             </div>
//           )}

//           <button
//             className="btn btn-primary full"
//             type="submit"
//           >
//             {register
//               ? "Create account"
//               : "Sign in"}

//             <ArrowRight size={17} />
//           </button>

//           <div className="auth-switch">
//             {register
//               ? "Already have an account?"
//               : "New to HelpDesk?"}{" "}

//             <Link
//               to={
//                 register
//                   ? "/login"
//                   : "/register"
//               }
//             >
//               {register
//                 ? "Sign in"
//                 : "Create account"}
//             </Link>
//           </div>

//           {!register && (
//             <div className="demo-box">
//               <b>Admin demo</b>
//               <span>
//                 admin@ResolveHub.com
//               </span>
//               <span>
//                 Admin_ResolveHub@26
//               </span>
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Auth;








import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, ArrowRight, Loader2 } from "lucide-react";
import api from "../api";

function Auth({ mode, onAuth }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const register = mode === "register";

  const submit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(
        `/auth/${register ? "register" : "login"}`,
        form
      );

      onAuth(data);
      navigate("/dashboard");
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Ticket size={21} />
          </span>
          Resolve<span>Hub</span>
        </Link>

        <Link
          to="/"
          className="auth-back"
        >
          <span>←</span>
          Back to Home
        </Link>
      </div>

      <div className="auth-layout">
        <div className="auth-art">
          <div className="eyebrow">
            WELCOME TO ResolveHub
          </div>

          <h1>
            {register
              ? "Support that feels effortless."
              : "Welcome back to your support hub."}
          </h1>

          <p>
            Manage requests, collaborate with your
            support team and keep customers informed
            from one beautiful workspace.
          </p>

          <div className="auth-art-stats">
            <span>
              <b>24/7</b>
              <small>Support workflow</small>
            </span>

            <span>
              <b>3</b>
              <small>User roles</small>
            </span>

            <span>
              <b>100%</b>
              <small>Trackable</small>
            </span>
          </div>
        </div>

        <form
          className="auth-card"
          onSubmit={submit}
        >
          <div className="auth-card-head">
            <div className="feature-icon">
              <Ticket size={22} />
            </div>

            <h2>
              {register
                ? "Create your account"
                : "Sign in"}
            </h2>

            <p>
              {register
                ? "Start managing support requests today."
                : "Enter your credentials to continue."}
            </p>
          </div>

          {register && (
            <label>
              Full name

              <input
                required
                disabled={loading}
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
                placeholder="Rahul Sharma"
              />
            </label>
          )}

          <label>
            Email

            <input
              type="email"
              required
              disabled={loading}
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              required
              disabled={loading}
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary full"
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.85 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="auth-loading-spinner"
                />

                {register
                  ? "Creating account..."
                  : "Signing in..."}
              </>
            ) : (
              <>
                {register
                  ? "Create account"
                  : "Sign in"}

                <ArrowRight size={17} />
              </>
            )}
          </button>

          <div className="auth-switch">
            {register
              ? "Already have an account?"
              : "New to HelpDesk?"}{" "}

            <Link
              to={
                register
                  ? "/login"
                  : "/register"
              }
              style={{
                pointerEvents: loading ? "none" : "auto",
                opacity: loading ? 0.5 : 1
              }}
            >
              {register
                ? "Sign in"
                : "Create account"}
            </Link>
          </div>

          {!register && (
            <div className="demo-box">
              <b>Admin demo</b>

              <span>
                admin@ResolveHub.com
              </span>

              <span>
                Admin_ResolveHub@26
              </span>
            </div>
          )}
        </form>
      </div>

      <style>
        {`
          .auth-loading-spinner {
            animation: authSpin 0.8s linear infinite;
          }

          @keyframes authSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Auth;