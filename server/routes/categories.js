import express from "express";
import Category from "../models/Category.js";
import { protect, allow } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => res.json(await Category.find().sort({ name: 1 })));

router.post("/", protect, allow("admin"), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete("/:id", protect, allow("admin"), async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});

export default router;
