read(params.store, {}, function(error, data){
	var result = {};

	data.forEach(function(item){
		for(var i in item.value){
			result[i] = "";
		};
	});

	out(null, result);
});