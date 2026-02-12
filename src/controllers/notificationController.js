const mongoose = require("mongoose");
const Notification = require("../models/notificationModel.js");
const sendPushNotification = require("../middleware/pushNotificationMiddleware.js");
const userModel = require("../models/userModels.js");

// send notification
exports.sendNotification = async (req, res) => {
  const { userId, userType, sendAll = false, message, title, image } = req.body;
  try {
    if (!message || !title || !image) {
      return res.status(400).json({
        success: false,
        message: "message, image and title are required !",
      });
    }
    let userData;

    if (userId) {
      userData = await userModel.findById(userId);
      // Notification
      const notificationPayload = {
        notification: { title, body: message, image },
        tokens: [userData.fcmToken],
      };

      await sendPushNotification(notificationPayload);
      await Notification.create({ title, message, userId, image });

      return res.status(200).json({
        success: true,
        message: "Notification Sent Successfully.",
      });
    } else if (userType) {
      userData = await userModel.find({ userType });
    } else if (sendAll) {
      userData = await userModel.find({});
    }

    // Prepare notifications
    const notificationsToSave = [];
    const tokens = [];

    for (const user of userData) {
      if (user.fcmToken) tokens.push(user.fcmToken);
      notificationsToSave.push({
        title,
        message,
        image,
        userId: user._id,
      });
    }

    // Send push notification
    if (tokens.length > 0) {
      const notificationPayload = {
        notification: { title, image, body: message },
        tokens: [...new Set(tokens)],
      };
      await sendPushNotification(notificationPayload);
    }

    if (notificationsToSave.length > 0) {
      await Notification.insertMany(notificationsToSave);
    }

    return res.status(200).json({
      success: true,
      message: "Notification Sent Successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all notification by userId
exports.getAllNotificationByuserId = async (req, res) => {
  const { userId, read } = req.query;
  const filter = {
    ...(userId && { userId }),
    ...(read && { seen: read == true ? true : false }),
  };
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const data = await Notification.find(filter).sort({
      createdAt: -1,
    });
    //seen -- true
    //   await Notification.updateMany({ userId }, { seen: true }, { new: true });

    return res.status(200).json({
      success: true,
      message: "All Notification Fetched Successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// notification seen count
exports.notificationSeenCount = async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const data = await Notification.countDocuments({ userId, seen: false });

    return res.status(200).json({
      success: true,
      message: "Notification Total Count Fetched Successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get notification by id
exports.getNotificationById = async (req, res) => {
  const { id } = req.query;
  console.log("DEBUG: getNotificationById (mark seen) hitting for id:", id);
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification Id is required !",
      });
    }

    const data = await Notification.findByIdAndUpdate(
      id,
      { seen: true },
      { new: true },
    );
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification Not Found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification Fetched Successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete notification by id
exports.deleteNotificationById = async (req, res) => {
  const { id } = req.query;
  console.log("DEBUG: deleteNotificationById hitting for id:", id);
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification Id is required!",
      });
    }

    const data = await Notification.findByIdAndDelete(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification Not Found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// clear all notifications (delete all)
exports.clearAllNotifications = async (req, res) => {
  const { userId } = req.query;
  console.log("DEBUG: clearAllNotifications hitting with userId:", userId);
  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const query = { userId: new mongoose.Types.ObjectId(userId) };
    const result = await Notification.deleteMany(query);
    console.log("DEBUG: deleteMany result:", result);

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} notification(s) deleted successfully`,
    });
  } catch (error) {
    console.error("DEBUG: clearAllNotifications error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
