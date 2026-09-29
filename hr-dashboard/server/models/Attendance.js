const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true, default: () => new Date(new Date().setHours(0, 0, 0, 0)) },
    loginTime: { type: Date, required: true },
    logoutTime: { type: Date, default: null },
    totalActiveTime: { type: Number, default: 0 },
    status: { type: String, enum: ["present", "absent", "half-day"], default: "present" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
