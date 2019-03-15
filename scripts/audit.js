// Initialize the accessbility test method.
module.exports = function ( pattern = '*' ) {

  // Load dependencies.
  const path = require('path');
  const patternlab = require('patternlab-node');
  const fs = require('fs-extra');
  const glob = require('glob').sync;
  const intercept = require('intercept-stdout');
  const grunt = require('grunt');
  const utils = require('./utils.js');
  const _ = require('lodash');
  const pa11y = require('pa11y');

  // Load configurations.
  const config = require('../patternlab-config.json');

  // Initialize output file name.
  const output = 'accessibility-audit.json';

  // Get pattern data.
  const patterns = utils.patterns();

  // Get patterns to export.
  const exports = pattern == '*' ? Object.values(patterns) : Object.values(patterns).filter((data) => data.pattern.plid == pattern);

  // Ignore invalid patterns.
  if( exports.length === 0 ) {

    // Report unknown pattern.
    grunt.log.warn(`Unknown pattern '${pattern}'. Verify the pattern exists then try again.`);

    // Exit.
    return;

  }


  // Load the export task.
  grunt.registerTask('export', 'Compiles and exports patterns.', require('./export.js'));

  // Load accessibility audit task.
  grunt.registerTask('audit', 'Audits the accessibility of compiled patterns.', function () {

    // Make the task asynchronous.
    const done = this.async();

    // Capture audit results.
    const audits = [];
    const results = [];

    // Run an audit for each pattern.
    exports.forEach((pattern) => {

      // Determine the pattern's compiled filename.
      const filename = `${pattern.pattern.id}${config.outputFileSuffixes.markupOnly}.html`;

      // Run the audit, and capture its results.
      audits.push(
        pa11y(path.join(pattern.pattern.dest, filename), {
          standard: 'Section508'
        }).then((result) => results.push(result))
      );

    });

    // Wait for all audits to finish running.
    Promise.all(audits).then(() => {

      // Output results.
      fs.writeJsonSync(path.resolve(output), results, {spaces: 2});

      // Done.
      done();

    });

  });

  // Run grunt subtasks.
  grunt.task.run(`export:${pattern}`, `audit`);

};
