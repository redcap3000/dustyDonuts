Meteor.startup(function () {
	// refresh hourly? or more?
	Meteor.setInterval(function(){
		console.log('doing interval lookup');
		Meteor.call("govApi","Rio de Janeiro");
		Meteor.call("govApi","Geneva");
		Meteor.call("govApi","Boston");
		Meteor.call("govApi","Bangalore");
		Meteor.call("govApi","San Francisco");
		Meteor.call("govApi","Shanghai");
		Meteor.call("govApi","Singapore");
	},60 * 60 * 30);
});

Meteor.publish("dataset",function(overCity,from,before,fields,op,resolution){
	// get one day only by default ? 
	return dataset.find({});
});

Meteor.methods({
	govApi: function (overCity,fields,op,resultion,from,before) {
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
		if(typeof resolution == 'undefined' || op == null){
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
					arr._id = arr.timestamp + resolution + op + overCity;
					arr.timestamp = new Date(arr.timestamp);
					var lookup = dataset.findOne({ _id : arr._id});
					return (typeof lookup == "undefined" || !lookup ? dataset.update({_id : arr.timestamp + resolution + op + overCity}, arr,{upsert:true}) : false);
				});
			}
		});
		return true;
	}
});