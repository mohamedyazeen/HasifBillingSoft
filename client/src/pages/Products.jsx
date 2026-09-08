import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  X,
  Save,
  AlertTriangle,
  CheckCircle2,
  Boxes,
} from "lucide-react";

const API_URL = "https://hasifbillingsoft.onrender.com/api";

const emptyForm = {
  name: "",
  category: "",
  barcode: "",
  purchasePrice: "",
  sellingPrice: "",
  wholesalePrice: "",
  stock: "",
  unit: "packet",
  lowStockLevel: "",
  gstEnabled: false,
  gstRate: "",
  supplier: "",
  isActive: true,
};

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("hasif_token");

  /* =====================================================
     ROLE
  ===================================================== */

  const storedUser = localStorage.getItem("hasif_user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    currentUser = null;
  }

  const isStaff = currentUser?.role === "staff";

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

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
          data.message || "Failed to load products."
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetchProducts();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.category
          ?.toLowerCase()
          .includes(query) ||
        product.barcode
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [products, search]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     OPEN ADD
  ===================================================== */

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      category: product.category || "",
      barcode: product.barcode || "",
      purchasePrice:
        product.purchasePrice ?? "",
      sellingPrice:
        product.sellingPrice ?? "",
      wholesalePrice:
        product.wholesalePrice ?? "",
      stock: product.stock ?? "",
      unit: product.unit || "packet",
      lowStockLevel:
        product.lowStockLevel ?? "",
      gstEnabled:
        Boolean(product.gstEnabled),
      gstRate:
        product.gstRate ?? "",
      supplier:
        product.supplier || "",
      isActive:
        product.isActive !== false,
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
    setEditingProduct(null);
    setForm(emptyForm);
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.category.trim()) {
      return "Category is required.";
    }

    if (
      form.purchasePrice === "" ||
      Number(form.purchasePrice) < 0
    ) {
      return "Enter a valid purchase price.";
    }

    if (
      form.sellingPrice === "" ||
      Number(form.sellingPrice) < 0
    ) {
      return "Enter a valid selling price.";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      return "Enter a valid stock quantity.";
    }

    if (
      form.lowStockLevel === "" ||
      Number(form.lowStockLevel) < 0
    ) {
      return "Enter a valid low stock level.";
    }

    if (
      form.gstEnabled &&
      (form.gstRate === "" ||
        Number(form.gstRate) < 0)
    ) {
      return "Enter a valid GST rate.";
    }

    return "";
  };

  /* =====================================================
     SAVE PRODUCT
  ===================================================== */

  const saveProduct = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        barcode: form.barcode.trim(),

        purchasePrice: isStaff
          ? Number(
              editingProduct?.purchasePrice ??
                0
            )
          : Number(form.purchasePrice),

        sellingPrice: Number(
          form.sellingPrice
        ),

        wholesalePrice:
          form.wholesalePrice === ""
            ? 0
            : Number(form.wholesalePrice),

        stock: Number(form.stock),

        unit:
          form.unit.trim() || "packet",

        lowStockLevel: Number(
          form.lowStockLevel
        ),

        gstEnabled:
          Boolean(form.gstEnabled),

        gstRate: form.gstEnabled
          ? Number(form.gstRate || 0)
          : 0,

        supplier:
          form.supplier.trim(),

        isActive:
          Boolean(form.isActive),
      };

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`;

      const method = editingProduct
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save product."
        );
      }

      setSuccess(
        editingProduct
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setShowModal(false);
      setEditingProduct(null);
      setForm(emptyForm);

      await fetchProducts();
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CURRENCY
  ===================================================== */

  const money = (value) => {
    return Number(
      value || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =====================================================
     STOCK STATUS
  ===================================================== */

  const getStockStatus = (product) => {
    const stock = Number(
      product.stock || 0
    );

    const lowStock = Number(
      product.lowStockLevel || 0
    );

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        type: "out",
      };
    }

    if (stock <= lowStock) {
      return {
        label: "Low Stock",
        type: "low",
      };
    }

    return {
      label: "In Stock",
      type: "good",
    };
  };

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .products-page {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          padding: 28px 32px 45px;
          overflow-x: hidden;
        }

        .products-container {
          width: 100%;
          min-width: 0;
          max-width: 1500px;
          margin: 0 auto;
        }

        /* ==============================================
           HEADER
        ============================================== */

        .products-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
          min-width: 0;
        }

        .products-header > div:first-child {
          min-width: 0;
          flex: 1 1 auto;
        }

        .products-header h1,
        .products-header p {
          overflow-wrap: anywhere;
        }

        .add-product-button {
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .products-eyebrow {
          margin-bottom: 7px;

          color: #222;

          font-size: 11px;
          font-weight: 850;

          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .products-header h1 {
          margin: 0;

          color: #111;

          font-size: 32px;
          line-height: 1;

          letter-spacing: -1.5px;
        }

        .products-header p {
          margin-top: 9px;

          color: #222;

          font-size: 14px;
        }

        .add-product-button {
          height: 43px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 16px;

          border: none;
          border-radius: 12px;

          background: #111;
          color: #fff;

          font-size: 13px;
          font-weight: 850;

          cursor: pointer;

          box-shadow:
            0 10px 25px
            rgba(0,0,0,0.12);

          transition: 0.2s ease;
        }

        .add-product-button:hover {
          transform: translateY(-1px);
        }

        /* ==============================================
           MESSAGE
        ============================================== */

        .products-message {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 13px;

          padding: 11px 13px;

          border-radius: 12px;

          font-size: 13px;
          font-weight: 700;
        }

        .products-error {
          background:
            rgba(0,0,0,0.05);

          color: #222;
        }

        .products-success {
          background:
            rgba(255,255,255,0.7);

          border:
            1px solid
            rgba(0,0,0,0.05);

          color: #222;
        }

        /* ==============================================
           GLASS CARD
        ============================================== */

        .products-glass {
          border:
            1px solid
            rgba(255,255,255,0.9);

          border-radius: 21px;

          background:
            rgba(255,255,255,0.64);

          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);

          box-shadow:
            0 20px 55px
            rgba(0,0,0,0.045),

            inset 0 1px 0
            rgba(255,255,255,0.95);

          overflow: hidden;
        }

        /* ==============================================
           SEARCH
        ============================================== */

        .products-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;
          min-width: 0;

          padding: 16px;

          border-bottom:
            1px solid
            rgba(0,0,0,0.12);
        }

        .products-search {
          position: relative;

          width: min(600px, 100%);
          min-width: 0;
          flex: 1 1 600px;
        }

        .products-search svg {
          position: absolute;

          left: 13px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #222;
        }

        .products-search input {
          width: 100%;
          height: 45px;

          padding:
            0 14px 0 40px;

          outline: none;

          border:
            1px solid
            rgba(0,0,0,0.16);

          border-radius: 12px;

          background:
            rgba(255,255,255,0.76);

          color: #222;

          font-family: inherit;
          font-size: 14px;

          transition: 0.2s ease;
        }

        .products-search input:focus {
          border-color: #222;

          box-shadow:
            0 0 0 3px
            rgba(0,0,0,0.035);
        }

        .products-count {
          color: #222;

          font-size: 13px;
          font-weight: 750;

          white-space: nowrap;
        }

        /* ==============================================
           TABLE
        ============================================== */

        .products-table-wrap {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          min-width: 900px;

          border-collapse: collapse;

          table-layout: fixed;
        }

        .products-table th {
          height: 43px;

          padding:
            0 15px;

          color: #222;

          text-align: left;

          font-size: 11px;
          font-weight: 850;

          letter-spacing: 0.7px;

          text-transform: uppercase;

          white-space: nowrap;
        }

        .products-table td {
          height: 72px;

          padding:
            10px 15px;

          vertical-align: middle;

          border-bottom:
            1px solid
            rgba(0,0,0,0.12);

          color: #222;

          font-size: 14px;
        }

        /* Every product has light line */

        .products-table tbody tr {
          border-bottom:
            1px solid
            rgba(0,0,0,0.12);

          transition:
            background 0.2s ease;
        }

        .products-table tbody tr:last-child {
          border-bottom: none;
        }

        .products-table tbody tr:hover {
          background:
            rgba(0,0,0,0.014);
        }

        /* ==============================================
           PRODUCT
        ============================================== */

        .product-main {
          display: flex;
          align-items: center;

          min-width: 0;

          gap: 10px;
        }

        .product-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            rgba(0,0,0,0.045);

          color: #222;
        }

        .product-info {
          min-width: 0;
        }

        .product-name {
          overflow: hidden;

          color: #222;

          font-size: 14px;
          font-weight: 850;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-barcode {
          margin-top: 4px;

          overflow: hidden;

          color: #222;

          font-size: 11px;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==============================================
           STOCK
        ============================================== */

        .stock-value {
          color: #222;

          font-size: 14px;
          font-weight: 850;
        }

        .stock-unit {
          margin-left: 4px;

          color: #222;

          font-size: 11px;
        }

        /* ==============================================
           STATUS
        ============================================== */

        .stock-status {
          display: inline-flex;
          align-items: center;

          padding:
            5px 9px;

          border-radius: 999px;

          font-size: 12px;
          font-weight: 800;

          white-space: nowrap;
        }

        .stock-status-good {
          background:
            rgba(0,0,0,0.12);

          color: #222;
        }

        .stock-status-low {
          background:
            rgba(0,0,0,0.08);

          color: #222;
        }

        .stock-status-out {
          background:
            rgba(0,0,0,0.15);

          color: #222;
        }

        /* ==============================================
           GST
        ============================================== */

        .gst-on {
          color: #222;
          font-weight: 800;
        }

        .gst-off {
          color: #222;
        }

        /* ==============================================
           EDIT
        ============================================== */

        .edit-button {
          height: 34px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 6px;

          padding:
            0 11px;

          border:
            1px solid
            rgba(0,0,0,0.16);

          border-radius: 9px;

          background:
            rgba(255,255,255,0.72);

          color: #222;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .edit-button:hover {
          background: #111;
          color: #fff;
        }

        /* ==============================================
           EMPTY
        ============================================== */

        .products-empty {
          min-height: 300px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 35px;
        }

        .products-empty-icon {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background:
            rgba(0,0,0,0.045);

          color: #222;
        }

        .products-empty h3 {
          margin-top: 14px;

          color: #222;

          font-size: 16px;
        }

        .products-empty p {
          margin-top: 5px;

          color: #222;

          font-size: 12px;
        }

        /* ==============================================
           MODAL
        ============================================== */

        .product-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 1000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(0,0,0,0.28);

          backdrop-filter: blur(9px);
          -webkit-backdrop-filter: blur(9px);
        }

        .product-modal {
          width: 100%;
          max-width: 720px;
          max-height: 90vh;

          overflow-y: auto;

          border:
            1px solid
            rgba(255,255,255,0.9);

          border-radius: 23px;

          background:
            rgba(255,255,255,0.94);

          box-shadow:
            0 30px 100px
            rgba(0,0,0,0.22);
        }

        .product-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 20px;

          border-bottom:
            1px solid
            rgba(0,0,0,0.14);
        }

        .product-modal-title {
          display: flex;
          align-items: center;

          gap: 10px;
        }

        .product-modal-title-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #111;
          color: #fff;
        }

        .product-modal-title h2 {
          color: #222;

          font-size: 20px;
        }

        .product-modal-title p {
          margin-top: 3px;

          color: #222;

          font-size: 12px;
        }

        .modal-close {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(0,0,0,0.14);

          border-radius: 10px;

          background:
            rgba(0,0,0,0.025);

          color: #222;

          cursor: pointer;
        }

        .modal-close:hover {
          background: #111;
          color: #fff;
        }

        /* ==============================================
           FORM
        ============================================== */

        .product-form {
          padding: 20px;
        }

        .product-form-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;

          gap: 6px;
        }

        .form-group-full {
          grid-column: 1 / -1;
        }

        .form-group label {
          color: #222;

          font-size: 12px;
          font-weight: 850;

          letter-spacing: 0.3px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 48px;

          padding:
            0 11px;

          outline: none;

          border:
            1px solid
            rgba(0,0,0,0.15);

          border-radius: 10px;

          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);

          color: #222;

          font-family: inherit;
          font-size: 15px;
        }

        .form-group input::placeholder {
          color: #666;
          opacity: 1;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #222;

          box-shadow:
            0 0 0 3px
            rgba(0,0,0,0.035);
        }

        /* ==============================================
           TOGGLE
        ============================================== */

        .form-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 12px;

          border:
            1px solid
            rgba(0,0,0,0.12);

          border-radius: 12px;

          background:
            rgba(0,0,0,0.018);
        }

        .form-toggle-text strong {
          display: block;

          color: #222;

          font-size: 14px;
        }

        .form-toggle-text span {
          display: block;

          margin-top: 3px;

          color: #222;

          font-size: 11px;
        }

        .toggle {
          position: relative;

          width: 40px;
          height: 22px;

          border: none;
          border-radius: 99px;

          background:
            rgba(0,0,0,0.12);

          cursor: pointer;

          transition: 0.2s ease;
        }

        .toggle.active {
          background: #111;
        }

        .toggle-dot {
          position: absolute;

          top: 3px;
          left: 3px;

          width: 16px;
          height: 16px;

          border-radius: 50%;

          background: #fff;

          box-shadow:
            0 2px 6px
            rgba(0,0,0,0.2);

          transition: 0.2s ease;
        }

        .toggle.active .toggle-dot {
          transform:
            translateX(18px);
        }

        /* ==============================================
           MODAL FOOTER
        ============================================== */

        .product-modal-footer {
          display: flex;
          justify-content: flex-end;

          gap: 8px;

          padding: 16px 20px;

          border-top:
            1px solid
            rgba(0,0,0,0.14);
        }

        .modal-button {
          height: 41px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 15px;

          border-radius: 10px;

          font-size: 13px;
          font-weight: 850;

          cursor: pointer;
        }

        .modal-cancel {
          border:
            1px solid
            rgba(0,0,0,0.16);

          background:
            rgba(255,255,255,0.8);

          color: #222;
        }

        .modal-save {
          border: none;

          background: #111;
          color: #fff;
        }

        .modal-save:disabled {
          opacity: 0.5;

          cursor: not-allowed;
        }

        /* ==============================================
           TABLET / NARROW DESKTOP
        ============================================== */

        @media (max-width: 1100px) {
          .products-header {
            flex-wrap: wrap;
          }

          .products-header > div:first-child {
            flex: 1 1 500px;
          }

          .products-toolbar {
            flex-wrap: wrap;
          }

          .products-search {
            flex-basis: 100%;
            max-width: none;
          }
        }

        /* ==============================================
           MOBILE
        ============================================== */

        @media (max-width: 850px) {

          .products-page {
            padding:
              22px 18px 35px;
          }

          .products-header {
            flex-direction: column;
          }

          .add-product-button {
            width: 100%;
          }

          .products-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .products-search {
            width: 100%;
          }

          .products-count {
            text-align: right;
          }

        }

        @media (max-width: 600px) {

          .products-page {
            padding:
              17px 12px 30px;
          }

          .products-header h1 {
            font-size: 27px;
          }

          .products-glass {
            border-radius: 17px;
          }

          .product-form-grid {
            grid-template-columns: 1fr;
          }

          .form-group-full {
            grid-column: auto;
          }

          .product-modal-overlay {
            padding: 10px;
          }

          .product-modal {
            border-radius: 18px;
          }

          .product-modal-header,
          .product-form {
            padding: 15px;
          }

          .product-modal-footer {
            padding: 13px 15px;
          }

        }

      `}</style>

      <div className="products-page">

        <div className="products-container">

          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="products-header">

            <div>

              <div className="products-eyebrow">
                INVENTORY
              </div>

              <h1>
                Products
              </h1>

              <p>
                Manage products, prices,
                GST and stock levels.
              </p>

            </div>

            <button
              type="button"
              className="add-product-button"
              onClick={openAddModal}
            >
              <Plus size={15} />
              Add Product
            </button>

          </div>

          {/* ==========================================
              MESSAGES
          ========================================== */}

          {error && (
            <div className="products-message products-error">

              <AlertTriangle
                size={14}
              />

              <span>
                {error}
              </span>

            </div>
          )}

          {success && (
            <div className="products-message products-success">

              <CheckCircle2
                size={14}
              />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* ==========================================
              MAIN CARD
          ========================================== */}

          <div className="products-glass">

            {/* SEARCH */}

            <div className="products-toolbar">

              <div className="products-search">

                <Search
                  size={17}
                />

                <input
                  type="text"
                  placeholder="Search product, category or barcode..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="products-count">

                {filteredProducts.length}{" "}
                {filteredProducts.length ===
                1
                  ? "Product"
                  : "Products"}

              </div>

            </div>

            {/* TABLE */}

            {loading ? (

              <div className="products-empty">

                <div className="products-empty-icon">
                  <Boxes size={25} />
                </div>

                <h3>
                  Loading products...
                </h3>

                <p>
                  Please wait.
                </p>

              </div>

            ) : filteredProducts.length ===
              0 ? (

              <div className="products-empty">

                <div className="products-empty-icon">
                  <Package size={25} />
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  Add your first product
                  to start managing stock.
                </p>

              </div>

            ) : (

              <div className="products-table-wrap">

                <table className="products-table">

                  <colgroup>
                    <col style={{ width: isStaff ? "26%" : "23%" }} />
                    <col style={{ width: isStaff ? "13%" : "12%" }} />
                    {!isStaff && (
                      <col style={{ width: "10%" }} />
                    )}
                    <col style={{ width: isStaff ? "12%" : "10%" }} />
                    <col style={{ width: isStaff ? "12%" : "10%" }} />
                    <col style={{ width: isStaff ? "10%" : "8%" }} />
                    <col style={{ width: isStaff ? "9%" : "8%" }} />
                    <col style={{ width: isStaff ? "10%" : "11%" }} />
                    <col style={{ width: isStaff ? "8%" : "8%" }} />
                  </colgroup>

                  <thead>

                    <tr>

                      <th>
                        Product
                      </th>

                      <th>
                        Category
                      </th>

                      {!isStaff && (
                        <th>
                          Purchase
                        </th>
                      )}

                      <th>
                        Selling
                      </th>

                      <th>
                        Wholesale
                      </th>

                      <th>
                        Stock
                      </th>

                      <th>
                        GST
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.map(
                      (product) => {

                        const status =
                          getStockStatus(
                            product
                          );

                        return (

                          <tr
                            key={
                              product._id
                            }
                          >

                            {/* PRODUCT */}

                            <td>

                              <div className="product-main">

                                <div className="product-icon">
                                  <Package
                                    size={16}
                                  />
                                </div>

                                <div className="product-info">

                                  <div className="product-name">
                                    {
                                      product.name
                                    }
                                  </div>

                                  <div className="product-barcode">
                                    {
                                      product.barcode ||
                                      "No barcode"
                                    }
                                  </div>

                                </div>

                              </div>

                            </td>

                            {/* CATEGORY */}

                            <td>
                              {
                                product.category ||
                                "—"
                              }
                            </td>

                            {/* PURCHASE - ADMIN ONLY */}

                            {!isStaff && (
                              <td>
                                ₹
                                {money(
                                  product.purchasePrice
                                )}
                              </td>
                            )}

                            {/* SELLING */}

                            <td>
                              ₹
                              {money(
                                product.sellingPrice
                              )}
                            </td>

                            {/* WHOLESALE */}

                            <td>
                              ₹
                              {money(
                                product.wholesalePrice
                              )}
                            </td>

                            {/* STOCK */}

                            <td>

                              <span className="stock-value">
                                {
                                  product.stock
                                }
                              </span>

                              <span className="stock-unit">
                                {
                                  product.unit ||
                                  "piece"
                                }
                              </span>

                            </td>

                            {/* GST */}

                            <td>

                              {product.gstEnabled ? (

                                <span className="gst-on">
                                  {
                                    product.gstRate
                                  }%
                                </span>

                              ) : (

                                <span className="gst-off">
                                  OFF
                                </span>

                              )}

                            </td>

                            {/* STATUS */}

                            <td>

                              <span
                                className={
                                  `stock-status stock-status-${status.type}`
                                }
                              >
                                {
                                  status.label
                                }
                              </span>

                            </td>

                            {/* ACTION */}

                            <td>

                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                              >
                                <Pencil
                                  size={12}
                                />

                                Edit
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

          </div>

        </div>

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="product-modal">

            {/* MODAL HEADER */}

            <div className="product-modal-header">

              <div className="product-modal-title">

                <div className="product-modal-title-icon">

                  <Package
                    size={17}
                  />

                </div>

                <div>

                  <h2>
                    {editingProduct
                      ? "Edit Product"
                      : "Add Product"}
                  </h2>

                  <p>
                    {editingProduct
                      ? "Update product details and stock."
                      : "Add a new product to your inventory."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeModal
                }
              >
                <X size={15} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="product-form"
              onSubmit={
                saveProduct
              }
            >

              <div className="product-form-grid">

                {/* NAME */}

                <div className="form-group form-group-full">

                  <label>
                    PRODUCT NAME *
                  </label>

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Good Day Biscuit"
                    required
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-group">

                  <label>
                    CATEGORY *
                  </label>

                  <input
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Biscuits"
                    required
                  />

                </div>

                {/* BARCODE */}

                <div className="form-group">

                  <label>
                    BARCODE
                  </label>

                  <input
                    name="barcode"
                    value={
                      form.barcode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="8901234567890"
                  />

                </div>

                {/* PURCHASE - ADMIN ONLY */}

                {!isStaff && (
                  <div className="form-group">

                    <label>
                      PURCHASE PRICE *
                    </label>

                    <input
                      name="purchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.purchasePrice
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="15"
                      required
                    />

                  </div>
                )}

                {/* SELLING */}

                <div className="form-group">

                  <label>
                    SELLING PRICE *
                  </label>

                  <input
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.sellingPrice
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="20"
                    required
                  />

                </div>

                {/* WHOLESALE */}

                <div className="form-group">

                  <label>
                    WHOLESALE PRICE
                  </label>

                  <input
                    name="wholesalePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.wholesalePrice
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="18"
                  />

                </div>

                {/* STOCK */}

                <div className="form-group">

                  <label>
                    STOCK QUANTITY *
                  </label>

                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.stock
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="50"
                    required
                  />

                </div>

                {/* UNIT */}

                <div className="form-group">

                  <label>
                    UNIT *
                  </label>

                  <select
                    name="unit"
                    value={
                      form.unit
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="packet">
                      Packet
                    </option>

                    <option value="piece">
                      Piece
                    </option>

                    <option value="box">
                      Box
                    </option>

                    <option value="kg">
                      KG
                    </option>

                    <option value="gram">
                      Gram
                    </option>

                    <option value="liter">
                      Liter
                    </option>

                    <option value="bottle">
                      Bottle
                    </option>

                    <option value="dozen">
                      Dozen
                    </option>

                  </select>

                </div>

                {/* LOW STOCK */}

                <div className="form-group">

                  <label>
                    LOW STOCK ALERT *
                  </label>

                  <input
                    name="lowStockLevel"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.lowStockLevel
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="25"
                    required
                  />

                </div>

                {/* SUPPLIER */}

                <div className="form-group form-group-full">

                  <label>
                    SUPPLIER
                  </label>

                  <input
                    name="supplier"
                    value={
                      form.supplier
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="ABC Distributors"
                  />

                </div>

                {/* GST */}

                <div className="form-group form-group-full">

                  <div className="form-toggle-row">

                    <div className="form-toggle-text">

                      <strong>
                        GST
                      </strong>

                      <span>
                        Enable GST for this
                        product
                      </span>

                    </div>

                    <button
                      type="button"
                      className={
                        `toggle ${
                          form.gstEnabled
                            ? "active"
                            : ""
                        }`
                      }
                      onClick={() =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            gstEnabled:
                              !previous.gstEnabled,
                          })
                        )
                      }
                    >

                      <span className="toggle-dot" />

                    </button>

                  </div>

                </div>

                {/* GST RATE */}

                {form.gstEnabled && (

                  <div className="form-group">

                    <label>
                      GST RATE (%)
                    </label>

                    <input
                      name="gstRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.gstRate
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="18"
                    />

                  </div>

                )}

                {/* ACTIVE */}

                <div className="form-group">

                  <div className="form-toggle-row">

                    <div className="form-toggle-text">

                      <strong>
                        Product Active
                      </strong>

                      <span>
                        Available for billing
                      </span>

                    </div>

                    <button
                      type="button"
                      className={
                        `toggle ${
                          form.isActive
                            ? "active"
                            : ""
                        }`
                      }
                      onClick={() =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            isActive:
                              !previous.isActive,
                          })
                        )
                      }
                    >

                      <span className="toggle-dot" />

                    </button>

                  </div>

                </div>

              </div>

            </form>

            {/* FOOTER */}

            <div className="product-modal-footer">

              <button
                type="button"
                className="modal-button modal-cancel"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-button modal-save"
                onClick={
                  saveProduct
                }
                disabled={saving}
              >

                <Save
                  size={13}
                />

                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Save Product"}

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default Products;