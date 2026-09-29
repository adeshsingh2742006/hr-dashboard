const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const { markLogin } = require("./attendanceController");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, role, designation } = req.body;
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ message: "Employee already exists" });

    const employee = await Employee.create({ name, email, password, role, designation });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee || !(await employee.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    employee.isOnline = true;
    employee.lastActive = Date.now();
    await employee.save();
    await markLogin(employee._id);

    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.employee);
};

module.exports = { registerEmployee, loginEmployee, getProfile };
