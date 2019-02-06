// Load dependencies.
const Clipboard = require('clipboard');
const Tippy = require('tippy.js');
const jQuery = require('jquery');
const $ = jQuery;

// Export globals.
global.jQuery = jQuery;
global.$ = $;

// Load libraries.
require('velocity-animate');

// Initialize Clipboard.
new Clipboard('.copy');

// Initialize Tippy.
Tippy('.copy', {
  trigger: 'manual',
  placement: 'bottom',
  arrow: true
});

// Setup tooltips for copy buttons.
$('.copy').each((i, copier) => {

  // Create tooptip events.
  $(copier)

  // Prompt users to copy by clicking.
  .on('mouseenter focus', () => {

    copier._tippy.setContent('Click to Copy');
    copier._tippy.show();
    $(copier).on('mouseleave blur', () => copier._tippy.hide());

  })

  // Let users know that the item was copied when clicked.
  .on('click', () => {

    $(copier).off('mouseleave blur');
    copier._tippy.setContent('Copied!');
    copier._tippy.show();
    $(copier._tippy.popper).addClass('-success');
    setTimeout(() => {
      $(copier._tippy.popper).removeClass('-success');
      copier._tippy.hide();
    }, 1000);

  });

});

// Create sample method for Button component.
Components.extend('button', {

  methods: {

    click() {

      // Shake the button.
      $(this.$el)
        .velocity({rotateZ: -5}, {duration: 100})
        .velocity({rotateZ: 5}, {duration: 100})
        .velocity({rotateZ: -5}, {duration: 100})
        .velocity({rotateZ: 5}, {duration: 100})
        .velocity({rotateZ: -5}, {duration: 100})
        .velocity({rotateZ: 5}, {duration: 100})
        .velocity({rotateZ: 0}, {duration: 100});

    }

  }

});

// Create sample method for Tab component.
Components.extend('tab', {

  data() {
    return {
      showing: false,
      tooltip: null,
      timeout: 2000
    };
  },

  methods: {

    click() {

      // See if the tooltip is showing.
      if( this.showing === false ) {

        // Show the tooltip.
        this.tooltip.show();

        // Set the flag.
        this.showing = true;

        // Automatically hide the tooltip.
        setTimeout(() => {

          // Hide the tooltip.
          this.tooltip.hide();

          // Reset the flag.
          this.showing = false;

        }, this.timeout);

      }

    }

  },

  mounted() {

    // Create a tooltip.
    this.tooltip = Tippy.one(this.$el, {
      content: 'This would do something when clicked...',
      placement: 'right',
      arrow: true,
      trigger: 'manual'
    });

  }

});

// Prevent errors by forcing Vue to ignore Pattern Lab data.
$('.sg-pattern-data').attr('v-pre', true);

// Initialize a Vue instance.
const PatternLibrary = new Vue({
  el: $('.sg-main')[0]
});
