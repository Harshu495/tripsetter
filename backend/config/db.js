const mongoose = require("mongoose")

const CongifDb = async () => {
	try {
		const db = await mongoose.connect(process.env.DB_URL)
		console.log("Db is Connected")
	} catch (err) {
		console.log("Error connected to DB", err)
	}
}
module.exports = CongifDb