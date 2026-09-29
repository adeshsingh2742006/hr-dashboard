import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RealtimeProvider from "./components/RealtimeProvider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HRDashboard from "./pages/HRDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Chat from "./pages/Chat";
import Attendance from "./pages/Attendance";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const HROnlyRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "HR") return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <RealtimeProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user?.role === "HR" ? <HRDashboard /> : <EmployeeDashboard />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <HROnlyRoute>
              <Attendance />
            </HROnlyRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RealtimeProvider>
  );
};

export default App;
