import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "../sockets/socket";
import { applyStatusChange } from "../redux/slices/employeeSlice";
import { applyLiveUpdate } from "../redux/slices/taskSlice";

// Connects the socket once a user is logged in, keeps Redux in sync with
// live events, and shows lightweight toast notifications.
const RealtimeProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => {
    if (!user?.token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(user.token);

    socket.on("employeeStatusChanged", (payload) => {
      dispatch(applyStatusChange(payload));
    });

    socket.on("taskUpdated", (payload) => {
      dispatch(applyLiveUpdate(payload));
    });

    socket.on("newNotification", ({ message, from }) => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { id, text: `${from}: ${message}` }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });

    // Keep lastActive fresh every 60s while the tab is open
    const heartbeat = setInterval(() => {
      socket.emit("heartbeat");
    }, 60000);

    return () => {
      clearInterval(heartbeat);
      disconnectSocket();
    };
  }, [user?.token, dispatch]);

  return (
    <>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
};

export const notifyTask = (receiverId, message) => {
  const socket = getSocket();
  if (socket) socket.emit("sendNotification", { receiverId, message });
};

export default RealtimeProvider;
