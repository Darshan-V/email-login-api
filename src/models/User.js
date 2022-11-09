import mongoose from 'mongoose'

module.exports = mongoose.model(
	'User',
	new mongoose.Schema({
		userName: String,
		password: String,
		email: String,
		emailVerificationCode: String,
		emailVerified: { type: Boolean, default: fasle },
	})
)
