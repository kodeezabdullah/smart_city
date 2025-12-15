// Main application logic

console.log('⚙️  Main.js loaded');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded - Initializing application...');

    // Initialize the map and load facilities
    initMapWithFacilities();

    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup all event listeners for UI interactions
 */
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Search bar
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        // Debounce search to avoid too many calls
        let searchTimeout;
        searchBar.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value;
                searchAndDisplay(query);
            }, 500);
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Get category and filter
            const category = btn.getAttribute('data-category');
            filterMarkers(category);

            // Clear search bar when filtering
            if (searchBar) {
                searchBar.value = '';
            }
        });
    });

    // Near Me button
    const nearMeBtn = document.getElementById('nearMeBtn');
    if (nearMeBtn) {
        nearMeBtn.addEventListener('click', () => {
            showUserLocation((lat, lng) => {
                // After getting location, show nearby facilities
                const radiusSelect = document.getElementById('distanceFilter');
                const radius = radiusSelect ? parseFloat(radiusSelect.value) || 5 : 5;

                if (radius !== 'all' && !isNaN(radius)) {
                    findNearbyFacilities(radius);
                }
            });
        });
    }

    // Distance filter
    const distanceFilter = document.getElementById('distanceFilter');
    if (distanceFilter) {
        distanceFilter.addEventListener('change', (e) => {
            const radius = e.target.value;

            if (radius === 'all') {
                // Show all facilities
                filterMarkers(currentCategory);
            } else {
                // Show facilities within radius
                if (userLocation) {
                    findNearbyFacilities(parseFloat(radius));
                } else {
                    alert('Please enable location first by clicking "Near Me" button');
                    distanceFilter.value = 'all';
                }
            }
        });
    }

    // Toggle View button (Map / List)
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const resultsPanel = document.getElementById('resultsPanel');
    const mapContainer = document.querySelector('.flex-1');

    if (toggleViewBtn && resultsPanel) {
        let isListView = false;

        toggleViewBtn.addEventListener('click', () => {
            isListView = !isListView;

            if (isListView) {
                // Switch to list view
                resultsPanel.classList.remove('hidden');
                mapContainer.classList.add('hidden');
                toggleViewBtn.innerHTML = '<i class="fas fa-map"></i> <span>Map View</span>';
                generateListView();
            } else {
                // Switch to map view
                resultsPanel.classList.add('hidden');
                mapContainer.classList.remove('hidden');
                toggleViewBtn.innerHTML = '<i class="fas fa-list"></i> <span>List View</span>';
            }
        });
    }

    // Modal button event listeners
    setupModalListeners();

    // Sidebar tab switching
    setupSidebarTabs();

    // Search history (on search input focus)
    if (searchBar) {
        searchBar.addEventListener('focus', () => {
            // Could show search history dropdown here
            const history = getSearchHistory();
            console.log('📜 Search history:', history);
        });

        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value;
                if (query && query.trim()) {
                    addToSearchHistory(query);
                }
            }
        });
    }

    console.log('✅ Event listeners set up successfully');
}

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
    // DISABLED: Modal buttons have been converted to page links
    // Keeping this function for backward compatibility

    /*
    // About modal
    const aboutBtns = [
        document.getElementById('aboutBtn'),
        document.getElementById('aboutBtnMobile'),
        document.getElementById('aboutBtnFooter')
    ];
    aboutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', openAboutModal);
        }
    });

    document.getElementById('closeAbout')?.addEventListener('click', closeAboutModal);

    // Click outside to close
    document.getElementById('aboutModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'aboutModal') closeAboutModal();
    });

    // Statistics modal
    const statsBtns = [
        document.getElementById('statsBtn'),
        document.getElementById('statsBtnMobile'),
        document.getElementById('statsBtnFooter')
    ];
    statsBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', openStatsModal);
        }
    });

    document.getElementById('closeStats')?.addEventListener('click', closeStatsModal);
    document.getElementById('statsModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'statsModal') closeStatsModal();
    });

    // Favorites modal
    const favoritesBtns = [
        document.getElementById('favoritesBtn'),
        document.getElementById('favoritesBtnMobile'),
        document.getElementById('favoritesBtnFooter')
    ];
    favoritesBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', openFavoritesModal);
        }
    });

    document.getElementById('closeFavorites')?.addEventListener('click', closeFavoritesModal);
    document.getElementById('favoritesModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'favoritesModal') closeFavoritesModal();
    });
    */

    // ESC key to close modals - DISABLED (modals converted to pages)
    /*
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAboutModal();
            closeStatsModal();
            closeFavoritesModal();
        }
    });
    */
}

