import server from './server.js'

const port = 5000

const startServer = () => {
	server.listen(port, () => {
		console.log(`server running at ${port}`)
	})
}
startServer()
