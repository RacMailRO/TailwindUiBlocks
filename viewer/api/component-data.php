<?php
require_once '../includes/functions.php';

// Set JSON header
header('Content-Type: application/json');

// Get parameters
$category = $_GET['category'] ?? '';
$subcategory = $_GET['subcategory'] ?? '';
$component = $_GET['component'] ?? '';

// Validate parameters
if (empty($category) || empty($subcategory) || empty($component)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

try {
    // Load component data
    $componentData = getComponent($category, $subcategory, $component);
    
    if (!$componentData) {
        http_response_code(404);
        echo json_encode(['error' => 'Component not found']);
        exit;
    }
    
    // Return component data
    echo json_encode([
        'success' => true,
        'component' => $componentData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>