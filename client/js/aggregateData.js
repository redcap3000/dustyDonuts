
Template.aggregateData.helpers({
   getSummaryData : function(){
    /*
      
      Structures responses to group all of a cities data into another variable called 'aniValues'
      to iterate through when generating click-based animations

    */
    var validFields = 'airquality_raw temperature humidity light sound dust';
    var r = [];
    var byCity = {}, data = dataset.find({},{sort: {ts: 1}}).fetch().map(function (o) {

     if(typeof byCity[o.ct] == "undefined"){
      // only put id in first record
          byCity[o.ct] = [];
          var d3_t = o.d3;
          d3_t[4] = o._id;
          byCity[o.ct].push(d3_t);
        }else{
          byCity[o.ct].push(o.d3);

        }
      });

      var r = [], cities = _.keys(byCity);
      var fieldsFilter = Session.get("fieldsFilter");

      for(var key in byCity){
        if(typeof byCity[key] != "undefined" && byCity[key].length > 0){
          console.log(byCity[key][0]);
          var o = { _id : byCity[key][0][4], ct : key , ts : moment.unix(byCity[key][0][3]).toDate() , airquality_raw : byCity[key][0][0] , dust : byCity[key][0][1] , sound : byCity[key][0][2] };
          o.aniValues = [];
          byCity[key].filter(function(obj,i){

              if(i > 0){
                var obj2 = {};
               // console.log(obj);
                obj2.airquality_raw = obj[0];
                obj2.dust = obj[1];
                obj2.sound = obj[2];
                obj2.ts =  moment.unix(obj[3]).toDate();
                o.aniValues.push(obj2);
              }else{
                // set top level props
              }
            }
          );
        }
          r.push(o); 
      }
      return r;
}
});

Template.aggregateData.onCreated(function(){
  var self = this;
  self.autorun(function(){
     self.subscribe('datasetRange',Session.set("cityFilter"),Session.get("dateStart"),Session.get("dateEnd"),Session.get("resolution"),Session.get("op"),Session.get("fieldsFilter"),Session.get("dataRefresh"),function(){
      console.log('subbed to dataset');
      Session.set("dataReady",false);
      if(Session.equals("dataRefresh",true)){
        console.log("made call to refresh range");
        Session.set("dataRefresh",false);
      }
    });
  });
});