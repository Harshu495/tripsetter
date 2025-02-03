const express = require("express")
const router = express.Router()
const Authentcate = require("../middlewears/Authenticate.js")
const Authorize = require("../middlewears/Authorization.js")
const { checkSchema } = require("express-validator")
const { guideDetailsValidation, updateGuideDetailsValidation } = require("../validatores/guidDetails-Schema-model.js")
const GuidDetailCtrl = require("../controllers/Guid-ctrls.js")


router.post("/guide-details", Authentcate, Authorize(["Guid"]), checkSchema(guideDetailsValidation), async (req, res) => {
	const io = req.app.get("io");
	if (!io) {
		console.error("Socket.io instance not found!");
		return res.status(500).json({ error: "Socket.io not initialized" });
	}
	await GuidDetailCtrl.createGuide(req, res, io);
});
router.put("/guide-details/:guideDetailId", Authentcate, Authorize(["Guid"]), checkSchema(updateGuideDetailsValidation), async (req, res) => {
	const io = req.app.get("io");
	if (!io) {
		console.error("Socket.io instance not found!");
		return res.status(500).json({ error: "Socket.io not initialized" });
	}
	await GuidDetailCtrl.updateGuide(req, res, io);
})
router.put("/approveProfile/:guideDetailId", Authentcate, Authorize(["admin"]), async (req, res) => {
	const io = req.app.get("io");
	if (!io) {
		console.error("Socket.io instance not found!");
		return res.status(500).json({ error: "Socket.io not initialized" });
	}
	await GuidDetailCtrl.approveGuide(req, res, io);
})



router.delete("/guide-details/:id", Authentcate, Authorize(["Guid"]), GuidDetailCtrl.deleteGuidDetails)
router.get("/guide-details", Authentcate, Authorize(["Guid"]), GuidDetailCtrl.getGuidDetailByUserID)
router.get("/guide-details", Authentcate, Authorize(["admin"]), GuidDetailCtrl.getAllGuides)
router.get("/guide-details/:id", GuidDetailCtrl.getGuideById)
router.get("/guides/:placeId", GuidDetailCtrl.getGuidesForPlace)

router.get("/available",
	GuidDetailCtrl.getAvailableGuides)


module.exports = router