/**
 * Favorites management for Tailwind UI Viewer
 */
import { safeLocalStorageSetItem, safeLocalStorageGetItem } from './utils.js';

/**
 * Initializes the favorites system.
 * Loads favorites from localStorage, renders the list, updates star icons,
 * and sets up event listeners for toggling favorites.
 * @param {object} app - The main application instance.
 */
export function initFavorites(app) {
    // Favorites are already loaded into app.favorites by loadSettingsFromLocalStorage
    // If not, load them here:
    // const storedFavorites = safeLocalStorageGetItem('favoriteComponents', '[]');
    // try {
    //     app.favorites = JSON.parse(storedFavorites);
    // } catch (e) {
    //     console.error("Failed to parse favorites from localStorage in initFavorites", e);
    //     app.favorites = [];
    // }

    renderFavoritesList(app);
    updateFavoriteStarIcons(app);

    // Event listener for favorite toggles (using event delegation on a parent)
    // This listener should ideally be specific enough not to interfere with component links.
    // Attaching to 'nav.p-4' might be too broad if other clickable items exist there.
    // A more specific container for component lists or direct binding might be better if issues arise.
    const sidebarNav = document.querySelector('div.flex-1.overflow-y-auto nav.p-4'); // More specific parent
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            const toggleButton = e.target.closest('.favorite-toggle');
            if (toggleButton) {
                e.preventDefault(); // Prevent default action if the star is inside an <a>
                e.stopPropagation(); // Stop propagation to prevent other listeners (like component link navigation)

                const category = toggleButton.dataset.category;
                const subcategory = toggleButton.dataset.subcategory;
                const componentSlug = toggleButton.dataset.componentSlug;

                if (category && subcategory && componentSlug) {
                    toggleFavorite(app, category, subcategory, componentSlug);
                } else {
                    console.warn('Favorite toggle clicked without complete data attributes.');
                }
            }
        });
    }
}

/**
 * Toggles a component's favorite status.
 * @param {object} app - The main application instance.
 * @param {string} category - The component's category.
 * @param {string} subcategory - The component's subcategory.
 * @param {string} componentSlug - The component's slug.
 */
export function toggleFavorite(app, category, subcategory, componentSlug) {
    const identifier = `${category}/${subcategory}/${componentSlug}`;
    const index = app.favorites.indexOf(identifier);

    if (index > -1) {
        app.favorites.splice(index, 1); // Remove from favorites
    } else {
        app.favorites.push(identifier); // Add to favorites
    }

    safeLocalStorageSetItem('favoriteComponents', JSON.stringify(app.favorites));
    renderFavoritesList(app);
    updateFavoriteStarIcons(app); // Update all stars, including the one in the main list
}

/**
 * Renders the list of favorite components in the sidebar.
 * @param {object} app - The main application instance.
 */
export function renderFavoritesList(app) {
    const favoritesListContent = document.getElementById('favorites-list-content');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    if (!favoritesListContent || !noFavoritesMessage) {
        // console.warn("Favorites list container or message element not found.");
        return;
    }

    // Clear only dynamically added favorite items (divs with class 'flex')
    Array.from(favoritesListContent.querySelectorAll('div.flex.items-center.justify-between')).forEach(favItemDiv => favItemDiv.remove());

    if (app.favorites.length === 0) {
        noFavoritesMessage.classList.remove('hidden');
    } else {
        noFavoritesMessage.classList.add('hidden');
        app.favorites.forEach(identifier => {
            const [cat, subcat, slug] = identifier.split('/');
            let componentName = slug; // Default to slug
            // Attempt to find the component's display name from the main component tree links
            const originalLink = document.querySelector(`.component-link[data-category="${cat}"][data-subcategory="${subcat}"][data-component="${slug}"]`);
            if (originalLink) {
                // Get text content, excluding potential nested elements like the star icon itself if it were inside
                componentName = originalLink.cloneNode(true).childNodes[0].textContent.trim() || slug;
            }

            const div = document.createElement('div');
            div.className = 'flex items-center justify-between group'; // Ensure this matches querySelectorAll

            const link = document.createElement('a');
            // Construct URL carefully, ensuring app.currentTheme and app.currentBreakpoint are available
            link.href = `?category=${cat}&subcategory=${subcat}&component=${slug}&theme=${app.currentTheme || 'light'}&breakpoint=${app.currentBreakpoint || 'desktop'}`;
            link.className = 'component-link flex-grow text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded';
            link.dataset.category = cat;
            link.dataset.subcategory = subcat;
            link.dataset.component = slug; // Use 'component' to match main list links for consistency
            link.textContent = componentName;

            const starButton = document.createElement('button');
            // Class list should reflect it's a favorite, so filled star
            starButton.className = 'favorite-toggle p-1 rounded-md text-yellow-500 dark:text-yellow-400';
            starButton.dataset.category = cat;
            starButton.dataset.subcategory = subcat;
            starButton.dataset.componentSlug = slug;
            starButton.title = "Toggle favorite";
            starButton.innerHTML = `
                <svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.671a1 1 0 00.95.69h5.969c.969 0 1.371 1.24.588 1.81l-4.828 3.522a1 1 0 00-.364 1.118l1.846 5.671c.3.921-.755 1.688-1.54 1.118l-4.828-3.522a1 1 0 00-1.176 0l-4.828 3.522c-.784.57-1.838-.197-1.539-1.118l1.846-5.671a1 1 0 00-.364-1.118L2.28 11.1c-.783-.57-.38-1.81.588-1.81h5.969a1 1 0 00.95-.69L11.049 2.927z"></path>
                </svg>`;

            div.appendChild(link);
            div.appendChild(starButton);
            favoritesListContent.appendChild(div);
        });
    }
}

/**
 * Updates the visual state (filled/empty star) of all favorite toggle icons on the page.
 * @param {object} app - The main application instance.
 */
export function updateFavoriteStarIcons(app) {
    document.querySelectorAll('.favorite-toggle').forEach(button => {
        const category = button.dataset.category;
        const subcategory = button.dataset.subcategory;
        const componentSlug = button.dataset.componentSlug;
        const identifier = `${category}/${subcategory}/${componentSlug}`;
        const starSvg = button.querySelector('svg');

        if (app.favorites.includes(identifier)) {
            starSvg.setAttribute('fill', 'currentColor');
            button.classList.add('text-yellow-500', 'dark:text-yellow-400');
            button.classList.remove('text-gray-400', 'opacity-0', 'group-hover:opacity-100', 'focus:opacity-100'); // Ensure always visible if favorited
        } else {
            starSvg.setAttribute('fill', 'none');
            button.classList.add('text-gray-400');
            // For non-favorited stars in the main list, restore hover/focus visibility from original HTML
            if (button.closest('#favorites-list-content')) { // Stars in favorites list are always visible
                 button.classList.remove('text-yellow-500', 'dark:text-yellow-400');
            } else { // Stars in the main component tree
                 button.classList.remove('text-yellow-500', 'dark:text-yellow-400');
                 button.classList.add('opacity-0', 'group-hover:opacity-100', 'focus:opacity-100');
            }
        }
    });
}
