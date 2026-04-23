require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_MEAL_TYPES = ["lunch", "dinner"];

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  userId: { type: String, default: () => randomUUID(), unique: true },
  name: { type: String, required: true },
  email: { type: String, sparse: true, unique: true }, // Sparse allows null for unactivated hostelers
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hosteler', 'day-scholar'], required: true },
  room_no: { type: String }, // Required for hostelers
  couponCount: { type: Number, default: 0 },
  isActivated: { type: Boolean, default: true }, // False for managed hostelers who haven't set email
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "ngrok-skip-browser-warning"]
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../frontend")));

// --- Data Models ---
const AttendanceSchema = new mongoose.Schema({
  userId: String,
  name: String,
  room_no: String,
  mealType: String,
  date: String,
  time: String
});
const Attendance = mongoose.model("Attendance", AttendanceSchema);

const CouponUsageSchema = new mongoose.Schema({
  userId: String,
  name: String,
  meal: String,
  dateUsed: String,
  timeUsed: String,
  status: { type: String, default: "used" }
});
const CouponUsage = mongoose.model("CouponUsage", CouponUsageSchema);

const TransactionSchema = new mongoose.Schema({
  userId: String,
  type: { type: String, enum: ['BUY', 'USE'] },
  amount: Number,
  meal: String,
  date: String,
  time: String
});
const Transaction = mongoose.model("Transaction", TransactionSchema);

// --- Helpers & State ---
const getTodayDateString = () => new Date().toLocaleDateString('en-CA');
const lastScanTimes = {}; // In-memory cooldown (resets on server restart)

// ================= AUTH =================

// ✅ Day Scholar Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'day-scholar',
      isActivated: true
    });

    await newUser.save();
    res.status(201).json({ message: "Account created", userId: newUser.userId, role: newUser.role });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
});

