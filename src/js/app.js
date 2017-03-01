/* globals d3 chroma */
import STATES from './stateList.js';

const TOP_RECT_STATES = [33, 50];
const SIDE_RECT_STATES = [9, 10, 11, 24, 25, 34, 44, 54];
const LABEL_OFFSETS = {
  2: { x: 5, y: -10 },
  12: { x: 25, y: 20 },
  13: { x: 5, y: 5 },
  15: { x: 0, y: 0 },
  17: { x: -5, y: -10 },
  22: { x: -10, y: 0 },
  23: { x: 0, y: -5 },
  26: { x: 15, y: 22 },
  27: { x: 0, y: -20 },
  36: { x: 0, y: 0 },
  37: { x: 0, y: 0 },
  45: { x: 0, y: 0 },
  51: { x: 0, y: 0 },
  55: { x: -3, y: -10 },
};

const colors = {
  sequential: [
    {},
  ],

  divergent: [
    {},
  ],

  qualitative: [
    {},
  ],
};

const app = {
  init() {
    this.height = 820;
    this.width = 960;
    this.borderColor = '#ffffff';
    this.noDataColor = '#dddddd';
    this.data = [];
    this.parsed = false;
    this.sideRectXStart = 890;
    this.sideRectYStart = 265;
    this.sideRectOffset = 40;
    this.identifiedBy = 'id';
    this.identifiedCol = '';
    this.valueType = '';
    this.valueCol = '';
    this.reverseSequence = false;
    this.summaryStats = {
      min: 0,
      mid: 50,
      max: 100,
    };
    this.interpolator = 'Plasma';
    this.steps = 5;
    app.firstDraw();
    app.setupListeners();
  },

  firstDraw() {
    const svg = d3.select('#map-container').append('svg')
      .attr('id', 'the-svg')
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${app.width} ${app.height}`);

    const projection = d3.geoAlbersUsa()
      .scale(app.width * 1.3)
      .translate([app.width / 2, app.height - app.height * 0.6]);

    const path = d3.geoPath()
      .projection(projection);

    const titles = svg.append('g')
      .attr('class', 'titles');

    const title = titles.append('text')
      .attr('class', 'title')
      .attr('style', 'font-family: \'Lato\', Arial, sans-serif; font-size: 32px; font-style: normal; font-weight:700')
      .attr('x', 16)
      .attr('y', 37)
      .text('Title');

    const subtitle = titles.append('text')
      .attr('class', 'subtitle')
      .attr('style', 'font-family: \'Lato\', Arial, sans-serif; font-size: 18px; font-style: italic; font-weight:400')
      .attr('x', 19)
      .attr('y', 63)
      .text('Subtitle');

    const notes = svg.append('g')
      .attr('class', 'notes')
      .append('text')
      .attr('class', 'note')
      .attr('x', 16)
      .attr('y', 685)
      .text('Notes and Source');

    const map = svg.append('g')
      .attr('class', 'states')
      .attr('transform', 'translate(0, 45)');

    const labels = svg.append('g')
      .attr('class', 'labels')
      .attr('transform', 'translate(0, 45)');

    d3.queue()
      .defer(d3.json, 'data/us.json')
      .await((error, data) => {
        map.selectAll('path')
          .data(topojson.feature(data, data.objects.states).features)
        .enter().append('path')
          .attr('class', d => `state state${d.id}`)
          .attr('d', path)
          .attr('fill', app.noDataColor)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);

        labels.selectAll('g')
          .data(topojson.feature(data, data.objects.states).features)
        .enter().append('g')
          .attr('class', d => `labels labels${d.id}`)
          .attr('transform', (d) => {
            const centroid = path.centroid(d);
            if (centroid[0] && centroid[1]) {
              if (LABEL_OFFSETS[d.id]) {
                return `translate(${
                 centroid[0] + LABEL_OFFSETS[d.id].x},${
                 centroid[1] + LABEL_OFFSETS[d.id].y})`;
              }
              return `translate(${centroid[0]},${centroid[1]})`;
            }
            return 'translate(0,0)';
          })
          .append('text')
          .attr('class', d => `abbr${d.id}`)
          .attr('text-anchor', 'middle')
          .attr('style', 'font-family: \'Lato\', Arial, sans-serif; font-size: 14px; font-style: normal; font-weight:700')
          .text((d) => {
            const state = STATES.filter(s => s.id == d.id);

            if (state[0]) {
              return state[0].abbr;
            }
            return '';
          });

        let sideRects = 0;
        SIDE_RECT_STATES.forEach((s) => {
          console.log(s);
          map.append('rect')
            .attr('x', app.sideRectXStart)
            .attr('y', app.sideRectYStart + (app.sideRectOffset * sideRects))
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', app.noDataColor)
            .attr('class', () => `state state${s}`);

          d3.select(`.labels${s}`)
            .attr('transform', s => `translate(${
               app.sideRectXStart - 6
               },${
               (app.sideRectYStart + 11) + (app.sideRectOffset * sideRects)
               })`);

          d3.select(`.abbr${s}`)
            .attr('text-anchor', 'end');

          sideRects++;
        });
      });
  },

  redraw() {
    const cleanData = [];

    app.data.forEach((d) => {
      const fips = app.getFipsId(app.identifiedBy, d[app.identifiedCol]);
      const value = d[app.valueCol];
      cleanData.push({
        id: fips,
        value,
      });
    });

    cleanData.forEach((d) => {
      console.log(d.value, app.divergentColor(d.value));
      d3.selectAll(`.state${d.id}`)
        .attr('fill', app.sequenceColor(d.value));
    });
  },

  setupListeners() {
    document.getElementById('title-text').addEventListener('input', () => {
      d3.select('.title').text(this.value);
    });
    document.getElementById('subtitle-text').addEventListener('input', () => {
      d3.select('.subtitle').text(this.value);
    });
    document.getElementById('notes-text').addEventListener('input', () => {
      d3.select('.note')
        .text(this.value)
        .call(app.wrap, 550);
    });
    document.getElementById('data-file').addEventListener('change', () => {
      app.readFile(this.files[0], app.parseFile);
    });
    document.getElementById('identified-by').addEventListener('change', () => {
      app.identifiedBy = this.value;
      app.validateId();
    });
    document.getElementById('identified-col').addEventListener('change', () => {
      app.identifiedCol = this.value;
      app.validateId();
    });
    document.getElementById('value-type').addEventListener('change', () => {
      console.log('value type changed');
    });
    document.getElementById('value-col').addEventListener('change', () => {
      app.valueColListener(this);
    });
    document.getElementById('data-scale').addEventListener('change', () => {
      app.dataScaleListener(this);
    });
  },

  scaleSelect(scaleType) {
    const scales = d3.select('#color-scales');
    scales.attr('style', '');
    scales.selectAll('*').remove();

    let theInterpolators;
    let theScale;

    switch (scaleType) {
      case 'sequential':
        theInterpolators = SEQUENTIAL_INTERPOLATORS;
        theScale = app.sequenceColor;
        break;
      case 'divergent':
        theInterpolators = DIVERGENT_INTERPOLATORS;
        theScale = app.divergentColor;
        break;
    }

    theInterpolators.forEach((s) => {
      const scale = scales.append('div')
        .attr('class', 'scale-row')
        .on('click', (e) => { app.interpolator = s; });
      const theDomain = [0, app.steps - 1];

      for (let i = 0; i < app.steps; i++) {
        const color = theScale(i, theDomain, s);
        scale.append('div')
          .attr('class', 'scale-step')
          .attr('style', `background-color: ${color}`);
      }
    });
  },

  wrap(text, width) {
    text.each(() => {
      const theText = d3.select(this),
        words = theText.text()
          .split(/\s+/)
          .reverse(),
        lineHeight = 16;
      let word = '',
        line = [],
        lineNumber = 0,
        y = theText.attr('y'),
        dy = parseFloat(theText.attr('dy')) || 0,
        tspan = theText.text(null).append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', dy);
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = theText.append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy)
            .text(word);
        }
      }
    });
  },

  readFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (file.type !== 'text/csv') {
        alert('This file is not a comma-separated values file. This program only reads CSV files.');
      } else {
        callback(event.target.result);
      }
    };

    reader.readAsText(file);
  },

  parseFile(rawData) {
    app.data = d3.csvParse(rawData);

    app.data.columns.forEach((d) => {
      d3.select('#identified-col').append('option')
        .attr('value', d)
        .text(d);

      d3.select('#value-col').append('option')
        .attr('value', d)
        .text(d);
    });
    d3.select('#data-id-select').attr('style', '');
    d3.select('#data-value-select').attr('style', '');
  },

  valueColListener(valueCol) {
    if (valueCol.value !== 'default') {
      d3.select('#data-scale-container').attr('style', '');
      d3.select('#data-stats').attr('style', '');

      app.valueCol = valueCol.value;
    }
  },

  dataScaleListener(dataScale) {
    const midValue = document.getElementById('mid-value');
    if (dataScale.value !== 'divergent') {
      midValue.disabled = true;
    } else {
      midValue.disabled = false;
    }
  },

  getFipsId(identifiedBy, value) {
    // Filter array of states by identifiedBy and get FIPS
    const state = STATES.filter(s => s[identifiedBy] === value);

    return state[0].id;
  },

  validateId() {
    const validated = [];
    const invalid = [];
    if (app.identifiedCol !== '' && app.identifiedCol !== 'default') {
      app.data.forEach((d) => {
        const id = d[app.identifiedCol];
        const match = STATES
          .map(s => s[app.identifiedBy])
          .find(s => s === id);
        if (match !== undefined) {
          validated.push(id);
        } else {
          invalid.push(id);
        }
      });

      if (invalid.length) {
        d3.select('#id-validation-message')
          .attr('class', 'warning')
          .text(`Could not validate: ${invalid.join(', ')}`);
      } else if (!invalid.length) {
        d3.select('#id-validation-message')
          .attr('class', 'valid')
          .text('All IDs validated.');
      }
    }
  },

  sequenceColor(value, theDomain, interpolation, steps) {
    // value is the datapoint to be given a color
    // theDomain is an array with, at minimum, the min and max of the observations
    // interpolation is an array of colors to be used in the scale
    // steps is the number of steps to be used in creating the color breaks
    var theDomain = theDomain || [app.summaryStats.min, app.summaryStats.max];
    if (app.reverseSequence) {
      theDomain = [app.summaryStats.max, app.summaryStats.min];
    }
    const theInterpolation = interpolation || app.interpolator;

    const scale = chroma.scale(theInterpolation)
      .domain(theDomain)
      .classes(steps);

    return scale(value).hex();
  },

  divergentColor(value, theDomain, interpolation) {
    var theDomain = theDomain || [app.summaryStats.min, app.summaryStats.mid, app.summaryStats.max];
    if (app.reverseSequence) {
      theDomain = [app.summaryStats.max, app.summaryStats.mid, app.summaryStats.min];
    }
    const theInterpolation = interpolation || app.interpolator;
    console.log(theInterpolation);

    const scale = d3.scaleSequential()
      .domain(theDomain)
      .clamp(true);
    return scale(value);
  },
};

(() => {
  app.init(app);
})();