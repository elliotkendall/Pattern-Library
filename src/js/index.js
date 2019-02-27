// Load dependencies.
//
// NOTE: If not using a module bundler, like Browserify or Webpack, this will not work.
// Instead, you will need to manually load these dependencies in the browser using `<script>` tags.
const _ = require('lodash');
const Vue = require('vue');
const L = require('leaflet');
const $ = require('jQuery');
const {compareTwoStrings} = require('string-similarity');

// Build utility methods.
const EUL = {

  // Load scripts using URLs.
  loadScripts( scripts ) {

    // Initialize script elements.
    const elements = [];

    // Load scripts by insterting them as elements into our HTML.
    scripts.forEach((script) => {

      // Create script element.
      elements.push($('<script>', _.isString(script) ? {src: script} : script));

    });

    // Load all scripts.
    $(document.body).append(...elements);

  }

};

// Extend Leaflet.
require('leaflet-providers');

// Extend lodash.
_.capitalizeChar = ( str, i ) => {

  // Ignore non-strings.
  if( !_.isString(str) ) return '';

  // Get parts of the string.
  const pre = i === 0 ? '' : str.slice(0, i - 1);
  const chr = str.charAt(i).toUpperCase();
  const suf = i === str.length - 1 ? '' : str.slice(i + 1);

  return pre + chr + suf;

};
_.toggle = (options, current) => options[+!options.indexOf(current)];
_.cloneDeepOwn = ( thing ) => {

  // Get the clone.
  const clone = _.cloneDeep(thing);

  // Ensure that own properties are also cloned.
  _.forOwn(thing, (value, key) => {

    clone[key] = _.cloneDeep(value);

  });

  // Return the clone.
  return clone;

};

// Initialize an event bus for handling events.
const Events = new Vue();

// Initalize a registry for creating and storing components.
const Components = {

  // Set our component namespace.
  _namespace: 'eul',

  // Convert our component namespace to a prefix.
  _prefix() {

    return this._namespace + '-';

  },

  // Get a namespaced component name.
  _name( shorthand ) {

    // Erase any namespace prefixes that exist.
    if( shorthand.indexOf(this._prefix()) === 0 ) shorthand = shorthand.substring(this._prefix().length);

    // Convert to standard component name.
    return _.kebabCase(this._prefix() + shorthand);

  },

  // Get a component registry ID.
  _id( shorthand ) {

    // Erase any namespace prefixes that exist.
    if( shorthand.indexOf(this._prefix()) === 0 ) shorthand = shorthand.substring(this._prefix().length);

    // Convert to a standard component registry ID.
    return _.capitalizeChar(_.camelCase(shorthand), 0);

  },

  // Capture component definitions.
  _definitions: {},

  // Capture registered components.
  _components: {},

  // Initializes utility methods.
  _utils: {

    // Extend a function by merging old and new functionality.
    extendFunc( oldFunc, newFunc ) {

      return function() {

        oldFunc.apply(this);
        newFunc.apply(this);

      };

    },

    // Extend component properties.
    extendProps( oldProps, newProps ) {

      // Handle properties when new properties are in the form of an array.
      if( _.isArray(newProps) && _.isObject(oldProps) ) {

        // Just add the old properties onto our new properties.
        _.forIn(oldProps, (conf, prop) => newProps[prop] = conf);

      }

      // Otherwise, simply merge the properties.
      return _.merge({}, oldProps, newProps);

    }

  },

  // Define a base definition for all components to build off of.
  _base: {

    props: {
      defaults: {
        type: Object,
        default() {
          return {};
        }
      }
    },

    methods: {},

    filters: {},

    created() {

      // Initialize data using any defaults given.
      if( this.defaults ) _.forIn(this.defaults, (value, key) => {

        this.$set(this, key, value);

      });

    }

  },

  // Merge our base definition with other definitions.
  _merge( source, ...defs ) {

    // Use the base definition as our template.
    let result = _.merge({}, source);

    // Merge all other objects into the template.
    _.each(defs, (def) => {

      // Always extend functions to maintain their previous functionality.
      _.forIn(def, (value, key) => {

        // Extend functions.
        if( _.isFunction(value) && _.isFunction(result[key]) ) {

          // Rewrite the function.
          def[key] = this._utils.extendFunc(result[key], value);

        }

      });

      // Extend properties.
      if( def.props && result.props ) {

        def.props = this._utils.extendProps(result.props, def.props);

      }

      // Merge the object into the template.
      result = _.merge({}, result, def);

    });

    // Return the merged object.
    return result;

  },

  // Register a component.
  register( componentName, componentDef = {}, extend = false ) {

    // Save the definition.
    this._definitions[this._id(componentName)] = componentDef;

    // Register the component.
    this._components[this._id(componentName)] = Vue.component(this._name(componentName), extend ? componentDef : this._merge(this._base, componentDef));

    // Make methods chainable.
    return this;

  },

  // Unregister a component.
  unregister( componentName ) {

    // Remove the definition.
    if( this._definitions[this._id(componentName)] ) delete this._definitions[this._id(componentName)];

    // Unregister the component.
    if( this._components[this._id(componentName)] ) delete this._components[this._id(componentName)];

    // Wipe component from Vue's memory.
    if( Vue.options.components[this._name(componentName)] ) delete Vue.options.components[this._name(componentName)];

    // Make methods chainable.
    return this;

  },

  // Extend a previously registered component.
  extend( componentName, componentDef = {} ) {

    // Register the component if not previously registered.
    if( !this._components[this._id(componentName)] ) this.register(componentName, componentDef);

    // Otherwise, extend the previously registered component.
    else this.register(componentName, Vue.options.components[this._name(componentName)].extend(componentDef), true);

    // Make methods chainable.
    return this;

  }

};

