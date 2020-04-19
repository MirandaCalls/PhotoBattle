/**
 * @param {req} - Express.js request object
 * @param {string} - Tab title for a page
 * 
 * @returns {object} - Base data for Handlebars template
 */
module.exports.buildBasePageData = (req, title) => {
	let page_data = {
		title: title
	};
	if (req.session.user) {
		page_data.username = req.session.user.username;
	}
	return page_data;
}