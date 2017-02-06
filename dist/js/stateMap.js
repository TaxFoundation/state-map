'use strict'

var DATA_PATH = 'data/data.csv';

var STATES = [
  { id: 1, abbr: 'AL', name: 'Alabama' },
  { id: 2, abbr: 'AK', name: 'Alaska' },
  { id: 4, abbr: 'AZ', name: 'Arizona' },
  { id: 5, abbr: 'AR', name: 'Arkansas' },
  { id: 6, abbr: 'CA', name: 'California' },
  { id: 8, abbr: 'CO', name: 'Colorado' },
  { id: 9, abbr: 'CT', name: 'Connecticut' },
  { id: 10, abbr: 'DE', name: 'Delaware' },
  { id: 11, abbr: 'DC', name: 'District of Columbia' },
  { id: 12, abbr: 'FL', name: 'Florida' },
  { id: 13, abbr: 'GA', name: 'Georgia' },
  { id: 15, abbr: 'HI', name: 'Hawaii' },
  { id: 16, abbr: 'ID', name: 'Idaho' },
  { id: 17, abbr: 'IL', name: 'Illinois' },
  { id: 18, abbr: 'IN', name: 'Indiana' },
  { id: 19, abbr: 'IA', name: 'Iowa' },
  { id: 20, abbr: 'KS', name: 'Kansas' },
  { id: 21, abbr: 'KY', name: 'Kentucky' },
  { id: 22, abbr: 'LA', name: 'Louisiana' },
  { id: 23, abbr: 'ME', name: 'Maine' },
  { id: 24, abbr: 'MD', name: 'Maryland' },
  { id: 25, abbr: 'MA', name: 'Massachusetts' },
  { id: 26, abbr: 'MI', name: 'Michigan' },
  { id: 27, abbr: 'MN', name: 'Minnesota' },
  { id: 28, abbr: 'MS', name: 'Mississippi' },
  { id: 29, abbr: 'MO', name: 'Missouri' },
  { id: 30, abbr: 'MT', name: 'Montana' },
  { id: 31, abbr: 'NE', name: 'Nebraska' },
  { id: 32, abbr: 'NV', name: 'Nevada' },
  { id: 33, abbr: 'NH', name: 'New Hampshire' },
  { id: 34, abbr: 'NJ', name: 'New Jersey' },
  { id: 35, abbr: 'NM', name: 'New Mexico' },
  { id: 36, abbr: 'NY', name: 'New York' },
  { id: 37, abbr: 'NC', name: 'North Carolina' },
  { id: 38, abbr: 'ND', name: 'North Dakota' },
  { id: 39, abbr: 'OH', name: 'Ohio' },
  { id: 40, abbr: 'OK', name: 'Oklahoma' },
  { id: 41, abbr: 'OR', name: 'Oregon' },
  { id: 42, abbr: 'PA', name: 'Pennsylvania' },
  { id: 44, abbr: 'RI', name: 'Rhode Island' },
  { id: 45, abbr: 'SC', name: 'South Carolina' },
  { id: 46, abbr: 'SD', name: 'South Dakota' },
  { id: 47, abbr: 'TN', name: 'Tennessee' },
  { id: 48, abbr: 'TX', name: 'Texas' },
  { id: 49, abbr: 'UT', name: 'Utah' },
  { id: 50, abbr: 'VT', name: 'Vermont' },
  { id: 51, abbr: 'VA', name: 'Virginia' },
  { id: 53, abbr: 'WA', name: 'Washington' },
  { id: 54, abbr: 'WV', name: 'West Virginia' },
  { id: 55, abbr: 'WI', name: 'Wisconsin' },
  { id: 56, abbr: 'WY', name: 'Wyoming' },
];

