
Meteor.startup(function(){
  Session.set("selectedTime",undefined);
  Session.set("selectedCity",undefined);
  Session.set("entryFilter",undefined);
  Session.set("dataReady", undefined);
  Session.set("dataRefresh",false)
  Session.set("dataResolution","4h");
  Session.set("op","mean");
  Session.set("dateEnd",moment().startOf('day').format("YYYYMMDD") );
  Session.set("dateStart", moment().subtract(3,'days').endOf('day').format("YYYYMMDD"));



  Tracker.autorun(function() {
    console.log('autorun');
    var dateStart = Session.get("dateStart");
    var dateEnd = Session.get("dateEnd");
    var resolution = Session.get("dataResolution");
    var refresh = Session.get("dataRefresh");
    var op = Session.get("op");
    console.log(op);
    handle = Meteor.subscribe('datasetRange',dateStart,dateEnd,resolution,op,refresh,function(){
      console.log('subbed to dataset');
      Session.set("dataReady",false);
      if(Session.equals("dataRefresh",true)){
        console.log("made call to refresh range");
        Session.set("dataRefresh",false);
      }
    });

    if (handle.ready()){
      if(typeof dataset != "undefined"){
        var findOne = dataset.findOne();
        if(typeof findOne != "undefined" && findOne){
          d3.selectAll(".legend").remove();
          renderLegend(findOne);
          Session.set("dataReady",true);
        }else{
          // probably attempt to refresh data.. at least once..
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