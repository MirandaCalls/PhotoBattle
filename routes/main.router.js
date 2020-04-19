const express = require('express');

let router = express.Router();
router.use('/', require('./pages'));
router.use('/thirdparty', require('./thirdparty.router'));

/**
 * POST /logout
 * 
 * Destroys the current session and redirects to home page.
 */
router.post('/logout', (req, res) => {
    req.session.destroy();
    req.session = null;
    res.redirect('/');
});

module.exports = router;
