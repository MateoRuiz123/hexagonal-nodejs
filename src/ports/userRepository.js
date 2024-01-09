class UserRepository {
	createUser(user) {
		throw new Error('ERR_METHOD_NOT_IMPLEMENTED');
	} // esto es un metodo abstracto

	getUserById(userId) {
		throw new Error('ERR_METHOD_NOT_IMPLEMENTED');
	} 
}

module.exports = UserRepository;