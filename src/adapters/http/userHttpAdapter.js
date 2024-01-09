class UserHttpAdapter {
	constructor(userRepository) {
		this.userRepository = userRepository;
	} // constructor es un metodo especial que se ejecuta en el momento de instanciar la clase

	createUser(req, res) {
		const {
			id,
			name,
			email
		} = req.body;
		const user = this.userRepository.createUser({
			id,
			name,
			email
		}); // esto es un metodo abstracto
		res.json(user);
	}

	getUserById(userId) {
		return this.userRepository.getUserById(userId);
	}

	getAllUsers(res) {
		try {
			const users = this.userRepository.getAllUsers();
			res.json(users);
		} catch (error) {
			res.status(404).json({
				message: "Users not found"
			});
		}
	}
}

module.exports = UserHttpAdapter;