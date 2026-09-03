const express = require('express');
const {
    registerUser,
    login,
    getUser,
    logout,
    forgotPassword,
    resetPassword,
    deleteUser
} = require('../controllers/authController.js');
const multer = require('multer');
const isAuthenticated = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/me", isAuthenticated, getUser);
router.post("/logout", isAuthenticated, logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.delete("/deleteUser/:id", isAuthenticated, deleteUser);

module.exports = router;
