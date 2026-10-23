const getAuthCookieOptions = (req) => {
    const forwardedProtocol = req?.headers?.["x-forwarded-proto"]?.split(",")[0]?.trim();
    const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || forwardedProtocol === "https";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
};

const generateToken = (user, statusCode, message, res, req) => {
    const token = user.generateToken();
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;

    const expiresInDays = Number(process.env.COOKIE_EXPIRES) || 7;
    res.status(statusCode).cookie("token", token, {
        ...getAuthCookieOptions(req),
        expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    }).json({
        success: true,
        user: safeUser,
        message,
        token,
    })
}

module.exports = generateToken;
module.exports.getAuthCookieOptions = getAuthCookieOptions;