// Initialize a fuzzy search utility.
class Fuzzy {

  // Constructor
  constructor( index, options ) {

    // Capture self.
    const self = this;

    // Configure the search utility.
    this.config = _.merge({
      threshold: 0.6,
      similarity: 0.125,
      location: 0,
      distance: 300,
      insensitive: true,
      chars: 1,
      sort: true,
      scoring: true,
      attrs: {
        base: 'data-search',
        key: 'key',
        value: 'value',
        attr: 'attr',
        id: 'id'
      },
      tokenize: true,
      debug: true,
      callbacks: {
        sort( sorted ) {

          // Reorder items based on sort order.
          _.each(sorted.map((item) => item.__el), ($el) => {

            // Sort.
            if( $el ) $el.parent().append($el);

          });

        },
        filter( filtered, filteredout ) {

          // Show filtered.
          _.each(filtered.map((item) => item.__el), ($el) => {

            // Show.
            if( $el ) $el.show();

          });

          // Hide filteredout.
          _.each(filteredout.map((item) => item.__el), ($el) => {

            // Hide.
            if( $el ) $el.hide();

          });

        },
        search( results, nonresults ) {

          // Show results.
          _.each(results.map((item) => item.__el), ($el) => {

            // Show.
            if( $el ) $el.show();

          });

          // Hide nonresults.
          _.each(nonresults.map((item) => item.__el), ($el) => {

            // Hide.
            if( $el ) $el.hide();

          });

        },
        error( error ) {

          // Log an error when debugging.
          if( this.config.debug ) console.log(error);

        }
      }
    }, options);

    // Implement utility methods.
    this.utils = {

      // Get an attribute name.
      attr: ( id ) => `${self.config.attrs.base}-${self.config.attrs[id]}`,

      // Find references to associated index elements.
      reference( index ) {

        // Get the ID attribute.
        const attr = this.attr('id');

        // Locate elements for each index item.
        return index.map((item) => {

          // Require that items have an ID.
          if( _.has(item, 'id') ) {

            // Attempt to find the element based on ID.
            const $el = $(`[${attr}="${item.id}"]`);

            // Save elements when found.
            if( $el.length > 0 ) item.__el = $el;

          }

          // Return.
          return item;

        });

      },

      // Convert a list of elements to an index.
      index( list ) {

        // Initialize result.
        const result = [];

        // Extract the items from the list, and index them.
        $(list).children().each((i, item) => {

          // Find items with search data.
          result.push(_.toArray($(item).find(`[${this.attr('key')}]`)).map((el) => {

            // Get search attributes.
            const attrs = _.toArray(el.attributes).reduce((result, attr) => {

              result[attr.name] = attr.value;

              return result;

            }, {});

            // Initialize data.
            const data = Object.keys(attrs).filter((attr) => {

              return attr.indexOf(this.attr('key')) === 0;

            }).reduce((data, attr) => {

              if( attr.indexOf(':') > -1 ) _.set(data, attr.split(':')[1], attrs[attr]);

              else {

                let key = attrs[attr];
                let value;

                if( attrs[this.attr('attr')] ) value = attrs[this.attr('attr')];
                if( attrs[this.attr('value')] ) value = attrs[this.attr('value')];

                data[attrs[attr]] =  value || $(el).val() || $(el).text().trim();

              }

              return data;

            }, {});

            // Return data and element.
            return _.merge({__el: $(item)}, data);

          }).reduce((result, data) => {

            result = _.merge(result, data);

            return result;

          }, {}));

        });

        // Return.
        return result;

      },

      // Tokenize a query string.
      tokenize( query ) {

        // Convert the query into its various tokenized forms.
        let tokens = [];

        // Get base tokens.
        const words = query.split(' ');

        // Fully tokenize the query when enabled.
        if( self.config.tokenize ) {

          // Capture all token combinations.
          for( let n = words.length; n > 0; n-- ) {

            // Initialize the combinations.
            const combos = [];

            // Get word combinations.
            words.forEach((word, i) => {

              // Initialize the word combination.
              const combo = [word];

              // Capture any additional words in the combination
              for( let x = 1; x < n; x++ ) { if( words[i + x] ) combo.push(words[i + x]); }

              // Save the captured words.
              if( combo.length === n ) combos.push(combo.join(' '));

            });

            // Save the combinations.
            if( combos.length > 0 ) {

              // Add a weight.
              combos.weight = n;

              // Save it.
              tokens.push(combos);

            }

          }

        }

        // Otherwise, just replicate a tokenized structure.
        else {

          // Use the query as is.
          tokens = [[query]];

          // Add a weight.
          tokens[0].weight = words.length;

        }

        // Return tokens.
        return tokens;

      },

      // Calculate a score for a single token and value.
      calc( token, value ) {

        // Initialize the result.
        let location, distance, similarity, threshold, score;

        // Handle arrays of values.
        if( _.isArray(value) ) {

          // Calculate a score for each array item.
          const scores = value.map((value) => this.calc(token, value));

          // Get the average location, distance, and score of the token.
          location = _.sum(_.map(scores, 'location')) / scores.length;
          distance = _.sum(_.map(scores, 'distance')) / scores.length;
          score = _.sum(_.map(scores, 'score')) / scores.length;

        }

        // Otherwise, handle primitive values.
        else {

          // Make insensitive if applicable.
          if( self.config.insensitive ) {

            token = token.toLowerCase();
            value = value.toLowerCase();

          }

          // Determine the index of the token.
          const index = {
            word: !(new RegExp(`[a-z0-9_'-]+${token}|${token}[a-z0-9_'-]+`, 'i')).test(value) && value.indexOf(token) > -1,
            match: value.indexOf(token),
            start: 0,
            end: value.length - 1
          };

          // Get token location, distance, and similarity.
          location = index.match;
          distance = location - self.config.location;
          similarity = compareTwoStrings(token, value);

          // Calculate threshold.
          threshold = location < 0 ? -1 : location / (self.config.threshold * self.config.distance);

          // Determine if the threshold and similarity meet configuration criteria.
          const criteria = {
            threshold: threshold >= 0 && threshold <= self.config.threshold,
            similarity: similarity >= self.config.similarity
          };

          // Initialize score.
          score = 0;

          // Calculate score.
          if( criteria.similarity && criteria.threshold ) score = similarity + index.word;
          if( criteria.similarity && !criteria.threshold ) score = similarity;
          if( !criteria.similarity && criteria.threshold ) score = (1 - threshold) + index.word;

        }

        // Return result.
        return {
          location,
          distance,
          score
        };

       },

      // Calculate the score of some index value against a query.
      score( query, value ) {

        // Initialize the score.
        let score = 0;

        // Get tokens.
        let tokens = this.tokenize(query);

        // Calculate token scores.
        tokens = tokens.map((tokens) => {

          // Get the score for each token.
          const scores = tokens.map((token) => this.calc(token, value));

          // Get average scores.
          scores.average = _.sum(_.map(scores, 'score')) / scores.length;

          // Get weighted scores.
          scores.weighted = scores.average * tokens.weight;

          // Return scores.
          return scores;

        });

        // Return the weighted score.
        return _.sum(_.map(tokens, 'weighted')) / tokens.length;

      },

      // Sort data on a key.
      sort( data, key, order = 'DESC' ) {

        // Sort the data.
        let sorted = _.sortBy(data, key);

        // Apply sort order.
        if( order == 'DESC' ) sorted = _.reverse(sorted);

        // Return sorted data.
        return sorted;

      }

    };

    // Initialize state.
    this.searched = false;
    this.filtered = false;
    this.sorted = false;

    // Initialize event listeners.
    this.listeners = {
      // Fired when searching is first initiated.
      searching: [],
      // Fired after a search is completed.
      searched: [],
      // Fired when a search is cleared.
      unsearched: [],
      // Fired when filtering is first initiatied.
      filtering: [],
      // Fired when a filter is applied.
      filtered: [],
      // Fired when all filters are removed.
      unfiltered: [],
      // Fired when sorting is first initiated.
      sorting: [],
      // Fired when a sort is applied.
      sorted: [],
      // Fired when all sorted is removed.
      unsorted: [],
      // Fired when any errors are thrown.
      error: []
    };

    // Initialize errors.
    this.errors = [];

    // Initialize index.
    this.index = _.isArray(index) ? this.utils.reference(index) : this.utils.index(index);

    // Initialize data.
    this.reset();

  }

