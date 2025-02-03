const Trip = require("../models/trip-model.js")
const Place = require("../models/place-model.js")
const Notification = require("../models/Notification.js")
const User = require("../models/user-model.js")
const GuidDetail = require("../models/guid-Model.js")
const { validationResult } = require("express-validator")
const moment = require("moment")
const mongoose = require("mongoose")

const TripCtrls = {}
// Controller function to create a new trip
TripCtrls.createTrip = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	console.log(req.userId)
	const { tripName, numberOfDays, numberOfPeople, startDateTime, endDateTime } = req.body

	try {
		console.log('startDateTime', startDateTime)
		console.log("endDateTime", endDateTime)
		// Calculate number of days based on start and end dates
		const startDate = new Date(startDateTime);
		const endDate = new Date(endDateTime);
		console.log("startDate", startDate)
		console.log("endDate", endDate)
		const calculatedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
		console.log(calculatedDays)
		const newTrip = new Trip({
			userId: req.userId, // Assuming user ID is from authentication middleware
			tripName,
			numberOfDays: calculatedDays,
			numberOfPeople,
			startDateTime,
			endDateTime,
			status: "pending"
		});
		// Save the trip to the database
		await newTrip.save()
		// Send response after trip is created
		return res.status(201).json(newTrip)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
TripCtrls.getTripById = async (req, res) => {
	const { tripId } = req.params
	console.log(tripId)
	try {
		const trip = await Trip.findById(tripId)
		if (!trip) {
			return res.status(404).json({ errors: "Trip not found" })
		}
		return res.status(201).json(trip)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
TripCtrls.getMyTrips = async (req, res) => {
	try {
		const trips = await Trip.find({ userId: req.userId })
		if (!trips.length) {
			return res.status(404).json({ errors: "Trips Not Found" })
		}
		return res.status(201).json(trips)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
TripCtrls.getAllTrips = async (req, res) => {
	try {
		if (req.role !== "admin") {
			return res.status(403).json({ errors: "Unauthorized Access" })
		}
		const trips = await Trip.find()
		if (!trips.length) {
			return res.status(404).json({ errors: "Trips Not Found" })
		}
		return res.status(201).json(trips)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

TripCtrls.updateTrip = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const id = req.params.id
	const body = req.body
	body.userId = req.userId
	try {
		const trip = await Trip.findByIdAndUpdate(id, body, { new: true, runValidators: true })
		if (!trip) {
			return res.status(404).json({ errors: "Trip not found" })
		}
		return res.status(201).json(trip)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
TripCtrls.deleteTrip = async (req, res) => {
	const { tripId } = req.params
	try {
		const trip = await Trip.findByIdAndDelete(tripId)
		if (!trip) {
			return res.status(404).json({ errors: "Trip not found" })
		}
		return res.status(201).json(trip)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
//Select a Place for the Trip
TripCtrls.selectPlace = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const { tripId, placeId, selectedDate, fromTime, toTime } = req.body;
	try {
		const trip = await Trip.findById(tripId)
		if (!trip) {
			return res.status(404).json({ errors: "Trip Not Found" })
		}
		// Convert trip start and end date to UTC midnight
		const tripStartDate = new Date(trip.startDateTime).setUTCHours(0, 0, 0, 0);
		const tripEndDate = new Date(trip.endDateTime).setUTCHours(23, 59, 59, 999);

		// Convert selected date to UTC midnight
		const selectDateObj = new Date(selectedDate + "T00:00:00.000Z");
		// Check if selected date is within trip duration
		if (selectDateObj < tripStartDate || selectDateObj > tripEndDate) {
			return res.status(400).json({ success: false, message: "Selected date is outside the trip duration." });
		}
		const place = await Place.findById(placeId)
		if (!place) {
			return res.status(404).json({ errors: "Place Not Found" })
		}
		trip.places.push({
			placeId,
			date: selectDateObj,
			fromTime,
			toTime,
			guideId: null,  // To be set later after guide selection
		})
		await trip.save(res.status(200).json({ success: true, message: "Place added successfully. Proceed to guide selection.", trip }))
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Smoething went wrong!" })
	}
}

//Assigning the Selected Guide to the Trip
TripCtrls.selectGuide = async (req, res) => {
	const io = req.app.get("io");
	if (!io) {
		console.error("Socket.io instance not found!");
		return res.status(500).json({ error: "Socket.io not initialized" });
	}

	try {
		const { tripId, placeId, guidId } = req.body


		const trip = await Trip.findById(tripId)
		if (!trip) {
			return res.status(404).json({ errors: "Trip Not Found" })
		}
		if (trip.userId.toString() !== req.userId) {
			return res.status(400).json({ errors: "Unauthorize Access" })
		}
		// Find the place inside the trip
		const placeIndex = trip.places.findIndex((p) => p.placeId.toString() === placeId)
		if (placeIndex === -1) {
			return res.status(404).json({ errors: "Place not found in trip" })
		}
		// Get the place details to fetch the default amount set by the admin
		const place = await Place.findById(placeId);
		if (!place) {
			return res.status(404).json({ success: false, message: "Place not found" });
		}
		// Get the guide's hourly rate from the User model
		const guide = await GuidDetail.findOne({ userId: guidId })
		if (!guide || !guide.hourlyRate) {
			return res.status(404).json({ success: false, message: "Guide not found or hourly rate missing" });
		}

		// Calculate total hours based on fromTime and toTime
		const fromTime = new Date(trip.places[placeIndex].fromTime);
		const toTime = new Date(trip.places[placeIndex].toTime);
		const totalHours = (toTime - fromTime) / (1000 * 60 * 60);  // Convert milliseconds to hours
		// Update guide availability
		const availabilityIndex = guide.availability.findIndex(a => {
			a.date.toISOString().split("T")[0] === fromTime.toISOString().split("T")[0]
		})
		if (availabilityIndex !== -1) {
			let availableSlot = guide.availability[availabilityIndex];
			// If the booked time is at the beginning of the slot
			if (availableSlot.fromTime.getTime() === fromTime.getTime()) {
				availableSlot.fromTime = toTime // Adjust start time
				// If the booked time is at the end of the slot
			} else if (availableSlot.toTime.getTime() === toTime.getTime()) {
				availableSlot.toTime = fromTime // Adjust end time
				// If the booked time is at the end of the slot
			} else if (availableSlot.fromTime < fromTime && availableSlot.toTime > toTime) {
				guide.availability.splice(availabilityIndex, 1,
					{ date: availableSlot.date, fromTime: availableSlot.fromTime, toTime: fromTime },
					{ date: availableSlot.date, fromTime: toTime, toTime: availableSlot.toTime }
				);
			} else {
				return res.status(400).json({ errors: "Guide not available at this time" });
			}
		}
		await guid.save()
		const placeAmount = place.fixedAmount ? place.fixedAmount : 0;
		// Calculate total amount
		const totalAmount = (totalHours * guide.hourlyRate) + placeAmount;
		console.log("PlaceAmount", place.fixedAmount)
		console.log("totalAmount", totalAmount)
		// Assign the selected guide
		trip.places[placeIndex].amount = totalAmount;
		trip.places[placeIndex].guidId = guidId
		trip.places[placeIndex].guideConfirmation = "pending";
		await trip.save();

		// Notify the guide using Socket.io
		const notificationMessage = `New trip request for Place: ${place.name}. Please confirm.`;


		// req.app.io.to(guideId.toString()).emit("newBooking", {
		io.to(guidId.toString()).emit("newBooking", {
			message: notificationMessage,
			tripId,
			placeId
		});
		// res.status(200).json({ success: true, message: "Notification sent" });
		// Store notification in database (in case guide is offline)
		const notification = new Notification({
			recipientRole: "Guid",
			recipientId: guidId,
			message: notificationMessage,
			type: "action",
			isRead: false
		});

		await notification.save();

		res.status(200).json({ success: true, message: "Guide selected successfully.", trip, notification });
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

TripCtrls.confirmGuideBooking = async (req, res) => {
	const io = req.app.get("io");
	if (!io) {
		console.error("Socket.io instance not found!");
		return res.status(500).json({ error: "Socket.io not initialized" });
	}
	try {
		const { tripId, placeId, response } = req.body
		const guideId = req.userId; // Extract guide ID from the authenticated user
		console.log(guideId)
		if (req.role !== "Guid") {
			return res.status(400).json({ errors: "Unothorized access" })
		}
		const trip = await Trip.findById(tripId)
		if (!trip) {
			return res.status(404).json({ errors: "Record not found" })
		}
		//Find the place withi that trip
		console.log(trip)
		const placeIndex = trip.places.findIndex((place) => place.placeId.toString() === placeId && place.guidId.toString() === guideId)
		if (placeIndex === -1) {
			return res.status(400).json({ errors: "Unauthorized or Invalide Place" })
		}
		// Update the guide confirmation status
		if (response === "accept") {
			trip.places[placeIndex].guideConfirmation = "Confirmed"
			await trip.save();

			// Notify the traveler
			io.to(trip.userId.toString()).emit("tripUpdate", {
				message: `Guide has accepted the trip for ${trip.places[placeIndex].placeId}`,
				tripId
			})
			return res.status(200).json({ message: "Trip accepted by guide" });
		} else if (response === "reject") {
			trip.places[placeIndex].guideConfirmation = "Rejected"
			await trip.save()

			// Notify the traveler
			io.to(trip.userId.toString()).emit("tripUpdate", {
				message: `Guide has rejected the trip for ${trip.places[placeIndex].placeId}. Please select another guide.`,
				tripId
			})
			return res.status(200).json({ message: "Trip rejected by guide" });
		} else {
			return res.status(400).json({ message: "Invalid response value" });
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

TripCtrls.guideTrips = async (req, res) => {
	try {
		const guidId = req.userId
		console.log(guidId)
		if (req.role !== "Guid") {
			return res.status(400).json({ errors: "Unauthorized access" })
		}
		const trips = await Trip.find({ "places.guidId": guidId }, {
			tripName: 1,
			numberOfPeople: 1,
			places: {
				$filter: {
					input: "$places",
					as: "place",
					cond: { $eq: ["$$place.guidId", new mongoose.Types.ObjectId(guidId)] }
				}
			}
		})
		console.log(trips)

		if (!trips || trips.length === 0) {
			return res.status(404).json({ errors: "No Trip Found" })
		}
		return res.status(201).json(trips)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
TripCtrls.cancelPlaceBooking = async (req, res) => {
	const io = req.app.get("io")
	if (!io) {
		console.error("Socket.io instance not found!");
		return res.status(500).json({ error: "Socket.io not initialized" });
	}
	const { tripId, placeId, } = req.params
	const { cancellationReason } = req.body
	try {
		// Validate ObjectIds
		if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(placeId)) {
			return res.status(400).json({ error: "Invalid trip or place ID" });
		}
		// Find the trip and check if the place exists
		const trip = await Trip.findOne({ _id: tripId, "places.placeId": placeId })
		if (!trip) {
			return res.status(404).json({ errors: "Trip or Place not found" })
		}
		// Find the specific place within the trip
		const place = trip.places.find(p => p.placeId.toString() === placeId)
		if (!place) {
			return res.status(404).json({ errors: "Place not found" })
		}
		// Update the guideConfirmation status to 'Cancelled' and store cancellation reason
		place.guideConfirmation = "Cancelled"
		place.cancellationReason = cancellationReason || "No reason provided"
		await trip.save()

		//Notify the guide about the cancellation
		const notification = new Notification({
			recipientRole: "Guid",
			recipientId: place.guidId,
			message: `Your booking for place ID ${placeId} has been cancelled. Reason: ${place.cancellationReason}`,
			isRead: false,
			type: "action"
		})
		await notification.save()
		// Emit real-time notification to the guide using Socket.io
		io.to(place.guidId.toString()).emit("notification", {
			message: `Your booking for place ${placeId} has been cancelled.`,
			reason: place.cancellationReason
		})

		// Update the guide's availability after cancellation
		const guid = await GuidDetail.findOne({ userId: place.guidId })
		console.log(guid)
		if (!guid) {
			return res.status(404).json({ errors: "Guide not found" })
		}
		// Restore the canceled time slot to the guide's availability
		const selectDateObj = new Date(place.date)// Assuming the place has a `date` field for cancellation
		const fromTimeObj = new Date(place.fromTime)// The canceled from time
		const toTimeObj = new Date(place.toTime)// The canceled to time

		// Find the availability slot that matches the place's time
		const availabilityIndex = guid.availability.findIndex((slot) => {
			slot.date.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0] &&
				slot.fromTime.toISOString() === fromTimeObj.toISOString() &&
				slot.toTime.toISOString() === toTimeObj.toISOString()
		})
		if (availabilityIndex === -1) {
			// If no exact match, we can add the slot back to the availability array
			guid.availability.push({
				date: selectDateObj,
				fromTime: fromTimeObj,
				toTime: toTimeObj
			})
		} else {
			// If the availability exists, restore the canceled slot
			guid.availability[availabilityIndex].toTime = toTimeObj; // Adjust according to how you want to handle availability merging
		}
		// Save the updated guide availability
		await guid.save();
		return res.status(201).json({
			message: "Place booking cancelled successfully",
			cancelledPlace: place
		})
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something Went Wrong!" })
	}
}
TripCtrls.getItinerary = async (req, res) => {

	const { tripId } = req.params
	try {
		const trip = await Trip.findById(tripId)
			.populate("places.placeId", "name address location")// Fetch place details (e.g., name, location)
			// .populate({
			// 	path: "places.guidId",// Populate guideId from GuideDetail
			// 	populate: { path: "userId", select: "name email" }
			// })
			.populate({
				path: "places.guidId",
				model: "User",
				select: "name email"
			})
		if (!trip) {
			return res.status(404).json({ errors: "Trip not found" })
		}

		// Group places by date
		const groupedItinerary = {};
		trip.places.forEach((place) => {
			const date = new Date(place.date).toISOString().split("T")[0];// Format the date (YYYY-MM-DD)
			if (!groupedItinerary[date]) {
				groupedItinerary[date] = [];
			}
			groupedItinerary[date].push(place);
		})
		// Sort each group by `fromTime`
		for (const date in groupedItinerary) {
			groupedItinerary[date].sort((a, b) => new Date(a.fromTime) - new Date(b.fromTime));
		}

		return res.status(201).json({ itinerary: groupedItinerary })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
module.exports = TripCtrls