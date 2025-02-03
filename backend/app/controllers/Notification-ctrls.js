const Notification = require("../models/Notification.js")
const NotificationCtrl = {}
NotificationCtrl.retirival = async (req, res) => {
	try {
		const { userId } = req.user;

		// Fetch unread notifications for the logged-in guide
		const notifications = await Notification.find({ recipientId: userId, isRead: false });

		// Update isRead to true after sending notifications
		await Notification.updateMany({ recipientId: userId, isRead: false }, { $set: { isRead: true } });

		return res.status(200).json(notifications);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
module.exports = NotificationCtrl
