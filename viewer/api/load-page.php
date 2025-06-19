<?php
require_once '../includes/functions.php';

// Set JSON header
header('Content-Type: application/json');

// Get parameters
$pageId = $_GET['id'] ?? '';

// Validate parameters
if (empty($pageId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing page ID']);
    exit;
}

try {
    // Load the page
    $page = loadPage($pageId);
    
    if (!$page) {
        http_response_code(404);
        echo json_encode(['error' => 'Page not found']);
        exit;
    }
    
    // Return page data
    echo json_encode([
        'success' => true,
        'page' => $page
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>