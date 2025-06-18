export function initSearch(app) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(app, e.target.value);
            }, 300);
        });
    }
}

async function performSearch(app, query) {
    if (!query.trim()) {
        showAllComponents();
        return;
    }
    
    try {
        const response = await fetch(`api/search.php?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        app.showToast('Search failed.', 'error');
    }
}

function showAllComponents() {
    document.querySelectorAll('nav a.component-link').forEach(link => {
        link.parentElement.style.display = 'block';
    });

    document.querySelectorAll('nav div[id*="-"][class*="ml-4"]').forEach(contentDiv => {
        if (!contentDiv.classList.contains('hidden')) { // only affect currently visible subcategories
            const toggleButton = document.querySelector(`button.subcategory-toggle[data-target="${contentDiv.id}"]`);
            if (toggleButton) {
                toggleButton.querySelector('svg').style.transform = 'rotate(180deg)';
            }
        }
    });
}

function displaySearchResults(results) {
    const allLinks = document.querySelectorAll('nav a.component-link');
    allLinks.forEach(link => {
        link.parentElement.style.display = 'none';
    });

    document.querySelectorAll('nav div[id*="-"][class*="ml-4"]').forEach(contentDiv => {
        contentDiv.classList.add('hidden');
        const toggleButton = document.querySelector(`button.subcategory-toggle[data-target="${contentDiv.id}"]`);
        if (toggleButton) {
            toggleButton.querySelector('svg').style.transform = 'rotate(0deg)';
        }
    });

    results.forEach(result => {
        const link = document.querySelector(
            `a.component-link[data-category="${result.category}"][data-subcategory="${result.subcategory}"][data-component="${result.component}"]`
        );
        if (link) {
            link.parentElement.style.display = 'block';
            const subcategoryId = `${result.category}-${result.subcategory}`;
            const subcategoryContentDiv = document.getElementById(subcategoryId);
            if (subcategoryContentDiv) {
                subcategoryContentDiv.classList.remove('hidden');
                const toggleButton = document.querySelector(`button.subcategory-toggle[data-target="${subcategoryId}"]`);
                if (toggleButton) {
                    toggleButton.querySelector('svg').style.transform = 'rotate(180deg)';
                }
            }
        }
    });
}