
const User = require("../models/user-model.js")
const RegisterValidation = {
	name: {
		in: ['body'],
		exists: {
			errorMessage: "Name Feild is required "
		},
		notEmpty: {
			errorMessage: "Name cannot be empty"
		},
		trim: true
	},
	email: {
		in: ["body"],
		exists: {
			errorMessage: "Email Feild is required"
		},
		notEmpty: {
			errorMessage: "Email cannot be empty"
		},
		isEmail: {
			errorMessage: "Email should be in valid format"
		},
		trim: true,
		normalizeEmail: true,
		custom: {
			options: async function (value) {
				try {
					const user = await User.findOne({ email: value })
					if (user) {
						throw new Error("Email is already exists")
					}
				} catch (err) {
					throw new Error(err.message)
				}
				return true
			}
		}

	},
	phone: {
		in: ["body"],
		exists: {
			errorMessage: "Phone Feild is required"
		},
		notEmpty: {
			errorMessage: "Phone cannot be empty"
		},
		trim: true,
		custom: {
			options: async function (value) {
				try {
					const user = await User.findOne({ phone: value })
					if (user) {
						throw new Error("PhoneNumber is already exists")
					}
				} catch (err) {
					throw new Error(err.message)
				}
				return true
			}
		}

	},
	password: {
		in: ['body'],
		exists: {
			errorMessage: "Password Feild is required "
		},
		notEmpty: {
			errorMessage: "Password cannot be empty"
		},
		trim: true,
		isStrongPassword: {
			options: {
				minLength: 5,
				maxLength: 12,
				minLowerCase: 1,
				minUpperCase: 1,
				minNumber: 1,
				minSymbol: 1
			},
			errorMessage: "password must cotain atleast one lowercase,one uppercase,one nummber,one symbol and it must be minimum 8 character long"
		}
	},
	role: {
		in: ['body'],
		exists: {
			errorMessage: "role feild is required"
		},
		default: "Traveler",
		isIn: {
			options: [['Traveler', 'Guid', "admin"]],
			errorMessage: "Role must be one of TRAVELER, GUIDE, or ADMIN"
		}
	},

};

const loginValidation = {
	email: {
		in: ["body"],
		exists: {
			errorMessage: "Email Feild is required"
		},
		notEmpty: {
			errorMessage: "Email cannot be empty"
		},
		isEmail: {
			errorMessage: "Email should be in valid format"
		},
		trim: true,
		normalizeEmail: true,
	},
	password: {
		in: ['body'],
		exists: {
			errorMessage: "Password Feild is required "
		},
		notEmpty: {
			errorMessage: "Password cannot be empty"
		},
		trim: true,
		isStrongPassword: {
			options: {
				minLength: 6,
				maxLength: 12,
				minLowerCase: 1,
				minUpperCase: 1,
				minNumber: 1,
				minSymbol: 1
			},
			errorMessage: "password must cotain atleast one lowercase,one uppercase,one nummber,one symbol and it must be minimum 8 character long"
		}
	},
}
module.exports = { RegisterValidation, loginValidation }