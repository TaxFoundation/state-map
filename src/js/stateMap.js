'use strict'

var width = 960,
    height = 720,

    svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

// Define increments for data scale
var min = 84, //Floor for the first step
    mid = 100,
    max = 116, //Anything above the max is the final step
    steps = 8, //Final step represents anything at or above max
    increment = (max - min) / (steps - 1);

// Create distinct colors for each increment based on two base colors
var colors = [],
    borderColor = '#fff', //Color of borders between states
    noDataColor = '#ddd', //Color applied when no data matches an element
    lowBaseColor = '#FFCE00', //Color applied at the end of the scale with the lowest values
    midBaseColor = '#FFAA93',
    highBaseColor = '#FF0068', //Color applied at the end of the scale with the highest values
    scaleColor = d3.scale.linear()
        .domain([0, steps - 1])
        .range([lowBaseColor, highBaseColor])
        .interpolate(d3.interpolateHcl); //Don't like the colors you get? Try interpolateHcl or interpolateHsl!

// Create basic legend and add generated colors to the 'colors' array
// Should replace this with D3.js Axis
for (var c = 0; c < steps; c++) {
  colors.push(scaleColor(c));
}

var tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0),

    dataFormat = {
      percentage: d3.format('%'),
      tens: d3.format('$,.2f'),
      hundreds: d3.format('$,.5r'),
      thousands: d3.format('$s')
    };

var projection = d3.geo.albersUsa()
    .scale(width * 1.2)
    .translate([width / 2, height - height * 0.6]);

var path = d3.geo.path()
    .projection(projection);

var mapColor = d3.scale.linear()
    .domain([min, mid, max])
    .range([lowBaseColor, midBaseColor, highBaseColor]);

var map = svg.append('g')
    .attr('class', 'counties');

var labels = svg.append('g')
    .attr('class', 'labels');

var legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(0,' + (height - height * 0.1) + ')');

// Set params and queue map files
var dataPath = 'data/100-dollar-map.csv',
    legendDataType = dataFormat.tens,
    tooltipDataType = dataFormat.tens,
    observation = 'value';

var smallStateRects = [{ id: 9 }, { id: 10 }, { id: 11 }, { id: 24 }, { id: 25 }, { id: 33 }, { id: 34 }, { id: 44 }, { id: 50 }];

var labelOffsets = { //To preserve position with changes to width and height, set all values to percentage * width or height
  2:  { x: 0, y: 0 },
  9:  { x: 0, y: 0, rectX: 910, rectY: 310 },
  10: { x: 0, y: 0, rectX: 910, rectY: 390 },
  11: { x: 0, y: 0, rectX: 910, rectY: 470 },
  12: { x: 0, y: 0 },
  13: { x: 0, y: 0 },
  15: { x: 0, y: 0 },
  22: { x: 0, y: 0 },
  23: { x: 0, y: 0 },
  24: { x: 0, y: 0, rectX: 910, rectY: 430 },
  25: { x: 0, y: 0, rectX: 910, rectY: 230 },
  26: { x: 0, y: 0 },
  33: { x: 0, y: 0, rectX: 805, rectY: 50 },
  34: { x: 0, y: 0, rectX: 910, rectY: 350 },
  36: { x: 0, y: 0 },
  37: { x: 0, y: 0 },
  44: { x: 0, y: 0, rectX: 910, rectY: 270 },
  45: { x: 0, y: 0 },
  50: { x: 0, y: 0, rectX: 725, rectY: 50 },
  51: { x: 0, y: 0 },
  54: { x: 0, y: 0 },
  55: { x: 0, y: 0 }
};

queue()
    .defer(d3.json, 'data/us.json')
    .defer(d3.csv, dataPath)
    .await(ready);

