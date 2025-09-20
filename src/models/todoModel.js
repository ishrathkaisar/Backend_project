import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dateTime: { type: Date },   // 👈 store user selected date
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
