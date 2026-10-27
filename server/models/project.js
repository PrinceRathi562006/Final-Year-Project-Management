const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Student ID is required"]
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    title: {
        type: String,
        maxlength: [200, "Title cannot be more than 200 characters"],
        required: [true, "Project title is required"],
        trim: true,
    },
    description: {
        type: String,
        maxlength: [2000, "Description cannot be more than 2000 characters"],
        required: [true, "Project description is required"],
        trim: true,
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected", "completed"],
    },
    files: [
        {
            fileType: {
                type: String,
                required: true,
            },
            fileUrl: {
                type: String,
                required: true,
            },
            originalName: {
                type: String,
                required: true,
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    feedback: [
        {
            supervisorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            type: {
                type: String,
                enum: ["positive", "negative", "general"],
                default: general,
            },
            title: {
                type: String,
                required: true,
            },
            message: {
                type: String,
                required: true,
                maxlength: [1000, "Feedback message cannot more than 1000 characters"]
            },
        },
    ],
    deadline: {
        type: Date,
    }
}, {
    timestamps: true,
});

// NOTE: Indexing for better query performance

projectSchema.index({student: 1});
projectSchema.index({supervisor: 1});
projectSchema.index({status: 1});

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
module.exports = Project;