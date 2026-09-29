import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import { getSocket } from "../sockets/socket";
import api from "../api/axios";

const Chat = () => {
  const dispatch = useDispatch();
  const { items: employees } = useSelector((state) => state.employees);
  const user = useSelector((state) => state.auth.user);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncoming = (msg) => {
      const otherId = msg.senderId === user._id ? msg.receiverId : msg.senderId;
      if (activeContact && otherId === activeContact._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleIncoming);
    return () => socket.off("receiveMessage", handleIncoming);
  }, [activeContact, user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openContact = async (contact) => {
    setActiveContact(contact);
    const { data } = await api.get(`/employees/messages/${contact._id}`);
    setMessages(
      data.map((m) => ({
        senderId: m.sender,
        receiverId: m.receiver,
        content: m.content,
        timestamp: m.createdAt,
      }))
    );
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeContact) return;
    const socket = getSocket();
    socket.emit("sendMessage", { receiverId: activeContact._id, content: draft.trim() });
    setDraft("");
  };

  return (
    <Layout title="Messages">
      <div className="chat-layout">
        <div className="contact-list">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className={`contact-item${activeContact?._id === emp._id ? " active" : ""}`}
              onClick={() => openContact(emp)}
            >
              <span className={`dot${emp.isOnline ? " online" : ""}`} />
              <span>{emp.name}</span>
            </div>
          ))}
          {employees.length === 0 && <p className="empty-state">No contacts yet.</p>}
        </div>

        <div className="chat-panel">
          {!activeContact && <p className="empty-state">Select someone to start chatting.</p>}
          {activeContact && (
            <>
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`msg-bubble ${m.senderId === user._id ? "mine" : "theirs"}`}
                  >
                    {m.content}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
              <form className="chat-input-row" onSubmit={sendMessage}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeContact.name}…`}
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
