const { Schema, model } = require("mongoose")
const planSchema = new Schema({
	name: String,
	price: Number, // Plan price in rupees or as a whole number
	durationInDays: Number,// Duration of the plan in days (e.g., 30 for 1 month, 365 for 1 year)
	features: [{
		type: String
	}], // Array of features included in the plan
}, { timestamps: true });
const SubscriptionPlan = model("SubscriptionPlan", planSchema)
module.exports = SubscriptionPlan