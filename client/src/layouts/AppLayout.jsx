import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  ShoppingCart,
  TriangleAlert,
  Truck,
  Settings,
  KeyRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [hasStockAlerts, setHasStockAlerts] =
    useState(false);
  // =====================================================
  // USER
  // =====================================================
  const userId =
    localStorage.getItem("hasif_userId") ||
    "hasif@store";
  // =====================================================
  // STOCK ALERT STATUS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const checkStockAlerts = async () => {
      try {
        const token =
          localStorage.getItem("hasif_token");

        if (!token) {
          if (!cancelled) {
            setHasStockAlerts(false);
          }
          return;
        }

        const response = await fetch(
          "https://hasifbillingsoft.onrender.com/api/products/low-stock",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setHasStockAlerts(false);
          }
          return;
        }

        const data = await response.json();

        const products =
          Array.isArray(data?.products)
            ? data.products
            : [];

        if (!cancelled) {
          setHasStockAlerts(products.length > 0);
        }
      } catch (error) {
        console.error(
          "Stock alert status error:",
          error
        );

        if (!cancelled) {
          setHasStockAlerts(false);
        }
      }
    };

    checkStockAlerts();

    // Re-check periodically so the sidebar reflects
    // stock changes without requiring a page refresh.
    const intervalId = setInterval(
      checkStockAlerts,
      30000
    );

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  // =====================================================
  // CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
  // =====================================================
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);
  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem(
      "hasif_token"
    );
    localStorage.removeItem(
      "hasif_user"
    );
    localStorage.removeItem(
      "hasif_userId"
    );
    navigate("/", {
      replace: true,
    });
  };
  // =====================================================
  // MENU ITEMS
  // =====================================================
  const mainMenu = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Billing",
      path: "/billing",
      icon: ReceiptText,
    },
  ];
  const inventoryMenu = [
    {
      label: "Products",
      path: "/products",
      icon: Package,
    },
    {
      label: "Purchases",
      path: "/purchases",
      icon: ShoppingCart,
    },
    {
      label: "Stock Alerts",
      path: "/stock-alerts",
      icon: TriangleAlert,
    },
  ];
  const managementMenu = [
    {
      label: "Sales",
      path: "/sales",
      icon: ReceiptText,
    },
    {
      label: "Suppliers",
      path: "/suppliers",
      icon: Truck,
    },
  ];
  const systemMenu = [
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
    {
      label: "Change Password",
      path: "/change-password",
      icon: KeyRound,
    },
  ];
  // =====================================================
  // MENU COMPONENT
  // =====================================================
  const renderMenu = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `hasif-nav-item ${
              isActive
                ? "hasif-nav-item-active"
                : ""
            }`
          }
        >
          <span className="hasif-nav-icon">
            <Icon
              size={17}
              strokeWidth={1.9}
            />
          </span>
          <span className="hasif-nav-label">
            {item.label}
          </span>

          {item.path === "/stock-alerts" &&
            hasStockAlerts && (
              <span
                className="hasif-nav-danger"
                title="Stock Alerts available"
                aria-label="Stock Alerts available"
              >
                !
              </span>
            )}

          <ChevronRight
            className="hasif-nav-arrow"
            size={14}
          />
        </NavLink>
      );
    });
  };
  return (
    <>
      <style>{`
        .hasif-layout {
          width: 100%;
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(255,255,255,0.98),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 90%,
              rgba(230,230,230,0.55),
              transparent 32%
            ),
            #f4f4f4;
          color: #111;
        }
        .hasif-sidebar {
          position: fixed;
          top: 16px;
          left: 16px;
          bottom: 16px;
          z-index: 1500;
          width: 245px;
          display: flex;
          flex-direction: column;
          padding: 17px 12px;
          border:
            1px solid
            rgba(255,255,255,0.9);
          border-radius: 24px;
          background:
            rgba(255,255,255,0.68);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          box-shadow:
            0 25px 70px
            rgba(0,0,0,0.08),
            inset 0 1px 0
            rgba(255,255,255,0.95);
          transition:
            transform 0.25s ease;
        }
        .hasif-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding:
            5px 7px 19px;
          border-bottom:
            1px solid
            rgba(0,0,0,0.055);
          margin-bottom: 14px;
        }
        .hasif-brand-logo {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: #111;
          color: #fff;
          font-size: 15px;
          font-weight: 900;
          box-shadow:
            0 8px 20px
            rgba(0,0,0,0.15);
        }
        .hasif-brand-info {
          min-width: 0;
        }
        .hasif-brand-name {
          color: #111;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: -0.3px;
        }
        .hasif-brand-subtitle {
          margin-top: 2px;
          color: #999;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.25px;
        }
        .hasif-menu-scroll {
          flex: 1;
          overflow-y: auto;
          padding-right: 2px;
        }
        .hasif-menu-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .hasif-menu-scroll::-webkit-scrollbar-thumb {
          background:
            rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .hasif-section {
          margin-bottom: 16px;
        }
        .hasif-section-title {
          padding:
            0 10px 7px;
          color: #a0a0a0;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }
        .hasif-nav-item {
          position: relative;
          min-height: 43px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding:
            0 10px;
          margin-bottom: 3px;
          border-radius: 12px;
          color: #6f6f6f;
          text-decoration: none;
          font-size: 12px;
          font-weight: 650;
          transition:
            background 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }
        .hasif-nav-item:hover {
          background:
            rgba(0,0,0,0.035);
          color: #222;
          transform:
            translateX(1px);
        }
        .hasif-nav-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 9px;
          color: #777;
          transition: 0.18s ease;
        }
        .hasif-nav-label {
          flex: 1;
        }
        .hasif-nav-danger {
          width: 18px;
          height: 18px;
          flex-shrink: 0;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dc2626;
          color: #fff;

          font-size: 11px;
          font-weight: 900;
          line-height: 1;

          box-shadow:
            0 4px 10px
            rgba(220, 38, 38, 0.22);

          animation:
            hasif-danger-pulse
            1.8s ease-in-out infinite;
        }

        @keyframes hasif-danger-pulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }
        }

        .hasif-nav-arrow {
          opacity: 0;
          transform:
            translateX(-3px);
          transition: 0.18s ease;
        }
        .hasif-nav-item:hover
        .hasif-nav-arrow {
          opacity: 0.5;
          transform:
            translateX(0);
        }
        .hasif-nav-item-active {
          background:
            #111 !important;
          color:
            #fff !important;
          box-shadow:
            0 9px 22px
            rgba(0,0,0,0.13);
        }
        .hasif-nav-item-active
        .hasif-nav-icon {
          background:
            rgba(255,255,255,0.1);
          color: #fff;
        }
        .hasif-nav-item-active
        .hasif-nav-arrow {
          opacity: 0.65;
          transform:
            translateX(0);
        }
        .hasif-user-card {
          padding-top: 13px;
          border-top:
            1px solid
            rgba(0,0,0,0.055);
        }
        .hasif-user {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px;
          border-radius: 13px;
          background:
            rgba(0,0,0,0.025);
        }
        .hasif-user-avatar {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: #111;
          color: #fff;
          font-size: 10px;
          font-weight: 850;
        }
        .hasif-user-info {
          min-width: 0;
          flex: 1;
        }
        .hasif-user-name {
          overflow: hidden;
          color: #333;
          font-size: 9px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hasif-user-role {
          margin-top: 2px;
          color: #999;
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .hasif-logout {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: none;
          border-radius: 9px;
          background:
            rgba(0,0,0,0.045);
          color: #777;
          cursor: pointer;
          transition: 0.18s ease;
        }
        .hasif-logout:hover {
          background: #111;
          color: #fff;
        }
        .hasif-main {
          min-height: 100vh;
          margin-left: 277px;
          padding:
            16px 16px 16px 0;
        }
        .hasif-content {
          min-height:
            calc(100vh - 32px);
          overflow: hidden;
          border:
            1px solid
            rgba(255,255,255,0.75);
          border-radius: 25px;
          background:
            rgba(255,255,255,0.28);
          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,0.7);
        }
        .hasif-mobile-header {
          display: none;
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 62px;
          align-items: center;
          justify-content: space-between;
          padding:
            0 15px;
          border-bottom:
            1px solid
            rgba(0,0,0,0.055);
          background:
            rgba(255,255,255,0.75);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
        }
        .hasif-mobile-brand {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .hasif-mobile-logo {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
        }
        .hasif-mobile-title {
          color: #111;
          font-size: 12px;
          font-weight: 850;
        }
        .hasif-mobile-menu-button {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(0,0,0,0.06);
          border-radius: 11px;
          background:
            rgba(255,255,255,0.8);
          color: #222;
          cursor: pointer;
        }
        .hasif-sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 1400;
          background:
            rgba(0,0,0,0.2);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        @media (max-width: 900px) {
          .hasif-sidebar {
            width: 245px;
            transform:
              translateX(-120%);
            box-shadow:
              20px 0 60px
              rgba(0,0,0,0.13);
          }
          .hasif-sidebar-open {
            transform:
              translateX(0);
          }
          .hasif-sidebar-overlay {
            display: block;
            opacity: 0;
            visibility: hidden;
            transition:
              opacity 0.25s ease,
              visibility 0.25s ease;
          }
          .hasif-sidebar-overlay-visible {
            opacity: 1;
            visibility: visible;
          }
          .hasif-main {
            margin-left: 0;
            padding: 0;
          }
          .hasif-content {
            min-height: 100vh;
            border-radius: 0;
            border: none;
          }
          .hasif-mobile-header {
            display: flex;
          }
        }
        @media (max-width: 600px) {
          .hasif-sidebar {
            top: 9px;
            left: 9px;
            bottom: 9px;
            width:
              calc(100vw - 18px);
            max-width: 300px;
            border-radius: 21px;
          }
        }
      `}</style>
      <div className="hasif-layout">
        {}
        <div
          className={
            `hasif-sidebar-overlay ${
              mobileSidebarOpen
                ? "hasif-sidebar-overlay-visible"
                : ""
            }`
          }
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
        {}
        <aside
          className={
            `hasif-sidebar ${
              mobileSidebarOpen
                ? "hasif-sidebar-open"
                : ""
            }`
          }
        >
          {}
          <div className="hasif-brand">
            <div className="hasif-brand-logo">
              H
            </div>
            <div className="hasif-brand-info">
              <div className="hasif-brand-name">
                HASIF STORE
              </div>
              <div className="hasif-brand-subtitle">
                SMART STORE MANAGEMENT
              </div>
            </div>
            <button
              type="button"
              className="hasif-mobile-menu-button"
              style={{
                display:
                  mobileSidebarOpen
                    ? "flex"
                    : "none",
                marginLeft:
                  "auto",
              }}
              onClick={() =>
                setMobileSidebarOpen(
                  false
                )
              }
            >
              <X size={17} />
            </button>
          </div>
          {}
          <div className="hasif-menu-scroll">
            {}
            <div className="hasif-section">
              <div className="hasif-section-title">
                Main
              </div>
              {renderMenu(
                mainMenu
              )}
            </div>
            {}
            <div className="hasif-section">
              <div className="hasif-section-title">
                Inventory
              </div>
              {renderMenu(
                inventoryMenu
              )}
            </div>
            {}
            <div className="hasif-section">
              <div className="hasif-section-title">
                Management
              </div>
              {renderMenu(
                managementMenu
              )}
            </div>
            {}
            <div className="hasif-section">
              <div className="hasif-section-title">
                System
              </div>
              {renderMenu(
                systemMenu
              )}
            </div>
          </div>
          {}
          <div className="hasif-user-card">
            <div className="hasif-user">
              <div className="hasif-user-avatar">
                H
              </div>
              <div className="hasif-user-info">
                <div className="hasif-user-name">
                  {userId}
                </div>
                <div className="hasif-user-role">
                  Administrator
                </div>
              </div>
              <button
                type="button"
                className="hasif-logout"
                onClick={
                  handleLogout
                }
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>
        {}
        <main className="hasif-main">
          {}
          <div className="hasif-mobile-header">
            <div className="hasif-mobile-brand">
              <div className="hasif-mobile-logo">
                H
              </div>
              <div className="hasif-mobile-title">
                HASIF STORE
              </div>
            </div>
            <button
              type="button"
              className="hasif-mobile-menu-button"
              onClick={() =>
                setMobileSidebarOpen(
                  true
                )
              }
            >
              <Menu size={18} />
            </button>
          </div>
          <div className="hasif-content">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
export default AppLayout;
