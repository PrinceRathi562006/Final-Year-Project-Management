const express = require("express");
const {
  createStudent,
  updateStudent,
  deleteStudent,
  deleteTeacher,
  updateTeacher,
  createTeacher,
  getAllUsers,
  assignSupervisor,
} = require("../controllers/adminController.js");
// const multer = require("multer");
const {
  isAuthenticated,
  isAuthorized,
} = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/create-student",
  isAuthenticated,
  isAuthorized("Admin"),
  createStudent,
);

router.put(
  "/update-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateStudent,
);

router.delete(
  "/delete-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteStudent,
);

router.post(
  "/create-teacher",
  isAuthenticated,
  isAuthorized("Admin"),
  createTeacher,
);

router.put(
  "/update-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateTeacher,
);

router.delete(
  "/delete-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteTeacher,
);

router.get(
  "/users",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllUsers,
);

router.put(
  "/assign-supervisor/:studentId",
  isAuthenticated,
  isAuthorized("Admin"),
  assignSupervisor,
);

module.exports = router;
