const { Schema, model } = require("mongoose")
const userSchema = new Schema({
	name: String,
	email: String,
	phone: String,
	password: String,
	role: String,
	profilePic: {
		type: String
	},
	address: {
		country: String,
		city: String,
		street: String,
		pincde: Number
	},
	status: {
		type: String,
		enum: ["Active", "Inactive"],
		default: "Active"
	},
	otp: String,
	otpExpireAt: Date
}, { timestamps: true })
const User = model("User", userSchema)
module.exports = User