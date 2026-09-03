const generateToken = (user, statusCode, message, res) => {
    const token = user.generateToken();
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;

    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }).json({
        success: true,
        user: safeUser,
        message,
        token,
    })
}

module.exports = generateToken;
