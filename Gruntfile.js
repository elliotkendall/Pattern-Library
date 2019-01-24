module.exports = function(grunt) {

  const _ = require('lodash');
  const path = require('path');
  const argv = require('minimist')(process.argv.slice(2));

  // Pattern Lab configuration(s)
  const config = require('./patternlab-config.json');
  const patternlab = require('patternlab-node')(config);
  const pkg = grunt.config.init({pkg: grunt.file.readJSON('package.json')});
  const paths = grunt.config.process(config.paths);

  // Define a list of files to ignore during `uglify`.
  // Paths are relative to the `dist/js/` folder.
  const noUglify = [
    // 'dependencies/foo/foo.js'
  ];

  // Initialize configurations
  grunt.config.merge({
    clean: {
      public: [path.resolve(paths.public.root)]
    },
    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: path.resolve(paths.source.images),
            src: '**/*',
            dest: path.resolve(paths.public.images)
          },
          {
            expand: true,
            cwd: path.resolve(paths.source.fonts),
            src: '**/*',
            dest: path.resolve(paths.public.fonts)
          },
          {
            expand: true,
            cwd: path.resolve(paths.source.root),
            src: 'favicon.ico',
            dest: path.resolve(paths.public.root)
          },
          {
            expand: true,
            cwd: path.resolve(paths.source.styleguide),
            src: '**/*',
            dest: path.resolve(paths.public.root)
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: path.resolve(paths.source.images),
            src: '**/*',
            dest: path.resolve(paths.dist.images)
          },
          {
            expand: true,
            cwd: path.resolve(paths.source.fonts),
            src: '**/*',
            dest: path.resolve(paths.dist.fonts)
          },
          {
            expand: true,
            cwd: path.resolve(paths.source.root),
            src: 'favicon.ico',
            dest: path.resolve(paths.dist.root)
          }
        ]
      }
    },
    watch: {
      assets: {
        files: [
          path.resolve(paths.source.fonts, '**'),
          path.resolve(paths.source.images, '**'),
        ],
        tasks: ['build:dev:patternlab', 'bsReload']
      },
      patternlab: {
        files: [
          path.resolve(paths.source.patterns, '**'),
          path.resolve(paths.source.data, '**'),
          path.resolve(paths.source.meta, '**')
        ],
        tasks: ['build:dev:patternlab', 'bsReload']
      },
      config: {
        options: {
          reload: true
        },
        files: [
          path.resolve(paths.source.root, '*.ico'),
          path.resolve(paths.root, 'Gruntfile.js'),
          path.resolve(paths.root, 'Plopfile.js'),
          path.resolve(paths.root, 'patternlab-config.json'),
          path.resolve(paths.root, '.eslintrc'),
          path.resolve(paths.root, '.babelrc'),
          path.resolve(paths.root, '.jshintrc')
        ],
        tasks: ['dev:startup']
      },
      scss: {
        files: [
          path.resolve(paths.source.scss, '**/*.scss'),
          '!' + path.resolve(paths.source.scss, 'patterns/__master.scss'),
          path.resolve(paths.source.patterns, '**/*.scss')
        ],
        tasks: ['build:dev:scss', 'build:dev:patternlab', 'bsReload']
      },
      js: {
        files: [
          path.resolve(paths.source.js, '**/*.js'),
          '!' + path.resolve(paths.source.js, 'bundle.js'),
          path.resolve(paths.source.patterns, '**/*.js')
        ],
        tasks: ['jshint:dev', 'build:dev:js', 'build:dev:patternlab', 'bsReload']
      }
    },
    browserSync: {
      dev: {
        options: {
          open: 'local',
          server: path.resolve(paths.public.root),
          watchTask: true,
          watchOptions: {
            ignoreInitial: true,
            ignored: '*.html'
          },
          snippetOptions: {
            // Ignore all HTML files within the templates folder
            blacklist: ['/index.html', '/', '/?*']
          },
          plugins: [{
            module: 'bs-html-injector',
            options: {
              files: [path.resolve(paths.public.root, 'index.html'), path.resolve(paths.public.styleguide, 'styleguide.html')]
            }
          }],
          notify: {
            styles: [
              'display: none',
              'padding: 15px',
              'font-family: sans-serif',
              'position: fixed',
              'font-size: 1em',
              'z-index: 9999',
              'bottom: 0px',
              'right: 0px',
              'border-top-left-radius: 5px',
              'background-color: #1B2032',
              'opacity: 0.4',
              'margin: 0',
              'color: white',
              'text-align: center'
            ]
          }
        }
      }
    },
    bsReload: {
      css: path.resolve(paths.public.root, '**/*.css'),
      js: path.resolve(paths.public.root, '**/*.js')
    },
    sass_import: {
      scss: {
        src: [
          path.resolve(paths.source.patterns, '*-meta/**/*.scss'),
          path.resolve(paths.source.patterns, '*-tokens/**/*.scss'),
          path.resolve(paths.source.patterns, '*-atoms/**/*.scss'),
          path.resolve(paths.source.patterns, '*-molecules/**/*.scss'),
          path.resolve(paths.source.patterns, '*-compounds/**/*.scss'),
          path.resolve(paths.source.patterns, '*-organisms/**/*.scss'),
        ],
        dest: path.resolve(paths.source.scss, 'patterns/__master.scss')
      }
    },
    'dart-sass': {
      dev: {
        options: {
          style: 'expanded',
          sourceMap: false
        },
        files: [{
          expand: true,
          cwd: path.resolve(paths.source.scss),
          src: ['*.scss'],
          dest: path.resolve(paths.public.css),
          ext: '.css'
        }]
      },
      dist: {
        options: {
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: path.resolve(paths.source.scss),
          src: ['*.scss'],
          dest: path.resolve(paths.dist.css),
          ext: '.css'
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      dev: [
        path.resolve(paths.source.js, '*.js'),
        '!' + path.resolve(paths.source.js, 'bundle.js'),
        path.resolve(paths.source.patterns, '**/*.js')
      ]
    },
    concat: {
      dev: {
        src: [
          path.resolve(paths.source.js, 'index.js'),
          path.resolve(paths.source.patterns, '**/*.js')
        ],
        dest: path.resolve(paths.public.js, 'bundle.js')
      },
      dist: {
        src: [
          path.resolve(paths.source.js, 'index.js'),
          path.resolve(paths.source.patterns, '**/*.js')
        ],
        dest: path.resolve(paths.dist.js, 'bundle.js')
      }
    },
    browserify: {
      options: {
        transform: ['babelify']
      },
      dev: {
        files: [
          {
            expand: true,
            cwd: path.resolve(paths.source.js),
            src: ['*.js', '!index.js'],
            dest: path.resolve(paths.public.js)
          },
          {
            src: [path.resolve(paths.public.js, 'bundle.js')],
            dest: path.resolve(paths.public.js, 'bundle.js')
          }
        ]
      },
      dist: {
        files: [{
          src: [path.resolve(paths.dist.js, 'bundle.js')],
          dest: path.resolve(paths.dist.js, 'bundle.js')
        }]
      }
    },
    babel: {
      options: {
        babelrc: true
      },
      dev: {
        files: [{
          expand: true,
          cwd: path.resolve(paths.source.js),
          src: ['**/*.js'],
          dest: path.resolve(paths.public.js)
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: path.resolve(paths.source.js),
          src: ['**/*.js'],
          dest: path.resolve(paths.dist.js)
        }]
      }
    },
    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: path.resolve(paths.dist.js),
          src: ['**/*.js', '!**/*.min.js', ...noUglify.map((val) => `!${val}`)],
          dest: path.resolve(paths.dist.js),
          ext: '.min.js'
        }]
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')({
            browsers: 'last 2 versions'
          })
        ]
      },
      dev: {
        src: path.resolve(paths.public.css, '**/*.css')
      },
      dist: {
        src: path.resolve(paths.dist.css, '**/*.css')
      }
    },
    cssmin: {
      dist: {
        options: {
          sourceMap: false
        },
        files: [{
          expand: true,
          cwd: path.resolve(paths.source.css),
          src: ['*.css', '!*.min.css'],
          dest: path.resolve(paths.dist.css),
          ext: '.min.css'
        }]
      }
    },
    gitTag: {
      packageFile: 'package.json'
    }
  });

  // Load tasks
  require('load-grunt-tasks')(grunt);

  // Register tasks
  grunt.registerTask('default', ['dev']);

  /* patternlab */
  grunt.registerTask('patternlab', 'Create design systems with atomic design', function(arg) {

    const done = this.async();

    switch(arg) {

      case 'build': patternlab.build(() => {}, config.cleanPublic); break;

      case 'version': patternlab.version(); break;

      case 'patternsonly': patternlab.patternsonly(() => {}, config.cleanPublic); break;

      case 'liststarterkits': patternlab.liststarterkits(); break;

      case 'loadstarterkit': patternlab.loadstarterkit(argv.kit, argv.clean); break;

      default: patternlab.help();

    }

    done();

  });

  /* build:dev */
  grunt.registerTask('build:dev', [
    'clean:public',
    'build:dev:scss',
    'build:dev:js',
    'build:dev:patternlab'
  ]);
  grunt.registerTask('build:dev:patternlab', [
    'patternlab:build',
    'copy:dev'
  ]);
  grunt.registerTask('build:dev:scss', [
    'sass_import',
    'dart-sass:dev',
    'postcss:dev'
  ]);
  grunt.registerTask('build:dev:js', [
    'concat:dev',
    'browserify:dev'
  ]);

  /* build:dist */
  grunt.registerTask('build:dist', [
    'clean:public',
    'build:dist:scss',
    'build:dist:js',
    'build:dist:patternlab'
  ]);
  grunt.registerTask('build:dist:patternlab', [
    'patternlab:build',
    'copy:dist',
    'bsReload'
  ]);
  grunt.registerTask('build:dist:scss', [
    'sass_import',
    'dart-sass:dist',
    'postcss:dist',
    'cssmin'
  ]);
  grunt.registerTask('build:dist:js', [
    'concat:dist',
    'browserify:dist',
    'uglify'
  ]);

  /* dev */
  grunt.registerTask('dev:startup', [
    'build:dev',
    'bsReload'
  ]);
  grunt.registerTask('dev', [
    'dev:startup',
    'browserSync',
    'watch'
  ]);

  /* test */
  grunt.registerTask('test', [
    'build:dev',
    'browserSync',
    'cypress:open'
  ]);

  /* dist */
  grunt.registerTask('dist', [
    'clean:public',
    'build:dist'
  ]);

  /* release */
  grunt.registerTask('release', [
    'dist',
    'git-tag'
  ]);

  /* export */
  grunt.registerTask('export', 'Exports a pattern and its assets', require('./scripts/export.js'));

    /* pull */
  grunt.registerTask('pull', 'Pull the our Sass Framework and other dependencies into our Pattern Library', require('./scripts/pull.js'));

  /* push */
  grunt.registerTask('push', 'Push Pattern Library patterns and assets to our Style Guide Guide', require('./scripts/push.js'));

};
