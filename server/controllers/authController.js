const asyncHandler = require("../middlewares/asyncHandler");
const {ErrorHandler} = require("../middlewares/error");
const User = require('../models/User');
const generateForgotPasswordEmailTemplate = require("../utils/emailTemplates");
const sendEmail = require("../services/emailService");
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

// Register User

const registerUser = asyncHandler(async (req, res, next)=>{
    const { name, email, password, role } = req.body;

    if(!name || !email || !password){
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    if (role && role !== "Student") {
        return next(new ErrorHandler("This endpoint can only create students", 400));
    }

    let user = await User.findOne({ email });

    if(user){
        return next(new ErrorHandler("User already exists", 400));
    }

    user = new User({ name, email, password, role: "Student" });
    await user.save();

    generateToken(user, 201, "User Registered successfully", res);
});

const login = asyncHandler(async (req, res, next) => {
    const {email, password, role} = req.body;
    if(!email || !password || !role){
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const user = await User.findOne({email, role}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email, password or role", 401))
    }
    const isPasswordMatched = await user.comparePassword(password);
    
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email, password or role", 401))
    }
    generateToken(user, 200, "Logged in successfully", res);
});

const getUser = asyncHandler(async (req, res, next) => {
    const user = req.user;

    res.status(200).json({
        success: true,
        user,
    });
});

const logout = asyncHandler(async (req, res, next) => {
    res.status(200).cookie("token", "",{
        expires: new Date(
            Date.now()
        ),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out successfully",
    })
});

const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found with this email", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            to: user.email,
            subject: "FYP SYSTEM - 🔐 PASSWORD Reset Request",
            message,
        });
        res.status(200).json({
            success: true,
            message: `Email sent ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message || "Cannot send email", 500));
    }
});

const resetPassword = asyncHandler(async (req, res, next) => {
    const {token} = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if(!user){
        return next(new ErrorHandler("Invalid or expired password reset token", 400));
    }

    if(!req.body.password || !req.body.confirmPassword){
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password and Confirm Password do not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    generateToken(user, 200, "Password reset successful", res);
});

const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (req.user.role !== "Admin" && req.user._id.toString() !== id) {
        return next(new ErrorHandler("You are not authorized to delete this user", 403));
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        deletedUser
    });
});

module.exports = {
    registerUser,
    login,
    getUser,
    logout,
    forgotPassword,
    resetPassword,
    deleteUser
};
