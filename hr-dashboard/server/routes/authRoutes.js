const express = require("express");
const router = express.Router();
const { registerEmployee, loginEmployee, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.get("/me", protect, getProfile);

module.exports = router;
