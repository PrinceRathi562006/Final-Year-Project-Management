const mongoose = require("mongoose");

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deadline name/title is required"],
      trim: true,
      maxlength: [100, "Deadline name/title cannot more than 100 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due Date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created By is required"],
    },
    Project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// NOTE: Indexing for better query performance

deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ project: 1 });
deadlineSchema.index({ createdBy: 1 });

const Deadline =
  mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);
module.exports = Deadline;
