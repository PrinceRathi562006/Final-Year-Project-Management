const asyncHandler = require("../middlewares/asyncHandler");
const { ErrorHandler } = require("../middlewares/error");
const User = require("../models/User.js");
const userServices = require("../services/userServices");
const mongoose = require("mongoose");
const projectService = require("../services/projectServices.js");

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

const submitProposal = asyncHandler(async(req, res, next) => {
    const {title, description} = req.body;
    const studentId = req.user._id;

    const existingProject = await projectService.getProjectByStudent(studentId);

    if(existingProject && existingProject.status !== "rejected"){
        return next(new ErrorHandler("You already have an active project. You can only submit a new proposal if the previous one was rejected.",
            400
        )
    );
    }

    const projectData = {
        student: studentId,
        title,
        description,
    };
    const project = await projectService.createProject(projectData);

    await User.findByIdAndUpdate(studentId, {project: project._id});

    res.status(201).json({
        success: true,
        data: {project},
        message: "Project propsal submitted successfully"
    })
});

const uploadFiles = asyncHandler(async (req, res, next) => {
  const {projectId} = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if(!project || project.student.toString() !== studentId.toString()){
    return next(new ErrorHandler("Not authorized to upload files to this project", 403));
  }

  if(!req.files || req.files.length === 0){
    return next(new ErrorHandler("No files uploaded", 400));
  }

  const updatedProject = await projectService.addFilesToProject(projectId, req.files);

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: { project: updatedProject },
  })
});

const getAvailableSupervisors = asyncHandler(
  async(req, res, next) => {
    const supervisors = await User.find({role: "Teacher"}).select("name email department experties").lean();
    // lean() -> for data read only purpose

    res.status(200).json({
      success: true,
      data: {supervisors},
      message: "Available supervisors fetched successfully",
    });
  }
);

module.exports = { getStudentProject, submitProposal, uploadFiles, getAvailableSupervisors };
