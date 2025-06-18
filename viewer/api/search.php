<?php
/**
 * Component search API endpoint
 */

header('Content-Type: application/json');

// Include helper functions
include_once '../includes/functions.php';

// Get search query
$query = $_GET['q'] ?? '';

if (empty($query)) {
    echo json_encode([]);
    exit;
}

// Perform search
$results = searchComponents($query);

// Return results
echo json_encode($results);
?>