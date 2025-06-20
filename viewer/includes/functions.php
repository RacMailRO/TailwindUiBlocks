<?php
/**
 * Helper functions for Tailwind UI Blocks Viewer
 */

/**
 * Get the complete component tree structure
 */
function getComponentTree() {
    $componentsDir = dirname(__DIR__, 2) . '/components';
    $tree = [];
    
    if (!is_dir($componentsDir)) {
        return $tree;
    }
    
    $categories = scandir($componentsDir);
    foreach ($categories as $category) {
        if ($category === '.' || $category === '..' || !is_dir($componentsDir . '/' . $category)) {
            continue;
        }
        
        $categoryPath = $componentsDir . '/' . $category;
        $subcategories = scandir($categoryPath);
        
        foreach ($subcategories as $subcategory) {
            if ($subcategory === '.' || $subcategory === '..' || !is_dir($categoryPath . '/' . $subcategory)) {
                continue;
            }
            
            $subcategoryPath = $categoryPath . '/' . $subcategory;
            $components = scandir($subcategoryPath);
            
            foreach ($components as $component) {
                if ($component === '.' || $component === '..' || !is_dir($subcategoryPath . '/' . $component)) {
                    continue;
                }
                
                $componentPath = $subcategoryPath . '/' . $component;
                $metadataFile = $componentPath . '/metadata.json';
                
                if (file_exists($metadataFile)) {
                    $metadata = json_decode(file_get_contents($metadataFile), true);
                    $tree[$category][$subcategory][] = [
                        'slug' => $component,
                        'name' => $metadata['name'] ?? ucfirst(str_replace('-', ' ', $component)),
                        'path' => $componentPath
                    ];
                }
            }
        }
    }
    
    return $tree;
}

/**
 * Get a specific component data
 */
function getComponent($category, $subcategory, $component) {
    $componentsDir = dirname(__DIR__, 2) . '/components';
    $componentPath = $componentsDir . '/' . $category . '/' . $subcategory . '/' . $component;
    
    if (!is_dir($componentPath)) {
        return null;
    }
    
    $data = [
        'path' => $componentPath,
        'slug' => $component,
        'category' => $category,
        'subcategory' => $subcategory
    ];
    
    // Load metadata
    $metadataFile = $componentPath . '/metadata.json';
    if (file_exists($metadataFile)) {
        $data['metadata'] = json_decode(file_get_contents($metadataFile), true);
    } else {
        $data['metadata'] = [
            'name' => ucfirst(str_replace('-', ' ', $component)),
            'description' => 'A beautiful Tailwind CSS component',
            'category' => $category,
            'subcategory' => $subcategory
        ];
    }
    
    // Load component HTML
    $componentFile = $componentPath . '/component.html';
    if (file_exists($componentFile)) {
        $data['html'] = file_get_contents($componentFile);
    }
    
    // Load variants
    $variantsDir = $componentPath . '/variants';
    if (is_dir($variantsDir)) {
        $variants = scandir($variantsDir);
        foreach ($variants as $variant) {
            if ($variant === '.' || $variant === '..') continue;
            
            $variantFile = $variantsDir . '/' . $variant;
            if (is_file($variantFile)) {
                $variantName = pathinfo($variant, PATHINFO_FILENAME);
                $data['variants'][$variantName] = file_get_contents($variantFile);
            }
        }
    }

    // Load examples
    $examplesDir = $componentPath . '/examples';
    if (is_dir($examplesDir)) {
        $exampleFiles = scandir($examplesDir);
        $data['examples'] = [];
        foreach ($exampleFiles as $exampleFile) {
            if (pathinfo($exampleFile, PATHINFO_EXTENSION) === 'html') {
                $exampleFilePath = $examplesDir . '/' . $exampleFile;
                $exampleName = pathinfo($exampleFile, PATHINFO_FILENAME);
                // Convert kebab-case or snake_case to Title Case for example name
                $prettyName = ucwords(str_replace(['-', '_'], ' ', $exampleName));
                $data['examples'][] = [
                    'name' => $prettyName,
                    'slug' => $exampleName,
                    'html' => file_get_contents($exampleFilePath)
                ];
            }
        }
        // Sort examples by name if needed, for now, directory order
    }
    
    return $data;
}

/**
 * Search components by name or tags
 */
