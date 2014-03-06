var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, nconf, config, push, identity, helper){
	var maxSize = 10000;

	var _verifyP12 = function(file, callback){
		//openssl pkcs12 -password pass: -nokeys -info -in certs/apn/key.p12
	};

	server.get("/push/settings", function(req, res, next){
// "pushConfig": {
//     "APN_Pfx": "./certs/apn/key.p12",
//     "MPNS_Cert": "",
//     "MPNS_Key": "",
//     "GCM_APIKey": "AIzaSyCJLy5wbP12MyRzyt2MOJ75XahpE2Hq9JM"
//   },

		var result = {
			GCMKey: config.GCM_APIKey,
			MPNKey: config.MPNS_Key
		};
		res.send(200, result);
	});
	server.put("/push/settings", function(req, res, next){
		var newConfig = req.body;
		config.GCM_APIKey = newConfig.GCMKey;
		config.MPNS_Key = newConfig.MPNKey;		 
		nconf.set('pushConfig', config);
		nconf.save(function(err){
			if(err) return next(err);
			res.send(200, {status:"changed"});
		});
	});

	server.get("/push/devices", function(req, res, next){
		push.list(function(err, data){
			res.send(200, data);
		});
	});

	server.get("/push/devices/all", function(req, res, next){
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

	server.get("/push/devices/:deviceId", function(req, res, next){
		var deviceId = req.params.deviceId;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));
		
		push.find(deviceId, function(err, data){
			res.send(200, data);
		});
	});

	server.put("/push/devices", function(req, res, next){
		var device = req.body;
		if(!device) return res.send(404, new Error("Parameters not set."));

		push.update(device, function(err, data){
			res.send(202, {status: "changed"});
		});
	});

	server.post("/push/register/:deviceId", function(req, res, next){
		var deviceId = req.params.deviceId;
		var metadata = req.body;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));

		push.add(deviceId, metadata, function(err, data){
			res.send(202, {status:"added"});
		});
	});

	server.put("/push/unregister/:deviceId", function(req, res, next){
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

	server.del("/push/unregister/:deviceId", function(req, res, next){
		var deviceId = req.params.deviceId;
		if(!deviceId) return res.send(404, new Error("Parameters not set."));
		
		push.remove(deviceId, function(err, data){
			res.send(202, {status: "removed"});
		});
	});

	server.post("/push/send", function(req, res, next){
		var pushMessage = req.body;
		if(!pushMessage) return res.send(404, new Error("Parameters not set."));
		
		if(pushMessage) {
			push.findAll({}, function(err, data){
				console.log(data);
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

	//curl -i -F filedata=@server.js http://localhost:8080/static/upload
	server.post("/push/upload", helper.apiAuth, function (req, res, next) {
		var fileData = req.body;

		if(!fileData) return res.send(404, new Error("Parameters not set."));
		if(fileData > maxSize) return res.send(400);
		
		fs.writeFile(config.pfx, fileData, function(error, data){
			if(error) return res.send(400);
			push.initAPN();
			res.send(201);
		});
	});
}