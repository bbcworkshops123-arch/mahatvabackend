import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
  round1: { type: Number, default: 0 },
  round2: { type: Number, default: 0 },
  round3: { type: Number, default: 0 },
  round4: { type: Number, default: 0 },
  round5: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  membersCount: { type: Number, required: true },
  memberNames: { type: [String], default: [] },
  marks: { type: marksSchema, default: () => ({}) },
});

const registrationSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true },
    collegeName: { type: String, required: true },
    collegeAddress: { type: String, required: true },
    facultyIncharge: { type: String, required: true },
    contactNumber: { type: String, required: true },
    events: { type: [eventSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
