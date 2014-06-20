'use strict';

module.exports.init = function(server, share, doc){
	var shares_doc = doc('shares', 'Share operations.');

	server.get('/shares/identity', function(req, res, next){
		
		res.send(200, {});
	});
};