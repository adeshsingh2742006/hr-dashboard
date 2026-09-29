import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import { createTask, fetchTasks } from "../redux/slices/taskSlice";
import { notifyTask } from "../components/RealtimeProvider";

const formatLastActive = (iso) => {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.round(diffMin / 60)}h ago`;
};

const HRDashboard = () => {
  const dispatch = useDispatch();
  const { items: employees, loading } = useSelector((state) => state.employees);
  const { items: tasks } = useSelector((state) => state.tasks);
  const [assigningTo, setAssigningTo] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchTasks());
  }, [dispatch]);

  const currentTaskTitle = (employeeId) => {
    const active = tasks.find(
      (t) => t.assignedTo?._id === employeeId && t.status === "in-progress"
    );
    return active?.title;
  };

  const openAssign = (employeeId) => {
    setAssigningTo(employeeId);
    setForm({ title: "", description: "", priority: "medium" });
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      createTask({ ...form, assignedTo: assigningTo })
    );
    if (createTask.fulfilled.match(result)) {
      notifyTask(assigningTo, `New task assigned: ${form.title}`);
      setAssigningTo(null);
    }
  };

  return (
    <Layout title="Team overview">
      {loading && employees.length === 0 && <p className="empty-state">Loading team…</p>}

      <div className="status-list">
        {employees.map((emp) => (
          <div className="status-row" key={emp._id}>
            <span className={`dot${emp.isOnline ? " online" : ""}`} />
            <div>
              <div className="emp-name">{emp.name}</div>
              <div className="emp-meta">
                {emp.designation || emp.role} ·{" "}
                {emp.isOnline ? "Active now" : `Last seen ${formatLastActive(emp.lastActive)}`}
              </div>
            </div>
            <span className="task-pill">
              {currentTaskTitle(emp._id) || "No active task"}
            </span>
            <button onClick={() => openAssign(emp._id)}>Assign task</button>
          </div>
        ))}
        {!loading && employees.length === 0 && (
          <p className="empty-state">No employees yet.</p>
        )}
      </div>

      {assigningTo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
          onClick={() => setAssigningTo(null)}
        >
          <form
            className="task-card"
            style={{ width: 380 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitAssign}
          >
            <h3 style={{ marginTop: 0 }}>Assign a task</h3>
            <div className="field">
              <label>Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={{
                  width: "100%",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="task-actions">
              <button type="button" onClick={() => setAssigningTo(null)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Assign
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default HRDashboard;
