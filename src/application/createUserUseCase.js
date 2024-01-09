class CreateUserUseCase {
	constructor(userRepository) {
		this.userRepository = userRepository;
	}

	execute({
		id,
		name,
		email
	}) {
		const user = this.userRepository.createUser({
			id,
			name,
			email
		});
		return user;
	}

	getUserById(userId) {
		return this.userRepository.getUserById(userId);
	}

	getAllUsers() {
		return this.userRepository.getAllUsers();
	}
}

module.exports = CreateUserUseCase;