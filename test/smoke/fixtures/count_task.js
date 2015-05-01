task.eventsource  
    .from(['mystream_persistent'])  
    .run({
      $init: function(){
        return {
          count: 0,
          gauss_sum: 0,
          msg: 'done'
        };      
      },
      $any: function(state, e){
        state.count += 1;
        state.gauss_sum += e.number;
        return state;
      }
    }, task.done);