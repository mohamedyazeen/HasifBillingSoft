import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  X,
  Save,
  Trash2,
  Package,
  Truck,
  Receipt,
  IndianRupee,
  ChevronDown,
  Eye,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://hasifbillingsoft.onrender.com/api";

function Purchases() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [viewPurchase, setViewPurchase] = useState(null);

  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [items, setItems] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("hasif_token");

  /* =========================
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch products."
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /* =========================
     FETCH PURCHASES
  ========================= */

  const fetchPurchases = async () => {
    try {
      const response = await fetch(
        `${API_URL}/purchases`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch purchases."
        );
      }

      setPurchases(data.purchases || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchProducts(),
        fetchPurchases(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  /* =========================
     REFRESH
  ========================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        fetchProducts(),
        fetchPurchases(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================
     FILTER PURCHASES
  ========================= */

  const filteredPurchases = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return purchases;
    }

    return purchases.filter(
      (purchase) => {
        return (
          purchase.purchaseNumber
            ?.toLowerCase()
            .includes(query) ||
          purchase.supplier
            ?.toLowerCase()
            .includes(query)
        );
      }
    );
  }, [purchases, search]);

  /* =========================
     TOTALS
  ========================= */

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.total || 0),
    0
  );

  const discountAmount = Math.max(
    0,
    Number(discount || 0)
  );

  const totalAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  const paid = Math.max(
    0,
    Number(paidAmount || 0)
  );

  const dueAmount = Math.max(
    0,
    totalAmount - paid
  );

  /* =========================
     OPEN MODAL
  ========================= */

  const openNewPurchase = () => {
    setSupplier("");
    setPaymentMethod("CASH");
    setPaidAmount("");
    setDiscount("");
    setNotes("");

    setSelectedProduct("");
    setQuantity("");
    setUnitPrice("");

    setItems([]);

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setSelectedProduct("");
    setQuantity("");
    setUnitPrice("");
    setItems([]);
  };

  /* =========================
     PRODUCT SELECT
  ========================= */

  const handleProductSelect = (
    productId
  ) => {
    setSelectedProduct(productId);

    const product =
      products.find(
        (item) =>
          item._id === productId
      );

    if (product) {
      setUnitPrice(
        product.purchasePrice ?? ""
      );
    }
  };

  /* =========================
     ADD ITEM
  ========================= */

  const addItem = () => {
    setError("");

    if (!selectedProduct) {
      setError(
        "Please select a product."
      );
      return;
    }

    if (
      !quantity ||
      Number(quantity) <= 0
    ) {
      setError(
        "Please enter a valid quantity."
      );
      return;
    }

    if (
      unitPrice === "" ||
      Number(unitPrice) < 0
    ) {
      setError(
        "Please enter a valid purchase price."
      );
      return;
    }

    const product =
      products.find(
        (item) =>
          item._id === selectedProduct
      );

    if (!product) {
      setError(
        "Selected product not found."
      );
      return;
    }

    const existingIndex =
      items.findIndex(
        (item) =>
          item.product ===
          selectedProduct
      );

    const newQuantity =
      Number(quantity);

    const newPrice =
      Number(unitPrice);

    if (existingIndex !== -1) {
      const updatedItems = [
        ...items,
      ];

      const oldItem =
        updatedItems[existingIndex];

      const finalQuantity =
        oldItem.quantity +
        newQuantity;

      updatedItems[
        existingIndex
      ] = {
        ...oldItem,
        quantity:
          finalQuantity,
        unitPrice:
          newPrice,
        total:
          finalQuantity *
          newPrice,
      };

      setItems(updatedItems);
    } else {
      setItems([
        ...items,
        {
          product:
            product._id,

          productName:
            product.name,

          unit:
            product.unit || "piece",

          quantity:
            newQuantity,

          unitPrice:
            newPrice,

          total:
            newQuantity *
            newPrice,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity("");
    setUnitPrice("");
  };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (index) => {
    setItems(
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /* =========================
     SAVE PURCHASE
  ========================= */

  const handleSavePurchase = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError(
        "Please add at least one product."
      );
      return;
    }

    if (
      discountAmount >
      subtotal
    ) {
      setError(
        "Discount cannot be greater than subtotal."
      );
      return;
    }

    if (paid > totalAmount) {
      setError(
        "Paid amount cannot be greater than total amount."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/purchases`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            supplier:
              supplier.trim(),

            items: items.map(
              (item) => ({
                product:
                  item.product,

                quantity:
                  item.quantity,

                unitPrice:
                  item.unitPrice,
              })
            ),

            discount:
              discountAmount,

            paidAmount:
              paid,

            paymentMethod,

            notes:
              notes.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save purchase."
        );
      }

      setSuccess(
        `Purchase ${data.purchase?.purchaseNumber || ""} saved successfully.`
      );

      setShowModal(false);

      await Promise.all([
        fetchPurchases(),
        fetchProducts(),
      ]);

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     FORMAT CURRENCY
  ========================= */

  const formatCurrency = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (
    value
  ) => {
    if (!value) return "-";

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <>
      <style>{`
        /* =====================================================
           PURCHASES PAGE
           Clean white dashboard style
           Readable font + stronger hierarchy
        ===================================================== */

        .purchases-page {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          padding: 28px 36px 45px;
          color: #171717;
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
            "Segoe UI", Arial, sans-serif;
          overflow-x: hidden;
        }

        .purchases-page *,
        .purchases-page *::before,
        .purchases-page *::after {
          box-sizing: border-box;
        }

        .purchases-container {
          width: 100%;
          max-width: 1500px;
          min-width: 0;
          margin: 0 auto;
        }

        /* =========================
           HEADER
        ========================= */

        .purchases-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .purchases-heading h1 {
          margin: 6px 0 0;
          color: #111;
          font-size: 34px;
          line-height: 1.12;
          font-weight: 750;
          letter-spacing: -1.1px;
        }

        .purchases-heading p {
          margin: 9px 0 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .dashboard-eyebrow {
          margin: 0 !important;
          color: #777 !important;
          font-size: 10px !important;
          line-height: 1.3 !important;
          font-weight: 750 !important;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .purchases-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-shrink: 0;
          min-width: 0;
        }

        .purchases-actions .purchase-button {
          flex-shrink: 0;
          white-space: nowrap;
        }

        .purchase-button {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          border-radius: 11px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          transition: background 0.18s ease, transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .purchase-button-primary {
          border: 1px solid #111;
          background: #111;
          color: #fff;
          box-shadow: 0 7px 18px rgba(0, 0, 0, 0.12);
        }

        .purchase-button-primary:hover {
          background: #222;
          transform: translateY(-1px);
        }

        .purchase-button-secondary {
          border: 1px solid #d8d8d8;
          background: #fff;
          color: #222;
        }

        .purchase-button-secondary:hover {
          background: #f6f6f6;
          transform: translateY(-1px);
        }

        .purchase-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* =========================
           SUMMARY CARDS
        ========================= */

        .purchase-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }

        .purchase-summary-card {
          min-height: 112px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: 1px solid #e2e2e2;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.045);
        }

        .purchase-summary-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 14px;
          background: #f1f1f1;
          color: #222;
        }

        .purchase-summary-card span {
          display: block;
          color: #555;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 600;
        }

        .purchase-summary-card strong {
          display: block;
          margin-top: 5px;
          color: #111;
          font-size: 27px;
          line-height: 1;
          font-weight: 750;
          letter-spacing: -0.7px;
        }

        /* =========================
           TOOLBAR / SEARCH
        ========================= */

        .purchase-toolbar {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 11px 14px;
          margin-bottom: 17px;
          border: 1px solid #e2e2e2;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 7px 22px rgba(0, 0, 0, 0.035);
        }

        .purchase-search {
          width: 100%;
          min-width: 0;
          max-width: 680px;
          height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          border: 1px solid #d8d8d8;
          border-radius: 11px;
          background: #fff;
          color: #444;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .purchase-search:focus-within {
          border-color: #999;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.045);
        }

        .purchase-search input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #111;
          font-family: inherit;
          font-size: 14px;
        }

        .purchase-search input::placeholder {
          color: #777;
        }

        .purchase-result-count {
          color: #555;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* =========================
           ALERTS
        ========================= */

        .purchase-message {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 16px;
          padding: 13px 15px;
          border-radius: 11px;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 650;
        }

        .purchase-error {
          border: 1px solid #d6d6d6;
          background: #eeeeee;
          color: #222;
        }

        .purchase-success {
          border: 1px solid #d6d6d6;
          background: #f7f7f7;
          color: #222;
        }

        /* =========================
           TABLE
        ========================= */

        .purchase-table-panel {
          overflow: hidden;
          border: 1px solid #e0e0e0;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 9px 28px rgba(0, 0, 0, 0.045);
        }

        .purchase-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .purchase-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .purchase-table th {
          height: 56px;
          padding: 0 20px;
          border-bottom: 1px solid #dedede;
          background: #fafafa;
          color: #555;
          text-align: left;
          font-size: 11px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.65px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .purchase-table td {
          height: 76px;
          padding: 0 20px;
          border-bottom: 1px solid #eeeeee;
          color: #333;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 500;
        }

        .purchase-table tbody tr {
          transition: background 0.15s ease;
        }

        .purchase-table tbody tr:hover {
          background: #fafafa;
        }

        .purchase-table tr:last-child td {
          border-bottom: none;
        }

        .purchase-number {
          color: #111;
          font-size: 13px;
          font-weight: 800;
        }

        .purchase-supplier {
          color: #333;
          font-size: 13px;
          font-weight: 600;
        }

        .purchase-items-count {
          min-height: 29px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border-radius: 999px;
          background: #f0f0f0;
          color: #333;
          font-size: 12px;
          font-weight: 700;
        }

        .purchase-amount {
          color: #111;
          font-size: 14px;
          font-weight: 800;
        }

        .purchase-date {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #555;
          font-size: 13px;
        }

        .view-purchase-button {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d7d7d7;
          border-radius: 10px;
          background: #fff;
          color: #333;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .view-purchase-button:hover {
          border-color: #111;
          background: #111;
          color: #fff;
        }

        /* =========================
           EMPTY / LOADING
        ========================= */

        .purchase-empty {
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 35px;
          text-align: center;
        }

        .purchase-empty-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: #f0f0f0;
          color: #333;
        }

        .purchase-empty h3 {
          margin: 16px 0 0;
          color: #222;
          font-size: 17px;
          line-height: 1.3;
          font-weight: 700;
        }

        .purchase-empty p {
          max-width: 360px;
          margin: 8px 0 0;
          color: #666;
          font-size: 13px;
          line-height: 1.55;
        }

        /* =========================
           MODAL
        ========================= */

        .purchase-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .purchase-modal {
          width: 100%;
          max-width: 950px;
          max-height: 92vh;
          overflow-y: auto;
          padding: 28px;
          border: 1px solid #dedede;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 28px 75px rgba(0, 0, 0, 0.2);
        }

        .purchase-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 23px;
        }

        .purchase-modal-header h2 {
          margin: 6px 0 0;
          color: #111;
          font-size: 27px;
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -0.7px;
        }

        .purchase-modal-close {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #d5d5d5;
          border-radius: 10px;
          background: #fff;
          color: #333;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .purchase-modal-close:hover {
          background: #f2f2f2;
        }

        /* =========================
           FORM
        ========================= */

        .purchase-form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .purchase-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .purchase-field label {
          color: #333;
          font-size: 12px;
          line-height: 1.3;
          font-weight: 750;
        }

        .purchase-field input,
        .purchase-field select {
          width: 100%;
          height: 48px;
          padding: 0 13px;
          border: 1px solid #d3d3d3;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #111;
          font-family: inherit;
          font-size: 13px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .purchase-field input::placeholder {
          color: #777;
        }

        .purchase-field input:focus,
        .purchase-field select:focus {
          border-color: #999;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.045);
        }

        .purchase-field-full {
          grid-column: 1 / -1;
        }

        /* =========================
           ADD PRODUCT
        ========================= */

        .add-product-box {
          padding: 18px;
          margin-bottom: 20px;
          border: 1px solid #dfdfdf;
          border-radius: 15px;
          background: #f8f8f8;
        }

        .add-product-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          color: #222;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 800;
        }

        .add-product-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(130px, 0.8fr)
            minmax(140px, 0.9fr)
            auto;
          gap: 11px;
          align-items: end;
        }

        .add-product-button {
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 17px;
          border: 1px solid #111;
          border-radius: 10px;
          background: #111;
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 750;
          transition: 0.18s ease;
        }

        .add-product-button:hover {
          background: #222;
          transform: translateY(-1px);
        }

        /* =========================
           ITEMS
        ========================= */

        .purchase-items-title {
          margin-bottom: 10px;
          color: #222;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 800;
        }

        .purchase-items-table-wrapper {
          overflow-x: auto;
          margin-bottom: 21px;
          border: 1px solid #e2e2e2;
          border-radius: 12px;
        }

        .purchase-items-table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .purchase-items-table th {
          padding: 12px;
          border-bottom: 1px solid #dedede;
          background: #fafafa;
          color: #555;
          text-align: left;
          font-size: 10px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: 0.55px;
          text-transform: uppercase;
        }

        .purchase-items-table td {
          padding: 12px;
          border-top: 1px solid #eeeeee;
          color: #333;
          font-size: 13px;
          line-height: 1.4;
        }

        .item-product-name {
          color: #222;
          font-size: 13px;
          font-weight: 750;
        }

        .item-remove {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d5d5d5;
          border-radius: 9px;
          background: #fff;
          color: #444;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .item-remove:hover {
          border-color: #111;
          background: #111;
          color: #fff;
        }

        /* =========================
           TOTALS / NOTES
        ========================= */

        .purchase-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(290px, 0.65fr);
          gap: 22px;
        }

        .purchase-notes textarea {
          width: 100%;
          min-height: 125px;
          padding: 13px;
          resize: vertical;
          border: 1px solid #d3d3d3;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #111;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.5;
        }

        .purchase-notes textarea::placeholder {
          color: #777;
        }

        .purchase-notes textarea:focus {
          border-color: #999;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.045);
        }

        .purchase-totals {
          padding: 19px;
          border: 1px solid #dedede;
          border-radius: 15px;
          background: #f8f8f8;
        }

        .purchase-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 8px 0;
          color: #555;
          font-size: 13px;
          line-height: 1.4;
        }

        .purchase-total-row strong {
          color: #222;
          font-size: 13px;
          font-weight: 750;
        }

        .purchase-grand-total {
          margin-top: 7px;
          padding-top: 14px;
          border-top: 1px solid #d5d5d5;
          color: #222;
          font-size: 15px;
          font-weight: 800;
        }

        .purchase-grand-total strong {
          color: #111;
          font-size: 22px;
          font-weight: 800;
        }

        .purchase-due {
          color: #111 !important;
          font-size: 15px !important;
          font-weight: 800 !important;
        }

        /* =========================
           MODAL ACTIONS
        ========================= */

        .purchase-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 23px;
        }

        /* =========================
           VIEW PURCHASE
        ========================= */

        .view-modal {
          max-width: 720px;
        }

        .view-purchase-info {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .view-info-box {
          padding: 14px;
          border: 1px solid #dedede;
          border-radius: 11px;
          background: #f8f8f8;
        }

        .view-info-box span {
          display: block;
          color: #666;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: 0.35px;
          text-transform: uppercase;
        }

        .view-info-box strong {
          display: block;
          margin-top: 6px;
          color: #222;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 750;
        }

        /* =========================
           REFRESH ANIMATION
        ========================= */

        .refresh-spin {
          animation: purchaseRefreshSpin 0.8s linear infinite;
        }

        @keyframes purchaseRefreshSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           MOBILE / TABLET
        ========================= */

        @media (max-width: 1180px) {
          .purchases-header {
            flex-wrap: wrap;
          }

          .purchases-heading {
            min-width: 0;
            flex: 1 1 520px;
          }

          .purchases-actions {
            flex: 0 0 auto;
          }
        }

        @media (max-width: 1100px) {
          .purchases-page {
            padding: 26px 28px 40px;
          }

          .purchase-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .add-product-grid {
            grid-template-columns: 1fr 1fr;
          }

          .add-product-button {
            width: 100%;
          }

          .purchase-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 800px) {
          .purchases-header {
            flex-direction: column;
          }

          .purchases-actions {
            width: 100%;
          }

          .purchases-actions .purchase-button {
            flex: 1;
          }

          .purchase-summary {
            grid-template-columns: 1fr;
          }

          .purchase-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .purchase-search {
            max-width: none;
          }

          .purchase-result-count {
            padding: 0 3px 3px;
          }
        }

        @media (max-width: 600px) {
          .purchases-page {
            padding: 21px 15px 30px;
          }

          .purchases-heading h1 {
            font-size: 30px;
          }

          .purchases-heading p {
            font-size: 13px;
          }

          .purchases-actions {
            flex-direction: column;
          }

          .purchases-actions .purchase-button {
            width: 100%;
          }

          .purchase-form-grid {
            grid-template-columns: 1fr;
          }

          .purchase-field-full {
            grid-column: auto;
          }

          .add-product-grid {
            grid-template-columns: 1fr;
          }

          .purchase-modal-overlay {
            padding: 10px;
          }

          .purchase-modal {
            padding: 20px;
            max-height: 95vh;
            border-radius: 17px;
          }

          .purchase-modal-header h2 {
            font-size: 23px;
          }

          .purchase-modal-actions {
            flex-direction: column-reverse;
          }

          .purchase-modal-actions .purchase-button {
            width: 100%;
          }

          .view-purchase-info {
            grid-template-columns: 1fr;
          }

          .purchase-table {
            min-width: 900px;
          }
        }
`}</style>

      <div className="purchases-page">
        <div className="purchases-container">

          {/* =========================
              HEADER
          ========================= */}

          <header className="purchases-header">

            <div className="purchases-heading">

              <p className="dashboard-eyebrow">
                INVENTORY MANAGEMENT
              </p>

              <h1>
                Purchases
              </h1>

              <p>
                Record supplier purchases and
                automatically update stock.
              </p>

            </div>

            <div className="purchases-actions">

              <button
                className="purchase-button purchase-button-secondary"
                onClick={handleRefresh}
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

                Refresh
              </button>

              <button
                className="purchase-button purchase-button-primary"
                onClick={openNewPurchase}
              >
                <Plus size={16} />

                New Purchase
              </button>

            </div>

          </header>

          {/* =========================
              SUMMARY
          ========================= */}

          <section className="purchase-summary">

            <div className="purchase-summary-card">

              <div className="purchase-summary-icon">
                <Receipt size={21} />
              </div>

              <div>

                <span>
                  Total Purchases
                </span>

                <strong>
                  {purchases.length}
                </strong>

              </div>

            </div>

            <div className="purchase-summary-card">

              <div className="purchase-summary-icon">
                <IndianRupee size={21} />
              </div>

              <div>

                <span>
                  Total Purchase Value
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    purchases.reduce(
                      (sum, purchase) =>
                        sum +
                        Number(
                          purchase.totalAmount ||
                            0
                        ),
                      0
                    )
                  )}
                </strong>

              </div>

            </div>

            <div className="purchase-summary-card">

              <div className="purchase-summary-icon">
                <Truck size={21} />
              </div>

              <div>

                <span>
                  Suppliers Used
                </span>

                <strong>
                  {
                    new Set(
                      purchases
                        .map(
                          (purchase) =>
                            purchase.supplier
                        )
                        .filter(Boolean)
                    ).size
                  }
                </strong>

              </div>

            </div>

          </section>

          {/* =========================
              TOOLBAR
          ========================= */}

          <section className="purchase-toolbar">

            <div className="purchase-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search purchase number or supplier..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="purchase-result-count">
              {filteredPurchases.length}{" "}
              purchases
            </div>

          </section>

          {/* =========================
              MESSAGES
          ========================= */}

          {error && (
            <div className="purchase-message purchase-error">

              <AlertCircle size={16} />

              <span>
                {error}
              </span>

            </div>
          )}

          {success && (
            <div className="purchase-message purchase-success">

              <CheckCircle2 size={16} />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* =========================
              TABLE
          ========================= */}

          <section className="purchase-table-panel">

            {loading ? (

              <div className="purchase-empty">

                <div className="stock-spinner" />

                <h3>
                  Loading purchases...
                </h3>

              </div>

            ) : filteredPurchases.length ===
              0 ? (

              <div className="purchase-empty">

                <div className="purchase-empty-icon">
                  <Receipt size={29} />
                </div>

                <h3>
                  No purchases found
                </h3>

                <p>
                  Start by creating your first
                  supplier purchase.
                </p>

              </div>

            ) : (

              <div className="purchase-table-wrapper">

                <table className="purchase-table">

                  <thead>

                    <tr>

                      <th>
                        Purchase
                      </th>

                      <th>
                        Supplier
                      </th>

                      <th>
                        Items
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        View
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredPurchases.map(
                      (purchase) => (

                        <tr
                          key={
                            purchase._id
                          }
                        >

                          <td>

                            <span className="purchase-number">
                              {
                                purchase.purchaseNumber
                              }
                            </span>

                          </td>

                          <td>

                            <span className="purchase-supplier">
                              {purchase.supplier ||
                                "—"}
                            </span>

                          </td>

                          <td>

                            <span className="purchase-items-count">
                              {purchase.items
                                ?.length ||
                                0}{" "}
                              items
                            </span>

                          </td>

                          <td>

                            <span className="purchase-amount">
                              ₹
                              {formatCurrency(
                                purchase.totalAmount
                              )}
                            </span>

                          </td>

                          <td>

                            {purchase.paymentMethod ||
                              "CASH"}

                          </td>

                          <td>

                            <div className="purchase-date">

                              <CalendarDays
                                size={13}
                              />

                              {formatDate(
                                purchase.createdAt
                              )}

                            </div>

                          </td>

                          <td>

                            <button
                              className="view-purchase-button"
                              onClick={() =>
                                setViewPurchase(
                                  purchase
                                )
                              }
                            >
                              <Eye
                                size={15}
                              />
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>
      </div>

      {/* =========================
          NEW PURCHASE MODAL
      ========================= */}

      {showModal && (

        <div className="purchase-modal-overlay">

          <div className="purchase-modal">

            <div className="purchase-modal-header">

              <div>

                <p className="dashboard-eyebrow">
                  INVENTORY
                </p>

                <h2>
                  New Purchase
                </h2>

              </div>

              <button
                className="purchase-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={
                handleSavePurchase
              }
            >

              {/* Supplier */}

              <div className="purchase-form-grid">

                <div className="purchase-field">

                  <label>
                    Supplier
                  </label>

                  <input
                    type="text"
                    placeholder="Supplier name"
                    value={supplier}
                    onChange={(event) =>
                      setSupplier(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="purchase-field">

                  <label>
                    Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="₹0"
                    value={discount}
                    onChange={(event) =>
                      setDiscount(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="purchase-field">

                  <label>
                    Payment Method
                  </label>

                  <select
                    value={
                      paymentMethod
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  >

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="CARD">
                      Card
                    </option>

                    <option value="CREDIT">
                      Credit
                    </option>

                  </select>

                </div>

              </div>

              {/* Add Product */}

              <div className="add-product-box">

                <div className="add-product-title">

                  <Package size={15} />

                  Add Products

                </div>

                <div className="add-product-grid">

                  <div className="purchase-field">

                    <label>
                      Product
                    </label>

                    <select
                      value={
                        selectedProduct
                      }
                      onChange={(event) =>
                        handleProductSelect(
                          event.target.value
                        )
                      }
                    >

                      <option value="">
                        Select product
                      </option>

                      {products
                        .filter(
                          (product) =>
                            product.isActive !==
                            false
                        )
                        .map(
                          (product) => (

                            <option
                              key={
                                product._id
                              }
                              value={
                                product._id
                              }
                            >
                              {product.name}
                              {" — Stock: "}
                              {product.stock}
                              {" "}
                              {product.unit}
                            </option>

                          )
                        )}

                    </select>

                  </div>

                  <div className="purchase-field">

                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Qty"
                      value={
                        quantity
                      }
                      onChange={(event) =>
                        setQuantity(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <div className="purchase-field">

                    <label>
                      Purchase Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="₹0"
                      value={
                        unitPrice
                      }
                      onChange={(event) =>
                        setUnitPrice(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <button
                    type="button"
                    className="add-product-button"
                    onClick={addItem}
                  >
                    <Plus size={15} />

                    Add
                  </button>

                </div>

              </div>

              {/* Items */}

              <div className="purchase-items-title">
                Purchase Items
              </div>

              {items.length === 0 ? (

                <div
                  style={{
                    padding:
                      "22px",
                    textAlign:
                      "center",
                    color:
                      "#888",
                    fontSize:
                      "10px",
                    border:
                      "1px dashed rgba(0,0,0,0.1)",
                    borderRadius:
                      "13px",
                    marginBottom:
                      "18px",
                  }}
                >
                  No products added yet.
                </div>

              ) : (

                <div className="purchase-items-table-wrapper">

                  <table className="purchase-items-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Unit Price
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                          Remove
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {items.map(
                        (
                          item,
                          index
                        ) => (

                          <tr
                            key={`${item.product}-${index}`}
                          >

                            <td>

                              <span className="item-product-name">
                                {
                                  item.productName
                                }
                              </span>

                            </td>

                            <td>
                              {item.quantity}{" "}
                              {item.unit}
                            </td>

                            <td>
                              ₹
                              {formatCurrency(
                                item.unitPrice
                              )}
                            </td>

                            <td>

                              <strong>
                                ₹
                                {formatCurrency(
                                  item.total
                                )}
                              </strong>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="item-remove"
                                onClick={() =>
                                  removeItem(
                                    index
                                  )
                                }
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

              {/* Bottom */}

              <div className="purchase-bottom-grid">

                <div>

                  <div className="purchase-field purchase-notes">

                    <label>
                      Notes
                    </label>

                    <textarea
                      placeholder="Optional purchase notes..."
                      value={
                        notes
                      }
                      onChange={(event) =>
                        setNotes(
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="purchase-totals">

                  <div className="purchase-total-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {formatCurrency(
                        subtotal
                      )}
                    </strong>

                  </div>

                  <div className="purchase-total-row">

                    <span>
                      Discount
                    </span>

                    <strong>
                      ₹
                      {formatCurrency(
                        discountAmount
                      )}
                    </strong>

                  </div>

                  <div className="purchase-total-row purchase-grand-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {formatCurrency(
                        totalAmount
                      )}
                    </strong>

                  </div>

                  <div
                    className="purchase-field"
                    style={{
                      marginTop:
                        "12px",
                    }}
                  >

                    <label>
                      Paid Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="₹0"
                      value={
                        paidAmount
                      }
                      onChange={(event) =>
                        setPaidAmount(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <div className="purchase-total-row">

                    <span>
                      Due
                    </span>

                    <strong className="purchase-due">
                      ₹
                      {formatCurrency(
                        dueAmount
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* Actions */}

              <div className="purchase-modal-actions">

                <button
                  type="button"
                  className="purchase-button purchase-button-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="purchase-button purchase-button-primary"
                  disabled={
                    saving ||
                    items.length === 0
                  }
                >

                  <Save size={15} />

                  {saving
                    ? "Saving..."
                    : "Save Purchase"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          VIEW PURCHASE MODAL
      ========================= */}

      {viewPurchase && (

        <div className="purchase-modal-overlay">

          <div className="purchase-modal view-modal">

            <div className="purchase-modal-header">

              <div>

                <p className="dashboard-eyebrow">
                  PURCHASE DETAILS
                </p>

                <h2>
                  {
                    viewPurchase.purchaseNumber
                  }
                </h2>

              </div>

              <button
                className="purchase-modal-close"
                onClick={() =>
                  setViewPurchase(
                    null
                  )
                }
              >
                <X size={18} />
              </button>

            </div>

            <div className="view-purchase-info">

              <div className="view-info-box">

                <span>
                  Supplier
                </span>

                <strong>
                  {
                    viewPurchase.supplier ||
                    "—"
                  }
                </strong>

              </div>

              <div className="view-info-box">

                <span>
                  Payment
                </span>

                <strong>
                  {
                    viewPurchase.paymentMethod ||
                    "CASH"
                  }
                </strong>

              </div>

              <div className="view-info-box">

                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    viewPurchase.createdAt
                  )}
                </strong>

              </div>

            </div>

            <div className="purchase-items-table-wrapper">

              <table className="purchase-items-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Qty
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {viewPurchase.items?.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={index}
                      >

                        <td>
                          {
                            item.productName
                          }
                        </td>

                        <td>
                          {
                            item.quantity
                          }
                        </td>

                        <td>
                          ₹
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </td>

                        <td>
                          ₹
                          {formatCurrency(
                            item.total
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="purchase-totals">

              <div className="purchase-total-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    viewPurchase.subtotal
                  )}
                </strong>

              </div>

              <div className="purchase-total-row">

                <span>
                  Discount
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    viewPurchase.discount
                  )}
                </strong>

              </div>

              <div className="purchase-total-row purchase-grand-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    viewPurchase.totalAmount
                  )}
                </strong>

              </div>

              <div className="purchase-total-row">

                <span>
                  Paid
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    viewPurchase.paidAmount
                  )}
                </strong>

              </div>

              <div className="purchase-total-row">

                <span>
                  Due
                </span>

                <strong className="purchase-due">
                  ₹
                  {formatCurrency(
                    viewPurchase.dueAmount
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default Purchases;