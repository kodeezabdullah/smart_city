// Map initialization and controls

// Global map variables
let map;
let markerClusterGroup;
let currentCategory = 'all';
let userLocation = null;
let markersLayer = {};
let userMarker = null;
let radiusCircle = null;
let currentFilters = {};

// Islamabad center coordinates (Faisal Mosque)
const ISLAMABAD_CENTER = [33.6844, 73.0479];
const DEFAULT_ZOOM = 12;

/**
 * Initialize the Leaflet map
 */
function initializeMap() {
    console.log('🗺️  Initializing Leaflet map...');

    try {
        // Check if map div exists
        const mapDiv = document.getElementById('map');
        if (!mapDiv) {
            console.error('❌ Map div not found!');
            return false;
        }
        console.log('✅ Map div found:', mapDiv);

        // Create map instance
        map = L.map('map', {
            center: ISLAMABAD_CENTER,
            zoom: DEFAULT_ZOOM,
            zoomControl: true,
            scrollWheelZoom: true,
            preferCanvas: false
        });

        console.log('✅ Map instance created');

        // Add OpenStreetMap tiles (English language)
        const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 10,
            language: 'en'
        }).addTo(map);

        console.log('✅ OpenStreetMap tiles added');

        // Force map to refresh
        setTimeout(() => {
            map.invalidateSize();
            console.log('🔄 Map size invalidated');
        }, 100);

        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            imperial: false
        }).addTo(map);

        // Initialize marker cluster group
        markerClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 50
        });

        map.addLayer(markerClusterGroup);

        console.log('✅ Map initialized successfully!');
        console.log(`📍 Center: ${ISLAMABAD_CENTER[0]}, ${ISLAMABAD_CENTER[1]}`);
        console.log(`🔍 Zoom level: ${DEFAULT_ZOOM}`);

        return true;
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        return false;
    }
}

/**
 * Create a custom colored marker
 * @param {string} color - Hex color code
 * @param {string} category - Facility category
 * @returns {Object} Leaflet divIcon
 */
