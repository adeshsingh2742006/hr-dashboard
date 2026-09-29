const express = require("express");
const router = express.Router();
const { markLogout, getMyAttendance, getTodayAttendance, getAttendanceSummary } = require("../controllers/attendanceController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.put("/logout", protect, markLogout);
router.get("/me", protect, getMyAttendance);
router.get("/today", protect, authorizeRoles("HR"), getTodayAttendance);
router.get("/summary", protect, authorizeRoles("HR"), getAttendanceSummary);

module.exports = router;
