const Payment = require("../models/payment-model")
const { validationResult } = require("express-validator")
const stripe = require("stripe")(process.env.STRIPE_KEY)

const paymentCtrls = {}
paymentCtrls.pay = async (rea, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	try {

	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
module.exports = paymentCtrls