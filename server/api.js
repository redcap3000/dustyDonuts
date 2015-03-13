Meteor.startup(function () {
	// refresh hourly? or more?
	Meteor.setInterval(function(){

		console.log('doing interval lookup');
		Meteor.call("govApi","Rio de Janeiro",null,null,'5m');
		Meteor.call("govApi","Geneva",null,null,'5m');
		Meteor.call("govApi","Boston",null,null,'5m');
		Meteor.call("govApi","Bangalore",null,null,'5m');
		Meteor.call("govApi","San Francisco",null,null,'5m');
		Meteor.call("govApi","Shanghai",null,null,'5m');
		Meteor.call("govApi","Singapore",null,null,'5m');
	},60 * 60 * 30);
});
Meteor.publish("datasetHiResolution",function(){
	// only return high resolutions ?




});
Meteor.publish("dataset",function(overCity,from,before,fields,op,resolution){
	// get one day only by default ? 
	return dataset.find({});
});

Meteor.publish("datasetRange",function(f,b){
	console.log(f);
	console.log(b);
	if(typeof f != "undefined" && typeof b != "undefined" && f && b){

		var from = moment(f,"YYYYMMDD").startOf('day');
		var before = moment(b,"YYYYMMDD").endOf('day');

		//if(!moment.isDate(from) || !moment.isDate(before)){
		//	console.log("NOT A DATE");
		//	console.log(f);
		//	console.log(b);
		//	from = moment().toDate();
		//	before = moment().subtract(1,'days').toDate();
		//	console.log(before);
		//	console.log("returning default dateset");
		
	
		
	}
	console.log(from);
	console.log(before);

	if(!from || !before){
		var from = moment().startOf('day');
		var before = moment().subtract(1,'days').endOf('day');
		console.log('returning single day values');

	}
		// get only a single day
		return dataset.find({timestamp: { $gte: from.toDate(), $lt: before.toDate() }} );
	
})

Meteor.publish("datasetDigest",function(from,before,op,resolution){

  var byCity = {};
    var data = dataset.find({},{sort: {timestamp: 1}}).map(function (o) {
    	// ...
   if(typeof byCity[o.city] == "undefined"){
        byCity[o.city] = [];
      }
      byCity[o.city].push(o);

    });;
  

    var r = [];
    var cities = _.keys(byCity);

    if(typeof byCity[cities[0]] != "undefined"){
    	console.log(cities);
    	for (var i = 0; i < cities.length; i++) {
    		console.log(byCity[cities[i]].length);
    		var theCity = {}
    		for(var z = 0; z < byCity[cities[i]].length;z ++){
    			if(z === 0){
    				theCity.aniValues = [byCity[cities[i]][z]];
    			}else{
    				theCity.aniValues.push(byCity[cities[i]][z]);
    			}
    			if(z === byCity[cities[i]].length - 1 ){
    				console.log("end of cities");
    				console.log(theCity);
    			}
    		}
    		r.push(theCity);
    	};
//      console.log(byCity);
      return r;
      // now add this data as a marker???
    }else{
      return [];
    }

});

Meteor.methods({
	govApi: function (overCity,fields,op,resolution,from,before) {
		// ...
		if(typeof from == "undefined"){
			//start
			from = moment().subtract(1,'days').startOf('day').format();
		}
		if(typeof before == "undefined"){
			//end today ??
			before = moment().startOf('day').format();
		}
		if (typeof fields == "undefined" || fields == null){
			fields = 'airquality_raw,dust,sound';
		}
		// aggregation operation
		if(typeof op == "undefined" || op == null){
			op = 'mean';
		}
		if(typeof resolution == 'undefined' || resolution == null){
			resolution = '1h'
		}
		if(typeof overCity == "undefined" || overCity == null){
			overCity = 'San Francisco'
		}
		//http://sensor-api.localdata.com/api/v1/aggregations.csv?op=mean&fields=temperature,light,airquality_raw,sound,humidity,dust
		// &resolution=1h&
		// over.city=San Francisco
		// &from=2015-02-27T08:00:00.000Z&before=2015-02-28T08:00:00.000Z
		var base_url = 'http://sensor-api.localdata.com/api/v1/aggregations?';
		// need to replace + with minus  for from before timestamps weird timestamp thing? hmmmm
		from = from.replace('+','-');
		before = before.replace('+','-');
		base_url +=  'op=' + op + '&over.city=' + overCity + '&from=' + from + '&before=' + before +  '&resolution=' + resolution+ '&fields=' + fields  ;
		console.log(base_url);

		Meteor.http.get(base_url,false,function(error,response){
			if(typeof error != "undefined" && typeof response != "undefined" && typeof response.data != "undefined" && typeof response.data.data != "undefined"){
				response.data.data.filter(function(arr){
					arr.resolution = resolution;
					arr.city = overCity;
					arr.op = op;
					arr.timestamp = new Date(arr.timestamp);
					var lookup = dataset.findOne( {resolution: resolution,timestamp : arr.timestamp,city : overCity,op : op} );
					return (typeof lookup == "undefined" || !lookup ? dataset.update({resolution: resolution,timestamp : arr.timestamp,city : overCity,op : op}, arr,{upsert:true}) : false);
				});
			}
		});
		return true;
	}
});