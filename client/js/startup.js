
Meteor.startup(function(){
  Session.set("selectedTime",undefined);
  Session.set("cityFilter","Boston,Rio de Janeiro,San Francisco,Shanghai,Geneva")
  Session.set("selectedCity",undefined);
  Session.set("entryFilter",undefined);
  Session.set("dataReady", undefined);
  Session.set("dataRefresh",false)
  Session.set("resolution","4h");
  Session.set("op","mean");
  Session.set("dateEnd",moment().startOf('day').format("YYYYMMDD") );
  Session.set("dateStart", moment().subtract(3,'days').endOf('day').format("YYYYMMDD"));

  addCity = function(city){
    console.log(city);
    var cities = Session.get("cityFilter");
    if(cities){
      var value = cities.search(city);
      if(value == -1){
        cities += ',' + city;
        Session.set("cityFilter",cities);
      }else{
        // dont readd a city thats already there?
        // shouldn't happen...
      }
    }
  }
  removeCity = function(city){
    console.log('remove' + city);
    var cities = Session.get("cityFilter");
    if(cities){
      if(cities.search(city) > -1){
        console.log(cities);
        // ahh comma check????
        cities = cities.replace(city,"");
        console.log(cities);
        Session.set("cityFilter",cities);
      }else{
        console.log('coudl not find ' + city + ' in ' + cities);
        // not here probably add it back ?
        // infinte loop warning?
        //addCity(city);
      }
    }
  }


  Tracker.autorun(function() {
    console.log('autorun');
    var dateStart = Session.get("dateStart");
    var dateEnd = Session.get("dateEnd");
    var resolution = Session.get("resolution");
    var refresh = Session.get("dataRefresh");
    var op = Session.get("op");
    var cities = Session.get("cityFilter");
    console.log(op);
    handle = Meteor.subscribe('datasetRange',cities,dateStart,dateEnd,resolution,op,refresh,function(){
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