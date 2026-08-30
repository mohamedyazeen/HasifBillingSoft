import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Package,
  AlertTriangle,
  BarChart3,
  Plus,
  ArrowUpRight,
  ShoppingBag,
  Wallet,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    todaySales: 0,
    todayBills: 0,
    todayProfit: 0,
    lowStock: 0,
  });

  /* =====================================================
     LOAD USER + DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("hasif_user") || "{}"
      );

      setUser(storedUser);
    } catch (error) {
      console.error("User data error:", error);
      setUser({});
    }

    fetchDashboardData();
  }, []);

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */

  const fetchDashboardData = async () => {
    try {
      const token =
        localStorage.getItem("hasif_token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${API_URL}/products/low-stock`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const products =
          data.products || [];

        setLowStockProducts(products);

        setStats((prev) => ({
          ...prev,
          lowStock: products.length,
        }));
      } else if (response.status === 401) {
        localStorage.removeItem(
          "hasif_token"
        );

        localStorage.removeItem(
          "hasif_user"
        );

        navigate("/");
      }
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     GREETING
  ===================================================== */

  const getGreeting = () => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  /* =====================================================
     USER AVATAR
  ===================================================== */

  const userInitial = (
    user.userId || "A"
  )
    .charAt(0)
    .toUpperCase();

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <style>{`

        /* =================================================
           GLOBAL DASHBOARD FIX
        ================================================= */

        .dashboard-content,
        .dashboard-content * {
          box-sizing: border-box;
        }

        .dashboard-content {
          width: 100%;
          max-width: 1500px;

          min-width: 0;

          margin: 0 auto;

          padding:
            34px 36px 45px;

          overflow-x: hidden;

          color: #111111;
        }


        /* =================================================
           HEADER
        ================================================= */

        .dashboard-top {
          width: 100%;
          min-width: 0;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 25px;

          margin-bottom: 30px;
        }

        .dashboard-heading {
          min-width: 0;

          flex: 1;
        }

        .dashboard-eyebrow {
          margin: 0;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 1.6px;

          line-height: 1.4;

          color: #8a8a8a;

          text-transform: uppercase;
        }

        .dashboard-heading h1 {
          margin:
            7px 0 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 36px;

          line-height: 1.08;

          font-weight: 700;

          letter-spacing: -1.7px;

          color: #111111;
        }

        .dashboard-subtitle {
          margin:
            10px 0 0;

          font-size: 14px;

          line-height: 1.5;

          color: #777777;
        }


        /* =================================================
           USER
        ================================================= */

        .dashboard-user-box {
          display: flex;

          align-items: center;

          gap: 11px;

          flex-shrink: 0;

          padding-top: 2px;
        }

        .dashboard-user-info {
          min-width: 0;

          text-align: right;
        }

        .dashboard-user-info strong {
          display: block;

          max-width: 160px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 12px;

          font-weight: 800;

          color: #222222;
        }

        .dashboard-user-info span {
          display: block;

          margin-top: 3px;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 0.8px;

          color: #8d8d8d;

          text-transform: uppercase;
        }

        .dashboard-avatar {
          width: 44px;
          height: 44px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: #111111;

          color: #ffffff;

          font-size: 14px;

          font-weight: 800;

          box-shadow:
            0 10px 24px
            rgba(0, 0, 0, 0.14);
        }


        /* =================================================
           NEW BILL
        ================================================= */

        .new-bill-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          height: 46px;

          margin-top: 22px;

          padding:
            0 17px;

          border: none;

          border-radius: 13px;

          background: #111111;

          color: #ffffff;

          cursor: pointer;

          font-size: 13px;

          font-weight: 750;

          box-shadow:
            0 12px 28px
            rgba(0, 0, 0, 0.14);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .new-bill-button:hover {
          transform:
            translateY(-2px);

          background: #1d1d1d;

          box-shadow:
            0 16px 32px
            rgba(0, 0, 0, 0.18);
        }

        .new-bill-button:active {
          transform:
            translateY(0);
        }


        /* =================================================
           STAT CARDS
        ================================================= */

        .dashboard-stats {
          width: 100%;
          min-width: 0;

          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 16px;

          margin-bottom: 16px;
        }

        .dashboard-stat {
          position: relative;

          min-width: 0;

          min-height: 145px;

          padding: 21px;

          border:
            1px solid
            rgba(255, 255, 255, 0.9);

          border-radius: 21px;

          background:
            rgba(255, 255, 255, 0.62);

          backdrop-filter:
            blur(28px);

          -webkit-backdrop-filter:
            blur(28px);

          box-shadow:
            0 16px 40px
            rgba(0, 0, 0, 0.045),

            inset 0 1px 0
            rgba(255, 255, 255, 0.95);

          overflow: hidden;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .dashboard-stat:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 20px 45px
            rgba(0, 0, 0, 0.07),

            inset 0 1px 0
            rgba(255, 255, 255, 0.95);
        }

        .dashboard-stat-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;
        }

        .dashboard-stat-label {
          min-width: 0;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 11px;

          font-weight: 600;

          color: #777777;
        }

        .dashboard-stat-icon {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            rgba(0, 0, 0, 0.045);

          color: #444444;
        }

        .dashboard-stat-value {
          display: block;

          margin-top: 20px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 30px;

          line-height: 1;

          font-weight: 800;

          letter-spacing: -1px;

          color: #111111;
        }

        .dashboard-stat-note {
          display: block;

          margin-top: 8px;

          font-size: 10px;

          line-height: 1.4;

          color: #919191;
        }


        /* =================================================
           MAIN GRID
        ================================================= */

        .dashboard-main-grid {
          width: 100%;
          min-width: 0;

          display: grid;

          grid-template-columns:
            minmax(0, 1.7fr)
            minmax(280px, 1fr);

          gap: 16px;
        }


        /* =================================================
           PANELS
        ================================================= */

        .dashboard-panel {
          width: 100%;

          min-width: 0;

          border:
            1px solid
            rgba(255, 255, 255, 0.9);

          border-radius: 21px;

          background:
            rgba(255, 255, 255, 0.62);

          backdrop-filter:
            blur(28px);

          -webkit-backdrop-filter:
            blur(28px);

          box-shadow:
            0 16px 40px
            rgba(0, 0, 0, 0.045),

            inset 0 1px 0
            rgba(255, 255, 255, 0.95);

          overflow: hidden;
        }

        .dashboard-panel-header {
          width: 100%;

          min-width: 0;

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 15px;

          padding:
            22px 22px 0;
        }

        .dashboard-panel-header > div {
          min-width: 0;
        }

        .dashboard-panel-header h2 {
          margin:
            6px 0 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 20px;

          line-height: 1.2;

          font-weight: 700;

          letter-spacing: -0.5px;

          color: #111111;
        }

        .dashboard-panel-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          flex-shrink: 0;

          height: 36px;

          padding:
            0 11px;

          border:
            1px solid
            rgba(0, 0, 0, 0.08);

          border-radius: 10px;

          background:
            rgba(255, 255, 255, 0.75);

          color: #444444;

          cursor: pointer;

          font-size: 10px;

          font-weight: 750;

          white-space: nowrap;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .dashboard-panel-button:hover {
          background:
            rgba(0, 0, 0, 0.045);

          transform:
            translateY(-1px);
        }


        /* =================================================
           SALES
        ================================================= */

        .sales-overview {
          width: 100%;

          min-width: 0;

          min-height: 365px;

          padding:
            20px 22px 25px;
        }

        .sales-empty {
          min-height: 280px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding: 20px;

          text-align: center;
        }

        .sales-empty-icon {
          width: 62px;
          height: 62px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 15px;

          border-radius: 19px;

          background:
            rgba(0, 0, 0, 0.045);

          color: #555555;
        }

        .sales-empty h3 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 16px;

          color: #222222;
        }

        .sales-empty p {
          max-width: 320px;

          margin:
            8px auto 0;

          font-size: 11px;

          line-height: 1.55;

          color: #888888;
        }


        /* =================================================
           STOCK ALERTS
        ================================================= */

        .dashboard-alert-list {
          width: 100%;

          min-width: 0;

          padding:
            14px 20px 18px;
        }

        .dashboard-alert-item {
          width: 100%;
          min-width: 0;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          padding:
            14px 0;

          border-bottom:
            1px solid
            rgba(0, 0, 0, 0.045);
        }

        .dashboard-alert-item:last-child {
          border-bottom: none;
        }

        .dashboard-alert-product {
          min-width: 0;

          flex: 1;
        }

        .dashboard-alert-product strong {
          display: block;

          max-width: 100%;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #222222;

          font-size: 12px;

          font-weight: 700;
        }

        .dashboard-alert-product span {
          display: block;

          margin-top: 4px;

          color: #929292;

          font-size: 9px;
        }

        .dashboard-alert-stock {
          flex-shrink: 0;

          text-align: right;
        }

        .dashboard-alert-stock strong {
          display: block;

          color: #111111;

          font-size: 13px;

          font-weight: 800;
        }

        .dashboard-alert-stock span {
          display: block;

          margin-top: 3px;

          color: #8e8e8e;

          font-size: 8px;
        }

        .dashboard-alert-empty {
          min-height: 280px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          padding: 25px;

          text-align: center;

          color: #777777;
        }

        .dashboard-alert-empty-icon {
          width: 58px;
          height: 58px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 14px;

          border-radius: 18px;

          background:
            rgba(0, 0, 0, 0.045);

          color: #555555;
        }

        .dashboard-alert-empty h3 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 15px;

          color: #333333;
        }

        .dashboard-alert-empty p {
          max-width: 240px;

          margin:
            7px auto 0;

          font-size: 10px;

          line-height: 1.55;

          color: #8c8c8c;
        }


        /* =================================================
           QUICK ACTIONS
        ================================================= */

        .quick-actions-panel {
          width: 100%;

          min-width: 0;

          margin-top: 16px;

          padding-bottom: 21px;
        }

        .quick-actions-grid {
          width: 100%;
          min-width: 0;

          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 12px;

          padding:
            18px 22px 0;
        }

        .quick-action-card {
          width: 100%;
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 11px;

          padding: 14px;

          border:
            1px solid
            rgba(0, 0, 0, 0.055);

          border-radius: 15px;

          background:
            rgba(255, 255, 255, 0.5);

          cursor: pointer;

          text-align: left;

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .quick-action-card:hover {
          transform:
            translateY(-2px);

          background:
            rgba(255, 255, 255, 0.85);

          box-shadow:
            0 10px 24px
            rgba(0, 0, 0, 0.06);
        }

        .quick-action-icon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #111111;

          color: #ffffff;
        }

        .quick-action-text {
          min-width: 0;

          flex: 1;
        }

        .quick-action-text strong {
          display: block;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 12px;

          font-weight: 750;

          color: #202020;
        }

        .quick-action-text span {
          display: block;

          margin-top: 4px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 9px;

          color: #919191;
        }


        /* =================================================
           TABLET / SMALL LAPTOP
        ================================================= */

        @media (max-width: 1200px) {

          .dashboard-content {
            padding:
              28px 25px 40px;
          }

          .dashboard-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 900px) {

          .dashboard-content {
            padding:
              25px 20px 35px;
          }

          .dashboard-top {
            gap: 18px;
          }

          .dashboard-heading h1 {
            font-size: 32px;
          }

          .dashboard-stats {
            gap: 13px;
          }

          .dashboard-stat {
            min-height: 135px;

            padding: 18px;
          }

          .dashboard-stat-value {
            font-size: 28px;
          }

          .dashboard-panel-header {
            padding:
              20px 19px 0;
          }

          .sales-overview {
            padding:
              18px 19px 24px;
          }

          .quick-actions-grid {
            padding:
              17px 19px 0;
          }
        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 650px) {

          .dashboard-content {
            width: 100%;

            min-width: 0;

            padding:
              20px 14px 30px;

            overflow-x: hidden;
          }

          .dashboard-top {
            width: 100%;

            flex-direction: column;

            align-items: stretch;

            gap: 14px;

            margin-bottom: 24px;
          }

          .dashboard-heading {
            width: 100%;
          }

          .dashboard-eyebrow {
            font-size: 9px;

            letter-spacing: 1.4px;
          }

          .dashboard-heading h1 {
            margin-top: 6px;

            font-size: 29px;

            letter-spacing: -1.2px;
          }

          .dashboard-subtitle {
            margin-top: 8px;

            font-size: 13px;
          }

          .new-bill-button {
            width: 100%;

            height: 48px;

            margin-top: 17px;

            font-size: 13px;
          }

          .dashboard-user-box {
            width: 100%;

            justify-content: flex-start;

            padding-top: 0;
          }

          .dashboard-user-info {
            text-align: left;
          }

          .dashboard-user-info strong {
            max-width: 200px;
          }


          /* MOBILE STATS */

          .dashboard-stats {
            width: 100%;

            grid-template-columns: 1fr;

            gap: 11px;

            margin-bottom: 12px;
          }

          .dashboard-stat {
            width: 100%;

            min-height: 120px;

            padding: 18px;

            border-radius: 17px;
          }

          .dashboard-stat-value {
            margin-top: 17px;

            font-size: 27px;
          }

          .dashboard-stat-label {
            font-size: 11px;
          }

          .dashboard-stat-note {
            font-size: 10px;
          }


          /* MOBILE MAIN */

          .dashboard-main-grid {
            width: 100%;

            grid-template-columns: 1fr;

            gap: 12px;
          }

          .dashboard-panel {
            width: 100%;

            min-width: 0;

            border-radius: 17px;
          }

          .dashboard-panel-header {
            width: 100%;

            gap: 9px;

            padding:
              18px 16px 0;
          }

          .dashboard-panel-header h2 {
            font-size: 18px;
          }

          .dashboard-panel-button {
            height: 33px;

            padding:
              0 9px;

            font-size: 9px;
          }


          /* MOBILE SALES */

          .sales-overview {
            width: 100%;

            min-height: 275px;

            padding:
              15px 16px 20px;
          }

          .sales-empty {
            min-height: 220px;

            padding: 15px;
          }

          .sales-empty-icon {
            width: 55px;
            height: 55px;
          }

          .sales-empty h3 {
            font-size: 15px;
          }

          .sales-empty p {
            font-size: 10px;
          }


          /* MOBILE STOCK */

          .dashboard-alert-list {
            padding:
              10px 15px 15px;
          }

          .dashboard-alert-item {
            padding:
              12px 0;
          }

          .dashboard-alert-product strong {
            font-size: 11px;
          }

          .dashboard-alert-stock strong {
            font-size: 12px;
          }

          .dashboard-alert-empty {
            min-height: 220px;

            padding: 20px;
          }


          /* MOBILE QUICK ACTIONS */

          .quick-actions-panel {
            margin-top: 12px;

            padding-bottom: 17px;
          }

          .quick-actions-grid {
            width: 100%;

            grid-template-columns: 1fr;

            gap: 9px;

            padding:
              14px 16px 0;
          }

          .quick-action-card {
            width: 100%;

            padding: 13px;

            border-radius: 13px;
          }

          .quick-action-icon {
            width: 38px;
            height: 38px;
          }

          .quick-action-text strong {
            font-size: 11px;
          }

          .quick-action-text span {
            font-size: 9px;
          }
        }


        /* =================================================
           VERY SMALL PHONE
        ================================================= */

        @media (max-width: 400px) {

          .dashboard-content {
            padding:
              18px 11px 25px;
          }

          .dashboard-heading h1 {
            font-size: 26px;
          }

          .dashboard-stat {
            min-height: 115px;

            padding: 16px;
          }

          .dashboard-stat-value {
            font-size: 25px;
          }

          .dashboard-panel-header {
            padding:
              17px 14px 0;
          }

          .dashboard-panel-header h2 {
            font-size: 16px;
          }

          .dashboard-panel-button {
            padding:
              0 7px;

            font-size: 8px;
          }

          .sales-overview {
            padding:
              13px 14px 18px;
          }

          .quick-actions-grid {
            padding:
              13px 14px 0;
          }
        }

      `}</style>


      {/* =================================================
          DASHBOARD
      ================================================= */}

      <div className="dashboard-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-top">

          <div className="dashboard-heading">

            <p className="dashboard-eyebrow">
              Store Overview
            </p>

            <h1>
              {getGreeting()}
            </h1>

            <p className="dashboard-subtitle">
              Welcome back,{" "}
              {user.userId || "Admin"}
            </p>

            <button
              type="button"
              className="new-bill-button"
              onClick={() =>
                navigate("/billing")
              }
            >
              <Plus size={18} />
              New Bill
            </button>

          </div>


          {/* USER */}

          <div className="dashboard-user-box">

            <div className="dashboard-user-info">

              <strong>
                {user.userId || "Admin"}
              </strong>

              <span>
                {user.role || "Admin"}
              </span>

            </div>

            <div className="dashboard-avatar">
              {userInitial}
            </div>

          </div>

        </header>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          {/* SALES */}

          <div className="dashboard-stat">

            <div className="dashboard-stat-top">

              <span className="dashboard-stat-label">
                Today's Sales
              </span>

              <div className="dashboard-stat-icon">
                <BarChart3 size={18} />
              </div>

            </div>

            <strong className="dashboard-stat-value">
              ₹
              {stats.todaySales.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span className="dashboard-stat-note">
              Sales generated today
            </span>

          </div>


          {/* BILLS */}

          <div className="dashboard-stat">

            <div className="dashboard-stat-top">

              <span className="dashboard-stat-label">
                Today's Bills
              </span>

              <div className="dashboard-stat-icon">
                <Receipt size={18} />
              </div>

            </div>

            <strong className="dashboard-stat-value">
              {stats.todayBills}
            </strong>

            <span className="dashboard-stat-note">
              Bills created today
            </span>

          </div>


          {/* PROFIT */}

          <div className="dashboard-stat">

            <div className="dashboard-stat-top">

              <span className="dashboard-stat-label">
                Today's Profit
              </span>

              <div className="dashboard-stat-icon">
                <Wallet size={18} />
              </div>

            </div>

            <strong className="dashboard-stat-value">
              ₹
              {stats.todayProfit.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span className="dashboard-stat-note">
              Estimated profit
            </span>

          </div>


          {/* LOW STOCK */}

          <div className="dashboard-stat">

            <div className="dashboard-stat-top">

              <span className="dashboard-stat-label">
                Low Stock
              </span>

              <div className="dashboard-stat-icon">
                <AlertTriangle size={18} />
              </div>

            </div>

            <strong className="dashboard-stat-value">
              {stats.lowStock}
            </strong>

            <span className="dashboard-stat-note">
              Products need attention
            </span>

          </div>

        </section>


        {/* =================================================
            MAIN PANELS
        ================================================= */}

        <section className="dashboard-main-grid">


          {/* =================================================
              SALES OVERVIEW
          ================================================= */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <p className="dashboard-eyebrow">
                  Sales
                </p>

                <h2>
                  Sales Overview
                </h2>

              </div>

              <button
                type="button"
                className="dashboard-panel-button"
                onClick={() =>
                  navigate("/sales")
                }
              >
                View Sales
                <ArrowUpRight size={14} />
              </button>

            </div>


            <div className="sales-overview">

              <div className="sales-empty">

                <div className="sales-empty-icon">
                  <BarChart3 size={28} />
                </div>

                <h3>
                  No sales data yet
                </h3>

                <p>
                  Your sales analytics will
                  automatically appear here once
                  you start creating bills.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              STOCK ALERTS
          ================================================= */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <p className="dashboard-eyebrow">
                  Inventory
                </p>

                <h2>
                  Stock Alerts
                </h2>

              </div>

              <button
                type="button"
                className="dashboard-panel-button"
                onClick={() =>
                  navigate("/stock-alerts")
                }
              >
                View All
                <ArrowUpRight size={14} />
              </button>

            </div>


            {loading ? (

              <div className="dashboard-alert-empty">

                <Package size={28} />

                <p>
                  Checking inventory...
                </p>

              </div>

            ) : lowStockProducts.length === 0 ? (

              <div className="dashboard-alert-empty">

                <div className="dashboard-alert-empty-icon">
                  <Package size={26} />
                </div>

                <h3>
                  All stock levels are healthy
                </h3>

                <p>
                  No products have reached
                  their configured stock alert
                  level.
                </p>

              </div>

            ) : (

              <div className="dashboard-alert-list">

                {lowStockProducts
                  .slice(0, 5)
                  .map((product) => (

                    <div
                      key={product._id}
                      className="dashboard-alert-item"
                    >

                      <div className="dashboard-alert-product">

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          Alert at{" "}
                          {product.lowStockLevel}{" "}
                          {product.unit}
                        </span>

                      </div>


                      <div className="dashboard-alert-stock">

                        <strong>
                          {product.stock}
                        </strong>

                        <span>
                          {product.unit}
                        </span>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="dashboard-panel quick-actions-panel">

          <div className="dashboard-panel-header">

            <div>

              <p className="dashboard-eyebrow">
                Quick Actions
              </p>

              <h2>
                Store Management
              </h2>

            </div>

          </div>


          <div className="quick-actions-grid">


            {/* NEW BILL */}

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate("/billing")
              }
            >

              <div className="quick-action-icon">
                <Receipt size={19} />
              </div>

              <div className="quick-action-text">

                <strong>
                  New Bill
                </strong>

                <span>
                  Create customer bill
                </span>

              </div>

            </button>


            {/* PRODUCTS */}

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate("/products")
              }
            >

              <div className="quick-action-icon">
                <Package size={19} />
              </div>

              <div className="quick-action-text">

                <strong>
                  Products
                </strong>

                <span>
                  Manage inventory
                </span>

              </div>

            </button>


            {/* STOCK */}

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate("/stock-alerts")
              }
            >

              <div className="quick-action-icon">
                <AlertTriangle size={19} />
              </div>

              <div className="quick-action-text">

                <strong>
                  Stock Alerts
                </strong>

                <span>
                  Check low stock items
                </span>

              </div>

            </button>


            {/* SALES */}

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate("/sales")
              }
            >

              <div className="quick-action-icon">
                <ShoppingBag size={19} />
              </div>

              <div className="quick-action-text">

                <strong>
                  Sales
                </strong>

                <span>
                  View sales history
                </span>

              </div>

            </button>


          </div>

        </section>

      </div>
    </>
  );
}

export default Dashboard;