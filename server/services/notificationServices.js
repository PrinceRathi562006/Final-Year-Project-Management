const { Notification } = require("../models/notification.js");

const createNotification = async (notificationData) => {
    const notification = new Notification(notificationData);
    return await notification.save();
};

const notifyUser = async(
    userId,
    message,
    type = "general",
    link = null,
    priority = "low"
) => {
    return await createNotification({
        user: userId,
        message,
        type,
        link,
        priority,
    })
}

module.exports = { createNotification, notifyUser };
