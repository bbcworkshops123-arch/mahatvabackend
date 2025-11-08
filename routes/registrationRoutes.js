import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();

/**
 * 🧮 Helper: Generate sequential registration ID
 */
async function generateRegistrationId() {
  const last = await Registration.findOne().sort({ createdAt: -1 });
  const next = last ? parseInt(last.registrationId) + 1 : 1;
  return next.toString().padStart(2, "0");
}

/**
 * ✅ POST - Create new registration with all events
 */
router.post("/", async (req, res) => {
  try {
    const {
      collegeName,
      collegeAddress,
      facultyIncharge,
      contactNumber,
      events,
    } = req.body;

    if (
      !collegeName ||
      !collegeAddress ||
      !facultyIncharge ||
      !contactNumber ||
      !Array.isArray(events) ||
      events.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All college and event details are required.",
      });
    }

    const registrationId = await generateRegistrationId();

    const newRegistration = new Registration({
      registrationId,
      collegeName,
      collegeAddress,
      facultyIncharge,
      contactNumber,
      events,
    });

    await newRegistration.save();

    res.status(201).json({
      success: true,
      message: "Registration successful for all events!",
      registrationId,
    });
  } catch (error) {
    console.error("Error creating registration:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * 📋 GET - All Registrations
 */
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
});

/**
 * 🧾 PUT - Update marks for a specific event in a college
 * Body Example:
 * {
 *   "round1": 10,
 *   "round2": 20,
 *   "round3": 15,
 *   "round4": 25,
 *   "round5": 30
 * }
 */
router.put("/:registrationId/event/:eventName/marks", async (req, res) => {
  try {
    const { registrationId, eventName } = req.params;
    const { round1, round2, round3, round4, round5 } = req.body;

    const total =
      Number(round1 || 0) +
      Number(round2 || 0) +
      Number(round3 || 0) +
      Number(round4 || 0) +
      Number(round5 || 0);

    const registration = await Registration.findOne({ registrationId });
    if (!registration)
      return res.status(404).json({ message: "Registration not found" });

    const event = registration.events.find((e) => e.eventName === eventName);
    if (!event)
      return res.status(404).json({ message: "Event not found for this college" });

    event.marks = { round1, round2, round3, round4, round5, total };

    await registration.save();

    res.json({
      success: true,
      message: "Marks updated successfully!",
      event,
    });
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ success: false, message: "Failed to update marks" });
  }
});

/**
 * 🏆 GET - Leaderboard (by total marks for any event)
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const all = await Registration.find();

    // Flatten all events with marks
    const leaderboard = all.flatMap((reg) =>
      reg.events.map((e) => ({
        collegeName: reg.collegeName,
        eventName: e.eventName,
        total: e.marks.total || 0,
      }))
    );

    // Sort descending by total marks
    leaderboard.sort((a, b) => b.total - a.total);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Failed to load leaderboard" });
  }
});
export default router;
