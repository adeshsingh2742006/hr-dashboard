const Task = require("../models/Task");
const Employee = require("../models/Employee");

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const task = await Task.create({ title, description, assignedTo, assignedBy: req.employee._id, priority, dueDate });
    const populated = await task.populate("assignedTo", "name email");

    req.app.get("io").to(assignedTo.toString()).emit("newNotification", {
      message: `New task assigned: ${title}`,
      from: req.employee.name,
      timestamp: new Date(),
    });
    req.app.get("io").emit("taskCreated", populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.employee.role !== "HR") filter.assignedTo = req.employee._id;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email isOnline")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const startTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "in-progress";
    task.startedAt = new Date();
    await task.save();

    await Employee.findByIdAndUpdate(req.employee._id, { currentTask: task._id, lastActive: new Date() });

    req.app.get("io").emit("taskUpdated", { taskId: task._id, status: task.status, employeeId: req.employee._id });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const pauseTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.startedAt) {
      task.timeSpent += Math.round((Date.now() - task.startedAt.getTime()) / 60000);
      task.startedAt = null;
    }
    await task.save();

    req.app.get("io").emit("taskUpdated", { taskId: task._id, status: task.status, timeSpent: task.timeSpent, employeeId: req.employee._id });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.startedAt) {
      task.timeSpent += Math.round((Date.now() - task.startedAt.getTime()) / 60000);
      task.startedAt = null;
    }
    task.status = "completed";
    task.completedAt = new Date();
    await task.save();

    await Employee.findByIdAndUpdate(req.employee._id, { currentTask: null });

    req.app.get("io").emit("taskUpdated", { taskId: task._id, status: task.status, timeSpent: task.timeSpent, employeeId: req.employee._id });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, startTask, pauseTask, completeTask, deleteTask };
