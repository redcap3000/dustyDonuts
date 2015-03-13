Session.set("selectedTime",undefined);
Session.set("selectedCity",undefined);
Session.set("entryFilter",undefined);
Session.set("dataReady", undefined);
Session.set("dateStart",undefined);
Session.set("dateEnd",undefined);


Tracker.autorun(function() {
  var dateStart = Session.get("dateStart");
  var dateEnd = Session.get("dateEnd");

  handle = Meteor.subscribe('datasetRange',dateStart,dateEnd,function(){
    console.log('subbed to dataset');
  
  });

  if (handle.ready()){
    Session.set("dataReady",true);
    if(typeof dataset != "undefined"){
      var findOne = dataset.findOne();
      if(typeof findOne != "undefined" && findOne){
        d3.selectAll(".legend").remove();
        renderLegend(findOne);
      }
    }else{
      console.log('dataset not found');
    }
  }
});
