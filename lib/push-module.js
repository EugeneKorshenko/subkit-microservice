var uuid = require("node-uuid"),
	jsonPath = require("JSONPath").eval,
	apn = require('apn'),
	C2DM = require('c2dm').C2DM,
	gcm = require('node-gcm'),
	mpns = require('mpns');

//other examples
//https://github.com/rs/pushd
module.exports.init = function(config, storage){
	var apnConnection = null;

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
		storage.read("identities!devices", {}, function(err, data){		
			var result = null;
			if(query){
				result = [];
				for (var i = 0; i < data.length; i++) {
					var itm = data[i];
					var match = jsonPath(itm, query);
					console.log(match);
					// if(match) result.push(itm);
				};
			}
			// console.log(result);
			callback(err, result || data);
		});
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
			"gateway": "gateway.sandbox.push.apple.com",
			// "cert": config.cert,
			// "key": config.key,
			"pfx": config.pfx,
			"maxConnections": 10
		};
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
	//https://github.com/argon/node-apn
	var _sendAPN = function(deviceToken, message, payload, sound, badge, expire, retries, priority){
    	var note = new apn.Notification();
		note.expiry = expire || Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.retryLimit = retries || -1;
		note.priority = priority || 10 || 5; //10=immediately, 5=conserves power on the device
		note.badge = badge || 1;
		note.sound = sound || "ping.aiff";
		note.alert = message || "\uD83D\uDCE7 \u2709 You have a new message";
		note.payload = payload || { 'from': 'subkit.io' };
		var myDevice = new apn.Device(deviceToken);
		apnConnection.pushNotification(note, myDevice);
	};

	//https://github.com/jeffwilcox/mpns
	//http://db3.notify.live.net/throttledthirdparty/01.00/
	var _initMPNS = function(){
		// var options = { 
		// 	text1: 'Hello!',
		// 	text2: 'Great to see you today.'
		// 	cert: fs.readFileSync('mycert.pem'),
		// 	key: fs.readFileSync('mycertkey.pem')
		// };
	};
	var _sendMPNS = function(deviceToken, text1, text2, uriParams){
		var options = { 
			text1: text1,
			text2: text2,
			param: uriParams
			// 	cert: fs.readFileSync('mycert.pem'),
			// 	key: fs.readFileSync('mycertkey.pem')
		};		

		mpns.sendToast(deviceToken, options, function(status){
			console.log(status);
		});
	};

	//https://github.com/SpeCT/node-c2dm
	var initC2DM = function(deviceToken){
		var config = {
		    user: 'bla-blah-blah@gmail.com',
		    password: 'your-huge-very-very-strong-password',
		    source: 'com.company.app-name',
		};
		var c2dm = new C2DM(config);
		c2dm.login(function(err, token){
		    // err - error, received from Google ClientLogin api
		    // token - Auth token
		});
		var message = {
		    registration_id: 'Device registration id',
		    collapse_key: 'Collapse key', // required
		    'data.key1': 'value1',
		    'data.key2': 'value2',
		    delay_while_idle: '1' // remove if not needed
		};

		c2dm.send(message, function(err, messageId){
		    if (err) {
		        console.log("Something has gone wrong!");
		    } else {
		        console.log("Sent with message ID: ", messageId);
		    }
		});
	};
	//https://github.com/ToothlessGear/node-gcm
	var initGCM = function(){
		// create a message with default values
		var message = new gcm.Message();

		// or with object values
		var message = new gcm.Message({
		    collapseKey: 'demo',
		    delayWhileIdle: true,
		    timeToLive: 3,
		    data: {
		        key1: 'message1',
		        key2: 'message2'
		    }
		});

		var sender = new gcm.Sender('insert Google Server API Key here');
		var registrationIds = [];

		// OPTIONAL
		// add new key-value in data object
		message.addDataWithKeyValue('key1','message1');
		message.addDataWithKeyValue('key2','message2');

		// or add a data object
		message.addDataWithObject({
		    key1: 'message1',
		    key2: 'message2'
		});

		// or with backwards compability of previous versions
		message.addData('key1','message1');
		message.addData('key2','message2');


		message.collapseKey = 'demo';
		message.delayWhileIdle = true;
		message.timeToLive = 3;
		// END OPTIONAL

		// At least one required
		registrationIds.push('regId1');
		registrationIds.push('regId2'); 

		/**
		 * Params: message-literal, registrationIds-array, No. of retries, callback-function
		 **/
		sender.send(message, registrationIds, 4, function (err, result) {
		    console.log(result);
		});
	};
	
	_initAPN();
	_initMPNS();
	return {
		sendAPN: _sendAPN,
		sendMPNS: _sendMPNS,
		list: _list,
		find: _find,
		findAll: _findAll,
		add: _add,
		update: _update,
		remove: _remove
	}
}