const express = require('express');
const {check, validationResult} = require('express-validator');
const ControllerAuth = require('../../controllers/auth').AuthController;

let router = express.Router();

/**
 * GET /register
 * 
 * Loads the registration page
 */
router.get('/', (req, res) => {
	if (req.session.user) {
		return res.redirect('/');
	}
	res.render('register', {title: 'Register'});
});

/**
 * POST /register
 * 
 * Route to create a new user
 */
let register_params = [
    check('username').exists().isLength({min: 1, max: 50}),
    check('password').exists().isLength({min: 8, max: 50})
];
router.post('/', register_params, async(req, res) => {
	if (req.session.user) {
		return res.redirect('/');
	}

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return returnErrorResponse(res, req.body, 'Validation error.');
	}
	
	let controller = new ControllerAuth(req.app.models, req.app.config.appSecret);
	let result = await controller.register(req.body.username, req.body.password);
	if (typeof result === 'string') {
		return returnErrorResponse(res, req.body, result);
	}

	req.session.user = result;
	res.redirect('/');
});

let returnErrorResponse = (res, formData, message) => {
    res.render('register', {
        title: 'Register',
        serverMessage: message,
        formData: formData
    });
}

module.exports = router;