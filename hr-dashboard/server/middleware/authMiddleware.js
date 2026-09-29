const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.employee = await Employee.findById(decoded.id).select("-password");
      if (!req.employee) return res.status(401).json({ message: "Not authorized, employee not found" });
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.employee || !roles.includes(req.employee.role)) {
    return res.status(403).json({ message: "Access denied for this role" });
  }
  next();
};

module.exports = { protect, authorizeRoles };
