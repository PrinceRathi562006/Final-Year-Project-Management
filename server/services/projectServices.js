const {Project} = require("../models/project.js");

const getProjectByStudent = async(studentId) => {
    return await Project.findOne({student: studentId}).sort({createdAt: -1});
}

export default getProjectByStudent;