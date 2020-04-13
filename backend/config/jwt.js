module.exports = {
	secret: process.env.JWT_SECRET || 'jwt_secret',
	expires: process.env.JWT_EXPIRE_TIME || '1d'
}