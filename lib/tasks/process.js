var cluster = require('cluster');


//master
cluster.setupMaster({
  exec : "runner.js",
  args : process.argv.slice(2),
  silent : false
});
//This will be fired when the forked process becomes online
cluster.on( "online", function(worker) {
    var timer = 0;

    worker.on( "message", function(msg) {
        clearTimeout(timer); //The worker responded in under 5 seconds, clear the timeout
        console.log(msg);
        worker.destroy(); //Don't leave him hanging 

    });
    timer = setTimeout( function() {
        worker.destroy(); //Give it 5 seconds to run, then abort it
        console.log("worker timed out");
    }, 5000);

    worker.send( 'while(true){}' ); //Send the code to run for the worker
});
cluster.fork();

//worker
//The runner.js is ran in a separate process and just listens for the message which contains code to be executed
process.on('message', function( UNKNOWN_CODE ) {

    var vm = require("vm");

    var obj = {};
    var ctx = vm.createContext(obj);

    var script = vm.createScript(UNKNOWN_CODE);

    script.runInNewContext(ctx);

    process.send( "finished" ); //Send the finished message to the parent process
});