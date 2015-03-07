
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

Template.chart.created = function () {
  // ...
(function(global, undefined) {

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
    thickness: null,
    offset: 0,
    sort: null,
    maxValue: null,
    background: false,
    colors: d3.scale.category20c(),
    accessor: function(d, i) {
      return d;
    }
  };

  var Donut = global.Donut = function(config) {
    // need an extend fn
    this.config = extend({}, defaults, config);

    // setup radius
    this.config.radius = getRadius(this);

    // setup accessor
    this.accessor = this.config.accessor;
    
    // convenience method to map data to start/end angles
    this.pie = d3.layout.pie()
      .sort(this.config.sort)
      .startAngle(degToRad(this.config.startAngle))
      .endAngle(degToRad(this.config.endAngle))

    if (this.accessor && typeof this.accessor === 'function') {
      this.pie.value(this.accessor);
    }
    
    var thickness = getThickness(this);

    // setup the arc
    // divide offset by 4 because the middle of the stroke aligns to the edge
    // so it's 1/2 on the outside, 1/2 inside
    this.arc = d3.svg.arc()
      .innerRadius(this.config.radius - thickness - (this.config.offset / 4))
      .outerRadius(this.config.radius + (this.config.offset / 4));

    bindSvgToDom(this);
  };

  Donut.prototype.load = function(newOpts) {
    // store data on object
    var data = (newOpts && newOpts.data != null) ? newOpts.data : this.data.map(this.accessor);

    // convert to array if not already
    data = Array.isArray(data) ? data : [data];

    if (this.config.maxValue) {
      this.data = this.pieMaxValue(data);
    } else {
      this.data = this.pie(data);
    }

    // drawPaths
    drawPaths(this);
  };

  Donut.prototype.pieMaxValue = function(data) {
    var accessor = this.accessor,
      self = this;

    // Compute the numeric values for each data element.      
    var values = data.map(function(d, i) { return +accessor.call(self, d, i); });

    var sum = d3.sum(values),
      max = d3.max([this.config.maxValue, sum]),
      diff = max - sum;

    // Compute the start angle.
    var a = +(degToRad(this.config.startAngle));

    // Compute the angular scale factor: from value to radians.
    // include the diff because it will help create angles with a maxValue in mind
    var k = (degToRad(this.config.endAngle) - a) / (sum + diff);

    var index = d3.range(data.length);

    // Compute the arcs!
    // They are stored in the original data's order.
    var arcs = [];
    index.forEach(function(i) {
      var d;
      arcs[i] = {
        data: data[i],
        value: d = values[i],
        startAngle: a,
        endAngle: a += d * k
      };
    });
    return arcs;
  };
  
  function getThickness(donut) {
    return donut.config.thickness || donut.config.radius;
  }
  
   /*
    * Setup the svg in the DOM and cache a ref to it
    */
  function bindSvgToDom(donut) {
    var width = getWidth(donut),
      height = getHeight(donut);

    donut.svg = d3.select(donut.config.bindTo)
      .append('svg')
      .attr('class', donut.config.classNames)
      .attr('width', width)
      .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    if (donut.config.background) {
      donut.svg.append('path')
        .attr('class', 'donut-background')
        .attr('fill', '#eee')
        .transition()
        .duration(500)
        .attrTween('d', function(d, i) {
          var fullArc = {
            value: 0,
            startAngle: degToRad(donut.config.startAngle),
            endAngle: degToRad(donut.config.endAngle)
          };
          return arcTween.call(this, fullArc, i, donut);
        });
    }
  }

  function drawPaths(donut) {
  
    var paths = donut.svg.selectAll('path.donut-section').data(donut.data);

    // enter new data
    paths.enter()
      .append('path')
      .attr('class', function(d, i) { return 'donut-section value-' + i; })
      .attr('fill', function(d, i) {
        return (typeof donut.config.colors === 'function') ? donut.config.colors(i) : donut.config.colors[i];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', donut.config.offset / 2);

    // transition existing paths
    donut.svg.selectAll('path.donut-section')
      .transition()
      .duration(500)
      .attrTween('d', function(d, i) {
        return arcTween.call(this, d, i, donut);
      })

    // exit old data
    paths.exit()
      .transition()
      .duration(100)
      .attrTween('d', function(d, i) {
        return removeArcTween.call(this, d, i, donut);
      })
      .remove();
  }

  // Store the currently-displayed angles in this._current.
  // Then, interpolate from this._current to the new angles.
  function arcTween(a, i, donut) {
    var prevSiblingArc, startAngle, newArc, interpolate;
    

    if (!this._current) {
      prevSiblingArc = donut.svg.selectAll('path')[0][i - 1];// donut.data[i - 1];

      // start at the end of the previous one or start of entire donut
      startAngle = (prevSiblingArc && prevSiblingArc._current) ?
        prevSiblingArc._current.endAngle :
        degToRad(donut.config.startAngle);

      newArc = {
        startAngle: startAngle,
        endAngle: startAngle,
        value: 0
      };
    }
    
    interpolate = d3.interpolate(this._current || newArc, a);

    // cache a copy of data to each path
    this._current = interpolate(0);
    return function(t) {
      return donut.arc(interpolate(t));
    };
  }

  function removeArcTween(a, i, donut) {
    var emptyArc = {
        startAngle: degToRad(donut.config.endAngle),
        endAngle: degToRad(donut.config.endAngle),
        value: 0
      },
      i = d3.interpolate(a, emptyArc);
    return function(t) {
      return donut.arc(i(t));
    };
  }

  function getRadius(donut) {
    var width = getWidth(donut) - donut.config.margin.left - donut.config.margin.right,
      height = getHeight(donut) - donut.config.margin.top - donut.config.margin.bottom;

    return Math.min(width, height) / 2;
  }

  function getWidth(donut) {
    return donut.config.size && donut.config.size.width;
  }

  function getHeight(donut) {
    return donut.config.size && donut.config.size.height;
  }

  function degToRad(degree) {
    return degree * (Math.PI / 180);
  }

  function radToDeg(radian) {
    return radian * (180 / Math.PI);
  }

  /*
   * Simple extend fn like jQuery
   * 
   * Usage: extend({ name: 'Default' }, { name: 'Matt' });
   * Result: { name: 'Matt' }
   */
  function extend() {
    for (var i = 1; i < arguments.length; i++) {
      for (var prop in arguments[i]) {
        if (arguments[i].hasOwnProperty(prop)) {
          arguments[0][prop] = arguments[i][prop];
        }
      }
    }
    return arguments[0];
  }

})(window);
};
