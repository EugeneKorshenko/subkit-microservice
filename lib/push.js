var fs = require("fs"),
	path = require("path"),
	sys = require('sys'),
	exec = require('child_process').exec;

module.exports.init = function(server, nconf, config, push, identity, helper){
	var maxSize = 10000;

	var _convertPfx = function(file, callback){
		var command = 'openssl pkcs12 -password pass: -nokeys -info -in "' + file + '"';
		var child = exec(command, function (error, stdout, stderr) {
			if(error) callback({ status: "error", message: error });
			else callback(null, {status: "done", message: stdout})
		});		
	};

	server.get("/push/settings", helper.apiAuth, function(req, res, next){
		var result = {
			GCMKey: config.GCM_APIKey,
			APNSandbox: config.APN_Sandbox
		};
		res.send(200, result);
	});

	server.put("/push/settings", helper.apiAuth, function(req, res, next){
		var newConfig = req.body;
		var oldConfig = nconf.get("pushConfig");
		oldConfig.GCM_APIKey = newConfig.GCMKey;
		oldConfig.APN_Sandbox = newConfig.APNSandbox;
		nconf.set('pushConfig', oldConfig);

		nconf.save(function(err){
			if(err) return next(err);
			res.send(200, {status:"changed"});
		});
	});

	//curl -i -F filedata=@server.js http://localhost:8080/static/upload
	server.post("/push/upload/:provider/:env", helper.apiAuth, function (req, res, next) {
		var certPath = config.APN_Pfx;
		var fileData = req.body;
		var provider = req.params.provider;
		var env = req.params.env;
		if(!fileData) return res.send(404, new Error("Parameters not set."));
		if(fileData > maxSize) return res.send(400);
		if(provider === "apn" && env === "dev") certPath = config.APN_Sandbox_Pfx;
		if(provider === "mpns") certPath = config.MPNS_Pfx;
		fs.writeFile(certPath, fileData, function(error, data){
			if(error) return res.send(400, error);
			_convertPfx(certPath, function(error2, data2){
				if(error2) return res.send(400, error2);
				push.initAPN();
				res.send(201);
			});
		});
	});

	server.get("/push/devices", helper.apiAuth, function(req, res, next){
		push.list(function(err, data){
			res.send(200, data);
		});
	});

	server.get("/push/devices/all", helper.apiAuth, function(req, res, next){
		var query = req.params.q;
		try{
			query = JSON.parse(query);
		}catch(error){
			query = {};
		}
		push.findAll(query, function(err, data){
			if(err) res.send(404, err);
			res.send(200, data);
		});
	});

	server.get("/push/devices/:deviceId", helper.apiAuth, function(req, res, next){
		var deviceId = req.params.deviceId;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));
		
		push.find(deviceId, function(err, data){
			res.send(200, data);
		});
	});

	server.put("/push/devices", helper.apiAuth, function(req, res, next){
		var device = req.body;
		if(!device) return res.send(404, new Error("Parameters not set."));

		push.update(device, function(err, data){
			res.send(202, {status: "changed"});
		});
	});

	server.post("/push/register/:deviceId", helper.apiAuth, function(req, res, next){
		var deviceId = req.params.deviceId;
		var metadata = req.body;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));

		push.add(deviceId, metadata, function(err, data){
			res.send(202, {status:"added"});
		});
	});

	server.put("/push/unregister/:deviceId", helper.apiAuth, function(req, res, next){
		var deviceId = req.params.deviceId;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));
		
		push.find(deviceId, function(err, data){
			if(!data) return;
			data.isActive = false;
			push.update(data, function(err, data){
				res.send(202, {status: "inactive"});
			});
		});
	});

	server.del("/push/unregister/:deviceId", helper.apiAuth, function(req, res, next){
		var deviceId = req.params.deviceId;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));
		
		push.remove(deviceId, function(err, data){
			res.send(202, {status: "removed"});
		});
	});

	server.post("/push/send", helper.apiAuth, function(req, res, next){
		var pushMessage = req.body;
		if(!pushMessage) return res.send(404, new Error("Parameters not set."));
		
		if(pushMessage) {
			push.findAll({}, function(err, data){
				for (var i = 0; i < data.length; i++) {
					var itm = data[i].value;
					if(itm.isActive) {
						if(itm.metadata.Type === "MPNS") push.sendMPNS(itm.metadata.Token, pushMessage.Text1, pushMessage.Text2, pushMessage.Parameter);
						if(itm.metadata.Type === "APN") push.sendAPN(itm.deviceId, pushMessage.Text1);
						if(itm.metadata.Type === "GCM") push.sendGCM(itm.deviceId, pushMessage.Text1, pushMessage.Text2)
					}

				};
				
			});
		}
		res.send(201, { status: "sent" });
	});
}