import { useState } from "react";
import {
  LogIn,
  Eye,
  EyeOff,
  Store,
  ShieldCheck,
} from "lucide-react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!userId || !password) {
      setError(
        "Please enter User ID and Password."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(
        userId,
        password
      );

      /* ==========================================
         SAVE LOGIN DATA
      ========================================== */

      localStorage.setItem(
        "hasif_token",
        data.token
      );

      localStorage.setItem(
        "hasif_user",
        JSON.stringify(data.user)
      );

      /* ==========================================
         LOGIN SUCCESS
         
         Always go directly to Dashboard.
         Do NOT check mustChangePassword.
      ========================================== */

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      setError(
        error?.message ||
          "Login failed. Please check your User ID and Password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =================================================
          LOGIN PAGE STYLES
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          width: 100%;
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px 20px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(0,0,0,0.07),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(0,0,0,0.06),
              transparent 30%
            ),
            #f5f5f3;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* =================================================
           BACKGROUND ORBS
        ================================================= */

        .glass-orb {
          position: absolute;

          border-radius: 50%;

          filter: blur(2px);

          pointer-events: none;

          opacity: 0.55;
        }

        .orb-one {
          width: 420px;
          height: 420px;

          top: -180px;
          left: -150px;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,0.95),
              rgba(220,220,215,0.25),
              transparent 70%
            );
        }

        .orb-two {
          width: 500px;
          height: 500px;

          right: -230px;
          bottom: -230px;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,0.95),
              rgba(220,220,215,0.25),
              transparent 70%
            );
        }

        /* =================================================
           LOGIN CARD
        ================================================= */

        .login-card {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 470px;

          padding: 42px 42px 30px;

          border: 1px solid
            rgba(255,255,255,0.95);

          border-radius: 30px;

          background:
            rgba(255,255,255,0.72);

          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);

          box-shadow:
            0 35px 90px
            rgba(0,0,0,0.10);

          animation:
            loginCardIn 0.6s ease;
        }

        @keyframes loginCardIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =================================================
           LOGO
        ================================================= */

        .login-logo {
          display: flex;
          align-items: center;

          gap: 15px;

          margin-bottom: 38px;
        }

        .logo-box {
          width: 58px;
          height: 58px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background: #111;

          color: white;

          box-shadow:
            0 12px 25px
            rgba(0,0,0,0.18);
        }

        .login-logo h1 {
          margin: 0;

          color: #111;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 22px;

          font-weight: 800;

          letter-spacing: -0.6px;
        }

        .login-logo p {
          margin: 5px 0 0;

          color: #999;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 2px;
        }

        /* =================================================
           HEADING
        ================================================= */

        .login-heading {
          margin-bottom: 28px;
        }

        .login-heading h2 {
          margin: 0;

          color: #111;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 31px;

          line-height: 1.15;

          letter-spacing: -1.2px;
        }

        .login-heading p {
          margin: 9px 0 0;

          color: #888;

          font-size: 14px;

          line-height: 1.5;
        }

        /* =================================================
           FORM
        ================================================= */

        .login-form {
          display: flex;

          flex-direction: column;

          gap: 20px;
        }

        .input-group {
          display: flex;

          flex-direction: column;

          gap: 8px;
        }

        .input-group label {
          color: #444;

          font-size: 12px;

          font-weight: 700;

          letter-spacing: 0.2px;
        }

        .input-group input {
          width: 100%;

          height: 50px;

          padding: 0 15px;

          border: 1px solid
            #e1e1df;

          border-radius: 13px;

          outline: none;

          background:
            rgba(255,255,255,0.82);

          color: #111;

          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input-group input::placeholder {
          color: #aaa;
        }

        .input-group input:focus {
          border-color: #111;

          background: #fff;

          box-shadow:
            0 0 0 4px
            rgba(0,0,0,0.05);
        }

        /* =================================================
           PASSWORD
        ================================================= */

        .password-wrapper {
          position: relative;

          width: 100%;
        }

        .password-wrapper input {
          padding-right: 52px;
        }

        .password-toggle {
          position: absolute;

          top: 50%;
          right: 7px;

          transform: translateY(-50%);

          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: none;

          border-radius: 10px;

          background: transparent;

          color: #777;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .password-toggle:hover {
          background: #f0f0ee;

          color: #111;
        }

        /* =================================================
           ERROR
        ================================================= */

        .login-error {
          padding: 12px 14px;

          border: 1px solid
            rgba(180,0,0,0.12);

          border-radius: 11px;

          background:
            rgba(180,0,0,0.06);

          color: #b00000;

          font-size: 12px;

          font-weight: 600;

          line-height: 1.4;
        }

        /* =================================================
           LOGIN BUTTON
        ================================================= */

        .login-button {
          width: 100%;

          height: 52px;

          margin-top: 2px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          border: none;

          border-radius: 14px;

          background: #111;

          color: white;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 14px 30px
            rgba(0,0,0,0.15);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);

          background: #1d1d1d;

          box-shadow:
            0 18px 35px
            rgba(0,0,0,0.20);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        /* =================================================
           FOOTER
        ================================================= */

        .login-footer {
          margin-top: 28px;
          padding-top: 20px;

          border-top: 1px solid
            rgba(0,0,0,0.07);

          display: flex;

          align-items: center;
          justify-content: space-between;

          color: #999;

          font-size: 10px;
        }

        .login-footer span:first-child {
          color: #555;

          font-weight: 800;

          letter-spacing: 0.5px;
        }

        .login-footer span:last-child {
          display: flex;
          align-items: center;

          gap: 5px;
        }

        .login-footer span:last-child::before {
          content: "";

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #111;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 600px) {

          .login-page {
            padding: 20px 14px;
          }

          .login-card {
            padding: 30px 24px 24px;

            border-radius: 24px;
          }

          .login-logo {
            margin-bottom: 30px;
          }

          .logo-box {
            width: 52px;
            height: 52px;
          }

          .login-logo h1 {
            font-size: 19px;
          }

          .login-heading h2 {
            font-size: 27px;
          }

          .login-heading p {
            font-size: 13px;
          }

          .login-form {
            gap: 17px;
          }

          .login-footer {
            font-size: 9px;
          }
        }

      `}</style>

      {/* =================================================
          PAGE
      ================================================= */}

      <div className="login-page">

        <div className="glass-orb orb-one"></div>

        <div className="glass-orb orb-two"></div>

        <div className="login-card">

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="login-logo">

            <div className="logo-box">

              <Store
                size={25}
                strokeWidth={2}
              />

            </div>

            <div>

              <h1>
                HASIF STORE
              </h1>

              <p>
                POS • BILLING • INVENTORY
              </p>

            </div>

          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="login-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to manage your store
            </p>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* USER ID */}

            <div className="input-group">

              <label>
                User ID
              </label>

              <input
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) =>
                  setUserId(
                    e.target.value
                  )
                }
                autoComplete="username"
              />

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label>
                Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn size={19} />

                  <span>
                    Sign In
                  </span>
                </>
              )}

            </button>

          </form>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="login-footer">

            <span>
              HASIF STORE
            </span>

            <span>
              Secure POS System
            </span>

          </div>

        </div>

      </div>
    </>
  );
}

export default Login;