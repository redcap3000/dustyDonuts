
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
  },
  datasetReady : function(){
    var dataset = Session.get("dataReady");
    if(dataset && typeof dataset != "undefined"){
      return dataset;
    }
    return false;
  },
  getSelectedDateStart : function(){
    console.log('what the fuck');
    var date = Session.get("dateStart");
    return moment(date,"YYYYMMDD").format("YYYY-MM-DD");

  },
  getSelectedDateEnd : function(){
        return moment(date,"YYYYMMDD").format("YYYY-MM-DD");

    return Session.get("dateEnd");
  },
  getDataRefresh : function(){
    return Session.get("dataRefresh");
  }
});

Template.controls.events({
  'change .op' : function(evt,tmpl){  
    var op = tmpl.find(".op");
    if(op && typeof op.value != "undefined" && op.value != ''){
      Session.set("op",op.value)
      return true;
    }
    return false;
  },
  'change .resolution' : function(evt,tmpl){
    var res = tmpl.find(".resolution");
    if(res && typeof res.value != "undefined" && res.value != ''){
      Session.set("op",res.value)
      return true;
    }
    return false;
  },
  'change .dateStart': function (evt,tmpl) {
    var date = tmpl.find(".dateStart");
    if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
      console.log(date.value);
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
