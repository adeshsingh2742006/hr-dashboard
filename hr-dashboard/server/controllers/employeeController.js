const Employee = require("../models/Employee");
const Message = require("../models/Message");

// @route GET /api/employees   (HR: all employees list, Employee: list of colleagues for chat)
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ _id: { $ne: req.employee._id } })
      .select("-password")
      .sort({ isOnline: -1, name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/employees/messages/:otherId   (chat history between logged-in user and otherId)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.employee._id, receiver: req.params.otherId },
        { sender: req.params.otherId, receiver: req.employee._id },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees, getEmployeeById, getMessages };
