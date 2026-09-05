import mongoose from "mongoose";

const VALID_COLUMNS = ["col-1", "col-2", "col-3"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

const taskSchema = new mongoose.Schema(
  {
    columnId: {
      type: String,
      required: true,
      enum: VALID_COLUMNS,
      index: true, 
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    priority: {
      type: String,
      enum: VALID_PRIORITIES,
      default: "Medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    assignee: {
      type: String, 
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

taskSchema.index({ columnId: 1, createdAt: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;