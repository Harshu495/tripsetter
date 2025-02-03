const { Schema, model } = require("mongoose")
const groupChartScehma = new Schema({
	tripId: { type: Schema.Types.ObjectId, ref: "Trip" },
	userId: { type: Schema.Types.ObjectId, ref: "User" },
	groupName: String,
	inviteLink: { type: String, required: true, unique: true }, // Unique invite link for the group
	members: [
		{
			name: { type: String, required: true }, // Name of the member (could be traveler or guide)
			isRegisteredUser: { type: Boolean, default: false }, // Indicates if the member is a registered Trip Setter user
			// role: { type: String, enum: ['traveler', 'guide'], required: true }, // Role of the member
			// associatedPlace: { type: Schema.Types.ObjectId, ref: 'TouristPlace' }, // Place guide is associated with (if applicable)
			joinedAt: { type: Date, default: Date.now }, // Timestamp of when the member joined
		}
	],
	messages: [
		{
			senderName: { type: String, required: true }, // Name of the sender
			senderId: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional reference for registered users
			content: { type: String, required: true }, // Message content
			// role: { type: String, enum: ['traveler', 'guide'], required: true }, // Role of the sender
			// associatedPlace: { type: Schema.Types.ObjectId, ref: 'TouristPlace' }, // Place the message relates to (optional)
			sentAt: { type: Date, default: Date.now }, // Timestamp of when the message was sent
		}
	]
}, { timestamps: true })
const GroupChart = model("GroupChart", groupChartScehma)
module.exports = GroupChart