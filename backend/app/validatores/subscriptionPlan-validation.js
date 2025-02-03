const SubscriptionPlan = require("../models/subscriptionPlan-model")


const SubscriptionPlanValidation = {
	name: {
		in: ["body"],
		exists: {
			errorMessage: "Plan name is required"
		},
		notEmpty: {
			errorMessage: "Place name cannot be empty"
		},
		isString: {
			errorMessage: "Plan name must be a string."
		},
		isLength: {
			options: { min: 3, max: 50 },
			errorMessage: "Plan name must be at least 3 characters long and can be at most 50 characters long."
		},
		trim: true,
		custom: {
			// You can add a custom check to ensure the name is unique in the database if needed.
			// Example: checking if a plan with this name already exists
			options: async (value, { req }) => {
				// Check uniqueness for creation, and allow for the same plan during update
				// Determine if this is an update or create operation
				const isUpdate = req.params.id ? true : false;
				const existingName = await SubscriptionPlan.findOne({ name: value })
				if (existingName && (isUpdate && existingName._id.toString() !== req.params.id)) {
					throw new Error("Plan name already exists.")
				}
				return true
			}
		}
	},
	price: {
		in: ['body'],
		exists: {
			errorMessage: "Price Feild is required"
		},
		notEmpty: {
			errorMessage: "Price cannot be empty"
		},
		isNumeric: {
			errorMessage: "Price must be a number."
		},
		isInt: {
			options: { gt: 0 },
			errorMessage: "Price must be greater than zero."// Ensures price is a positive integer
		}
	},
	durationInDays: {
		in: ['body'],
		exists: {
			errorMessage: "Duration in days is required."
		},
		notEmpty: {
			errorMessage: "Duration in  Days cannot be empty"
		},
		isInt: {
			options: { gt: 0 },
			errorMessage: "Duration in days must be a positive integer."
		}
	},
	features: {
		in: ["body"],
		isArray: {
			errorMessage: "Features must be an array."
		},
		custom: {
			options: async (value) => {
				// Ensure the features array is not empty
				if (value.length === 0) {
					throw new Error("Features array cannot be empty.")
				}
				// Ensure all elements in the array are strings
				value.forEach((feature) => {
					if (typeof feature !== "string") {
						throw new Error("Each feature must be a string.")
					}
				});
				return true
			}
		}
	}
}

module.exports = SubscriptionPlanValidation