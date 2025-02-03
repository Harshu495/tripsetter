const { Schema, model } = require("mongoose")
const subscribersSchema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}, // Links the subscription to a specific user
	planName: {
		type: String,
		enum: ['Free', 'Pro'],
		required: true
	}, // Plan type ('Free', 'Pro', etc.)
	startDate: {
		type: Date,
		default: Date.now
	}, // Subscription start date
	endDate: {
		type: Date,
		required: true
	}, // Subscription end date based on the plan's duration
	paymentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Payment',
		required: false
	}, // Links to the payment made for the subscription (if applicable)
	status: {
		type: String,
		enum: ['Active', 'Expired', 'Cancelled'],
		default: 'Active'
	}, // Current subscription status
}, { timestamps: true })
const Subscriber = model("Subscriber", subscribersSchema)
module.exports = Subscriber