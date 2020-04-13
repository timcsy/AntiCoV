const mongoose = require('mongoose')
const f = require('util').format
const config = require('../../config/mongoose')

const hostname = config.hostname
const port = config.port
const user = encodeURIComponent(config.username);
const password = encodeURIComponent(config.password);
const dbName = config.database;
const authMechanism = 'DEFAULT';

// Connetion url
const url = f('mongodb://%s:%s@%s:%d/%s?authSource=admin', user, password, hostname, port, dbName)

mongoose.connect(url, {
	authMechanism: authMechanism,
	useNewUrlParser: true,
	useCreateIndex: true
})

module.exports = mongoose