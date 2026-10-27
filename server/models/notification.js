const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Feedback message cannot more than 1000 characters"],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        enum: ["request", "approval", "rejection", "feedback", "deadline", "general", "meeting", "system"],
        default: "general"
    },
    priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "low",
    }
  },
  {
    timestamps: true,
  },
);

// NOTE: Indexing for better query performance

notificationSchema.index({ user: 1, isRead: 1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
module.exports = Notification;
