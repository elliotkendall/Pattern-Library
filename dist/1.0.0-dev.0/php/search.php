<?php

// Get the search query.
$query = $_GET['query'];

// Get the search parameter.
$param = $_GET['param'];

// Get the search URL.
$src = $_GET['service']['src'];

// Merge the search query into the URL by replacing the parameter.
$url = str_replace($param, $query, $src);

// Search.
header("Location: {$url}");

?>