  // Reset the data back to the index.
  reset() {

    // Reset the data.
    this.data = _.cloneDeep(this.index);

    // Make the method chainable.
    return this;

  }

  // Add an event listener.
  on( events, callback ) {

    // Ignore invalid callbacks.
    if( _.isFunction(callback) ) {

      // Register the callback for each event.
      events.split(' ').forEach((event) => this.listeners[event].push(callback));

    }

    // Make the method chainable.
    return this;

  }

  // Remove an event listener.
  off( events, callback ) {

    // Ignore invalid callbacks.
    if( _.isFunction(callback) ) {

      // Unregister the callback for each event.
      events.split(' ').forEach((event) => _.remove(this.listeners[event], (_callback) => callback == _callback));

    }

    // Make the method chainable.
    return this;

  }

  // Trigger some event(s).
  trigger( events, ...data ) {

    // Get all callbacks.
    const callbacks = _.reduce(this.listeners, (result, callbacks, event) => {

      // Capture event callbacks.
      if( events.split(' ').includes(event) ) result = result.concat(callbacks);

      // Continue.
      return result;

    }, []);

    // Fire all callbacks.
    callbacks.forEach((callback) => callback(...data));

    // Make the method chainable.
    return this;

  }

  // Throw an error.
  error( error ) {

    // Trigger the error event.
    this.trigger('error', error);

    // Call the error callback.
    if( this.config.callbacks.error ) this.config.callbacks.error.call(this, error);

    // Make the method chainable.
    return this;

  }

