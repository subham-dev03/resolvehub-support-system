import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, allow("admin"), async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

router.get("/agents", protect, allow("admin", "agent"), async (req, res) => {
  res.json(await User.find({ role: "agent", active: true }).select("name email role"));
});

router.post("/agents", protect, allow("admin"), async (req, res) => {
  try {
    const { name, email, password = "Agent@123" } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: "agent" });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.patch("/:id/toggle", protect, allow("admin"), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.active = !user.active;
  await user.save();
  res.json({ message: `User ${user.active ? "enabled" : "disabled"}`, active: user.active });
});

router.delete("/:id", protect, allow("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
});

export default router;
