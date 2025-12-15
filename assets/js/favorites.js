// Favorites Management with localStorage

console.log('💖 Favorites.js loaded');

// Storage key for favorites
const FAVORITES_KEY = 'islamabad_smart_city_favorites';

// Storage key for search history
const HISTORY_KEY = 'islamabad_smart_city_search_history';

/**
 * Get all favorites from localStorage
 * @returns {Array} Array of favorite facility IDs
 */
function getFavorites() {
    try {
        const favoritesJson = localStorage.getItem(FAVORITES_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
}

/**
 * Save favorites to localStorage
 * @param {Array} favorites - Array of favorite facility IDs
 */
function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        console.log(`💾 Saved ${favorites.length} favorites`);
    } catch (error) {
        console.error('Error saving favorites:', error);
        showNotification('Unable to save favorites', 'error');
    }
}

/**
 * Check if a facility is in favorites
 * @param {string} facilityId - Facility ID
 * @returns {boolean} True if favorite
 */
function isFavorite(facilityId) {
    const favorites = getFavorites();
    return favorites.includes(facilityId);
}

/**
 * Add a facility to favorites
 * @param {string} facilityId - Facility ID
 * @param {string} category - Facility category
 */
function addToFavorites(facilityId, category) {
    const favorites = getFavorites();

    if (favorites.includes(facilityId)) {
        showNotification('Already in favorites', 'info');
        return;
    }

    favorites.push(facilityId);
    saveFavorites(favorites);

    // Update UI
    updateFavoriteButton(facilityId, true);
    showNotification('Added to favorites', 'success');

    console.log(`❤️ Added ${facilityId} to favorites`);
}

/**
 * Remove a facility from favorites
 * @param {string} facilityId - Facility ID
 */
function removeFromFavorites(facilityId) {
    let favorites = getFavorites();
    favorites = favorites.filter(id => id !== facilityId);
    saveFavorites(favorites);

    // Update UI
    updateFavoriteButton(facilityId, false);
    showNotification('Removed from favorites', 'info');

    console.log(`💔 Removed ${facilityId} from favorites`);

    // Refresh favorites modal if open
    if (!document.getElementById('favoritesModal').classList.contains('hidden')) {
        displayFavoritesModal();
    }
}

/**
 * Toggle favorite status
 * @param {string} facilityId - Facility ID
 * @param {string} category - Facility category
 */
function toggleFavorite(facilityId, category) {
    if (isFavorite(facilityId)) {
        removeFromFavorites(facilityId);
    } else {
        addToFavorites(facilityId, category);
    }
}

/**
 * Update favorite button appearance
 * @param {string} facilityId - Facility ID
 * @param {boolean} isFav - Is favorite
 */
function updateFavoriteButton(facilityId, isFav) {
    const button = document.querySelector(`[data-favorite-id="${facilityId}"]`);
    if (!button) return;

    if (isFav) {
        button.innerHTML = '<i class="fas fa-heart mr-2"></i> Favorited';
        button.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        button.classList.add('bg-red-600', 'hover:bg-red-700');
    } else {
        button.innerHTML = '<i class="far fa-heart mr-2"></i> Add to Favorites';
        button.classList.remove('bg-red-600', 'hover:bg-red-700');
        button.classList.add('bg-gray-600', 'hover:bg-gray-700');
    }
}

/**
 * Get favorite facilities with full data
 * @returns {Array} Array of favorite facility objects
 */
function getFavoriteFacilities() {
    const favoriteIds = getFavorites();
    const favoriteFacilities = [];

    // Search through all categories
    Object.keys(facilityData).forEach(category => {
        facilityData[category].forEach(facility => {
            if (favoriteIds.includes(facility.id)) {
                favoriteFacilities.push({
                    ...facility,
                    category: category
                });
            }
        });
    });

    return favoriteFacilities;
}

/**
 * Display favorites in modal
 */
