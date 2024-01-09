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

	getAllUsers() {
		if (this.user.length > 0) {
			return this.user;
		} else {
			throw new Error("Users not found");
		}
	}
}

module.exports = UserRepositoryDbAdapter;