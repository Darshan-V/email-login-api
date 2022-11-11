import bcrypt from 'bcrypt'

const verifyHashedData = async (unhashed, hashed) => {
	try {
		const match = await bcrypt.compare(unhashed, hashed)

		return match
	} catch (error) {
		throw error
	}
}
export default verifyHashedData
