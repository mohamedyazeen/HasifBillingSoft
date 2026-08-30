import { useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  X,
  ReceiptText,
  CalendarDays,
  User,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";

/* =====================================================
   API
===================================================== */

const API_URL = "https://hasifbillingsoft.onrender.com/api";

/* =====================================================
   SALES
===================================================== */

function Sales() {
  const [bills, setBills] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

  const [selectedBill, setSelectedBill] =
    useState(null);

  /* ===================================================
     TOKEN
  =================================================== */

  const getToken = () => {
    return (
      localStorage.getItem(
        "hasif_token"
      ) || ""
    );
  };

  /* ===================================================
     LOAD BILLS
  =================================================== */

  const loadBills = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token =
        getToken();

      if (!token) {
        throw new Error(
          "Authentication token missing."
        );
      }

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (paymentMethod) {
        params.set(
          "paymentMethod",
          paymentMethod
        );
      }

      params.set(
        "page",
        String(page)
      );

      params.set(
        "limit",
        "20"
      );

      const response =
        await fetch(
          `${API_URL}/bills?${params.toString()}`,
          {
            method: "GET",

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
          data?.message ||
            "Failed to load sales."
        );
      }

      setBills(
        Array.isArray(
          data?.bills
        )
          ? data.bills
          : []
      );

      if (data?.pagination) {
        setPagination(
          data.pagination
        );
      }
    } catch (error) {
      console.error(
        "Sales Load Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load sales."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    loadBills();
  }, [
    page,
    paymentMethod,
  ]);

  /* ===================================================
     SEARCH
  =================================================== */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        if (page !== 1) {
          setPage(1);
        } else {
          loadBills();
        }
      }, 400);

    return () =>
      clearTimeout(timer);
  }, [search]);

  /* ===================================================
     FORMAT MONEY
  =================================================== */

  const formatMoney = (
    value
  ) => {
    const amount =
      Number(value) || 0;

    return `₹${amount.toFixed(
      2
    )}`;
  };

  /* ===================================================
     FORMAT DATE
  =================================================== */

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* ===================================================
     FORMAT TIME
  =================================================== */

  const formatTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* ===================================================
     PAYMENT LABEL
  =================================================== */

  const paymentLabel = (
    method
  ) => {
    switch (
      String(method || "")
        .toUpperCase()
    ) {
      case "UPI":
        return "UPI";

      case "CARD":
        return "Card";

      case "CREDIT":
        return "Credit";

      case "CASH":
      default:
        return "Cash";
    }
  };

  /* ===================================================
     OPEN BILL
  =================================================== */

  const openBill = async (
    bill
  ) => {
    try {
      const token =
        getToken();

      const response =
        await fetch(
          `${API_URL}/bills/${bill._id}`,
          {
            method: "GET",

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
          data?.message ||
            "Failed to load bill."
        );
      }

      setSelectedBill(
        data.bill
      );
    } catch (error) {
      console.error(
        "Bill Details Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load bill."
      );
    }
  };

  /* ===================================================
     PRINT BILL - 58MM THERMAL
  =================================================== */

  const printBill = () => {
    if (!selectedBill) {
      return;
    }

    const bill = selectedBill;

    const items = Array.isArray(bill.items)
      ? bill.items
      : [];

    const toNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };

    const money = (value) =>
      `₹${toNumber(value).toFixed(2)}`;

    /*
      Use the actual Bill model fields returned by
      GET /api/bills/:id:
        subtotal
        gstTotal
        discount
        grandTotal
        paidAmount
        dueAmount

      Item fields:
        productName
        quantity
        sellingPrice
        total
    */

    const printItems = items.map((item) => {
      const qty = toNumber(item.quantity);
      const price = toNumber(item.sellingPrice);

      const total = toNumber(
        item.total ??
        item.itemTotal ??
        item.subtotal ??
        price * qty
      );

      return {
        name:
          item.productName ||
          item.name ||
          "Product",
        qty,
        price,
        total,
      };
    });

    const calculatedSubtotal =
      printItems.reduce(
        (sum, item) =>
          sum + item.price * item.qty,
        0
      );

    const subtotal = toNumber(
      bill.subtotal ??
      calculatedSubtotal
    );

    const gst = toNumber(
      bill.gstTotal ??
      bill.gst ??
      0
    );

    const discount = toNumber(
      bill.discount ??
      bill.discountAmount ??
      0
    );

    const grandTotal = toNumber(
      bill.grandTotal ??
      bill.total ??
      subtotal + gst - discount
    );

    const paid = toNumber(
      bill.paidAmount ??
      bill.paid ??
      bill.amountPaid ??
      0
    );

    const due = Math.max(
      0,
      toNumber(
        bill.dueAmount ??
        bill.due ??
        grandTotal - paid
      )
    );

    const customerName =
      bill.customerName ||
      "Walk-in Customer";

    const customerPhone =
      bill.customerPhone ||
      "";

    const billNumber =
      bill.billNumber ||
      "-";

    const payment =
      paymentLabel(
        bill.paymentMethod
      );

    const date =
      formatDate(
        bill.createdAt
      );

    const time =
      formatTime(
        bill.createdAt
      );

    const itemRows =
      printItems
        .map(
          (item) => `
            <div class="product">

              <div class="product-name">
                ${escapeHtml(item.name)}
              </div>

              <div class="product-data">
                <span>
                  ${item.qty}
                </span>

                <span>
                  ${money(item.price)}
                </span>

                <strong>
                  ${money(item.total)}
                </strong>
              </div>

            </div>
          `
        )
        .join("");

    const dueRow =
      due > 0
        ? `
          <div class="amount-row due">
            <span>Due</span>
            <strong>
              ${money(due)}
            </strong>
          </div>
        `
        : "";

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=400,height=700"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the bill."
      );
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <meta charset="UTF-8" />

        <title>
          ${escapeHtml(billNumber)}
        </title>

        <style>

          @page {
            size: 58mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 58mm;
            min-width: 58mm;
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size: 10px;
            line-height: 1.25;

            -webkit-print-color-adjust:
              exact;

            print-color-adjust:
              exact;
          }

          .receipt {
            /*
              58mm paper has a smaller printable area.
              Keep the content safely inside it.
            */
            width: 48mm;
            margin: 0 auto;
            padding: 3mm 0 4mm;
          }

          .header {
            width: 100%;
            text-align: center;
            padding-bottom: 5px;
            border-bottom: 1px dashed #000;
          }

          .store {
            font-size: 19px;
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: .2px;
          }

          .info {
            padding: 5px 0;
            border-bottom: 1px dashed #000;
          }

          .info-row {
            width: 100%;
            display: grid;
            grid-template-columns:
              18mm
              minmax(0, 1fr);

            gap: 2mm;

            padding: 1.5px 0;
            font-size: 9px;
          }

          .info-label {
            font-weight: 800;
            white-space: nowrap;
          }

          .info-value {
            min-width: 0;
            text-align: right;
            font-weight: 700;
            overflow-wrap: anywhere;
          }

          .items-header {
            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              7mm
              13mm
              14mm;

            gap: 1mm;

            padding:
              5px 0 3px;

            border-bottom:
              1px solid #000;

            font-size: 8px;
            font-weight: 900;
          }

          .items-header span:nth-child(n+2) {
            text-align: right;
          }

          .product {
            padding: 4px 0;
            border-bottom:
              1px dotted #777;
          }

          .product-name {
            width: 100%;
            font-size: 9.5px;
            line-height: 1.2;
            font-weight: 800;
            overflow-wrap: anywhere;
          }

          .product-data {
            display: grid;

            grid-template-columns:
              7mm
              13mm
              14mm;

            justify-content: end;

            gap: 1mm;

            margin-top: 2px;

            font-size: 8.5px;
          }

          .product-data span,
          .product-data strong {
            text-align: right;
            white-space: nowrap;
          }

          .totals {
            margin-top: 5px;
          }

          .amount-row {
            display: flex;
            align-items: center;
            justify-content: space-between;

            width: 100%;

            padding: 2px 0;

            font-size: 9.5px;
          }

          .amount-row strong {
            white-space: nowrap;
          }

          .grand {
            margin-top: 4px;

            padding:
              5px 0;

            border-top:
              1px solid #000;

            border-bottom:
              1px solid #000;

            font-size: 11.5px;
            font-weight: 900;
          }

          .due {
            font-weight: 900;
          }

          .footer {
            margin-top: 9px;

            padding-top: 6px;

            border-top:
              1px dashed #000;

            text-align: center;

            font-size: 8.5px;
            font-weight: 700;

            line-height: 1.4;
          }

          @media print {

            html,
            body {
              width: 58mm;
              min-width: 58mm;
              margin: 0;
              padding: 0;
            }

            .receipt {
              width: 47mm;
              max-width: 47mm;
              margin-left: 1.8mm;
              margin-right: 0;
              padding-left: 1.2mm;
              padding-right: 1.2mm;
            }

          }

        </style>

      </head>

      <body>

        <div class="receipt">

          <div class="header">

            <div class="store">
              HASIF STORE
            </div>

          </div>

          <div class="info">

            <div class="info-row">
              <span class="info-label">
                Customer
              </span>

              <span class="info-value">
                ${escapeHtml(customerName)}
              </span>
            </div>

            ${
              customerPhone
                ? `
                  <div class="info-row">
                    <span class="info-label">
                      Phone
                    </span>

                    <span class="info-value">
                      ${escapeHtml(customerPhone)}
                    </span>
                  </div>
                `
                : ""
            }

            <div class="info-row">
              <span class="info-label">
                Bill No
              </span>

              <span class="info-value">
                ${escapeHtml(billNumber)}
              </span>
            </div>

            <div class="info-row">
              <span class="info-label">
                Date
              </span>

              <span class="info-value">
                ${escapeHtml(date)}
                ${
                  time
                    ? ` ${escapeHtml(time)}`
                    : ""
                }
              </span>
            </div>

            <div class="info-row">
              <span class="info-label">
                Payment
              </span>

              <span class="info-value">
                ${escapeHtml(payment)}
              </span>
            </div>

          </div>

          <div class="items-header">

            <span>
              Product
            </span>

            <span>
              Qty
            </span>

            <span>
              Price
            </span>

            <span>
              Total
            </span>

          </div>

          ${itemRows}

          <div class="totals">

            <div class="amount-row">
              <span>
                Subtotal
              </span>

              <strong>
                ${money(subtotal)}
              </strong>
            </div>

            <div class="amount-row">
              <span>
                GST
              </span>

              <strong>
                ${money(gst)}
              </strong>
            </div>

            <div class="amount-row">
              <span>
                Discount
              </span>

              <strong>
                - ${money(discount)}
              </strong>
            </div>

            <div class="amount-row grand">
              <span>
                Grand Total
              </span>

              <strong>
                ${money(grandTotal)}
              </strong>
            </div>

            <div class="amount-row">
              <span>
                Paid
              </span>

              <strong>
                ${money(paid)}
              </strong>
            </div>

            ${dueRow}

          </div>

          <div class="footer">
            Thank you for shopping with
            HASIF STORE
          </div>

        </div>

        <script>

          window.addEventListener(
            "load",
            function () {

              setTimeout(
                function () {
                  window.focus();
                  window.print();
                },
                500
              );

            }
          );

        </script>

      </body>

      </html>
    `);

    printWindow.document.close();
  };

  /* ===================================================
     ESCAPE HTML
  =================================================== */

  function escapeHtml(
    value
  ) {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  /* ===================================================
     PAGE CHANGE
  =================================================== */

  const goToPage = (
    nextPage
  ) => {
    if (
      nextPage < 1 ||
      nextPage >
        pagination.totalPages
    ) {
      return;
    }

    setPage(nextPage);
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <>
      <style>{`

        .sales-page {
          min-height: 100vh;

          padding: 24px;
        }

        /* =================================================
           HEADER
        ================================================= */

        .sales-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          margin-bottom: 20px;
        }

        .sales-title-wrap {
          min-width: 0;
        }

        .sales-title {
          margin: 0;

          color: #111;

          font-size: 25px;

          font-weight: 850;

          letter-spacing: -1px;
        }

        .sales-subtitle {
          margin-top: 5px;

          color: #999;

          font-size: 10px;
        }

        .sales-refresh {
          width: 39px;
          height: 39px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 11px;

          background:
            rgba(255,255,255,.7);

          color: #555;

          cursor: pointer;

          transition: .18s;
        }

        .sales-refresh:hover {
          background: #111;

          color: #fff;
        }

        .sales-refresh.spinning svg {
          animation:
            sales-spin .7s
            linear infinite;
        }

        @keyframes sales-spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* =================================================
           FILTER CARD
        ================================================= */

        .sales-filter-card {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 12px;

          margin-bottom: 16px;

          border:
            1px solid
            rgba(255,255,255,.9);

          border-radius: 16px;

          background:
            rgba(255,255,255,.62);

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 15px 45px
            rgba(0,0,0,.035);
        }

        .sales-search {
          position: relative;

          flex: 1;

          min-width: 0;
        }

        .sales-search svg {
          position: absolute;

          left: 12px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #aaa;
        }

        .sales-search input {
          width: 100%;

          height: 40px;

          padding:
            0 12px 0 37px;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 10px;

          outline: none;

          background:
            rgba(255,255,255,.8);

          color: #222;

          font-family: inherit;

          font-size: 10px;
        }

        .sales-search input:focus {
          border-color:
            rgba(0,0,0,.22);

          background: #fff;
        }

        .sales-payment-select {
          width: 145px;

          height: 40px;

          padding:
            0 10px;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 10px;

          outline: none;

          background:
            rgba(255,255,255,.8);

          color: #444;

          font-family: inherit;

          font-size: 9px;

          font-weight: 700;

          cursor: pointer;
        }

        /* =================================================
           TABLE CARD
        ================================================= */

        .sales-table-card {
          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.9);

          border-radius: 18px;

          background:
            rgba(255,255,255,.68);

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 18px 55px
            rgba(0,0,0,.04);
        }

        .sales-table-wrap {
          width: 100%;

          overflow-x: auto;
        }

        .sales-table {
          width: 100%;

          min-width: 760px;

          border-collapse:
            collapse;
        }

        .sales-table th {
          padding:
            13px 14px;

          background:
            rgba(0,0,0,.025);

          color: #999;

          font-size: 7px;

          font-weight: 850;

          letter-spacing: .7px;

          text-align: left;

          text-transform:
            uppercase;

          border-bottom:
            1px solid
            rgba(0,0,0,.06);
        }

        .sales-table td {
          padding:
            13px 14px;

          color: #444;

          font-size: 9px;

          font-weight: 650;

          border-bottom:
            1px solid
            rgba(0,0,0,.045);
        }

        .sales-table tbody tr {
          transition:
            background .15s ease;
        }

        .sales-table tbody tr:hover {
          background:
            rgba(0,0,0,.018);
        }

        .bill-number {
          color: #111;

          font-weight: 850;
        }

        .customer-name {
          color: #333;

          font-weight: 750;
        }

        .date-main {
          color: #444;

          font-size: 8px;
        }

        .date-time {
          margin-top: 2px;

          color: #aaa;

          font-size: 7px;
        }

        .amount {
          color: #111;

          font-weight: 850;
        }

        .payment-badge {
          display: inline-flex;

          align-items: center;

          padding:
            5px 8px;

          border-radius: 7px;

          background:
            rgba(0,0,0,.05);

          color: #555;

          font-size: 7px;

          font-weight: 850;

          text-transform:
            uppercase;
        }

        .due-text {
          color: #777;

          font-size: 8px;

          font-weight: 750;
        }

        .view-button {
          width: 31px;
          height: 31px;

          display: flex;

          align-items: center;
          justify-content: center;

          border: none;

          border-radius: 9px;

          background:
            rgba(0,0,0,.045);

          color: #555;

          cursor: pointer;

          transition: .18s;
        }

        .view-button:hover {
          background: #111;

          color: #fff;
        }

        /* =================================================
           EMPTY / LOADING
        ================================================= */

        .sales-empty {
          min-height: 260px;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 30px;

          color: #aaa;

          text-align: center;
        }

        .sales-empty-icon {
          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 12px;

          border-radius: 14px;

          background:
            rgba(0,0,0,.045);

          color: #777;
        }

        .sales-empty-title {
          color: #555;

          font-size: 11px;

          font-weight: 800;
        }

        .sales-empty-text {
          margin-top: 4px;

          color: #aaa;

          font-size: 8px;
        }

        /* =================================================
           PAGINATION
        ================================================= */

        .sales-pagination {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;

          padding:
            12px 14px;
        }

        .sales-pagination-info {
          color: #999;

          font-size: 8px;

          font-weight: 700;
        }

        .sales-pagination-buttons {
          display: flex;

          align-items: center;

          gap: 5px;
        }

        .page-button {
          width: 30px;
          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(0,0,0,.06);

          border-radius: 8px;

          background:
            rgba(255,255,255,.7);

          color: #666;

          cursor: pointer;
        }

        .page-button:hover:not(:disabled) {
          background: #111;

          color: #fff;
        }

        .page-button:disabled {
          opacity: .35;

          cursor: not-allowed;
        }

        .page-number {
          min-width: 30px;
          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #111;

          color: #fff;

          font-size: 8px;

          font-weight: 800;
        }

        /* =================================================
           MODAL
        ================================================= */

        .bill-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 3000;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 20px;

          background:
            rgba(0,0,0,.32);

          backdrop-filter:
            blur(5px);
        }

        .bill-modal {
          width: 100%;

          max-width: 720px;

          max-height:
            calc(100vh - 40px);

          overflow: hidden;

          border-radius: 22px;

          background:
            rgba(255,255,255,.96);

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.22);

          display: flex;

          flex-direction: column;
        }

        .bill-modal-header {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 12px;

          padding:
            17px 19px;

          border-bottom:
            1px solid
            rgba(0,0,0,.06);
        }

        .bill-modal-heading {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .bill-modal-icon {
          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #111;

          color: #fff;
        }

        .bill-modal-title {
          color: #111;

          font-size: 13px;

          font-weight: 850;
        }

        .bill-modal-subtitle {
          margin-top: 2px;

          color: #999;

          font-size: 7px;
        }

        .modal-actions {
          display: flex;

          align-items: center;

          gap: 6px;
        }

        .modal-action-button {
          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;
          justify-content: center;

          border: none;

          border-radius: 9px;

          background:
            rgba(0,0,0,.05);

          color: #555;

          cursor: pointer;
        }

        .modal-action-button:hover {
          background: #111;

          color: #fff;
        }

        .bill-modal-body {
          overflow-y: auto;

          padding: 20px;
        }

        /* =================================================
           BILL DETAILS
        ================================================= */

        .bill-info-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 10px;

          margin-bottom: 18px;
        }

        .bill-info-box {
          padding: 11px;

          border-radius: 11px;

          background:
            rgba(0,0,0,.025);
        }

        .bill-info-label {
          color: #aaa;

          font-size: 7px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing: .5px;
        }

        .bill-info-value {
          margin-top: 4px;

          color: #333;

          font-size: 9px;

          font-weight: 750;
        }

        .bill-items {
          overflow: hidden;

          border:
            1px solid
            rgba(0,0,0,.055);

          border-radius: 12px;
        }

        .bill-item-row {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            60px
            90px
            100px;

          gap: 8px;

          align-items: center;

          padding:
            10px 12px;

          border-bottom:
            1px solid
            rgba(0,0,0,.045);
        }

        .bill-item-row:last-child {
          border-bottom: none;
        }

        .bill-item-header {
          background:
            rgba(0,0,0,.025);

          color: #999;

          font-size: 7px;

          font-weight: 850;

          text-transform:
            uppercase;
        }

        .bill-item-name {
          min-width: 0;

          color: #333;

          font-size: 8px;

          font-weight: 750;
        }

        .bill-item-barcode {
          margin-top: 2px;

          color: #aaa;

          font-size: 6px;
        }

        .bill-item-cell {
          color: #555;

          font-size: 8px;

          text-align: right;
        }

        .bill-summary {
          width: 280px;

          max-width: 100%;

          margin:
            17px 0 0 auto;

          padding:
            13px;

          border-radius: 12px;

          background:
            rgba(0,0,0,.025);
        }

        .bill-summary-row {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;

          padding:
            5px 0;

          color: #666;

          font-size: 8px;
        }

        .bill-summary-row strong {
          color: #333;
        }

        .bill-summary-grand {
          margin-top: 5px;

          padding-top: 9px;

          border-top:
            1px solid
            rgba(0,0,0,.08);

          color: #111;

          font-size: 11px;

          font-weight: 850;
        }

        .bill-notes {
          margin-top: 15px;

          padding: 11px;

          border-radius: 10px;

          background:
            rgba(0,0,0,.025);
        }

        .bill-notes-title {
          color: #999;

          font-size: 7px;

          font-weight: 850;

          text-transform:
            uppercase;
        }

        .bill-notes-text {
          margin-top: 4px;

          color: #555;

          font-size: 8px;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 700px) {

          .sales-page {
            padding: 15px;
          }

          .sales-title {
            font-size: 21px;
          }

          .sales-filter-card {
            flex-direction: column;

            align-items: stretch;
          }

          .sales-payment-select {
            width: 100%;
          }

          .sales-pagination {
            flex-direction: column;

            align-items: stretch;
          }

          .sales-pagination-buttons {
            justify-content:
              center;
          }

          .bill-modal-overlay {
            padding: 8px;
          }

          .bill-modal {
            max-height:
              calc(100vh - 16px);

            border-radius: 18px;
          }

          .bill-modal-body {
            padding: 14px;
          }

          .bill-info-grid {
            grid-template-columns:
              1fr;
          }

          .bill-item-row {
            grid-template-columns:
              minmax(0, 1fr)
              45px
              75px
              80px;
          }

        }

      `}</style>

      <div className="sales-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="sales-header">

          <div className="sales-title-wrap">

            <h1 className="sales-title">
              Sales
            </h1>

            <div className="sales-subtitle">
              View and manage your completed bills
            </div>

          </div>

          <button
            type="button"
            className={
              `sales-refresh ${
                refreshing
                  ? "spinning"
                  : ""
              }`
            }
            onClick={() =>
              loadBills(true)
            }
            disabled={
              refreshing
            }
            title="Refresh"
          >

            <RefreshCw
              size={16}
            />

          </button>

        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="sales-filter-card">

          <div className="sales-search">

            <Search
              size={15}
            />

            <input
              type="text"
              placeholder="Search bill number, customer or phone..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <select
            className="sales-payment-select"
            value={
              paymentMethod
            }
            onChange={(e) => {
              setPaymentMethod(
                e.target.value
              );

              setPage(1);
            }}
          >

            <option value="">
              All Payments
            </option>

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

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="sales-table-card">

          {loading ? (

            <div className="sales-empty">

              <div className="sales-empty-icon">

                <RefreshCw
                  size={19}
                />

              </div>

              <div className="sales-empty-title">
                Loading sales...
              </div>

              <div className="sales-empty-text">
                Please wait
              </div>

            </div>

          ) : bills.length === 0 ? (

            <div className="sales-empty">

              <div className="sales-empty-icon">

                <ReceiptText
                  size={20}
                />

              </div>

              <div className="sales-empty-title">
                No sales found
              </div>

              <div className="sales-empty-text">
                Completed bills will appear here
              </div>

            </div>

          ) : (

            <>

              <div className="sales-table-wrap">

                <table className="sales-table">

                  <thead>

                    <tr>

                      <th>
                        Bill No
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Due
                      </th>

                      <th>
                        View
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {bills.map(
                      (bill) => (

                        <tr
                          key={
                            bill._id
                          }
                        >

                          <td>

                            <div className="bill-number">
                              {
                                bill.billNumber ||
                                "-"
                              }
                            </div>

                          </td>

                          <td>

                            <div className="customer-name">
                              {
                                bill.customerName ||
                                "Walk-in Customer"
                              }
                            </div>

                            {bill.customerPhone && (

                              <div className="date-time">
                                {
                                  bill.customerPhone
                                }
                              </div>

                            )}

                          </td>

                          <td>

                            <div className="date-main">
                              {
                                formatDate(
                                  bill.createdAt
                                )
                              }
                            </div>

                            <div className="date-time">
                              {
                                formatTime(
                                  bill.createdAt
                                )
                              }
                            </div>

                          </td>

                          <td>

                            <div className="amount">
                              {
                                formatMoney(
                                  bill.grandTotal
                                )
                              }
                            </div>

                          </td>

                          <td>

                            <span className="payment-badge">
                              {
                                paymentLabel(
                                  bill.paymentMethod
                                )
                              }
                            </span>

                          </td>

                          <td>

                            <div className="due-text">
                              {
                                formatMoney(
                                  bill.dueAmount
                                )
                              }
                            </div>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="view-button"
                              onClick={() =>
                                openBill(
                                  bill
                                )
                              }
                              title="View Bill"
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

              {/* PAGINATION */}

              <div className="sales-pagination">

                <div className="sales-pagination-info">

                  {pagination.total}{" "}
                  sales

                </div>

                <div className="sales-pagination-buttons">

                  <button
                    type="button"
                    className="page-button"
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      goToPage(
                        page - 1
                      )
                    }
                  >

                    <ChevronLeft
                      size={14}
                    />

                  </button>

                  <div className="page-number">
                    {page}
                  </div>

                  <button
                    type="button"
                    className="page-button"
                    disabled={
                      page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      goToPage(
                        page + 1
                      )
                    }
                  >

                    <ChevronRight
                      size={14}
                    />

                  </button>

                </div>

              </div>

            </>

          )}

        </div>

      </div>

      {/* ===================================================
          BILL MODAL
      =================================================== */}

      {selectedBill && (

        <div
          className="bill-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedBill(
                null
              );
            }

          }}
        >

          <div className="bill-modal">

            {/* HEADER */}

            <div className="bill-modal-header">

              <div className="bill-modal-heading">

                <div className="bill-modal-icon">

                  <ReceiptText
                    size={17}
                  />

                </div>

                <div>

                  <div className="bill-modal-title">
                    {
                      selectedBill.billNumber
                    }
                  </div>

                  <div className="bill-modal-subtitle">
                    Bill Details
                  </div>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="modal-action-button"
                  onClick={
                    printBill
                  }
                  title="Print"
                >

                  <Printer
                    size={15}
                  />

                </button>

                <button
                  type="button"
                  className="modal-action-button"
                  onClick={() =>
                    setSelectedBill(
                      null
                    )
                  }
                  title="Close"
                >

                  <X
                    size={16}
                  />

                </button>

              </div>

            </div>

            {/* BODY */}

            <div className="bill-modal-body">

              {/* INFO */}

              <div className="bill-info-grid">

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Customer
                  </div>

                  <div className="bill-info-value">

                    <User
                      size={11}
                      style={{
                        marginRight: 5,
                        verticalAlign:
                          "middle",
                      }}
                    />

                    {
                      selectedBill.customerName ||
                      "Walk-in Customer"
                    }

                  </div>

                </div>

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Date
                  </div>

                  <div className="bill-info-value">

                    <CalendarDays
                      size={11}
                      style={{
                        marginRight: 5,
                        verticalAlign:
                          "middle",
                      }}
                    />

                    {
                      formatDate(
                        selectedBill.createdAt
                      )
                    }

                  </div>

                </div>

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Phone
                  </div>

                  <div className="bill-info-value">

                    <Phone
                      size={11}
                      style={{
                        marginRight: 5,
                        verticalAlign:
                          "middle",
                      }}
                    />

                    {
                      selectedBill.customerPhone ||
                      "-"
                    }

                  </div>

                </div>

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Payment
                  </div>

                  <div className="bill-info-value">

                    <CreditCard
                      size={11}
                      style={{
                        marginRight: 5,
                        verticalAlign:
                          "middle",
                      }}
                    />

                    {
                      paymentLabel(
                        selectedBill.paymentMethod
                      )
                    }

                  </div>

                </div>

              </div>

              {/* ITEMS */}

              <div className="bill-items">

                <div className="bill-item-row bill-item-header">

                  <div>
                    Product
                  </div>

                  <div style={{
                    textAlign:
                      "right",
                  }}>
                    Qty
                  </div>

                  <div style={{
                    textAlign:
                      "right",
                  }}>
                    Price
                  </div>

                  <div style={{
                    textAlign:
                      "right",
                  }}>
                    Total
                  </div>

                </div>

                {(
                  selectedBill.items ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      className="bill-item-row"
                      key={
                        `${item.product || index}-${index}`
                      }
                    >

                      <div>

                        <div className="bill-item-name">
                          {
                            item.productName ||
                            "-"
                          }
                        </div>

                        {item.barcode && (

                          <div className="bill-item-barcode">
                            Barcode:{" "}
                            {
                              item.barcode
                            }
                          </div>

                        )}

                      </div>

                      <div className="bill-item-cell">
                        {
                          item.quantity ||
                          0
                        }
                      </div>

                      <div className="bill-item-cell">
                        {
                          formatMoney(
                            item.sellingPrice
                          )
                        }
                      </div>

                      <div className="bill-item-cell">
                        {
                          formatMoney(
                            item.total
                          )
                        }
                      </div>

                    </div>

                  )
                )}

              </div>

              {/* SUMMARY */}

              <div className="bill-summary">

                <div className="bill-summary-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {
                      formatMoney(
                        selectedBill.subtotal
                      )
                    }
                  </strong>

                </div>

                <div className="bill-summary-row">

                  <span>
                    GST
                  </span>

                  <strong>
                    {
                      formatMoney(
                        selectedBill.gstTotal
                      )
                    }
                  </strong>

                </div>

                <div className="bill-summary-row">

                  <span>
                    Discount
                  </span>

                  <strong>
                    -{" "}
                    {
                      formatMoney(
                        selectedBill.discount
                      )
                    }
                  </strong>

                </div>

                <div className="bill-summary-row bill-summary-grand">

                  <span>
                    Grand Total
                  </span>

                  <strong>
                    {
                      formatMoney(
                        selectedBill.grandTotal
                      )
                    }
                  </strong>

                </div>

                <div className="bill-summary-row">

                  <span>
                    Paid
                  </span>

                  <strong>
                    {
                      formatMoney(
                        selectedBill.paidAmount
                      )
                    }
                  </strong>

                </div>

                <div className="bill-summary-row">

                  <span>
                    Due
                  </span>

                  <strong>
                    {
                      formatMoney(
                        selectedBill.dueAmount
                      )
                    }
                  </strong>

                </div>

              </div>

              {/* NOTES */}

              {selectedBill.notes && (

                <div className="bill-notes">

                  <div className="bill-notes-title">
                    Notes
                  </div>

                  <div className="bill-notes-text">
                    {
                      selectedBill.notes
                    }
                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default Sales;