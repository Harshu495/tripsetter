const { validationResult } = require("express-validator")
const Review = require("../models/reviews-model.js")
const User = require("../models/user-model.js")
const Place = require("../models/place-model.js")
const ReviewCtrls = {}
ReviewCtrls.createReview = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const body = req.body
	try {
		const user = await User.findById({ _id: req.userId })
		const newReview = new Review(req.body)
		newReview.userId = user._id
		newReview.userName = user.name
		await newReview.save()
		return res.status(201).json(newReview)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//Get All Reviews for an Entity
ReviewCtrls.getReviewsByEntity = async (req, res) => {
	const { entityId } = req.params
	try {
		const reviews = await Review.find({ entityId })
			.populate("userId", "userName")// Populate user details if needed
			.sort({ createdAt: -1 })// Sort by creation date

		if (!reviews.length) {
			return res.status(404).json({ errors: "No reviews found for this entity." })
		}
		return res.status(201).json({ reviews })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//Get Reviews by User
ReviewCtrls.getReviewsByUser = async (req, res) => {
	const { userId } = req.params;
	try {
		const reviews = await Review.find({ userId })
			.sort({ createdAt: -1 }); // Sort by creation date
		if (!reviews.length) {
			return res.status(404).json({ errors: "No reviews found for this user." })
		}
		return res.status(201).json({ reviews })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//Update Review
ReviewCtrls.updateReview = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const reviewId = req.params.reviewId
	const { rating, comment } = req.body
	console.log(reviewId)
	try {
		const review = await Review.findById(reviewId)
		if (!review) {
			return res.status(404).json({ errors: "Review not found" })
		}
		// Check if the review belongs to the logged-in user
		if (review.userId.toString() !== req.userId.toString()) {
			return res.status(403).json({ message: "You are not authorized to update this review" });
		}
		review.rating = rating || review.rating;
		review.comment = comment || review.comment;
		await review.save()
		res.status(200).json({ message: "Review updated successfully", review });
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//Delete Review
ReviewCtrls.deleteReview = async (req, res) => {
	const reviewId = req.params.reviewId
	try {
		const review = await Review.findById(reviewId)
		if (!review) {
			return res.status(404).json({ errors: "Review not found" })
		}
		if (review.userId.toString() !== req.userId.toString()) {
			return res.status(403).json({ message: "You are not authorized to delete this review" });
		}
		const deleteReview = await Review.findByIdAndDelete(reviewId)
		res.status(200).json({ message: "Review deleted successfully", deleteReview });
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

ReviewCtrls.getAverageRating = async (req, res) => {
	try {
		const { entityId } = req.params
		const reviews = await Review.find({ entityId });

		if (!reviews.length) {
			return res.status(404).json({ message: "No reviews found for this entity." });
		}
		const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

		res.status(200).json({ average });
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
module.exports = ReviewCtrls