const express = require('express');
const bodyParser = require('body-parser');

function configureServer(UserHttpAdapter) {
	const app = express();
	const PORT = 3000;

	app.use(bodyParser.json());

	app.post("/users", (req, res) => UserHttpAdapter.createUser(req, res));

	// Nueva ruta get para obtener todos los usuarios
	app.get("/users", (req, res) => {
		const users = UserHttpAdapter.getAllUsers(res);
		res.json(users);
	});

	// Nueva ruta get para obtener un usuario por id
	app.get("/users/:id", (req, res) => {
		const userId = req.params.id;
		const user = UserHttpAdapter.getUserById(userId);

		if (user) { 
			res.json(user);
		} else {
			res.status(404).json({
				message: "User not found"
			});
		}
	});

	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = configureServer;