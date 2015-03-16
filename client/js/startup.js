
Meteor.startup(function(){
  Session.set("selectedTime",undefined);
  Session.set("cityFilter","Boston,Rio de Janeiro,San Francisco,Shanghai,Geneva");
  Session.set("fieldsFilter","airquality_raw,dust,sound,light,temperature");
  Session.set("selectedCity",undefined);
  Session.set("entryFilter",undefined);
  Session.set("dataReady", undefined);
  Session.set("dataRefresh",false)
  Session.set("resolution","4h");
  Session.set("op","mean");
  Session.set("dateEnd",moment().startOf('day').format("YYYYMMDD") );
  Session.set("dateStart", moment().subtract(3,'days').endOf('day').format("YYYYMMDD"));
  // turn this into fewr functions... ammahhh!!!

  addField = function(field){
    var fields = Session.get("fieldsFilter");
    if(fields){
      var value = fields.search(field);
      if(value == -1){
        fields += ',' + field;
        Session.set("fieldsFilter",fields);
      }else{
        // dont readd a city thats already there?
        // shouldn't happen...
      }
    }
  };
  removeField = function(field){
    var fields = Session.get("fieldsFilter");
    if(fields){
      if(fields.search(field) > -1){
        // ahh comma check????
        fields = fields.replace(field,"");
        Session.set("fieldsFilter",fields);
      }else{
        console.log('coudl not find ' + field + ' in ' + fields);
      }
    }
  };
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
  };
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
  };


  Tracker.autorun(function() {
    console.log('autorun');
    var dateStart = Session.get("dateStart");
    var dateEnd = Session.get("dateEnd");
    var resolution = Session.get("resolution");
    var refresh = Session.get("dataRefresh");
    var op = Session.get("op");
    var cities = Session.get("cityFilter");
    var fields = Session.get("fieldsFilter");
    var findOne = dataset.findOne();
    console.log(op);
    console.log(fields);
    handle = Meteor.subscribe('datasetRange',cities,dateStart,dateEnd,resolution,op,fields,refresh,function(){
      console.log('subbed to dataset');
      Session.set("dataReady",false);
      if(Session.equals("dataRefresh",true)){
        console.log("made call to refresh range");
        Session.set("dataRefresh",false);
      }
      if(findOne){
        renderLegend(findOne);
      }
      try {
             $( '#btnSet' ).buttonset('refresh');
                $( '#btnSetFields' ).buttonset('refresh');
          } catch (exception) {}

    });

    if (handle.ready()){
      if(typeof dataset != "undefined"){
        
        if(typeof findOne != "undefined" && findOne){
          console.log('rendering legend');
          d3.selectAll(".legend").remove();
          renderLegend(findOne);
          Session.set("dataReady",true);
          // i fugging hate jquery ui crap in reactive env.
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