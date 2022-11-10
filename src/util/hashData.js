import bcrypt from 'bcrypt'

const hashData = async (data, salt) => {
	try {
		salt = 10
		const hashedData = await bcrypt.hash(data, salt)
		return hashedData
	} catch (error) {
		throw error
	}
}

export default hashData
