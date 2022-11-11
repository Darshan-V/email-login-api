import bcrypt from 'bcrypt'

const hashData = async (data) => {
	try {
		const hashedData = await bcrypt.hash(data, 10)
		return hashedData
	} catch (error) {
		throw error
	}
}

export default hashData
