const nodemailer = require("nodemailer")
const twilio = require("twilio");
const generate = () => {
	return Math.floor(100000 + Math.random() * 900000).toString()
}
const createTransporter = () => {
	return nodemailer.createTransport({
		service: "gmail",// Replace with your SMTP host
		auth: {
			user: process.env.ADMIN_EMAIL, // Replace with your email
			pass: process.env.EMAIL_PASS //Replace with your email password
		}
	})
}
const accountSID = process.env.ACC_SID
const accountToken = process.env.ACC_TOKEN

// Initialize Twilio client
const client = twilio(accountSID, accountToken)

module.exports = { generate, createTransporter, client }