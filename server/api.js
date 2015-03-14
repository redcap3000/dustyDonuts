Meteor.startup(function () {
	// refresh hourly? or more?
	Meteor.setInterval(function(){
		// to avoid less complex calls go ahead and set from/before
		// to be set to around the value of the delay....
		console.log('doing 4 hour total data interval lookup');
		// run on timeouts prolly
		Meteor.call("callAllCities",null,null,"4h","mean",function(){
			Meteor.call("callAllCities",null,null,"4h","sumsq",function(){
				Meteor.call("callAllCities",null,null,"4h","max",function(){
					Meteor.call("callAllCities",null,null,"4h","min",function(){
						Meteor.call("callAllCities",null,null,"4h","count");
					});
				});
			});
		});
	}, 60 * 60 * 4  * 1000);

	Meteor.setInterval(function(){
		console.log('doing5 min total data interval lookup');
		Meteor.call("callAllCities",null,null,"5m","mean",function(){
			Meteor.call("callAllCities",null,null,"5m","sumsq",function(){
				Meteor.call("callAllCities",null,null,"5m","max",function(){
					Meteor.call("callAllCities",null,null,"5m","min",function(){
						Meteor.call("callAllCities",null,null,"5m","count");
					});
				});
			});
		});
	}, 60 * 4 * 1000)
});

Meteor.publish("dataset",function(overCity,from,before,fields,op,resolution){
	// get one day only by default ? 
	return dataset.find({});
});

Meteor.publish("datasetRange",function(f,b,resolution,op,refresh){

	console.log(f);
	console.log(b);
	if(typeof f != "undefined" && typeof b != "undefined" && f && b){
		var from = moment(f,"YYYYMMDD").startOf('day');
		var before = moment(b,"YYYYMMDD").endOf('day');
	}

	if(!from || !before){
		var from = moment().startOf('day');
		var before = moment().subtract(1,'days').endOf('day');
		console.log('returning single day values');

	}
	if(typeof op == "undefined" || !op || op == null || op == ''){
		op = 'mean'
	}
	if(typeof resolution == "undefined" || !resolution || resolution == null){
		// 1 hour default resolution....
		resolution = "1h";
	}


	if(refresh == true){
		// notify when this is finished...
		Meteor.call("callAllCities",from.format("YYYYMMDD"),before.format("YYYYMMDD"),resolution,op);
	}

	console.log(op);
	console.log(resolution);
	/*
		todo support resolution to look up rounded date stamps instead of requerying...
	*/
	// probably make some calls happen if a date range doesn't exist.. returns empty row etc...
	// get only a two/three day
	return dataset.find({op:op,resolution:resolution,timestamp: { $gte: from.toDate(), $lt: before.toDate() }} );
	
})



Meteor.methods({
	callAllCities: function(from,before,resolution,op){
		if(typeof from != undefined && from != false && from != null){
			from = moment(from,'YYYYMMDD').startOf('day').format().replace('+','-');
		}else{
			from = undefined;
		}
		if(typeof before != "undefined" && before != false && before != null){
			before = moment(before,'YYYYMMDD').endOf('day').format().replace('+','-');
		}else{
			before = undefined;
		}
		if(typeof resolution == "undefined" || !resolution || resolution == null){
			resolution = '1h';
		}
		Meteor.call("govApi","Rio de Janeiro",null,op,resolution,from,before);
		Meteor.call("govApi","Geneva",null,op,resolution,from,before);
		Meteor.call("govApi","Boston",null,op,resolution,from,before);
		Meteor.call("govApi","Bangalore",null,op,resolution,from,before);
		Meteor.call("govApi","San Francisco",null,op,resolution,from,before);
		Meteor.call("govApi","Shanghai",null,op,resolution,from,before);
		Meteor.call("govApi","Singapore",null,op,resolution,from,before);
		return true;
	},
	govApi: function (overCity,fields,op,resolution,from,before) {
		// ...
		if(typeof from == "undefined" || from == null){
			//start
			console.log('here');
			from = moment().subtract(1,'days').startOf('day').format();
		}else{
			// convert string into iso timestamp...
			from = moment(from,'YYYYMMDD').format();
		}
		if(typeof before == "undefined" || before == null){
			//end today ??
			before = moment().startOf('day').format();
		}else{
			before = moment(before,'YYYYMMDD').format();
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