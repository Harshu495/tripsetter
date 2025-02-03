const Payment = require("../models/payment-model")

const paymentValidation = {
	// Validate userId (assume User model exists and is used for authentication)
	userId: {
		in: ['body'],
		exists: {
			errorMessage: "User Id is required"
		},
		notEmpty: {
			errorMessage: "User Id cannot be empty"
		},
		isMongoId: {
			errorMessage: "Invalid User Id Format"
		}
	},
	// Validate amount
	amount: {
		in: ["body"],
		exists: {
			errorMessage: "Amount is required"
		},
		notEmpty: {
			errorMessage: "Amount cannot be empty"
		},
		isNumeric: { errorMessage: "Amount must be a number." },
		isInt: { options: { min: 1 }, errorMessage: "Amount must be a positive integer." },
	},
	// Validate currency (optional field)
	currency: {
		in: ['body'],
		optional: { options: { nullable: true } },
		isString: { errorMessage: "Currency must be a string." },
	},
	// Validate paymentId
	paymentId: {
		in: ['body'],
		exists: { errorMessage: "Payment ID is required." },
		notEmpty: { errorMessage: "Payment ID cannot be empty." },
		isString: { errorMessage: "Payment ID must be a string." },
	},
	// Validate status
	status: {
		in: ['body'],
		exists: { errorMessage: "Status is required." },
		notEmpty: { errorMessage: "Status cannot be empty." },
		isIn: { options: [['Pending', 'Success', 'Failed', 'Refunded']], errorMessage: "Invalid status." },
	},
	// Validate paymentDate (optional)
	paymentDate: {
		in: ['body'],
		optional: { options: { nullable: true } },
		isISO8601: { errorMessage: "Invalid payment date format." },
	},

	// Validate paymentFor
	paymentFor: {
		in: ['body'],
		exists: { errorMessage: "Payment for is required." },
		notEmpty: { errorMessage: "Payment for cannot be empty." },
		isIn: { options: [['Subscription', 'Trip']], errorMessage: "Invalid payment for." },
	},

	// Validate subscriptionPlanId (if applicable)
	subscriptionPlanId: {
		in: ['body'],
		optional: { options: { nullable: true } },
		isMongoId: { errorMessage: "Invalid subscription plan ID." },
	},

	// Validate tripId (if applicable)
	tripId: {
		in: ['body'],
		optional: { options: { nullable: true } },
		isMongoId: { errorMessage: "Invalid trip ID." },
	},
}
module.exports = paymentValidation