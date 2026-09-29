import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout";
import { fetchTasks, startTask, pauseTask, completeTask } from "../redux/slices/taskSlice";
import { getSocket } from "../sockets/socket";

const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const TaskCard = ({ task, onStart, onPause, onComplete }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (task.status !== "in-progress" || !task.startedAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [task.status, task.startedAt]);

  const liveMinutes =
    task.status === "in-progress" && task.startedAt
      ? task.timeSpent + (Date.now() - new Date(task.startedAt).getTime()) / 60000
      : task.timeSpent;

  return (
    <div className="task-card">
      <div className="row">
        <div>
          <p className="task-title">{task.title}</p>
          {task.description && <p className="task-desc">{task.description}</p>}
        </div>
        <span className={`status-badge ${task.status}`}>{task.status}</span>
      </div>

      <p className="timer-display">Time spent: {formatMinutes(liveMinutes)}</p>

      <div className="task-actions">
        {task.status === "pending" && (
          <button className="primary" onClick={() => onStart(task._id)}>
            Start
          </button>
        )}
        {task.status === "in-progress" && (
          <>
            <button onClick={() => onPause(task._id)}>Pause</button>
            <button className="primary" onClick={() => onComplete(task._id)}>
              Mark complete
            </button>
          </>
        )}
        {task.status === "completed" && <span className="emp-meta">Done ✓</span>}
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { items: tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const emitUpdate = (taskId, status, timeSpent) => {
    const socket = getSocket();
    if (socket) socket.emit("taskUpdate", { taskId, status, timeSpent });
  };

  const handleStart = async (id) => {
    const result = await dispatch(startTask(id));
    if (startTask.fulfilled.match(result)) {
      emitUpdate(id, result.payload.status, result.payload.timeSpent);
    }
  };

  const handlePause = async (id) => {
    const result = await dispatch(pauseTask(id));
    if (pauseTask.fulfilled.match(result)) {
      emitUpdate(id, result.payload.status, result.payload.timeSpent);
    }
  };

  const handleComplete = async (id) => {
    const result = await dispatch(completeTask(id));
    if (completeTask.fulfilled.match(result)) {
      emitUpdate(id, result.payload.status, result.payload.timeSpent);
    }
  };

  return (
    <Layout title="My tasks">
      {loading && tasks.length === 0 && <p className="empty-state">Loading tasks…</p>}

      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStart={handleStart}
            onPause={handlePause}
            onComplete={handleComplete}
          />
        ))}
        {!loading && tasks.length === 0 && (
          <p className="empty-state">No tasks assigned yet.</p>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
