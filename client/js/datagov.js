


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
              theCity = byCity[cities[i]][z];
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
          console.log(r);
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


Template.multiPlot.rendered = function () {
  // ...


 if(typeof this.data == "undefined"){
    return false;
  }
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

  svg.selectAll("arc" )
      .data(function(d) {
        // returns the size of the arc within the fields
       return pie(d.fields); 
     })
    .enter().append("path")
      .attr("class", "arc_" + GUID) 
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); })
      .transition().delay(function(d, i) { return i * 500; }).duration(500)
        .attrTween('d', function(d) {
             var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
             return function(t) {
                 d.endAngle = i(t);
               return arc(d);
             }
        })
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

  svg.on('click',function(d){
    /// toggle action!!
    // maybe pull up dialog to filter results via time, date, city ...
      Session.set("selectedTime",moment(d.timestamp).format());
  }); 

};

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
  console.log(this.data.aniValues);
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

  svg.selectAll("arc" )
      .data(function(d) {
        // returns the size of the arc within the fields
       return pie(d.fields); 
     })
    .enter().append("path")
      .attr("class", "arc_" + GUID) 
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); })
      .transition().delay(function(d, i) { return i * 500; }).duration(500)
        .attrTween('d', function(d) {
             var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
             return function(t) {
                 d.endAngle = i(t);
               return arc(d);
             }
        }).each(function(d){ this._current = d;})
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

  svg.on('click',function(d){
    change();

    /// toggle action!!
    // maybe pull up dialog to filter results via time, date, city ...
      Session.set("selectedTime",moment(d.timestamp).format());

    function change() {
      //clearTimeout(timeout);
      pie.value(function(d) { console.log(d[value]); return d[value]; }); // change the value function
      path = path.data(pie); // compute the new angles
      path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    }

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


