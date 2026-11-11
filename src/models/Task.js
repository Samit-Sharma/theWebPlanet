import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Task title is required"], trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: { values: ["todo", "in-progress", "done"], message: "Invalid status" },
      default: "todo",
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