  // Sort the data.
  sort( key, order = 'DESC' ) {

    // Trigger the sort event.
    this.trigger('sorting', {key, order});

    // Set the sort flag.
    this.sorted = true;

    // Capture the unsorted data.
    const unsorted = _.cloneDeepOwn(this.data);

    // Sort the data.
    this.data = this.utils.sort(this.data, key, order);

    // Initialize unsorted data.
    this.data.__unsorted = unsorted.__unsorted || [];

    // Get the index for the unsorted data.
    let index = _.findIndex(this.data.__unsorted, (item) => item.key == key);

    // Handle unsorted data without an index.
    if( index === -1 ) index = this.data.__unsorted.length > 0 ? this.data.__unsorted.length : 0;

    // Save the unsorted data.
    this.data.__unsorted[index] = {key, order, data: unsorted};

    // Trigger the sorted event.
    this.trigger('sorted', this.data, {key, order});

    // Call the sort callback.
    if( this.config.callbacks.sort ) this.config.callbacks.sort.call(this, this.data);

    // Make the method chainable.
    return this;

  }

  // Unsort the data.
  unsort( key ) {

    // Reset the sort flag.
    this.sorted = false;

    // Unsort by key.
    if( key && _.get(this.data, '__unsorted') ) {

      // Get the unsorted data.
      const unsorted = _.get(this.data, '__unsorted');

      // Get the unsorted data by key.
      const data = _.filter(unsorted, {key});

      // Unsort the data.
      this.data = data.data;

      // Remove all the unsorted data after it.
      this.data.__unsorted = _.slice(unsorted, 0, _.findIndex(unsorted, data));

      // Delete any unsorted data if none left.
      if( this.data.__unsorted.length === 0 ) delete this.data.__unsorted;

    }

    // Otherwise, unsort all data.
    else {

      // Unsort the data.
      this.data = _.get(this.data, '__unsorted[0].data', this.data);

      // Delete any unsorted data.
      delete this.data.__unsorted;

    }

    // Trigger the unsorted event.
    this.trigger('unsorted', this.data);

    // Call the sort callback.
    if( this.config.callbacks.sort ) this.config.callbacks.sort.call(this, this.data);

    // Make this method chainable.
    return this;

  }

