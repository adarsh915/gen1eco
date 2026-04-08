import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import HeroBanner from "./HeroBanner";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --colorWhite:    #ffffff;
    --colorBlack:    #1a1a1a;
    --paraColor:     #777777;
    --themeColor:    #b5896a;
    --colorRed:      #e74c3c;
    --headingFont:   'Cormorant Garamond', serif;
    --paraFont:      'DM Sans', sans-serif;
    --boxShadow:     0 10px 50px rgba(0, 0, 0, 0.08);
    --lightBg:       #f9f5f0;
  }

  .rp-section {
    background: var(--lightBg);
    min-height: 70vh;
    display: flex;
    align-items: center;
    padding: 80px 0;
  }

  .rp-card {
    background: var(--colorWhite);
    box-shadow: var(--boxShadow);
    padding: 52px 48px;
    border-radius: 12px;
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
  }

  .rp-card h2 {
    font-family: var(--headingFont);
    font-size: 30px;
    font-weight: 600;
    color: var(--colorBlack);
    margin-bottom: 6px;
    text-align: center;
  }

  .rp-subtitle {
    font-size: 14px;
    color: var(--paraColor);
    text-align: center;
    margin-bottom: 32px;
    line-height: 1.6;
    font-family: var(--paraFont);
  }

  .rp-input-group {
    margin-bottom: 20px;
  }

  .rp-input-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--colorBlack);
    margin-bottom: 8px;
    font-family: var(--paraFont);
  }

  .rp-pw-wrap {
    position: relative;
    width: 100%;
  }

  .rp-pw-wrap input {
    width: 100%;
    padding: 13px 50px 13px 16px;
    border: 1.5px solid #e5ddd5;
    border-radius: 8px;
    font-size: 15px;
    font-family: var(--paraFont);
    background: #fdfaf7;
    color: var(--colorBlack);
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
    box-sizing: border-box;
  }

  .rp-pw-wrap input:focus {
    border-color: var(--themeColor);
    background: var(--colorWhite);
    box-shadow: 0 0 0 3px rgba(181, 137, 106, 0.12);
  }

  .rp-pw-wrap input.is-invalid {
    border-color: var(--colorRed);
    background: #fff8f8;
  }

  .rp-eye-btn {
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 46px;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    transition: color 0.25s;
    z-index: 2;
  }
  .rp-eye-btn:hover { color: var(--themeColor); }

  .rp-invalid {
    font-size: 13px;
    color: var(--colorRed);
    margin-top: 5px;
    display: block;
    font-family: var(--paraFont);
  }

  .rp-strength {
    margin-top: 8px;
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .rp-strength-bar {
    height: 4px;
    flex: 1;
    border-radius: 4px;
    background: #e5ddd5;
    transition: background 0.3s;
  }

  .rp-strength-label {
    font-size: 12px;
    color: var(--paraColor);
    font-family: var(--paraFont);
    min-width: 48px;
    text-align: right;
  }

  .rp-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 30px;
    background: var(--themeColor);
    color: var(--colorWhite);
    border: 2px solid var(--themeColor);
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    font-family: var(--paraFont);
    cursor: pointer;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
    z-index: 1;
    transition: color 0.3s ease;
  }
  .rp-btn::after {
    content: "";
    position: absolute;
    top: 0; right: 0;
    width: 0; height: 100%;
    background: #333;
    z-index: -1;
    transition: width 0.3s ease;
  }
  .rp-btn:hover:not(:disabled)::after { width: 100%; left: 0; }
  .rp-btn:hover:not(:disabled) { color: #fff; }
  .rp-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .rp-spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rp-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes rp-spin { to { transform: rotate(360deg); } }

  .rp-alert {
    padding: 14px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 20px;
    font-family: var(--paraFont);
    line-height: 1.5;
  }
  .rp-alert-success {
    background: #f0faf4;
    color: #2d7d52;
    border: 1px solid #b7e4c7;
  }
  .rp-alert-danger {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #fed7d7;
  }
  .rp-alert-warning {
    background: #fffaf0;
    color: #b7791f;
    border: 1px solid #fad383;
  }

  .rp-back-link {
    display: block;
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: var(--paraColor);
    font-family: var(--paraFont);
    text-decoration: none;
    transition: color 0.3s;
  }
  .rp-back-link:hover { color: var(--themeColor); }

  .rp-success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: #f0faf4;
    border-radius: 50%;
    margin: 0 auto 24px;
  }

  @media (max-width: 575px) {
    .rp-card { padding: 32px 20px; }
    .rp-card h2 { font-size: 24px; }
  }
