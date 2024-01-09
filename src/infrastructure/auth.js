const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('./databasePool');

poassport.use(new LocalStrategy(async (username, password, done) => {
	try {
		const result = await pool.query('SELECT * FROM users WHERE name = $1 AND password = $2', [username, password]);

		if (result.rows.length > 0) {
			const user = result.rows[0];
			return done(null, user);
		} else {
			return done(null, false, {
				message: 'Incorrect username or password'
			});
		}
	} catch (e) {
		return done(e);
	}
}));

function generateToken(user) {
	return jwt.sign({
		id: user.id,
		username: user.name
	}, "secret_key", {
		expiresIn: "1h"
	})
}

module.exports = {
	generateToken,
	passport
};