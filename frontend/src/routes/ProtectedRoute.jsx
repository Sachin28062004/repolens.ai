import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
