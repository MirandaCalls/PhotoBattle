const express = require('express');
const {check, validationResult} = require('express-validator');
const TourController = require('../../controllers/tournaments').TourController;

let router = express.Router();

router.get('/:id', async(req, res) => {
    if (!req.session.user) {
		return res.redirect('/login');
	}

	let controller = new TourController(req.app.models, req.app.config.photosUrl);
	let result = await controller.battleById(req.session.user.id, req.params.id);
	if (typeof result === 'string') {
		return returnErrorResponse(req, res, result);
	}

	let page_data = {
		title: 'Battle',
		loggedIn: true,
		username: req.session.user.username,
		matchup: result
	};

	res.render('battle', page_data);
});

let params = [
	check('matchup_id').exists().isInt(),
    check('choice_id').exists().isInt(),
];
router.post('/:id', params, async(req, res) => {
	if (!req.session.user) {
		return res.redirect('/');
	}

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return returnErrorResponse(req, res, 'Validation error.');
	}

	let controller = new TourController(req.app.models, req.app.config.photosUrl);
	let result = await controller.vote(req.session.user.id, req.body.matchup_id, req.body.choice_id);
	if (typeof result === 'string') {
		return returnErrorResponse(req, res, result);
	}

	if (result) {
		res.redirect('/champions');
	} else {
		res.redirect('/battle/' + req.params.id);
	}
});

let returnErrorResponse = (req, res, message) => {
    res.render('battle', {
        title: 'Battle',
		serverMessage: message,
		loggedIn: true,
		username: req.session.user.username
    });
}

module.exports = router;