export function initFavorites(app) {
    const storedFavorites = app.safeLocalStorageGetItem('favoriteComponents', '[]');
    try {
        app.favorites = JSON.parse(storedFavorites);
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        app.favorites = [];
    }
    renderFavoritesList(app);
    updateFavoriteStarIcons(app);

    const sidebarNav = document.querySelector('nav.p-4');
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            const toggleButton = e.target.closest('.favorite-toggle');
            if (toggleButton) {
                e.preventDefault();
                e.stopPropagation();
                const { category, subcategory, componentSlug } = toggleButton.dataset;
                toggleFavorite(app, category, subcategory, componentSlug);
            }
        });
    }
}

function toggleFavorite(app, category, subcategory, componentSlug) {
    const identifier = `${category}/${subcategory}/${componentSlug}`;
    const index = app.favorites.indexOf(identifier);

    if (index > -1) {
        app.favorites.splice(index, 1);
    } else {
        app.favorites.push(identifier);
    }

    app.safeLocalStorageSetItem('favoriteComponents', JSON.stringify(app.favorites));
    renderFavoritesList(app);
    updateFavoriteStarIcons(app);
}

function renderFavoritesList(app) {
    const favoritesListContent = document.getElementById('favorites-list-content');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    if (!favoritesListContent || !noFavoritesMessage) return;

    favoritesListContent.querySelectorAll('div.flex').forEach(item => item.remove());

    if (app.favorites.length === 0) {
        noFavoritesMessage.classList.remove('hidden');
    } else {
        noFavoritesMessage.classList.add('hidden');
        app.favorites.forEach(identifier => {
            const [cat, subcat, slug] = identifier.split('/');
            const originalLink = document.querySelector(`.component-link[data-category="${cat}"][data-subcategory="${subcat}"][data-component="${slug}"]`);
            const componentName = originalLink ? originalLink.textContent.trim() : slug;

            const div = document.createElement('div');
            div.className = 'flex items-center justify-between group';
            div.innerHTML = `
                <a href="?category=${cat}&subcategory=${subcat}&component=${slug}"
                   class="component-link flex-grow text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded"
                   data-category="${cat}" data-subcategory="${subcat}" data-component="${slug}">${componentName}</a>
                <button class="favorite-toggle p-1 rounded-md text-yellow-500" data-category="${cat}" data-subcategory="${subcat}" data-component-slug="${slug}" title="Toggle favorite">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.671a1 1 0 00.95.69h5.969c.969 0 1.371 1.24.588 1.81l-4.828 3.522a1 1 0 00-.364 1.118l1.846 5.671c.3.921-.755 1.688-1.54 1.118l-4.828-3.522a1 1 0 00-1.176 0l-4.828 3.522c-.784.57-1.838-.197-1.539-1.118l1.846-5.671a1 1 0 00-.364-1.118L2.28 11.1c-.783-.57-.38-1.81.588-1.81h5.969a1 1 0 00.95-.69L11.049 2.927z"></path></svg>
                </button>`;
            favoritesListContent.appendChild(div);
        });
    }
}

function updateFavoriteStarIcons(app) {
    document.querySelectorAll('.favorite-toggle').forEach(button => {
        const { category, subcategory, componentSlug } = button.dataset;
        const identifier = `${category}/${subcategory}/${componentSlug}`;
        const starSvg = button.querySelector('svg');

        if (app.favorites.includes(identifier)) {
            starSvg.setAttribute('fill', 'currentColor');
            button.classList.add('text-yellow-500', 'dark:text-yellow-400');
            button.classList.remove('text-gray-400');
        } else {
            starSvg.setAttribute('fill', 'none');
            button.classList.add('text-gray-400');
            button.classList.remove('text-yellow-500', 'dark:text-yellow-400');
        }
    });
}