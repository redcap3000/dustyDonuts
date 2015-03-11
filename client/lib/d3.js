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
