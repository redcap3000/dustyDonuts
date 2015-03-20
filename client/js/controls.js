
Template.controls.rendered = function(){
   $( "input[type=submit], a, button" )
      .button()
      .click(function( event ) {
        event.preventDefault();
      });
  $( "#dateStart" ).datepicker({
      //defaultDate: "+1w",
      //changeMonth: true,
      //numberOfMonths: 2,
      onClose: function( selectedDate ) {
        //$( "dateEnd" ).datepicker( "option", "minDate", selectedDate );
        Session.set("dateStart",moment(selectedDate).format("YYYYMMDD"));
      }
    });
    $( "#dateEnd" ).datepicker({
      //defaultDate: "+1w",
      //changeMonth: true,
      //numberOfMonths: 2,
      onClose: function( selectedDate ) {
        //$( "#dateStart" ).datepicker( "option", "maxDate", selectedDate );
        Session.set("dateEnd",moment(selectedDate).format("YYYYMMDD"));
        
      }
    });
};

Template.controls.helpers({
  refreshButton : function(){
    $( '#btnSet' ).buttonset('refresh');
  },
  startDate: function () {
    return Session.get("startDate");
  },
  endDate : function(){
    return Session.get("endDate");
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
        "Query API": function() {
          Session.set('dataRefresh',true);
          Template.aggregateData.onCreated();
          $( this ).dialog( "close" );
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
  },
  'change .dateStart': function (evt,tmpl) {
    var date = tmpl.find(".dateStart");
    if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
      Session.set("dateStart",moment(date.value).format("YYYYMMDD"));
 
      Template.aggregateData.onCreated();
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
      Template.aggregateData.onCreated();
      return true;
  }

});
