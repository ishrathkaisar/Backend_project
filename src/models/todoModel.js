import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    completed: { type: Boolean, default: false },
    priority: {type: String, enum: ["low","medium","high"], default: "medium" },
    dueDate: { type: Date },
    category: { type: String },
    tags: [{ type: String }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: Date,
    image: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String }, // ✅ store uploaded image filename/path
  },
  { timestamps: true } // auto-manages createdAt & updatedAt
);

// ✅ Add index for performance on user+status queries
todoSchema.index({ user: 1, status: 1 });

const Todo = mongoose.model("Todo", todoSchema);
export default Todo;

