import User from './model.js'
import hashData from '../../util/hashData.js'

export const createNewUser = async (data) => {
	try {
		const name = String(data.name)
		const email = String(data.email)
		const password = String(data.password)
		const existingUser = await User.find({ email })
		if (existingUser.length) {
			throw Error('user with email exist')
		} else {
			const hashedPassword = await hashData(password)
			const newUser = new User({
				name,
				email,
				password: hashedPassword,
				verified: false,
			})
			const createUser = await newUser.save()
			return createUser
		}
	} catch (error) {
		throw error
	}
}

export default createNewUser
