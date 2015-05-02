task.eventsource  
  .from(['my_instant_stream'])  
  .on({
    $init: function(){
      return {
        count: 0,
        gauss_sum: 0
      };      
    },
    $any: function(state, e){
      state.count += 1;
      state.gauss_sum += e.number;      
      return state;
    },
    $completed: function(state){
      task.event.emit('my_instant_stream_gauss_sum', state);
      return state;
    }
  });