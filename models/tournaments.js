/**
 * Represents a photo that can be voted on in a tournament.
 */
class EntityPhoto {
    constructor(id, url) {
        this.id = id;
        this.url = url;
    }
}

/**
 * Represents a single elimination tournament.
 */
class EntityTournament {
    constructor(id, userId, name) {
        this.id = id;
        this.user_id = userId;
        this.name = name;
    }
}

/**
 * Represents a matchup between two photos for a tournament.
 * Stores the winner of the matchup.
 */
class EntityMatchup {
    constructor(id, tourId, round, photoAId, photoBId, winnerId) {
        this.id = id;
        this.tour_id = tourId;
        this.round = round;
        this.photo_a_id = photoAId;
        this.photo_b_id = photoBId;
        this.winner_id = winnerId;
        this.tour_name = '';
        this.a_url = '';
        this.b_url = '';
    }

    setTourName(name) {
        this.tour_name = name;
    }

    setAUrl(url) {
        this.a_url = url;
    }

    setBUrl(url) {
        this.b_url = url;
    }
}

/**
 * Represents the winner of a tournment.
 */
class EntityChampion {
    constructor(id, tourId, photoId) {
        this.id = id;
        this.tour_id = tourId;
        this.photo_id = photoId;
        this.tour_name = '';
        this.username = '';
        this.photo_url = '';
    }

    setTourName(name) {
        this.tour_name = name;
    }

    setUsername(username) {
        this.username = username;
    }

    setPhotoUrl(url) {
        this.photo_url = url;
    }
}

class ModelTournament {
    /**
     * @param {object} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Fetch a single tournament by id.
     * 
     * @param {number} id 
     * 
     * @returns {EntityTournament}
     */
    async getTournamentById(id) {
        let query = "SELECT * FROM tournaments WHERE id = ?";
        let result = await this.db.get(query, [id]);
        if (result === undefined) {
            return null;
        }

        return new EntityTournament(
            result.id,
            result.user_id,
            result.name
        );
    }

    /**
     * Fetches all unfinished tournaments for a given user.
     * 
     * @param {number} userId 
     * 
     * @returns {EntityTournament[]}
     */
    async getActiveTournamentsForUser(userId) {
        let query = `
            SELECT 
                tournaments.id,
                tournaments.user_id,
                tournaments.name,
                champions.id AS champion_id
            FROM tournaments
            LEFT OUTER JOIN champions ON champions.tour_id = tournaments.id
            WHERE tournaments.user_id = ?
            ORDER BY tournaments.id DESC
        `;
        let results = await this.db.all(query, [userId]);
        let tours = [];
        for (let result of results) {
            if (!result.champion_id) {
                tours.push(new EntityTournament(
                    result.id,
                    result.user_id,
                    result.name,
                ));
            }
        }
        return tours;
    }

    /**
     * Creates a new tournament.
     * 
     * @param {EntityTournament}
     */
    async createTournament(entity) {
        let query = `
            INSERT INTO tournaments (
                user_id,
                name
            ) VALUES ( ?, ?)
        `;
        let params = [entity.user_id, entity.name];
        await this.db.run(query, params);

        query = 'SELECT last_insert_rowid() as id';
        let result = await this.db.get(query);
        entity.id = result.id;
    }

    /**
     * Fetches a photo by id.
     * 
     * @param {number} id 
     * 
     * @returns {EntityPhoto}
     */
    async getPhotoById(id) {
        let query = "SELECT * FROM photos WHERE id = ?";
        let result = await this.db.get(query, [id]);
        if (result === undefined) {
            return null;
        }

        return new EntityPhoto(
            result.id,
            result.url
        );
    }

    /**
     * Creates a new photo.
     * 
     * @param {EntityPhoto} entity 
     */
    async createPhoto(entity) {
        let query = `
            INSERT INTO photos (
                url
            ) VALUES (?)
        `;
        let params = [entity.url];
        await this.db.run(query, params);

        query = 'SELECT last_insert_rowid() as id';
        let result = await this.db.get(query);
        entity.id = result.id;
    }

    /**
     * Fetches all matchups with undecided winners
     * for the latest round in a tournament
     * 
     * @param {id} id - Id of a tournament
     * 
     * @returns {EntityMatchup[]} - Extra data: tournament names
     */
    async getCurrentMatchupsForTour(id) {
        let query = `
            SELECT
                matchups.id,
                matchups.tour_id,
                matchups.round,
                matchups.photo_a_id,
                matchups.photo_b_id,
                matchups.winner_id,
                tournaments.name
            FROM matchups
            JOIN tournaments ON tournaments.id = matchups.tour_id
            WHERE tour_id = ?
            AND winner_id is null
            AND round IN (SELECT max(round) FROM matchups WHERE matchups.tour_id = ?)
        `;
        let results = await this.db.all(query, [id, id]);
        let matchups = [];
        for (let result of results) {
            let entity = new EntityMatchup(
                result.id,
                result.tour_id,
                result.round,
                result.photo_a_id,
                result.photo_b_id,
                result.winner_id
            );
            entity.setTourName(result.name);
            matchups.push(entity);
        }
        return matchups;
    }

