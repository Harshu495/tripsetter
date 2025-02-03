const Authorize = (primittedRoles) => {
	return (req, res, next) => {
		if (primittedRoles.includes(req.role)) {
			next()
		} else {
			return res.status(403).json({ errors: "Unauthorized Access" })
		}
	}
}
module.exports = Authorize