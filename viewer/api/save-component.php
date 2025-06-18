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
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$required = ['category', 'subcategory', 'slug', 'code', 'metadata'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

$category = $input['category'];
$subcategory = $input['subcategory'];
$slug = $input['slug'];
$code = $input['code'];
$metadata = $input['metadata'];

// Validate category and subcategory
$validCategories = ['marketing', 'application-ui', 'ecommerce'];
$validSubcategories = [
    'marketing' => ['heroes', 'features', 'cta', 'testimonials', 'pricing'],
    'application-ui' => ['forms', 'navigation', 'data-display', 'feedback', 'overlays'],
    'ecommerce' => ['product-display', 'shopping-cart', 'checkout', 'reviews']
];

if (!in_array($category, $validCategories)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid category']);
    exit;
}

if (!in_array($subcategory, $validSubcategories[$category])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid subcategory for the selected category']);
    exit;
}

// Validate slug
if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid slug. Use only lowercase letters, numbers, and hyphens.']);
    exit;
}

try {
    // Create component directory structure
    $componentsDir = dirname(__DIR__, 2) . '/components';
    $componentPath = "$componentsDir/$category/$subcategory/$slug";
    
    if (!file_exists($componentPath)) {
        if (!mkdir($componentPath, 0755, true)) {
            throw new Exception('Failed to create component directory');
        }
    }
    
    // Save component HTML
    $htmlFile = "$componentPath/component.html";
    if (file_put_contents($htmlFile, $code) === false) {
        throw new Exception('Failed to save component HTML');
    }
    
    // Prepare metadata
    $metadataToSave = [
        'name' => $metadata['name'],
        'description' => $metadata['description'],
        'category' => $category,
        'subcategory' => $subcategory,
        'tags' => $metadata['tags'] ?? [],
        'responsive' => $metadata['responsive'] ?? true,
        'darkMode' => $metadata['darkMode'] ?? true,
        'dependencies' => $metadata['dependencies'] ?? ['tailwindcss'],
        'version' => $metadata['version'] ?? '1.0.0',
        'author' => $metadata['author'] ?? 'TailwindUI Blocks',
        'created' => date('Y-m-d H:i:s'),
        'updated' => date('Y-m-d H:i:s')
    ];
    
    // Save metadata
    $metadataFile = "$componentPath/metadata.json";
    if (file_put_contents($metadataFile, json_encode($metadataToSave, JSON_PRETTY_PRINT)) === false) {
        throw new Exception('Failed to save component metadata');
    }
    
    // Create variants directory if it doesn't exist
    $variantsDir = "$componentPath/variants";
    if (!file_exists($variantsDir)) {
        mkdir($variantsDir, 0755, true);
    }
    
    // Create examples directory if it doesn't exist
    $examplesDir = "$componentPath/examples";
    if (!file_exists($examplesDir)) {
        mkdir($examplesDir, 0755, true);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Component saved successfully',
        'component' => [
            'category' => $category,
            'subcategory' => $subcategory,
            'slug' => $slug,
            'path' => $componentPath
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to save component: ' . $e->getMessage()
    ]);
}
?>