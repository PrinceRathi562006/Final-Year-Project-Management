const asyncHandler = require("../middlewares/asyncHandler");
const { ErrorHandler } = require("../middlewares/error");
const userServices = require("../services/userServices");

const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Student",
  });
  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  })
});

const updateStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const existingUser = await userServices.getUserById(id);

    if (!existingUser) {
        return next(new ErrorHandler("Student not found", 404));
    }
    if (existingUser.role !== "Student") {
        return next(new ErrorHandler("User is not a student", 400));
    }

    const updatedData = {};
    for (const field of ["name", "email", "department"]) {
      if (req.body[field] !== undefined) {
        updatedData[field] = req.body[field];
      }
    }

    const user = await userServices.updateUser(id, updatedData);
    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: { user },
    });
});

const deleteStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
    if(!user){
        return next(new ErrorHandler("Student not found", 404));
    }
    if(user.role !== "Student"){
        return next(new ErrorHandler("User is not a student", 400));
    }

    await userServices.deleteUser(id);

    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
    })
});

const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, experties } = req.body;
  const normalizedExperties = Array.isArray(experties)
    ? experties.map((item) => String(item).trim()).filter(Boolean)
    : typeof experties === "string"
      ? experties.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    Number(maxStudents) < 1 ||
    normalizedExperties.length === 0
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    maxStudents,
    experties: normalizedExperties,
    role: "Teacher",
  });
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

const updateTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const existingUser = await userServices.getUserById(id);

    if (!existingUser) {
        return next(new ErrorHandler("Teacher not found", 404));
    }
    if (existingUser.role !== "Teacher") {
        return next(new ErrorHandler("User is not a teacher", 400));
    }

    const updatedData = {};
    for (const field of ["name", "email", "department", "maxStudents", "experties"]) {
      if (req.body[field] !== undefined) {
        updatedData[field] = req.body[field];
      }
    }

    const user = await userServices.updateUser(id, updatedData);
    res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: { user },
    });
});

const deleteTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
    if(!user){
        return next(new ErrorHandler("Teacher not found", 404));
    }
    if(user.role !== "Teacher"){
        return next(new ErrorHandler("User is not a teacher", 400));
    }

    await userServices.deleteUser(id);

    res.status(200).json({
        success: true,
        message: "Teacher deleted successfully",
    })
});

const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await userServices.getAllUsers();
    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: { users },
    });
});

const assignSupervisor = asyncHandler(async (req, res, next) => {});
const getAllProject = asyncHandler(async (req, res, next) => {});
const getDashboardStats = asyncHandler(async (req, res, next) => {});

module.exports = { createStudent, updateStudent, deleteStudent, createTeacher, updateTeacher, deleteTeacher, getAllUsers, assignSupervisor, getAllProject, getDashboardStats };
