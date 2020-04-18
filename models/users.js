const bcrypt = require('bcryptjs');

class EntityUser {
    /**
     * @param {number} id 
     * @param {string} username
     */
    constructor(id, username, passwordHash) {
        this.id = id;
        this.username = username;
        this.password_hash = passwordHash;
    }

    /**
     * Hashes and sets the password using Bcrypt
     * 
     * @param {string} unhashed 
     */
    setPassword(unhashed) {
        this.password_hash = bcrypt.hashSync(unhashed);
    }

    /**
     * Checks if a given password's hash matches the stored value
     * 
     * @param {string} unhashed 
     * 
     * @returns {boolean}
     */
    checkPassword(unhashed) {
        return bcrypt.compareSync(unhashed, this.password_hash);
    }
}

class ModelUser {
    /**
     * @param {object} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Creates a new user in the database
     * 
     * @param {EntityUser} entity
     */
    async createUser(entity) {
        let query = `
            INSERT INTO users (
                username,
                password_hash
            ) VALUES ( ?, ?)
        `;
        let params = [entity.username, entity.password_hash];
        await this.db.run(query, params);

        query = 'SELECT last_insert_rowid() as id';
        let result = await this.db.get(query);
        entity.id = result.id;
    }

    /**
     * Find a user in the database by username
     * 
     * @param {string} username 
     */
    async getUserByUsername(username) {
        let query = "SELECT * FROM users WHERE username = ?;";
        let result = await this.db.get(query, [username]);
        if (result === undefined) {
            return null;
        }

        return new EntityUser(
            result.id,
            result.username,
            result.password_hash
        );
    }
}

module.exports = {
    EntityUser: EntityUser,
    ModelUser: ModelUser
}