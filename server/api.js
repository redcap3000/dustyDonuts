Meteor.methods({
	govApi: function (from,before,fields,op,resultion,overCity) {
		// ...
		if(typeof from == "undefined"){
			//start
			from = '2015-02-04T00:00:00-0800';
		}
		if(typeof before == "undefined"){
			//end
			before = '2015-02-05T00:00:00-0800';
		}
		if (typeof fields == "undefined"){
			fields = 'airquality_raw,dust';
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
		//console.log(base_url);

//		2015-02-04T00:00:00-0800&before=2015-02-05T00:00:00-0800

		Meteor.http.get(base_url,false,function(error,response){
			if(typeof error != "undefined" && typeof response != "undefined" && typeof response.data != "undefined" && typeof response.data.data != "undefined"){
				//console.log(typeof response.data.data);

				response.data.data.filter(function(arr){
					arr.resolution = resolution;
					arr.op = op;
					dataset.insert(arr);
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