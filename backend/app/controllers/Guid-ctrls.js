const GuidDetail = require("../models/guid-Model.js")
const User = require("../models/user-model.js")
const Notification = require("../models/Notification.js")
const { validationResult } = require("express-validator")


const GuidDetailCtrl = {}
GuidDetailCtrl.createGuide = async (req, res, io) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const body = req.body
	try {
		console.log("io", io)
		if (req.role !== "Guid") {
			return res.status(403).json({ error: "Only guides can create guide details" });
		}
		const { userId } = req;  // Assuming the userId comes from authenticated user

		// Create new guide details
		const newGuide = new GuidDetail({
			userId,
			...req.body,
			status: "pending",  // Default status
		});
		const user = await User.findById(req.userId)
		console.log("UserName", user.name)
		// newGuide.userId = req.userId
		await newGuide.save()

		// Step 3: Get admin's ID from the database (if needed)
		const admin = await User.findOne({ role: "admin" });  // Assuming your admin has the role "admin"
		if (!admin) {
			return res.status(500).json({ message: "No admin found to notify" });
		}

		// Create a notification
		const notification = new Notification({
			recipientRole: "admin",
			recipientId: admin._id,
			message: `New guide details submitted by user ${req.userId}, pending approval.`,
		});
		await notification.save();

		// Send notification to admin (real-time via WebSocket)
		if (req.app.get("io")) {
			const io = req.app.get("io"); // Access io from app instance
			io.sockets.emit("newGuideNotification", {
				guideId: newGuide._id,
				userId,
				userName: user.name,
				message: notification.message,
			});
		} else {
			console.error("Socket.io is not initialized.");
		}
		return res.status(201).json({ message: 'Guide created successfully', guide: newGuide, notification })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong" })
	}
}
GuidDetailCtrl.deleteGuidDetails = async (req, res) => {
	try {
		if (req.role !== "Guid") {
			return res.status(403).json({ error: "Only guides can delete guide details" });
		}
		const GuidDetails = await GuidDetail.findByIdAndDelete(req.params.id)
		if (!GuidDetails) {
			return res.status(404).json({ errors: "Guiddetails not found" })
		}
		return res.status(201).json({ GuidDetails })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
// Get all Guide Details (Admin view)
GuidDetailCtrl.getAllGuides = async (req, res) => {
	try {
		const guides = await GuideDetail.find().populate("userId", "name email role"); // Populate userId to get the user's details
		res.status(200).json(guides);
	} catch (error) {
		res.status(500).json({ error: "Server error", details: error.message });
	}
}

//Get Guid Details by Id
GuidDetailCtrl.getGuideById = async (req, res) => {
	try {
		const guideDetail = await GuidDetail.findById(req.params.id).populate("userId", "name email role")
		if (!guideDetail) {
			return res.status(404).json({ error: "Guide details not found" });
		}

		res.status(200).json(guideDetail);
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//// Admin approves guide profile
GuidDetailCtrl.approveGuide = async (req, res, io) => {
	try {
		const { guideDetailId } = req.params;  // Guide ID to approve
		// const { userId } = req;    // Assuming admin ID comes from the authenticated admin
		// Fetch the guide from the database using the guide ID
		const guide = await GuidDetail.findById(guideDetailId)

		if (!guide) {
			return res.status(404).json({ errors: "GuideDetail Not found" })
		}
		// Check if the user is an admin

		if (req.role !== "admin") {
			return res.status(403).json({ message: "Unauthorized action. Only admins can approve guides." });
		}
		// Update the guide status to "approved"
		guide.status = "approved";
		await guide.save();
		console.log(guide.status)
		// Fetch guide user info to send them a notification
		const guideUser = await User.findById(guide.userId);
		if (!guideUser) {
			return res.status(404).json({ message: "Guide user not found" });
		}
		// Emit a real-time notification to the guide via WebSocket
		io.emit('guideProfileApproved', {
			message: `Your profile has been approved by the admin.`,
			userName: guideUser.name,
			guideId: guide._id,
		});
		// Optionally, store a notification in the database for the guide
		const notification = new Notification({
			recipientRole: "Guid",
			recipientId: guide.userId,
			message: `Your profile has been approved by the admin.`,
		});

		await notification.save();

		// Return success response
		return res.status(201).json({ message: 'Guide profile approved successfully', guide });
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
GuidDetailCtrl.updateGuide = async (req, res, io) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const { guideDetailId } = req.params;  // Guide ID to update
		const body = req.body
		body.status = "pending"
		const guide = await GuidDetail.findByIdAndUpdate(guideDetailId, body, { new: true, runValidators: true })
		if (!guide) {
			return res.status(404).json({ message: "Guide profile not found" })
		}
		// Fetch admin details to notify them
		const admin = await User.findOne({ role: "admin" });
		if (!admin) {
			return res.status(500).json({ message: "No admin found to notify" });
		}

		// Notify the admin about the profile update
		io.emit("guideProfileUpdated", {
			message: `Guide ${req.userId} has updated their profile and needs re-approval.`,
			guideId: guide._id,
		});

		// Save notification to the database for admin
		const notification = new Notification({
			recipientRole: "admin",
			recipientId: admin._id,
			message: `Guide ${req.userId} has updated their profile, pending re-approval.`,
			status: "unread",
		});
		await notification.save()
		return res.status(200).json({ message: "Guide profile updated successfully", guide });
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
GuidDetailCtrl.getGuidDetailByUserID = async (req, res) => {
	try {
		const guideDetail = await GuidDetail.findOne({ userId: req.userId })
		if (!guideDetail) {
			return res.status(404).json({ errors: "Guide Details Not Found" })
		}
		return res.status(201).json(guideDetail)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

GuidDetailCtrl.getGuidesForPlace = async (req, res) => {
	const { placeId } = req.params
	try {
		console.log("Searching for placeId:", placeId);
		const guideDetails = await GuidDetail.find({ availablePlaces: placeId, status: "approved" })
			.populate({
				path: 'userId',  // Populating directly from User model
				select: 'name email phone role profilePic status ', // Get necessary fields
			})
		console.log("Fetched guide details:", guideDetails); // Debugging log
		// If no guides found for the given place
		if (guideDetails.length === 0) {
			return res.status(404).json({ message: 'No guides available for this place.' });
		}
		// Format response to include only required data
		const formattedData = guideDetails.map((guid) => ({
			guideDetail: guid,
			user: {
				name: guid.userId.name,
				email: guid.userId.email,
				phone: guid.userId.phone,
				role: guid.userId.role,
				profilePic: guid.userId.profilePic,
				userStatus: guid.userId.status
			}
		}))
		return res.status(201).json(formattedData)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

GuidDetailCtrl.getAvailableGuides = async (req, res) => {
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return res.status(400).json({ errors: errors.array() });
	// }
	const { placeId, date, fromTime, toTime } = req.query;
	try {

		// console.log(placeId, date, fromTime, toTime)

		// Convert query params to Date objects
		const selectedDate = new Date(date);
		const fromTimeObj = new Date(fromTime);
		const toTimeObj = new Date(toTime);
		// console.log(selectedDate, fromTimeObj, toTimeObj)
		// Find guides who are available for the given place and time
		const availableGuides = await GuidDetail.find({
			availablePlaces: placeId,
			status: "approved",
			// "availability.date": selectedDate,
			// "availability.fromTime": { $lte: fromTimeObj }, // Guide must be available from this time
			// "availability.toTime": { $gte: toTimeObj }
			availability: {
				$elemMatch: {
					date: selectedDate,// Match the date .toISOString().split("T")[0]
					fromTime: { $lte: fromTimeObj },// Guide must start before or at `fromTime`
					toTime: { $gte: toTimeObj }// Guide must end after or at `toTime`
				},
			},
		}).populate("useId", "name email");// Populate user details (name, email)

		if (!availableGuides.length) {
			return res.status(201).json({ errors: "Guides are not available for this place" })
		}
		return res.status(201).json({ availableGuides })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}


module.exports = GuidDetailCtrl