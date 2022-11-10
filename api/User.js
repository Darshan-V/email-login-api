import express from 'express'
const router = express.Router()
export default router
import User from '../models/User.js'
// import UserVerification from '../models/UserVerification.js'
import UserOTPVerification from '../models/UserOTPVerification.js'
// import PasswordReset from '../models/PasswordReset.js'

import nodemailer from 'nodemailer'

import { v4 as uuid } from 'uuid'
import bcrypt from 'bcrypt'

import dotenv from 'dotenv'
dotenv.config()

import * as path from 'path'

let transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASS,
	},
})

transporter.verify((error, success) => {
	if (error) {
		console.log(error)
	} else {
		console.log('Ready for messages')
		console.log(success)
	}
})

const url = 'http://localhost:5000'

//signup with email
router.post('/signup', (req, res) => {
	let { name, email, password } = req.body
	name = name.trim()
	email = email.trim()
	password = password.trim()

	if (name === '' || email === '' || password === '') {
		res.json({
			status: 'failed',
			message: 'empty input fields!',
		})
	} else if (!/^[a-zA-Z]*$/.test(name)) {
		res.json({
			status: 'failed',
			message: 'invalid name',
		})
	} else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
		res.json({
			status: 'failed',
			message: 'invalid email',
		})
	} else if (password.length < 8) {
		res.json({
			status: 'failed',
			message: 'password shold be more than 8 characters',
		})
	} else {
		User.find({ email })
			.then((result) => {
				if (result.length) {
					res.json({
						status: 'failed',
						message: 'user with email exist',
					})
				} else {
					const salt = 10
					bcrypt
						.hash(password, salt)
						.then((hashedPassword) => {
							const newUser = new User({
								name,
								email,
								password: hashedPassword,
								verified: false,
							})
							newUser
								.save()
								.then((result) => {
									sendOTPVerificationEmail(result, res)
								})
								.catch((err) => {
									console.log(err)
									res.json({
										status: 'failed',
										message: 'error occured - creating user',
									})
								})
						})
						.catch((err) => {
							console.log(err)
							res.json({
								status: 'failed',
								message: 'error occured - password',
							})
						})
				}
			})
			.catch((err) => {
				console.log(err)
				res.json({
					status: 'failed',
					message: 'error while checking existing user',
				})
			})
	}
})

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
	try {
		const otp = `${Math.floor(1000 + Math.random() * 9000)}`

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
		await transporter.sendMail(mailOptions)
		res.json({
			status: 'pending',
			message: 'otp sent to the email',
			data: {
				userId: _id,
				email,
			},
		})
	} catch (err) {
		res.json({
			ststus: 'failed',
			message: err.message,
		})
	}
}

// verify otp email
router.post('/verifyOTP', async (req, res) => {
	try {
		let { userId, otp } = req.body
		if (!userId || !otp) {
			throw Error('Empty otp')
		} else {
			const userOTPVerificationRecord = await UserOTPVerification.find({
				userId,
			})
			if (userOTPVerificationRecord.length <= 0) {
				throw new Error('account not exist or verified, login or signup')
			} else {
				const { expireAt } = userOTPVerificationRecord[0]
				const hashedOTP = userOTPVerificationRecord[0].otp

				if (expireAt < Date.now()) {
					UserOTPVerification.deleteMany({ userId })
					throw new Error('code as expired')
				} else {
					const validOTP = await bcrypt.compare(otp, hashedOTP)
					if (!validOTP) {
						throw new Error('wrong otp')
					} else {
						await User.updateOne({ _id: userId }, { verified: true })
						await User.deleteMany({ userId })
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

//resend otp verification
router.post('/resendOTPVerification', async (req, res) => {
	try {
		let { userId, email } = req.body
		if (!userId || !email) {
			throw Error('empty details not allowed')
		} else {
			await UserOTPVerification.deleteMany({ userId })
			sendOTPVerificationEmail({ _id: userId, email }, res)
		}
	} catch (err) {
		res.json({
			status: 'failed',
			message: err.message,
		})
	}
})
