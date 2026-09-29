const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Message = require("../models/Message");

const onlineUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const employee = await Employee.findById(decoded.id).select("-password");
      if (!employee) return next(new Error("Employee not found"));
      socket.employee = employee;
      next();
    } catch (err) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const employee = socket.employee;
    onlineUsers.set(employee._id.toString(), socket.id);

    await Employee.findByIdAndUpdate(employee._id, { isOnline: true, lastActive: new Date() });
    io.emit("employeeStatusChanged", { employeeId: employee._id, isOnline: true });

    socket.join(employee._id.toString());

    socket.on("taskUpdate", (payload) => {
      io.emit("taskUpdated", payload);
    });

    socket.on("sendMessage", async ({ receiverId, content }) => {
      const saved = await Message.create({ sender: employee._id, receiver: receiverId, content });
      const message = {
        _id: saved._id,
        senderId: employee._id,
        senderName: employee.name,
        receiverId,
        content,
        timestamp: saved.createdAt,
      };
      io.to(receiverId).emit("receiveMessage", message);
      socket.emit("receiveMessage", message);
    });

    socket.on("sendNotification", ({ receiverId, message }) => {
      io.to(receiverId).emit("newNotification", { message, from: employee.name, timestamp: new Date() });
    });

    socket.on("heartbeat", async () => {
      await Employee.findByIdAndUpdate(employee._id, { lastActive: new Date() });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(employee._id.toString());
      await Employee.findByIdAndUpdate(employee._id, { isOnline: false, lastActive: new Date() });
      io.emit("employeeStatusChanged", { employeeId: employee._id, isOnline: false });
    });
  });
};

module.exports = { initSocket, onlineUsers };
