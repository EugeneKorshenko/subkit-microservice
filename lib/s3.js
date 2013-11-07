var	fs = require('fs'),
	path = require('path'),
	AWS = require('aws-sdk'),
	wrench = require('wrench'),
    util = require('util'),
	s3;

module.exports.init = function(server, s3Module, helper){
	// AWS.config.loadFromPath(path.join(__dirname,"/awsoptions.json"));
	s3 = new AWS.S3();

	return {
		del: del,
		list: list,
		copy: copy,
		folders: folders,
		publicly: publicly,
		changePolicy: changePolicy,
		findFolder: findFolder,
		findObject: findObject,
		sync: sync
	}
}


String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

function findObject(bucket, key, done){
	list(bucket, function(objectError, objectData){
		var result = [];
		if(objectData && objectData.Contents) {
			objectData.Contents.forEach(function(object){
				if(object.Key.indexOf(key) !== -1){
					console.log("found");
					result.push({ Type: "object", Name: object.Key, Size: object.Size, TimeStamp: object.LastModified });							
				}
			});
		}
		done(undefined, result);
	});
}

function findFolder(key, done){
	folders(function(bucketError, bucketsData){
		var result = [];
		if(bucketsData && bucketsData.Buckets) {
			bucketsData.Buckets.forEach(function(bucket){
				if(bucket.Name.indexOf(key) !== -1) {
					result.push({ Type: "bucket", Name: bucket.Name, TimeStamp: bucket.CreationDate });
				} 
			});
		}
		done(undefined, result);
	});
}

function changePolicy(bucket, policy, done){
	s3.client.putBucketPolicy({
		Bucket: bucket,
		Policy: policy
	}, done)
}

function publicly(bucket, done){
	changePolicy(bucket, JSON.stringify({	Version: "2008-10-17",
											Statement: [{
													Sid: "AddPerm",
													Effect: "Allow",
													Principal: {
														AWS: "*"
													},
													Action: "s3:GetObject",
													Resource: "arn:aws:s3:::" + bucket + "/*"
												}]
										}), done);
}

function folders(done){
	s3.client.listBuckets({}, done);
}

function list(bucket, done){
	s3.client.listObjects({
		Bucket: bucket,
		Delimiter: ","
	}, done);
}

function copy(bucket, file, done) {
	if(file) {
		var filePath = path.join(__dirname, file);
		fs.readFile(filePath, function (error, data) {
			if (error) { throw error; }
			s3.client.putObject({
				Bucket: bucket,
				Key: file,
				Body: new Buffer(data, 'binary')
			}, done);

		});
	}
}

function sync(bucket, filePath, done){
	wrench.readdirRecursive(filePath, function(error, data){
		if(data){
			data.forEach(function(item){
				if(item && !item.startsWith(".") && path.extname(item) !== "") {
					copy(bucket, path.join(filePath, item), function(error, data){
						if(error) throw new Error(error);
					});
				}
			});
		}
	});
	if(done) done(undefined, {});
}

function del(bucket, key, done){
	s3.client.deleteObject({
		Bucket: bucket,
		Key: key
	}, done);
}