const {
	validationResult
} = require("express-validator");
const {
	passport,
	generateToken
} = require("../../infrastructure/auth");

class UserHttpAdapter {
	constructor(userRepository) {
		this.userRepository = userRepository;
	} // constructor es un metodo especial que se ejecuta en el momento de instanciar la clase

	createUser(req, res) {

		// Validacion de errores
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array()
			});
		}

		const {
			id,
			name,
			email
		} = req.body;
		const user = this.userRepository.createUser({
			id,
			name,
			email,
		}); // esto es un metodo abstracto
		res.json(user);
	}

	loginUser(req, res) {
		passport.authenticate("local", {
			session: false
		}, (err, user, info) => {
			if (err || !user) {
				return res.status(401).json({
					message: "Incorrect name or password",
					error: err || info,
				});
			}

			const token = generateToken(user);
			return res.json({
				token,
			});
		})(req, res);
	}

	getUserById(userId) {
		return this.userRepository.getUserById(userId);
	}

	async getAllUsers(res) {
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
	}
}

module.exports = UserHttpAdapter;