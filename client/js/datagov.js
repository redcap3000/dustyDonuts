


Template.aggregateData.rendered = function(){

  map = L.map('map').setView([0,0], 2);
  L.tileLayer.provider('Stamen.Watercolor').addTo(map);
  map._initPathRoot();

  var svg = d3.select("#map").select("svg"),g = svg.append("g");
   
  // Add a LatLng object to each item in the dataset
  collection.objects.forEach(function(d) {
   d.LatLng = new L.LatLng(d.circle.coordinates[0],
      d.circle.coordinates[1])
  })
    
  var feature = g.selectAll("circle")
   .data(collection.objects)
   .enter().append("circle")
   .style("stroke", "black")  
   .style("opacity", .6) 
   .style("fill", function(d){
    if(typeof d.circle != "undefined" && typeof d.circle.color != "undefined"){
      return d.circle.color;
    }
    return 'black';
   })
   .attr("r", 20);  

  map.on("viewreset", update);
  update();

  feature.on('click',function(d){
    // begin animation????
  /// toggle action!!
  // maybe pull up dialog to filter results via time, date, city ...
  console.log(d.circle.city);
    if(Session.equals("selectedCity",d.circle.city)){
      // reset
      Session.set("selectedCity",false);
      // refresh all cirtcles? resub??
      handle.stop();
     
      map.setView([0,0], 2);


      handle = Meteor.subscribe('dataset',function(){
        // destroy and rerender legend....
        console.log('subbed to dataset');

      });
      
      return true;
    }
    Session.set("selectedCity",d.circle.city);
    var loc = d.circle.coordinates;
    if(loc){
      map.setView([loc[0],loc[1]], 4);
    }


  }); 

  function update() {
   feature.attr("transform", 
   function(d) { 
       return "translate("+ 
    map.latLngToLayerPoint(d.LatLng).x +","+ 
    map.latLngToLayerPoint(d.LatLng).y +")";
       }
   )
  }
   

};



Template.aggregateData.helpers({
   getSummaryData : function(){

    var byCity = {};
      var data = dataset.find({},{sort: {timestamp: 1}}).fetch().filter(function (o) {
        // ...
     if(typeof byCity[o.city] == "undefined"){
          byCity[o.city] = [];
        }
        byCity[o.city].push(o);

      });

      var data = dataset.find().fetch();

      var r = [];
      var cities = _.keys(byCity);

 

      if(typeof byCity[cities[0]] != "undefined"){

        for(var key in byCity){
          var o = byCity[key][0];  
          o.aniValues = [];
          byCity[key].filter(function(obj,i){
            if(i > 0){
              o.aniValues.push(obj);
            }

          });
          r.push(o);
        }

        return r;
        // now add this data as a marker???
      }else{
        return [];
      }
  },
  getData: function () {
    // ...
    if(typeof dataset == "undefined"){
      return false;
    }
    renderLegend();
    var selectedCity = Session.get('selectedCity');
    var entryFilter = Session.get("entryFilter");

    if(typeof entryFilter == "undefined" || !entryFilter){
      entryFilter = 25;
    }else{
      entryFilter = parseInt(entryFilter);
    }
    if(typeof selectedCity != "undefined" && selectedCity){
      return dataset.find({city : selectedCity},{sort : {timestamp: 1 },limit : entryFilter }).fetch();
    }else{
      // else do a software side sort of city to enforce city order
      // return everything grouped by city? like an arrays []
      var data = dataset.find({},{sort: {timestamp: 1}}).fetch();
    }
    var byCity = {};

    data.filter(function(o,i){
      if(typeof byCity[o.city] == "undefined"){
        byCity[o.city] = [];
      }
      byCity[o.city].push(o);
    });
    
    var r = [];
    var cities = _.keys(byCity);
    if(typeof byCity[cities[0]] != "undefined"){

      for (var i = 0; i < entryFilter; i++) {
        cities.filter(function(cityName){
          r.push(byCity[cityName][i]);
        });
      }
      return r;
      // now add this data as a marker???
    }else{
      return [];
    }
  }
});



