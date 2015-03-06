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
			from = moment().subtract(1,'days').startOf('hour').format();
		}
		if(typeof before == "undefined"){
			//end today ??
			before = moment().startOf('hour').format();
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

		base_url += 'from=' + from + '&before=' + before + '&fields=' + fields + '&resolution=' + resolution+ '&op=' + op + '&over.city=' + overCity ;
		console.log(base_url);

//		2015-02-04T00:00:00-0800
//      &before=2015-02-05T00:00:00-0800

		Meteor.http.get(base_url,false,function(error,response){
			if(typeof error != "undefined" && typeof response != "undefined" && typeof response.data != "undefined" && typeof response.data.data != "undefined"){

				response.data.data.filter(function(arr){
					// we have rows and fields... mehhh
					/*
					if(typeof arr.rows != "undefined" && typeof arr.fields != "undefined"){
						// ths is the weird response ...
						//console.log(arr.fields);
						// i'm guessing the order of the params are the order in which
						// you structure &fields=
						var fSplit = fields.split(',');
						arr.rows.filter(function(arr2,i){
								var dbEntry = {};
								_.pairs(arr2).filter(function(newParam){
									if(newParam[0] != 'city' && newParam[0] != 'timestamp'){
										var key = parseInt(newParam[0]);
										if(key){
											dbEntry[fSplit[key]] = newParam[1];
										}else if(newParam[0] == '0'){
											dbEntry[fSplit[0]] = newParam[1];
										}
									}else if(newParam[0] == 'timestamp'){
										dbEntry._id = newParam[1] + resolution + op;

									}else{
										dbEntry[newParam[0]] = newParam[1];
									}
									// id via timestamp ???
								});
								if(dbEntry != {} && typeof dbEntry._id != "undefined"){
									// if the objet exists and the fields are different...
									// probaby want to use an update and "$set"
									dataset.update({_id : dbEntry._id },dbEntry,{upsert : true});
								}
							// build a new object....
						});
					*/
						arr._id = arr.timestamp + resolution + op + overCity;
						arr.timestamp = new Date(arr.timestamp);
						if(dataset.findOne({_id : arr._id}).length === 0 )
							dataset.update({_id : arr.timestamp + resolution + op + overCity}, arr,{upsert:true});

					
				});
			}
		});
		return true;

//		http://sensor-api.localdata.com/api/v1/sources/ci4tmxpz8000002w7au38un50/entries.csv?count=1&sort=desc
//	from: Return responses from the the given time, in ISO 8601 format.
//	before: Return responses up to the given time, in ISO 8601 format.
//from=2015-02-04T00:00:00-0800&before=2015-02-05T00:00:00-0800
	}
});