`;

// Password strength meter
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { score: 0, label: "",       color: "#e5ddd5" },
    { score: 1, label: "Weak",   color: "#e74c3c" },
    { score: 2, label: "Fair",   color: "#e67e22" },
    { score: 3, label: "Good",   color: "#f1c40f" },
    { score: 4, label: "Strong", color: "#27ae60" },
  ];
  return levels[score];
}

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("verifying"); // verifying | valid | invalid | success
  const [invalidMsg, setInvalidMsg] = useState("");

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const strength = getStrength(newPw);

  // Verify token when page loads
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setInvalidMsg("No reset token found. Please request a new reset link.");
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/users/reset-password/verify?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (data.success && data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
          setInvalidMsg(data.message || "Invalid or expired reset link. Please request a new one.");
        }
      } catch {
        setStatus("invalid");
        setInvalidMsg("Could not verify your reset link. Please check your connection and try again.");
      }
    };
    verify();
  }, [token]);

  const validate = () => {
    const e = {};
    if (!newPw) e.newPw = "New password is required.";
    else if (newPw.length < 8) e.newPw = "Password must be at least 8 characters.";
    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (newPw !== confirmPw) e.confirmPw = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setApiError("");
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPw }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        // If token was invalid (race condition), show as invalid
        if (res.status === 400) {
          setStatus("invalid");
          setInvalidMsg(data.message || "Your reset link has expired. Please request a new one.");
        } else {
          setApiError(data.message || "Failed to reset password. Please try again.");
          // Show password requirements if returned
          if (data.errors && data.errors.length) {
            setApiError(data.errors.join(" • "));
          }
        }
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <HeroBanner
        title="Reset Password"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Login", href: "/login" }, { label: "Reset Password" }]}
      />

      <section className="rp-section">
        <div className="container">

          {/* ── VERIFYING ── */}
          {status === "verifying" && (
            <div className="rp-card" style={{ textAlign: "center" }}>
              <div className="rp-spinner" style={{ width: 36, height: 36, margin: "0 auto 20px", borderWidth: 3, borderColor: "rgba(181,137,106,0.3)", borderTopColor: "#b5896a" }} />
              <p style={{ color: "#777", fontFamily: "var(--paraFont)" }}>Verifying your reset link…</p>
            </div>
          )}

          {/* ── INVALID / EXPIRED ── */}
          {status === "invalid" && (
            <div className="rp-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
              <h2>Link Expired</h2>
              <p className="rp-subtitle">{invalidMsg}</p>
              <Link to="/login" className="rp-btn" style={{ display: "flex", textDecoration: "none", marginTop: 0 }}>
                Back to Login
              </Link>
            </div>
          )}

          {/* ── SET NEW PASSWORD FORM ── */}
          {status === "valid" && (
            <div className="rp-card">
              <h2>Set New Password 🔐</h2>
              <p className="rp-subtitle">Choose a strong password you haven't used before.</p>

              {apiError && (
                <div className="rp-alert rp-alert-danger">⚠ {apiError}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* New Password */}
                <div className="rp-input-group">
                  <label>New Password</label>
                  <div className="rp-pw-wrap">
                    <input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={newPw}
                      onChange={(e) => { setNewPw(e.target.value); if (errors.newPw) setErrors(er => ({ ...er, newPw: "" })); }}
                      className={errors.newPw ? "is-invalid" : ""}
                      autoFocus
                      autoComplete="new-password"
                    />
                    <button type="button" className="rp-eye-btn" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                      {showNew ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {newPw && (
                    <div className="rp-strength">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rp-strength-bar"
                          style={{ background: strength.score >= i ? strength.color : "#e5ddd5" }} />
                      ))}
                      <span className="rp-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                  {errors.newPw && <span className="rp-invalid">⚠ {errors.newPw}</span>}
                </div>

                {/* Confirm Password */}
                <div className="rp-input-group">
                  <label>Confirm Password</label>
                  <div className="rp-pw-wrap">
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirmPw}
                      onChange={(e) => { setConfirmPw(e.target.value); if (errors.confirmPw) setErrors(er => ({ ...er, confirmPw: "" })); }}
                      className={errors.confirmPw ? "is-invalid" : ""}
                      autoComplete="new-password"
                    />
                    <button type="button" className="rp-eye-btn" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                      {showConfirm ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                  {errors.confirmPw && <span className="rp-invalid">⚠ {errors.confirmPw}</span>}
                </div>

                {/* Password hints */}
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 20, fontFamily: "var(--paraFont)", lineHeight: 1.6 }}>
                  Password must contain at least 8 characters, one uppercase letter, one number, and one special character.
                </div>

                <button type="submit" className="rp-btn" disabled={loading}>
                  {loading
                    ? <><span className="rp-spinner" /> Resetting…</>
                    : "Reset Password →"}
                </button>
              </form>

              <Link to="/login" className="rp-back-link">← Back to Login</Link>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <div className="rp-card" style={{ textAlign: "center" }}>
              <div className="rp-success-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>Password Reset! 🎉</h2>
              <p className="rp-subtitle">
                Your password has been changed successfully.<br />
                A confirmation email has been sent to you.
              </p>
              <div className="rp-alert rp-alert-success">
                ✅ You can now log in with your new password.
              </div>
              <button
                className="rp-btn"
                onClick={() => navigate("/login")}
              >
                Go to Login →
              </button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