Template.singlePlot.destroyed = function(){
  if(typeof this.data == "undefined" && typeof this.city != "undefined"){
    var GUID = moment(this.timestamp).format('YYYMMDDTHHMMSS') + this.city.split(' ').join();
  }else if(typeof this.data != "undefined" && typeof this.data.city != "undefined"){
    var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
  }else{
    // console.log('nothing to destroy');
    return false;
  }
//  console.log(GUID);
  d3.selectAll(".pie_" +  GUID ).remove();
  d3.selectAll(".arc_" + GUID ).remove();
  return true;
}


Template.singlePlot.rendered = function(){
  if(typeof this.data == "undefined"){
    return false;
  }

  var svg = d3.select("#map").select("svg"),g = svg.append("g");

  var data = this.data;
  var color = colorRange(this.data);
  // build a range for the cities????
  // dont need a foreach :()
/*

** Code relating to transitons

.delay(function(d, i) { return i / n * duration; })

*/
  
  data.fields = color.domain().map(function(name){
    if(typeof data[name != "undefined"]){
      return {name:name, val: parseFloat(data[name]) * (name == 'airquality_raw'? 10 : 1)   }
    }
    // hmmm validation???
    return {};
  })

  var radius = 55,
      padding = 0;
  var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);


  var pie = d3.layout.pie()
      .sort(null)
      // swap out population value
      .value(function(d) { return d.val; });





      // ATTACH A CLICK ACTION
  var svg = d3.select("d3data").append("pie")
      .data([data])
    .enter().append("svg")
      .attr("class", "graph pie_" + GUID)
      .attr("width", radius * 2)
      .attr("height", radius * 2)
    .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

  var arcG = svg.selectAll("arc" )
      .data(function(d) {
        // returns the size of the arc within the fields
       return pie(d.fields); 
     })
    .enter().append("path")
      .attr("class", "arc_" + GUID) 
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); })
      
      ;
  
  svg.append("text")
      .attr("dy", ".45em")
      .style("text-anchor", "middle").style("fill",function(d){
        if(typeof cityColors[d.city] != "undefined"){
          return cityColors[d.city];
        }
        return 'black';
      })
      .text(function(d) { 
        // color code the city....
        return (   moment(d.timestamp).format('M-D h a')  ) ; 
      });
      // set up animation to trigger on click.... hmmm
    var iCount = 0;
  

    

  svg.on('click',function(d){
  

   
    var order = 0;
    if(typeof interval == "undefined"){
     var interval = Meteor.setInterval(function(){
      
      console.log(order);
      console.log(d.aniValues.length);
      console.log( d.aniValues[order]);
      if(order === d.aniValues.length){
        order = 0;
      }

        d.aniValues[order].fields = color.domain().map(function(name){
        if(typeof data[name != "undefined"]){
          return {name:name, val: parseFloat(data[name]) * (name == 'airquality_raw'? 10 : 1)   }
        }
        // hmmm validation???
        return {};
      })

           arcG.data(function(z){
            console.log( pie(d.aniValues[order].fields) );
            return pie(d.aniValues[order].fields) })
      .transition().delay(function(d, i) { return i * 500; }).duration(500)
        .attrTween('d', function(d) {
             var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
             return function(t) {
                 d.endAngle = i(t);
               return arc(d);
             }
        }).each(function(d){ this._current = d;});

        order += 1;

    }, 2000);
  }else{
    // clear interval maybe?
  }
   

      //return d.aniValues[order];
  
    // set up string of animations ???
    //change();

    /// toggle action!!
    // maybe pull up dialog to filter results via time, date, city ...
      Session.set("selectedTime",moment(d.timestamp).format());
     

  

  }); 

  // Store the displayed angles in _current.
  // Then, interpolate from _current to the new angles.
  // During the transition, _current is updated in-place by d3.interpolate.
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

};


