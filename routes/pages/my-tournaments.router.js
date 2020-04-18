const express = require('express');
const {check, validationResult} = require('express-validator');
const TourController = require('../../controllers/tournaments').TourController;

let router = express.Router();

router.get('/', async(req, res) => {
	if (!req.session.user) {
		return res.redirect('/login');
	}

	let controller = new TourController(req.app.models, req.app.config.photosUrl);
	let tour_list = await controller.getTournamentsForUser(req.session.user.id);

	let page_data = {
		title: 'My Tournaments',
		loggedIn: true,
		username: req.session.user.username,
		tourList: tour_list
	};

	res.render('my-tournaments', page_data);
});

let params = [
    check('name').exists().isLength({min: 1}),
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

    res.redirect('/my-tournaments');
});

let returnErrorResponse = (req, res, formData, message) => {
    res.render('my-tournaments', {
        title: 'My Tournaments',
        serverMessage: message,
        formData: formData,
        loggedIn: true,
        username: req.session.user.username
    });
}

module.exports = router;