function searchComponents($query) {
    $components = getComponentTree();
    $results = [];
    $query = strtolower($query);
    
    foreach ($components as $category => $subcategories) {
        foreach ($subcategories as $subcategory => $items) {
            foreach ($items as $item) {
                $component = getComponent($category, $subcategory, $item['slug']);
                if (!$component) continue;
                
                $searchText = strtolower($component['metadata']['name'] . ' ' . 
                             ($component['metadata']['description'] ?? '') . ' ' .
                             implode(' ', $component['metadata']['tags'] ?? []));
                
                if (strpos($searchText, $query) !== false) {
                    $results[] = [
                        'category' => $category,
                        'subcategory' => $subcategory,
                        'component' => $item['slug'],
                        'name' => $component['metadata']['name'],
                        'description' => $component['metadata']['description'] ?? ''
                    ];
                }
            }
        }
    }
    
    return $results;
}

/**
 * Get all available themes
 */
function getThemes() {
    return [
        'light' => 'Light Mode',
        'dark' => 'Dark Mode'
    ];
}

/**
 * Get all available breakpoints
 */
function getBreakpoints() {
    return [
        'mobile' => ['name' => 'Mobile', 'width' => 375],
        'tablet' => ['name' => 'Tablet', 'width' => 768],
        'desktop' => ['name' => 'Desktop', 'width' => 1200]
    ];
}

/**
 * Sanitize component HTML for safe rendering
 */
function sanitizeComponentHTML($html) {
    // Remove any script tags for security
    $html = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $html);
    
    // Remove any dangerous attributes
    $html = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/', '', $html);
    
    return $html;
}
/**
 * Page Builder Functions
 */

/**
 * Load a page by ID
 */
function loadPage($pageId) {
    $pagesDir = dirname(__DIR__, 2) . '/pages';
    
    // Look for the page in all categories
    $categories = ['landing-pages', 'product-pages', 'about-pages', 'templates'];
    
    foreach ($categories as $category) {
        $categoryPath = $pagesDir . '/' . $category;
        if (!is_dir($categoryPath)) continue;
        
        $pages = scandir($categoryPath);
        foreach ($pages as $page) {
            if ($page === '.' || $page === '..' || !is_dir($categoryPath . '/' . $page)) {
                continue;
            }
            
            $pageFile = $categoryPath . '/' . $page . '/page.json';
            if (file_exists($pageFile)) {
                $pageData = json_decode(file_get_contents($pageFile), true);
                if ($pageData && $pageData['id'] === $pageId) {
                    $pageData['category'] = $category;
                    $pageData['slug'] = $page;
                    return $pageData;
                }
            }
        }
    }
    
    return null;
}

/**
 * Get all pages organized by category
 */
function getPageTree() {
    $pagesDir = dirname(__DIR__, 2) . '/pages';
    $tree = [];
    
    if (!is_dir($pagesDir)) {
        return $tree;
    }
    
    $categories = scandir($pagesDir);
    foreach ($categories as $category) {
        if ($category === '.' || $category === '..' || !is_dir($pagesDir . '/' . $category)) {
            continue;
        }
        
        $categoryPath = $pagesDir . '/' . $category;
        $pages = scandir($categoryPath);
        
        foreach ($pages as $page) {
            if ($page === '.' || $page === '..' || !is_dir($categoryPath . '/' . $page)) {
                continue;
            }
            
            $pageFile = $categoryPath . '/' . $page . '/page.json';
            if (file_exists($pageFile)) {
                $pageData = json_decode(file_get_contents($pageFile), true);
                if ($pageData) {
                    $tree[$category][] = [
                        'id' => $pageData['id'],
                        'slug' => $page,
                        'name' => $pageData['name'] ?? ucfirst(str_replace('-', ' ', $page)),
                        'description' => $pageData['description'] ?? '',
                        'path' => $categoryPath . '/' . $page
                    ];
                }
            }
        }
    }
    
    return $tree;
}

/**
 * Save a page
 */
function savePage($pageData) {
    $pagesDir = dirname(__DIR__, 2) . '/pages';
    $category = $pageData['category'] ?? 'landing-pages';
    $slug = $pageData['slug'] ?? sanitizeSlug($pageData['name']);
    
    // Create directories if they don't exist
    $categoryPath = $pagesDir . '/' . $category;
    if (!is_dir($categoryPath)) {
        mkdir($categoryPath, 0755, true);
    }
    
    $pagePath = $categoryPath . '/' . $slug;
    if (!is_dir($pagePath)) {
        mkdir($pagePath, 0755, true);
    }
    
    // Save page.json
    $pageFile = $pagePath . '/page.json';
    $success = file_put_contents($pageFile, json_encode($pageData, JSON_PRETTY_PRINT));
    
    if ($success) {
        // Generate HTML version
        generatePageHTML($pageData, $pagePath);
        return ['success' => true, 'path' => $pagePath];
    }
    
    return ['success' => false, 'error' => 'Failed to save page'];
}

