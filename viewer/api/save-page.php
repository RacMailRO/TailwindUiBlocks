<?php
require_once '../includes/functions.php';

// Set JSON header
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$pageData = json_decode($input, true);

// Validate input
if (!$pageData) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$requiredFields = ['name', 'structure'];
foreach ($requiredFields as $field) {
    if (!isset($pageData[$field]) || empty($pageData[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

// Set defaults
$pageData['category'] = $pageData['category'] ?? 'landing-pages';
$pageData['tags'] = $pageData['tags'] ?? [];
$pageData['author'] = $pageData['author'] ?? 'Page Builder User';
$pageData['version'] = $pageData['version'] ?? '1.0.0';

// Generate ID if not provided
if (!isset($pageData['id']) || empty($pageData['id'])) {
    $pageData['id'] = 'page-' . time() . '-' . substr(md5(uniqid()), 0, 8);
}

// Generate slug from name if not provided
if (!isset($pageData['slug']) || empty($pageData['slug'])) {
    $pageData['slug'] = sanitizeSlug($pageData['name']);
}

// Set timestamps
$pageData['updated'] = date('Y-m-d');
if (!isset($pageData['created'])) {
    $pageData['created'] = date('Y-m-d');
}

try {
    // Save the page
    $result = savePage($pageData);
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'Page saved successfully',
            'page' => $pageData,
            'path' => $result['path']
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => $result['error'] ?? 'Failed to save page'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>