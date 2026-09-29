const express = require("express");
const router = express.Router();
const { getEmployees, getEmployeeById, getMessages } = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getEmployees);
router.get("/messages/:otherId", protect, getMessages);
router.get("/:id", protect, getEmployeeById);

module.exports = router;