function createColoredMarker(color, category) {
    const iconHtml = `
        <div style="
            background-color: ${color};
            width: 25px;
            height: 25px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <i class="fas ${getCategoryIcon(category)}" style="
                color: white;
                font-size: 12px;
                transform: rotate(45deg);
            "></i>
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [25, 25],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
    });
}

/**
 * Create popup content for a facility
 * @param {Object} facility - Facility feature object
 * @param {string} category - Facility category
 * @returns {string} HTML content for popup
 */
function createPopupContent(facility, category) {
    const props = facility.properties;
    const icon = getCategoryIcon(category);
    const color = getMarkerColor(category);

    let amenitiesHtml = '';
    if (props.amenities || props.services || props.facilities || props.programs) {
        const items = props.amenities || props.services || props.facilities || props.programs;
        amenitiesHtml = `
            <div class="mt-2">
                <strong>Facilities:</strong>
                <div class="flex flex-wrap gap-1 mt-1">
                    ${items.slice(0, 3).map(item =>
                        `<span class="text-xs bg-gray-200 px-2 py-1 rounded">${item}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    const rating = props.rating ? `
        <div class="flex items-center gap-1 mt-1">
            <span class="text-yellow-500">★</span>
            <span>${props.rating}/5.0</span>
            ${props.reviews ? `<span class="text-gray-500 text-xs">(${props.reviews} reviews)</span>` : ''}
        </div>
    ` : '';

    return `
        <div class="facility-popup" style="min-width: 250px;">
            <div class="flex items-center gap-2 mb-2" style="color: ${color};">
                <i class="fas ${icon} text-xl"></i>
                <h3 class="font-bold text-lg">${props.name}</h3>
            </div>
            <div class="text-sm space-y-1">
                <p><i class="fas fa-tag text-gray-500"></i> <strong>${props.category}</strong></p>
                <p><i class="fas fa-map-marker-alt text-gray-500"></i> ${props.address || props.sector}</p>
                ${props.contact ? `<p><i class="fas fa-phone text-gray-500"></i> ${props.contact}</p>` : ''}
                ${props.timing ? `<p><i class="fas fa-clock text-gray-500"></i> ${props.timing}</p>` : ''}
                ${rating}
                ${amenitiesHtml}
            </div>
            <button
                onclick="showFacilityDetails('${facility.id}', '${category}')"
                class="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm"
            >
                View Full Details
            </button>
        </div>
    `;
}

/**
 * Add markers to the map
 * @param {Array} facilities - Array of facility features
 * @param {string} category - Category name
 */
function addMarkersToMap(facilities, category = 'all') {
    console.log(`📌 Adding ${facilities.length} markers for ${category}...`);

    // Clear existing markers
    markerClusterGroup.clearLayers();
    markersLayer = {};

    let addedCount = 0;

    facilities.forEach(facility => {
        try {
            const coords = facility.geometry.coordinates;
            const lat = coords[1];
            const lng = coords[0];

            // Get facility category
            const facilityCategory = getCategoryFromFeature(facility);
            const color = getMarkerColor(facilityCategory);

            // Create marker
            const marker = L.marker([lat, lng], {
                icon: createColoredMarker(color, facilityCategory)
            });

            // Bind popup
            const popupContent = createPopupContent(facility, facilityCategory);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            // Add to cluster group
            markerClusterGroup.addLayer(marker);

            // Store marker reference
            if (!markersLayer[facilityCategory]) {
                markersLayer[facilityCategory] = [];
            }
            markersLayer[facilityCategory].push(marker);

            addedCount++;
        } catch (error) {
            console.error('Error adding marker:', error, facility);
        }
    });

    console.log(`✅ Added ${addedCount} markers to map`);
}

/**
 * Filter and display markers by category
 * @param {string} category - Category to filter ('all' or specific category)
 */
function filterMarkers(category) {
    currentCategory = category;
    const facilities = getAllFacilities(category);

    addMarkersToMap(facilities, category);
    updateFacilityCount(facilities.length);

    console.log(`🔍 Filtered to ${category}: ${facilities.length} facilities`);
}

/**
 * Show user location on map
 * @param {Function} callback - Optional callback after location is obtained
 */
function showUserLocation(callback) {
    console.log('📍 Attempting to get user location...');
    console.log('   Protocol:', window.location.protocol);
    console.log('   Hostname:', window.location.hostname);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
        console.error('❌ Geolocation API not supported');
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }

    // Check if running on secure context
    const isSecureContext = window.isSecureContext || 
                           window.location.protocol === 'https:' ||
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';

    if (!isSecureContext) {
        console.warn('⚠️ Not running in secure context. Geolocation may not work.');
        showNotification('Warning: Geolocation requires HTTPS or localhost', 'warning');
    }

    console.log('✓ Geolocation API available');
    console.log('✓ Requesting position...');
    showLoading(true, 'Getting your location...');

    // Success callback
    const onSuccess = (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(`✅ Location obtained!`);
        console.log(`   Latitude: ${lat.toFixed(6)}`);
        console.log(`   Longitude: ${lng.toFixed(6)}`);
        console.log(`   Accuracy: ${accuracy.toFixed(0)} meters`);

        userLocation = { lat, lng };

        // Remove previous user marker if exists
        if (userMarker) {
            map.removeLayer(userMarker);
        }

        // Add user location marker with animation
        userMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                html: `<div class="user-marker-pulse">
                         <div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>
                       </div>`,
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);

        const popupText = `<strong>📍 You are here</strong><br>Your current location<br><small>Accuracy: ±${accuracy.toFixed(0)}m</small>`;
        userMarker.bindPopup(popupText).openPopup();

        // Zoom to user location
        map.setView([lat, lng], 14);

        showLoading(false);
        showNotification(`Location found! (±${accuracy.toFixed(0)}m accuracy)`, 'success');

        // Execute callback if provided
        if (callback) {
            callback(lat, lng);
        }
    };

    // Error callback
    const onError = (error) => {
        console.error('❌ Geolocation error:', error);
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        showLoading(false);

        let errorMsg = 'Unable to retrieve your location. ';
        let debugInfo = '';

        switch (error.code) {
            case 1: // PERMISSION_DENIED
                errorMsg += 'Please enable location permissions in your browser.';
                debugInfo = 'User denied geolocation request or browser blocked it.';
                break;
            case 2: // POSITION_UNAVAILABLE
                errorMsg += 'Location information unavailable. Check your device GPS.';
                debugInfo = 'Device cannot determine location (GPS/network issue).';
                break;
            case 3: // TIMEOUT
                errorMsg += 'Location request timed out. Please try again.';
                debugInfo = 'Geolocation request took too long.';
                break;
            default:
                errorMsg += 'An unknown error occurred.';
                debugInfo = 'Unknown geolocation error.';
        }

        console.error('   Debug info:', debugInfo);
        showNotification(errorMsg, 'error');

        // Show helpful instructions
        console.log('💡 Troubleshooting tips:');
        console.log('   1. Allow location permissions when browser prompts');
        console.log('   2. Check if GPS/location is enabled on your device');
        console.log('   3. Use HTTPS or localhost for better compatibility');
        console.log('   4. Try refreshing the page and allowing permissions');
    };

    // Try with high accuracy first, but with longer timeout
    navigator.geolocation.getCurrentPosition(
        onSuccess,
        (error) => {
            // If high accuracy fails with timeout, try without high accuracy
            if (error.code === 3) {
                console.log('⚠️ High accuracy timed out, trying with standard accuracy...');
                navigator.geolocation.getCurrentPosition(
                    onSuccess,
                    onError,
                    {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 300000
                    }
                );
            } else {
                onError(error);
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000
        }
    );
}

/**
 * Draw radius circle on map
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 */
function drawRadiusCircle(lat, lng, radiusKm) {
    // Remove previous circle
    if (radiusCircle) {
        map.removeLayer(radiusCircle);
    }

    // Draw new circle
    radiusCircle = L.circle([lat, lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: radiusKm * 1000, // Convert km to meters
        weight: 2,
        dashArray: '5, 10'
    }).addTo(map);

    console.log(`🔵 Drew ${radiusKm}km radius circle`);
}

/**
 * Find facilities near user location
 * @param {number} radiusKm - Search radius in kilometers
 */
function findNearbyFacilities(radiusKm = 5) {
    if (!userLocation) {
        showNotification('Please enable location first by clicking "Near Me" button', 'warning');
        return;
    }

    console.log(`🔍 Searching for ${currentCategory} within ${radiusKm}km...`);
    showLoading(true, `Finding facilities within ${radiusKm}km...`);

    // Get nearby facilities sorted by distance
    const nearby = getNearbyFacilities(
        userLocation.lat,
        userLocation.lng,
        radiusKm,
        currentCategory
    );

    // Draw radius circle
    drawRadiusCircle(userLocation.lat, userLocation.lng, radiusKm);

    // Update map markers
    addMarkersToMap(nearby, currentCategory);
    updateFacilityCount(nearby.length);

    // Fit map to show all nearby facilities
    if (nearby.length > 0) {
        const bounds = L.latLngBounds(
            nearby.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    showLoading(false);

    if (nearby.length === 0) {
        showNotification(`No facilities found within ${radiusKm}km. Try increasing the radius.`, 'info');
    } else {
        showNotification(`Found ${nearby.length} facilities within ${radiusKm}km`, 'success');
    }

    console.log(`✅ Found ${nearby.length} facilities within ${radiusKm}km`);
    return nearby;
}

/**
 * Search and filter facilities (enhanced)
 * @param {string} query - Search query
 */
function searchAndDisplay(query) {
    console.log(`🔎 Searching for: "${query}"`);

    if (!query || query.trim() === '') {
        // If empty, show all facilities in current category
        filterMarkers(currentCategory);
        return;
    }

    showLoading(true, 'Searching...');

    // Parse query and perform advanced search
    const parsed = parseSearchQuery(query);

    // Handle "near me" searches
    if (parsed.nearMe && userLocation) {
        const radius = parseFloat(document.getElementById('distanceFilter')?.value) || 5;
        const type = parsed.facilityType || currentCategory;

        const results = getNearbyFacilities(
            userLocation.lat,
            userLocation.lng,
            radius,
            type
        );

        // Draw radius if not already shown
        if (radius !== 'all') {
            drawRadiusCircle(userLocation.lat, userLocation.lng, parseFloat(radius));
        }

        addMarkersToMap(results, type);
        updateFacilityCount(results.length);

        if (results.length > 0) {
            fitMapToBounds(results);
        }

        showLoading(false);
        showNotification(`Found ${results.length} ${type} near you`, 'success');
        console.log(`✅ Near me search: ${results.length} results`);
        return;
    }

    if (parsed.nearMe && !userLocation) {
        showLoading(false);
        showNotification('Please click "Near Me" button first to enable location', 'warning');
        return;
    }

    // Perform advanced search
    const results = advancedSearch(query, currentFilters);

    addMarkersToMap(results, currentCategory);
    updateFacilityCount(results.length);

    // Fit map to results if reasonable number
    if (results.length > 0 && results.length < 50) {
        fitMapToBounds(results);
    }

    showLoading(false);

    if (results.length === 0) {
        showNotification('No facilities found. Try a different search term.', 'info');
    }

    console.log(`✅ Search complete: ${results.length} results`);
}

/**
 * Fit map to show all facilities in bounds
 * @param {Array} facilities - Facilities to fit
 */
function fitMapToBounds(facilities) {
    if (facilities.length === 0) return;

    const bounds = L.latLngBounds(
        facilities.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
}

/**
 * Show facility details in sidebar
 * @param {string} facilityId - Facility ID
 * @param {string} category - Category name
 */
function showFacilityDetails(facilityId, category) {
    const facilities = facilityData[category];
    const facility = facilities.find(f => f.id === facilityId);

    if (!facility) {
        console.error('Facility not found:', facilityId);
        return;
    }

    const props = facility.properties;
    const icon = getCategoryIcon(category);
    const color = getMarkerColor(category);

    let detailsHtml = `
        <div class="facility-details">
            <div class="flex items-center gap-3 mb-4" style="color: ${color};">
                <i class="fas ${icon} text-3xl"></i>
                <h2 class="font-bold text-xl">${props.name}</h2>
            </div>
            <div class="space-y-3 text-sm">
                <div>
                    <p class="text-gray-600 font-semibold">Category</p>
                    <p>${props.category}</p>
                </div>
                <div>
                    <p class="text-gray-600 font-semibold">Address</p>
                    <p>${props.address || props.sector}</p>
                </div>
    `;

    if (props.contact) {
        detailsHtml += `
                <div>
                    <p class="text-gray-600 font-semibold">Contact</p>
                    <p>${props.contact}</p>
                </div>
        `;
    }

    if (props.timing) {
        detailsHtml += `
                <div>
                    <p class="text-gray-600 font-semibold">Timing</p>
                    <p>${props.timing}</p>
                </div>
        `;
    }

    if (props.rating) {
        detailsHtml += `
                <div>
                    <p class="text-gray-600 font-semibold">Rating</p>
                    <div class="flex items-center gap-2">
                        <span class="text-yellow-500 text-lg">★ ${props.rating}/5.0</span>
                        ${props.reviews ? `<span class="text-gray-500">(${props.reviews} reviews)</span>` : ''}
                    </div>
                </div>
        `;
    }

    // Add amenities/services/facilities
    const items = props.amenities || props.services || props.facilities || props.programs;
    if (items && items.length > 0) {
        detailsHtml += `
                <div>
                    <p class="text-gray-600 font-semibold mb-2">Facilities & Services</p>
                    <div class="flex flex-wrap gap-2">
                        ${items.map(item =>
                            `<span class="text-xs bg-gray-100 px-3 py-1 rounded-full">${item}</span>`
                        ).join('')}
                    </div>
                </div>
        `;
    }

    if (props.description) {
        detailsHtml += `
                <div>
                    <p class="text-gray-600 font-semibold">Description</p>
                    <p class="text-gray-700">${props.description}</p>
                </div>
        `;
    }

    detailsHtml += `
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 pt-4 border-t space-y-2">
                <button onclick="getDirectionsToFacility('${facilityId}', '${category}')"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex items-center justify-center">
                    <i class="fas fa-route mr-2"></i> Get Directions
                </button>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="toggleFavorite('${facilityId}', '${category}')"
                            data-favorite-id="${facilityId}"
                            class="bg-${isFavorite(facilityId) ? 'red' : 'gray'}-600 hover:bg-${isFavorite(facilityId) ? 'red' : 'gray'}-700 text-white px-3 py-2 rounded transition text-sm">
                        <i class="fa${isFavorite(facilityId) ? 's' : 'r'} fa-heart mr-1"></i>
                        ${isFavorite(facilityId) ? 'Favorited' : 'Favorite'}
                    </button>

                    <button onclick="shareLocation(${facility.geometry.coordinates[1]}, ${facility.geometry.coordinates[0]}, '${props.name.replace(/'/g, "\\'")}')"
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition text-sm">
                        <i class="fas fa-share-alt mr-1"></i> Share
                    </button>
                </div>

                <a href="https://www.google.com/maps/search/?api=1&query=${facility.geometry.coordinates[1]},${facility.geometry.coordinates[0]}"
                   target="_blank"
                   class="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded transition text-sm">
                    <i class="fab fa-google mr-2"></i> View on Google Maps
                </a>
            </div>
        </div>
    `;

    const detailsContainer = document.getElementById('facilityDetails');
    if (detailsContainer) {
        detailsContainer.innerHTML = detailsHtml;
    }

    // Show sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth < 1024) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('block');
    }
}

/**
 * Initialize map with all facilities
 */
async function initMapWithFacilities() {
    // Initialize map
    const mapInitialized = initializeMap();

    if (!mapInitialized) {
        console.error('Failed to initialize map');
        return;
    }

    // Load facility data
    const dataLoaded = await loadAllFacilities();

    if (!dataLoaded) {
        console.error('Failed to load facility data');
        return;
    }

    // Add all markers to map
    const allFacilities = getAllFacilities('all');
    addMarkersToMap(allFacilities, 'all');

    // Initialize drawing tools
    setTimeout(() => {
        initializeDrawingTools();
    }, 500);

    console.log('🎉 Map initialization complete!');
}

/**
 * Show loading spinner
 * @param {boolean} show - Show or hide
 * @param {string} message - Loading message
 */
function showLoading(show, message = 'Loading...') {
    let loader = document.getElementById('loading-overlay');

    if (!loader) {
        // Create loading overlay
        loader = document.createElement('div');
        loader.id = 'loading-overlay';
        loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
                <div class="spinner mb-3"></div>
                <p id="loading-message" class="text-gray-700">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    const messageEl = document.getElementById('loading-message');
    if (messageEl) {
        messageEl.textContent = message;
    }

    loader.style.display = show ? 'flex' : 'none';
}

/**
 * Show notification toast
 * @param {string} message - Notification message
 * @param {string} type - Type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-slide-in`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="notification-icon">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 4000);
}

