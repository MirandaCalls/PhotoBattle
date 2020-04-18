const EntityUser = require('../models/users').EntityUser;

module.exports.AuthController = class AuthController {
    /**
     * @param {DbModelFactory} modelFactory
     * @param {string} secret
     */
    constructor(modelFactory, secret) {
        this.users = modelFactory.get('ModelUser');
        this.secret = secret;
    }

    /**
     * Attempts to create a new user in the system.
     * 
     * @param {string} username 
     * @param {string} password
     * 
     * @returns {EntityUser|string} - New user object or string for error
     */
    async register(username, password) {
        let existingUser = await this.users.getUserByUsername(username);
        if (existingUser) {
            return 'Username has already been taken.';
        }

        let new_user = new EntityUser(0, username, '');
        new_user.setPassword(password);
        await this.users.createUser(new_user);

        return new_user;
    }

    /**
     * Checks for existing user in the database and if password is valid.
     * 
     * @param {string} username 
     * @param {string} password
     *
     * @returns {EntityUser|string} - User object or string for error
     */
    async login(username, password) {
        let error = 'Username or password invalid.';
        let user = await this.users.getUserByUsername(username);
        if (!user) {
            return error;
        }

        if (!user.checkPassword(password)) {
            return error;
        }

        return user;
    }
}