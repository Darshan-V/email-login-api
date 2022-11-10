import express from 'express'
const userRouter = express.Router()
import createNewUser from './controller.js'
import sendOTPVerificationEmail from './../emailVerificationOTP/controller.js'

userRouter.post('/signup', async (req, res) => {
	try {
		// console.log('reached to userRouter')
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
		})
	}
})
export default userRouter
