// draw map

var width = 960,
    height = 500;
var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);
var path = d3.geo.path()
    .projection(projection);
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
d3.json("/data/states4.json", function(error, us) {
  var states = us.features;
  var state;
  var c_str;
  for( var i = 0; i < states.length && (state=states[i]); i++ ){
    c_str = "state"; 
    try{c_str+= " " + state.properties.name.toLowerCase().replace(/ /g, '-');}catch(e){}
    try{c_str+= " " + state.properties.region.toLowerCase().replace(/ /g, '-');}catch(e){}
    try{c_str+= " " + state.properties.region_big.toLowerCase().replace(/ /g, '-');}catch(e){}
    svg.insert("path")
        .datum(state.geometry)
        .attr("class", c_str)
        .attr("d", path);
  }
  //svg.insert("path")
      //.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      //.attr("class", "state-boundary")
      //.attr("d", path);
});
d3.select(self.frameElement).style("height", height + "px");

function get_color(sentiment){
  return 'hsl('+(sentiment*12+60)+',100%, 50%)';
}

var socket = io();

socket.on('tweet', function(tweet){
  svg.insert("path")
      .datum(tweet.coordinates)
      .attr('class', 'tweet')
      .attr('style', 'fill: '+get_color(tweet.sentiment))
      .attr("d", path);
});