  // Filter the data.
  filter( ...filters ) {

    // Extract only valid filters.
    filters = _.filter(filters, (filter) => _.isFunction(filter));

    // Make sure at least one filter was given.
    if( filters.length === 0 ) return this.error({
      process: 'filter',
      message: 'No filter methods were given.'
    });

    // Trigger filter event.
    this.trigger('filter', {filters});

    // Set the filter flag.
    this.filtered = true;

    // Capture unfiltered data.
    const unfiltered = _.cloneDeep(this.data);

    // Apply filters to the data.
    const filtered = _.filter(this.data, (item) => {

      // Return all items that passes all filters.
      return _.every(filters.map((filter) => filter(item)), (result) => result === true);

    });
    const filteredout = _.filter(this.data, (item) => {

      // Return all items that failed one or more filters.
      return _.every(filters.map((filter) => filter(item)), (result) => result !== true);

    });

    // Save filtered data.
    this.data = filtered;

    // Save unfiltered.
    this.data.__unfiltered = unfiltered;

    // Trigger filtered event.
    this.trigger('filtered', filtered, filteredout, {filters});

    // Call the filter callback.
    if( this.config.callbacks.filter ) this.config.callbacks.filter.call(this, this.data);

    // Make the method chainable.
    return this;

  }

  // Unfilter the data.
  unfilter( ) {

    // Reset the filter flag.
    this.filtered = false;

    // Unfilter the data.
    this.data = _.get(this.data, '__unfiltered'. this.data);

    // Delete any unfiltered data.
    delete this.data.__unfiltered;

    // Trigger the unfiltered event.
    this.trigger('unfiltered', this.data);

    // Call the filter callback.
    if( this.config.callbacks.filter ) this.config.callbacks.filter.call(this, this.data);

    // Make the method chainable.
    return this;

  }

