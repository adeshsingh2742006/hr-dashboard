const express = require("express");
const router = express.Router();
const { createTask, getTasks, getTaskById, startTask, pauseTask, completeTask, deleteTask } = require("../controllers/taskController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("HR"), createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.put("/:id/start", protect, startTask);
router.put("/:id/pause", protect, pauseTask);
router.put("/:id/complete", protect, completeTask);
router.delete("/:id", protect, authorizeRoles("HR"), deleteTask);

module.exports = router;