function displayFavoritesModal() {
    const favoritesContent = document.getElementById('favoritesContent');
    if (!favoritesContent) return;

    const favorites = getFavoriteFacilities();

    if (favorites.length === 0) {
        favoritesContent.innerHTML = `
            <div class="text-center py-12">
                <i class="far fa-heart text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-600 text-lg">No favorites yet</p>
                <p class="text-gray-500 text-sm mt-2">Click the heart icon on facilities to save them here</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="mb-4 flex justify-between items-center">
            <p class="text-gray-600">
                <i class="fas fa-heart text-red-500 mr-2"></i> ${favorites.length} favorite${favorites.length > 1 ? 's' : ''}
            </p>
            <button onclick="clearAllFavorites()" class="text-red-600 hover:text-red-700 text-sm">
                <i class="fas fa-trash mr-1"></i> Clear All
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    `;

    favorites.forEach(facility => {
        const props = facility.properties;
        const category = facility.category;
        const color = getMarkerColor(category);
        const icon = getCategoryIcon(category);

        html += `
            <div class="facility-card bg-white border rounded-lg p-4 hover:shadow-lg transition">
                <div class="flex items-start gap-3">
                    <div style="color: ${color};" class="text-2xl">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg mb-1">${props.name}</h3>
                        <p class="text-sm text-gray-600 mb-1">
                            <i class="fas fa-tag mr-1"></i> ${props.category}
                        </p>
                        <p class="text-sm text-gray-600 mb-3">
                            <i class="fas fa-map-marker-alt mr-1"></i> ${props.address || props.sector}
                        </p>
                        <div class="flex gap-2">
                            <button onclick="showFacilityOnMapFromFavorites('${facility.id}', '${category}')"
                                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition">
                                <i class="fas fa-map-marker-alt mr-1"></i> Show
                            </button>
                            <button onclick="removeFromFavorites('${facility.id}')"
                                    class="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition">
                                <i class="fas fa-trash mr-1"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    favoritesContent.innerHTML = html;
}

/**
 * Show facility on map from favorites
 * @param {string} facilityId - Facility ID
 * @param {string} category - Category
 */
function showFacilityOnMapFromFavorites(facilityId, category) {
    // Close favorites modal
    closeFavoritesModal();

    // Show facility on map
    showFacilityOnMap(facilityId, category);
}

/**
 * Clear all favorites
 */
function clearAllFavorites() {
    if (confirm('Are you sure you want to remove all favorites?')) {
        saveFavorites([]);
        displayFavoritesModal();
        showNotification('All favorites cleared', 'success');
    }
}

/**
 * Add search to history
 * @param {string} query - Search query
 */
function addToSearchHistory(query) {
    if (!query || query.trim() === '') return;

    try {
        let history = getSearchHistory();

        // Remove if already exists (to move to top)
        history = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());

        // Add to beginning
        history.unshift({
            query: query,
            timestamp: Date.now()
        });

        // Keep only last 10
        history = history.slice(0, 10);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

/**
 * Get search history
 * @returns {Array} Array of search history items
 */
function getSearchHistory() {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error('Error loading search history:', error);
        return [];
    }
}

/**
 * Clear search history
 */
function clearSearchHistory() {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
        console.log('🗑️ Search history cleared');
    } catch (error) {
        console.error('Error clearing search history:', error);
    }
}

/**
 * Get localStorage usage statistics
 * @returns {Object} Storage stats
 */
function getStorageStats() {
    const favorites = getFavorites();
    const history = getSearchHistory();

    return {
        favoritesCount: favorites.length,
        historyCount: history.length,
        totalSize: new Blob([
            localStorage.getItem(FAVORITES_KEY) || '',
            localStorage.getItem(HISTORY_KEY) || ''
        ]).size
    };
}

// Open/Close Modal Functions
function openFavoritesModal() {
    document.getElementById('favoritesModal').classList.remove('hidden');
    document.getElementById('favoritesModal').classList.add('flex');
    displayFavoritesModal();
}

function closeFavoritesModal() {
    document.getElementById('favoritesModal').classList.add('hidden');
    document.getElementById('favoritesModal').classList.remove('flex');
}

console.log('✅ Favorites.js initialized');
