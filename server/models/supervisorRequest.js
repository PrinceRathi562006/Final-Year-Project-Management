const mongoose = require("mongoose");

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student Id is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Supervisor Id is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [250, "message cannot be more thatn 25- character"],
    },
    status: {
      type: String,
      default: pending,
      enum: ["pending", "accepted", "rejected"],
    },
  },
  {
    timestamps: true,
  },
);

// NOTE: Indexing for better query performance

supervisorRequestSchema.index({ student: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ status: 1 });

const SupervisorRequest =
  mongoose.models.SupervisorRequest ||
  mongoose.model("SupervisorRequest", supervisorRequestSchema);
module.exports = SupervisorRequest;
