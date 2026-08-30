import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Truck,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://hasifbillingsoft.onrender.com/api";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gstNumber: "",
};

function Suppliers() {
  const token = localStorage.getItem("hasif_token");

  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetchSuppliers();
  }, []);

  /* =====================================================
     FETCH SUPPLIERS
  ===================================================== */

  const fetchSuppliers = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/suppliers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load suppliers."
        );
      }

      setSuppliers(
        Array.isArray(data.suppliers)
          ? data.suppliers
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Fetch Suppliers Error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      await fetchSuppliers();
    } finally {
      setRefreshing(false);
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredSuppliers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return (
        supplier.name
          ?.toLowerCase()
          .includes(query) ||

        supplier.phone
          ?.toLowerCase()
          .includes(query) ||

        supplier.email
          ?.toLowerCase()
          .includes(query) ||

        supplier.address
          ?.toLowerCase()
          .includes(query) ||

        supplier.gstNumber
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [suppliers, search]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    setEditingSupplier(null);

    setForm(EMPTY_FORM);

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      gstNumber: supplier.gstNumber || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingSupplier(null);

    setForm(EMPTY_FORM);

    setError("");
    setSuccess("");
  };

  /* =====================================================
     SAVE SUPPLIER
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Supplier name is required."
      );

      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Mobile number is required."
      );

      return;
    }

    try {
      setSaving(true);

      const isEditing =
        Boolean(editingSupplier);

      const url = isEditing
        ? `${API_URL}/suppliers/${editingSupplier._id}`
        : `${API_URL}/suppliers`;

      const response = await fetch(
        url,
        {
          method: isEditing
            ? "PUT"
            : "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.name.trim(),

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
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Failed to update supplier."
              : "Failed to create supplier.")
        );
      }

      setSuccess(
        isEditing
          ? "Supplier updated successfully."
          : "Supplier added successfully."
      );

      await fetchSuppliers();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error(
        "Supplier Save Error:",
        err
      );

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE SUPPLIER
  ===================================================== */

  const handleDelete = async (
    supplier
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${supplier.name}"?\n\nThe supplier will be removed from the active supplier list.`
      );

    if (!confirmed) return;

    try {
      setDeleting(supplier._id);

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_URL}/suppliers/${supplier._id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete supplier."
        );
      }

      setSuccess(
        "Supplier deleted successfully."
      );

      await fetchSuppliers();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error(
        "Supplier Delete Error:",
        err
      );

      setError(err.message);
    } finally {
      setDeleting("");
    }
  };

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     GET INITIAL
  ===================================================== */

  const getInitial = (name) => {
    return (
      name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "S"
    );
  };

  return (
    <>
      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .suppliers-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 36px 36px 60px;
          box-sizing: border-box;
          color: #111;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .suppliers-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .suppliers-eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #666;
          text-transform: uppercase;
        }

        .suppliers-title {
          margin: 0;
          font-size: 38px;
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #111;
        }

        .suppliers-subtitle {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.5;
          color: #666;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .suppliers-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .supplier-button {
          min-height: 46px;
          padding: 0 18px;
          border-radius: 12px;
          border: 1px solid #dedede;
          background: #fff;
          color: #111;
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .supplier-button:hover {
          border-color: #aaa;
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px
            rgba(0,0,0,0.06);
        }

        .supplier-button.primary {
          background: #111;
          color: #fff;
          border-color: #111;
          box-shadow:
            0 10px 25px
            rgba(0,0,0,0.12);
        }

        .supplier-button.primary:hover {
          background: #222;
        }

        .supplier-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* =====================================================
           STATS
        ===================================================== */

        .suppliers-stats {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .supplier-stat-card {
          min-width: 0;
          min-height: 125px;
          padding: 22px;
          border:
            1px solid
            #dedede;
          border-radius: 18px;
          background: #fff;
          box-shadow:
            0 10px 30px
            rgba(0,0,0,0.045);
          box-sizing: border-box;
        }

        .supplier-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .supplier-stat-label {
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }

        .supplier-stat-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          color: #111;
        }

        .supplier-stat-value {
          display: block;
          margin-top: 13px;
          font-size: 29px;
          line-height: 1;
          font-weight: 800;
          color: #111;
        }

        /* =====================================================
           MAIN CARD
        ===================================================== */

        .suppliers-card {
          width: 100%;
          min-width: 0;
          border:
            1px solid
            #dcdcdc;
          border-radius: 20px;
          background: #fff;
          overflow: hidden;
          box-shadow:
            0 15px 45px
            rgba(0,0,0,0.055);
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .suppliers-toolbar {
          padding: 20px;
          border-bottom:
            1px solid
            #e3e3e3;
          background: #fafafa;
          box-sizing: border-box;
        }

        .suppliers-search {
          width: 100%;
          min-height: 50px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          border:
            1px solid
            #d4d4d4;
          border-radius: 12px;
          background: #fff;
          color: #777;
          box-sizing: border-box;
        }

        .suppliers-search:focus-within {
          border-color: #111;
          box-shadow:
            0 0 0 3px
            rgba(0,0,0,0.06);
        }

        .suppliers-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 15px;
          color: #111;
        }

        .suppliers-search input::placeholder {
          color: #888;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .suppliers-table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .suppliers-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        .suppliers-table th {
          padding: 16px 20px;
          text-align: left;
          background: #f7f7f7;
          border-bottom:
            1px solid
            #dedede;
          color: #555;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .suppliers-table td {
          padding: 19px 20px;
          border-bottom:
            1px solid
            #ededed;
          vertical-align: middle;
          font-size: 14px;
          color: #333;
        }

        .suppliers-table tbody tr {
          transition:
            background 0.15s ease;
        }

        .suppliers-table tbody tr:hover {
          background: #fafafa;
        }

        /* =====================================================
           SUPPLIER NAME
        ===================================================== */

        .supplier-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 190px;
        }

        .supplier-avatar {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          font-size: 16px;
          font-weight: 800;
        }

        .supplier-name {
          font-size: 15px;
          font-weight: 800;
          color: #111;
        }

        .supplier-label {
          margin-top: 3px;
          font-size: 12px;
          color: #888;
        }

        /* =====================================================
           CONTACT
        ===================================================== */

        .supplier-contact {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #444;
          white-space: nowrap;
        }

        .supplier-address {
          max-width: 240px;
          line-height: 1.45;
          white-space: normal;
        }

        .supplier-gst {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 9px;
          border-radius: 8px;
          background: #f2f2f2;
          color: #333;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .supplier-date {
          color: #555;
          font-size: 13px;
          white-space: nowrap;
        }

        /* =====================================================
           ROW ACTIONS
        ===================================================== */

        .supplier-row-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .supplier-icon-action {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border:
            1px solid
            #dedede;
          border-radius: 10px;
          background: #fff;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .supplier-icon-action:hover {
          background: #111;
          border-color: #111;
          color: #fff;
        }

        .supplier-icon-action.delete:hover {
          background: #b42318;
          border-color: #b42318;
          color: #fff;
        }

        .supplier-icon-action:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .suppliers-empty {
          min-height: 300px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .suppliers-empty-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 15px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          color: #555;
        }

        .suppliers-empty h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .suppliers-empty p {
          margin: 7px 0 0;
          font-size: 14px;
          color: #777;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .suppliers-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 20px;
          font-size: 13px;
          color: #666;
        }

        /* =====================================================
           ALERT
        ===================================================== */

        .supplier-alert {
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 700;
          box-sizing: border-box;
        }

        .supplier-alert.error {
          background: #fff0ef;
          border:
            1px solid
            #f2c3bf;
          color: #a52218;
        }

        .supplier-alert.success {
          background: #effaf2;
          border:
            1px solid
            #bde4c5;
          color: #19733b;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .supplier-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          padding: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(0,0,0,0.48);
          backdrop-filter: blur(7px);
          box-sizing: border-box;
        }

        .supplier-modal {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 22px;
          background: #fff;
          box-shadow:
            0 30px 80px
            rgba(0,0,0,0.25);
        }

        .supplier-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 23px 25px;
          border-bottom:
            1px solid
            #e5e5e5;
        }

        .supplier-modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .supplier-modal-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
        }

        .supplier-modal-title h2 {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
        }

        .supplier-modal-title p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #777;
        }

        .supplier-modal-close {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border:
            1px solid
            #ddd;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .supplier-modal-close:hover {
          background: #f2f2f2;
        }

        .supplier-modal-body {
          padding: 25px;
        }

        .supplier-form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .supplier-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .supplier-field.full {
          grid-column: 1 / -1;
        }

        .supplier-field label {
          font-size: 13px;
          font-weight: 800;
          color: #333;
        }

        .supplier-field input,
        .supplier-field textarea {
          width: 100%;
          box-sizing: border-box;
          border:
            1px solid
            #d5d5d5;
          border-radius: 11px;
          padding: 13px 14px;
          outline: none;
          background: #fff;
          font-family: inherit;
          font-size: 15px;
          color: #111;
          transition: border 0.18s ease;
        }

        .supplier-field textarea {
          min-height: 105px;
          resize: vertical;
        }

        .supplier-field input:focus,
        .supplier-field textarea:focus {
          border-color: #111;
          box-shadow:
            0 0 0 3px
            rgba(0,0,0,0.06);
        }

        .supplier-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 25px;
          border-top:
            1px solid
            #e5e5e5;
          background: #fafafa;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .suppliers-loading {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #666;
          font-size: 15px;
          font-weight: 600;
        }

        .supplier-spin {
          animation:
            supplierSpin 0.8s
            linear infinite;
        }

        @keyframes supplierSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1050px) {

          .suppliers-page {
            padding:
              30px 24px 50px;
          }

          .suppliers-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .supplier-stat-card:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 780px) {

          .suppliers-page {
            padding:
              24px 16px 40px;
          }

          .suppliers-header {
            flex-direction: column;
            align-items: stretch;
          }

          .suppliers-title {
            font-size: 32px;
          }

          .suppliers-actions {
            width: 100%;
          }

          .supplier-button {
            flex: 1;
          }

          .suppliers-stats {
            grid-template-columns: 1fr;
          }

          .supplier-stat-card:last-child {
            grid-column: auto;
          }

          .supplier-form-grid {
            grid-template-columns: 1fr;
          }

          .supplier-field.full {
            grid-column: auto;
          }

          .supplier-modal-overlay {
            padding: 12px;
          }

          .supplier-modal {
            max-height: 94vh;
            border-radius: 18px;
          }
        }

        @media (max-width: 520px) {

          .suppliers-actions {
            flex-direction: column;
          }

          .supplier-button {
            width: 100%;
            flex: none;
          }

          .suppliers-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .supplier-modal-header {
            padding:
              18px;
          }

          .supplier-modal-body {
            padding:
              18px;
          }

          .supplier-modal-footer {
            padding:
              16px 18px;
          }

          .supplier-modal-title h2 {
            font-size: 19px;
          }
        }

      `}</style>

      <main className="suppliers-page">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="suppliers-header">

          <div>

            <p className="suppliers-eyebrow">
              MANAGEMENT
            </p>

            <h1 className="suppliers-title">
              Suppliers
            </h1>

            <p className="suppliers-subtitle">
              Manage your store suppliers and
              supplier information.
            </p>

          </div>

          <div className="suppliers-actions">

            <button
              type="button"
              className="supplier-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "supplier-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              className="supplier-button primary"
              onClick={openAddModal}
            >
              <Plus size={18} />

              Add Supplier
            </button>

          </div>

        </header>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <div className="supplier-alert error">

            <AlertCircle size={18} />

            <span>
              {error}
            </span>

          </div>
        )}

        {success && (
          <div className="supplier-alert success">

            <CheckCircle2 size={18} />

            <span>
              {success}
            </span>

          </div>
        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="suppliers-stats">

          <div className="supplier-stat-card">

            <div className="supplier-stat-top">

              <span className="supplier-stat-label">
                Total Suppliers
              </span>

              <div className="supplier-stat-icon">
                <Truck size={21} />
              </div>

            </div>

            <strong className="supplier-stat-value">
              {suppliers.length}
            </strong>

          </div>

          <div className="supplier-stat-card">

            <div className="supplier-stat-top">

              <span className="supplier-stat-label">
                Search Results
              </span>

              <div className="supplier-stat-icon">
                <Search size={21} />
              </div>

            </div>

            <strong className="supplier-stat-value">
              {filteredSuppliers.length}
            </strong>

          </div>

          <div className="supplier-stat-card">

            <div className="supplier-stat-top">

              <span className="supplier-stat-label">
                Active Suppliers
              </span>

              <div className="supplier-stat-icon">
                <CheckCircle2 size={21} />
              </div>

            </div>

            <strong className="supplier-stat-value">
              {suppliers.length}
            </strong>

          </div>

        </section>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <section className="suppliers-card">

          {/* SEARCH */}

          <div className="suppliers-toolbar">

            <div className="suppliers-search">

              <Search size={20} />

              <input
                type="text"
                placeholder="Search supplier name, phone, email, GST or address..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

          {/* ===================================================
              LOADING
          =================================================== */}

          {loading ? (

            <div className="suppliers-loading">

              <RefreshCw
                size={19}
                className="supplier-spin"
              />

              Loading suppliers...

            </div>

          ) : filteredSuppliers.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="suppliers-empty">

              <div className="suppliers-empty-icon">
                <Truck size={30} />
              </div>

              <h3>
                {search
                  ? "No suppliers found"
                  : "No suppliers yet"}
              </h3>

              <p>
                {search
                  ? "Try another search."
                  : "Add your first supplier to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  className="supplier-button primary"
                  style={{
                    marginTop: "18px",
                  }}
                  onClick={
                    openAddModal
                  }
                >
                  <Plus size={17} />

                  Add Supplier
                </button>
              )}

            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================= */

            <div className="suppliers-table-wrap">

              <table className="suppliers-table">

                <thead>

                  <tr>

                    <th>
                      Supplier
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      GST Number
                    </th>

                    <th>
                      Address
                    </th>

                    <th>
                      Added
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredSuppliers.map(
                    (supplier) => (

                      <tr
                        key={
                          supplier._id
                        }
                      >

                        {/* NAME */}

                        <td>

                          <div className="supplier-name-cell">

                            <div className="supplier-avatar">

                              {getInitial(
                                supplier.name
                              )}

                            </div>

                            <div>

                              <div className="supplier-name">
                                {supplier.name ||
                                  "-"}
                              </div>

                              <div className="supplier-label">
                                Supplier
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* PHONE */}

                        <td>

                          <div className="supplier-contact">

                            <Phone size={15} />

                            {supplier.phone ||
                              "-"}

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td>

                          <div className="supplier-contact">

                            <Mail size={15} />

                            {supplier.email ||
                              "-"}

                          </div>

                        </td>

                        {/* GST */}

                        <td>

                          {supplier.gstNumber ? (

                            <span className="supplier-gst">

                              <FileText
                                size={14}
                              />

                              {
                                supplier.gstNumber
                              }

                            </span>

                          ) : (
                            <span>
                              -
                            </span>
                          )}

                        </td>

                        {/* ADDRESS */}

                        <td>

                          <div className="supplier-contact supplier-address">

                            <MapPin
                              size={15}
                            />

                            {
                              supplier.address ||
                              "-"
                            }

                          </div>

                        </td>

                        {/* DATE */}

                        <td>

                          <div className="supplier-date">

                            {formatDate(
                              supplier.createdAt
                            )}

                          </div>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="supplier-row-actions">

                            <button
                              type="button"
                              className="supplier-icon-action"
                              title="Edit supplier"
                              onClick={() =>
                                openEditModal(
                                  supplier
                                )
                              }
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              className="supplier-icon-action delete"
                              title="Delete supplier"
                              disabled={
                                deleting ===
                                supplier._id
                              }
                              onClick={() =>
                                handleDelete(
                                  supplier
                                )
                              }
                            >

                              {deleting ===
                              supplier._id ? (

                                <RefreshCw
                                  size={17}
                                  className="supplier-spin"
                                />

                              ) : (

                                <Trash2
                                  size={17}
                                />

                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

          {/* ===================================================
              FOOTER
          =================================================== */}

          {!loading &&
            filteredSuppliers.length >
              0 && (

              <div className="suppliers-footer">

                <span>

                  Showing{" "}

                  <strong>
                    {
                      filteredSuppliers.length
                    }
                  </strong>{" "}

                  supplier
                  {filteredSuppliers.length !==
                  1
                    ? "s"
                    : ""}

                </span>

                {search && (

                  <span>

                    Filtered from{" "}

                    <strong>
                      {suppliers.length}
                    </strong>{" "}

                    total suppliers

                  </span>

                )}

              </div>

            )}

        </section>

      </main>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="supplier-modal-overlay">

          <div className="supplier-modal">

            {/* HEADER */}

            <div className="supplier-modal-header">

              <div className="supplier-modal-title">

                <div className="supplier-modal-icon">

                  {editingSupplier ? (
                    <Pencil size={20} />
                  ) : (
                    <UserRound size={20} />
                  )}

                </div>

                <div>

                  <h2>
                    {editingSupplier
                      ? "Edit Supplier"
                      : "Add Supplier"}
                  </h2>

                  <p>
                    {editingSupplier
                      ? "Update supplier information."
                      : "Create a new supplier record."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="supplier-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="supplier-modal-body">

                {error && (

                  <div className="supplier-alert error">

                    <AlertCircle
                      size={17}
                    />

                    <span>
                      {error}
                    </span>

                  </div>

                )}

                {success && (

                  <div className="supplier-alert success">

                    <CheckCircle2
                      size={17}
                    />

                    <span>
                      {success}
                    </span>

                  </div>

                )}

                <div className="supplier-form-grid">

                  {/* NAME */}

                  <div className="supplier-field full">

                    <label>
                      Supplier Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter supplier name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      autoFocus
                    />

                  </div>

                  {/* PHONE */}

                  <div className="supplier-field">

                    <label>
                      Mobile Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter mobile number"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="supplier-field">

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="supplier@email.com"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* GST */}

                  <div className="supplier-field full">

                    <label>
                      GST Number
                    </label>

                    <input
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

                  <div className="supplier-field full">

                    <label>
                      Address
                    </label>

                    <textarea
                      name="address"
                      placeholder="Enter supplier address"
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

              {/* FOOTER */}

              <div className="supplier-modal-footer">

                <button
                  type="button"
                  className="supplier-button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  <X size={17} />

                  Cancel
                </button>

                <button
                  type="submit"
                  className="supplier-button primary"
                  disabled={
                    saving
                  }
                >

                  {saving ? (

                    <>
                      <RefreshCw
                        size={17}
                        className="supplier-spin"
                      />

                      Saving...
                    </>

                  ) : (

                    <>
                      <Save size={17} />

                      {editingSupplier
                        ? "Update Supplier"
                        : "Save Supplier"}
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}

export default Suppliers;