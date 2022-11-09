import mongoose from 'mongoose'
const schema = mongoose.Schema

const UserSchema = new schema({
	name: String,
	email: String,
	password: String,
	verified: Boolean,
})
const User = mongoose.model('User', UserSchema)
export default User
