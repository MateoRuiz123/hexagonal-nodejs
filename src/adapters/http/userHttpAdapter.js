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
}

module.exports = UserHttpAdapter;