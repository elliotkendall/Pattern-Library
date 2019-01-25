<?php

// Autoload classes.
include 'classes/autoload.php';

// Set header.
header('Content-Type: image/svg+xml; charset=utf-8');

// Get all parameters.
$params = $_GET;

// Get the selected icon.
$icon = $params['id'];

// Load the icon set.
$icons = new Icons();

// Get the selected icon.
$icon = $icons->{$icon};

// Verify that icon exists.
if( $icon ) {
  
  // Get icon mods.
  unset($params['id']);
  
  // Allow the icon to be modified.
  foreach( $params as $mod => $args ) {
    
    // Modify the icon by passing array arguments.
    if( is_array($args) ) $icon->{$mod}(...array_values($args));
    
    // Otherwise, modify the icon by passing simple arguments.
    else $icon->{$mod}($args);
    
  }
  
  // Return the icon SVG.
  echo $icon->svg;
  
}

?>