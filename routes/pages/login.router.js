const express = require('express');
const {check, validationResult} = require('express-validator');
const AuthController = require('../../controllers/auth').AuthController;

let router = express.Router();

/**
 * GET /login
 * 
 * Loads the login page.
 */
router.get('/', function (req, res) {
	if (req.session.user) {
		return res.redirect('/');
	}
	res.render('login', {title: 'Login'});
});

/**
 * POST /login
 * 
 * Submits a user's request to log in.
 */
let login_params = [
    check('username').exists().isLength({min: 1}),
    check('password').exists().isLength({min: 1})
];
router.post('/', login_params, async(req, res) => {
	if (req.session.user) {
		return res.redirect('/');
	}

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return returnErrorResponse(res, req.body, 'Validation error.');
	}

	let controller = new AuthController(req.app.models, req.app.config.appSecret);
	let result = await controller.login(req.body.username, req.body.password);
	if (typeof result === 'string') {
		return returnErrorResponse(res, req.body, result);
	}

	req.session.user = result;
	res.redirect('/');
});

let returnErrorResponse = (res, formData, message) => {
    res.render('login', {
        title: 'login',
        serverMessage: message,
        formData: formData
    });
}

module.exports = router;