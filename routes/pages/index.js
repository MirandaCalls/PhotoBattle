const express = require('express');
const RouterCommon = require('../common');
const TourController = require('../../controllers/tournaments').TourController;

let router = express.Router();
router.use('/login', require('./login.router'));
router.use('/register', require('./register.router'));
router.use('/my-tournaments', require('./my-tournaments.router'));
router.use('/battle', require('./battle.router'));

/**
 * GET /
 * 
 * Loads the home page
 */
router.get('/', (req, res) => {
	if (req.session.user) {
		return res.redirect('/my-tournaments');
	}
	res.render('index', RouterCommon.buildBasePageData(req, 'Photo Battle'));
});

/**
 * GET /champions
 * 
 * Loads the champions page with the last 50 tournament champions.
 */
router.get('/champions', async(req, res) => {
	let controller = new TourController(req.app.models, req.app.config.photosUrl);
	let page_data = RouterCommon.buildBasePageData(req, 'Champions');
	page_data.champions = await controller.getChampions();
	res.render('champions', page_data);
});

module.exports = router;