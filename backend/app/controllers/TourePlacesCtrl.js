const axios = require("axios");
const Place = require("../models/place-model.js");
const Review = require("../models/reviews-model.js")
const {
	getCategory,
	getPlaceRange,
	getBestTimeToVisite,
	inferActivities,
	getCurrentSeason
} = require("./UtilityFunctions/PlaceUtilityFunction.js");
const { validationResult } = require("express-validator")

const TouristPlaceCtrl = {};

TouristPlaceCtrl.getPlaces = async (req, res) => {
	try {
		const { cityName, categories, lat, lng, page = 1, limit = 10 } = req.query;
		console.log("Input Parameters:", { cityName, categories, lat, lng });
		// Convert pagination params to numbers
		const pageNumber = parseInt(page, 10);
		const pageSize = parseInt(limit, 10);
		// Step 1: Determine Location (Lat/Lng)
		let location = { lat: parseFloat(lat), lng: parseFloat(lng) };

		if (!lat || !lng) {
			if (!cityName) {
				return res.status(400).json({ errors: "City name is required!" });
			}

			const geoCodeResponse = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
				params: { address: cityName, key: process.env.GOOGLE_API_KEY }
			});

			if (geoCodeResponse.data.results.length === 0) {
				return res.status(404).json({ errors: "City not found" });
			}

			location = geoCodeResponse.data.results[0].geometry?.location || { lat: 0, lng: 0 };
		}

		// Step 2: Handle Categories
		const categoryToTypeMap = {
			beach: ["natural_feature", "tourist_attraction"],
			temple: ["hindu_temple", "church", "mosque", "synagogue", "place_of_worship"],
			resort: ["lodging"],
			nature: ["tourist_attraction", "park"],
			historical: ["museum"],
			waterfalls: ["tourist_attraction", "natural_feature", "park"],
			tourist_attraction: ["tourist_attraction"] // Default category
		};

		const selectedCategories = categories ? categories.split(",").map(c => c.trim().toLowerCase()) : ["tourist_attraction"];
		console.log("Selected Categories:", selectedCategories);

		const dbCategories = selectedCategories.flatMap(cat => categoryToTypeMap[cat] || [cat]);
		console.log("DB Categories:", dbCategories);

		// Step 3: Search Database for Existing Places
		// Fetching Places from DB with Pagination
		const placesInDB = await Place.find({
			$or: [
				{ city: new RegExp(`^${cityName}$`, "i") },
				{ address: { $regex: cityName, $options: "i" } }
			],
			category: { $in: dbCategories }
		}).skip((pageNumber - 1) * pageSize)
			.limit(pageSize);

		console.log("Places found in DB:", placesInDB.length);

		// Step 4: Identify Missing Categories
		const existingCategories = new Set(placesInDB.flatMap(place => place.category));
		const missingCategories = selectedCategories.filter(category =>
			!(categoryToTypeMap[category] || [category]).some(type => existingCategories.has(type))
		);

		console.log("Existing Categories:", Array.from(existingCategories));
		console.log("Missing Categories:", missingCategories);

		// If all categories exist in DB, return data
		if (missingCategories.length === 0) {
			console.log("Returning places from DB.");
			return res.status(200).json(placesInDB);
		}

		// Step 5: Fetch Missing Data from Google Places API
		const fetchedPlaces = [];
		for (const category of missingCategories) {
			console.log(`Fetching category: ${category} in ${cityName}`);

			const apiResponse = await axios.get("https://maps.googleapis.com/maps/api/place/textsearch/json", {
				params: {
					query: `${category} in ${cityName}`,
					key: process.env.GOOGLE_API_KEY
				}
			});

			for (const place of apiResponse.data.results) {
				const existingPlace = await Place.findOne({ place_id: place.place_id });
				if (existingPlace) continue; // Avoid duplicate insertion

				const detailsResponse = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
					params: {
						place_id: place.place_id,
						key: process.env.GOOGLE_API_KEY
					}
				});

				const placeDetails = detailsResponse.data.result;
				const newPlace = {
					place_id: placeDetails.place_id,
					name: placeDetails.name,
					description: placeDetails.editorial_summary?.overview || "",
					location: {
						latitude: placeDetails.geometry?.location.lat || 0,
						longitude: placeDetails.geometry?.location.lng || 0
					},
					address: placeDetails.formatted_address || "Address not available",
					website_url: placeDetails.website || "",
					activities: inferActivities(placeDetails),
					category: placeDetails.types || [],
					imageUrl: placeDetails.photos?.map(photo =>
						`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${process.env.GOOGLE_API_KEY}`
					) || [],
					priceRange: getPlaceRange(placeDetails.price_level),
					bestTimeToVisit: getBestTimeToVisite(placeDetails.name),
					fixedAmount: 100, // Set a default amount for places fetched from Google
					averageRating: placeDetails.rating || 0,
					city: cityName,
					lastFetched: new Date()
				};

				const savedPlace = await Place.create(newPlace);
				fetchedPlaces.push(savedPlace);

				// Save Google reviews to the Review model instead of embedding in Place model
				if (placeDetails.reviews && placeDetails.reviews.length > 0) {
					const reviewData = placeDetails.reviews.map(review => ({
						entityId: savedPlace._id,  // Store the new place model ID
						reviewType: "place",
						entityName: savedPlace.name,
						userName: review.author_name,
						rating: review.rating,
						comment: review.text,
						createdAt: new Date(review.time * 1000)
					}));
					await Review.insertMany(reviewData)
				}
			}
		}

		// Combine DB and newly fetched places
		const allPlaces = [...placesInDB, ...fetchedPlaces];
		// Pagination metadata
		const totalPlaces = await Place.countDocuments({
			$or: [
				{ city: new RegExp(`^${cityName}$`, "i") },
				{ address: { $regex: cityName, $options: "i" } }
			],
			category: { $in: dbCategories }
		});

		res.status(200).json({
			data: allPlaces,
			currentPage: pageNumber,
			totalPages: Math.ceil(totalPlaces / pageSize),
			totalResults: totalPlaces,
		});

	} catch (err) {
		console.error("Error in getPlaces:", err);
		res.status(500).json({ errors: "Something went wrong!" });
	}
};
//Get Place by ID
TouristPlaceCtrl.getPlaceById = async (req, res) => {
	try {
		const place = await Place.findById(req.params.id)
		if (!place) {
			return res.status(404).json({ errors: "Place Not Found" })
		}
		return res.status(201).json(place)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went Wrong" })
	}
}
//Add a New Place (Manually)
TouristPlaceCtrl.addPlace = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const body = req.body
	try {
		const newPlace = new Place(body)
		await newPlace.save();
		return res.status(201).json(newPlace)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Invalid place data" })
	}
}

