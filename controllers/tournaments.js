const axios = require('axios');
const EntityTournament = require('../models/tournaments').EntityTournament;
const EntityPhoto = require('../models/tournaments').EntityPhoto;
const EntityMatchup = require('../models/tournaments').EntityMatchup;
const EntityChampion = require('../models/tournaments').EntityChampion;

module.exports.TourController = class TourController {
    /**
     * @param {DbModelFactory} modelFactory
     */
    constructor(modelFactory, photoUrl) {
        this.tours = modelFactory.get('ModelTournament');
        this.photo_url = photoUrl;
    }

    /**
     * @param {number} userId 
     */
    async getTournamentsForUser(userId) {
        return await this.tours.getActiveTournamentsForUser(userId);
    }

    /**
     * @param {number} userId
     * @param {number} tourId
     */
    async battleById(userId, tourId) {
        let tour = await this.tours.getTournamentById(tourId);
        if (!tour) {
            return 'Tournament does not exist.';
        } else if (tour.user_id !== userId) {
            return 'You cannot battle for another user\'s tournament.';
        }

        let champion = await this.tours.getChampionByTourId(tour.id);
        if (champion) {
            return 'Champion of this battle has already been decided.';
        }

        let matchups = await this.tours.getCurrentMatchupsForTour(tour.id);
        let current = matchups[0];
        let photo_a = await this.tours.getPhotoById(current.photo_a_id);
        let photo_b = await this.tours.getPhotoById(current.photo_b_id);
        
        current.setAUrl(photo_a.url);
        current.setBUrl(photo_b.url);

        return current;
    }

    /**
     * @param {number} userId 
     * @param {number} matchupId 
     * @param {number} photoId
     * 
     * @returns {boolean} - Whether the tournament has a champion
     */
    async vote(userId, matchupId, photoId) {
        let matchup = await this.tours.getMatchupById(matchupId);
        if (!matchup) {
            return 'You can no longer vote for this set of contestants.';
        } else if (matchup.winnerId) {
            return 'A winner has already been decided for this set of contestants.';
        }

        let tour = await this.tours.getTournamentById(matchup.tour_id);
        if (!tour) {
            return 'Tournament does not exist.';
        } else if (tour.user_id !== userId) {
            return 'You cannot battle for another user\'s tournament.';
        }

        matchup.winner_id = photoId;
        await this.tours.setMatchupWinner(matchup.winner_id, matchup.id);

        let matchups = await this.tours.getCurrentMatchupsForTour(tour.id);
        if (matchups.length === 0) {
            return await this._buildNextRound(tour, matchup.round);
        }

        return false;
    }

    /**
     * @param {EntityTour} tour
     * 
     * @param {SVGAnimatedBoolean}
     */
    async _buildNextRound(tour, oldRound) {
        let old_matchups = await this.tours.getMatchupsByRound(tour.id, oldRound);
        if (old_matchups.length === 1) {
            let champion = new EntityChampion(
                0,
                tour.id,
                old_matchups[0].winner_id
            );
            await this.tours.createChampion(champion);
            return true;
        }

        let new_round = oldRound + 1;
        let count = old_matchups.length / 2;
        for (let i = 0; i < count; i=i+2) {
            let matchup = new EntityMatchup(
                0,
                tour.id,
                new_round,
                old_matchups[i].winner_id,
                old_matchups[i+1].winner_id,
                ''
            );
            await this.tours.createMatchup(matchup);
        }

        return false;
    }

    /**
     * @param {number} userId 
     * @param {string} name 
     */
    async createTournament(userId, name) {
        let response;
        try {
            response = await axios.get(this.photo_url);
        } catch (error) {
            return error.toString();
        }
        let photos = response.data.data;
        if (photos.length < 16) {
            return 'API Error: Not enough photos to create tournament.';
        }
        
        let new_tour = new EntityTournament(0, userId, name);
        await this.tours.createTournament(new_tour);

        photos = photos.slice(0, 16);
        for (let i = 0; i < 16; i=i+2) {
            let photo_a = new EntityPhoto(0, photos[i]);
            await this.tours.createPhoto(photo_a);
            let photo_b = new EntityPhoto(0, photos[i+1]);
            await this.tours.createPhoto(photo_b);
            let matchup = new EntityMatchup(
                0,
                new_tour.id,
                1,
                photo_a.id,
                photo_b.id,
                0
            );
            await this.tours.createMatchup(matchup);
        }

        return new_tour;
    }

    async getChampions() {
        return await this.tours.getChampions();
    }
}