  // Search data for a given query, optionally limiting the keys that are searched.
  search( query, keys = [] ) {

    // Trigger searching event.
    this.trigger('searching', {query, keys});

    // Ignore searches that don't match the minimum character length.
    if( query.length < this.config.chars ) return this.unsearch();

    // Set searched flag.
    this.searched = true;

    // Capture unsearched data.
    const unsearched = _.cloneDeepOwn(this.data);

    // Score all index items across given keys or all keys if none are given.
    const scored = this.index.map((item) => {

      // Get a subset of searchable fields.
      const searchable = _.reduce(item, (result, value, key) => {

        // Capture searchable fields.
        if( key.indexOf('__') !== 0 ) {

          // Limit by keys.
          if( !_.isEmpty(keys) ) {

            // Make sure the key exists.
            const _keys = _.reduce(keys, (_keys, _key) => {

              // Determine if keys given in dot notation exist.
              if( (_key.indexOf('.') > -1 || _key.indexOf('[') > -1) && _.isObject(value) ) {

                // Check to see if the current key matches and the rest of the keys can be found.
                _keys[_key] = _key.split('.')[0] && _.get(value, _key.split('.').slice(1));

              }

              // Otherwise, check to see if the keys match.
              _keys[_key] = _key == key;

              // Continue.
              return _keys;

            }, {});

            // Find any searchable field.
            if( Object.values(_keys).includes(true) ) result[key] = value;

          }

          // Otherwise, use all keys available.
          else result[key] = value;

        }

        // Reduce.
        return result;

      }, {});

      // Get weighted scores for all fields.
      item.__results = _.reduce(searchable, (result, value, key) => {

        // Get the field's score.
        result[key] = this.utils.score(query, value);

        // Reduce.
        return result;

      }, {});

      // Get weighted average of all scores.
      item.__score = _.sum(Object.values(item.__results)) / Object.values(item.__results).length;

      // Return scores.
      return item;

    });

    // Get nonresults (score = 0) and results (score > 0).
    let nonresults = _.filter(scored, {__score: 0});
    let results = _.filter(scored, (result) => result.__score > 0);

    // Sort the results in descending order based on score.
    if( this.config.sort ) results = this.utils.sort(results, '__score', 'DESC');

    // Remove scoring if not enabled and not in debug mode.
    if( !this.config.scoring && !this.config.debug ) {

      // Delete scoring data from results.
      delete results.__score;
      delete results.__results;

      // Delete scoring data from nonresults.
      delete nonresults.__score;
      delete nonresults.__results;

    }

    // Trigger searched event.
    this.trigger('searched', results, nonresults, {query, keys});

    // Call the sort callback.
    if( this.config.sort && this.config.callbacks.sort ) this.config.callbacks.sort.call(this, results);

    // Call the search callback.
    if( this.config.callbacks.search ) this.config.callbacks.search.call(this, results, nonresults);

    // Save results data.
    this.data = results;

    // Initialize unsearched data.
    this.data.__unsearched = unsearched.__unsearched || [];

    // Delete any unsearched data.
    delete unsearched.__unsearched;

    // Save unsearched data.
    if( this.data.__unsearched.length === 0 ) this.data.__unsearched = unsearched;

    // Make the method chainable.
    return this;

  }

  // Unsearch the data.
  unsearch( ) {

    // Reset the search flag.
    this.searched = false;

    // Unsearch the data.
    this.data = _.get(this.data, '__unsearched', this.data);

    // Delete any unsearched data.
    delete this.data.__unsearched;

    // Delete any score data.
    delete this.data.__score;
    delete this.data.__results;

    // Trigger the unsearched event.
    this.trigger('unsearched', this.data);

    // Call the search callback.
    if( this.config.callbacks.search ) this.config.callbacks.search.call(this, this.data, []);

    // Make the method chainable.
    return this;

  }

  // Populate a list element with the index items.
  populate( list, options = {
    template: '<li>:data</li>',
    props: {}
  } ) {

    // Find template parameters.
    const params = options.template.match(/:[a-z0-9\.\[\]]+/ig);

    // Create the list of elements.
    $(list).append(this.data.map((item, i) => {

      // Get the template.
      let template = options.template;

      // Bind template parameters.
      params.forEach((param) => template = template.replace(param, _.get(item, param.substring(1))));

      // Create the element.
      const $el = this.index[i].__el = item.__el = $(template, options.props);

      // Return the element.
      return $el;

    }));

    // Make the method chainable.
    return this;

  }

}

// Export globals.
global._ = _;
global.Vue = Vue;
global.Events = Events;
global.Components = Components;
global.Leaflet = global.L = L;
global.jQuery = global.$ = $;
global.EUL = EUL;