/**
 * Generate HTML from page structure
 */
function generatePageHTML($pageData, $pagePath) {
    $html = renderPageStructure($pageData['structure']);
    
    $fullHTML = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($pageData['name']) . '</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white dark:bg-gray-900">
' . $html . '
</body>
</html>';
    
    file_put_contents($pagePath . '/page.html', $fullHTML);
}

/**
 * Render page structure recursively
 */
function renderPageStructure($structure) {
    if (!isset($structure['children']) || !is_array($structure['children'])) {
        return '';
    }
    
    $html = '';
    foreach ($structure['children'] as $child) {
        if ($child['type'] === 'container') {
            $containerHTML = getComponent($child['category'], $child['subcategory'], $child['component']);
            if ($containerHTML && isset($containerHTML['html'])) {
                $html .= $containerHTML['html'];
            }
        } elseif ($child['type'] === 'component') {
            $componentHTML = getComponent($child['category'], $child['subcategory'], $child['component']);
            if ($componentHTML && isset($componentHTML['html'])) {
                $html .= $componentHTML['html'];
            }
        }
        
        // Recursively render children
        if (isset($child['children'])) {
            $childStructure = ['children' => $child['children']];
            $html .= renderPageStructure($childStructure);
        }
    }
    
    return $html;
}

/**
 * Sanitize a string to be used as a slug
 */
function sanitizeSlug($string) {
    $slug = strtolower(trim($string));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Delete a page
 */
function deletePage($pageId) {
    $page = loadPage($pageId);
    if (!$page) {
        return ['success' => false, 'error' => 'Page not found'];
    }
    
    $pagePath = dirname(__DIR__, 2) . '/pages/' . $page['category'] . '/' . $page['slug'];
    
    if (is_dir($pagePath)) {
        // Remove all files in the directory
        $files = array_diff(scandir($pagePath), ['.', '..']);
        foreach ($files as $file) {
            unlink($pagePath . '/' . $file);
        }
        
        // Remove the directory
        if (rmdir($pagePath)) {
            return ['success' => true];
        }
    }
    
    return ['success' => false, 'error' => 'Failed to delete page'];
}

/**
 * Generate component preview HTML with theme support
 */
function generateComponentPreview($component, $theme = 'light') {
    if (!$component || !isset($component['html'])) {
        return '<div class="p-8 text-center text-gray-500">Component not found</div>';
    }
    
    $html = $component['html'];
    
    // Apply theme-specific variant if available
    if ($theme === 'dark' && isset($component['variants']['dark'])) {
        $html = $component['variants']['dark'];
    }
    
    // Sanitize HTML
    $html = sanitizeComponentHTML($html);
    
    return $html;
}

/**
 * Get sample data for components
 */
function getSampleData() {
    return [
        'company' => 'Acme Corp',
        'title' => 'Build something amazing',
        'subtitle' => 'Create beautiful, responsive websites with our components',
        'description' => 'Our carefully crafted components help you build modern web applications faster than ever before.',
        'cta_text' => 'Get started',
        'cta_secondary' => 'Learn more',
        'features' => [
            [
                'title' => 'Fast Performance',
                'description' => 'Optimized for speed and efficiency',
                'icon' => 'lightning-bolt'
            ],
            [
                'title' => 'Responsive Design',
                'description' => 'Works perfectly on all devices',
                'icon' => 'device-mobile'
            ],
            [
                'title' => 'Easy to Use',
                'description' => 'Simple and intuitive interface',
                'icon' => 'heart'
            ]
        ],
        'testimonials' => [
            [
                'name' => 'Sarah Johnson',
                'role' => 'CEO, TechStart',
                'content' => 'These components saved us weeks of development time.',
                'avatar' => 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
            ],
            [
                'name' => 'Michael Chen',
                'role' => 'Designer, Creative Co',
                'content' => 'Beautiful designs that work out of the box.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'
            ]
        ],
        'stats' => [
            ['label' => 'Active Users', 'value' => '10,000+'],
            ['label' => 'Components', 'value' => '60+'],
            ['label' => 'Downloads', 'value' => '50,000+'],
            ['label' => 'Countries', 'value' => '120+']
        ]
    ];
}
?>