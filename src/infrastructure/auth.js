// auth.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const pool = require('./databasePool');
const ExtractJWT = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;

// Configuración de la estrategia local
passport.use(new LocalStrategy({
	usernameField: "name",
	passwordField: "password"
}, async (name, password, done) => {
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

const jwtOptions = {
	jwtFromRequest: ExtractJWT.fromExtractors([
		ExtractJWT.fromUrlQueryParameter('token'),
		ExtractJWT.fromBodyField('token'),
		ExtractJWT.fromAuthHeaderAsBearerToken(),
	]),
	secretOrKey: 'secret_key',
};

// Configuración de la estrategia JWT
passport.use(new JWTStrategy({
	jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
	secretOrKey: 'secret_key'
}, jwtOptions, (jwtPayload, done) => {
	// Implementa la lógica para verificar y obtener el usuario desde el payload JWT
	// Aquí asumimos que el ID del usuario está presente en el payload
	const userId = jwtPayload.id;
	pool.query('SELECT * FROM users WHERE id = $1', [userId], (err, result) => {
		if (err) {
			return done(err, false);
		}

		if (result.rows.length > 0) {
			const user = result.rows[0];
			return done(null, user);
		} else {
			return done(null, false);
		}
	});
}));

function generateToken(user) {
	return jwt.sign({
		id: user.id,
		name: user.name
	}, "secret_key", {
		expiresIn: "1h"
	});
}

module.exports = {
	passport,
	generateToken
};