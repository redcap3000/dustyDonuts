  Session.set("selectedTime",undefined);
  Session.set("selectedCity",undefined);
  Session.set("entryFilter",undefined);
handle = Meteor.subscribe('dataset',function(){
  // destroy and rerender legend....

});

Tracker.autorun(function() {
  if (handle.ready()){
    var startDate = Session.get("startDate");
    var endDate = Session.get("endDate");
    if(typeof startDate == "undefined" && typeof endDate == "undefined"){
      /// figure out first record sort? safe to sort via timestamp ?
      var ranges = dataset.find({}).fetch();
      if(ranges && ranges.length > 0){
        // these need to be dates to properly filter ....
        // get first and last in range of client set
        Session.set("startDate",ranges[0].timestamp);
        Session.set("endDate",ranges.pop().timestamp);
      }
    }
    d3.selectAll(".legend").remove();
    if(typeof dataset != "undefined"){
      var findOne = dataset.findOne();
      if(typeof findOne != "undefined" && findOne){
        renderLegend(findOne);
      }
    }
  }
});
