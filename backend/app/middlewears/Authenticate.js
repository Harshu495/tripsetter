const jwt = require("jsonwebtoken")
const Authentcate = async (req, res, next) => {
	const token = req.headers['authorization']
	if (!token) {
		return res.status(401).json({ errors: "Token not provided" })
	}
	try {
		const tokenData = jwt.verify(token, process.env.SECRET_KEY)
		console.log(tokenData)
		req.userId = tokenData.userId,
			req.role = tokenData.role
		next()
	} catch (err) {
		return res.status(401).json({ errors: err.message })
	}
}
module.exports = Authentcate