# Pattern Library

> This is the official Pattern Library for Emory Libraries.


## Prerequisites

This Pattern Library uses [Pattern Lab 2, Node Version, Grunt Edition](https://github.com/pattern-lab/edition-node-grunt), which requires [Node](https://nodejs.org) `>=5.0.0` for core processing, [npm](https://www.npmjs.com/) to manage project dependencies, and [Grunt](https://gruntjs.com/) `>=1.0.3` to run automated tasks and build the Pattern Lab instance. Additionally, this Pattern Library utilizes tools like [Plop](https://plopjs.com/) to help generatate files and [Browserify](http://browserify.org/) to help write modular JS that can be bundled for use in the browser. A basic understanding of these tools is recommended.


## Installation

Prior to installation, ensure that all prerequisites have been met. Then, to install this project on your system:

1. Download and unzip the compressed package, or clone the repo using:

```
git clone https://github.com/emory-libraries/Pattern-Library
```

2. Then `cd` to your project's folder in a terminal and install all package dependencies with:

```
npm install
```



## Contributing

Before contributing to the Pattern Library, make sure all [prerequisites](#prerequisites) have been meet and that followed the [installation steps](#installation) to setup the project on your system. Here's everything else you'll need to know before getting started.


### Pulling Dependencies

Our Pattern Library depends on files from other [Emory Libraries](https://github.com/emory-libraries) projects, such as the [Emory Libraries Sass Framework](https://github.com/emory-libraries/stemplate-sass). These files can be pulled into the Pattern Library from other local repos on your system as needed using the [`grunt pull`](#grunt-pull) command.

> Note, the `grunt pull` command has been preconfigured to pull in any files from other (local) repos that the Pattern Library integrates with. You must downlod or `git clone` these repos to your system in a location adjacent to your Pattern Library repo in order for this to work.

### Pushing Dependencies

Some files within our Pattern Library are utilized by other [Emory Libraries](https://github.com/emory-libraries) projects, such as the [Emory Libraries Style Guide](https://github.com/emory-libraries/style-guide-guide) and [Templating Engine](https://github.com/emory-libraries/templating-engine). These files can be pushed to other local repos on your system as needed using the [`grunt push`](#grunt-push) command.

> Note, the `grunt push` command has been preconfigured to push out any files to other (local) repos that require some integration with the Pattern Library. You must downlod or `git clone` these repos to your system in a location adjacent to your Pattern Library repo in order for this to work.


### Committing Changes

Comitting changes to the `master` branch is not permitted. You'll need to make changes in a seperate branch, then open a pull request to have those changes reviewed, approved, and merged back into the `master` branch.


### Scaffolding Patterns

To quickly scaffold new patterns and/or pattern groups, simply use the [`grunt plop`](#grunt-plop) command. This command uses our [Plop](#about-plop) templates to quickly generate the files you need. You can also use this command to call a specific generator directly by passing the desired generator's name into the Grunt task as an argument, like `grunt plop:pattern` or `grunt plop:group`.


### Testing Patterns

Our Pattern Library uses [Cypress](https://www.cypress.io/) for unit testing. To get started with creating and/or running unit tests, run `npx cypress open` in your terminal (requires npm `>=5.2.0 `). This will start the Cypress testing server and enable you to write new tests or run any existing ones.


### Automating Tasks

Grunt has been preconfigured with a number of useful tasks. The most commonly used Grunt tasks are [`grunt dev`](#grunt-dev) for developing the Pattern Library and [`grunt dist`](#grunt-dist) for generating production-ready files for distribution. The default Grunt task is set to `grunt dev`.

#### `grunt dev`

Builds the Pattern Library, listens for changes during development, and enables live previewing in the browser.

**Subtasks**

| Subtask                   | Description                                                             |
|---------------------------|-------------------------------------------------------------------------|
| `dev:startup`             | Runs an initial build and forces any active browser windows to reload.  |

#### `grunt dist`

Compiles assets and creates production-ready files for distribution.

#### `grunt release`

Generates production-ready files for distribution (like `grunt dist`) and additionally adds a new release to Github.

#### `grunt patternlab`

Runs the Pattern Lab core processor to generate an instance of our Pattern Library.

**Subtasks**

| Subtask                       | Description                                                     |
|-------------------------------|-----------------------------------------------------------------|
| `patternlab:build`            | Compiles the patterns and front-end UI.                         |
| `patternlab:version`          | Returns the Pattern Lab version being used.                     |
| `patternlab:patternsonly`     | Compiles only the patterns.                                     |
| `patternlab:liststarterkits`  | Returns a URL with a list of available Pattern Lab starterkits. |
| `patternlab:loadstarterkit`   | Loads a starterkit into the project.                            |
| `patternlab:help`             | Provides more information about Pattern Lab.                    |

#### `grunt export`

Exports a pattern definition, or group of pattern definitions, and any respective assets.

**Example**

```
grunt export:10-atoms/01-button
```

#### `grunt build:dev`

Compiles all assets files and builds an instance of our the Pattern Library for development.

**Subtasks**

| Subtask                       | Description                                              |
|-------------------------------|----------------------------------------------------------|
| `build:dev:patternlab`        | Builds our Pattern Library only.                         |
| `buils:dev:scss`              | Compiles SCSS asset files only.                          |
| `build:dev:js`                | Compiles JS asset files only.                            |


#### `grunt build:dist`

Compiles all assets files and builds an instance of our the Pattern Library for distribution.

**Subtasks**

| Subtask                       | Description                                              |
|-------------------------------|----------------------------------------------------------|
| `build:dist:patternlab`       | Builds our Pattern Library only.                         |
| `buils:dist:scss`             | Compiles SCSS asset files only.                          |
| `build:dist:js`               | Compiles JS asset files only.                            |

#### `grunt pull`

Pulls in files from other repos that feed into the Pattern Library. Current dependencies for our Pattern Library include our [Emory Libraries Sass Framework](https://github.com/emory-libraries/template-sass). Note that in order for this task to work, you will need to download or `git clone` these repose to your system, and afterwards, you will want to `git commit` these pulled files to the Pattern Library repo.

#### `grunt push`

Pushes out selected files from our Pattern Library to other repos that utilize those files. Current projects that depend of our Pattern Library include our [Emory Libraries Style Guide](https://github.com/emory-libraries/style-guide-guide) and [Templating Engine](https://github.com/emory-libraries/templating-engine). Note that in order for this task to work, you will need to download or `git clone` these repos to your system, and afterwards, you will want to `git commit` these pushed files to the other repos.


### Exporting Patterns

Individual pattern definitions can be exported using the custom `grunt export` task by passing in the pattern ID of the pattern you would like to export, like `grunt export:atoms-button`. If no pattern ID is given, then all patterns will be dumped. The pattern and its asset files (SCSS, JS, etc.) will be exported, including rendered and markup-only HTML versions of the pattern. These patterns will be exported to the `patternExportDirectory` location set in your `pattern-config.json`.

> Note, using the `grunt export` task for exporting patterns bypasses Pattern Lab's built-in method for exporting patterns via its CLI. Therefore, you can ignore the `patternExportPatternPartials` option in the `pattern-config.json` altogether as it's no longer needed using this approach.


### Additional Resources

To learn more about the various tools that we use to build and maintain our Pattern Library, check out the resources below.

#### About Pattern Lab

[Pattern Lab](https://patternlab.io/) allows you to create atomic design systems and website styleguides from the ground up. For more information on the Node version and/or Grunt edition of Pattern Lab, read the [Pattern Lab Docs](http://patternlab.io/docs), check out the [Grunt Edition](https://github.com/pattern-lab/edition-node-grunt) project on Github, and/or get more details on the [Pattern Lab Node Core](https://github.com/pattern-lab/patternlab-node). For demos and other resoures, visit to the [Pattern Lab Resource Center](http://patternlab.io/resources.html).

#### About Handlebars

[Handlebars](https://handlebarsjs.com/) is a semantic templating language that Pattern Lab uses to bind JSON data with template files in order to generate static HTML. For a complete guide on how to use Handlebars, read the [Handlebars documentation](https://handlebarsjs.com), refer to the [Handlebars API](https://handlebarsjs.com/reference.html), and/or check out the [Handlebars project on GitHub](https://github.com/wycats/handlebars.js#differences-between-handlebarsjs-and-mustache).

#### About Plop

[Plop](https://plopjs.com/) is a micro-generator that we use to help quickly scaffold new pieces of our Pattern Library. For more information on what Plop is and how to use it, read through the [Plop documentation](https://plopjs.com/documentation/) or refer to [Plop repo on Github](https://github.com/amwmedia/plop). To learn more about genorating files with Plop, customizing it to meet your needs, and/or extending its functionality, you can also check out the the [Plopfile API](https://plopjs.com/documentation/#plopfile-api) and see what an [example Plopfile](https://github.com/amwmedia/plop/tree/master/example) looks like.

#### About Cypress

[Cypress](https://www.cypress.io/) is a complete testing framework that enables developers to run unit tests and simulate real-time browser testing. For more informaiton on how to use Cypress as a testing tool, including help with writing and running tests, vising the [Cypress documentation](https://docs.cypress.io). Additional information about how to write unit tests and extend the testing tool with plugins can also be found in the [Cypress API](https://docs.cypress.io/api/api/table-of-contents.html). To learn more about Cypress as an open-source project, visit their [Github repo](https://github.com/cypress-io/cypress).


## Usage

There are three main ways to deploy this Pattern Library across Emory Libraries' websites and/or applications. Refer to the guidelines below that pertain to your specific use case.


### Using Distributed Files

For projects where you have full control over the project's structure and wish to deploy the Pattern Library, you can deploy this Pattern Library through the use of our distributed files. These files consist of the CSS and JS files that make up our design system, and they can be imported, included, and/or otherwise loaded directly into your website or application for immediate use. *More information on using our distributed files, and other helpful information about our design system, coming soon...*


### Using Source Files

For projects where you have full control over your project's structure but may not need our entire library of patterns, you can deploy this Pattern Library by using the source files for our pattern definitions directly. These files consist of the raw pattern files (`.handlebars`) and their respective assets (`.scss` and/or `.js`). To integrate our source files into your website or application, you can easily [export any of our patterns](#exporting-patterns).


### Referring to the Patterns

For all projects where you have limited to no control over the project's structure (i.e., when working with vendor products), you can deploy our Pattern Library by simply referring to our patterns and incorporating them into your website and/or application as closely as possible. *More information on best practices for using this approach, and other helpful information about our design system, coming soon...*
