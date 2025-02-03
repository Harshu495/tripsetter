const { Schema, model } = require("mongoose")
const weatherSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: "User" },
	place: { type: Schema.Types.ObjectId, ref: "Place" },
	alertConditionL: [
		{
			type: String,
			enum: ["Rain", "snow", 'heatwave', 'coldwave'],
		}
	],
	timeRange: { type: [String], required: true }, // E.g., ['08:00', '20:00'] for active alert times
	isActive: { type: Boolean, default: true }, // To enable/disable alerts
}, { timestamps: true })
const Weather = model("Weather", weatherSchema)
module.exports = Weather