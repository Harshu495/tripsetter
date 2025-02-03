const { Schema, model } = require("mongoose");

const notificationSchema = new Schema({
	recipientRole: {
		type: String,
		required: true,
		enum: ['Traveler', 'Guid', "admin"],
	},
	recipientId: { type: Schema.Types.ObjectId, ref: "User" },
	message: { type: String, required: true },
	isRead: { type: Boolean, default: false },
	type: {
		type: String,
		enum: ['chat', 'system', 'action'], // New field for notification type (chat, system, or action)
		default: 'chat',
	}
}, { timestamps: true });

const Notification = model("Notification", notificationSchema);
module.exports = Notification;
