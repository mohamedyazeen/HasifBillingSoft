import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import Products from "./pages/Products";
import StockAlerts from "./pages/StockAlerts";
import Billing from "./pages/Billing";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";

import Suppliers from "./pages/Suppliers";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

/* =====================================================
   APP
===================================================== */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC ROUTE
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            BILLING
        ================================================= */}

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Billing />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Products />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PURCHASES
        ================================================= */}

        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Purchases />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            STOCK ALERTS
        ================================================= */}

        <Route
          path="/stock-alerts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <StockAlerts />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SALES
        ================================================= */}

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Sales />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CHANGE PASSWORD
        ================================================= */}

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ChangePassword />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CUSTOMERS
        ================================================= */}

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ComingSoonPage
                  title="Customers"
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SUPPLIERS
        ================================================= */}

        <Route
  path="/suppliers"
  element={
    <ProtectedRoute>
      <AppLayout>
        <Suppliers />
      </AppLayout>
    </ProtectedRoute>
  }
/>
        

        {/* =================================================
            EXPENSES
        ================================================= */}

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ComingSoonPage
                  title="Expenses"
                />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
  path="/settings"
  element={
    <AppLayout>
      <Settings />
    </AppLayout>
  }
/>

        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

/* =====================================================
   COMING SOON PAGE
===================================================== */

function ComingSoonPage({
  title,
}) {
  return (
    <>
      <style>{`

        .coming-soon-page {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px;
        }

        .coming-soon-card {
          width: 100%;
          max-width: 500px;

          padding: 45px 30px;

          text-align: center;

          border:
            1px solid
            rgba(255,255,255,0.9);

          border-radius: 25px;

          background:
            rgba(255,255,255,0.65);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          box-shadow:
            0 25px 70px
            rgba(0,0,0,0.07);
        }

        .coming-soon-icon {
          width: 55px;
          height: 55px;

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background: #111;
          color: #fff;

          font-size: 20px;
          font-weight: 900;
        }

        .coming-soon-card h1 {
          margin-top: 18px;

          color: #111;

          font-size: 25px;

          letter-spacing: -1px;
        }

        .coming-soon-card p {
          margin-top: 8px;

          color: #999;

          font-size: 10px;
        }

      `}</style>

      <div className="coming-soon-page">

        <div className="coming-soon-card">

          <div className="coming-soon-icon">
            H
          </div>

          <h1>
            {title}
          </h1>

          <p>
            This module will be available soon.
          </p>

        </div>

      </div>
    </>
  );
}

export default App;