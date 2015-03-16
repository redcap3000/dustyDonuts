
Template.controls.rendered = function(){

   $( "input[type=submit], a, button" )
      .button()
      .click(function( event ) {
        event.preventDefault();
      });
  $( "#btnSet" ).buttonset();
  $( "#btnSetResolutions").buttonset();
  $( "#btnSetFields" ).buttonset();

 $( "#op" ).selectmenu(  {change: function( event, ui ) {
  if(typeof ui != "undefined" && typeof ui.item != "undefined" && typeof ui.item.value != "undefined"){
    var op = Session.get("op");
    if(ui.item.value != "op"){
      Session.set("op",ui.item.value);
    }
  }else{
    return false;
  }
 }});

 $( "#resolution" ).selectmenu({change: function( event, ui ) {
  if(typeof ui != "undefined" && typeof ui.item != "undefined" && typeof ui.item.value != "undefined"){
    var op = Session.get("resolution");
    if(ui.item.value != "resolution"){
      Session.set("resolution",ui.item.value);
    }
  }else{
    return false;
  }
 }});

  $( "#dateStart" ).datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      numberOfMonths: 2,
      onClose: function( selectedDate ) {
        $( "#dateEnd" ).datepicker( "option", "minDate", selectedDate );
      }
    });
    $( "#dateEnd" ).datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      numberOfMonths: 2,
      onClose: function( selectedDate ) {
        $( "#dateStart" ).datepicker( "option", "maxDate", selectedDate );
      }
    });


};

Template.controls.helpers({
  resolutions : function(){
    var resolutions = [
      {name:"4h",title:"4 Hours"},
      {name:"1h",title:"1 Hour"},
      {name:"5m",title:"5 Min."}
    ];

    var currentResolution = Session.get("resolution");
    var r = [];

    resolutions.filter(function(o){
      if(o.name == currentResolution){
        o.checked = true;
      }
      r.push(o);

    });

    return r;

    /*

        <input type="radio" id="radio1" name="radio"><label for="radio1">Choice 1</label>
        <input type="radio" id="radio2" name="radio" checked="checked"><label for="radio2">Choice 2</label>
  
    
    */
  },
  refreshButton : function(){
    $( '#btnSet' ).buttonset('refresh');
  },
  isVisible : function(){
    //$( ".cityBox" ).button( "refresh" )
    var cities = Session.get("cityFilter");
    if(typeof cities != "undefined" && cities.search(this + '') > -1){
      return true;
    }
    return false;

//    if()
  },
  getFields : function(){
    var fields = [
        'light',
        'sound',
        'humidity',
        'dust'];
        
        var fieldsFilter = Session.get("fieldsFilter");
        if(typeof fieldsFilter != "undefined" && fieldsFilter){


         var c = fieldsFilter.split(",");
            if(c){
              //c = c.filter(boolean);

              var r =[];
              //var cities = Session.get("cityFilter");
              fields.filter(function(o){
                // use nae for id purposes...
                var obj = {name : o };
              
                if(fieldsFilter.search(o) !== -1){
                  obj.checked = true;
                }else{
                  obj.checked = false;
                }
                r.push(obj);
              });
              // create buttonsets and update state?
              return r;
            }
        }
      return false;
  
  },
  getCities : function(){
    var cFilter = Session.get("cityFilter");
    var cities = "Bangalore,Boston,Rio de Janeiro,San Francisco,Shanghai,Singapore,Geneva";
    var c = cities.split(",");
    if(c){
      var r =[];
      //var cities = Session.get("cityFilter");
      c.filter(function(o){
        // use nae for id purposes...
        var obj = {name : o.replace(/ /g,''), title : o };
      
        if(cities.search(o) !== -1){
          obj.checked = true;
        }else{
          obj.checked = false;
        }
        r.push(obj);
      });
      // create buttonsets and update state?
      return r;
    }
  

  },
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
  'click .refresh' : function(){

      $( "#dialog-confirm" ).dialog({
      resizable: false,
      modal: true,
      buttons: {
        "Send this query to the api": function() {
          Session.set('dataRefresh',true)
          $( this ).dialog( "close" );
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });

  },
  'click .cityBox' : function(evt,tmpl){

    $( "#btnSet" ).buttonset("refresh");
    //$( "#" + this.name ).button( "refresh" );
  },
  'change .op' : function(evt,tmpl){  
    var op = tmpl.find(".op");
    if(op && typeof op.value != "undefined" && op.value != ''){
      Session.set("op",op.value)
      return true;
    }
    return false;
  },
  'change .resolution' : function(evt,tmpl){
    alert('change');
    var res = tmpl.find(".resolution");
    if(res && typeof res.value != "undefined" && res.value != ''){
      Session.set("resolution",res.value)
      return true;
    }
    return false;
  },
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
