
// counter starts at 0
cityColors = {"Bangalore": "green",
              "Boston": "orange",
              "Rio de Janeiro": "crimson",
              "San Francisco": "red",
              "Shanghai": "brown",
              "Singapore": "black",
              "Bangalore" : "green",
              "Geneva" : "blue"
              };
collection = {"objects":[
{"circle":{"coordinates":[37.774929,-122.419416],"city":"San Francisco","color":"red"}},
{"circle":{"coordinates":[12.971599,77.594563],"city":"Bangalore","color":"green"}},
{"circle":{"coordinates":[42.360082,-71.058880],"city":"Boston","color":"orange"}},
{"circle":{"coordinates":[46.198392,6.142296],"city":"Geneva"},"color":"blue"},
{"circle":{"coordinates":[-22.906847,-43.172896],"city":"Rio de Janeiro","color":"crimson"}},
{"circle":{"coordinates":[31.230416,121.473701],"city":"Shanghai","color":"brown"}},
{"circle":{"coordinates":[1.352083,103.819836],"city":"Singapore","color":"black"}}
]};


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


Template.sampleCSV.helpers({
  getRows: function () {
    // ...
    return dataset.find();
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

renderLegend = function (obj) {
  var radius = 74,
      padding = 10;
  var color = colorRange(obj);
  if(!color || typeof obj == "undefined"){
    return false;
  }

  // dynamically generates legend keys based on
  // keys to NOT graph...
  // to do .. checkboxes to graph the other data to create custom comparisons
  var legend = d3.select("body").append("svg")
      .attr("class", "legend")
      .attr("width", radius * 2)
      .attr("height", radius * 2)
    .selectAll("g")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) { return d; });
};
colorRange = function(aDataset){

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  color.domain(d3.keys(aDataset).filter(
    // keys to NOT use
    function(key){
      return key !== "city" && key !== "_id" && key !== "op" && key !== "resolution" && key !== "timestamp";
    })
  );
  return color;
}
