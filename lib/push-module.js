var uuid = require("node-uuid"),
	apn = require('apn'),
	C2DM = require('c2dm').C2DM,
	gcm = require('node-gcm'),
	mpns = require('mpns');

//other examples
//https://github.com/rs/pushd

module.exports.init = function(config){
	
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
	}
	//https://github.com/argon/node-apn
	var initAPN = function(deviceToken){
		//OPTIONS: https://github.com/argon/node-apn/blob/master/doc/apn.markdown
		var options = { "gateway": "gateway.sandbox.push.apple.com" };
    	var apnConnection = new apn.Connection(options);
    	var myDevice = new apn.Device(deviceToken);
    	var note = new apn.Notification();

    	//{"messageFrom":"Caroline","aps":{"badge":3,"sound":"ping.aiff","alert":"\uD83D\uDCE7 \u2709 You have a new message"}}
		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
		note.badge = 3;
		note.sound = "ping.aiff";
		note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
		note.payload = {'messageFrom': 'Caroline'};

		apnConnection.pushNotification(note, myDevice);
	};
	//https://github.com/jeffwilcox/mpns
	var initMPNS = function(){
		var options = { 
		    text1: 'Hello!',
		    text2: 'Great to see you today.'
		    cert: fs.readFileSync('mycert.pem'),
		    key: fs.readFileSync('mycertkey.pem')
		    };
		mpns.sendToast(pushUri, 'Bold Text', 'This is normal text');

		// Optional callback
		mpns.sendToast(pushUri, text1, text2, callback);
		// HTTPS
		mpns.sendToast(httpspushUri, options, callback);
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

	return {
	}
}