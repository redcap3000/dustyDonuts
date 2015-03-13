
Template.controls.helpers({
  data : function(){
    return {datetime1: moment.utc().toDate() ,datetime2 : moment.utc().toDate()}
  },
  startDate: function () {
    return Session.get("startDate");
  },
  endDate : function(){
    return Session.get("endDate");
  },
  selectedCity :function(){
    return Session.get("selectedCity");
  }
});

Template.controls.events({
  'change .dateStart': function (evt,tmpl) {
    var date = tmpl.find(".dateStart");
    if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
      Session.set("dateStart",moment(date.value).format("YYYYMMDD"));
    }else{
              alert("no change");

    }
    return true;
    // ...
  },
  'change .dateEnd': function(evt,tmpl){
    var date = tmpl.find('.dateEnd');
      if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
        Session.set("dateEnd",moment(date.value).format("YYYYMMDD"));
      }else{
        alert("no change");
      }
      return true;
  },
  'change .city' : function(evt,tmpl){
    var city = tmpl.find(".city");
    if(typeof city != "undefined" && city && city.value != "undefined" && city.value != ''){
      // remove spaces from value
      Session.set("selectedCity",city.value);

    }else{
      Session.set("selectedCity",false);
    }
  },
  'click .reset' : function(evt,tmpl){
    handle.stop();
    handle = Meteor.subscribe('dataset',function(){
      // destroy and rerender legend....

    });
  }
});
