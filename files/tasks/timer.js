var c = 0;
interval(function(){
log(c++);
},1000);
log("started");
var self = this;
log(self);
response(null, "started");