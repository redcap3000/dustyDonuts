

Template.singlePlot.destroyed = function(){
  /*
      Removes a d3 arch graph as created in singlePlot rendered
      using a GUID of a simplified version of the ts and city.
      Occurs when a subscription is updated .. etc.
  */
  if(typeof this.data == "undefined" && typeof this.ct != "undefined"){
    var GUID = moment(this.ts).format('YYYMMDDTHHMMSS') + this.ct.split(' ').join();
  }else if(typeof this.data != "undefined" && typeof this.data.ct != "undefined"){
    var GUID = moment(this.data.ts).format('YYYMMDDTHHMMSS') + this.data.ct.split(' ').join('');
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

Template.singlePlot.created = function(){
   if(typeof this.data == "undefined"){
    return false;
  }
  this.data.order = 0;
  color = colorRange(this.data.aniValues[0]);

  // generates the first top level record fields for inital display
  //var firstDS = this.data.aniValues[0];
  renderLegend(this.data.aniValues[0]);
  var firstDS = this.data.aniValues[0];

  this.data.fields = color.domain().map(function(name){
    if(typeof firstDS  != "undefined" && typeof firstDS[name] != "undefined" && name != "aniValues" && name != 'airquality_raw' && name != 'temperature'){
      return {name:name, val:  parseFloat(firstDS[name])  }
    }else{
      console.log(name + ' failed something..');
    }
    // hmmm validation???
    return null;
  });

  this.radius = 155,
  this.padding = parseInt(this.radius/10);
  this.GUID = moment(this.data.ts).format('YYYMMDDTHHMMSS') + this.data.ct.split(' ').join('');
}

Template.singlePlot.rendered = function(){
  /*
      Renders pie chart graph based on single subscription row;  
      row should contain animation values (aniValues)
      Clicking element triggers animations.
  */
  var aq = this.data.aniValues[this.data.order].airquality_raw;
   var arc = d3.svg.arc()
      .outerRadius( function(d){
          return 100 - (typeof aq != "undefined" && aq ? aq : 0);
          })

      .innerRadius(function(d){
        //console.log(d);
          return 100  + (typeof aq != "undefined" && aq ? aq * 2.25 : 0) ;
        }),

  pie = d3.layout.pie()
      .sort(null)
      // swap out population value
      .value(function(d) {
        // this value the same ALL THE GOD DAMN TIME! WHAT THE FUCK
        return d.val; 
      }
  );
  var svg = d3.select("d3data").append("pie")
      .data([this.data])
    .enter().append("svg")
      .attr("class", "graph pie_" + this.GUID)
            .attr("id",'c_' + this.data._id)
      .attr("display","block")
      .attr("width", this.radius * 2)
      .attr("height", this.radius * 2)
    .append("g")
      .attr("transform", "translate(" + this.radius + "," + this.radius + ")");

  var arcG = svg.selectAll("arc" )
      .data(function(d) {
        var r = [];
        console.log(d.fields);
        d.fields.filter(function(o){
          if(o.data != false && o.name != "airquality_raw" && o.name != "temperature" && o.name != "aniValues" && o.name != "ts"){
            r.push(o)
          }
        });
       return pie(r); 
     })
    .enter().append("path")
      .attr("class", "arc_" + this.GUID) 
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); });
  
  svg.append("text")
      .attr("dy", "6.25em")
      .style("text-anchor", "middle").style("fill",function(d){
        return 'white';
      })
      .text(function(d) { 
        // color code the city....
        return (   moment(d.ts).format('M-D h:mm a')  ) ; 
      });
      // set up animation to trigger on click.... hmmm

  var button = svg.append("text")
              .attr("class", "text button"). attr("y","25px")
              .attr("dy","3.75em")
              .style("text-anchor","middle").style("fill","white").text(function(d){return d.ct} );
  

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
          if(typeof name != "undefined" && typeof d.aniValues[self.order][name] != "undefined" && name != "aniValues" && name != 'airquality_raw' && name != 'temperature'){
            return {name:name, val:  parseFloat(d.aniValues[self.order][name]) * (name == 'airquality_raw'? 1 : 1)   }
          }
        }
      );
      svg.select("text").attr('class','text t_' + parseInt(self.order)).text(function(){return moment(d.aniValues[self.order].ts).format('M-D hh:mm a') });
      button.text(d.ct);
      arcG.data(
        function(z){
          var x = [];
          var forbidFields = ['_id','fields','ts','ct','id','op','resolution','airquality_raw','temperature'];
          for(var key in z.aniValues[self.order]){
            if(_.indexOf(forbidFields,key) == -1){
              x.push({name:key,val:z.aniValues[self.order][key] * (key == 'airquality_raw' ? 1 : 1)  })
            }
          }
          return pie(x) }
        )
      .transition()
      .attrTween('d',
        function(dz) {
          var aq = d.aniValues[self.order].airquality_raw;
           var arc = d3.svg.arc()
            .outerRadius( function(d){
                return 100 - (typeof aq != "undefined" && aq ? aq : 0);
                })

            .innerRadius(function(d){
              //console.log(d);
                return 100  + (typeof aq != "undefined" && aq ? aq * 2.25 : 0) ;
              });

          var i = d3.interpolate(dz.startAngle+0.1, dz.endAngle);
          return function(t){
              d.endAngle = i(t);
              return arc(dz);
            }
          })
      .each(
        function(dz){ 
          this._current = dz;
        });
      svg.transition().style("color","red");
       self.order += 1;
       // recurrance bug fix for clock.. send it past value because its already on the next one ..
       if(self.order === 0){
        var orderI = self.aniValues.length;
       }else{
        var orderI = self.order - 1;
       }
       // fix this.... please!!
       if(typeof self.data != "undefined" && typeof orderI != "undefined" && typeof self.data.aniValues != "undefined" && typeof self.data.aniValues[orderI] != "undefined" && typeof self.data.aniValues[orderI] != "undefined"){
        renderClock(self.data._id,self.data.aniValues[orderI].ts,self.data.aniValues[self.order].ts);
      }else if(typeof orderI == "undefined"){
        console.log ('no inner order set; forcing order to be 1');
        self.order = 1;
      }
    },
    2000);
    }else{
      // clear interval maybe?
        button.text('stopped');
        Meteor.clearInterval(self.interval);
        self.interval = undefined;
    }
    Session.set("selectedTime",moment(d.ts).format());
    }); 

  // Store the displayed angles in _current.
  // Then, interpolate from _current to the new angles.
  // During the transition, _current is updated in-place by d3.interpolate.
  var e = document.createEvent('UIEvents');
  e.initUIEvent('click', true, true);
  svg.select("path").node().dispatchEvent(e);
  //console.log($('#c_' + this.data._id).trigger('click'));
};
