const { Schema, model } = require("mongoose")
const itinerarySchema = new Schema({
	trip: { type: Schema.Types.ObjectId, ref: 'Trip' }, // Reference to the trip
	traveler: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to the traveler who owns the itinerary
	days: [
		{
			dayNumber: { type: Number, required: true }, // Day number (e.g., Day 1, Day 2)
			activities: [
				{
					place: { type: Schema.Types.ObjectId, ref: 'Trip', required: true }, // Reference to a tourist place
					startTime: { type: String, required: true }, // Start time of the activity
					endTime: { type: String }, // End time of the activity
					description: { type: String }, // Optional description of the activity
				}
			],
			notes: { type: String }, // Optional notes for the day
		}
	]
}, { timestamps: true })
const Itinerary = model("Itinerary", itinerarySchema)
module.exports = Itinerary