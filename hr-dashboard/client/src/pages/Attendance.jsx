import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

const Attendance = () => {
  const [today, setToday] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [todayRes, summaryRes] = await Promise.all([
        api.get("/attendance/today"),
        api.get("/attendance/summary"),
      ]);
      setToday(todayRes.data);
      setSummary(summaryRes.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <Layout title="Attendance">
      {loading && <p className="empty-state">Loading…</p>}

      {!loading && (
        <>
          <h3 style={{ marginBottom: 10 }}>Today</h3>
          <div className="status-list">
            {today.map((rec) => (
              <div className="status-row" key={rec._id}>
                <span className={`dot${rec.employee?.isOnline ? " online" : ""}`} />
                <div>
                  <div className="emp-name">{rec.employee?.name}</div>
                  <div className="emp-meta">
                    Login: {new Date(rec.loginTime).toLocaleTimeString()}
                  </div>
                </div>
                <span className="task-pill">
                  {rec.logoutTime
                    ? `${rec.totalActiveTime}m active`
                    : "Still checked in"}
                </span>
                <span />
              </div>
            ))}
            {today.length === 0 && <p className="empty-state">No check-ins today yet.</p>}
          </div>

          <h3 style={{ margin: "28px 0 10px" }}>Productivity summary</h3>
          <div className="status-list">
            {summary.map((s) => (
              <div className="status-row" key={s._id}>
                <span className="dot" />
                <div>
                  <div className="emp-name">{s.name}</div>
                  <div className="emp-meta">{s.email}</div>
                </div>
                <span className="task-pill">{s.totalDaysPresent} days present</span>
                <span className="task-pill">avg {s.avgActiveMinutes}m/day</span>
              </div>
            ))}
            {summary.length === 0 && <p className="empty-state">No data yet.</p>}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Attendance;