var app = {
  init: function() {
    this.height = 820;
    this.width = 960;
    this.borderColor = '#ffffff';
    this.noDataColor = '#dddddd';
    this.data = [];
    this.parsed = false;
    this.identifiedBy = 'id';
    this.identifiedCol = '';
    app.firstDraw();
    app.setupListeners();
  },

  firstDraw: function() {
    var svg = d3.select('#map-container').append('svg')
      .attr('id', 'the-svg')
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + app.width + ' ' + app.height);

    var projection = d3.geoAlbersUsa()
      .scale(app.width * 1.3)
      .translate([app.width / 2, app.height - app.height * 0.6]);

    var path = d3.geoPath()
      .projection(projection);

    var titles = svg.append('g')
      .attr('class', 'titles');

    var title = titles.append('text')
      .attr('class', 'title')
      .attr('x', 16)
      .attr('y', 37)
      .text('Title');

    var subtitle = titles.append('text')
      .attr('class', 'subtitle')
      .attr('x', 19)
      .attr('y', 63)
      .text('Subtitle');

    var notes = svg.append('g')
      .attr('class', 'notes')
      .append('text')
      .attr('class', 'note')
      .attr('x', 16)
      .attr('y', 685)
      .text('Notes and Source');

    var map = svg.append('g')
      .attr('class', 'states')
      .attr('transform', 'translate(0, 45)');

    var labels = svg.append('g')
      .attr('class', 'labels')
      .attr('transform', 'translate(0, 45)');

    d3.queue()
      .defer(d3.json, 'data/us.json')
      .await(function(error, data) {
        map.selectAll('path')
          .data(topojson.feature(data, data.objects.states).features)
        .enter().append('path')
          .attr('class', function (d) {return 'state' + d.id;})
          .attr('d', path)
          .attr('fill', app.noDataColor)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);

        labels.selectAll('g')
          .data(topojson.feature(data, data.objects.states).features)
        .enter().append('g')
          .attr('class', function(d) {return 'labels' + d.id;})
          .attr('transform', function(d) {
            var centroid = path.centroid(d);
            if (centroid[0] && centroid[1]) {
              return 'translate(' + centroid[0] + ',' + centroid[1] + ')';
            } else {
              return 'translate(0,0)';
            }
          })
          .append('text')
          .attr('class', function(d) {return 'abbr' + d.id;})
          .attr('text-anchor', 'middle')
          .text(function(d) {
            var state = STATES.filter(function(s) {
              return s.id == d.id;
            });
            return state[0].abbr;
          });
      });
  },

  redraw: function() {
    app.data.forEach(function(d) {
      d3.select('.state' + d.id)
        .attr('fill', '#000000'); // TODO replace with color scale and values
    });
  },

  setupListeners: function() {
    document.getElementById('title-text').addEventListener('input', function() {
      d3.select('.title').text(this.value);
    });
    document.getElementById('subtitle-text').addEventListener('input', function() {
      d3.select('.subtitle').text(this.value);
    });
    document.getElementById('notes-text').addEventListener('input', function() {
      d3.select('.note').text(this.value).call(app.wrap, 550);
    });
    document.getElementById('data-file').addEventListener('change', function() {
      app.readFile(this.files[0], app.parseFile);
    });
    document.getElementById('identified-by').addEventListener('change', function() {
      app.identifiedBy = this.value;
    });
    document.getElementById('identified-col').addEventListener('change', function() {
      app.identifiedCol = this.value;
    });
    document.getElementById('value-type').addEventListener('change', function() {
      console.log('value type changed');
    });
    document.getElementById('value-col').addEventListener('change', function() {
      console.log('value col changed');
    });
    document.getElementById('data-scale').addEventListener('change', function() {
      app.dataScaleListener(this);
    });
  },

  wrap: function(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 16, // ems
          y = text.attr('y'),
          dy = parseFloat(text.attr('dy')) || 0,
          tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy);
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy).text(word);
        }
      }
    });
  },

  readFile: function(file, callback) {
    var reader = new FileReader();
    reader.onload = function(event) {
      if (file.type != 'text/csv') {
        alert('This file is not a comma-separated values file. This program only reads CSV files.')
      } else {
        callback(event.target.result);
      }
    }

    reader.readAsText(file);
  },

  parseFile: function(rawData) {
    app.data = d3.csvParse(rawData);

    app.data.columns.forEach(function(d) {
      d3.select('#identified-col').append('option')
        .attr('value', d)
        .text(d);

      d3.select('#value-col').append('option')
        .attr('value', d)
        .text(d);
    });
    d3.select('#data-id-select').attr('style', '');
    d3.select('#data-value-select').attr('style', '');
    d3.select('#data-scale-container').attr('style', '');
    d3.select('#data-stats').attr('style', '');
  },

  valueColListener: function(valueCol) {
    if (valueCol.value !== 'default') {
      // TODO compute stuff
    }
  },

  dataScaleListener: function(dataScale) {
    var midValue = document.getElementById('mid-value');
    if (dataScale.value !== 'divergent') {
      midValue.disabled = true;
    } else {
      midValue.disabled = false;
    }
  },

  getFipsId: function(identifiedBy, value) {
    // Filter array of states by identifiedBy and get FIPS
    var state = STATES.filter(function(s) {
      return s[identifiedBy] == value;
    });

    return state.id;
  }
};

// Define increments for data scale
var min = 84, //Floor for the first step
    mid = 100,
    max = 116, //Anything above the max is the final step
    steps = 8, //Final step represents anything at or above max
    increment = (max - min) / (steps - 1);

// Create distinct colors for each increment based on two base colors
var colors = [],
    lowBaseColor = '#FFCE00', //Color applied at the end of the scale with the lowest values
    midBaseColor = '#FFAA93',
    highBaseColor = '#FF0068', //Color applied at the end of the scale with the highest values
    scaleColor = d3.scaleLinear()
        .domain([0, steps - 1])
        .range([lowBaseColor, highBaseColor])
        .interpolate(d3.interpolateHcl); //Don't like the colors you get? Try interpolateHcl or interpolateHsl!

// Create basic legend and add generated colors to the 'colors' array
// Should replace this with D3.js Axis
for (var c = 0; c < steps; c++) {
  colors.push(scaleColor(c));
}





var mapColor = d3.scaleLinear()
    .domain([min, mid, max])
    .range([lowBaseColor, midBaseColor, highBaseColor]);



