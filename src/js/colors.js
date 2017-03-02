import * as chroma from 'chroma-js';

const colors = {
  sequenceColor(value, theDomain, interpolation, steps) {
    const scale = chroma.scale(theInterpolation)
      .domain(theDomain)
      .classes(steps);

    return scale(value).hex();
  },

  divergentColor(value, domain, interpolation) {
    let theDomain = domain || [app.summaryStats.min, app.summaryStats.mid, app.summaryStats.max];
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

export default colors;
