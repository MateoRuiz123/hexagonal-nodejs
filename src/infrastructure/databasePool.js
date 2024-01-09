const {
	Pool
} = require("pg")

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'hexagonal-nodejs-ejemplo',
	password: '14122004',
	port: 5432,
})

module.exports = pool;