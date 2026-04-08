
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import HeroBanner from "./HeroBanner";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── CSS VARIABLES ── */
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

  /* ===========================
      SIGN UP
  =========================== */
  .sign_in_img {
    width: 570px;
    height: 770px;
    overflow: hidden;
    border-radius: 12px;
    -webkit-border-radius: 12px;
    -moz-border-radius: 12px;
    -ms-border-radius: 12px;
    -o-border-radius: 12px;
  }

  .sign_in_img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .sign_up .sign_in_img {
    height: 650px;
    margin-bottom: 120px;
  }

  .sign_in_form {
    background: var(--colorWhite);
    box-shadow: var(--boxShadow);
    padding: 35px;
    
    border-radius: 12px;
    -webkit-border-radius: 12px;
    -moz-border-radius: 12px;
    -ms-border-radius: 12px;
    -o-border-radius: 12px;
  }

  .sign_in_form h3 {
    font-size: 32px;
    font-weight: 600;
    text-align: center;
    font-family: var(--headingFont);
    color: var(--colorBlack);
  }

  .sign_up .sign_in_form form button {
    margin-top: 25px;
  }

  /* ── Alert Messages ── */
  #message .alert {
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

  /* ── Single Input ── */
  .single_input {
    margin-bottom: 20px;
    position: relative;
  }

  .single_input label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--colorBlack);
    margin-bottom: 8px;
    font-family: var(--paraFont);
  }

  .single_input input,
  .single_input select {
    width: 100%;
    padding: 13px 44px 13px 16px;
    border: 1.5px solid #e5ddd5;
    border-radius: 8px;
    font-size: 15px;
    font-family: var(--paraFont);
    background: #fdfaf7;
    color: var(--colorBlack);
    outline: none;
    transition: all linear .3s;
    -webkit-transition: all linear .3s;
    -moz-transition: all linear .3s;
    -ms-transition: all linear .3s;
    -o-transition: all linear .3s;
    appearance: none;
    -webkit-appearance: none;
  }

  .single_input select {
    padding-right: 44px;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23777' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
  }

  .single_input input:focus,
  .single_input select:focus {
    border-color: var(--themeColorTwo);
    background: var(--colorWhite);
    box-shadow: 0 0 0 3px rgba(181, 137, 106, 0.12);
  }

  .single_input input.is-invalid,
  .single_input select.is-invalid {
    border-color: var(--colorRed);
    background: #fff8f8;
  }

  .invalid-feedback {
    font-size: 13px;
    color: var(--colorRed);
    margin-top: 5px;
  }

  /* ── Password Toggle ── */
  .pw-input-wrap {
    position: relative;
    width: 100%;
  }
  .pw-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: color linear .3s;
    -webkit-transition: color linear .3s;
  }
  .pw-toggle:hover { color: var(--themeColorTwo); }

  /* Hide native Edge eye icon */
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }

  /* ── Password Strength ── */
  .pw-strength-bar {
    height: 4px;
    border-radius: 4px;
    margin-top: 8px;
    transition: all linear .3s;
    -webkit-transition: all linear .3s;
  }
  .pw-strength-label {
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  }
  .strength-weak   { background: #e74c3c; width: 33%; }
  .strength-medium { background: #f39c12; width: 66%; }
  .strength-strong { background: #27ae60; width: 100%; }
  .label-weak      { color: #e74c3c; }
  .label-medium    { color: #f39c12; }
  .label-strong    { color: #27ae60; }

  /* ── Common Button ── */
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
  width: 100%;
  margin-top: 25px;
  position: relative;        /* ADD */
  overflow: hidden;          /* ADD */
  z-index: 1;                /* ADD */
  transition: color 0.3s ease;
  text-decoration: none;
}

.common_btn::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 100%;
  background: #333333;
  z-index: -1;
  transition: width 0.3s ease;
}

.common_btn:hover:not(:disabled)::after {
  width: 100%;
  left: 0;
}

.common_btn:hover:not(:disabled) {
  color: var(--colorWhite);  /* keep white, dark bg handles contrast */
}

.common_btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.common_btn .arrow {
  display: inline-block;
  transition: transform 0.25s;
}

.common_btn:hover:not(:disabled) .arrow {
  transform: rotate(45deg);
}

  /* ── Spinner ── */
  .spinner {
    width: 17px;
    height: 17px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Don't have account ── */
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
    transition: all linear .3s;
    -webkit-transition: all linear .3s;
    -moz-transition: all linear .3s;
    -ms-transition: all linear .3s;
    -o-transition: all linear .3s;
    text-decoration: none;
  }

  .sign_in_form .dont_account a:hover {
    color: var(--themeColorTwo);
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1399px) {
    .sign_in_img { width: 100%; }
  }

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
    .mt_100 { margin-top: 40px; }
    .mb_100 { margin-bottom: 40px; }
  }
`;

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone.replace(/\s/g, ""));



function getPasswordStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6) return "weak";
  if (pw.length >= 6 && (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))) return "medium";
  return "strong";
}

export default function SignUpSection() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const pwStrength = getPasswordStrength(form.password);
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email) e.email = "Email is required.";
    else if (!validateEmail(form.email)) e.email = "Please enter a valid email address.";
    if (!form.phone) e.phone = "Phone number is required.";
    else if (!validatePhone(form.phone)) e.phone = "Please enter a valid 10-digit phone number.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!form.confirm_password) e.confirm_password = "Please confirm your password.";
    else if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match.";
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

    const result = await register(form);
    setLoading(false);

    if (result.success) {
      toast.success("Account created successfully!");
      setMessage({
        type: "success",
        text: `✅ Account created successfully! Welcome, ${form.name.split(" ")[0]}!`,
      });
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setMessage({
        type: "danger",
        text: `❌ ${result.message}`,
      });
    }
  };

  return (
    <>
      <style>{styles}</style>
      <HeroBanner
        title="Register"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Register" },
        ]}
      />
      <section className="sign_up mt_100 mb_100">
        <div className="container">
          <div className="row justify-content-center align-items-center">

            {/* ── Left Image — hidden below lg ── */}
            <div className="col-xxl-3 col-lg-4 col-xl-4 d-none d-lg-block wow fadeInLeft">
              <div className="sign_in_img">
                <img
                  src="images/productimg.jpeg"
                  alt="Sign Up"
                  className="img-fluid w-100"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.style.cssText =
                      "height:770px;border-radius:12px;background:linear-gradient(160deg,#fce4ec 0%,#f8bbd0 50%,#f48fb1 100%);";
                  }}
                />
              </div>
            </div>

            {/* ── Right Form ── */}
            <div className="col-xxl-5 col-lg-8 col-xl-6 col-md-10 wow fadeInRight">
              <div className="sign_in_form">
                <h3>Sign Up to Continue 👋</h3>

                {/* Alert */}
                <div id="message">
                  {message && (
                    <div className={`alert alert-${message.type}`}>
                      {message.text}
                    </div>
                  )}
                </div>

                <form id="registerForm" onSubmit={handleSubmit} noValidate>
                  <div className="row">

                    {/* Full Name */}
                    <div className="col-lg-12">
                      <div className="single_input">
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          placeholder="First name"
                          className={errors.name ? "is-invalid" : ""}
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          autoComplete="name"
                          required
                        />
                        {errors.name && <div className="invalid-feedback">⚠ {errors.name}</div>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-lg-12">
                      <div className="single_input">
                        <label htmlFor="reg-email">Email</label>
                        <input
                          type="email"
                          name="email"
                          id="reg-email"
                          placeholder="example@Zenis.com"
                          className={errors.email ? "is-invalid" : ""}
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          autoComplete="email"
                          required
                        />
                        {errors.email && <div className="invalid-feedback">⚠ {errors.email}</div>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-lg-12">
                      <div className="single_input">
                        <label htmlFor="phone">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          placeholder="0000000000"
                          className={errors.phone ? "is-invalid" : ""}
                          value={form.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            handleChange("phone", val);
                          }}
                          autoComplete="tel"
                          required
                        />
                        {errors.phone && <div className="invalid-feedback">⚠ {errors.phone}</div>}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="col-lg-6">
                      <div className="single_input">
                        <label htmlFor="reg-password">Password</label>
                          <input
                            type="password"
                            name="password"
                            id="reg-password"
                            placeholder="••••••••"
                            className={errors.password ? "is-invalid" : ""}
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            autoComplete="new-password"
                            required
                          />
                        {errors.password && <div className="invalid-feedback">⚠ {errors.password}</div>}
                        {/* Password Strength Bar */}
                        {form.password && !errors.password && (
                          <>
                            <div className={`pw-strength-bar strength-${pwStrength}`} />
                            <div className={`pw-strength-label label-${pwStrength}`}>
                              {pwStrength === "weak" && "Weak password"}
                              {pwStrength === "medium" && "Medium strength"}
                              {pwStrength === "strong" && "Strong password ✓"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-lg-6">
                      <div className="single_input">
                        <label htmlFor="confirm_password">Confirm Password</label>
                          <input
                            type="password"
                            name="confirm_password"
                            id="confirm_password"
                            placeholder="••••••••"
                            className={errors.confirm_password ? "is-invalid" : ""}
                            value={form.confirm_password}
                            onChange={(e) => handleChange("confirm_password", e.target.value)}
                            autoComplete="new-password"
                            required
                          />
                        {errors.confirm_password && (
                          <div className="invalid-feedback">⚠ {errors.confirm_password}</div>
                        )}
                        {/* Match indicator */}
                        {form.confirm_password && !errors.confirm_password && form.password === form.confirm_password && (
                          <div style={{ fontSize: "12px", color: "#27ae60", marginTop: "4px", fontWeight: 500 }}>
                            ✓ Passwords match
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Submit */}
                    {/* Submit */}
                    <div className="col-lg-12">
                      <button type="submit" className="common_btn" disabled={loading}>
                        {loading ? (
                          <><span className="spinner" /> Creating Account…</>
                        ) : (
                          <>
                            Submit{" "}
                            <span className="arrow">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7" />
                                <polyline points="7 7 17 7 17 17" />
                              </svg>
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </form>

                <p className="dont_account">
                  Already have an account?{" "}
                  <a href="/login">Login Now</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}