const config = {
	hostname: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || '27017',
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
}

module.exports = config