const User = require("../models/user-model.js")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const { generate, createTransporter, client } = require("./UtilityFunctions/userFunction.js")
const userCtrl = {}
userCtrl.SignUp = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const body = req.body
	const user = new User(body)
	try {
		const salt = await bcryptjs.genSalt()
		const hash = await bcryptjs.hash(body.password, salt)
		user.password = hash
		const userCount = await User.countDocuments()
		if (userCount === 0) {
			user.role = "admin"
		}
		await user.save()
		return res.status(201).json(user)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
userCtrl.Passwordlogin = async (req, res) => {

	const { identifier, type, password } = req.body
	console.log(identifier, type, password)
	try {
		let user;
		if (type === "email") {
			user = await User.findOne({ email: identifier })
			if (!user) {
				return res.status(404).json({ errors: "Record not found" })
			}
		} else if (type === "phone") {
			const phone = identifier.slice(1)
			user = await User.findOne({ phone })
			if (!user) {
				return res.status(404).json({ errors: "Record not found" })
			}
		}

		const isValidUser = await bcryptjs.compare(password, user.password)
		if (!isValidUser) {
			return res.status(404).json({ errors: "invalid Email or Password" })
		}
		const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "7d" })
		return res.status(201).json({ token: token })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
userCtrl.account = async (req, res) => {
	try {
		const user = await User.findById(req.userId)
		if (!user) {
			return res.status(404).json({ errors: "Record not dound" })
		} else {
			return res.status(201).json(user)
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong" })
	}
}
userCtrl.allUsers = async (req, res) => {
	try {
		const users = await User.find()
		return res.status(201).json(users)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong" })
	}
}
userCtrl.update = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const body = req.body
	const id = req.userId
	try {
		const user = await User.findByIdAndUpdate(id, body, { new: true })
		if (!user) {
			return res.status(404).json({ errors: "record not found" })
		} else {
			return res.status(201).json(user)
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong" })
	}
}
userCtrl.delete = async (req, res) => {
	const id = req.userId
	try {
		const user = await User.findByIdAndDelete(id)
		if (!user) {
			return res.status(404).json({ errors: "record not found" })
		} else {
			return res.status(201).json(user)
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong" })
	}
}

userCtrl.findUser = async (req, res) => {
	const { identifier, type } = req.body

	if (!identifier || !type) {
		return res.status(400).json({ errors: "Identigier and Type are required" })
	}
	try {
		let user;
		if (type === "email") {
			user = await User.findOne({ email: identifier })
			if (!user) {
				return res.status(404).json({ errors: "We cannot find an account with that email address" })
			}
		} else if (type === "phone") {
			const phone = identifier.slice(1)
			user = await User.findOne({ phone: phone })
			if (!user) {
				return res.status(404).json({ errors: "We cannot find an account with that Phone number" })
			}
		}
		return res.status(201).json({ value: type === "email" ? user.email : user.phone, user })
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

userCtrl.generateOtp = async (req, res) => {
	const { identifier, type } = req.body
	const transporter = createTransporter()
	const otp = generate()
	const otpExpire = Date.now() + 5 * 60 * 1000
	try {
		let user;
		if (type === "email") {
			user = await User.findOne({ email: identifier })
			if (!user) {
				return res.statue(404).json({ errors: "Record not found" })
			} else {
				const mailOptions = {
					from: process.env.ADMIN_EMAIL,
					to: user.email,
					subject: "Your OTP for Verification",
					text: ` Your OTP for verification is ${otp}. This OTP is valid for 5 minutes. Please do not share it with anyone.`
				};
				user.otp = otp
				user.otpExpireAt = otpExpire
				await user.save()
				await transporter.sendMail(mailOptions)
				return res.status(201).json({ otp: user.otp, user })
			}
		} else if (type === "phone") {
			const phone = identifier.slice(1)
			user = await User.findOne({ phone: phone })
			if (!user) {
				return res.statue(404).json({ errors: "Record not found" })
			} else {
				const twilioPhoneNumber = process.env.TIWLIO_PHONE
				user.otp = otp
				user.otpExpireAt = otpExpire
				await user.save()
				const mesaage = await client.messages.create({
					body: `Your OTP for verification is: ${otp}. This OTP is valid for the next 5 minutes.`,
					from: twilioPhoneNumber,
					to: identifier
				})
				return res.status(201).json({ user: user.phone, otp: user.otp, user })
			}
		}

	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
userCtrl.verifyOtp = async (req, res) => {
	const { otp, identifier, type } = req.body
	if (!otp) {
		return res.status(400).json({ errors: "OTP is required" })
	}
	try {
		let user;
		if (type === "email") {
			user = await User.findOne({ email: identifier })
			if (!user) {
				return res.status(404).json({ errors: "Record not found" })
			}
			// res.status(201).json(user.otp)
		} else if (type === "phone") {
			const phone = identifier.slice(1)
			user = await User.findOne({ phone: phone })
			if (!user) {
				return res.status(404).json({ errors: "Record not found" })
			}
			// res.status(201).json(user.otp)
		}
		if (user.otp !== otp) {
			return res.status(400).json({ errors: "Invalid OTP" })
		} else if (new Date() > user.otpExpireAt) {
			return res.status(400).json({ errors: "OTP expired" })
		} else {

			const token = jwt.sign({ userId: user._id, role: user.role },
				process.env.SECRET_KEY, { expiresIn: "7d" })

			return res.status(201).json({ token: token })
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
module.exports = userCtrl