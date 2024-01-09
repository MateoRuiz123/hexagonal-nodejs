class UserRepositoryDbAdapter{
	constructor() {
		this.user = []
	}

	createUser(user) {
		this.user.push(user);
		return user;
	}

	getUserById(userId) {
		return this.user.find(user => user.id === userId);
	}
}

module.exports = UserRepositoryDbAdapter;