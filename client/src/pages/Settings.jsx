import { useEffect, useState } from "react";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  Receipt,
  Lock,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Settings() {
  const token = localStorage.getItem("hasif_token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    storeName: "HASIF STORE",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    invoicePrefix: "INV-",
    invoiceFooter:
      "Thank you for shopping with us.",
    lowStockThreshold: 5,
    outOfStockWarning: true,
  });

  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/settings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load settings."
        );
      }

      if (data.settings) {
        setForm({
          storeName:
            data.settings.storeName ||
            "HASIF STORE",

          phone:
            data.settings.phone || "",

          email:
            data.settings.email || "",

          address:
            data.settings.address || "",

          gstNumber:
            data.settings.gstNumber || "",

          invoicePrefix:
            data.settings.invoicePrefix ||
            "INV-",

          invoiceFooter:
            data.settings.invoiceFooter ||
            "Thank you for shopping with us.",

          lowStockThreshold:
            data.settings.lowStockThreshold ??
            5,

          outOfStockWarning:
            data.settings.outOfStockWarning ??
            true,
        });
      }
    } catch (err) {
      console.error(
        "Load Settings Error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      form.lowStockThreshold === "" ||
      Number(form.lowStockThreshold) < 0
    ) {
      setError(
        "Please enter a valid low stock threshold."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            phone:
              form.phone.trim(),

            email:
              form.email.trim(),

            address:
              form.address.trim(),

            gstNumber:
              form.gstNumber
                .trim()
                .toUpperCase(),

            invoicePrefix:
              form.invoicePrefix.trim(),

            invoiceFooter:
              form.invoiceFooter.trim(),

            lowStockThreshold:
              Number(
                form.lowStockThreshold
              ),

            outOfStockWarning:
              form.outOfStockWarning,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save settings."
        );
      }

      setSuccess(
        "Settings saved successfully."
      );

      if (data.settings) {
        setForm((prev) => ({
          ...prev,

          storeName:
            data.settings.storeName ||
            "HASIF STORE",
        }));
      }

      setTimeout(() => {
        setSuccess("");
      }, 2500);

    } catch (err) {
      console.error(
        "Save Settings Error:",
        err
      );

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="settings-loading">
        <RefreshCw
          size={21}
          className="settings-spin"
        />

        Loading Settings...
      </div>
    );
  }

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .settings-page {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 35px;
          color: #111;
        }

        /* =================================================
           HEADER
        ================================================= */

        .settings-header {
          margin-bottom: 28px;
        }

        .settings-eyebrow {
          margin: 0 0 7px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #555;
          text-transform: uppercase;
        }

        .settings-title {
          margin: 0;
          font-size: 40px;
          line-height: 1.1;
          font-weight: 850;
          letter-spacing: -1.5px;
        }

        .settings-subtitle {
          margin: 9px 0 0;
          font-size: 16px;
          color: #666;
          line-height: 1.5;
        }

        /* =================================================
           ALERT
        ================================================= */

        .settings-alert {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 18px;
          padding: 15px 17px;

          border-radius: 12px;

          font-size: 14px;
          font-weight: 700;
        }

        .settings-alert.error {
          color: #a52218;
          background: #fff1ef;
          border: 1px solid #efc4bf;
        }

        .settings-alert.success {
          color: #19733b;
          background: #effaf2;
          border: 1px solid #bce4c6;
        }

        /* =================================================
           SECTION
        ================================================= */

        .settings-section {
          margin-bottom: 22px;

          background: #fff;

          border: 1px solid #d8d8d8;
          border-radius: 20px;

          overflow: hidden;

          box-shadow:
            0 12px 35px
            rgba(0, 0, 0, 0.05);
        }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 14px;

          padding: 23px 25px;

          background: #f7f7f7;

          border-bottom:
            1px solid #dedede;
        }

        .settings-section-icon {
          width: 47px;
          height: 47px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #111;
          color: #fff;
        }

        .settings-section-header h2 {
          margin: 0;

          font-size: 21px;
          font-weight: 800;
          color: #111;
        }

        .settings-section-header p {
          margin: 4px 0 0;

          font-size: 14px;
          color: #666;
        }

        .settings-section-body {
          padding: 27px;
        }

        /* =================================================
           GRID
        ================================================= */

        .settings-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 21px;
        }

        .settings-field {
          min-width: 0;

          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-field.full {
          grid-column: 1 / -1;
        }

        .settings-field label {
          font-size: 14px;
          font-weight: 800;
          color: #222;
        }

        /* =================================================
           INPUT
        ================================================= */

        .settings-input {
          width: 100%;
          min-height: 50px;

          padding: 0 15px;

          border: 1px solid #cfcfcf;
          border-radius: 11px;

          outline: none;

          background: #fff;

          font-family: inherit;
          font-size: 15px;
          color: #111;

          transition: 0.18s;
        }

        .settings-input:hover {
          border-color: #aaa;
        }

        .settings-input:focus {
          border-color: #111;

          box-shadow:
            0 0 0 3px
            rgba(0, 0, 0, 0.07);
        }

        .settings-input.locked {
          background: #eeeeee;
          color: #333;
          font-weight: 800;
          cursor: not-allowed;
        }

        .settings-textarea {
          width: 100%;
          min-height: 105px;

          padding: 14px 15px;

          border: 1px solid #cfcfcf;
          border-radius: 11px;

          outline: none;

          background: #fff;

          resize: vertical;

          font-family: inherit;
          font-size: 15px;
          color: #111;
        }

        .settings-textarea:focus {
          border-color: #111;

          box-shadow:
            0 0 0 3px
            rgba(0, 0, 0, 0.07);
        }

        /* =================================================
           NOTES
        ================================================= */

        .settings-note {
          display: flex;
          align-items: center;
          gap: 6px;

          font-size: 12px;
          font-weight: 600;

          color: #666;
        }

        .settings-hint {
          font-size: 12px;
          color: #666;
        }

        /* =================================================
           TOGGLE
        ================================================= */

        .settings-toggle {
          min-height: 50px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding: 11px 14px;

          border:
            1px solid #d3d3d3;

          border-radius: 11px;

          background: #fafafa;
        }

        .settings-toggle-text strong {
          display: block;

          font-size: 14px;
          color: #111;
        }

        .settings-toggle-text span {
          display: block;

          margin-top: 3px;

          font-size: 12px;
          color: #666;
        }

        .settings-switch {
          position: relative;

          width: 51px;
          height: 29px;

          flex-shrink: 0;
        }

        .settings-switch input {
          width: 0;
          height: 0;
          opacity: 0;
        }

        .settings-slider {
          position: absolute;
          inset: 0;

          border-radius: 30px;

          background: #c8c8c8;

          cursor: pointer;

          transition: 0.2s;
        }

        .settings-slider::before {
          content: "";

          position: absolute;

          width: 23px;
          height: 23px;

          left: 3px;
          top: 3px;

          border-radius: 50%;

          background: #fff;

          box-shadow:
            0 2px 5px
            rgba(0, 0, 0, 0.2);

          transition: 0.2s;
        }

        .settings-switch input:checked
        + .settings-slider {
          background: #111;
        }

        .settings-switch input:checked
        + .settings-slider::before {
          transform:
            translateX(22px);
        }

        /* =================================================
           SAVE BAR
        ================================================= */

        .settings-save-bar {
          display: flex;
          justify-content: flex-end;

          padding: 5px 0 20px;
        }

        .settings-save-button {
          min-height: 51px;

          padding: 0 24px;

          border: 0;
          border-radius: 12px;

          background: #111;
          color: #fff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          font-family: inherit;
          font-size: 15px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 12px 28px
            rgba(0, 0, 0, 0.15);

          transition: 0.2s;
        }

        .settings-save-button:hover {
          background: #222;
          transform:
            translateY(-1px);
        }

        .settings-save-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* =================================================
           LOADING
        ================================================= */

        .settings-loading {
          min-height: 400px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          color: #555;

          font-size: 16px;
          font-weight: 700;
        }

        .settings-spin {
          animation:
            settingsSpin
            0.8s
            linear
            infinite;
        }

        @keyframes settingsSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 850px) {

          .settings-page {
            padding:
              28px 20px 45px;
          }

          .settings-title {
            font-size: 34px;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          .settings-field.full {
            grid-column: auto;
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 560px) {

          .settings-page {
            padding:
              22px 14px 35px;
          }

          .settings-title {
            font-size: 30px;
          }

          .settings-subtitle {
            font-size: 14px;
          }

          .settings-section {
            border-radius: 16px;
          }

          .settings-section-header {
            padding: 18px;
          }

          .settings-section-body {
            padding: 18px;
          }

          .settings-section-header h2 {
            font-size: 18px;
          }

          .settings-section-header p {
            font-size: 12px;
          }

          .settings-save-button {
            width: 100%;
          }

          .settings-save-bar {
            padding-bottom: 10px;
          }

        }

      `}</style>

      <main className="settings-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="settings-header">

          <p className="settings-eyebrow">
            SYSTEM CONFIGURATION
          </p>

          <h1 className="settings-title">
            Settings
          </h1>

          <p className="settings-subtitle">
            Manage your store information,
            invoice settings and inventory
            preferences.
          </p>

        </header>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="settings-alert error">
            <AlertCircle size={19} />

            <span>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div className="settings-alert success">
            <CheckCircle2 size={19} />

            <span>
              {success}
            </span>
          </div>
        )}

        <form onSubmit={handleSave}>

          {/* =================================================
              STORE INFORMATION
          ================================================= */}

          <section className="settings-section">

            <div className="settings-section-header">

              <div className="settings-section-icon">
                <Store size={22} />
              </div>

              <div>

                <h2>
                  Store Information
                </h2>

                <p>
                  Basic information about
                  your store.
                </p>

              </div>

            </div>

            <div className="settings-section-body">

              <div className="settings-grid">

                {/* STORE NAME */}

                <div className="settings-field full">

                  <label>
                    Store Name
                  </label>

                  <input
                    className="
                      settings-input
                      locked
                    "
                    type="text"
                    value="HASIF STORE"
                    disabled
                    readOnly
                  />

                  <span className="settings-note">

                    <Lock size={13} />

                    Store name is permanent
                    and cannot be changed.

                  </span>

                </div>

                {/* PHONE */}

                <div className="settings-field">

                  <label>
                    Phone Number
                  </label>

                  <input
                    className="settings-input"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* EMAIL */}

                <div className="settings-field">

                  <label>
                    Email Address
                  </label>

                  <input
                    className="settings-input"
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* GST */}

                <div className="settings-field full">

                  <label>
                    GST Number
                  </label>

                  <input
                    className="settings-input"
                    type="text"
                    name="gstNumber"
                    placeholder="Enter GST number"
                    value={
                      form.gstNumber
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* ADDRESS */}

                <div className="settings-field full">

                  <label>
                    Store Address
                  </label>

                  <textarea
                    className="settings-textarea"
                    name="address"
                    placeholder="Enter complete store address"
                    value={
                      form.address
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              INVOICE SETTINGS
          ================================================= */}

          <section className="settings-section">

            <div className="settings-section-header">

              <div className="settings-section-icon">
                <Receipt size={22} />
              </div>

              <div>

                <h2>
                  Invoice Settings
                </h2>

                <p>
                  Customize your billing
                  information.
                </p>

              </div>

            </div>

            <div className="settings-section-body">

              <div className="settings-grid">

                {/* PREFIX */}

                <div className="settings-field">

                  <label>
                    Invoice Prefix
                  </label>

                  <input
                    className="settings-input"
                    type="text"
                    name="invoicePrefix"
                    placeholder="INV-"
                    value={
                      form.invoicePrefix
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span className="settings-hint">
                    Example: INV-0001
                  </span>

                </div>

                {/* FOOTER */}

                <div className="settings-field">

                  <label>
                    Invoice Footer
                  </label>

                  <input
                    className="settings-input"
                    type="text"
                    name="invoiceFooter"
                    placeholder="Thank you for shopping with us."
                    value={
                      form.invoiceFooter
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              INVENTORY SETTINGS
          ================================================= */}

          <section className="settings-section">

            <div className="settings-section-header">

              <div className="settings-section-icon">
                <Package size={22} />
              </div>

              <div>

                <h2>
                  Inventory Settings
                </h2>

                <p>
                  Configure stock warning
                  preferences.
                </p>

              </div>

            </div>

            <div className="settings-section-body">

              <div className="settings-grid">

                {/* LOW STOCK */}

                <div className="settings-field">

                  <label>
                    Low Stock Threshold
                  </label>

                  <input
                    className="settings-input"
                    type="number"
                    min="0"
                    name="lowStockThreshold"
                    value={
                      form.lowStockThreshold
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span className="settings-hint">
                    Products at or below this
                    quantity will show as
                    low stock.
                  </span>

                </div>

                {/* WARNING */}

                <div className="settings-field">

                  <label>
                    Stock Warning
                  </label>

                  <div className="settings-toggle">

                    <div className="settings-toggle-text">

                      <strong>
                        Enable stock warnings
                      </strong>

                      <span>
                        Show low and out-of-stock
                        alerts.
                      </span>

                    </div>

                    <label className="settings-switch">

                      <input
                        type="checkbox"
                        name="outOfStockWarning"
                        checked={
                          form.outOfStockWarning
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <span className="settings-slider"></span>

                    </label>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="settings-save-bar">

            <button
              type="submit"
              className="settings-save-button"
              disabled={saving}
            >

              {saving ? (

                <>
                  <RefreshCw
                    size={19}
                    className="settings-spin"
                  />

                  Saving Settings...
                </>

              ) : (

                <>
                  <Save size={19} />

                  Save Settings
                </>

              )}

            </button>

          </div>

        </form>

      </main>
    </>
  );
}

export default Settings;