// ✅ Hosteler Activation (First Login)
app.post("/api/activate-hosteler", async (req, res) => {
  try {
    const { userId, email, newPassword } = req.body;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate email uniqueness
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.email = email.toLowerCase();
    user.password = hashedPassword;
    user.isActivated = true;
    
    await user.save();
    res.json({ message: "Account activated successfully!", role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Activation error", error: err.message });
  }
});

// ✅ Universal Login (Admin, Hosteler, Day Scholar)
app.post("/login", async (req, res) => {
  try {
    const { emailOrId, password } = req.body;

    // Search by email OR room_no (for unactivated hostelers)
    const user = await User.findOne({
      $or: [
        { email: emailOrId.toLowerCase() },
        { room_no: emailOrId.toUpperCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password (plain check for first-time hostelers, bcrypt for others)
    let isMatch = false;
    if (!user.isActivated && password === user.room_no) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return profile
    res.json({
      userId: user.userId,
      role: user.role,
      name: user.name,
      email: user.email || "",
      room_no: user.room_no || "N/A",
      couponCount: user.couponCount,
      isActivated: user.isActivated
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// ✅ Admin: Preload Hostelers
app.post("/api/admin/preload-hostelers", async (req, res) => {
  try {
    const { students } = req.body; // Array of { name, room_no }

    const results = [];
    for (const s of students) {
      const exists = await User.findOne({ room_no: s.room_no });
      if (!exists) {
        const newUser = new User({
          name: s.name,
          room_no: s.room_no.toUpperCase(),
          password: s.room_no.toUpperCase(), // Initial password is Room No
          role: 'hosteler',
          isActivated: false // Needs activation
        });
        await newUser.save();
        results.push(newUser);
      }
    }
    res.json({ message: `Preloaded ${results.length} hostelers`, added: results });
  } catch (err) {
    res.status(500).json({ message: "Preload error", error: err.message });
  }
});

// ✅ Get User Profile
app.get("/api/user-profile/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- Transactions ---
app.get("/api/user/transactions/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// ================= COUPONS & SCANNING =================

// ✅ Buy Coupons (Simulated)
app.post("/api/buy-coupons", async (req, res) => {
  try {
    const { userId, quantity } = req.body;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const qty = parseInt(quantity);
    user.couponCount += qty;
    await user.save();

    const transaction = new Transaction({
      userId,
      type: 'BUY',
      amount: qty,
      date: getTodayDateString(),
      time: new Date().toLocaleTimeString()
    });
    await transaction.save();

    res.json({ message: "Purchase successful", couponCount: user.couponCount });
  } catch (err) {
    res.status(500).json({ message: "Purchase failed", error: err.message });
  }
});

// ✅ Use Coupon (QR Scan - Day Scholars)
app.post("/api/use-coupon", async (req, res) => {
  try {
    const { userId, mealType } = req.body;
    const today = getTodayDateString();

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "day-scholar") {
      return res.status(400).json({ message: "Hostelers should use Attendance mode" });
    }

    if (user.couponCount <= 0) {
      return res.status(400).json({ message: "Insufficient coupons!" });
    }

    // Cooldown check (10 seconds)
    const now = Date.now();
    if (lastScanTimes[userId] && (now - lastScanTimes[userId] < 10000)) {
      return res.status(429).json({ message: "Please wait 10s" });
    }

    // Daily limit
    const used = await CouponUsage.findOne({ userId, dateUsed: today, meal: mealType });
    if (used) return res.status(400).json({ message: `Coupon already used for ${mealType}` });

    user.couponCount -= 1;
    await user.save();

    const usage = new CouponUsage({
      userId, name: user.name, meal: mealType, dateUsed: today, timeUsed: new Date().toLocaleTimeString()
    });
    await usage.save();

    lastScanTimes[userId] = now;
    res.json({ message: "Coupon used!", name: user.name, remainingCoupons: user.couponCount, role: "Day Scholar" });
  } catch (err) {
    res.status(500).json({ message: "Scan failed", error: err.message });
  }
});

// ✅ Mark Attendance (QR Scan - Hostelers)
app.post("/mark-attendance", async (req, res) => {
  try {
    const { userId, mealType } = req.body;
    const today = getTodayDateString();

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "hosteler") {
      return res.status(400).json({ message: "Day Scholars must use coupons" });
    }

    // Cooldown check
    const now = Date.now();
    if (lastScanTimes[userId] && (now - lastScanTimes[userId] < 10000)) {
      return res.status(429).json({ message: "Wait 10s" });
    }

    const marked = await Attendance.findOne({ userId, date: today, mealType: mealType.toLowerCase() });
    if (marked) return res.status(400).json({ message: "Already marked for today" });

    const attendance = new Attendance({
      userId, name: user.name, room_no: user.room_no, mealType: mealType.toLowerCase(), date: today, time: new Date().toLocaleTimeString()
    });
    await attendance.save();

    lastScanTimes[userId] = now;
    res.json({ message: "Attendance marked!", name: user.name, role: "Hosteler" });
  } catch (err) {
    res.status(500).json({ message: "Attendance failed", error: err.message });
  }
});

// ================= ADMIN ANALYTICS =================

app.get("/api/admin/coupon-stats", async (req, res) => {
  try {
    const total = await User.countDocuments({ role: "day-scholar" });
    const active = await User.countDocuments({ role: "day-scholar", couponCount: { $gt: 0 } });
    const inactive = total - active;
    res.json({ totalDayScholars: total, activeUsers: active, inactiveUsers: inactive });
  } catch (err) { res.status(500).send(err); }
});

app.get("/api/admin/day-scholars", async (req, res) => {
  const ds = await User.find({ role: "day-scholar" }).select("name email couponCount");
  res.json(ds);
});

app.get("/api/admin/coupon-usage-today", async (req, res) => {
  const usage = await CouponUsage.find({ dateUsed: getTodayDateString() });
  res.json(usage);
});

app.get("/api/admin/analytics/usage-7days", async (req, res) => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7Days.push(d.toLocaleDateString('en-CA'));
  }
  const usageByDate = await Promise.all(last7Days.map(async date => {
    const count = await CouponUsage.countDocuments({ dateUsed: date });
    return { date, count };
  }));
  res.json(usageByDate);
});

app.get("/api/admin/analytics/meal-distribution", async (req, res) => {
  const lunch = await CouponUsage.countDocuments({ meal: "Lunch" });
  const dinner = await CouponUsage.countDocuments({ meal: "Dinner" });
  res.json({ lunch, dinner });
});

// ✅ Fetch Today's Attendance (For Dashboard)
app.get("/attendance/today", async (req, res) => {
  try {
    const today = getTodayDateString();
    const records = await Attendance.find({ date: today }).sort({ time: -1 });
    res.json({ date: today, count: records.length, records });
  } catch (err) {
    res.status(500).json({ message: "Failed to load attendance" });
  }
});

// ✅ Fetch All Attendance (For History/Admin)
app.get("/api/attendance", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1, time: -1 });
    // Map to format expected by frontend
    const formatted = records.map(r => ({
      date: r.date,
      name: r.name,
      room_no: r.room_no,
      meal: r.mealType.charAt(0).toUpperCase() + r.mealType.slice(1),
      status: "Present",
      time: r.time
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

// ================= TIMETABLE & FEEDBACK =================

let currentTimetable = null; 
const feedbackRecords = [];

app.post("/api/feedback", (req, res) => {
  const { mealType, comment, user } = req.body;
  feedbackRecords.push({ date: getTodayDateString(), meal: mealType, comment, user });
  res.status(201).json({ message: "Feedback sent" });
});

app.get("/api/feedback", (req, res) => res.json({ feedback: feedbackRecords }));

app.post("/api/timetable", (req, res) => {
  currentTimetable = req.body.image;
  res.json({ message: "Timetable uploaded" });
});

app.get("/api/get-timetable", (req, res) => res.json({ timetable: currentTimetable }));

// ================= DOWNLOAD REPORTS =================
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// ✅ Download Excel
app.get("/download/excel", async (req, res) => {
  try {
    const today = getTodayDateString();
    const records = await Attendance.find({ date: today });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Room No", key: "room_no", width: 15 },
      { header: "Meal Type", key: "mealType", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Time", key: "time", width: 15 }
    ];

    records.forEach(r => sheet.addRow(r));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Attendance_${today}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).send("Excel generation failed");
  }
});

// ✅ Download PDF
app.get("/download/pdf", async (req, res) => {
  try {
    const today = getTodayDateString();
    const records = await Attendance.find({ date: today });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Attendance_${today}.pdf"`);

    doc.pipe(res);
    doc.fontSize(20).text(`Attendance Report - ${today}`, { align: "center" });
    doc.moveDown();

    records.forEach((r, i) => {
      doc.fontSize(12).text(`${i + 1}. ${r.name} | Room: ${r.room_no} | ${r.mealType.toUpperCase()} | Time: ${r.time}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).send("PDF generation failed");
  }
});

// ================= SERVER =================

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;