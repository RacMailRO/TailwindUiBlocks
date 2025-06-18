<?php
/**
 * Component rendering API endpoint
 */

// Include helper functions
include_once '../includes/functions.php';

// Get parameters
$category = $_GET['category'] ?? '';
$subcategory = $_GET['subcategory'] ?? '';
$component = $_GET['component'] ?? '';
$theme = $_GET['theme'] ?? 'light';

// Get component data
$componentData = getComponent($category, $subcategory, $component);

if (!$componentData) {
    http_response_code(404);
    echo '<div class="p-8 text-center text-gray-500">Component not found</div>';
    exit;
}

// Generate preview HTML
$previewHTML = generateComponentPreview($componentData, $theme);
$sampleData = getSampleData();

?><!DOCTYPE html>
<html lang="en" class="<?php echo $theme === 'dark' ? 'dark' : ''; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Inter', system-ui, sans-serif;
        }
        /* Custom scrollbar for dark mode */
        .dark ::-webkit-scrollbar {
            width: 6px;
        }
        .dark ::-webkit-scrollbar-track {
            background: #374151;
        }
        .dark ::-webkit-scrollbar-thumb {
            background: #6B7280;
            border-radius: 3px;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
        }
    </style>
</head>
<body class="bg-white dark:bg-gray-900 min-h-screen">
    <?php echo $previewHTML; ?>
    
    <script>
        // Add any component-specific JavaScript here
        document.addEventListener('DOMContentLoaded', function() {
            // Handle button clicks and interactions
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (!button.getAttribute('onclick') && !button.closest('[data-no-demo]')) {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        console.log('Button clicked:', button.textContent);
                    });
                }
            });
            
            // Handle form submissions
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('Form submitted');
                });
            });
            
            // Handle dropdown toggles
            const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');
            dropdownToggles.forEach(toggle => {
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = toggle.getAttribute('data-dropdown-toggle');
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.classList.toggle('hidden');
                    }
                });
            });
            
            // Handle modal toggles
            const modalToggles = document.querySelectorAll('[data-modal-toggle]');
            modalToggles.forEach(toggle => {
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = toggle.getAttribute('data-modal-toggle');
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.classList.toggle('hidden');
                    }
                });
            });
            
            // Handle tab switching
            const tabButtons = document.querySelectorAll('[data-tab]');
            tabButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tabId = button.getAttribute('data-tab');
                    
                    // Remove active state from all tabs
                    const tabGroup = button.closest('[data-tab-group]');
                    if (tabGroup) {
                        const allTabs = tabGroup.querySelectorAll('[data-tab]');
                        const allPanels = tabGroup.querySelectorAll('[data-tab-panel]');
                        
                        allTabs.forEach(tab => tab.classList.remove('active', 'bg-blue-600', 'text-white'));
                        allPanels.forEach(panel => panel.classList.add('hidden'));
                        
                        // Add active state to clicked tab
                        button.classList.add('active', 'bg-blue-600', 'text-white');
                        
                        // Show corresponding panel
                        const panel = document.getElementById(tabId);
                        if (panel) {
                            panel.classList.remove('hidden');
                        }
                    }
                });
            });
        });
    </script>
</body>
</html>