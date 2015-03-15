
renderClock = function(id,timestamp,old_timestamp){
  // weirness that shows the previous value in sync ...

  d3.selectAll("svg#" + id + ' .clock').remove();
  if(typeof timestamp != "undefined"){
    old_timestamp = moment(timestamp);
  }else{
    old_timestamp = false;
  }

  // Clock look-n-feel: customize at will!
  var width = 305,
    height = 305,
    strokeWidth = 6,
    clockFillColor = "none",
    clockBorderColor = "#B7B7B7",
    clockHandColor = "#FEBE12",
    clockCenterColor = "#FEBE12",
    transitionEnabled = 1,
    radius = width / 2,
    vis, clock, hourPosition, minutePosition, clockhand, hourPositionOffset;

  // Set up time
 
  var now = moment(timestamp);
  //console.log(now);
  var data = [{
    'unit': 'minutes',
    'value': now.minutes()
  }, {
    'unit': 'hours',
    'value': now.hours()
  }];
  console.log(data);
  // Set up Scales        
  // Map 60 minutes onto a radial 360 degree range.
  var scaleMins = d3.scale.linear()
    .domain([0, 59 + 59 / 60])
    .range([0, 2 * Math.PI]);

  // Map 12 hours onto a radial 360 degree range.
  var scaleHours = d3.scale.linear()
    .domain([0, 11 + 59 / 60])
    .range([0, 2 * Math.PI]);

  // Every hour, the minute hand moves 360 degrees and the hour hand moves 30 degrees.
  // To get the final, accurate hour hand position, the linear movement of the minute hand
  // is mapped to a 30 degree radial angle and the resulting angular offset
  // is added to the hour hand position (in scaleHours above).
  var scaleBetweenHours = d3.scale.linear()
    .domain([0, 59 + 59 / 60])
    .range([0, Math.PI / 6]);

  // Set up SVG
 
  vis = d3.select("svg#" + id)
    .append("svg:svg")
    .attr("class", "clock")
    .attr("width", width)
    .attr("height", height);

  clock = vis.append("svg:g")
    .attr("transform", "translate(" + radius  + "," + radius  + ")");

  // Clock face


  // When animating, set 12 o’clock as the clockhand animation start position
  minutePosition = d3.svg.arc()
    .innerRadius(0)
    .outerRadius((3 / 4) * radius)
    .startAngle(0)
    .endAngle(0);

  hourPosition = d3.svg.arc()
    .innerRadius(0)
    .outerRadius((1 / 2) * radius)
    .startAngle(0)
    .endAngle(0);

  // When not animating, set the clockhand positions based on time
  minutePositionFinal = d3.svg.arc()
    .innerRadius(0)
    .outerRadius((2 / 3) * radius)
    .startAngle(function (d) {
      console.log(d);
      return scaleMins(+d.value);
    })
    .endAngle(function (d) {
      return scaleMins(+d.value);
    });

  hourPositionFinal = d3.svg.arc()
    .innerRadius(0)
    .outerRadius((1 / 2) * radius)
    .startAngle(function (d) {
      return (scaleHours(+d.value % 12) + scaleBetweenHours(hourPositionOffset));
    })
    .endAngle(function (d) {
      return (scaleHours(+d.value % 12) + scaleBetweenHours(hourPositionOffset));
    });

  // Add clockhands to the clockface
  clockhand = clock.selectAll(".clockhand")
    .data(data)
    .enter()
    .append("svg:path")
    .attr("class", "clockhand")
    .attr("stroke", clockHandColor)
    .attr("stroke-width", strokeWidth + 4)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("fill", "none");

  // Animate clockhands!    
  if (transitionEnabled) {
    clockhand.attr("d", function (d) {
      if (d.unit === "minutes") {
        if(old_timestamp){
          console.log(old_timestamp.hours());
          console.log(d.value);
          console.log(+d.value);
          d.value = old_timestamp.minutes();
        }

        hourPositionOffset = +old_timestamp.hours();
        return minutePosition();
      } else if (d.unit === "hours") {
        console.log(d);
        return hourPosition();
      }
    })
      .transition()
      .delay(1)
      .duration(222)
      .ease("elastic", 1, 4)
      .attrTween("transform", tween);
  } else {
    clockhand.attr("d", function (d) {
      if (d.unit === "minutes") {
        hourPositionOffset = +d.value;
        return minutePositionFinal(d);
      } else if (d.unit === "hours") {
        return hourPositionFinal(d);
      }
    });
  }

  function tween(d, i, a) {
    if (d.unit === "minutes") {
      return d3.interpolate("rotate(0)", "rotate(" + (scaleMins(+d.value) * (180 / Math.PI)) + ")");
    } else if (d.unit === "hours") {
      return d3.interpolate("rotate(0)", "rotate(" + ((scaleHours(+d.value % 12) + scaleBetweenHours(hourPositionOffset)) * (180 / Math.PI)) + ")");
    }
  }

  // Add center dial
  return clock.append("svg:circle")
    .attr("class", "centerdot")
    .attr("r", strokeWidth + 2)
    .attr("fill", "#fff")
    .attr("stroke", clockCenterColor)
    .attr("stroke-width", strokeWidth + 2);

};