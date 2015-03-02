
// counter starts at 0

var handle = Meteor.subscribe('dataset');

Tracker.autorun(function() {
  if (handle.ready()){
    Template.d3.destroyed();
    Template.d3.rendered();
//    console.log(Posts.find().count());
//    Session.set("ready",true);
  }else{
//    Session.set("ready",false)
  }
});

Template.aggregateData.helpers({
  getData: function () {
    // ...
    return dataset.find();
  }
});


Template.sampleCSV.helpers({
  getRows: function () {
    // ...
    console.log(dataset.find().fetch());
    return dataset.find();
  }
});

Template.controls.events({
  'click .lookup': function (evt,tmpl) {
    // ...
    var city = tmpl.find(".city");
    var startDate = tmpl.find(".startDate");
    var endDate = tmpl.find(".endDate");
    //Meteor.call()
    // govApi: function (from,before,overCity,fields,op,resultion) {
      // flush current data ?
    //dataset.remove();
    // subscribe....
    Meteor.call("govApi",startDate.value,endDate.value,city.value);

  }
});


 Template.d3.destroyed = function () {
      // ...
    };

Template.d3.rendered = function () {
  console.log('rendered');
var radius = 74,
    padding = 10;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - 30);
// this is calculates total value based on d.population
// what field to look
var pie = d3.layout.pie()
    .sort(null)
    // swap out population value
    .value(function(d) { console.log(d); return d.val; });

    /*
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "City"; }));

  data.forEach(function(d) {
    d.ages = color.domain().map(function(name) {

      return {name: name, population: parseFloat(d[name])};
    });
  });
*/

  //console.log(data[0]);
  data = dataset.find().fetch();
  color.domain(d3.keys(data[0]).filter(
    // keys to NOT use
    function(key){
      return key !== "city" && key !== "_id" && key !== "op" && key !== "resolution" && key !== "timestamp";
    })
  );

  data.forEach(function(d){
    d.fields = color.domain().map(function(name){
      if(typeof d[name != "undefined"]){
        return {name:name, val: parseFloat(d[name])}
      }
      // hmmm validation???
      return {};
    })
  });

//  console.log(data2[0]);
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

  var svg = d3.select("body").selectAll(".pie")
      .data(data)
    .enter().append("svg")
      .attr("class", "pie")
      .attr("width", radius * 2)
      .attr("height", radius * 2)
    .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

  svg.selectAll(".arc")
      .data(function(d) { console.log(d); return pie(d.fields); })
    .enter().append("path")
      .attr("class", "arc")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); });
/*
  svg.append("text")
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { console.log(d); return d.State; });
*/
};