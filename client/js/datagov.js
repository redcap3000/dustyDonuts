  /*
    Renders intial 'circles' as per leaflet example....
    Pulls data from global variable in lib/d3.js
  */


Template.theMap.rendered = function(){


  if(typeof handle == "undefined" || !handle){
    return false;
  }

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

    // maybe pull up dialog to filter results via time, date, city ...
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
  datasetReady : function(){
    return Session.equals("dataReady", true);
  },
   getSummaryData : function(){
    /*
      
      Structures responses to group all of a cities data into another variable called 'aniValues'
      to iterate through when generating click-based animations

    */
    var byCity = {}, data = dataset.find({},{sort: {timestamp: 1}}).fetch().filter(function (o) {
     if(typeof byCity[o.city] == "undefined"){
          byCity[o.city] = [];
        }
        byCity[o.city].push(o);

      });
      var r = [], cities = _.keys(byCity);
      if(typeof byCity[cities[0]] != "undefined"){
        for(var key in byCity){
          var o = byCity[key][0];  
          o.aniValues = [];
          byCity[key].filter(function(obj,i){
            o.aniValues.push(obj);
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
    /*
      Shows all data from the sub. May apply support for a few session variables
      to filter output additionally.
    */
    if(typeof dataset == "undefined"){
      return false;
    }
    renderLegend();
    var selectedCity = Session.get('selectedCity');
 

      // else do a software side sort of city to enforce city order
      // return everything grouped by city? like an arrays []
    var data = dataset.find({},{sort: {timestamp: 1}}).fetch();
    
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
  /*
      Removes a d3 arch graph as created in singlePlot rendered
      using a GUID of a simplified version of the ts and city.
      Occurs when a subscription is updated .. etc.
  */
  if(typeof this.data == "undefined" && typeof this.city != "undefined"){
    var GUID = moment(this.timestamp).format('YYYMMDDTHHMMSS') + this.city.split(' ').join();
  }else if(typeof this.data != "undefined" && typeof this.data.city != "undefined"){
    var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
  }else{
    return false;
  }
  d3.selectAll(".pie_" +  GUID ).remove();
  d3.selectAll(".arc_" + GUID ).remove();
  return true;
}


Template.singlePlot.rendered = function(){
  /*
      Renders pie chart graph based on single subscription row;  

      row should contain animation values (aniValues)

      Clicking element triggers animations.
    
  */
  if(typeof this.data == "undefined"){
    return false;
  }

  var svg = d3.select("#map").select("svg"),g = svg.append("g");

  var data = this.data;
  var color = colorRange(this.data);

  // generates the first top level record fields for inital display

  data.fields = color.domain().map(function(name){
    if(typeof data[name != "undefined"] && typeof data[name] != "undefined" && name != "aniValues"){
      return {name:name, val: parseFloat(data[name]) * (name == 'airquality_raw'? 10 : 1)   }
    }
    // hmmm validation???
    return {};
  })

  var radius = 155,
      padding = parseInt(radius/10);
  var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);


  pie = d3.layout.pie()
      .sort(null)
      // swap out population value
      .value(function(d) {
        // this value the same ALL THE GOD DAMN TIME! WHAT THE FUCK
      return d.val; 

     });
  var order = 0;

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

        var r = [];
        d.fields.filter(function(o){
          if(o.data != false){
            r.push(o)
          }
        });
       return pie(r); 
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
 svg.append("text")
       .attr("class", "text city" )
       .attr("y",radius - 20+"px")
      .attr("dy", ".45em")
      .style("text-anchor", "middle").style("fill",function(d){
        /*if(typeof cityColors[d.city] != "undefined"){
          return cityColors[d.city];
        }*/
        return 'white';
      })
      .text(function(d) { 
        // color code the city....
        return d.city ; 
      });

  svg.on('click',
    function(d){
    
      if(typeof interval == "undefined"){
       var interval = Meteor.setInterval(function(){
        
      if(order === d.aniValues.length){
        order = 0;
      }

      
      d.aniValues[order].fields = color.domain().map(
        function(name){
          if(typeof data[name != "undefined"] && name != "aniValues"){
            return {name:name, val: parseFloat(data[name]) * (name == 'airquality_raw'? 10 : 1)   }
          }
            // hmmm validation???
          return false;
        }
      );
      console.log(order);
      svg.select("text").attr('class','text t_' + parseInt(order)).text(function(){return moment(d.aniValues[order].timestamp).format('M-D h a') });

     
      arcG.data(
        function(z){
          var x = [];
          var forbidFields = ['_id','fields','timestamp','city','id'];
          for(var key in z.aniValues[order]){
            if(_.indexOf(forbidFields,key) == -1){
              x.push({name:key,val:z.aniValues[order][key] * (key == 'airquality_raw' ? 10 : 1)  })
            }
          }
          return pie(x) }
        )
      .transition().delay(
        function(d, i) { 
          return i * 20; }
        )
      .duration(200)
      .attrTween('d',
        function(d) {
          var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
          return function(t){
              d.endAngle = i(t);
              return arc(d);
            }
          })
      .each(
        function(d){ 
          this._current = d;
        });

      order += 1;
    },
    2000);
  }else{
    // clear interval maybe?
  }
  order +=1;
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


