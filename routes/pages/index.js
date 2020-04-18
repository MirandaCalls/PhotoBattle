const express = require('express');
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

	let page_data = {
		title: 'Photo Battle',
		loggedIn: false
	};

	if(req.session.user) {
		page_data.loggedIn = true;
		page_data.username = req.session.user.username;
	}

	res.render('index', page_data);
});

router.get('/champions', async(req, res) => {
	let controller = new TourController(req.app.models, req.app.config.photosUrl);

	let page_data = {
		title: 'Champions',
		loggedIn: false,
		champions: await controller.getChampions()
	};

	if(req.session.user) {
		page_data.loggedIn = true;
		page_data.username = req.session.user.username;
	}

	res.render('champions', page_data);
});

module.exports = router;