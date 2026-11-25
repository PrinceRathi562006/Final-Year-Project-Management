const asyncHandler = require("../middlewares/asyncHandler");
const { ErrorHandler } = require("../middlewares/error");
const fs = require("fs");
const path = require("path");
const User = require("../models/User.js");
const Project = require("../models/project.js");
const Notification = require("../models/notification.js");
const projectService = require("../services/projectServices.js");
const requestService = require("../services/requestServices.js");
const notificationService = require("../services/notificationServices.js");

const resolveProjectFilePath = (storedPath, projectId) => {
  const uploadsRoot = path.resolve(__dirname, "../uploads");
  const projectDirectory = path.resolve(uploadsRoot, "projects", projectId);
  const isInside = (directory, candidate) =>
    candidate.startsWith(`${directory}${path.sep}`);
  const rawPath = String(storedPath || "");
  const filePath = path.resolve(rawPath);

  // Current files are stored under uploads/projects/<projectId>/.
  if (isInside(projectDirectory, filePath)) return filePath;
  // Older files may have been stored directly in uploads/.
  if (path.dirname(filePath) === uploadsRoot) return filePath;

  // Older records can contain a path relative to the app root or a path saved
  // with a different working directory. Rebuild it from the uploads segment,
  // while still constraining the result to this server's uploads directory.
  const pathParts = rawPath.split(/[\\/]+/).filter(Boolean);
  const uploadsIndex = pathParts
    .map((part) => part.toLowerCase())
    .lastIndexOf("uploads");
  if (uploadsIndex >= 0 && uploadsIndex < pathParts.length - 1) {
    const relativeUploadPath = pathParts.slice(uploadsIndex + 1).join(path.sep);
    const normalizedPath = path.resolve(uploadsRoot, relativeUploadPath);
    if (isInside(uploadsRoot, normalizedPath)) return normalizedPath;
  }

  return null;
};

const getStudentProject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await projectService.getProjectByStudent(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No project found for this student",
    });
  }
  res.status(200).json({
    success: true,
    data: { project },
  });
});

const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  const existingProject = await projectService.getProjectByStudent(studentId);

  if (existingProject && existingProject.status !== "rejected") {
    return next(
      new ErrorHandler(
        "You already have an active project. You can only submit a new proposal if the previous one was rejected.",
        400,
      ),
    );
  }

  const projectData = {
    student: studentId,
    title,
    description,
  };
  const project = await projectService.createProject(projectData);

  await User.findByIdAndUpdate(studentId, { project: project._id });

  res.status(201).json({
    success: true,
    data: { project },
    message: "Project propsal submitted successfully",
  });
});

const uploadFiles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);
  const projectStudentId = project.student?._id || project.student;

  if (!project || projectStudentId.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("Not authorized to upload files to this project", 403),
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }

  const updatedProject = await projectService.addFilesToProject(
    projectId,
    req.files,
  );

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: { project: updatedProject },
  });
});

const getProjectFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);
  const projectStudentId = project.student?._id || project.student;

  if (projectStudentId.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("You are not authorized to view this project file", 403),
    );
  }

  const projectFile = project.files.id(fileId);
  if (!projectFile) {
    return next(new ErrorHandler("Project file not found", 404));
  }

  const filePath = resolveProjectFilePath(projectFile.fileUrl, projectId);
  if (!filePath) {
    return next(new ErrorHandler("Invalid project file location", 400));
  }

  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    return next(
      new ErrorHandler("The stored project file is unavailable", 404),
    );
  }

  res.type(projectFile.fileType || "application/octet-stream");
  return res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) next(error);
  });
});

const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);
  const projectStudentId = project.student?._id || project.student;

  if (projectStudentId.toString() !== studentId.toString()) {
    return next(new ErrorHandler("You are not authorized to download files from this project", 403));
  }

  const projectFile = project.files.id(fileId);
  if (!projectFile) {
    return next(new ErrorHandler("Project file not found", 404));
  }

  const filePath = resolveProjectFilePath(projectFile.fileUrl, projectId);
  if (!filePath) {
    return next(new ErrorHandler("Invalid project file location", 400));
  }

  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    return next(new ErrorHandler("The stored project file is unavailable", 404));
  }

  return res.download(filePath, path.basename(projectFile.originalName || filePath), (error) => {
    if (error && !res.headersSent) next(error);
  });
});

const deleteProjectFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);
  const projectStudentId = project.student?._id || project.student;

  if (projectStudentId.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to delete files from this project",
        403,
      ),
    );
  }

  const projectFile = project.files.id(fileId);
  if (!projectFile) {
    return next(new ErrorHandler("Project file not found", 404));
  }

  const filePath = resolveProjectFilePath(projectFile.fileUrl, projectId);
  if (!filePath) {
    return next(new ErrorHandler("Invalid project file location", 400));
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  project.files.pull(fileId);
  await project.save();

  return res.status(200).json({
    success: true,
    message: "Project file deleted successfully",
    data: { project },
  });
});

const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department experties")
    .lean();
  // lean() -> for data read only purpose

  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully",
  });
});

const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department experties",
  );

  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
  });
});

const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);

  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (student.supervisor) {
    return next(
      new ErrorHandler("You already have a supervisor assigned", 400),
    );
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor selected.", 400));
  }

  if ((supervisor.assignedStudents || []).length >= supervisor.maxStudents) {
    return next(
      new ErrorHandler(
        "Selected supervisor has reached maximum student capacity.",
        400,
      ),
    );
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
  };

  const request = await requestService.createRequest(requestData);

  await notificationService.notifyUser(
    teacherId,
    `${student.name} has requested ${supervisor.name} as their supervisor.`,
    "request",
    "/teacher/requests",
    "medium",
  );

  return res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request sent successfully",
  });
});

const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .sort({ createdAt: -1 })
    .populate("supervisor", "name")
    .lean();

  const now = new Date();
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .select("title description deadline")
    .sort({ deadline: 1 })
    .limit(3)
    .lean();

  const topNotifications = await Notification.find({ user: studentId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const feedbackCreatedAt = (item) => item.createdAt || item._id?.getTimestamp?.() || 0;
  const feedbackNotifications =
    project?.feedback && project?.feedback.length > 0
      ? [...project.feedback].reverse()
          .sort((a, b) => new Date(feedbackCreatedAt(b)) - new Date(feedbackCreatedAt(a)))
          .slice(0, 2)
      : [];

  const supervisorName = project?.supervisor?.name || null;

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotifications,
      feedbackNotifications,
      supervisorName,
    }
  })
});

const getStudentNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount: notifications.filter((notification) => !notification.isRead).length,
    },
  });
});

const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);
  const projectStudentId = project.student?._id || project.student;

  if (projectStudentId.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to view feedback for this project", 403));
  }

  await project.populate("feedback.supervisorId", "name email");
  const feedbackDate = (note) => note.createdAt || note._id?.getTimestamp?.() || 0;
  const sortedFeedback = [...project.feedback].sort((a, b) =>
    new Date(feedbackDate(b)) - new Date(feedbackDate(a)),
  );

  res.status(200).json({
    success: true,
    data: {
      feedback: sortedFeedback,
      project: { _id: project._id, title: project.title },
    },
  })
})

module.exports = {
  getStudentProject,
  submitProposal,
  uploadFiles,
  getProjectFile,
  downloadFile,
  deleteProjectFile,
  getAvailableSupervisors,
  getSupervisor,
  requestSupervisor,
  getDashboardStats,
  getStudentNotifications,
  getFeedback,
};
