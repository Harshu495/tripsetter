const Review = require("../models/reviews-model.js")
const User = require("../models/user-model.js")

const reviewValidation = {
	reviewType: {
		in: ["body"],
		exists: {
			errorMessage: "Review type is required"
		},
		notEmpty: {
			errorMessage: "Review Type cannot be empty"
		},
		isIn: {
			options: [['place', 'guide', 'app']],
			errorMessage: "Review type must be one of 'place', 'guide', or 'app'"
		},
		trim: true
	},
	entityId: {
		in: ["body"],
		exists: {
			errorMessage: "Entity ID is required"
		},
		notEmpty: {
			errorMessage: "Entity ID cannot be empty"
		},
		isMongoId: {
			errorMessage: "Entity ID must be a valid MongoDB ObjectID"
		},
		trim: true,
		custom: {
			options: async (value, { req }) => {
				const existingReview = await Review.findOne({
					entityId: value, // Checking for the same place/guide/app
					userId: req.body.userId, // Checking for the same user
				});
				if (existingReview) {
					throw new Error("You have already reviewed this place/guide/app")
				}
				return true
			}
		}
	},
	userId: {
		in: ['body'],
		exists: {
			errorMessage: "User ID is required"
		},
		notEmpty: {
			errorMessage: "User ID cannot be"
		},
		isMongoId: {
			errorMessage: "User ID must be a valid MongoDB ObjectId",
		},
		trim: true,
		custom: {
			options: async (value, { req }) => {
				const user = await User.findById(value);
				if (!user) {
					throw new Error("User not found")
				}
				return true
			},
		},
	},
	rating: {
		in: ['body'],
		exists: {
			errorMessage: "Rating is required"
		},
		notEmpty: {
			errorMessage: "Rating cannot be empty"
		},
		isInt: {
			options: { min: 1, max: 5 },
			errorMessage: "Rating must be an integer between 1 and 5"
		},
		trim: true
	},
	comment: {
		in: ["body"],
		optional: true,
		isString: {
			errorMessage: "Cooment must be a String"
		},
		trim: true,
		isLength: {
			options: { max: 500 },
			errorMessage: "Comment cannot exceed 500 characters"
		}
	}
}
const updateReviewValidation = {
	reviewType: {
		in: ["body"],
		optional: true, // Allow updates without requiring this field
		notEmpty: {
			errorMessage: "Review Type cannot be empty",
		},
		isIn: {
			options: [["place", "guide", "app"]],
			errorMessage: "Review type must be one of 'place', 'guide', or 'app'",
		},
		trim: true,
	},

	entityId: {
		in: ["body"],
		optional: true, // Allow updates without requiring this field
		notEmpty: {
			errorMessage: "Entity ID cannot be empty",
		},
		isMongoId: {
			errorMessage: "Entity ID must be a valid MongoDB ObjectID",
		},
		trim: true,
	},

	userId: {
		in: ["body"],
		optional: true, // Allow updates without requiring this field
		notEmpty: {
			errorMessage: "User ID cannot be empty",
		},
		isMongoId: {
			errorMessage: "User ID must be a valid MongoDB ObjectId",
		},
		trim: true,
		custom: {
			options: async (value, { req }) => {
				const user = await User.findById(value);
				if (!user) {
					throw new Error("User not found");
				}
				return true;
			},
		},
	},

	rating: {
		in: ["body"],
		optional: true, // Allow updates without requiring this field
		notEmpty: {
			errorMessage: "Rating cannot be empty",
		},
		isInt: {
			options: { min: 1, max: 5 },
			errorMessage: "Rating must be an integer between 1 and 5",
		},
		trim: true,
	},

	comment: {
		in: ["body"],
		optional: true,
		isString: {
			errorMessage: "Comment must be a string",
		},
		trim: true,
		isLength: {
			options: { max: 500 },
			errorMessage: "Comment cannot exceed 500 characters",
		},
	},
};
module.exports = {reviewValidation,updateReviewValidation}