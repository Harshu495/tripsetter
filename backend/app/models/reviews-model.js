const { Schema, model } = require("mongoose")

const reviewSchema = new Schema({
	reviewType: {
		type: "String",
		enum: ['place', 'guide', 'app']
	},
	entityId: {
		type: Schema.Types.ObjectId,
		refPath: "reviewType" // Dynamic reference to 'place', 'guide', or 'app'
	},
	entityName: String,
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	userName: String,
	rating: Number,
	comment: String
}, { timestamps: true })
const Review = model("Review", reviewSchema)
module.exports = Review