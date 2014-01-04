var fs = require("fs"),
	path = require("path");

module.exports.init = function(server, config, push, identity, helper){
	var maxSize = 10000;

	var _verifyP12 = function(file, callback){
		//openssl pkcs12 -password pass: -nokeys -info -in certs/apn/key.p12
	};

	server.get("/push/settings", function(req, res, next){
		res.send(200, {});
	});

	server.get("/push/devices", function(req, res, next){
		push.list(function(err, data){
			res.send(200, data);
		});
	});

	server.get("/push/devices/all", function(req, res, next){
		var query = req.params.q || "";
		push.findAll(query, function(err, data){
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

	//APN 9e4c089d4f00e9878010007b12584203308a792b7884cecf22f431d0e5583618
	server.post("/push/send", function(req, res, next){
		var pushMessage = req.body;
		if(!pushMessage) return res.send(404, new Error("Parameters not set."));
		
		if(pushMessage) {
			var apnQuery = "$..*[?(@.Type=='APN')]";
			push.findAll(apnQuery, function(err, data){
				console.log(data);
				for (var i = 0; i < data.length; i++) {
					var itm = data[i];
					push.sendAPN(itm.value.deviceId, pushMessage.Text1);
				};
				
			});
		}
		res.send(201, { status: "sent" });
		// if(pushMessage) {
		// 	if(pushMessage.Type === "MPNS" || pushMessage.Type === "mpns") push.sendMPNS(pushMessage.Token, pushMessage.Text1, pushMessage.Text2, pushMessage.Parameter);
		// 	if(pushMessage.Type === "APN" || pushMessage.Type === "apn") push.sendAPN(pushMessage.Token, pushMessage.Text1);
		// 	if(pushMessage.Type === "GCM" || pushMessage.Type === "gcm") push.sendGCM(pushMessage.Token, pushMessage.Text1, pushMessage.Text2)
		// }
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