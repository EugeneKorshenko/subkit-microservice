read(params.from, {}, function(error, data){
	var result = {
		count: 0,
		message: "done"
	};
	data.forEach(function(item){
		del(item.store, item.key, function(){
			create(params.to, item.key, item.value, function(error){
				result.count += 1;
			});
		});
	});
	var timeout = interval(function(){
		if(result.count === data.length) {
			stop(timeout);
			out(null, result);
		}
	}, 10);
});