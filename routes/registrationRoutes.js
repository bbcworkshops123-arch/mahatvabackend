import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();

// ✅ POST - Create New Registration
router.post("/", async (req, res) => {
  try {
    const {
      collegeName,
      collegeAddress,
      facultyIncharge,
      contactNumber,
      eventName,
      membersCount,
      memberNames,
    } = req.body;

    // Generate registration ID (e.g., 01, 02, 03…)
    const count = await Registration.countDocuments();
    const registrationId = (count + 1).toString().padStart(2, "0");

    const newRegistration = new Registration({
      registrationId,
      collegeName,
      collegeAddress,
      facultyIncharge,
      contactNumber,
      eventName,
      membersCount,
      memberNames: Array.isArray(memberNames) ? memberNames : [memberNames],
    });

    await newRegistration.save();
    res.status(201).json({
      success: true,
      message: "Registration successful",
      registrationId,
    });
  } catch (error) {
    console.error("Error creating registration:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ✅ GET - Fetch All Registrations
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
});

// ✅ PUT - Update Marks for a Team
router.put("/marks/:id", async (req, res) => {
  try {
    const { round1, round2, round3, round4, round5 } = req.body;
    const total =
      Number(round1 || 0) +
      Number(round2 || 0) +
      Number(round3 || 0) +
      Number(round4 || 0) +
      Number(round5 || 0);

    const updated = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "marks.round1": round1,
          "marks.round2": round2,
          "marks.round3": round3,
          "marks.round4": round4,
          "marks.round5": round5,
          "marks.total": total,
        },
      },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ success: false, message: "Failed to update marks" });
  }
});

// ✅ GET - Leaderboard Sorted by Total Marks
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Registration.find().sort({ "marks.total": -1 });
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Failed to load leaderboard" });
  }
});

export default router;
