const express = require("express")
const router = express.Router()
const Authentcate = require("../middlewears/Authenticate.js")
const Authorize = require("../middlewears/Authorization.js")
const { checkSchema } = require("express-validator")
const { TripSchemaValidation, validateSelectPlace } = require("../validatores/trip-Schema-validation.js")
const TripCtrls = require("../controllers/Trip-ctrls.js")
router.post("/trips", Authentcate, Authorize(["Traveler"]), checkSchema(TripSchemaValidation), TripCtrls.createTrip)
router.get("/trips/allTrips", Authentcate, Authorize(["admin"]), TripCtrls.getAllTrips)
router.put("/trips/:id", Authentcate, Authorize(["Traveler"]), checkSchema(TripSchemaValidation), TripCtrls.updateTrip)
router.delete("/trips/:tripId", Authentcate, Authorize(["Traveler"]), TripCtrls.deleteTrip)
router.get("/trips/:tripId", TripCtrls.getTripById)
router.get("/trips", Authentcate, Authorize(["Traveler"]), TripCtrls.getMyTrips)
router.post('/select-place', Authentcate, checkSchema(validateSelectPlace), TripCtrls.selectPlace);
router.post("/selectGuid", Authentcate, TripCtrls.selectGuide
)
router.post("/guide/confirmBooking", Authentcate, Authorize(["Guid"]), TripCtrls.confirmGuideBooking);
router.get("/guide-trips", Authentcate, Authorize(["Guid"]), TripCtrls.guideTrips)
router.post("/trip/:tripId/place/:placeId/cancel", Authentcate, TripCtrls.cancelPlaceBooking)
router.get("/:tripId/itinerary", Authentcate, TripCtrls.getItinerary)
module.exports = router