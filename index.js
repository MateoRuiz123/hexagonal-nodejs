// index.js
const UserRepositoryDbAdapter = require('./src/adapters/database/userRepositoryDbAdapter');
const UserHttpAdapter = require('./src/adapters/http/userHttpAdapter');
const CreateUserUseCase = require('./src/application/createUserUseCase');
const configureServerFunction = require('./src/infrastructure/server');

const userRepository = new UserRepositoryDbAdapter();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userHttpAdapter = new UserHttpAdapter(createUserUseCase);

configureServerFunction(userHttpAdapter);
