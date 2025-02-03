const GuideDetails = require("../models/guid-Model.js")
const User = require('../models/user-model.js');

const guideDetailsValidation = {
	userId: {
		in: ['body'],
		exists: {
			errorMessage: 'User ID is required',
		},
		notEmpty: {
			errorMessage: 'User ID cannot be empty',
		},
		isMongoId: {
			errorMessage: 'User ID must be a valid MongoDB ObjectId',
		},
		trim: true,
		custom: {
			options: async (value) => {
				const user = await User.findById(value);
				if (!user) {
					throw new Error('User not found');
				}
				return true;
			},
		},
		custom: {
			options: async (value) => {
				const Guid = await GuideDetails.findOne({ userId: value });
				if (Guid) {
					throw new Error('Guide details already exist for this user.');
				}
				return true;
			},
		},
	},

	languages: {
		in: ['body'],
		exists: {
			errorMessage: 'Languages are required',
		},
		notEmpty: {
			errorMessage: 'Languages cannot be empty',
		},
		isArray: {
			errorMessage: 'Languages must be an array',
		},
	},

	city: {
		in: ['body'],
		exists: {
			errorMessage: 'City is required',
		},
		notEmpty: {
			errorMessage: 'City cannot be empty',
		},
		isString: {
			errorMessage: 'City must be a string',
		},
		trim: true,
	},

	availablePlaces: {
		in: ['body'],
		exists: {
			errorMessage: 'Available places are required',
		},
		notEmpty: {
			errorMessage: 'Available places cannot be empty',
		},
		isArray: {
			errorMessage: 'Available places must be an array',
		},
		isMongoId: {
			errorMessage: 'Place Id must be a valid MongoDB ObjectId'
		}
	},

	availability: {
		in: ['body'],
		exists: {
			errorMessage: 'Availability is required',
		},
		notEmpty: {
			errorMessage: 'Availability cannot be empty',
		},
		isArray: {
			errorMessage: 'Availability must be an array of objects',
		},
		custom: {
			options: (value) => {
				value.forEach((item) => {
					if (!item.date || !item.fromTime || !item.toTime) {
						throw new Error('Each availability entry must have a date, fromTime, and toTime');
					}

					// Check if fromTime and toTime are valid ISO 8601 date-time strings
					if (isNaN(new Date(item.fromTime))) {
						throw new Error('fromTime must be a valid ISO 8601 date-time string');
					}
					if (isNaN(new Date(item.toTime))) {
						throw new Error('toTime must be a valid ISO 8601 date-time string');
					}
				});
				return true;
			},
		},
	},


	experience: {
		in: ['body'],
		exists: {
			errorMessage: 'Experience is required',
		},
		notEmpty: {
			errorMessage: 'Experience cannot be empty',
		},
		isInt: {
			options: { min: 0 },
			errorMessage: 'Experience must be a positive integer',
		},
	},

	hourlyRate: {
		in: ['body'],
		optional: true,
		isNumeric: {
			errorMessage: 'Hourly rate must be a number',
		},
	},

	paymentHistory: {
		in: ['body'],
		optional: true,
		isArray: {
			errorMessage: 'Payment history must be an array',
		},
	},

	rating: {
		in: ['body'],
		optional: true,
		isFloat: {
			options: { min: 0, max: 5 },
			errorMessage: 'Rating must be between 0 and 5',
		},
	},
};

const updateGuideDetailsValidation = {
	userId: {
		in: ['body'],
		optional: true,
		isMongoId: {
			errorMessage: 'User ID must be a valid MongoDB ObjectId',
		},
		trim: true,
	},

	languages: {
		in: ['body'],
		optional: true,
		isArray: {
			errorMessage: 'Languages must be an array',
		},
	},

	city: {
		in: ['body'],
		optional: true,
		isString: {
			errorMessage: 'City must be a string',
		},
		trim: true,
	},

	availablePlaces: {
		in: ['body'],
		optional: true,
		isArray: {
			errorMessage: 'Available places must be an array',
		},
	},


	availability: {
		in: ['body'],
		exists: {
			errorMessage: 'Availability is required',
		},
		notEmpty: {
			errorMessage: 'Availability cannot be empty',
		},
		isArray: {
			errorMessage: 'Availability must be an array of objects',
		},
		custom: {
			options: (value) => {
				value.forEach((item) => {
					if (!item.date || !item.fromTime || !item.toTime) {
						throw new Error('Each availability entry must have a date, fromTime, and toTime');
					}

					// Check if fromTime and toTime are valid ISO 8601 date-time strings
					if (isNaN(new Date(item.fromTime))) {
						throw new Error('fromTime must be a valid ISO 8601 date-time string');
					}
					if (isNaN(new Date(item.toTime))) {
						throw new Error('toTime must be a valid ISO 8601 date-time string');
					}
				});
				return true;
			},
		},
	},


	experience: {
		in: ['body'],
		optional: true,
		isInt: {
			options: { min: 0 },
			errorMessage: 'Experience must be a positive integer',
		},
	},

	hourlyRate: {
		in: ['body'],
		optional: true,
		isNumeric: {
			errorMessage: 'Hourly rate must be a number',
		},
	},

	paymentHistory: {
		in: ['body'],
		optional: true,
		isArray: {
			errorMessage: 'Payment history must be an array',
		},
	},

	rating: {
		in: ['body'],
		optional: true,
		isFloat: {
			options: { min: 0, max: 5 },
			errorMessage: 'Rating must be between 0 and 5',
		},
	},
};
const getAvailableGuidesValidation = {
	placeId: {
		isMongoId: {
			errorMessage: "Invalid place ID",
		},
	},
	date: {
		isISO8601: {
			errorMessage: 'Invalid date format, use ISO 8601',
		},
	},
	fromDate: {
		notEmpty: {
			errorMessage: "Start date is required",
		},
		custom: {
			options: (value) => {
				if (isNaN(new Date(value))) {
					throw new Error("Start date must be a valid Date");
				}
				return true;
			},
		},
	},
	toDate: {
		notEmpty: {
			errorMessage: "End date is required",
		},
		custom: {
			options: (value) => {
				if (isNaN(new Date(value))) {
					throw new Error("End date must be a valid Date");
				}
				return true;
			},
		},
	},
}
module.exports = { guideDetailsValidation, updateGuideDetailsValidation, getAvailableGuidesValidation };
