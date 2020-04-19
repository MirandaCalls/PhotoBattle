const express = require('express');
const RouterCommon = require('../common');
const {check, validationResult} = require('express-validator');
const TourController = require('../../controllers/tournaments').TourController;

let router = express.Router();

/**
 * GET /my-tournaments
 * 
 * Loads the tournaments page for a user to create or continue tournaments.
 */
router.get('/', async(req, res) => {
	if (!req.session.user) {
		return res.redirect('/login');
	}

	let controller = new TourController(req.app.models, req.app.config.photosUrl);
    let page_data = RouterCommon.buildBasePageData(req, 'My Tournaments');
    page_data.tourList = await controller.getTournamentsForUser(req.session.user.id);
	res.render('my-tournaments', page_data);
});

/**
 * POST /my-tournaments
 * 
 * Submits a request to create a new tournament.
 */
let params = [
    check('name').exists().isLength({min: 1, max: 128}),
];
router.post('/', params, async(req, res) => {
    if (!req.session.user) {
		return res.redirect('/login');
    }

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return returnErrorResponse(req, res, req.body, 'Validation error.');
	}

    let controller = new TourController(req.app.models, req.app.config.photosUrl);
    let result = await controller.createTournament(
        req.session.user.id,
        req.body.name
    );
    if (typeof result === 'string') {
		return returnErrorResponse(req, res, req.body, result);
    }

    res.redirect('/battle/' + result.id );
});

let returnErrorResponse = (req, res, formData, message) => {
    let page_data = RouterCommon.buildBasePageData(req, 'My Tournaments');
    page_data.serverMessage = message;
    page_data.formData = formData;
    res.render('my-tournaments', page_data);
}

module.exports = router;