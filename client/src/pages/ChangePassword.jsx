import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill all fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "New passwords do not match."
      );
      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    const token =
      localStorage.getItem(
        "hasif_token"
      );

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://hasifbillingsoft.onrender.com/api/auth/change-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Password change failed."
        );
      }

      const user =
        JSON.parse(
          localStorage.getItem(
            "hasif_user"
          ) || "{}"
        );

      user.mustChangePassword =
        false;

      localStorage.setItem(
        "hasif_user",
        JSON.stringify(user)
      );

      setSuccess(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     PASSWORD TOGGLE
  ===================================================== */

  const PasswordToggle = ({
    show,
    setShow,
  }) => {
    return (
      <button
        type="button"
        className="password-toggle"
        onClick={() =>
          setShow(!show)
        }
        aria-label={
          show
            ? "Hide password"
            : "Show password"
        }
      >
        {show ? (
          <EyeOff size={19} />
        ) : (
          <Eye size={19} />
        )}
      </button>
    );
  };

  return (
    <>
      {/* =================================================
          CHANGE PASSWORD STYLES
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .change-password-page {
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

        .change-password-page .glass-orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          opacity: 0.55;
        }

        .change-password-page .orb-one {
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

        .change-password-page .orb-two {
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
           CARD
        ================================================= */

        .change-password-card {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 500px;

          padding: 32px 42px 30px;

          border:
            1px solid
            rgba(255,255,255,0.95);

          border-radius: 30px;

          background:
            rgba(255,255,255,0.75);

          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);

          box-shadow:
            0 35px 90px
            rgba(0,0,0,0.10);

          animation:
            changePasswordIn
            0.6s ease;
        }

        @keyframes changePasswordIn {

          from {
            opacity: 0;
            transform:
              translateY(20px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }

        }

        /* =================================================
           BACK BUTTON
        ================================================= */

        .back-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-bottom: 27px;

          padding: 9px 13px;

          border:
            1px solid
            #e2e2df;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.75);

          color: #555;

          font-size: 12px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .back-button:hover {
          background: #111;

          color: #fff;

          transform:
            translateX(-2px);
        }

        /* =================================================
           LOGO
        ================================================= */

        .login-logo {
          display: flex;

          align-items: center;

          gap: 15px;

          margin-bottom: 32px;
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

          color: #fff;

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
          margin-bottom: 27px;
        }

        .login-heading h2 {
          margin: 0;

          color: #111;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 30px;

          line-height: 1.15;

          letter-spacing: -1px;
        }

        .login-heading p {
          max-width: 410px;

          margin: 9px 0 0;

          color: #888;

          font-size: 14px;

          line-height: 1.55;
        }

        /* =================================================
           FORM
        ================================================= */

        .login-form {
          display: flex;

          flex-direction: column;

          gap: 19px;
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

        /* =================================================
           INPUT
        ================================================= */

        .input-group input {
          width: 100%;

          height: 50px;

          padding:
            0 52px 0 15px;

          border:
            1px solid
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
           PASSWORD WRAPPER
        ================================================= */

        .password-wrapper {
          position: relative;

          width: 100%;
        }

        .password-toggle {
          position: absolute;

          top: 50%;
          right: 7px;

          transform:
            translateY(-50%);

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
           PASSWORD HINT
        ================================================= */

        .password-hint {
          margin-top: -2px;

          color: #999;

          font-size: 11px;

          line-height: 1.4;
        }

        /* =================================================
           ERROR
        ================================================= */

        .login-error {
          padding:
            12px 14px;

          border:
            1px solid
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
           SUCCESS
        ================================================= */

        .login-success {
          display: flex;

          align-items: center;

          gap: 8px;

          padding:
            12px 14px;

          border:
            1px solid
            rgba(0,120,60,0.15);

          border-radius: 11px;

          background:
            rgba(0,120,60,0.07);

          color: #08733e;

          font-size: 12px;

          font-weight: 600;
        }

        /* =================================================
           BUTTON
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

          color: #fff;

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
          transform:
            translateY(-2px);

          background: #1d1d1d;

          box-shadow:
            0 18px 35px
            rgba(0,0,0,0.20);
        }

        .login-button:active:not(:disabled) {
          transform:
            translateY(0);
        }

        .login-button:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        /* =================================================
           FOOTER
        ================================================= */

        .login-footer {
          margin-top: 27px;

          padding-top: 20px;

          border-top:
            1px solid
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

          .change-password-page {
            padding:
              20px 14px;
          }

          .change-password-card {
            padding:
              27px 24px 24px;

            border-radius: 24px;
          }

          .login-logo {
            margin-bottom: 27px;
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

      <div className="change-password-page">

        <div className="glass-orb orb-one"></div>

        <div className="glass-orb orb-two"></div>

        <div className="change-password-card">

          {/* =================================================
              BACK
          ================================================= */}

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={17} />

            Back to Dashboard
          </button>

          {/* =================================================
              LOGO
          ================================================= */}

          <div className="login-logo">

            <div className="logo-box">
              <LockKeyhole
                size={25}
                strokeWidth={2}
              />
            </div>

            <div>

              <h1>
                HASIF STORE
              </h1>

              <p>
                ACCOUNT SECURITY
              </p>

            </div>

          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="login-heading">

            <h2>
              Change password
            </h2>

            <p>
              Create a new password to
              keep your HASIF STORE
              account secure.
            </p>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* CURRENT PASSWORD */}

            <div className="input-group">

              <label>
                Current Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                />

                <PasswordToggle
                  show={
                    showCurrentPassword
                  }
                  setShow={
                    setShowCurrentPassword
                  }
                />

              </div>

            </div>

            {/* NEW PASSWORD */}

            <div className="input-group">

              <label>
                New Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <PasswordToggle
                  show={
                    showNewPassword
                  }
                  setShow={
                    setShowNewPassword
                  }
                />

              </div>

              <span className="password-hint">
                Minimum 8 characters
              </span>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="input-group">

              <label>
                Confirm New Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <PasswordToggle
                  show={
                    showConfirmPassword
                  }
                  setShow={
                    setShowConfirmPassword
                  }
                />

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="login-success">

                <CheckCircle2
                  size={17}
                />

                <span>
                  {success}
                </span>

              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                "Updating Password..."
              ) : (
                <>
                  <LockKeyhole
                    size={18}
                  />

                  <span>
                    Change Password
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

export default ChangePassword;