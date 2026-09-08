import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("hasif_token");
  const location = useLocation();

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("hasif_user") || "{}"
    );
  } catch (error) {
    user = {};
  }

  const role = user?.role || "admin";

  // =====================================================
  // STAFF ACCESS CONTROL
  // =====================================================

  if (role === "staff") {
    const staffAllowedPaths = [
      "/billing",
      "/products",
      "/stock-alerts",
      "/change-password",
    ];

    // Staff cannot open Settings
    if (location.pathname === "/settings") {
      return (
        <Navigate
          to="/change-password"
          replace
        />
      );
    }

    // Staff cannot access admin-only pages
    if (
      !staffAllowedPaths.includes(
        location.pathname
      )
    ) {
      return (
        <Navigate
          to="/billing"
          replace
        />
      );
    }
  }

  return children;
}

export default ProtectedRoute;