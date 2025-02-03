const SubscriptionPlan = require("../models/subscriptionPlan-model")
const { validationResult } = require("express-validator")

const SubscriptionPlanCtrls = {}
//Create Plan
SubscriptionPlanCtrls.CreatePlan = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	try {
		const { name, price, durationInDays, features } = req.body
		if (req.role !== "admin") {
			return res.status(401).json({ errors: "Unauthorized access. Please provide valid credentials." })
		}
		const newPlan = new SubscriptionPlan({
			name,
			price,
			durationInDays,
			features
		})
		await newPlan.save()
		return res.status(201).json(newPlan)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//update plan
SubscriptionPlanCtrls.updatePlan = async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const id = req.params.id
	const body = req.body
	try {
		const plan = await SubscriptionPlan.findByIdAndUpdate(id, body, { new: true, runValidators: true })
		if (!plan) {
			return res.status(404).json({ errors: "Plan not found" })
		}
		return res.status(201).json(plan)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

//get PlanById
SubscriptionPlanCtrls.getPlanById = async (req, res) => {
	const id = req.params.id
	try {
		const plan = await SubscriptionPlan.findById(id)
		if (!plan) {
			return res.status(404).json({ errors: "Plan not found!" })
		}
		return res.status(201).json(plan)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
SubscriptionPlanCtrls.getAllPlans = async (req, res) => {
	try {
		const plans = await SubscriptionPlan.find()
		if (plans.length === 0) {
			return res.status(404).json({ errors: "Plans not found" })
		}
		return res.status(201).json(plans)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}
SubscriptionPlanCtrls.removePlan = async (req, res) => {
	try {
		const id = req.params.id
		const plan = await SubscriptionPlan.findByIdAndDelete(id)
		if (!plan) {
			return res.status(404).json({ errors: "Plan not found" })
		}
		return res.status(201).json(plan)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ errors: "Something went wrong!" })
	}
}

module.exports = SubscriptionPlanCtrls