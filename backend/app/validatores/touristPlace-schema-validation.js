const Place = require("../models/place-model.js")
const placeValidation = {
	place_id: {
		in: ["body"],
		exists: {
			errorMessage: "Place ID is required"
		},
		notEmpty: {
			errorMessage: "Place ID cannot be empty"
		},
		isString: {
			errorMessage: "Place ID must be a string"
		},
		trim: true,
		custom: {
			options: async (value) => {
				try {
					const place = await Place.findOne({ place_Id: value })
					if (place) {
						throw new Error("Place is already exist")
					}
				} catch (err) {
					throw new Error(err.message)
				}
				return true
			}
		}
	},
	name: {
		in: ["body"],
		exists: {
			errorMessage: "Name is required"
		},
		notEmpty: {
			errorMessage: "Name cannot be empty"
		},
		isString: {
			errorMessage: "Name must be a string"
		},
		trim: true
	},
	address: {
		in: ["body"],
		optional: true,
		isString: {
			errorMessage: "Address must be a string"
		},
		trim: true
	},
	location: {
		in: ["body"],
		exists: {
			errorMessage: "Location is required"
		},
		notEmpty: {
			errorMessage: "Location cannot be empty"
		},
		custom: {
			options: (value) => {
				if (
					typeof value.latitude !== "number" ||
					typeof value.longitude !== "number"
				) {
					throw new Error("Latitude and Longitude must be numbers");
				}
				return true;
			},
		},
	},
	category: {
		in: ["body"],
		exists: {
			errorMessage: "Category is required"
		},
		notEmpty: {
			errorMessage: "Category cannot be empty"
		},
		isArray: {
			errorMessage: "Category must be an array of strings"
		},
		custom: {
			options: (value) => {
				if (!value.every((item) => typeof item === "string")) {
					throw new Error("Each category must be a string");
				}
				return true;
			},
		},
	},
	imageUrl: {
		in: ["body"],
		optional: true,
		isArray: {
			errorMessage: "Image URLs must be an array"
		},
		custom: {
			options: (value) => {
				if (!value.every((url) => typeof url === "string")) {
					throw new Error("Each image URL must be a string");
				}
				return true;
			},
		},
	},
	priceRange: {
		in: ["body"],
		optional: true,
		isString: {
			errorMessage: "Price Range must be a string"
		},
		trim: true
	},
	bestTimeToVisit: {
		in: ["body"],
		optional: true,
		isString: {
			errorMessage: "Best Time to Visit must be a string"
		},
		trim: true
	},
	activities: {
		in: ["body"],
		optional: true,
		isArray: {
			errorMessage: "Activities must be an array of strings"
		},
		custom: {
			options: (value) => {
				if (!value.every((item) => typeof item === "string")) {
					throw new Error("Each activity must be a string");
				}
				return true;
			},
		},
	},
	averageRating: {
		in: ["body"],
		optional: true,
		isFloat: {
			options: { min: 0, max: 5 },
			errorMessage: "Average rating must be a number between 0 and 5"
		},
		toFloat: true
	},
	website_url: {
		in: ["body"],
		optional: true,
		isURL: {
			errorMessage: "Website URL must be a valid URL"
		},
		trim: true
	},
	city: {
		in: ["body"],
		exists: {
			errorMessage: "City is required"
		},
		notEmpty: {
			errorMessage: "City cannot be empty"
		},
		isString: {
			errorMessage: "City must be a string"
		},
		trim: true
	},
	lastFetched: {
		in: ["body"],
		optional: true,
		isISO8601: {
			errorMessage: "Last Fetched must be a valid date"
		},
		toDate: true
	}
};

module.exports = placeValidation;
