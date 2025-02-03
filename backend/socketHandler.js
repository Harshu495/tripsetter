const Notification = require("../backend/app/models/Notification.js")
// Store online users (userId as key, socketId as value)
const onlineUsers = {};

module.exports = (io) => {
	io.on("connection", (socket) => {
		console.log("New client connected:", socket.id);

		// Handle user login (user sends userId)
		socket.on("userOnline", async (userId) => {
			if (userId) {
				onlineUsers[userId] = socket.id;
				console.log(`User ${userId} is online`);

				try {
					// Fetch unread notifications for the user
					const unreadNotifications = await Notification.find({
						recipientId: userId,
						isRead: false,
					});

					if (unreadNotifications.length > 0) {
						socket.emit("offlineNotifications", unreadNotifications);

						// Optionally mark notifications as read after sending
						await Notification.updateMany(
							{ recipientId: userId, isRead: false },
							{ isRead: true }
						);
					}
				} catch (error) {
					console.error("Error fetching notifications:", error);
				}
			}
		});

		// Handle user disconnect
		socket.on("disconnect", () => {
			const userId = Object.keys(onlineUsers).find(
				(key) => onlineUsers[key] === socket.id
			);

			if (userId) {
				delete onlineUsers[userId];
				console.log(`User ${userId} is offline`);
			}
		});

		// Handle guide details submission notification to admin
		socket.on("guideDetailsSubmitted", async (data) => {
			try {
				const adminSocketId = Object.values(onlineUsers).find((id) =>
					id.includes("admin")
				);

				if (adminSocketId) {
					io.to(adminSocketId).emit("newGuideNotification", data);
				} else {
					await Notification.create({
						recipientRole: "admin",
						recipientId: data.adminId, // Assuming adminId is provided in data
						message: data.message,
						type: "system",
						isRead: false,
					});
				}
			} catch (error) {
				console.error("Error handling guideDetailsSubmitted event:", error);
			}
		});

		// Handle trip booking notifications for guides
		socket.on("tripBooking", async (data) => {
			try {
				const guideSocketId = onlineUsers[data.guideId];

				if (guideSocketId) {
					io.to(guideSocketId).emit("tripNotification", {
						message: `You have a new trip request for place ${data.placeId}`,
						tripId: data.tripId,
					});
				} else {
					// Store notification if guide is offline
					await Notification.create({
						recipientRole: "guide",
						recipientId: data.guideId,
						message: `You have a new trip request for place ${data.placeId}`,
						type: "action",
						isRead: false,
					});
				}
			} catch (error) {
				console.error("Error handling tripBooking event:", error);
			}
		});

		// Handle chat messages
		socket.on("sendMessage", (data) => {
			console.log("Chat message received:", data);
			io.emit("receiveMessage", data);
		});
	});
};

// Export online users for access in other modules
module.exports.onlineUsers = onlineUsers;