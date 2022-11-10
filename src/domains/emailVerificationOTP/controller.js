import bcrypt from 'bcrypt'
import UserOTPVerification from './model.js'
import generateOTP from '../../util/generateOTP.js'
import sendEmail from '../../util/sendEmail.js'

const sendOTPVerificationEmail = async ({ _id, email }) => {
	try {
		const otp = await generateOTP()

		const mailOptions = {
			from: process.env.AUTH_EMAIL,
			to: email,
			subject: 'verify email',
			html: `<p>Enter ${otp}</P>`,
		}

		const salt = 10
		const hashedOTP = await bcrypt.hash(otp, salt)
		const newOTPVerification = await new UserOTPVerification({
			userId: _id,
			otp: hashedOTP,
			createdAt: Date.now(),
			expireAt: Date.now() + 360000,
		})
		await newOTPVerification.save()
		await sendEmail(mailOptions)
		return {
			userId: _id,
			email,
		}
	} catch (err) {
		console.log('otp not defined')
		throw err
	}
}

export default sendOTPVerificationEmail
