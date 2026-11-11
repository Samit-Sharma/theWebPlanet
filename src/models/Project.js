import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Project title is required"], trim: true },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
