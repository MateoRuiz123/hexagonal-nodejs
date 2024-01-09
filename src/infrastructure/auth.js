const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('./databasePool');

passport.use(new LocalStrategy({usernameField:"name",passwordField:"password"},async (name, password, done) => {
	try {
		const result = await pool.query('SELECT * FROM users WHERE name = $1 AND password = $2', [name, password]);

		if (result.rows.length > 0) {
			const user = result.rows[0];
			return done(null, user);
		} else {
			return done(null, false, {
				message: 'Incorrect name or password'
			});
		}
	} catch (e) {
		return done(e);
	}
}));

function generateToken(user) {
	return jwt.sign({
		id: user.id,
		name: user.name
	}, "secret_key", {
		expiresIn: "1h"
	})
}

module.exports = {
	passport,
	generateToken,
};