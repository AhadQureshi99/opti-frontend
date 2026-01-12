import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
  const loginTime = localStorage.getItem("loginTime");

  // Check if 24 hours have passed since login
  if (isLoggedIn && loginTime) {
    const currentTime = Date.now();
    const elapsed = currentTime - parseInt(loginTime);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (elapsed >= TWENTY_FOUR_HOURS) {
      // Auto logout after 24 hours
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("authUser");
      localStorage.removeItem("isSubUser");
      sessionStorage.removeItem("userLoggedIn");
      sessionStorage.removeItem("justLoggedIn");
      sessionStorage.removeItem("promoShownThisSession");
      return <Navigate to="/signin" replace />;
    }
  }

  return isLoggedIn ? children : <Navigate to="/signin" replace />;
}
