Session.set("selectedTime",undefined);
Session.set("selectedCity",undefined);
Session.set("entryFilter",undefined);
Session.set("dataReady", undefined);
Session.set("dateEnd",moment().startOf('day').format("YYYYMMDD") );
Session.set("dateStart", moment().subtract(3,'days').endOf('day').format("YYYYMMDD"));

Meteor.startup(function(){

  Tracker.autorun(function() {
    console.log('autorun');
    var dateStart = Session.get("dateStart");
    var dateEnd = Session.get("dateEnd");

    handle = Meteor.subscribe('datasetRange',dateStart,dateEnd,function(){
      console.log('subbed to dataset');
      Session.set("dataReady",true);
    
    });

    if (handle.ready()){
      
      if(typeof dataset != "undefined"){
        var findOne = dataset.findOne();
        if(typeof findOne != "undefined" && findOne){
          d3.selectAll(".legend").remove();
          renderLegend(findOne);
          Session.set("dataReady",true);
        }
      }else{
        console.log('dataset not found');
      }
    }else{
      Session.set("dataReady",false);
      // make something to show something is loading....
      console.log('loading....');
    }
  });
});