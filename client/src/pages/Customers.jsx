import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Users,
  Phone,
  Mail,
  MapPin,
  Save,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

function Customers() {
  const token = localStorage.getItem("hasif_token");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     AUTH
  ===================================================== */

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetchCustomers();
  }, []);

  /* =====================================================
     FETCH CUSTOMERS
  ===================================================== */

  const fetchCustomers = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load customers."
        );
      }

      setCustomers(
        Array.isArray(data.customers)
          ? data.customers
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error("Customers Error:", err);
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
      await fetchCustomers();
    } finally {
      setRefreshing(false);
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.address?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     OPEN ADD
  ===================================================== */

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
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
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  /* =====================================================
     SAVE CUSTOMER
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Mobile number is required.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingCustomer);

      const url = isEditing
        ? `${API_URL}/customers/${editingCustomer._id}`
        : `${API_URL}/customers`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Failed to update customer."
              : "Failed to create customer.")
        );
      }

      setSuccess(
        isEditing
          ? "Customer updated successfully."
          : "Customer added successfully."
      );

      await fetchCustomers();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      console.error("Customer Save Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE CUSTOMER
  ===================================================== */

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete "${customer.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(customer._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/customers/${customer._id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete customer."
        );
      }

      setSuccess("Customer deleted successfully.");

      await fetchCustomers();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Customer Delete Error:", err);
      setError(err.message);
    } finally {
      setDeleting("");
    }
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        /* =====================================================
           ROOT
        ===================================================== */

        .customers-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 36px 36px 60px;
          color: #111;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .customers-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .customers-eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #666;
          text-transform: uppercase;
        }

        .customers-title {
          margin: 0;
          font-size: 38px;
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #111;
        }

        .customers-subtitle {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.5;
          color: #666;
        }

        /* =====================================================
           HEADER ACTIONS
        ===================================================== */

        .customers-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .customers-action-button {
          height: 46px;
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
        }

        .customers-action-button:hover {
          border-color: #aaa;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        }

        .customers-action-button.primary {
          background: #111;
          border-color: #111;
          color: #fff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.12);
        }

        .customers-action-button.primary:hover {
          background: #222;
        }

        /* =====================================================
           STATS
        ===================================================== */

        .customers-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .customer-stat-card {
          min-height: 125px;
          padding: 22px;
          border: 1px solid #dedede;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.045);
        }

        .customer-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .customer-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          color: #111;
        }

        .customer-stat-label {
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }

        .customer-stat-value {
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

        .customers-card {
          border: 1px solid #dcdcdc;
          border-radius: 20px;
          background: #fff;
          overflow: hidden;
          box-shadow: 0 15px 45px rgba(0,0,0,0.055);
        }

        /* =====================================================
           SEARCH BAR
        ===================================================== */

        .customers-toolbar {
          padding: 20px;
          border-bottom: 1px solid #e3e3e3;
          background: #fafafa;
        }

        .customers-search {
          width: 100%;
          min-height: 50px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          border: 1px solid #d4d4d4;
          border-radius: 12px;
          background: #fff;
          color: #777;
        }

        .customers-search:focus-within {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }

        .customers-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 15px;
          color: #111;
        }

        .customers-search input::placeholder {
          color: #888;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .customers-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .customers-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .customers-table th {
          padding: 16px 20px;
          text-align: left;
          background: #f7f7f7;
          border-bottom: 1px solid #dedede;
          color: #555;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .customers-table td {
          padding: 19px 20px;
          border-bottom: 1px solid #ededed;
          vertical-align: middle;
          font-size: 14px;
          color: #333;
        }

        .customers-table tbody tr {
          transition: background 0.15s ease;
        }

        .customers-table tbody tr:hover {
          background: #fafafa;
        }

        .customer-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .customer-avatar {
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

        .customer-name {
          font-size: 15px;
          font-weight: 800;
          color: #111;
        }

        .customer-id {
          margin-top: 3px;
          font-size: 12px;
          color: #888;
        }

        .customer-contact {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #444;
        }

        .customer-address {
          max-width: 230px;
          line-height: 1.45;
          color: #555;
        }

        .customer-date {
          color: #555;
          font-size: 13px;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .customer-row-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .icon-action {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #dedede;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #333;
          transition: all 0.18s ease;
        }

        .icon-action:hover {
          background: #111;
          border-color: #111;
          color: #fff;
        }

        .icon-action.delete:hover {
          background: #b42318;
          border-color: #b42318;
          color: #fff;
        }

        .icon-action:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .customers-empty {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .customers-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          color: #555;
          margin-bottom: 15px;
        }

        .customers-empty h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .customers-empty p {
          margin: 7px 0 0;
          font-size: 14px;
          color: #777;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .customers-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 17px 20px;
          font-size: 13px;
          color: #666;
        }

        /* =====================================================
           ALERT
        ===================================================== */

        .customers-alert {
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 700;
        }

        .customers-alert.error {
          background: #fff0ef;
          border: 1px solid #f2c3bf;
          color: #a52218;
        }

        .customers-alert.success {
          background: #effaf2;
          border: 1px solid #bde4c5;
          color: #19733b;
        }

        /* =====================================================
           MODAL
        ===================================================== */

        .customer-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px;
          background: rgba(0,0,0,0.48);
          backdrop-filter: blur(7px);
        }

        .customer-modal {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 30px 80px rgba(0,0,0,0.25);
        }

        .customer-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 23px 25px;
          border-bottom: 1px solid #e5e5e5;
        }

        .customer-modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .customer-modal-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
        }

        .customer-modal-title h2 {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
        }

        .customer-modal-title p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #777;
        }

        .modal-close {
          width: 40px;
          height: 40px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #f2f2f2;
        }

        .customer-modal-body {
          padding: 25px;
        }

        .customer-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .customer-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .customer-field.full {
          grid-column: 1 / -1;
        }

        .customer-field label {
          font-size: 13px;
          font-weight: 800;
          color: #333;
        }

        .customer-field input,
        .customer-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d5d5d5;
          border-radius: 11px;
          padding: 13px 14px;
          outline: none;
          background: #fff;
          font-family: inherit;
          font-size: 15px;
          color: #111;
          transition: border 0.18s ease;
        }

        .customer-field textarea {
          min-height: 105px;
          resize: vertical;
        }

        .customer-field input:focus,
        .customer-field textarea:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }

        .customer-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 25px;
          border-top: 1px solid #e5e5e5;
          background: #fafafa;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .customers-loading {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 15px;
          font-weight: 600;
        }

        .spin {
          animation: customerSpin 0.8s linear infinite;
        }

        @keyframes customerSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1000px) {
          .customers-page {
            padding: 28px 24px 45px;
          }

          .customers-stats {
            grid-template-columns: 1fr 1fr;
          }

          .customer-stat-card:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .customers-page {
            padding: 22px 16px 35px;
          }

          .customers-header {
            flex-direction: column;
          }

          .customers-actions {
            width: 100%;
          }

          .customers-action-button {
            flex: 1;
          }

          .customers-title {
            font-size: 32px;
          }

          .customers-stats {
            grid-template-columns: 1fr;
          }

          .customer-stat-card:last-child {
            grid-column: auto;
          }

          .customer-form-grid {
            grid-template-columns: 1fr;
          }

          .customer-field.full {
            grid-column: auto;
          }

          .customer-modal-overlay {
            padding: 12px;
          }

          .customer-modal {
            border-radius: 18px;
          }
        }

        @media (max-width: 500px) {
          .customers-actions {
            flex-direction: column;
          }

          .customers-action-button {
            width: 100%;
            flex: none;
          }

          .customers-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .customer-modal-header,
          .customer-modal-body,
          .customer-modal-footer {
            padding-left: 18px;
            padding-right: 18px;
          }
        }
      `}</style>

      <main className="customers-page">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="customers-header">
          <div>
            <p className="customers-eyebrow">
              MANAGEMENT
            </p>

            <h1 className="customers-title">
              Customers
            </h1>

            <p className="customers-subtitle">
              Manage your store customers and their contact details.
            </p>
          </div>

          <div className="customers-actions">
            <button
              type="button"
              className="customers-action-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={refreshing ? "spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              className="customers-action-button primary"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Customer
            </button>
          </div>
        </header>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <div className="customers-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="customers-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="customers-stats">

          <div className="customer-stat-card">
            <div className="customer-stat-top">
              <span className="customer-stat-label">
                Total Customers
              </span>

              <div className="customer-stat-icon">
                <Users size={21} />
              </div>
            </div>

            <strong className="customer-stat-value">
              {customers.length}
            </strong>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-top">
              <span className="customer-stat-label">
                Search Results
              </span>

              <div className="customer-stat-icon">
                <Search size={21} />
              </div>
            </div>

            <strong className="customer-stat-value">
              {filteredCustomers.length}
            </strong>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-top">
              <span className="customer-stat-label">
                Customer Records
              </span>

              <div className="customer-stat-icon">
                <UserRound size={21} />
              </div>
            </div>

            <strong className="customer-stat-value">
              {customers.length}
            </strong>
          </div>

        </section>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <section className="customers-card">

          {/* SEARCH */}

          <div className="customers-toolbar">
            <div className="customers-search">
              <Search size={20} />

              <input
                type="text"
                placeholder="Search customer name, phone, email or address..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          {/* TABLE */}

          {loading ? (
            <div className="customers-loading">
              Loading customers...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="customers-empty">

              <div className="customers-empty-icon">
                <Users size={30} />
              </div>

              <h3>
                {search
                  ? "No customers found"
                  : "No customers yet"}
              </h3>

              <p>
                {search
                  ? "Try another search."
                  : "Add your first customer to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  className="customers-action-button primary"
                  style={{ marginTop: "18px" }}
                  onClick={openAddModal}
                >
                  <Plus size={17} />
                  Add Customer
                </button>
              )}

            </div>
          ) : (
            <div className="customers-table-wrap">

              <table className="customers-table">

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCustomers.map((customer) => {

                    const firstLetter =
                      customer.name?.charAt(0)?.toUpperCase() ||
                      "C";

                    return (
                      <tr key={customer._id}>

                        <td>
                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              {firstLetter}
                            </div>

                            <div>
                              <div className="customer-name">
                                {customer.name || "-"}
                              </div>

                              <div className="customer-id">
                                Customer
                              </div>
                            </div>

                          </div>
                        </td>

                        <td>
                          <div className="customer-contact">
                            <Phone size={15} />
                            {customer.phone || "-"}
                          </div>
                        </td>

                        <td>
                          <div className="customer-contact">
                            <Mail size={15} />
                            {customer.email || "-"}
                          </div>
                        </td>

                        <td>
                          <div className="customer-contact customer-address">
                            <MapPin size={15} />
                            {customer.address || "-"}
                          </div>
                        </td>

                        <td>
                          <div className="customer-date">
                            {formatDate(
                              customer.createdAt
                            )}
                          </div>
                        </td>

                        <td>

                          <div className="customer-row-actions">

                            <button
                              type="button"
                              className="icon-action"
                              title="Edit customer"
                              onClick={() =>
                                openEditModal(customer)
                              }
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className="icon-action delete"
                              title="Delete customer"
                              disabled={
                                deleting === customer._id
                              }
                              onClick={() =>
                                handleDelete(customer)
                              }
                            >
                              {deleting === customer._id ? (
                                <RefreshCw
                                  size={17}
                                  className="spin"
                                />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

          {/* FOOTER */}

          {!loading &&
            filteredCustomers.length > 0 && (
              <div className="customers-footer">
                <span>
                  Showing{" "}
                  <strong>
                    {filteredCustomers.length}
                  </strong>{" "}
                  customer
                  {filteredCustomers.length !== 1
                    ? "s"
                    : ""}
                </span>

                {search && (
                  <span>
                    Filtered from{" "}
                    <strong>
                      {customers.length}
                    </strong>{" "}
                    total customers
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
        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div className="customer-modal-title">

                <div className="customer-modal-icon">
                  {editingCustomer ? (
                    <Pencil size={20} />
                  ) : (
                    <UserRound size={20} />
                  )}
                </div>

                <div>
                  <h2>
                    {editingCustomer
                      ? "Edit Customer"
                      : "Add Customer"}
                  </h2>

                  <p>
                    {editingCustomer
                      ? "Update customer information."
                      : "Create a new customer record."}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="customer-modal-body">

                {error && (
                  <div className="customers-alert error">
                    <AlertCircle size={17} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="customers-alert success">
                    <CheckCircle2 size={17} />
                    <span>{success}</span>
                  </div>
                )}

                <div className="customer-form-grid">

                  <div className="customer-field full">
                    <label>
                      Customer Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter customer name"
                      value={form.name}
                      onChange={handleChange}
                      autoFocus
                    />
                  </div>

                  <div className="customer-field">
                    <label>
                      Mobile Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter mobile number"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="customer-field">
                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="customer@email.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="customer-field full">
                    <label>
                      Address
                    </label>

                    <textarea
                      name="address"
                      placeholder="Enter customer address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </div>

              <div className="customer-modal-footer">

                <button
                  type="button"
                  className="customers-action-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customers-action-button primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingCustomer
                        ? "Update Customer"
                        : "Save Customer"}
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

export default Customers;