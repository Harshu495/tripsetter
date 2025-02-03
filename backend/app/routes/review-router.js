const { checkSchema } = require("express-validator")
const Authentcate = require("../middlewears/Authenticate.js")
const Authorization = require("../middlewears/Authorization.js")
const { reviewValidation, updateReviewValidation } = require("../validatores/review-Schema-validation.js")
const ReviewCtrls = require("../controllers/Review-ctrls.js")
const express = require("express")
const router = express.Router()
// POST: Create a new review
router.post('/reviews', Authentcate, Authorization(["Traveler"]), checkSchema(reviewValidation), ReviewCtrls.createReview)
// GET: Fetch reviews for a specific entity (by entityId)
router.get("/reviews/entity/:entityId", ReviewCtrls.getReviewsByEntity)
// GET: Fetch reviews written by a specific user (by userId)
router.get("/reviews/user/:userId", Authentcate, ReviewCtrls.getReviewsByUser)
// PUT: Update a specific review by reviewId
router.put("/reviews/:reviewId", Authentcate, checkSchema(updateReviewValidation), ReviewCtrls.updateReview)

// DELETE: Delete a specific review by reviewId
router.delete('/reviews/:reviewId', Authentcate, ReviewCtrls.deleteReview);

// GET: Get the average rating of an entity (by entityId)
router.get('/reviews/average/:entityId', ReviewCtrls.getAverageRating);
module.exports = router