/**
 * Create notification container
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-20 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}

/**
 * Initialize drawing tools on map
 */
function initializeDrawingTools() {
    if (typeof L.Control.Draw === 'undefined') {
        console.log('⚠️ Leaflet Draw not available');
        return;
    }

    console.log('🖊️ Initializing drawing tools...');

    // Feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Drawing control
    const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polyline: false,
            polygon: false,
            rectangle: false,
            marker: false,
            circlemarker: false,
            circle: {
                shapeOptions: {
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1
                }
            }
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });

    map.addControl(drawControl);

    // Handle drawn circle
    map.on(L.Draw.Event.CREATED, function(e) {
        const type = e.layerType;
        const layer = e.layer;

        if (type === 'circle') {
            drawnItems.addLayer(layer);

            const center = layer.getLatLng();
            const radius = layer.getRadius() / 1000; // Convert to km

            console.log(`🔵 Circle drawn: center [${center.lat}, ${center.lng}], radius ${radius.toFixed(2)}km`);

            // Search facilities within circle
            const nearby = getNearbyFacilities(center.lat, center.lng, radius, currentCategory);
            showNotification(`Found ${nearby.length} facilities within ${radius.toFixed(1)}km`, 'success');

            // Display results
            if (nearby.length > 0) {
                addMarkersToMap(nearby, currentCategory);
                updateFacilityCount(nearby.length);
            }
        }
    });

    // Handle deleted shapes
    map.on(L.Draw.Event.DELETED, function(e) {
        console.log('🗑️ Shapes deleted');
        showNotification('Drawing cleared', 'info');

        // Reset to show all facilities
        filterMarkers(currentCategory);
    });

    console.log('✅ Drawing tools initialized');
}

/**
 * Add measure distance tool
 */
function addMeasureControl() {
    // Simple measure control (manual implementation since leaflet-measure needs plugin)
    console.log('📏 Measure tool available via drawing controls');
}

console.log('🗺️  Map.js loaded - Ready to initialize map');
