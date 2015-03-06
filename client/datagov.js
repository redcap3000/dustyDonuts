
// counter starts at 0
  Session.set("selectedTime",undefined);
  Session.set("selectedCity",undefined);
  Session.set("entryFilter",undefined);
handle = Meteor.subscribe('dataset',function(){
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
Template.chart.rendered = function(){

var defaults = {
    bindTo: 'body',
    className: 'donut',
    size: {
      width: 200,
      height: 200 
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    startAngle: 0,
    endAngle: 360,
    thickness: 20,
    offset: 0,
    sort: null,
    colors: d3.scale.category20c()
  };



var test = new Donut({
  bindTo: '.examples',
  offset: 0
});

var test2 = new Donut({
  bindTo: '.examples',
  background: true,
  thickness: 10,
  offset: 1,
  startAngle: -45,
  endAngle: 45
});

var test3 = new Donut({
  bindTo: '.examples',
  background: true,
  maxValue: 60,
  startAngle: -90,
  endAngle: 90,
  thickness: 5
});
// THIS LOOKS LIKE THE ACTUAL VALUE!!!
var d = [];
var rows = dataset.find({"city" : Session.get("selectedCity")}).forEach(function (post) {
  if(d.length < 8){
    d.push(Math.round(post.sound));
  }
});
//var d = [4,4,8];

//test.load({data: d});
test2.load({data: d});


}
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
    var city = tmpl.find(".city");
    if(typeof city != "undefined" && city && city.value != "undefined" && city.value != ''){
      // remove spaces from value
//      var theCity = city.value.split(' ').join('');
      Session.set("selectedCity",city.value);

    }else{
      Session.set("selectedCity",false);
    }
  },
  'click .reset' : function(evt,tmpl){
    handle.stop();
    handle = Meteor.subscribe('dataset',function(){
      // destroy and rerender legend....

    });
  }
});


Template.aggregateData.helpers({
  getData: function () {
    // ...
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

Template.controls.events({
  'click .lookup': function (evt,tmpl) {
    // ...
    var city = tmpl.find(".city");
    var startDate = tmpl.find(".startDate");
    var endDate = tmpl.find(".endDate");

    Meteor.call("govApi",startDate.value,endDate.value,city.value);
  },
  'click .filterEntry' : function(evt,tmpl){
    var newNum = tmpl.find(".entryFilter");
    console.log(newNum);
    if(typeof newNum != "undefined" && typeof newNum.value != "undefined" && newNum.value != '' ){
      Session.set("entryFilter",newNum.value);
    }
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
  },
  selectedCity :function(){
    return Session.get("selectedCity");
  }
});
Template.aggregateData.created = function(){
  // attempt to destroy all single plots?
  console.log('in agg data created');
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
  if(typeof this.data == "undefined"){
    return false;
  }

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
  var radius = 94,
      padding = 10;
  var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
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
        .attr("dy", ".45em")
        .style("text-anchor", "middle")
        .text(function(d) { 
          return ( moment(d.timestamp).format('MMM Do h a') + ' ' + d.city) ; 
        });

    svg.on('click',function(d){
      /// toggle action!!
      // maybe pull up dialog to filter results via time, date, city ...
        Session.set("selectedTime",moment(d.timestamp).format());
 
        Session.set("selectedCity",d.city);

    }); 


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