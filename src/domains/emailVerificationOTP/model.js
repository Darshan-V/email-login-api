import mongoose from 'mongoose'
const schema = mongoose.Schema

const UserOTPVerificationSchema = new schema({
	userId: String,
	otp: String,
	createdAt: Date,
	expireAt: Date,
})
const UserOTPVerification = mongoose.model('userOTPVerification', UserOTPVerificationSchema)
export default UserOTPVerification
