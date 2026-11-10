const { ErrorHandler } = require("../middlewares/error.js");

const Project = require("../models/project.js");

const getProjectByStudent = async(studentId) => {
    return await Project.findOne({student: studentId}).sort({createdAt: -1});
}

const createProject = async(projectData) => {
    const project = new Project(projectData);
    await project.save();
    return project;
};

const getProjectById = async (id) => {
    const project = await Project.findById(id).populate("student", "name email").populate("supervisor", "name email");

    if(!project){
        throw new ErrorHandler("Project not found", 400);
    }
    return project;
}

const addFilesToProject = async (projectId, files) => {
    const project = await Project.findById(projectId);

    if(!project) {
        throw new ErrorHandler("Project not found", 400);
    }

    const fileMetaData = files.map((file) => ({
        fileType: file.mimetype,
        fileUrl: file.path,
        originalName: file.originalName,
        uploadedAt: new Date(),
    }));

    project.files.push(...fileMetaData);

    await project.save();

    return project;
}

module.exports = {getProjectByStudent, createProject, getProjectById, addFilesToProject};
