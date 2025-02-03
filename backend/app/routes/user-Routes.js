const express = require("express")
const Authentcate = require("../middlewears/Authenticate.js")
const Authorize = require("../middlewears/Authorization.js")
const { RegisterValidation } = require("../validatores/user-Schema-validation.js")
const { checkSchema } = require("express-validator")

const userCtrl = require("../controllers/user-ctrls")

const router = express.Router()
router.post("/SignUp", checkSchema(RegisterValidation), userCtrl.SignUp)
router.post("/findUser", userCtrl.findUser)
router.post("/generateOtp", userCtrl.generateOtp)
router.post("/verifyOtp", userCtrl.verifyOtp)
router.post("/Passwordlogin", userCtrl.Passwordlogin)
router.get("/profile", Authentcate, userCtrl.account)
router.get("/allUsers", Authentcate, Authorize(["admin"]), userCtrl.allUsers)
router.put("/update", Authentcate, userCtrl.update)
router.delete("/delete", Authentcate, userCtrl.delete)
module.exports = router