/**
 * Setup sidebar tab switching
 */
function setupSidebarTabs() {
    const tabButtons = document.querySelectorAll('.sidebar-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });

            // Activate clicked tab
            button.classList.add('active');

            if (tabName === 'details') {
                document.getElementById('detailsTab').classList.remove('hidden');
                document.getElementById('detailsTab').classList.add('active');
            } else if (tabName === 'directions') {
                document.getElementById('directionsTab').classList.remove('hidden');
                document.getElementById('directionsTab').classList.add('active');
            }
        });
    });
}

/**
 * Generate list view of facilities
 * @param {Array} facilitiesOverride - Optional facilities array (for near me results)
 */
function generateListView(facilitiesOverride = null) {
    const resultsList = document.getElementById('resultsList');
    if (!resultsList) return;

    let facilities = facilitiesOverride || getAllFacilities(currentCategory);

    // Sort by distance if available
    if (facilities.length > 0 && facilities[0].distance !== undefined) {
        facilities = facilities.sort((a, b) => a.distance - b.distance);
    }

    if (facilities.length === 0) {
        resultsList.innerHTML = '<p class="col-span-full text-center text-gray-500">No facilities found</p>';
        return;
    }

    let listHtml = '';

    facilities.slice(0, 50).forEach((facility, index) => {  // Limit to 50 for performance
        const props = facility.properties;
        const category = getCategoryFromFeature(facility);
        const color = getMarkerColor(category);
        const icon = getCategoryIcon(category);

        // Distance badge if available
        const distanceBadge = facility.distance !== undefined ?
            `<span class="distance-badge">${facility.distanceText}</span>` : '';

        listHtml += `
            <div class="facility-card bg-white border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                 onclick="showFacilityOnMap('${facility.id}', '${category}')">
                <div class="flex items-start gap-3">
                    <div class="flex flex-col items-center" style="color: ${color};">
                        <i class="fas ${icon} text-2xl"></i>
                        ${facility.distance !== undefined ? `<span class="text-xs mt-1">#${index + 1}</span>` : ''}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-start justify-between mb-1">
                            <h3 class="font-bold text-lg">${props.name}</h3>
                            ${distanceBadge}
                        </div>
                        <p class="text-sm text-gray-600 mb-1">
                            <i class="fas fa-tag"></i> ${props.category}
                        </p>
                        <p class="text-sm text-gray-600 mb-2">
                            <i class="fas fa-map-marker-alt"></i> ${props.address || props.sector}
                        </p>
                        ${props.rating ? `
                            <div class="flex items-center gap-1 text-sm">
                                <span class="text-yellow-500">★</span>
                                <span>${props.rating}/5.0</span>
                                ${props.reviews ? `<span class="text-gray-500 text-xs">(${props.reviews})</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    if (facilities.length > 50) {
        listHtml += `
            <div class="col-span-full text-center text-gray-500 py-4">
                Showing first 50 of ${facilities.length} facilities
            </div>
        `;
    }

    resultsList.innerHTML = listHtml;
}

/**
 * Show facility on map when clicked in list view
 */
function showFacilityOnMap(facilityId, category) {
    const facilities = facilityData[category];
    const facility = facilities.find(f => f.id === facilityId);

    if (!facility) return;

    // Switch to map view
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const resultsPanel = document.getElementById('resultsPanel');
    const mapContainer = document.querySelector('.flex-1');

    if (resultsPanel) resultsPanel.classList.add('hidden');
    if (mapContainer) mapContainer.classList.remove('hidden');
    if (toggleViewBtn) {
        toggleViewBtn.innerHTML = '<i class="fas fa-list"></i> <span>List View</span>';
    }

    // Zoom to facility on map
    const coords = facility.geometry.coordinates;
    map.setView([coords[1], coords[0]], 16);

    // Find and open popup for this marker
    markerClusterGroup.eachLayer(layer => {
        const latLng = layer.getLatLng();
        if (latLng.lat === coords[1] && latLng.lng === coords[0]) {
            layer.openPopup();
        }
    });

    // Show details in sidebar
    showFacilityDetails(facilityId, category);
}

/**
 * Handle window resize for responsive behavior
 */
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth >= 1024) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('lg:block');
    }
});

console.log('✅ Main.js initialized - Application ready!');
