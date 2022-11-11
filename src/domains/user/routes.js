import express from 'express'
import bcrypt from 'bcrypt'
const userRouter = express.Router()
import createNewUser from './controller.js'
import sendOTPVerificationEmail from './../emailVerificationOTP/controller.js'
import userOTPVerification from './../emailVerificationOTP/model.js'
import authenticateUser from './loginController.js'
import User from './model.js'

//signup
userRouter.post('/signup', async (req, res) => {
	try {
		let { name, email, password } = req.body
		name = name.trim()
		email = email.trim()
		password = password.trim()
		if (name === '' || email === '' || password === '') {
			throw Error('empty fields')
		} else if (!/^[a-zA-Z]*$/.test(name)) {
			throw Error('invalid nae')
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			new Error('invalid email')
		} else if (password.length < 8) {
			throw Error('invalid password password should be more than 8 characters')
		} else {
			const newUser = await createNewUser({
				name,
				email,
				password,
			})
			const emailData = await sendOTPVerificationEmail(newUser)
			res.json({
				status: 'pending',
				message: 'verification mail sent',
				data: emailData,
			})
		}
	} catch (err) {
		res.json({
			status: 'failed',
			message: err.message,
			line: err.stack,
		})
	}
})
//signin
userRouter.post('/signIn', async (req, res) => {
	try {
		let { email, password } = req.body
		email = email.trim()
		password = password.trim()
		if (email == '' || password == '') {
			throw Error('empty credentials')
		} else {
			let authenticatedUser = await authenticateUser(email, password)
			res.json({
				status: 'success',
				message: 'signin success',
				data: authenticatedUser,
			})
		}
	} catch (error) {
		res.json({
			status: 'failed',
			message: error.message,
		})
	}
})

//verifyotp
userRouter.post('/verifyOTP', async (req, res) => {
	try {
		let { userId, otp } = req.body
		if (!userId || !otp) {
			throw Error('Empty otp')
		} else {
			const userOTPVerificationRecord = await userOTPVerification.find({
				userId,
			})
			if (userOTPVerificationRecord.length <= 0) {
				throw new Error('account not exist or verified, login or signup')
			} else {
				const { expireAt } = userOTPVerificationRecord[0]
				const hashedOTP = userOTPVerificationRecord[0].otp

				if (expireAt < Date.now()) {
					userOTPVerification.deleteMany({ userId })
					throw new Error('code as expired')
				} else {
					const validOTP = await bcrypt.compare(otp, hashedOTP)
					if (!validOTP) {
						throw new Error('wrong otp')
					} else {
						await User.updateOne({ _id: userId }, { verified: true })
						res.json({
							status: 'verified',
							message: 'user email verified',
						})
					}
				}
			}
		}
	} catch (err) {
		res.json({
			status: 'failed',
			message: err.message,
		})
	}
})

//resend otp
userRouter.post('/resendOTPVerification', async (req, res) => {
	try {
		let { userId, email } = req.body
		if (!userId || !email) {
			throw Error('empty details not allowed')
		} else {
			await userOTPVerification.deleteMany({ userId })
			sendOTPVerificationEmail({ _id: userId, email })
			res.json({
				status: 'succes',
				message: 'otp resent',
			})
		}
	} catch (err) {
		res.json({
			status: 'failed',
			message: err.message,
		})
	}
})

export default userRouter
