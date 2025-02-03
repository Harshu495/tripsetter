const { Schema, model } = require("mongoose")

const TripSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	tripName: String,
	numberOfDays: Number,
	numberOfPeople: Number,
	places: [{
		placeId: {
			type: Schema.Types.ObjectId,
			ref: "Place",
		},
		guidId: {
			type: Schema.Types.ObjectId,
			ref: 'User', // Reference to the Guide (User) model
		},
		amount: {
			type: Number, // Amount for this particular place and guide
		},
		date: {
			type: Date,  // Date of the place visit
			required: true
		},
		fromTime: {
			type: Date, // Combined date with fromTime
			required: true,
		},
		toTime: {
			type: Date, // Combined date with toTime
			required: true,
		},
		guideConfirmation: {
			type: String,
			enum: ["pending", "Confirmed", "Rejected", "Cancelled"],
			default: "pending" // Initially, it is pending
		},
		cancellationReason: String
	}],
	totalAmount: {
		type: Number, // Total amount for the entire trip
	},
	startDateTime: {
		type: Date,
		required: true
	},
	endDateTime: {
		type: Date,
		required: true
	},
	status: {
		type: String,
		enum: ["pending", "completed", "canceled"],
		default: "pending"
	}
}, { timestamps: true })
const Trip = model("Trip", TripSchema)
module.exports = Trip