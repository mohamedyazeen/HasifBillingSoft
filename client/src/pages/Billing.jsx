import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  ShoppingCart,
  Receipt,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Package,
  Percent,
  Printer,
} from "lucide-react";

const API_URL = "https://hasifbillingsoft.onrender.com/api";

const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "CARD",
  "CREDIT",
];

function Billing() {
  const token = localStorage.getItem("hasif_token");

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  const [gstEnabled, setGstEnabled] =
    useState(true);

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [paidAmount, setPaidAmount] =
    useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [lastBill, setLastBill] =
    useState(null);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Products load ஆகவில்லை."
        );
      }

      setProducts(
        data.products || []
      );
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

    loadProducts();
  }, []);

  /* =====================================================
     PRODUCT SEARCH
  ===================================================== */

  const searchResults = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    if (!text) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.isActive !== false
      )
      .filter((product) => {
        return (
          product.name
            ?.toLowerCase()
            .includes(text) ||
          product.barcode
            ?.toLowerCase()
            .includes(text) ||
          product.category
            ?.toLowerCase()
            .includes(text)
        );
      })
      .slice(0, 8);
  }, [products, search]);

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const addProduct = (product) => {
    setError("");
    setSearch("");

    const stock = Number(
      product.stock || 0
    );

    if (stock <= 0) {
      setError(
        `${product.name} - Stock இல்லை.`
      );
      return;
    }

    const existing =
      cart.find(
        (item) =>
          item.productId ===
          product._id
      );

    if (existing) {
      if (
        existing.quantity >=
        existing.stock
      ) {
        setError(
          `${product.name} - available stock ${existing.stock} ${existing.unit}.`
        );
        return;
      }

      setCart((previous) =>
        previous.map((item) =>
          item.productId ===
          product._id
            ? {
                ...item,
                quantity:
                  Number(
                    item.quantity
                  ) + 1,
              }
            : item
        )
      );

      return;
    }

    setCart((previous) => [
      ...previous,
      {
        productId:
          product._id,

        name:
          product.name,

        barcode:
          product.barcode || "",

        unit:
          product.unit || "piece",

        sellingPrice:
          Number(
            product.sellingPrice || 0
          ),

        stock: stock,

        gstEnabled:
          Boolean(
            product.gstEnabled
          ),

        gstRate:
          Number(
            product.gstRate || 0
          ),

        /*
          IMPORTANT:
          Quantity is STRING so
          Backspace can completely
          clear the input.
        */
        quantity: "1",
      },
    ]);
  };

  /* =====================================================
     INCREASE QTY
  ===================================================== */

  const increaseQty = (productId) => {
    setError("");

    setCart((previous) =>
      previous.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const currentQty =
          Number(
            item.quantity || 0
          );

        if (
          currentQty >=
          item.stock
        ) {
          setError(
            `${item.name} - maximum stock ${item.stock}.`
          );

          return item;
        }

        return {
          ...item,
          quantity: String(
            currentQty + 1
          ),
        };
      })
    );
  };

  /* =====================================================
     DECREASE QTY
  ===================================================== */

  const decreaseQty = (productId) => {
    setError("");

    setCart((previous) =>
      previous.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const currentQty =
          Number(
            item.quantity || 0
          );

        if (currentQty <= 1) {
          return {
            ...item,
            quantity: "1",
          };
        }

        return {
          ...item,
          quantity: String(
            currentQty - 1
          ),
        };
      })
    );
  };

  /* =====================================================
     QTY CHANGE
     
     THIS FIXES BACKSPACE PROBLEM
  ===================================================== */

  const handleQtyChange = (
    productId,
    value
  ) => {
    /*
      Allow completely empty value.
      This is the important fix.
    */

    if (value === "") {
      setCart((previous) =>
        previous.map((item) =>
          item.productId ===
          productId
            ? {
                ...item,
                quantity: "",
              }
            : item
        )
      );

      return;
    }

    /*
      Only numbers.
    */

    if (!/^\d+$/.test(value)) {
      return;
    }

    const quantity =
      Number(value);

    const product =
      cart.find(
        (item) =>
          item.productId ===
          productId
      );

    if (!product) {
      return;
    }

    if (
      quantity >
      Number(product.stock)
    ) {
      setError(
        `${product.name} - stock ${product.stock} ${product.unit} மட்டுமே உள்ளது.`
      );

      setCart((previous) =>
        previous.map((item) =>
          item.productId ===
          productId
            ? {
                ...item,
                quantity:
                  String(
                    product.stock
                  ),
              }
            : item
        )
      );

      return;
    }

    setError("");

    setCart((previous) =>
      previous.map((item) =>
        item.productId ===
        productId
          ? {
              ...item,
              quantity: value,
            }
          : item
      )
    );
  };

  /* =====================================================
     QTY BLUR
  ===================================================== */

  const handleQtyBlur = (
    productId
  ) => {
    setCart((previous) =>
      previous.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        /*
          If user completely deleted
          quantity, set it to 1.
        */

        if (
          item.quantity === "" ||
          Number(item.quantity) < 1
        ) {
          return {
            ...item,
            quantity: "1",
          };
        }

        const quantity =
          Math.min(
            Number(item.quantity),
            Number(item.stock)
          );

        return {
          ...item,
          quantity:
            String(quantity),
        };
      })
    );
  };

  /* =====================================================
     REMOVE PRODUCT
  ===================================================== */

  const removeProduct = (
    productId
  ) => {
    setCart((previous) =>
      previous.filter(
        (item) =>
          item.productId !==
          productId
      )
    );
  };

  /* =====================================================
     CALCULATE BILL
  ===================================================== */

  const bill = useMemo(() => {
    let subtotal = 0;
    let gst = 0;

    const items = cart.map(
      (item) => {
        const quantity =
          Number(
            item.quantity || 0
          );

        const itemSubtotal =
          Number(
            item.sellingPrice
          ) * quantity;

        const applyGST =
          gstEnabled &&
          item.gstEnabled;

        const gstRate =
          applyGST
            ? Number(
                item.gstRate || 0
              )
            : 0;

        const gstAmount =
          itemSubtotal *
          (gstRate / 100);

        const itemTotal =
          itemSubtotal +
          gstAmount;

        subtotal +=
          itemSubtotal;

        gst += gstAmount;

        return {
          ...item,

          numericQuantity:
            quantity,

          itemSubtotal:
            itemSubtotal,

          gstRate:
            gstRate,

          gstAmount:
            gstAmount,

          itemTotal:
            itemTotal,
        };
      }
    );

    const discountValue =
      Math.max(
        0,
        Number(discount || 0)
      );

    const totalBeforeDiscount =
      subtotal + gst;

    const finalDiscount =
      Math.min(
        discountValue,
        totalBeforeDiscount
      );

    const grandTotal =
      Math.max(
        0,
        totalBeforeDiscount -
          finalDiscount
      );

    const enteredPaid =
      Math.max(
        0,
        Number(
          paidAmount || 0
        )
      );

    const paid =
      Math.min(
        enteredPaid,
        grandTotal
      );

    const due =
      Math.max(
        0,
        grandTotal - paid
      );

    const change =
      Math.max(
        0,
        enteredPaid -
          grandTotal
      );

    return {
      items,

      subtotal,

      gst,

      discount:
        finalDiscount,

      grandTotal,

      paid,

      due,

      change,
    };
  }, [
    cart,
    gstEnabled,
    discount,
    paidAmount,
  ]);

  /* =====================================================
     SAVE BILL
  ===================================================== */

  const saveBill = async () => {
    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError(
        "முதலில் product add பண்ணுங்க."
      );
      return;
    }

    /*
      Validate quantity
    */

    for (const item of cart) {
      const quantity =
        Number(
          item.quantity || 0
        );

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        setError(
          `${item.name} - valid QTY enter பண்ணுங்க.`
        );
        return;
      }

      if (
        quantity >
        Number(item.stock)
      ) {
        setError(
          `${item.name} - stock ${item.stock} மட்டுமே உள்ளது.`
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/bills`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              customerName:
                customerName.trim() ||
                "Walk-in Customer",

              customerPhone:
                customerPhone.trim(),

              items:
                bill.items.map(
                  (item) => ({
                    product:
                      item.productId,

                    quantity:
                      item.numericQuantity,
                  })
                ),

              discount:
                bill.discount,

              paymentMethod:
                paymentMethod,

              paidAmount:
                bill.paid,

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
            "Bill save ஆகவில்லை."
        );
      }

      setLastBill(
        data.bill
      );

      setSuccess(
        `${data.bill?.billNumber || "Bill"} successfully saved.`
      );

      /*
        Reset current bill
      */

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setSearch("");
      setDiscount("");
      setPaidAmount("");
      setPaymentMethod("CASH");
      setNotes("");

      /*
        Reload stock
      */

      await loadProducts();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     PRINT 58MM THERMAL BILL
  ===================================================== */

  const printBill = () => {
    if (!lastBill) {
      setError("முதலில் bill save பண்ணுங்க.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=420,height=700"
    );

    if (!printWindow) {
      setError(
        "Print window open ஆகவில்லை. Browser popup permission check பண்ணுங்க."
      );
      return;
    }

    /*
      IMPORTANT:
      The POST /bills response may return totals using
      different field names. Use the exact frontend
      calculation as a fallback so no amount is blank.
    */

    const savedItems =
      Array.isArray(lastBill.items)
        ? lastBill.items
        : [];

    const calculatedItems =
      savedItems.map((item) => {
        const quantity = Number(
          item.quantity ??
          item.numericQuantity ??
          0
        );

        const price = Number(
          item.sellingPrice ??
          item.price ??
          0
        );

        const itemSubtotal = Number(
          item.itemSubtotal ??
          item.subtotal ??
          price * quantity
        );

        const gstAmount = Number(
          item.gstAmount ?? 0
        );

        const itemTotal = Number(
          item.itemTotal ??
          item.total ??
          item.totalAmount ??
          itemSubtotal + gstAmount
        );

        return {
          ...item,
          quantity,
          price,
          itemSubtotal,
          gstAmount,
          itemTotal,
        };
      });

    const calculatedSubtotal =
      calculatedItems.reduce(
        (sum, item) =>
          sum + item.itemSubtotal,
        0
      );

    const calculatedGst =
      calculatedItems.reduce(
        (sum, item) =>
          sum + item.gstAmount,
        0
      );

    const subtotal = Number(
      lastBill.subtotal ??
      lastBill.subTotal ??
      lastBill.totalBeforeDiscount ??
      calculatedSubtotal
    );

    const gst = Number(
      lastBill.gst ??
      lastBill.gstAmount ??
      calculatedGst
    );

    const discountValue = Number(
      lastBill.discount ??
      lastBill.discountAmount ??
      0
    );

    const calculatedGrandTotal = Math.max(
      0,
      subtotal + gst - discountValue
    );

    const grandTotal = Number(
      lastBill.grandTotal ??
      lastBill.total ??
      lastBill.totalAmount ??
      calculatedGrandTotal
    );

    const paid = Number(
      lastBill.paid ??
      lastBill.paidAmount ??
      lastBill.amountPaid ??
      0
    );

    const due = Math.max(
      0,
      Number(
        lastBill.due ??
        lastBill.dueAmount ??
        grandTotal - paid
      )
    );

    const customer =
      lastBill.customerName ||
      "Walk-in Customer";

    const phone =
      lastBill.customerPhone ||
      "";

    const billNumber =
      lastBill.billNumber ||
      "BILL";

    const payment =
      lastBill.paymentMethod ||
      "CASH";

    const createdAt =
      lastBill.createdAt
        ? new Date(lastBill.createdAt)
        : new Date();

    const dateText =
      createdAt.toLocaleDateString("en-IN");

    const timeText =
      createdAt.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    const escapeHTML = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const itemRows = calculatedItems
      .map((item) => `
        <div class="item">
          <div class="item-name">
            ${escapeHTML(item.name || "Product")}
          </div>

          <div class="item-line">
            <span>
              ${item.quantity} × ₹${money(item.price)}
            </span>

            <strong>
              ₹${money(item.itemTotal)}
            </strong>
          </div>
        </div>
      `)
      .join("");

    const dueHTML =
      due > 0
        ? `
          <div class="amount-row">
            <span>Due</span>
            <strong>₹${money(due)}</strong>
          </div>
        `
        : "";

    const notes =
      String(lastBill.notes || "").trim();

    const notesHTML =
      notes
        ? `
          <div class="notes">
            <strong>Notes</strong>
            <div>${escapeHTML(notes)}</div>
          </div>
        `
        : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHTML(billNumber)}</title>

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
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body {
              padding: 3mm 3.5mm;
              font-size: 10px;
              line-height: 1.3;
            }

            .receipt {
              width: 100%;
            }

            .header {
              text-align: center;
              padding-bottom: 7px;
              border-bottom: 1px dashed #000;
            }

            .store-name {
              margin: 0;
              font-size: 21px;
              line-height: 1.05;
              font-weight: 900;
              letter-spacing: .3px;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 7px 0;
            }

            .meta {
              font-size: 9.5px;
            }

            .meta-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 6px;
              padding: 1.5px 0;
            }

            .meta-row span:first-child {
              font-weight: 800;
            }

            .meta-row span:last-child {
              text-align: right;
              font-weight: 700;
              word-break: break-word;
            }

            .customer {
              margin-top: 3px;
            }

            .section-title {
              margin: 5px 0 2px;
              font-size: 9px;
              font-weight: 900;
            }

            .column-head {
              display: grid;
              grid-template-columns: 1fr 28px 45px;
              gap: 3px;
              padding: 4px 0;
              border-bottom: 1px solid #000;
              font-size: 8.5px;
              font-weight: 900;
            }

            .column-head span:nth-child(n+2) {
              text-align: right;
            }

            .item {
              padding: 4px 0;
              border-bottom: 1px dotted #777;
            }

            .item-name {
              font-size: 10.5px;
              font-weight: 800;
              line-height: 1.25;
              word-break: break-word;
            }

            .item-line {
              display: flex;
              justify-content: space-between;
              gap: 5px;
              margin-top: 2px;
              font-size: 9.5px;
            }

            .item-line strong {
              white-space: nowrap;
            }

            .summary {
              margin-top: 6px;
            }

            .amount-row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              padding: 2px 0;
              font-size: 10px;
            }

            .grand-total {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              margin: 5px 0;
              padding: 5px 0;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              font-size: 13px;
              font-weight: 900;
            }

            .payment {
              margin-top: 5px;
              font-size: 10px;
              font-weight: 800;
            }

            .notes {
              margin-top: 6px;
              padding-top: 5px;
              border-top: 1px dotted #777;
              font-size: 9px;
            }

            .notes div {
              margin-top: 2px;
              word-break: break-word;
            }

            .footer {
              margin-top: 10px;
              padding-top: 7px;
              border-top: 1px dashed #000;
              text-align: center;
              font-size: 9px;
              font-weight: 700;
              line-height: 1.5;
            }

            @media print {
              html,
              body {
                width: 58mm;
                margin: 0;
                padding: 0;
              }

              body {
                padding: 3mm 3.5mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">

            <div class="header">
              <div class="store-name">
                HASIF STORE
              </div>
            </div>

            <div class="meta">

              <div class="meta-row">
                <span>Bill No</span>
                <span>${escapeHTML(billNumber)}</span>
              </div>

              <div class="meta-row">
                <span>Date</span>
                <span>${dateText}</span>
              </div>

              <div class="meta-row">
                <span>Time</span>
                <span>${timeText}</span>
              </div>

              <div class="meta-row">
                <span>Payment</span>
                <span>${escapeHTML(payment)}</span>
              </div>

            </div>

            <div class="customer">

              <div class="meta-row">
                <span>Customer</span>
                <span>${escapeHTML(customer)}</span>
              </div>

              ${
                phone
                  ? `
                    <div class="meta-row">
                      <span>Phone</span>
                      <span>${escapeHTML(phone)}</span>
                    </div>
                  `
                  : ""
              }

            </div>

            <div class="divider"></div>

            <div class="column-head">
              <span>Product</span>
              <span>Qty</span>
              <span>Total</span>
            </div>

            ${itemRows}

            <div class="summary">

              <div class="amount-row">
                <span>Subtotal</span>
                <strong>
                  ₹${money(subtotal)}
                </strong>
              </div>

              <div class="amount-row">
                <span>GST</span>
                <strong>
                  ₹${money(gst)}
                </strong>
              </div>

              <div class="amount-row">
                <span>Discount</span>
                <strong>
                  ₹${money(discountValue)}
                </strong>
              </div>

              <div class="grand-total">
                <span>Grand Total</span>
                <strong>
                  ₹${money(grandTotal)}
                </strong>
              </div>

              <div class="amount-row">
                <span>Paid</span>
                <strong>
                  ₹${money(paid)}
                </strong>
              </div>

              ${dueHTML}

            </div>

            ${notesHTML}

            <div class="payment">
              Payment: ${escapeHTML(payment)}
            </div>

            <div class="footer">
              THANK YOU!
              <br />
              HASIF STORE
            </div>

          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 350);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    setError("");
  };

  /* =====================================================
     CLEAR
  ===================================================== */

  const clearBill = () => {
    if (
      cart.length > 0
    ) {
      const confirmClear =
        window.confirm(
          "Current bill clear பண்ணவா?"
        );

      if (!confirmClear) {
        return;
      }
    }

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setSearch("");
    setDiscount("");
    setPaidAmount("");
    setPaymentMethod("CASH");
    setNotes("");
    setError("");
    setSuccess("");
  };

  /* =====================================================
     MONEY
  ===================================================== */

  const money = (value) => {
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

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .billing-page {
          min-height: 100vh;
          padding: 25px 30px 40px;
        }

        .billing-container {
          width: 100%;
          max-width: 1450px;
          margin: auto;
        }

        /* =================================================
           HEADER
        ================================================= */

        .billing-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .billing-eyebrow {
          color: #555;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1.3px;
          margin-bottom: 7px;
        }

        .billing-header h1 {
          margin: 0;
          color: #111;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -1.4px;
        }

        .billing-header p {
          margin-top: 8px;
          color: #444;
          font-size: 14px;
        }

        .billing-header-buttons {
          display: flex;
          gap: 8px;
        }

        .billing-button {
          height: 42px;
          padding: 0 14px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          border-radius: 11px;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;
          transition: .2s;
        }

        .billing-clear-button {
          border:
            1px solid
            rgba(0,0,0,.07);

          background:
            rgba(255,255,255,.7);

          color: #555;
        }

        .billing-save-top {
          border: none;
          background: #111;
          color: #fff;
        }

        .billing-button:hover {
          transform: translateY(-1px);
        }

        /* =================================================
           MESSAGES
        ================================================= */

        .billing-message {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 11px 13px;
          margin-bottom: 12px;

          border-radius: 11px;

          font-size: 14px;
          font-weight: 750;
        }

        .billing-error {
          background:
            rgba(0,0,0,.055);
          color: #333;
        }

        .billing-success {
          background:
            rgba(255,255,255,.75);

          border:
            1px solid
            rgba(0,0,0,.05);

          color: #333;
        }

        /* =================================================
           MAIN
        ================================================= */

        .billing-layout {
          display: grid;

          grid-template-columns:
            minmax(0, 1.7fr)
            minmax(320px, .75fr);

          gap: 17px;
          align-items: start;
        }

        .billing-card {
          border:
            1px solid
            rgba(255,255,255,.9);

          border-radius: 20px;

          background:
            rgba(255,255,255,.66);

          backdrop-filter:
            blur(25px);

          -webkit-backdrop-filter:
            blur(25px);

          box-shadow:
            0 18px 50px
            rgba(0,0,0,.045);

          overflow: hidden;
        }

        /* =================================================
           CUSTOMER
        ================================================= */

        .customer-section {
          padding: 16px;

          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;

          border-bottom:
            1px solid
            rgba(0,0,0,.055);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          display: flex;
          align-items: center;
          gap: 5px;

          color: #555;

          font-size: 14px;
          font-weight: 850;
        }

        .field input,
        .field textarea {
          width: 100%;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 10px;

          background:
            rgba(255,255,255,.78);

          outline: none;

          font-family: inherit;
          font-size: 14px;

          color: #222;
        }

        .field input {
          height: 42px;
          padding: 0 11px;
        }

        .field textarea {
          min-height: 65px;
          padding: 10px;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #222;

          box-shadow:
            0 0 0 3px
            rgba(0,0,0,.035);
        }

        /* =================================================
           PRODUCT SEARCH
        ================================================= */

        .search-section {
          padding: 16px;

          border-bottom:
            1px solid
            rgba(0,0,0,.055);
        }

        .search-box {
          position: relative;
        }

        .search-box > svg {
          position: absolute;

          left: 13px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #555;
        }

        .search-input {
          width: 100%;
          height: 46px;

          padding:
            0 13px 0 40px;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 12px;

          outline: none;

          background:
            rgba(255,255,255,.8);

          color: #222;

          font-size: 14px;
        }

        .search-input:focus {
          border-color: #222;
        }

        .search-results {
          position: absolute;

          z-index: 20;

          left: 0;
          right: 0;
          top: 52px;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.95);

          border-radius: 13px;

          background:
            rgba(255,255,255,.96);

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 20px 50px
            rgba(0,0,0,.14);
        }

        .search-result {
          width: 100%;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 11px 12px;

          border: none;

          border-bottom:
            1px solid
            rgba(0,0,0,.05);

          background: transparent;

          text-align: left;

          cursor: pointer;
        }

        .search-result:hover {
          background:
            rgba(0,0,0,.035);
        }

        .result-icon {
          width: 35px;
          height: 35px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(0,0,0,.045);

          color: #555;
        }

        .result-info {
          flex: 1;
          min-width: 0;
        }

        .result-name {
          overflow: hidden;

          color: #222;

          font-size: 14px;
          font-weight: 850;

          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .result-meta {
          margin-top: 3px;

          color: #555;

          font-size: 14px;
        }

        .result-price {
          color: #111;

          font-size: 14px;
          font-weight: 850;
        }

        /* =================================================
           BILL ITEMS
        ================================================= */

        .items-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 15px 16px 10px;
        }

        .items-title {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #222;

          font-size: 14px;
          font-weight: 850;
        }

        .items-count {
          min-width: 21px;
          height: 21px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0 6px;

          border-radius: 99px;

          background:
            rgba(0,0,0,.055);

          color: #555;

          font-size: 14px;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .billing-table {
          width: 100%;
          min-width: 760px;

          border-collapse: collapse;
        }

        .billing-table th {
          height: 38px;

          padding: 0 16px;

          color: #555;

          text-align: left;

          font-size: 14px;
          font-weight: 850;

          letter-spacing: .7px;
          text-transform: uppercase;
        }

        .billing-table td {
          padding: 12px 16px;

          border-bottom:
            1px solid
            rgba(0,0,0,.055);

          color: #555;

          font-size: 14px;
        }

        /* LIGHT LINE UNDER EVERY PRODUCT */

        .billing-table tbody tr {
          border-bottom:
            1px solid
            rgba(0,0,0,.055);
        }

        .billing-table tbody tr:last-child {
          border-bottom: none;
        }

        .item-name {
          color: #222;

          font-size: 14px;
          font-weight: 850;
        }

        .item-barcode {
          margin-top: 3px;

          color: #555;

          font-size: 14px;
        }

        /* =================================================
           QTY
        ================================================= */

        .qty-control {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .qty-button {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 8px;

          background:
            rgba(255,255,255,.8);

          color: #555;

          cursor: pointer;
        }

        .qty-button:hover {
          background: #111;
          color: #fff;
        }

        .qty-input {
          width: 48px;
          height: 28px;

          padding: 0 4px;

          border:
            1px solid
            rgba(0,0,0,.08);

          border-radius: 8px;

          outline: none;

          background:
            rgba(255,255,255,.9);

          color: #111;

          text-align: center;

          font-family: inherit;

          font-size: 14px;
          font-weight: 850;
        }

        .qty-input:focus {
          border-color: #111;

          box-shadow:
            0 0 0 2px
            rgba(0,0,0,.035);
        }

        /* Remove number arrows */

        .qty-input::-webkit-inner-spin-button,
        .qty-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .qty-input {
          appearance: textfield;
          -moz-appearance: textfield;
        }

        .delete-button {
          width: 29px;
          height: 29px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid
            rgba(0,0,0,.06);

          border-radius: 8px;

          background:
            rgba(255,255,255,.7);

          color: #333;

          cursor: pointer;
        }

        .delete-button:hover {
          background: #111;
          color: #fff;
        }

        /* =================================================
           EMPTY
        ================================================= */

        .empty-items {
          min-height: 280px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .empty-icon {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background:
            rgba(0,0,0,.045);

          color: #333;
        }

        .empty-items h3 {
          margin-top: 12px;

          color: #333;

          font-size: 14px;
        }

        .empty-items p {
          margin-top: 5px;

          color: #555;

          font-size: 14px;
        }

        /* =================================================
           SUMMARY
        ================================================= */

        .summary-card {
          position: sticky;
          top: 18px;

          padding: 17px;
        }

        .summary-title {
          display: flex;
          align-items: center;
          gap: 9px;

          padding-bottom: 14px;

          border-bottom:
            1px solid
            rgba(0,0,0,.055);
        }

        .summary-icon {
          width: 37px;
          height: 37px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #111;
          color: #fff;
        }

        .summary-title h2 {
          color: #222;
          font-size: 14px;
        }

        .summary-title p {
          margin-top: 3px;

          color: #555;

          font-size: 14px;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 8px 0;

          color: #333;

          font-size: 14px;
        }

        .summary-row strong {
          color: #333;
        }

        /* =================================================
           GST
        ================================================= */

        .gst-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin: 8px 0;

          padding: 10px 11px;

          border:
            1px solid
            rgba(0,0,0,.055);

          border-radius: 11px;

          background:
            rgba(0,0,0,.018);
        }

        .gst-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gst-icon {
          width: 29px;
          height: 29px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(0,0,0,.05);

          color: #555;
        }

        .gst-left strong {
          display: block;

          color: #333;

          font-size: 14px;
        }

        .gst-left span {
          display: block;

          margin-top: 2px;

          color: #555;

          font-size: 14px;
        }

        .switch {
          position: relative;

          width: 39px;
          height: 21px;

          border: none;

          border-radius: 99px;

          background:
            rgba(0,0,0,.12);

          cursor: pointer;
        }

        .switch.active {
          background: #111;
        }

        .switch-dot {
          position: absolute;

          left: 3px;
          top: 3px;

          width: 15px;
          height: 15px;

          border-radius: 50%;

          background: #fff;

          transition: .2s;
        }

        .switch.active .switch-dot {
          transform:
            translateX(18px);
        }

        /* =================================================
           DISCOUNT
        ================================================= */

        .discount-section {
          margin-top: 5px;
        }

        .discount-section label {
          display: block;

          margin-bottom: 6px;

          color: #555;

          font-size: 14px;
          font-weight: 850;
        }

        .discount-input {
          width: 100%;
          height: 39px;

          padding: 0 10px;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 10px;

          outline: none;

          background:
            rgba(255,255,255,.75);

          font-family: inherit;
          font-size: 14px;
        }

        /* =================================================
           TOTAL
        ================================================= */

        .grand-total {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 11px;
          padding: 14px 0;

          border-top:
            1px solid
            rgba(0,0,0,.09);

          border-bottom:
            1px solid
            rgba(0,0,0,.09);
        }

        .grand-total span {
          color: #444;

          font-size: 14px;
          font-weight: 850;
        }

        .grand-total strong {
          color: #111;

          font-size: 21px;

          letter-spacing: -.7px;
        }

        /* =================================================
           PAYMENT
        ================================================= */

        .payment-section {
          margin-top: 14px;
        }

        .payment-title {
          margin-bottom: 7px;

          color: #555;

          font-size: 14px;
          font-weight: 850;
        }

        .payment-buttons {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 6px;
        }

        .payment-button {
          height: 35px;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 9px;

          background:
            rgba(255,255,255,.7);

          color: #333;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;
        }

        .payment-button.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .paid-section {
          margin-top: 10px;
        }

        .paid-section label {
          display: block;

          margin-bottom: 6px;

          color: #555;

          font-size: 14px;
          font-weight: 850;
        }

        .paid-input {
          width: 100%;
          height: 41px;

          padding: 0 10px;

          border:
            1px solid
            rgba(0,0,0,.07);

          border-radius: 10px;

          outline: none;

          background:
            rgba(255,255,255,.8);

          font-family: inherit;
          font-size: 14px;
          font-weight: 750;
        }

        .payment-result {
          margin-top: 8px;

          padding: 10px;

          border-radius: 10px;

          background:
            rgba(0,0,0,.025);
        }

        .result-row {
          display: flex;
          justify-content: space-between;

          padding: 3px 0;

          color: #333;

          font-size: 14px;
        }

        .result-row strong {
          color: #222;
        }

        /* =================================================
           NOTES
        ================================================= */

        .notes-section {
          margin-top: 13px;
        }

        /* =================================================
           SAVE
        ================================================= */

        .save-button {
          width: 100%;
          height: 47px;

          margin-top: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border: none;
          border-radius: 12px;

          background: #111;
          color: #fff;

          font-size: 14px;
          font-weight: 850;

          cursor: pointer;

          box-shadow:
            0 12px 25px
            rgba(0,0,0,.12);

          transition: .2s;
        }

        .save-button:hover {
          transform: translateY(-1px);
        }

        .save-button:disabled {
          opacity: .45;
          cursor: not-allowed;
          transform: none;
        }

        /* =================================================
           LAST BILL
        ================================================= */

        .last-bill {
          margin-top: 10px;

          padding: 11px;

          border:
            1px solid
            rgba(0,0,0,.055);

          border-radius: 11px;

          background:
            rgba(255,255,255,.65);
        }

        .last-bill-label {
          color: #555;

          font-size: 14px;
          font-weight: 850;

          letter-spacing: .6px;
          text-transform: uppercase;
        }

        .last-bill-number {
          margin-top: 4px;

          color: #222;

          font-size: 14px;
          font-weight: 850;
        }

        .last-bill-total {
          margin-top: 3px;

          color: #333;

          font-size: 14px;
        }

        .print-bill-button {
          width: 100%;
          height: 38px;
          margin-top: 10px;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          border: 1px solid #111;
          border-radius: 9px;

          background: #111;
          color: #fff;

          font-family: inherit;
          font-size: 14px;
          font-weight: 850;

          cursor: pointer;
          transition: .2s;
        }

        .print-bill-button:hover {
          background: #2b2b2b;
        }

        @media print {
          .print-bill-button {
            display: none !important;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 900px) {

          .billing-page {
            padding:
              20px 17px 35px;
          }

          .billing-layout {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }

          .billing-header {
            flex-direction: column;
          }

          .billing-header-buttons {
            width: 100%;
          }

          .billing-button {
            flex: 1;
          }

        }

        @media (max-width: 600px) {

          .billing-page {
            padding:
              16px 11px 30px;
          }

          .billing-header h1 {
            font-size: 27px;
          }

          .customer-section {
            grid-template-columns: 1fr;
          }

          .billing-card {
            border-radius: 17px;
          }

          .summary-card {
            padding: 14px;
          }

        }

      `}</style>

      <div className="billing-page">

        <div className="billing-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="billing-header">

            <div>

              <div className="billing-eyebrow">
                SALES & BILLING
              </div>

              <h1>
                Create Bill
              </h1>

              <p>
                Add products, collect payment
                and save the bill.
              </p>

            </div>

            <div className="billing-header-buttons">

              <button
                type="button"
                className="billing-button billing-clear-button"
                onClick={clearBill}
              >
                <RotateCcw
                  size={13}
                />

                Clear
              </button>

              <button
                type="button"
                className="billing-button billing-save-top"
                onClick={saveBill}
                disabled={
                  saving ||
                  cart.length === 0
                }
              >
                <Save
                  size={13}
                />

                {saving
                  ? "Saving..."
                  : "Save Bill"}
              </button>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="billing-message billing-error">

              <AlertCircle
                size={14}
              />

              {error}

            </div>
          )}

          {success && (
            <div className="billing-message billing-success">

              <CheckCircle2
                size={14}
              />

              {success}

            </div>
          )}

          {/* =================================================
              MAIN LAYOUT
          ================================================= */}

          <div className="billing-layout">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="billing-card">

              {/* CUSTOMER */}

              <div className="customer-section">

                <div className="field">

                  <label>
                    <User size={11} />
                    Customer Name
                  </label>

                  <input
                    type="text"
                    placeholder="Walk-in Customer"
                    value={
                      customerName
                    }
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    <Phone size={11} />
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Optional"
                    value={
                      customerPhone
                    }
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* PRODUCT SEARCH */}

              <div className="search-section">

                <div className="search-box">

                  <Search
                    size={17}
                  />

                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search product or scan barcode..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                  />

                  {search &&
                    searchResults.length >
                      0 && (

                    <div className="search-results">

                      {searchResults.map(
                        (product) => (

                          <button
                            type="button"
                            className="search-result"
                            key={
                              product._id
                            }
                            onClick={() =>
                              addProduct(
                                product
                              )
                            }
                          >

                            <div className="result-icon">
                              <Package
                                size={15}
                              />
                            </div>

                            <div className="result-info">

                              <div className="result-name">
                                {
                                  product.name
                                }
                              </div>

                              <div className="result-meta">

                                Stock{" "}
                                {
                                  product.stock
                                }{" "}
                                {
                                  product.unit ||
                                  "piece"
                                }

                                {product.gstEnabled &&
                                  ` • GST ${product.gstRate}%`}

                              </div>

                            </div>

                            <div className="result-price">
                              ₹
                              {money(
                                product.sellingPrice
                              )}
                            </div>

                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>

                {search &&
                  !loading &&
                  searchResults.length ===
                    0 && (

                    <div
                      style={{
                        marginTop:
                          "8px",
                        color:
                          "#999",
                        fontSize:
                          "8px",
                      }}
                    >
                      Product கிடைக்கவில்லை.
                    </div>

                  )}

              </div>

              {/* ITEMS HEADER */}

              <div className="items-header">

                <div className="items-title">

                  <ShoppingCart
                    size={14}
                  />

                  Bill Items

                  <span className="items-count">
                    {cart.length}
                  </span>

                </div>

              </div>

              {/* ITEMS */}

              {cart.length ===
              0 ? (

                <div className="empty-items">

                  <div className="empty-icon">
                    <Receipt
                      size={25}
                    />
                  </div>

                  <h3>
                    No products added
                  </h3>

                  <p>
                    மேலே product search
                    பண்ணி add செய்யுங்கள்.
                  </p>

                </div>

              ) : (

                <div className="table-wrap">

                  <table className="billing-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          QTY
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          GST
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {bill.items.map(
                        (item) => (

                          <tr
                            key={
                              item.productId
                            }
                          >

                            <td>

                              <div className="item-name">
                                {
                                  item.name
                                }
                              </div>

                              <div className="item-barcode">
                                {
                                  item.barcode ||
                                  "No barcode"
                                }
                              </div>

                            </td>

                            {/* =================================
                                QTY
                            ================================= */}

                            <td>

                              <div className="qty-control">

                                <button
                                  type="button"
                                  className="qty-button"
                                  onClick={() =>
                                    decreaseQty(
                                      item.productId
                                    )
                                  }
                                >
                                  <Minus
                                    size={11}
                                  />
                                </button>

                                <input
                                  className="qty-input"
                                  type="text"
                                  inputMode="numeric"
                                  value={
                                    item.quantity
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleQtyChange(
                                      item.productId,
                                      event.target
                                        .value
                                    )
                                  }
                                  onBlur={() =>
                                    handleQtyBlur(
                                      item.productId
                                    )
                                  }
                                />

                                <button
                                  type="button"
                                  className="qty-button"
                                  onClick={() =>
                                    increaseQty(
                                      item.productId
                                    )
                                  }
                                >
                                  <Plus
                                    size={11}
                                  />
                                </button>

                              </div>

                            </td>

                            <td>
                              ₹
                              {money(
                                item.sellingPrice
                              )}
                            </td>

                            <td>

                              {item.gstRate >
                              0
                                ? `${item.gstRate}%`
                                : "OFF"}

                            </td>

                            <td>

                              <strong
                                style={{
                                  color:
                                    "#111",
                                }}
                              >
                                ₹
                                {money(
                                  item.itemTotal
                                )}
                              </strong>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  removeProduct(
                                    item.productId
                                  )
                                }
                              >
                                <Trash2
                                  size={12}
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

            </div>

            {/* =================================================
                RIGHT SUMMARY
            ================================================= */}

            <div className="billing-card summary-card">

              {/* TITLE */}

              <div className="summary-title">

                <div className="summary-icon">

                  <Receipt
                    size={16}
                  />

                </div>

                <div>

                  <h2>
                    Bill Summary
                  </h2>

                  <p>
                    Check total before saving
                  </p>

                </div>

              </div>

              {/* SUBTOTAL */}

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {money(
                    bill.subtotal
                  )}
                </strong>

              </div>

              {/* GST */}

              <div className="gst-row">

                <div className="gst-left">

                  <div className="gst-icon">

                    <Percent
                      size={12}
                    />

                  </div>

                  <div>

                    <strong>
                      GST
                    </strong>

                    <span>
                      Apply product GST
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className={
                    `switch ${
                      gstEnabled
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setGstEnabled(
                      (previous) =>
                        !previous
                    )
                  }
                >

                  <span className="switch-dot" />

                </button>

              </div>

              <div className="summary-row">

                <span>
                  GST Amount
                </span>

                <strong>
                  ₹
                  {money(
                    bill.gst
                  )}
                </strong>

              </div>

              {/* DISCOUNT */}

              <div className="discount-section">

                <label>
                  Discount
                </label>

                <input
                  className="discount-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="₹ 0.00"
                  value={
                    discount
                  }
                  onChange={(event) =>
                    setDiscount(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* TOTAL */}

              <div className="grand-total">

                <span>
                  Grand Total
                </span>

                <strong>
                  ₹
                  {money(
                    bill.grandTotal
                  )}
                </strong>

              </div>

              {/* PAYMENT */}

              <div className="payment-section">

                <div className="payment-title">
                  PAYMENT METHOD
                </div>

                <div className="payment-buttons">

                  {PAYMENT_METHODS.map(
                    (method) => (

                      <button
                        type="button"
                        key={method}
                        className={
                          `payment-button ${
                            paymentMethod ===
                            method
                              ? "active"
                              : ""
                          }`
                        }
                        onClick={() =>
                          setPaymentMethod(
                            method
                          )
                        }
                      >
                        {method}
                      </button>

                    )
                  )}

                </div>

                <div className="paid-section">

                  <label>
                    Paid Amount
                  </label>

                  <input
                    className="paid-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="₹ 0.00"
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

                <div className="payment-result">

                  <div className="result-row">

                    <span>
                      Paid
                    </span>

                    <strong>
                      ₹
                      {money(
                        bill.paid
                      )}
                    </strong>

                  </div>

                  <div className="result-row">

                    <span>
                      Due
                    </span>

                    <strong>
                      ₹
                      {money(
                        bill.due
                      )}
                    </strong>

                  </div>

                  {bill.change >
                    0 && (

                    <div className="result-row">

                      <span>
                        Change
                      </span>

                      <strong>
                        ₹
                        {money(
                          bill.change
                        )}
                      </strong>

                    </div>

                  )}

                </div>

              </div>

              {/* NOTES */}

              <div className="notes-section">

                <div className="field">

                  <label>
                    Notes
                  </label>

                  <textarea
                    placeholder="Optional..."
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

              {/* SAVE */}

              <button
                type="button"
                className="save-button"
                onClick={saveBill}
                disabled={
                  saving ||
                  cart.length === 0
                }
              >

                <Save
                  size={15}
                />

                {saving
                  ? "Saving Bill..."
                  : "Save Bill"}

              </button>

              {/* LAST BILL */}

              {lastBill && (

                <div className="last-bill">

                  <div className="last-bill-label">
                    Last Saved Bill
                  </div>

                  <div className="last-bill-number">
                    {
                      lastBill.billNumber ||
                      "Saved"
                    }
                  </div>

                  <div className="last-bill-total">
                    Total ₹
                    {money(
                      lastBill.grandTotal
                    )}
                  </div>

                  <button
                    type="button"
                    className="print-bill-button"
                    onClick={printBill}
                  >
                    <Printer size={14} />
                    Print Bill
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Billing;