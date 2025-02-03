const express = require("express")
const router = express.Router()
const Authentcate = require("../middlewears/Authenticate.js")
const Authorize = require("../middlewears/Authorization.js")
const SubscriptionPlanValidation = require("../validatores/subscriptionPlan-validation.js")
const { checkSchema } = require("express-validator")
const SubscriptionPlanCtrls = require("../controllers/SubscriptionPlan-Ctrl.js")

router.post("/subscription-plan", Authentcate, Authorize(["admin"]), checkSchema(SubscriptionPlanValidation), SubscriptionPlanCtrls.CreatePlan)
router.put("/subscription-plan/:id", Authentcate, Authorize(["admin"]), checkSchema(SubscriptionPlanValidation), SubscriptionPlanCtrls.updatePlan)
router.get("/subscription-plan/:id", SubscriptionPlanCtrls.getPlanById)
router.get("/subscription-plan", SubscriptionPlanCtrls.getAllPlans)
router.delete("/subscription-plan/:id", Authentcate, Authorize(["admin"]), SubscriptionPlanCtrls.removePlan)
module.exports = router