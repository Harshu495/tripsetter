const { Schema, model } = require("mongoose")
const guideDetailsSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	languages: [String],
	city: { type: String, required: true },
	availablePlaces: [{ type: Schema.Types.ObjectId, ref: 'Place' }],
	availability: [{
		date: {
			type: Date, // stores the specific date
			required: true
		},
		fromTime: {
			type: Date, // stores the start time (e.g., "09:00 AM")
			required: true
		},
		toTime: {
			type: Date, // stores the end time (e.g., "06:00 PM")
			required: true
		}
	}],
	unavailableSlots: [{
		date: { type: Date, required: true },
		fromTime: { type: Date, required: true },
		toTime: { type: Date, required: true }
	}],
	availableDates: [{ type: Date }],  // Dates guide is available for booking
	experience: { type: Number, required: true },
	hourlyRate: { type: Number },
	paymentHistory: [{
		amount: Number,
		date: Date,
		tripId: { type: Schema.Types.ObjectId, ref: "Trip" }
	}],
	rating: { type: Number, default: 0 },
	status: {
		type: String,
		enum: ["pending", "approved", "rejected"],
		default: "pending"
	}
}, { timestamps: true })
const GuidDetail = model("GuidDetail", guideDetailsSchema)
module.exports = GuidDetail