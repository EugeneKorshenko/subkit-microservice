task.eventsource  
  .from(['mystream_persistent', 'mystream_persistent_other'])  
  .run({
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
      state.msg = 'done';
      return state;
    }
  }, task.done);