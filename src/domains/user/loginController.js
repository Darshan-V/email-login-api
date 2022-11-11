import verifyHashedData from './../../util/verifyHashedData.js'
import User from './model.js'

const authenticateUser = async (email, password) => {
	try {
		const fetchedUsers = await User.find({ email })
		if (!fetchedUsers.length) {
			throw Error('invalid credentials')
		} else {
			if (!fetchedUsers[0].verified) {
				throw Error('email not verified check inbox')
			} else {
				const hashedPassword = fetchedUsers[0].password
				const passwordMatch = await verifyHashedData(password, hashedPassword)
				if (!passwordMatch) {
					throw Error('invalid password')
				} else {
					return fetchedUsers
				}
			}
		}
	} catch (error) {
		throw error
	}
}
export default authenticateUser
