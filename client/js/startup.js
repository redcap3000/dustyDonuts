
Meteor.startup(function(){
  Session.set("selectedTime",undefined);
  Session.set("cityFilter","Boston,Rio de Janeiro,San Francisco,Shanghai,Singapore,Bangalore,Geneva");
  Session.set("fieldsFilter","airquality_raw,dust,sound");
  Session.set("selectedCity",undefined);
  Session.set("entryFilter",undefined);
  Session.set("dataRefresh",false)
  Session.set("resolution","1h");
  Session.set("op","mean");
  Session.set("dateEnd",moment().endOf('day').format("YYYYMMDD") );
  Session.set("dateStart", moment().subtract(1,'days').startOf('day').format("YYYYMMDD"));
  // turn this into fewr functions... ammahhh!!!
});