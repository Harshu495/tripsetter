const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const paymentSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	amount: Number, // Payment amount
	currency: { type: String, default: "INR" }, // Default currency
	paymentId: String, // Gateway transaction ID
	status: {
		type: String, enum: ['Pending', 'Success', 'Failed', 'Refunded'],
		default: 'Pending'
	},// Set default status as "Pending"
	paymentDate: Date,
	paymentFor: String, // Purpose of payment
	subscriptionPlanId: {
		type: Schema.Types.ObjectId,
		ref: "SubscriptionPlan"
	},
	tripId: {
		type: Schema.Types.ObjectId,
		ref: "Trip"
	}
}, { timestamps: true });

const Payment = model("Payment", paymentSchema);
module.exports = Payment;
