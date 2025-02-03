const { Schema, model } = require("mongoose")
const placeSchema = new Schema({
	place_id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	address: { type: String, default: "Address not available" },
	location: {
		latitude: { type: Number, required: true },
		longitude: { type: Number, required: true },
	},
	category: { type: [String], required: true },
	imageUrl: { type: [String], default: [] },
	priceRange: { type: String },
	bestTimeToVisit: { type: String },
	fixedAmount: {
		type: Number, // This will be set by the admin
		required: true,
		min: [0, "Amount must be a positive value"],
		default: 0
	},
	activities: { type: [String], default: [] },
	averageRating: { type: Number, default: 0 },
	website_url: { type: String },
	city: { type: String, required: true },
	lastFetched: { type: Date, default: Date.now }
})
const Place = model("Place", placeSchema)
module.exports = Place