    /**
     * Get a matchup by id.
     * 
     * @param {number} id
     * 
     * @returns {EntityMatchup}
     */
    async getMatchupById(id) {
        let query = "SELECT * FROM matchups WHERE id = ?";
        let result = await this.db.get(query, [id]);
        if (result === undefined) {
            return null;
        }

        return new EntityMatchup(
            result.id,
            result.tour_id,
            result.round,
            result.photo_a_id,
            result.photo_b_id,
            result.winner_id
        )
    }

    /**
     * Fetches all matchups for a tournament and given round.
     * 
     * @param {number} tourId 
     * @param {number} round
     * 
     * @returns {EntityMatchup[]}
     */
    async getMatchupsByRound(tourId, round) {
        let query = 'SELECT * FROM matchups WHERE tour_id = ? and round = ?';
        let results = await this.db.all(query, [tourId, round]);
        let matchups = [];
        for (let result of results) {
            matchups.push(new EntityMatchup(
                result.id,
                result.tour_id,
                result.round,
                result.photo_a_id,
                result.photo_b_id,
                result.winner_id
            ));
        }
        return matchups;
    }

    /**
     * Creates a new matchup.
     * 
     * @param {EntityMatchup} entity
     */
    async createMatchup(entity) {
        let query = `
            INSERT INTO matchups (
                tour_id,
                round,
                photo_a_id,
                photo_b_id
            ) VALUES (?, ?, ?, ?)
        `;
        let params = [entity.tour_id, entity.round, entity.photo_a_id, entity.photo_b_id];
        await this.db.run(query, params);

        query = 'SELECT last_insert_rowid() as id';
        let result = await this.db.get(query);
        entity.id = result.id;
    }

    /**
     * Sets the winner for a matchup.
     * 
     * @param {number} winnerId 
     * @param {number} matchupId 
     */
    async setMatchupWinner(winnerId, matchupId) {
        let query = 'UPDATE matchups SET winner_id = ? WHERE id = ?';
        await this.db.run(query, [winnerId, matchupId]);
    }

    /**
     * Fetches all champions.
     * 
     * @returns {EntityChampion[]} - Extra data: tournament name, username, photo url
     */
    async getChampions() {
        let query = `
            SELECT
                champions.id,
                champions.tour_id,
                champions.photo_id,
                tournaments.name,
                users.username,
                photos.url
            FROM champions
            JOIN tournaments ON tournaments.id = champions.tour_id
            JOIN photos ON photos.id = champions.photo_id
            JOIN users ON users.id = tournaments.user_id
            ORDER BY champions.id DESC
            LIMIT 50
        `;
        let results = await this.db.all(query);
        let champions = [];
        for (let result of results) {
            let entity = new EntityChampion(
                result.id,
                result.tour_id,
                result.photo_id
            );
            entity.setTourName(result.name);
            entity.setUsername(result.username);
            entity.setPhotoUrl(result.url);
            champions.push(entity);
        }
        return champions;
    }

    /**
     * Get champion of a tournament.
     * 
     * @param {number} id - Id of a tournament
     */
    async getChampionByTourId(id) {
        let query = "SELECT * FROM champions WHERE tour_id = ?";
        let result = await this.db.get(query, [id]);
        if (result === undefined) {
            return null;
        }

        return new EntityChampion(
            result.id,
            result.tour_id,
            result.photo_id
        );
    }

    /**
     * Creates a new champion.
     * 
     * @param {EntityChampion} entity 
     */
    async createChampion(entity) {
        let query = `
            INSERT INTO champions (
                tour_id,
                photo_id
            ) VALUES (?, ?)
        `;
        let params = [entity.tour_id, entity.photo_id];
        await this.db.run(query, params);

        query = 'SELECT last_insert_rowid() as id';
        let result = await this.db.get(query);
        entity.id = result.id;
    }
}

module.exports = {
    ModelTournament: ModelTournament,
    EntityPhoto: EntityPhoto,
    EntityTournament: EntityTournament,
    EntityMatchup: EntityMatchup,
    EntityChampion: EntityChampion
};