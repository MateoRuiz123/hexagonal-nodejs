const express = require('express');
const bodyParser = require('body-parser');
const {
	Pool
} = require('pg');
const {
	body
} = require('express-validator');
const {
	passport
} = require("./auth");
const jwt = require('jsonwebtoken');

//configuracion de la base de datos
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'hexagonal-nodejs-ejemplo',
	password: '14122004',
	port: 5432,
});

function configureServer(UserHttpAdapter) {
	const app = express();
	const PORT = 3000;

	app.use(bodyParser.json());
	app.use((req, res, next) => {
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader("Content-Security-Policy", "default-src 'self'");
		next();
	});

	// configuracion de passport
	app.use(passport.initialize());

	// Middleware para proteger rutas con autenticación mediante JWT
	function authenticateJWT(req, res, next) {
		const token = req.header("Authorization") ?.replace("Bearer ", ""); // el signo de interrogacion es para que no de error si no existe el header

		if (!token) {
			return res.status(401).json({
				message: "Unauthorized"
			});
		}

		jwt.verify(token, "secret_key", (err, user) => {
			if (err) {
				return res.status(403).json({
					message: "Forbidden",
					error: err
				});
			}

			req.user = user;
			next();
		});
	}

	// Rutas públicas
	app.post("/login", (req, res) => userHttpAdapter.loginUser(req, res));



	app.post("/users", [
		body("id").optional().isInt(),
		body("name").isString().notEmpty(),
		body("email").isEmail(),
	], (req, res, next) => UserHttpAdapter.createUser(req, res));

	// Nueva ruta get para obtener todos los usuarios
	app.get("/users", authenticateJWT, async (req, res) => {
		try {
			const result = await pool.query('SELECT * FROM users');
			const users = result.rows;
			res.json(users);
		} catch (error) {
			console.error("Error al obtener los usuarios", error)
			res.status(500).json({
				message: "Error al obtener los usuarios"
			});
		}
	});

	// Nueva ruta get para obtener un usuario por id
	app.get("/users/:id", async (req, res) => {
		const userId = req.params.id;
		try {
			const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
			const user = result.rows[0];
			if (user) {
				res.json(user);
			} else {
				res.status(404).json({
					message: "User not found"
				});
			}

		} catch (error) {
			console.error("Error al obtener el usuario", error)
			res.status(500).json({
				message: "Error al obtener el usuario"
			});
		}
	});

	// middleware para manejar errores
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).json({
			message: "Internal server error"
		});
	});

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = configureServer;