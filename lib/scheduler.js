module.exports.init = function(server, scheduler, helper){

	scheduler.run();

	setTimeout(function(){
		console.log(scheduler.list());
	}, 1000);

	return {
	}
}