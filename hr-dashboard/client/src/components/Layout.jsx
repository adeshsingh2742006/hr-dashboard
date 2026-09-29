import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Layout = ({ title, children }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isHR = user?.role === "HR";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          Team<span>Pulse</span>
        </div>

        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          {isHR ? "Team overview" : "My tasks"}
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          Messages
        </NavLink>
        {isHR && (
          <NavLink
            to="/attendance"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            Attendance
          </NavLink>
        )}

        <div className="logout-link" onClick={handleLogout} role="button">
          {user?.name} ({user?.role}) — Sign out
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1 className="page-title">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
