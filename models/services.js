module.exports.DbModelFactory = class DbModelFactory {
    /**
     * @param {object} db 
     */
    constructor(db) {
        this.db = db;
        this.models = {};
    }

    /**
     * Registers a model and it's respective object
     * 
     * @param {string} name 
     * @param {object} model 
     */
    register(name, model) {
        this.models[name] = model;
    }

    /**
     * Instantiates a new db model of a given Model type
     * 
     * @param {string} name
     * 
     * @returns {object} - Instantiated db model object
     */
    get(name) {
        let db_model = this.models[name];
        return new db_model(this.db);
    }
}