// var legend = svg.append('g')
//     .attr('class', 'legend')
//     .attr('transform', 'translate(0,' + (height - height * 0.1) + ')');

// Set params and queue map files
// var dataPath = 'data/100-dollar-map.csv',
//     legendDataType = dataFormat.tens,
//     tooltipDataType = dataFormat.tens,
//     observation = 'value';

var smallStateRects = [{ id: 9 }, { id: 10 }, { id: 11 }, { id: 24 }, { id: 25 }, { id: 33 }, { id: 34 }, { id: 44 }, { id: 50 }];

var labelOffsets = { //To preserve position with changes to width and height, set all values to percentage * width or height
  2:  { x: 5, y: -10 },
  9:  { x: 0, y: 0, rectX: 910, rectY: 310 },
  10: { x: 0, y: 0, rectX: 910, rectY: 390 },
  11: { x: 0, y: 0, rectX: 910, rectY: 470 },
  12: { x: 25, y: 20 },
  13: { x: 5, y: 5 },
  15: { x: 0, y: 0 },
  17: { x: -5, y: -10 },
  22: { x: 0, y: 0 },
  23: { x: 0, y: -5 },
  24: { x: 0, y: 0, rectX: 910, rectY: 430 },
  25: { x: 0, y: 0, rectX: 910, rectY: 230 },
  26: { x: 15, y: 22 },
  27: { x: 0, y: -20 },
  33: { x: 0, y: 0, rectX: 795, rectY: 50 },
  34: { x: 0, y: 0, rectX: 910, rectY: 350 },
  36: { x: 0, y: 0 },
  37: { x: 0, y: 0 },
  44: { x: 0, y: 0, rectX: 910, rectY: 270 },
  45: { x: 0, y: 0 },
  50: { x: 0, y: 0, rectX: 695, rectY: 50 },
  51: { x: 0, y: 0 },
  54: { x: 0, y: 0 },
  55: { x: -3, y: -10 },
};

// d3.queue()
//     .defer(d3.json, 'data/us.json')
//     .defer(d3.csv, dataPath)
//     .await(ready);

// Map-building functions
function ready(error, us, data) {
  if (error) return console.error(error);

  map.selectAll('path')
      .data(topojson.feature(us, us.objects.states).features)
  .enter().append('path')
      .attr('class', function (d) {return 'state' + d.id;})
      .attr('d', path)
      .attr('fill', noDataColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

  map.selectAll('rect')
      .data(smallStateRects)
  .enter().append('rect')
      .attr('width', function () {return scaleOffset(18, 'width');})
      .attr('height', function () {return scaleOffset(18, 'height');})
        .attr('x', function (d) {
          return scaleOffset((labelOffsets[d.id].rectX + 10), 'width');
        })
        .attr('y', function (d) {
          return scaleOffset((labelOffsets[d.id].rectY - 14), 'height');
        })
        .attr('fill', noDataColor)
        .attr('class', function (d) {return 'state' + d.id;});

  //create group for labels
  var labelGroups = labels.selectAll('text')
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append('g');

  textLabel(labelGroups, 'name', 0);
  textLabel(labelGroups, 'value', 16);

  data.forEach(function (d) {
    d3.selectAll('.state' + d.id)
        .style('fill', mapColor(parseFloat(d[observation])));
    d3.select('#statevalue' + d.id)
        .html(legendDataType(d[observation]));
    d3.select('#statename' + d.id)
        .html(d.abbr);
  });

  //drawLegend();
}

// var adjustment = d3.scaleLinear()
//                 .domain([0, width])
//                 .range([0, 150]);

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
  var legendData = [{ color: noDataColor, label: 'No Data' }],
      legendDomain = [],
      legendScale,
      legendAxis;

  for (var i = 0, j = colors.length; i < j; i++) {
    var fill = colors[i];
    var label = legendDataType(min + increment * i) + ((i === j - 1) ? '+' : '-' + legendDataType(min + increment * (i + 1)));
    legendData[i + 1] = { color: fill, label: label, };
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
      .attr('x', function (d) {return legendScale(d.label);})
      .attr('y', -30)
      .attr('height', 30)
      .attr('class', 'legend-item')
      .transition()
      .duration(700)
      .attrTween('width', function () {return d3.interpolate(0, legendScale.rangeBand());})
      .attrTween('fill', function (d) {return d3.interpolate('#fff', d.color);});
}



function textLabel(labelGroup, className, yOffset) {
  labelGroup
    .append('text')
    .attr('class', 'state-' + className)
    .attr('id', function (d) {return 'state' + className + d.id;})
      .attr('text-anchor', function (d) {
        if (labelOffsets[d.id] && labelOffsets[d.id].rectX) {
          return 'end';
        } else {
          return 'middle';
        }
      })
      .attr('transform', function(d) {
        var centroid = path.centroid(d);
        if (labelOffsets[d.id] && labelOffsets[d.id].rectX) {
          return 'translate('
            + labelOffsets[d.id].rectX + ','
            + (labelOffsets[d.id].rectY + yOffset) + ')';
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

(function() {
  app.init(app);
})();