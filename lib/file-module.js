var fs = require("fs"),
	path = require("path"),
	rights;

module.exports.init = function(conf){
	if(!conf) throw new Error("no conf");
	config = conf;

	//rights
	function writeRights(){
		fs.writeFileSync(config.rightsPath, JSON.stringify(rights, null, 4));
	}
	function readRights(){
		var data = fs.readFileSync(config.rightsPath);
		rights = JSON.parse(data);
	}
	function setPublic(name, callback){
		var match = rights.public.indexOf(name);

		if(match === -1){
			rights.public.push(name);
			writeRights();
			callback(null, {
				grant: true,
				name: name
			});
		}else{
			callback(new Error("store not found"));
		}
	}
	function setPrivate(name, callback){
		var match = rights.public.indexOf(name);

		if(match !== -1){
			rights.public.splice(match, 1);
			writeRights();
			callback(null, {
				grant: false,
				name: name
			});
		}else{
			callback(new Error("store not found"));
		}
	}

		//rights file refresh on change
	fs.watchFile(config.rightsPath, function (curr, prev) {
		console.log("rights file changed - reload.");
		readRights();
	});

	//init
	readRights();

	return {
		getRights: function(){ return rights; },
		setPublic: setPublic,
		setPrivate: setPrivate,
	}
}