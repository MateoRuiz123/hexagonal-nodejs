const express = require('express');
const bodyParser = require('body-parser');
const {
	Pool
} = require('pg');

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

	app.post("/users", (req, res) => UserHttpAdapter.createUser(req, res));

	// Nueva ruta get para obtener todos los usuarios
	app.get("/users", async (req, res) => {
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

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = configureServer;