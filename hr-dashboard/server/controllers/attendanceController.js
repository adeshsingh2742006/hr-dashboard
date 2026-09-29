const Attendance = require("../models/Attendance");

const getTodayStart = () => new Date(new Date().setHours(0, 0, 0, 0));

const markLogin = async (employeeId) => {
  const today = getTodayStart();
  let record = await Attendance.findOne({ employee: employeeId, date: today });
  if (!record) {
    record = await Attendance.create({ employee: employeeId, date: today, loginTime: new Date() });
  }
  return record;
};

const markLogout = async (req, res) => {
  try {
    const today = getTodayStart();
    const record = await Attendance.findOne({ employee: req.employee._id, date: today });
    if (!record) return res.status(404).json({ message: "No login record found for today" });

    record.logoutTime = new Date();
    record.totalActiveTime = Math.round((record.logoutTime.getTime() - record.loginTime.getTime()) / 60000);
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.employee._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = getTodayStart();
    const records = await Attendance.find({ date: today }).populate("employee", "name email isOnline role");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await Attendance.aggregate([
      { $group: { _id: "$employee", totalDaysPresent: { $sum: 1 }, avgActiveMinutes: { $avg: "$totalActiveTime" } } },
      { $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "employeeInfo" } },
      { $unwind: "$employeeInfo" },
      { $project: { name: "$employeeInfo.name", email: "$employeeInfo.email", totalDaysPresent: 1, avgActiveMinutes: { $round: ["$avgActiveMinutes", 1] } } },
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markLogin, markLogout, getMyAttendance, getTodayAttendance, getAttendanceSummary };
