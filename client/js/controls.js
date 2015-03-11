
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
  'change .startDate': function (evt,tmpl) {
    var date = tmpl.find(".startDate");
    if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
      Session.set("startDate",date.value);
    }
    return true;
    // ...
  },
  'change .endDate': function(evt,tmpl){
    var date = tmpl.find('.endDate');
      if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
        Session.set("endDate",date.value);
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
