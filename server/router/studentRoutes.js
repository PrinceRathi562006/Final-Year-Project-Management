const express = require("express");
const {
  getStudentProject,
  submitProposal,
  uploadFiles,
  getAvailableSupervisors,
} = require("../controllers/studentController.js");
const multer = require("multer");
const {
  isAuthenticated,
  isAuthorized,
} = require("../middlewares/authMiddleware.js");
const {upload, handleUploadError} = require("../middlewares/upload.js");

const router = express.Router();

router.post(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject,
);

router.post(
  "/proposal",
  isAuthenticated,
  isAuthorized("Student"),
  submitProposal,
);

router.post(
  "/upload/:projectId",
  isAuthenticated,
  isAuthorized("Student"),
  upload.array("files", 10),
  handleUploadError,
  uploadFiles,
);

router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors,
);

module.exports = router;
