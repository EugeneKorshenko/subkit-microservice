var cronJob = require('cron').CronJob;
module.exports.init = function(server, helper){
	server.get("/schedules", helper.apiAuth, function (req, res, next) {
		res.send(200, "");
	});
	server.post("/schedule/:name", helper.apiAuth, function (req, res, next) {
		var name = req.params.name;
		if(!name) res.send(404, "name not found");
		res.send(200, "");
	});
	server.del("/schedule/:name", helper.apiAuth, function(req,res,next){
		var name = req.params.name;
		if(!name) res.send(404, "name not found");
		res.send(200, "");
	});

	return {
	}
}

module.exports.init = function(config){
	var self = this;
	var _list = function(){

	};
	var _add = function(){

	};
	var _del = function(){

	};
	return {
		list: _list,
		add: _add,
		del: _del
	}
}
// var job = new cronJob('00 30 11 * * 1-5', function(){
//     // Runs every weekday (Monday through Friday)
//     // at 11:30:00 AM. It does not run on Saturday
//     // or Sunday.
//   }, function () {
//     // This function is executed when the job stops
//   },
//   true /* Start the job right now */,
//   timeZone /* Time zone of this job. */
// );
// job.start();

// var job2 = new cronJob(new Date(), function(){
//     //runs once at the specified date.
//   }, function () {
//     // This function is executed when the job stops
//   },
//   true /* Start the job right now */,
//   timeZone /* Time zone of this job. */
// );
// job2.start();

// var job3 = new cronJob({
//   cronTime: '00 30 11 * * 1-5',
//   onTick: function() {
//     // Runs every weekday (Monday through Friday)
//     // at 11:30:00 AM. It does not run on Saturday
//     // or Sunday.
//   },
//   start: false,
//   timeZone: "America/Los_Angeles"
// });
// job3.start();
