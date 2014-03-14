var uuid = require("node-uuid"),
	apn = require('apn'),
	gcm = require('node-gcm'),
	mpns = require('mpns');

//other examples
//https://github.com/rs/pushd
module.exports.init = function(config, storage){
	var apnConnection = null;
	var gcmConnection = null;

	var Device = function(deviceId, metadata){
		return {
			deviceId: deviceId || "",
			timestamp: Date.now(),
			metadata: metadata,
			isActive: true
		};
	};

	var _find = function(deviceId, callback){
		storage.read("identities!devices", {key: deviceId}, callback);
	};
	var _findAll = function(query, callback){
		storage.query("identities!devices", {}, query, callback);
	};
	var _list = function(callback){
		storage.read("identities!devices", {keysOnly: true}, callback);
	};
	var _add = function(deviceId, metadata, callback){
		var device = new Device(deviceId, metadata);
		storage.create("identities!devices", device.deviceId, device, callback);
	};
	var _update = function(device, callback){
		device.timestamp = Date.now();
		storage.update("identities!devices", device.deviceId, device, callback);
	};
	var _remove = function(deviceId, callback){
		storage.del("identities", "devices!" + deviceId, callback);
	};

	//https://github.com/argon/node-apn
	var feedbackAPN = function(){
		var options = {
		    "batchFeedback": true,
		    "interval": 300
		};

		var feedback = new apn.Feedback(options);
		feedback.on("feedback", function(devices) {
		    devices.forEach(function(item) {
		        // Do something with item.device and item.time;
		    });
		});
	};
	var _initAPN = function(){
		//OPTIONS: https://github.com/argon/node-apn/blob/master/doc/apn.markdown
		var options = { 
			"gateway": config.APN_Sandbox ? "gateway.sandbox.push.apple.com" : "gateway.push.apple.com",
			"pfx": config.APN_Sandbox ? config.APN_Sandbox_Pfx : config.APN_Pfx,
			"maxConnections": 10
		};
		console.log(options);
		apnConnection = new apn.Connection(options);
		apnConnection.on('connected', function() {
		    console.log("Connected");
		});

		apnConnection.on('transmitted', function(notification, device) {
		    console.log("Notification transmitted to:" + device.token.toString('hex'));
		});

		apnConnection.on('transmissionError', function(errCode, notification, device) {
		    console.error("Notification caused error: " + errCode + " for device ", device, notification);
		});

		apnConnection.on('timeout', function () {
		    console.log("Connection Timeout");
		});

		apnConnection.on('disconnected', function() {
		    console.log("Disconnected from APNS");
		});

		apnConnection.on('socketError', console.error);
	};
	var _sendAPN = function(deviceToken, text1, payload, sound, badge, expire, retries, priority){
    	var note = new apn.Notification();
		note.expiry = expire || Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.retryLimit = retries || -1;
		note.priority = priority || 10 || 5; //10=immediately, 5=conserves power on the device
		note.badge = badge || 0;
		note.sound = sound || "ping.aiff";
		note.alert = text1 || "\uD83D\uDCE7 \u2709 You have a new message.";
		note.payload = payload || { 'from': 'subkit.io' };
		var myDevice = new apn.Device(deviceToken);
		apnConnection.pushNotification(note, myDevice);
	};

	//https://github.com/jeffwilcox/mpns
	var _initMPNS = function(){
	};
	var _sendMPNS = function(deviceToken, text1, text2, uriParams){
		var options = { 
			text1: text1 || "You have a new message.",
			text2: text2 || "",
			param: uriParams
			// cert: fs.readFileSync(config.MPNS_Cert),
			// key: fs.readFileSync(config.MPNS_Cert)
		};		

		mpns.sendToast(deviceToken, options, function(status){
			console.log(status);
		});
	};

	//https://github.com/ToothlessGear/node-gcm
	var _initGCM = function(){
		gcmConnection = new gcm.Sender(config.GCM_APIKey);
	};
	var _sendGCM = function(deviceToken, text1, text2, collapseKey){
		console.log("Device: " + deviceToken);
		var registrationIds = [];
		registrationIds.push(deviceToken);
		var message = new gcm.Message({
		    collapseKey: collapseKey || '',
		    delayWhileIdle: true,
		    timeToLive: 3,
		    data: {
		        key1: text1 || "You have a new message.",
		        key2: text2 || ""
		    }
		});

		gcmConnection.send(message, registrationIds, 4, function (err, result) {
			console.log(err);
		    console.log(result);
		});
	};
	
	_initAPN();
	_initMPNS();
	_initGCM();
	return {
		initAPN: _initAPN,
		initMPNS: _initMPNS,
		initGCM: _initGCM,
		sendAPN: _sendAPN,
		sendMPNS: _sendMPNS,
		sendGCM: _sendGCM,
		list: _list,
		find: _find,
		findAll: _findAll,
		add: _add,
		update: _update,
		remove: _remove
	}
}