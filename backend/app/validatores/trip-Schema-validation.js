const User = require("../models/user-model.js")
const Place = require("../models/place-model.js")
const GuidDetail = require("../models/guid-Model.js")
const Trip = require("../models/trip-model.js")
const TripSchemaValidation = {
	tripName: {
		in: ['body'],
		exists: {
			errorMessage: "Trip Name is required"
		},
		notEmpty: {
			errorMessage: "Trip Name cannot be empty"
		},
		trim: true,
		custom: {
			options: async (value, { req }) => {
				try {
					const query = {
						userId: req.userId, // Get userId from request body
						tripName: value
					};

					// Exclude the current trip ID if it's an update request
					if (req.params.id) {
						query._id = { $ne: req.params.id };  // Exclude the current trip ID
					}

					// Check if a trip with the same name exists for the user
					const existingTrip = await Trip.findOne(query);

					if (existingTrip) {
						throw new Error("A trip with this name already exists for this user");
					}
				} catch (err) {
					throw new Error(err.message);
				}
				return true;
			}
		},
	},
	numberOfDays: {
		in: ['body'],
		exists: {
			errorMessage: "Number of days is required"
		},
		notEmpty: {
			errorMessage: "Number of days cannot be empty"
		},
		isInt: {
			options: { min: 1 },
			errorMessage: "Number of days must be a positive integer"
		},
		toInt: true
	},
	numberOfPeople: {
		in: ['body'],
		exists: {
			errorMessage: "Number of people is required"
		},
		notEmpty: {
			errorMessage: "Number of people cannot be empty"
		},
		isInt: {
			options: { min: 1 },
			errorMessage: "Number of people must be a positive integer"
		},
		toInt: true
	},
	startDateTime: {
		in: ['body'],
		exists: {
			errorMessage: "Start date and time are required"
		},
		notEmpty: {
			errorMessage: "Start date and time cannot be empty"
		},
		isISO8601: {
			errorMessage: "Start date must be a valid date in ISO format (YYYY-MM-DD)"
		},
		custom: {
			options: (value, { req }) => {
				if (new Date(value) < new Date()) {
					throw new Error("Start date and time must be in the future");
				}
				if (new Date(value) >= new Date(req.body.endDateTime)) {
					throw new Error("Start date must be before the end date");
				}
				return true;
			},
		}
	},
	endDateTime: {
		in: ['body'],
		exists: {
			errorMessage: "End date and time are required"
		},
		notEmpty: {
			errorMessage: "End date and time cannot be empty"
		},
		isISO8601: {
			errorMessage: "End date must be a valid date in ISO format (YYYY-MM-DD)"
		},
		custom: {
			options: (value, { req }) => {
				if (new Date(value) <= new Date(req.body.startDateTime)) {
					throw new Error("End date and time must be after the start date and time");
				}
				return true;
			},
		}
	},
};

const validateSelectPlace = {
	tripId: {
		in: ['body'],
		isMongoId: {
			errorMessage: "Trip ID must be a valid MongoDB ObjectId",
		},
		exists: {
			errorMessage: "Trip ID is required"
		},
		trim: true
	},
	placeId: {
		in: ['body'],
		isMongoId: {
			errorMessage: "Place ID must be a valid MongoDB ObjectId",
		},
		exists: {
			errorMessage: "Place ID is required"
		},
		trim: true,
		custom: {
			options: async (value, { req }) => {
				const trip = await Trip.findById(req.body.tripId);
				if (!trip) {
					throw new Error("Trip not found");
				}
				// Check for duplicate places in the trip
				const placeExists = trip.places.some(place => place.placeId.toString() === value);
				if (placeExists) {
					throw new Error("This place has already been added to the trip");
				}
				return true;
			}
		}
	},
	// guideId: {
	// 	in: ['body'],
	// 	optional: true,  // Guide selection is optional
	// 	isMongoId: {
	// 		errorMessage: "Guide ID must be a valid MongoDB ObjectId",
	// 	},
	// 	trim: true,
	// 	custom: {
	// 		options: async (value, { req }) => {
	// 			if (value) {
	// 				const GuidDetails = await GuidDetail.findOne({ userId: value });
	// 				if (!guideDetail) throw new Error("Guide not found");
	// 				const { date, fromTime, toTime } = req.body;
	// 				// Check guide's availability for the selected date and time
	// 				const isAvailable = guideDetail.availableDates.includes(new Date(date)) &&
	// 					fromTime >= guideDetail.availability.fromTime &&
	// 					toTime <= guideDetail.availability.toTime;

	// 				if (!isAvailable) throw new Error("Guide is not available at this time");
	// 			}
	// 			return true
	// 		}
	// 	},
	// 	date: {
	// 		in: ['body'],
	// 		isISO8601: {
	// 			errorMessage: "Date must be in YYYY-MM-DD format"
	// 		},
	// 		custom: {
	// 			options: async (value, { req }) => {
	// 				const trip = await Trip.findById(req.body.tripId);
	// 				if (!trip) {
	// 					throw new Error("Trip not found");
	// 				}
	// 			}
	// 		}
	// 	},
	// 	fromTime: {
	// 		in: ['body'],
	// 		isString: {
	// 			errorMessage: "From time must be a valid string (e.g. '09:00 AM')",
	// 		},
	// 		custom: {
	// 			options: (value, { req }) => {
	// 				// Check if 'fromTime' is in the correct time format (HH:mm AM/PM)
	// 				const timeFormat = /^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;
	// 				if (!timeFormat.test(value)) {
	// 					throw new Error("From time must be in the format 'HH:mm AM/PM'");
	// 				}
	// 				return true;
	// 			}
	// 		}
	// 	},
	// 	toTime: {
	// 		in: ['body'],
	// 		isString: {
	// 			errorMessage: "To time must be a valid string (e.g. '09:00 AM')",
	// 		},
	// 		custom: {
	// 			options: (value, { req }) => {
	// 				// Check if 'toTime' is in the correct time format (HH:mm AM/PM)
	// 				const timeFormat = /^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;
	// 				if (!timeFormat.test(value)) {
	// 					throw new Error("To time must be in the format 'HH:mm AM/PM'");
	// 				}
	// 				if (req.body.fromTime && value <= req.body.fromTime) {
	// 					throw new Error("To time must be later than from time");
	// 				}
	// 				return true;
	// 			}
	// 		}
	// 	}
	// }
	selectedDate: {
		notEmpty: {
			errorMessage: 'Selected date is required'
		},
		isISO8601: {
			errorMessage: 'Invalid date format. Use YYYY-MM-DD'
		},
	},
	fromTime: {
		notEmpty: { errorMessage: 'From time is required' },
		isISO8601: { errorMessage: 'To time must be a valid ISO 8601 date format (YYYY-MM-DDTHH:MM:SS.sssZ)' }
	},
	toTime: {
		notEmpty: { errorMessage: 'To time is required' },
		isISO8601: { errorMessage: 'To time must be a valid ISO 8601 date format (YYYY-MM-DDTHH:MM:SS.sssZ)' },
		custom: {
			options: async (value, { req }) => {
				const fromTime = req.body.fromTime;
				if (fromTime) {
					const fromDate = new Date(fromTime);
					const toDate = new Date(value);

					if (toDate <= fromDate) {
						throw new Error('To time must be later than from time');
					}
				}
				return true;
			}
		}
	}

}

module.exports = { TripSchemaValidation, validateSelectPlace }