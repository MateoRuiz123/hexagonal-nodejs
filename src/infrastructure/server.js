// src/infrastructure/server.js
const express = require("express");
const cookieParser = require("cookie-parser"); // importa el modulo cookie-parser
const bodyParser = require("body-parser");
const {
	passport
} = require("./auth");
const jwt = require("jsonwebtoken");
const pool = require("./databasePool"); // Importa el pool de la base de datos
const {
	body
} = require("express-validator");
const configureServerFunction = require("./server"); // Importa la funcion configureServer

const UserHttpAdapter = require("../adapters/http/userHttpAdapter"); // Importa el adaptador http de usuario

function configureServer(UserHttpAdapter) {
	const app = express();
	const PORT = 3000;

	app.use(bodyParser.json());
	app.use(cookieParser()); // usa cookieParser

	// Configuración de passport
	app.use(passport.initialize());

	app.use((req, res, next) => {
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader("Content-Security-Policy", "default-src 'self'");
		next();
	});

	// Middleware para proteger rutas con autenticación mediante JWT
	async function authenticateJWT(req, res, next) {
		const token = req.cookies.authToken; // obtiene el token de la cookie
		console.log("Token:", token);

		if (!token) {
			return res.status(401).json({
				message: "Unauthorized",
			});
		}

		try {
			const decoded = jwt.verify(token, "secret_key");
			console.log("Decoded Token:", decoded);
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

	app.use(passport.initialize()); // inicializa passport

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