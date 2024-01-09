// src/infrastructure/server.js
const express = require("express");
const bodyParser = require("body-parser");
const {
	passport
} = require("./auth");
const jwt = require("jsonwebtoken");
const pool = require("./databasePool"); // Importa el pool de la base de datos
const {
	body
} = require("express-validator");

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

	// Configuración de passport
	app.use(passport.initialize());

	// Middleware para proteger rutas con autenticación mediante JWT
	async function authenticateJWT(req, res, next) {
		const token = req.header("Authorization") ?.replace("Bearer ", "");

		if (!token) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		try {
			const decoded = jwt.verify(token, "secret_key");
			req.user = decoded;
			next();
		} catch (e) {
			if (e instanceof jwt.JsonWebTokenError) {
				//token invalido
				return res.status(401).json({
					message: "Token invalido",
				});
			} else if (e instanceof jwt.TokenExpiredError) {
				// token expirado
				return res.status(401).json({
					message: "Token expirado",
				});
			} else {
				// otro error
				return res.status(500).json({
					message: "Internal server error",
				});
			}
		}
	}

	// Rutas públicas
	app.post("/login", (req, res) => UserHttpAdapter.loginUser(req, res));

	app.post(
		"/users",
		[
			body("id").optional().isInt(),
			body("name").isString().notEmpty(),
			body("email").isEmail(),
		],
		(req, res, next) => UserHttpAdapter.createUser(req, res)
	);

	// Nueva ruta get para obtener todos los usuarios
	app.get("/users", authenticateJWT, async (req, res) => {
		try {
			const result = await pool.query("SELECT * FROM users");
			const users = result.rows;
			res.json(users);
		} catch (error) {
			console.error("Error al obtener los usuarios", error);
			res.status(500).json({
				message: "Error al obtener los usuarios",
			});
		}
	});

	// Nueva ruta get para obtener un usuario por id
	app.get("/users/:id",
		authenticateJWT, async (req, res) => {
			const userId = req.params.id;
			try {
				const result = await pool.query("SELECT * FROM users WHERE id = $1", [
					userId,
				]);
				const user = result.rows[0];
				if (user) {
					res.json(user);
				} else {
					res.status(404).json({
						message: "User not found",
					});
				}
			} catch (error) {
				console.error("Error al obtener el usuario", error);
				res.status(500).json({
					message: "Error al obtener el usuario",
				});
			}
		});

	// middleware para manejar errores
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).json({
			message: "Internal server error",
		});
	});

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = configureServer;