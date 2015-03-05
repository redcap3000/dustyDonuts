Meteor.publish("dataset",function(from,before,overCity,fields,op,resolution){
	return dataset.find();
});

Meteor.methods({
	govApi: function (from,before,overCity,fields,op,resultion) {
		// ...
		if(typeof from == "undefined"){
			//start
			from = moment().subtract(7,'days').format();
		}
		if(typeof before == "undefined"){
			//end today ??
			before = moment().format();
		}
		if (typeof fields == "undefined"){
			fields = 'airquality_raw,dust,sound';
		}
		// aggregation operation
		if(typeof op == "undefined"){
			op = 'mean';
		}

		if(typeof resolution == 'undefined'){
			resolution = '1h'
		}
		if(typeof overCity == "undefined"){
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
				//console.log(typeof response.data.data);
				//console.log(_.keys(response.data));
				//console.log(_.keys(response.data.data[0]));
//				console.log(_.keys(response.data.data[1]));

				response.data.data.filter(function(arr){
					// we have rows and fields... mehhh
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
										dbEntry._id = newParam[1];

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
					}else{
						arr._id = arr.timestamp + resolution + op;
						arr.timestamp = new Date(arr.timestamp);
						dataset.update({_id : arr.timestamp + resolution + op}, arr,{upsert:true});
					}
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