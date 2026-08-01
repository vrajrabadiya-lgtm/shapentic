import express from "express";
import Design from "../models/Design.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

// POST /api/designs
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { designName, config, imageUrl } = req.body;

    if (!designName || !config) {
      return res.status(400).json({ error: "Missing required fields (designName, config)" });
    }

    const newDesign = new Design({
      userId: req.userId,
      designName,
      config,
      imageUrl: imageUrl || "",
    });

    const savedDesign = await newDesign.save();
    return res.status(201).json(savedDesign);
  } catch (error) {
    console.error("Error saving design:", error);
    return res.status(500).json({ error: "Failed to save design. Server error." });
  }
});

// GET /api/designs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(designs);
  } catch (error) {
    console.error("Error fetching designs:", error);
    return res.status(500).json({ error: "Failed to retrieve designs. Server error." });
  }
});

// DELETE /api/designs/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: "Design not found" });
    if (design.userId.toString() !== req.userId)
      return res.status(403).json({ error: "Not authorized" });
    await Design.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Design deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Error deleting design:", error);
    return res.status(500).json({ error: "Failed to delete design. Server error." });
  }
});

export default router;
