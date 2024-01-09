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
}

module.exports = CreateUserUseCase;