// Update Place by ID
TouristPlaceCtrl.updatePlace = async (req, res) => {

	try {
		const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true })
		if (!updatedPlace) {
			return res.status(404).json({ errors: "Place not found" })
		}
		return res.status(201).json(updatedPlace)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

// Delete Place by ID
TouristPlaceCtrl.deletePlace = async (req, res) => {
	try {
		const deletedPlace = await Place.findOneAndDelete(req.params.id)
		if (!deletedPlace) {
			return res.status(404).json({ errors: "Place not found" })
		}
		return res.status(201).json({ message: "Place deleted success" })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something Went Wrong!" })
	}
}

// Search Places by Keyword (within City)
TouristPlaceCtrl.searchPlaces = async (req, res) => {
	const { cityName, keyword } = req.query
	try {
		const places = await Place.find({
			city: new RegExp(`^${cityName}$`, "i"),
			name: { $regex: keyword, $options: "i" }
		})
		return res.status(201).json(places)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//Get Popular Places (Sorted by Rating)
TouristPlaceCtrl.getPopularPlaces = async (req, res) => {
	const { page = 1, limit = 10 } = req.querry //default value
	try {
		// Convert query params to integers and ensure they are positive numbers
		const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
		const pageSize = parseInt(limit) > 0 ? parseInt(limit) : 10;
		// Calculate the number of documents to skip
		const skip = (pageNumber - 1) * pageSize;

		// Fetch popular places sorted by highest rating, apply pagination
		const places = await Place.find()
			.sort({ averageRating: -1 })// Sort by rating in descending order
			.skip(skip)
			.limit(pageSize);

		// Count total number of places (for pagination metadata)
		const totalPlaces = await Place.countDocuments();

		return res.status(201).json({
			page: pageNumber,
			limit: pageSize,
			totalPages: Math.ceil(totalPlaces / pageSize),
			totalResults: totalPlaces,
			results: places,
		})
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//
TouristPlaceCtrl.getNearbyPlaces = async (req, res) => {
	const { lat, lng, radius, page = 1, limit = 10 } = req.query;
	try {
		if (!lat || !lng || !radius) {
			return res.status(400).json({ error: "Latitude, Longitude, and Radius are required" });
		}
		const pageNumber = parseInt(page);
		const pageSize = parseInt(limit);
		const skip = (pageNumber - 1) * pageSize;
		const nearbyPlaces = await Place.find({
			location: {
				$geoWithin: {
					$centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1]  // Radius in kilometers
				}
			}
		})
			.skip(skip)
			.limit(pageSize);

		const totalPlaces = await Place.countDocuments({
			location: {
				$geoWithin: {
					$centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1]
				}
			}
		});

		res.status(200).json({
			places: nearbyPlaces,
			totalResults: totalPlaces,
			totalPages: Math.ceil(totalPlaces / pageSize),
			currentPage: pageNumber
		});

	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

TouristPlaceCtrl.getPlacesByCategory = async (req, res) => {
	try {
		const { category, cityName, page = 1, limit = 10 } = req.query;

		if (!category || !cityName) {
			return res.status(400).json({ error: "Category and City are required" });
		}

		const pageNumber = parseInt(page);
		const pageSize = parseInt(limit);
		const skip = (pageNumber - 1) * pageSize;

		const places = await Place.find({
			$or: [
				{ city: new RegExp(`^${cityName}$`, "i") },
				{ address: { $regex: cityName, $options: "i" } }
			],
			category: { $regex: category, $options: "i" }
		})
			.skip(skip)
			.limit(pageSize);

		const totalPlaces = await Place.countDocuments({
			$or: [
				{ city: new RegExp(`^${cityName}$`, "i") },
				{ address: { $regex: cityName, $options: "i" } }
			],
			category: { $regex: category, $options: "i" }
		});

		res.status(200).json({
			places,
			totalResults: totalPlaces,
			totalPages: Math.ceil(totalPlaces / pageSize),
			currentPage: pageNumber
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Something went wrong" });
	}
}

TouristPlaceCtrl.getSeasonPlaces = async (req, res) => {
	try {
		const season = getCurrentSeason(); // Get the current season
		const { page = 1, limit = 10 } = req.query;
		console.log("Seson", season)
		// // Convert pagination params to numbers
		const pageNumber = parseInt(page, 10);
		const pageSize = parseInt(limit, 10);

		// Fetch places based on the best time to visit matching the current season
		const placesInDB = await Place.find({
			bestTimeToVisit: season
		})
			.skip((pageNumber - 1) * pageSize)
			.limit(pageSize);

		// Get total number of matching places for pagination
		const totalPlaces = await Place.countDocuments({
			bestTimeToVisit: "All year round"
		});

		//Return the data with pagination metadata
		res.status(200).json({
			data: placesInDB,
			currentPage: pageNumber,
			totalPages: Math.ceil(totalPlaces / pageSize),
			totalResults: totalPlaces,
		});
		r
	} catch (err) {
		console.error("Error in getSeasonPlaces:", err);
		res.status(500).json({ errors: "Something went wrong!" });
	}
};


module.exports = TouristPlaceCtrl;
