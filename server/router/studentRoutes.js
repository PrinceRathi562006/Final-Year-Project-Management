const express = require("express");
const {
  getStudentProject,
  submitProposal,
  uploadFiles,
  getProjectFile,
  getAvailableSupervisors,
  getSupervisor,
  requestSupervisor,
} = require("../controllers/studentController.js");
const {
  isAuthenticated,
  isAuthorized,
} = require("../middlewares/authMiddleware.js");
const {upload, handleUploadError} = require("../middlewares/upload.js");

const router = express.Router();

router.get(
  "/project",
  isAuthenticated,
  isAuthorized("Student"),
  getStudentProject,
);

router.post(
  "/project-proposal",
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
  "/project/:projectId/files/:fileId",
  isAuthenticated,
  isAuthorized("Student"),
  getProjectFile,
);

router.get(
  "/fetch-supervisors",
  isAuthenticated,
  isAuthorized("Student"),
  getAvailableSupervisors,
);

router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  getSupervisor,
);

router.post(
  "/request-supervisor",
  isAuthenticated,
  isAuthorized("Student"),
  requestSupervisor,
);

module.exports = router;
