const { Schema, model } = require("mongoose")
const { schema } = require("./user-model")
const guidBookinSchema = new Schema({
	trip: { type: Schema.Types.ObjectId, ref: 'Trip' },
	guide: { type: Schema.Types.ObjectId, ref: 'Guide' },
	traveler: { type: Schema.Types.ObjectId, ref: 'User' },
	status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
	confirmationDate: { type: Date },
	payment: {
		amount: { type: Number },
		status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
	}
})