import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../redux/slices/authSlice";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    designation: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-visual">
        <h1>One dashboard for the whole team.</h1>
        <p>
          Whether you're setting up HR or joining as an employee, your
          workspace is ready in a minute.
        </p>
      </div>
      <div className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <p className="subtitle">Join the workspace</p>

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              placeholder="e.g. Frontend Developer"
              value={form.designation}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="role">I am joining as</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: "100%",
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
              }}
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error && <p className="error-msg">{error}</p>}

          <p className="subtitle" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
