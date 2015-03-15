
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
          // fields out of order???
          byCity[key].filter(function(obj,i){
            if(i > 0)
              o.aniValues.push(_.pick(obj,'sound','dust','airquality_raw','timestamp'));
          });
          r.push(o);
        }
        return r;
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
  // destroy the timers!!!
  if(typeof  this.interval != "undefined"){
    Meteor.clearInterval(this.interval);
  }
  return true;
};


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
  // probably sort the fields in color range...
  var color = colorRange(this.data);

  // generates the first top level record fields for inital display

  data.fields = color.domain().map(function(name){
    if(typeof data[name != "undefined"] && typeof data[name] != "undefined" && name != "aniValues"){
      return {name:name, val: (data.op == "count"? parseInt(data[name]) : parseFloat(data[name]) * (name == 'airquality_raw'? 1 : 1) )  }
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
  this.data.order = 0;
 

  var svg = d3.select("d3data").append("pie")
      .data([data])
    .enter().append("svg")
      .attr("class", "graph pie_" + GUID)
            .attr("id",data._id)

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
      .attr("dy", "3.15em")
      .style("text-anchor", "middle").style("fill",function(d){
        if(typeof cityColors[d.city] != "undefined"){
          return cityColors[d.city];
        }
        return 'black';
      })
      .text(function(d) { 
        // color code the city....
        return (   moment(d.timestamp).format('M-D h:mm a')  ) ; 
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
  var button = svg.append("text")
              .attr("class", "text button"). attr("y","15px")
              .attr("dy",".45em")
              .style("text-anchor","middle").style("fill","black").text(function(d){return d.city} );
  var self = this;
   self.order = 0;           
  svg.on('click',
    function(d){

      
      if(typeof self.interval == "undefined"){
        // hmmmmmmmm try to set to this?
       self.interval = Meteor.setInterval(function(){
        
      if(self.order === d.aniValues.length){
        self.order = 0;
      }
      d.aniValues[self.order].fields = color.domain().map(
        function(name){
          // careful here...
          if(typeof name != "undefined" && typeof d.aniValues[self.order][name] != "undefined" && name != "aniValues"){
            return {name:name, val: (d.op == "count"? parseInt(d.aniValues[self.order][name]) :parseFloat(d.aniValues[self.order][name])) * (name == 'airquality_raw'? 1 : 1)   }
          }
            // hmmm validation???
          return {};
        }
      );
      svg.select("text").attr('class','text t_' + parseInt(self.order)).text(function(){return moment(d.aniValues[self.order].timestamp).format('M-D a') });
       button.text(d.op);
     
      arcG.data(
        function(z){
          var x = [];
          var forbidFields = ['_id','fields','timestamp','city','id','op','resolution'];
          for(var key in z.aniValues[self.order]){
            if(_.indexOf(forbidFields,key) == -1){
              x.push({name:key,val:z.aniValues[self.order][key] * (key == 'airquality_raw' ? 1 : 1)  })
            }
          }
          return pie(x) }
        )
      .transition()
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

     self.order += 1;
      renderClock(self,self.order);
    },
    2000);
    }else{
      // clear interval maybe?
        button.text('stopped');
        Meteor.clearInterval(self.interval);
        self.interval = undefined;
    }
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


