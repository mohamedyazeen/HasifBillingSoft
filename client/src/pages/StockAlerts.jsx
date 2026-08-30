import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
  Save,
  Boxes,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const API_URL = "https://hasifbillingsoft.onrender.com/api";

function StockAlerts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pageError, setPageError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("hasif_token");
  };

  const fetchStockAlerts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${API_URL}/products/low-stock`,
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
          data.message || "Unable to load stock alerts."
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Stock Alerts Error:", error);

      setPageError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      Number(product.stock) > 0 &&
      Number(product.stock) <=
        Number(product.lowStockLevel)
  ).length;

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setQuantity("");
    setReason("");
    setPageError("");
    setSuccessMessage("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    if (saving) {
      return;
    }

    setShowStockModal(false);
    setSelectedProduct(null);
    setQuantity("");
    setReason("");
  };

  const handleStockUpdate = async (event) => {
    event.preventDefault();

    setPageError("");

    if (!selectedProduct) {
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setPageError(
        "Please enter a quantity greater than 0."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/products/${selectedProduct._id}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: Number(quantity),
            reason:
              reason.trim() || "New stock received",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update stock."
        );
      }

      closeStockModal();

      setSuccessMessage(
        `${selectedProduct.name} stock updated successfully.`
      );

      await fetchStockAlerts();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Stock Update Error:", error);

      setPageError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getProductStatus = (product) => {
    const stock = Number(product.stock);
    const alertLevel = Number(product.lowStockLevel);

    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "stock-status-danger",
      };
    }

    if (stock <= alertLevel) {
      return {
        label: "Low Stock",
        className: "stock-status-warning",
      };
    }

    return {
      label: "In Stock",
      className: "stock-status-good",
    };
  };

  return (
    <>
      <style>{`

        /* =========================
           PAGE
        ========================= */

        .stock-alerts-page {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 100vh;
          box-sizing: border-box;

          padding: 34px 36px 45px;
          overflow-x: hidden;
        }

        .stock-alerts-container {
          width: 100%;
          min-width: 0;
          max-width: 1500px;

          margin: 0 auto;
        }

        /* =========================
           HEADER
        ========================= */

        .stock-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;
          min-width: 0;

          margin-bottom: 25px;
        }

        .stock-heading {
          min-width: 0;
          flex: 1 1 auto;
        }

        .stock-heading h1,
        .stock-heading p {
          overflow-wrap: anywhere;
        }

        .stock-heading h1 {
          margin-top: 7px;

          font-size: 32px;
          line-height: 1.1;

          letter-spacing: -1.3px;

          color: #111111;
        }

        .stock-heading p {
          margin-top: 8px;

          color: #7d7d7d;

          font-size: 13px;
        }

        .stock-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;

          flex: 0 0 auto;
          flex-shrink: 0;
          max-width: 100%;
        }

        .stock-header-button {
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .stock-header-button {
          height: 42px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 13px;

          border:
            1px solid rgba(0, 0, 0, 0.07);

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.68);

          color: #333333;

          cursor: pointer;

          font-size: 11px;
          font-weight: 750;

          transition: 0.2s ease;
        }

        .stock-header-button:hover {
          background:
            rgba(0, 0, 0, 0.045);

          color: #111111;
        }

        .stock-header-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        /* =========================
           SUMMARY
        ========================= */

        .stock-summary {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 15px;

          margin-bottom: 16px;
        }

        .stock-summary-card {
          min-height: 96px;

          display: flex;
          align-items: center;

          gap: 13px;

          padding: 18px;

          border:
            1px solid rgba(255, 255, 255, 0.88);

          border-radius: 19px;

          background:
            rgba(255, 255, 255, 0.58);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.045),
            inset 0 1px 0
              rgba(255, 255, 255, 0.9);
        }

        .stock-summary-icon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 14px;

          background:
            rgba(0, 0, 0, 0.05);

          color: #444444;
        }

        .stock-summary-card span {
          display: block;

          color: #828282;

          font-size: 10px;
        }

        .stock-summary-card strong {
          display: block;

          margin-top: 4px;

          color: #111111;

          font-size: 25px;

          letter-spacing: -0.8px;
        }

        /* =========================
           TOOLBAR
        ========================= */

        .stock-toolbar {
          min-height: 74px;
          min-width: 0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 18px;

          padding: 13px 15px;

          margin-bottom: 17px;

          border:
            1px solid rgba(255, 255, 255, 0.88);

          border-radius: 19px;

          background:
            rgba(255, 255, 255, 0.56);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.04),
            inset 0 1px 0
              rgba(255, 255, 255, 0.85);
        }

        .stock-search {
          flex: 1 1 620px;
          min-width: 0;
          max-width: 620px;

          height: 46px;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 0 14px;

          border:
            1px solid rgba(0, 0, 0, 0.06);

          border-radius: 13px;

          background:
            rgba(255, 255, 255, 0.72);

          color: #8a8a8a;
        }

        .stock-search input {
          width: 100%;

          border: none;
          outline: none;

          background: transparent;

          color: #111111;

          font-size: 12px;
        }

        .stock-count {
          flex-shrink: 0;

          color: #777777;

          font-size: 11px;
          font-weight: 750;
        }

        /* =========================
           ALERT / SUCCESS
        ========================= */

        .stock-message {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-bottom: 15px;

          padding: 12px 14px;

          border-radius: 12px;

          font-size: 11px;
          font-weight: 650;
        }

        .stock-error-message {
          background:
            rgba(0, 0, 0, 0.06);

          color: #333333;
        }

        .stock-success-message {
          background:
            rgba(255, 255, 255, 0.75);

          border:
            1px solid rgba(0, 0, 0, 0.06);

          color: #333333;
        }

        /* =========================
           TABLE
        ========================= */

        .stock-table-panel {
          overflow: hidden;

          padding: 0;

          border:
            1px solid rgba(255, 255, 255, 0.88);

          border-radius: 20px;

          background:
            rgba(255, 255, 255, 0.56);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.045),
            inset 0 1px 0
              rgba(255, 255, 255, 0.88);
        }

        .stock-table-wrapper {
          width: 100%;
          min-width: 0;
          max-width: 100%;

          overflow-x: auto;

          scrollbar-width: thin;
        }

        .stock-table {
          width: 100%;
          min-width: 900px;

          border-collapse: collapse;
        }

        .stock-table th {
          height: 54px;

          padding: 0 18px;

          border-bottom:
            1px solid rgba(0, 0, 0, 0.06);

          text-align: left;

          color: #858585;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.8px;

          text-transform: uppercase;

          white-space: nowrap;
        }

        .stock-table td {
          height: 76px;

          padding: 0 18px;

          border-bottom:
            1px solid rgba(0, 0, 0, 0.045);

          color: #4a4a4a;

          font-size: 12px;

          vertical-align: middle;
        }

        .stock-table tbody tr:last-child td {
          border-bottom: none;
        }

        .stock-table tbody tr {
          transition: background 0.18s ease;
        }

        .stock-table tbody tr:hover {
          background:
            rgba(0, 0, 0, 0.018);
        }

        /* Product */

        .stock-product {
          display: flex;
          align-items: center;

          gap: 11px;

          min-width: 220px;
        }

        .stock-product-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          background:
            rgba(0, 0, 0, 0.045);

          color: #444444;
        }

        .stock-product-info strong {
          display: block;

          color: #171717;

          font-size: 12px;
          font-weight: 750;
        }

        .stock-product-info small {
          display: block;

          margin-top: 4px;

          color: #999999;

          font-size: 9px;
        }

        /* Stock */

        .current-stock {
          display: flex;
          align-items: baseline;

          gap: 4px;
        }

        .current-stock strong {
          color: #111111;

          font-size: 18px;
          letter-spacing: -0.3px;
        }

        .current-stock span {
          color: #858585;

          font-size: 9px;
        }

        .alert-level-number {
          color: #444444;

          font-size: 12px;
          font-weight: 750;
        }

        /* Status */

        .stock-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 27px;

          padding: 0 10px;

          border-radius: 999px;

          white-space: nowrap;

          font-size: 9px;
          font-weight: 800;
        }

        .stock-status-warning {
          background:
            rgba(0, 0, 0, 0.08);

          color: #333333;
        }

        .stock-status-danger {
          background: #111111;

          color: #ffffff;
        }

        .stock-status-good {
          background:
            rgba(0, 0, 0, 0.05);

          color: #444444;
        }

        /* Add stock */

        .add-stock-button {
          height: 35px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          padding: 0 11px;

          border:
            1px solid rgba(0, 0, 0, 0.07);

          border-radius: 10px;

          background:
            rgba(255, 255, 255, 0.72);

          color: #333333;

          cursor: pointer;

          font-size: 10px;
          font-weight: 750;

          transition: 0.2s ease;
        }

        .add-stock-button:hover {
          background: #111111;
          color: #ffffff;
        }

        /* =========================
           EMPTY
        ========================= */

        .stock-empty {
          min-height: 410px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 30px;

          text-align: center;
        }

        .stock-empty-icon {
          width: 60px;
          height: 60px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background:
            rgba(0, 0, 0, 0.045);

          color: #555555;
        }

        .stock-empty h3 {
          margin-top: 15px;

          color: #222222;

          font-size: 16px;
        }

        .stock-empty p {
          max-width: 340px;

          margin-top: 7px;

          color: #898989;

          font-size: 11px;
          line-height: 1.5;
        }

        /* =========================
           LOADING
        ========================= */

        .stock-loading {
          min-height: 410px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          color: #818181;

          font-size: 11px;
        }

        .stock-spinner {
          width: 30px;
          height: 30px;

          margin-bottom: 12px;

          border:
            3px solid rgba(0, 0, 0, 0.08);

          border-top-color: #111111;

          border-radius: 50%;

          animation:
            stock-loading-spin 0.8s linear infinite;
        }

        @keyframes stock-loading-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           MODAL
        ========================= */

        .stock-modal-overlay {
          position: fixed;
          inset: 0;

          z-index: 2000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(15, 15, 15, 0.2);

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .stock-modal {
          width: 100%;
          max-width: 470px;

          padding: 25px;

          border:
            1px solid rgba(255, 255, 255, 0.9);

          border-radius: 23px;

          background:
            rgba(255, 255, 255, 0.87);

          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);

          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.18),
            inset 0 1px 0
              rgba(255, 255, 255, 0.95);
        }

        .stock-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 15px;

          margin-bottom: 20px;
        }

        .stock-modal-header h2 {
          margin-top: 6px;

          color: #111111;

          font-size: 23px;
          letter-spacing: -0.8px;
        }

        .stock-modal-close {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid rgba(0, 0, 0, 0.06);

          border-radius: 11px;

          background:
            rgba(255, 255, 255, 0.72);

          color: #555555;

          cursor: pointer;
        }

        .stock-modal-close:hover {
          background:
            rgba(0, 0, 0, 0.05);

          color: #111111;
        }

        .stock-modal-product {
          display: flex;
          align-items: center;

          gap: 11px;

          padding: 13px;

          margin-bottom: 18px;

          border:
            1px solid rgba(0, 0, 0, 0.06);

          border-radius: 14px;

          background:
            rgba(255, 255, 255, 0.55);
        }

        .stock-modal-product-icon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          background:
            rgba(0, 0, 0, 0.045);

          color: #444444;
        }

        .stock-modal-product strong {
          display: block;

          color: #1b1b1b;

          font-size: 12px;
        }

        .stock-modal-product span {
          display: block;

          margin-top: 4px;

          color: #898989;

          font-size: 9px;
        }

        .stock-modal-form {
          display: flex;
          flex-direction: column;

          gap: 15px;
        }

        .stock-field {
          display: flex;
          flex-direction: column;

          gap: 7px;
        }

        .stock-field label {
          color: #3d3d3d;

          font-size: 11px;
          font-weight: 750;
        }

        .stock-field input {
          width: 100%;
          height: 48px;

          padding: 0 13px;

          border:
            1px solid rgba(0, 0, 0, 0.08);

          border-radius: 12px;

          outline: none;

          background:
            rgba(255, 255, 255, 0.72);

          color: #111111;

          font-size: 12px;
        }

        .stock-field input:focus {
          border-color: #111111;

          box-shadow:
            0 0 0 4px
              rgba(0, 0, 0, 0.04);
        }

        .stock-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 9px;

          margin-top: 5px;
        }

        .stock-cancel-button {
          height: 43px;

          padding: 0 15px;

          border:
            1px solid rgba(0, 0, 0, 0.07);

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.72);

          color: #444444;

          cursor: pointer;

          font-size: 11px;
          font-weight: 750;
        }

        .stock-save-button {
          height: 43px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 15px;

          border: none;

          border-radius: 12px;

          background: #111111;
          color: #ffffff;

          cursor: pointer;

          font-size: 11px;
          font-weight: 750;
        }

        .stock-save-button:disabled,
        .stock-cancel-button:disabled,
        .stock-modal-close:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        /* =========================
           REFRESH ANIMATION
        ========================= */

        .refresh-spin {
          animation:
            refresh-animation 0.8s linear infinite;
        }

        @keyframes refresh-animation {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           NARROW DESKTOP / TABLET
        ========================= */

        @media (max-width: 1100px) {
          .stock-header {
            flex-wrap: wrap;
          }

          .stock-heading {
            flex: 1 1 500px;
          }

          .stock-header-actions {
            margin-left: auto;
          }

          .stock-toolbar {
            flex-wrap: wrap;
          }

          .stock-search {
            flex-basis: 100%;
            max-width: none;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 1000px) {
          .stock-alerts-page {
            padding-left: 28px;
            padding-right: 28px;
          }

          .stock-summary {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .stock-alerts-page {
            padding: 25px 24px 35px;
          }

          .stock-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stock-header-actions {
            width: 100%;
          }

          .stock-header-button {
            flex: 1;
          }

          .stock-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .stock-search {
            max-width: none;
          }

          .stock-count {
            align-self: flex-start;
          }
        }

        @media (max-width: 600px) {
          .stock-alerts-page {
            padding: 20px 15px 30px;
          }

          .stock-summary {
            grid-template-columns: 1fr;
          }

          .stock-heading h1 {
            font-size: 28px;
          }

          .stock-modal {
            padding: 20px;
            border-radius: 20px;
          }

          .stock-modal-actions {
            flex-direction: column-reverse;
          }

          .stock-cancel-button,
          .stock-save-button {
            width: 100%;
          }
        }

      `}</style>

      <div className="stock-alerts-page">
        <div className="stock-alerts-container">

          {/* =========================
              HEADER
          ========================= */}

          <header className="stock-header">

            <div className="stock-heading">

              <p className="dashboard-eyebrow">
                INVENTORY
              </p>

              <h1>
                Stock Alerts
              </h1>

              <p>
                Monitor products that need stock attention.
              </p>

            </div>

            <div className="stock-header-actions">

              <button
                className="stock-header-button"
                onClick={() =>
                  navigate("/products")
                }
              >
                <ArrowLeft size={15} />
                Products
              </button>

              <button
                className="stock-header-button"
                onClick={() =>
                  fetchStockAlerts(true)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "refresh-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>

          </header>

          {/* =========================
              SUMMARY
          ========================= */}

          <section className="stock-summary">

            <div className="stock-summary-card">

              <div className="stock-summary-icon">
                <AlertTriangle size={21} />
              </div>

              <div>
                <span>
                  Total Alerts
                </span>

                <strong>
                  {products.length}
                </strong>
              </div>

            </div>

            <div className="stock-summary-card">

              <div className="stock-summary-icon">
                <Package size={21} />
              </div>

              <div>
                <span>
                  Low Stock
                </span>

                <strong>
                  {lowStockCount}
                </strong>
              </div>

            </div>

            <div className="stock-summary-card">

              <div className="stock-summary-icon">
                <Boxes size={21} />
              </div>

              <div>
                <span>
                  Out of Stock
                </span>

                <strong>
                  {outOfStockCount}
                </strong>
              </div>

            </div>

          </section>

          {/* =========================
              SEARCH
          ========================= */}

          <section className="stock-toolbar">

            <div className="stock-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search product, category or barcode..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

            <div className="stock-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "Alert"
                : "Alerts"}
            </div>

          </section>

          {/* =========================
              MESSAGES
          ========================= */}

          {pageError && (
            <div className="stock-message stock-error-message">
              <AlertTriangle size={16} />
              <span>{pageError}</span>
            </div>
          )}

          {successMessage && (
            <div className="stock-message stock-success-message">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* =========================
              STOCK TABLE
          ========================= */}

          <section className="stock-table-panel">

            {loading ? (
              <div className="stock-loading">

                <div className="stock-spinner"></div>

                <span>
                  Checking stock alerts...
                </span>

              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="stock-empty">

                <div className="stock-empty-icon">
                  <Package size={29} />
                </div>

                <h3>
                  No stock alerts
                </h3>

                <p>
                  All products are currently above
                  their configured stock alert level.
                </p>

              </div>
            ) : (
              <div className="stock-table-wrapper">

                <table className="stock-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Current Stock</th>
                      <th>Alert Level</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredProducts.map(
                      (product) => {

                        const status =
                          getProductStatus(
                            product
                          );

                        return (
                          <tr key={product._id}>

                            <td>
                              <div className="stock-product">

                                <div className="stock-product-icon">
                                  <Package size={17} />
                                </div>

                                <div className="stock-product-info">

                                  <strong>
                                    {product.name}
                                  </strong>

                                  <small>
                                    {product.category}

                                    {product.barcode
                                      ? ` • ${product.barcode}`
                                      : ""}
                                  </small>

                                </div>

                              </div>
                            </td>

                            <td>
                              <div className="current-stock">

                                <strong>
                                  {product.stock}
                                </strong>

                                <span>
                                  {product.unit}
                                </span>

                              </div>
                            </td>

                            <td>
                              <span className="alert-level-number">
                                {product.lowStockLevel}{" "}
                                {product.unit}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`stock-status ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td>
                              <button
                                className="add-stock-button"
                                onClick={() =>
                                  openStockModal(
                                    product
                                  )
                                }
                              >
                                <Plus size={14} />
                                Add Stock
                              </button>
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </div>
      </div>

      {/* =========================
          ADD STOCK MODAL
      ========================= */}

      {showStockModal &&
        selectedProduct && (
          <div className="stock-modal-overlay">

            <div className="stock-modal">

              <div className="stock-modal-header">

                <div>
                  <p className="dashboard-eyebrow">
                    STOCK MANAGEMENT
                  </p>

                  <h2>
                    Add Stock
                  </h2>
                </div>

                <button
                  type="button"
                  className="stock-modal-close"
                  onClick={closeStockModal}
                  disabled={saving}
                >
                  <X size={18} />
                </button>

              </div>

              {/* Product info */}

              <div className="stock-modal-product">

                <div className="stock-modal-product-icon">
                  <Package size={18} />
                </div>

                <div>

                  <strong>
                    {selectedProduct.name}
                  </strong>

                  <span>
                    Current Stock:{" "}
                    {selectedProduct.stock}{" "}
                    {selectedProduct.unit}
                  </span>

                </div>

              </div>

              {/* Form */}

              <form
                className="stock-modal-form"
                onSubmit={handleStockUpdate}
              >

                <div className="stock-field">

                  <label>
                    Quantity to Add
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        event.target.value
                      )
                    }
                    autoFocus
                  />

                </div>

                <div className="stock-field">

                  <label>
                    Reason
                  </label>

                  <input
                    type="text"
                    placeholder="Example: New stock received"
                    value={reason}
                    onChange={(event) =>
                      setReason(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="stock-modal-actions">

                  <button
                    type="button"
                    className="stock-cancel-button"
                    onClick={closeStockModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="stock-save-button"
                    disabled={saving}
                  >
                    <Save size={15} />

                    {saving
                      ? "Updating..."
                      : "Update Stock"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </>
  );
}

export default StockAlerts;