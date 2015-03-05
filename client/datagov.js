
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
        // get first and last in range of client set
        Session.set("startDate",ranges[0].timestamp);
        Session.set("endDate",ranges.pop().timestamp);
      }
    }
    d3.selectAll(".legend").remove();
    if(typeof dataset != "undefined"){
      var findOne = dataset.findOne();
      if(typeof findOne != "undefined" && findOne){
        renderLegend(findOne);
      }
    }
  }
});

Template.controls.events({
  'change .startDate': function (evt,tmpl) {
    var date = tmpl.find(".startDate");
    if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
      Session.set("startDate",date.value);
    }
    return true;
    // ...
  },
  'change .endDate': function(evt,tmpl){
    var date = tmpl.find('.endDate');
      if(typeof date != "undefined" && typeof date.value != "undefined" && date.value != ''){
        Session.set("endDate",date.value);
      }
      return true;
  },
  'change .city' : function(evt,tmpl){

  }
});


Template.aggregateData.helpers({
  getData: function () {
    // ...
    renderLegend();

    return dataset.find({},{sort: {timestamp: -1}});
  },
  getSf : function(){
    return dataset.find({city : "San Francisco"});
  },
  getBangalore : function(){
    return dataset.find({city : "Bangalore"});
  },
  comparison : function(){
    // we'll want to order things via time????
  }
});


Template.sampleCSV.helpers({
  getRows: function () {
    // ...
    return dataset.find();
  }
});

Template.controls.events({
  'click .lookup': function (evt,tmpl) {
    // ...
    var city = tmpl.find(".city");
    var startDate = tmpl.find(".startDate");
    var endDate = tmpl.find(".endDate");

    Meteor.call("govApi",startDate.value,endDate.value,city.value);
  }
});

Template.controls.helpers({
  data : function(){
    return {datetime1: moment.utc().toDate() ,datetime2 : moment.utc().toDate()}
  },
  startDate: function () {
    return Session.get("startDate");
  },
  endDate : function(){
    return Session.get("endDate");
  }
});

Template.singlePlot.destroyed = function(){
  console.log('try to destory');
  d3.selectAll(".pie_" +  moment(this.data.timestamp).format('YYYMMDDTHHMMSS') ).remove();
  d3.selectAll(".arc_" + moment(this.data.timestamp).format('YYYMMDDTHHMMSS') ).remove();
  return true;
}

var colorRange = function(aDataset){

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
Template.singlePlot.rendered = function(){
  var data = [this.data];
  var color = colorRange(this.data);
  // dont need a foreach :()
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
  var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city;
  console.log(GUID);
  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);
  var pie = d3.layout.pie()
      .sort(null)
      // swap out population value
      .value(function(d) { return d.val; });
      // ATTACH A CLICK ACTION
    var svg = d3.select("body").selectAll(".pie_" + GUID)
        .data(data)
      .enter().append("svg")
        .attr("class", "pie_" + GUID)
        .attr("width", radius * 2)
        .attr("height", radius * 2)
      .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    svg.selectAll(".arc_" + GUID )
        .data(function(d) { return pie(d.fields); })
      .enter().append("path")
        .attr("class", "arc_" + GUID) 
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); });

    svg.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.city + ' ' + moment(d.timestamp).format('MMM Do h a'); });


};
renderLegend = function (obj) {
  var radius = 74,
      padding = 10;

  var color = colorRange(obj);
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