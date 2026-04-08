import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeroBanner from "./HeroBanner";
import { toast } from "react-toastify";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --colorWhite:    #ffffff;
    --colorBlack:    #1a1a1a;
    --paraColor:     #777777;
    --themeColorTwo: #b5896a;
    --colorRed:      #e74c3c;
    --headingFont:   'Cormorant Garamond', serif;
    --paraFont:      'DM Sans', sans-serif;
    --boxShadow:     0 10px 50px rgba(0, 0, 0, 0.08);
    --lightBg2:      #f5f0eb;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--paraFont);
    background: #f9f5f0;
  }

  .mt_100 { margin-top: 100px; }
  .mb_100 { margin-bottom: 100px; }

  .sign_in_img {
    width: 570px;
    height: 770px;
    overflow: hidden;
    border-radius: 12px;
  }

  .sign_in_img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .sign_in .sign_in_img { height: 640px; }
  .forgot_password .sign_in_img { height: 365px; }

  .sign_in_form {
    background: var(--colorWhite);
    box-shadow: var(--boxShadow);
    padding: 50px;
    margin: 30px 0px;
    border-radius: 12px;
  }

  .sign_in_form h3 {
    font-size: 32px;
    font-weight: 600;
    text-align: center;
    font-family: var(--headingFont);
    color: var(--colorBlack);
  }

  .sign_in_form form button {
    width: 100%;
    margin-top: 15px;
  }

  #loginMessage .alert {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .alert-success {
    background: #f0faf4;
    color: #2d7d52;
    border: 1px solid #b7e4c7;
  }
  .alert-danger {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #fed7d7;
  }

  .single_input {
    margin-bottom: 20px;
  }

  .single_input label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--colorBlack);
    margin-bottom: 8px;
    font-family: var(--paraFont);
  }

  .single_input input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid #e5ddd5;
    border-radius: 8px;
    font-size: 15px;
    font-family: var(--paraFont);
    background: #fdfaf7;
    color: var(--colorBlack);
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
    display: block;
  }

  .single_input input:focus {
    border-color: var(--themeColorTwo);
    background: var(--colorWhite);
    box-shadow: 0 0 0 3px rgba(181, 137, 106, 0.12);
  }

  .single_input input.is-invalid {
    border-color: var(--colorRed);
    background: #fff8f8;
  }

  .invalid-feedback {
    font-size: 13px;
    color: var(--colorRed);
    margin-top: 5px;
    display: block;
  }

  /* ────────────────────────────────────────────
     Password wrapper — the KEY fix
     The wrapper is relative so the absolute
     button stays glued to the right edge.
     The input gets right padding so text never
     runs under the icon.
  ──────────────────────────────────────────── */
  .pw-input-wrap {
    position: relative;
    width: 100%;
  }

  .pw-input-wrap input {
    padding-right: 50px !important;
  }

  .pw-toggle {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 46px;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    padding: 0;
    margin: 0;
    z-index: 10;
    transition: color 0.25s;
  }

  .pw-toggle:hover { color: var(--themeColorTwo); }

  /* Ensure the SVG never adds extra space */
  .pw-toggle svg {
    display: block;
    pointer-events: none;
    flex-shrink: 0;
  }

  /* Hide native Edge eye icon */
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }

  /* ── Common Button ── */
  .common_btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 30px;
    background: var(--themeColorTwo);
    color: var(--colorWhite);
    border: 2px solid var(--themeColorTwo);
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    font-family: var(--paraFont);
    letter-spacing: 0.04em;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    z-index: 1;
    transition: color 0.3s ease;
    text-decoration: none;
  }

  .common_btn::after {
    content: "";
    position: absolute;
    top: 0; right: 0;
    width: 0; height: 100%;
    background: #333333;
    z-index: -1;
    transition: width 0.3s ease;
  }

  .common_btn:hover:not(:disabled)::after { width: 100%; left: 0; }
  .common_btn:hover:not(:disabled) { color: var(--colorWhite); }
  .common_btn .arrow { display: inline-block; transition: transform 0.25s; }
  .common_btn:hover:not(:disabled) .arrow { transform: rotate(45deg); }
  .common_btn:disabled { opacity: 0.72; cursor: not-allowed; }

  /* ── Spinner ── */
  .spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sign_in_form .forgot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
  }

  .sign_in_form .forgot .form-check {
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sign_in_form .forgot .form-check input {
    padding: 0;
    width: 16px; height: 16px;
    accent-color: var(--themeColorTwo);
    cursor: pointer;
  }

  .sign_in_form .forgot .form-check label {
    font-size: 16px;
    font-weight: 400;
    color: var(--colorBlack);
    cursor: pointer;
    margin-bottom: 0;
    font-family: var(--paraFont);
  }

  .sign_in_form .forgot a,
  .sign_in_form .forgot .forgot-btn {
    font-size: 16px;
    text-transform: capitalize;
    font-weight: 400;
    color: var(--paraColor);
    transition: color 0.3s;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--paraFont);
    padding: 0;
  }

  .sign_in_form .forgot a:hover,
  .sign_in_form .forgot .forgot-btn:hover { color: var(--colorRed); }

  .sign_in_form .dont_account {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
    color: var(--paraColor);
    font-family: var(--paraFont);
  }

  .sign_in_form .dont_account a {
    color: var(--colorBlack);
    font-family: var(--headingFont);
    font-size: 16px;
    font-weight: 500;
    transition: color 0.3s;
    text-decoration: none;
  }

  .sign_in_form .dont_account a:hover { color: var(--themeColorTwo); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-card {
    background: var(--colorWhite);
    border-radius: 12px;
    padding: 50px 44px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.15);
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  .modal-card h3 {
    font-size: 28px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 8px;
    font-family: var(--headingFont);
    color: var(--colorBlack);
  }

  .modal-subtitle {
    font-size: 14px;
    color: var(--paraColor);
    text-align: center;
    margin-bottom: 28px;
    font-family: var(--paraFont);
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }

  .btn-cancel {
    flex: 1;
    padding: 13px;
    background: none;
    border: 1.5px solid #e0d8d0;
    border-radius: 8px;
    font-size: 14px;
    color: var(--paraColor);
    cursor: pointer;
    font-family: var(--paraFont);
    transition: all 0.3s;
  }
  .btn-cancel:hover { border-color: var(--themeColorTwo); color: var(--themeColorTwo); }

  .btn-send {
    flex: 1;
    padding: 13px;
    background: var(--themeColorTwo);
    border: 2px solid var(--themeColorTwo);
    border-radius: 8px;
    font-size: 14px;
    color: var(--colorWhite);
    cursor: pointer;
    font-family: var(--paraFont);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
    z-index: 1;
    transition: color 0.3s ease;
  }

  .btn-send::after {
    content: "";
    position: absolute;
    top: 0; right: 0;
    width: 0; height: 100%;
    background: #333333;
    z-index: -1;
    transition: width 0.3s ease;
  }

  .btn-send:hover:not(:disabled)::after { width: 100%; left: 0; }
  .btn-send:hover:not(:disabled) { color: var(--colorWhite); }
  .btn-send .arrow { display: inline-block; transition: transform 0.25s; }
  .btn-send:hover:not(:disabled) .arrow { transform: rotate(45deg); }
  .btn-send:disabled { opacity: 0.7; cursor: not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1399px) { .sign_in_img { width: 100%; } }

  @media (max-width: 991px) {
    .sign_in_form { padding: 40px 30px; }
    .mt_100 { margin-top: 60px; }
    .mb_100 { margin-bottom: 60px; }
  }

  @media (max-width: 767px) {
    .sign_in_form { padding: 35px 24px; }
    .sign_in_form h3 { font-size: 26px; }
    .mt_100 { margin-top: 50px; }
    .mb_100 { margin-bottom: 50px; }
  }

  @media (max-width: 575px) {
    .sign_in_form { padding: 28px 18px; margin: 0; }
    .sign_in_form h3 { font-size: 22px; margin-bottom: 20px; }
    .sign_in_form .forgot a,
    .sign_in_form .forgot .forgot-btn { font-size: 14px; }
    .sign_in_form .forgot .form-check label { font-size: 14px; }
    .modal-card { padding: 32px 20px; }
    .mt_100 { margin-top: 40px; }
    .mb_100 { margin-bottom: 40px; }
  }
`;

/* ── Arrow Icon ── */
const ArrowIcon = () => (
  <span className="arrow">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  </span>
);

/*
  Two completely separate icon components.
  The parent renders ONLY ONE of them via a ternary —
  there is zero chance both appear at the same time.
*/


const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ── Forgot Password Modal ── */
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) { setError("Email is required"); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h3>Reset Password 🔐</h3>
        <p className="modal-subtitle">
          {sent
            ? "Check your inbox — the reset link is on its way."
            : "Enter your registered email to receive a reset link."}
        </p>

        {sent ? (
          <>
            <div className="alert alert-success">
              ✅ Reset link sent to <strong>{email}</strong>
            </div>
            <p style={{ fontSize: "13px", color: "#777", marginBottom: "20px", lineHeight: "1.6" }}>
              Didn't receive it? Check your spam folder. The link expires in <strong>1 hour</strong>.
            </p>
            <button className="common_btn" style={{ width: "100%", marginTop: 0 }} onClick={onClose}>
              Back to Login <ArrowIcon />
            </button>
          </>
        ) : (
          <>
            <div className="single_input">
              <label>Email Address</label>
              <input
                type="email"
                className={error ? "is-invalid" : ""}
                placeholder="example@gen1eco.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                autoFocus
              />
              {error && <div className="invalid-feedback">⚠ {error}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-send" onClick={handleSend} disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Sending…</>
                  : <>Send Link <ArrowIcon /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Sign In Section ── */
export default function SignInSection() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required.";
    else if (!validateEmail(form.email)) e.email = "Please enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: "" }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setMessage(null);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success("Successfully Logged In!");
      setMessage({ type: "success", text: "✅ Welcome back! Redirecting..." });
      const redirectTo = location.state?.redirectTo || "/";
      setTimeout(() => navigate(redirectTo), 1000);
    } else {
      setMessage({ type: "danger", text: `❌ ${result.message}` });
    }
  };

  return (
    <>
      <style>{styles}</style>

      <HeroBanner
        title="Login"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Login" }]}
      />

      <section className="sign_in mt_100 mb_100">
        <div className="container">
          <div className="row justify-content-center align-items-center">

            {/* Left Image */}
            <div className="col-xxl-3 col-lg-4 col-xl-4 d-none d-lg-block wow fadeInLeft">
              <div className="sign_in_img">
                <img
                  src="images/productimg.jpeg"
                  alt="Sign In"
                  className="img-fluid w-100"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.style.cssText =
                      "height:640px;border-radius:12px;background:linear-gradient(160deg,#fce4ec 0%,#f8bbd0 50%,#f48fb1 100%);";
                  }}
                />
              </div>
            </div>

            {/* Right Form */}
            <div className="col-xxl-4 col-lg-7 col-xl-6 col-md-10 wow fadeInRight">
              <div className="sign_in_form">
                <h3>Sign In to Continue 👋</h3>

                {/* Alert */}
                <div id="loginMessage">
                  {message && (
                    <div className={`alert alert-${message.type}`}>{message.text}</div>
                  )}
                </div>

                <form id="loginForm" onSubmit={handleSubmit} noValidate>
                  <div className="row">

                    {/* Email */}
                    <div className="col-xl-12">
                      <div className="single_input">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="example@Zenis.com"
                          className={errors.email ? "is-invalid" : ""}
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          autoComplete="email"
                          required
                        />
                        {errors.email && (
                          <div className="invalid-feedback">⚠ {errors.email}</div>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="col-xl-12">
                      <div className="single_input">
                        <label htmlFor="password">Password</label>

                          <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            className={errors.password ? "is-invalid" : ""}
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            autoComplete="current-password"
                            required
                          />

                        {errors.password && (
                          <div className="invalid-feedback">⚠ {errors.password}</div>
                        )}
                      </div>
                    </div>

                    {/* Remember Me + Forgot */}
                    <div className="col-12">
                      <div className="forgot">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="remember"
                            id="remember"
                            checked={form.remember}
                            onChange={(e) => handleChange("remember", e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="remember">
                            Remember Me
                          </label>
                        </div>
                        <button
                          type="button"
                          className="forgot-btn"
                          onClick={() => setShowForgot(true)}
                        >
                          Forgot Password ?
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="col-xl-12">
                      <button type="submit" className="common_btn" disabled={loading}>
                        {loading
                          ? <><span className="spinner" /> Signing In…</>
                          : <>Submit <ArrowIcon /></>}
                      </button>
                    </div>

                  </div>
                </form>

                <p className="dont_account">
                  Already have an account?{" "}
                  <a href="register">Register Now</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
}