// Map-building functions
function ready(error, us, data) {
  if (error) return console.error(error);

  map.selectAll('path')
      .data(topojson.feature(us, us.objects.states).features)
  .enter().append('path')
      .attr('class', function(d) {return 'state' + d.id;})
      .attr('d', path)
      .attr('fill', noDataColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

  map.selectAll('rect')
      .data(smallStateRects)
  .enter().append('rect')
      .attr('width', function() {return scaleOffset(28, 'width');})
      .attr('height', function() {return scaleOffset(28, 'height');})
        .attr('x', function(d) {
          return scaleOffset((labelOffsets[d.id].rectX + 10), 'width');
        })
        .attr('y', function(d) {
          return scaleOffset((labelOffsets[d.id].rectY - 12), 'height');
        })
        .attr('fill', noDataColor)
        .attr('class', function(d) {return 'state' + d.id;});

  //create group for labels
  var labelGroups = labels.selectAll('text')
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append('g');

  textLabel(labelGroups, 'name', 0);
  textLabel(labelGroups, 'value', 14);

  data.forEach(function(d) {
    d3.selectAll('.state' + d.id)
        .style('fill', mapColor(parseFloat(d[observation])));
    d3.select('#statevalue' + d.id)
        .html(legendDataType(d[observation]))
    d3.select('#statename' + d.id)
        .html(d.abbr)
  });

  //drawLegend();
}

var adjustment = d3.scale.linear()
                .domain([0, width])
                .range([0, 150]);

function addTooltip(label, number) {
  tooltip.transition()
    .duration(200)
    .style('opacity', 0.9);
  tooltip.html(
    label + ': ' + (number ? tooltipDataType(number) : 'No Data')
  )
    .style('left', (d3.event.pageX - adjustment(d3.event.pageX)) + 'px')
    .style('top', (d3.event.pageY + 50) + 'px');
}

function drawLegend() {
  var legendData = [{'color': noDataColor, 'label': 'No Data'}],
      legendDomain = [],
      legendScale,
      legendAxis;

  for (var i = 0, j = colors.length; i < j; i++) {
    var fill = colors[i];
    var label = legendDataType(min + increment * i) + ((i === j - 1) ? '+' : '-' + legendDataType(min + increment * (i + 1)));
    legendData[i + 1] = {'color': fill, 'label': label};
  }

  for (var k = 0, x = legendData.length; k < x; k++) {
    legendDomain.push(legendData[k].label);
  }

  legendScale = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.2)
      .domain(legendDomain);

  legendAxis = d3.svg.axis()
      .scale(legendScale)
      .orient('bottom');

  legend.call(legendAxis);

  legend.selectAll('rect')
      .data(legendData)
  .enter()
      .append('rect')
      .attr('x', function(d) {return legendScale(d.label);})
      .attr('y', -30)
      .attr('height', 30)
      .attr('class', 'legend-item')
      .transition()
      .duration(700)
      .attrTween('width', function() {return d3.interpolate(0, legendScale.rangeBand());})
      .attrTween('fill', function(d) {return d3.interpolate('#fff', d.color);});
}

function scaleOffset(offset, type) {
  switch (type) {
    case 'width':
      return (offset / 960) * width;
    case 'height':
      return (offset / 720) * height;
  }
}

function textLabel(labelGroup, className, yOffset) {
  labelGroup
    .append('text')
    .attr('class', 'state-' + className)
    .attr('id', function(d) {return 'state' + className + d.id;})
      .attr('text-anchor', function(d) {
        if (labelOffsets[d.id] && labelOffsets[d.id].rectX) {
          return 'end';
        } else {
          return 'middle';
        }
      })
      .attr('transform', function(d) {
        var centroid = path.centroid(d);
        if (labelOffsets[d.id] && labelOffsets[d.id].rectX) {
          return 'translate(' + labelOffsets[d.id].rectX + ',' + (labelOffsets[d.id].rectY + yOffset) + ')';
        } else if (labelOffsets[d.id]) {
          var x = Math.floor(centroid[0]) + scaleOffset(labelOffsets[d.id].x, 'width'),
              y = Math.floor(centroid[1]) + scaleOffset(labelOffsets[d.id].y, 'height');
          return 'translate(' + x + ',' + (y + yOffset) + ')';
        } else if (d.id !== 72 && d.id !== 78) {
          var x = Math.floor(centroid[0]),
              y = Math.floor(centroid[1]);
          return 'translate(' + x + ',' + (y + yOffset) + ')';
        }
      });
}
