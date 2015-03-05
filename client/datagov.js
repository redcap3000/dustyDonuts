
// counter starts at 0

var handle = Meteor.subscribe('dataset',function(){
  // destroy and rerender legend....

});

Tracker.autorun(function() {
  if (handle.ready()){
    var startDate = Session.get("startDate");
    var endDate = Session.get("endDate");
    if(typeof startDate == "undefined" && typeof endDate == "undefined"){
      /// figure out first record sort? safe to sort via timestamp ?
      var ranges = dataset.find({}).fetch();
      if(ranges && ranges.length > 0){
        // these need to be dates to properly filter ....
        console.log(moment(ranges[0].timestamp));
        Session.set("startDate",ranges[0].timestamp);
        Session.set("endDate",ranges.pop().timestamp);
      }
    }
    d3.selectAll(".legend").remove();
    renderLegend();
  }
});

Template.controls.events({
  'change .startDate': function (evt,tmpl) {
    console.log(this);
    var date = tmpl.find(".startDate");
    if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
      Session.set("startDate",date.value);
    }
    console.log(date.value);
    return true;
    // ...
  },
  'change .endDate': function(evt,tmpl){
    var date = tmpl.find('.endDate');
      if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
        Session.set("endDate",date.value);
      }
      return true;
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
  //  console.log(dataset.find().fetch());
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



Template.singlePlot.destroyed = function(){
  d3.selectAll(".pie_" +  moment(this.data._id).format('YYYMMDDTHHMMSS') ).remove();
  d3.selectAll(".arc_" + moment(this.data._id).format('YYYMMDDTHHMMSS') ).remove();
  return true;
}
Template.singlePlot.rendered = function(){
  //console.log(this);
  var data = [this.data];
  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

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
  var radius = 74,
      padding = 10;

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);
  var pie = d3.layout.pie()
      .sort(null)
      // swap out population value
      .value(function(d) { console.log(d); return d.val; });
      // ATTACH A CLICK ACTION
    var svg = d3.select("body").selectAll(".pie_" + moment(this.data._id).format('YYYMMDDTHHMMSS'))
        .data(data)
      .enter().append("svg")
        .attr("class", "pie")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
      .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    svg.selectAll(".arc_" + moment(this.data._id).format('YYYMMDDTHHMMSS') )
        .data(function(d) { console.log(d); return pie(d.fields); })
      .enter().append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); });

    svg.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { console.log(d); return d.timestamp; });


};
renderLegend = function () {
  console.log('rendered');
  var radius = 74,
      padding = 10;

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


  // this is calculates total value based on d.population
  // what field to look
 
  color.domain(d3.keys(dataset.findOne()).filter(
    // keys to NOT use
    function(key){
      return key !== "city" && key !== "_id" && key !== "op" && key !== "resolution" && key !== "timestamp";
    })
  );
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

  
};