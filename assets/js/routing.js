// Routing and Directions functionality

console.log('🛣️  Routing.js loaded');

// Global routing variables
let currentRoute = null;
let routingControl = null;
let selectedFacility = null;

/**
 * Initialize routing control on map
 * @param {number} startLat - Starting latitude
 * @param {number} startLng - Starting longitude
 * @param {number} destLat - Destination latitude
 * @param {number} destLng - Destination longitude
 * @param {Object} facilityInfo - Facility information
 */
function initializeRoute(startLat, startLng, destLat, destLng, facilityInfo) {
    console.log(`🗺️ Initializing route from [${startLat}, ${startLng}] to [${destLat}, ${destLng}]`);

    // Remove existing route if any
    clearRoute();

    try {
        // Create routing control
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(startLat, startLng),
                L.latLng(destLat, destLng)
            ],
            routeWhileDragging: true,
            showAlternatives: true,
            altLineOptions: {
                styles: [
                    { color: 'gray', opacity: 0.5, weight: 5 }
                ]
            },
            lineOptions: {
                styles: [
                    { color: '#3b82f6', opacity: 0.8, weight: 6 }
                ]
            },
            createMarker: function(i, waypoint, n) {
                // Custom markers for start and end
                let iconHtml;
                if (i === 0) {
                    // Start marker (user location)
                    iconHtml = '<div style="background: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-user" style="color: white; font-size: 14px;"></i></div>';
                } else {
                    // End marker (destination)
                    const color = getMarkerColor(getCategoryFromFeature(facilityInfo));
                    iconHtml = `<div style="background: ${color}; width: 35px; height: 35px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-flag" style="color: white; font-size: 16px;"></i></div>`;
                }

                return L.marker(waypoint.latLng, {
                    icon: L.divIcon({
                        html: iconHtml,
                        className: 'custom-routing-marker',
                        iconSize: [35, 35],
                        iconAnchor: [17, 17]
                    })
                });
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            })
        }).addTo(map);

        // Listen to route found event
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;

            currentRoute = {
                distance: (summary.totalDistance / 1000).toFixed(2), // Convert to km
                duration: Math.round(summary.totalTime / 60), // Convert to minutes
                instructions: routes[0].instructions,
                facility: facilityInfo
            };

            console.log(`✅ Route found: ${currentRoute.distance} km, ${currentRoute.duration} mins`);

            // Display route details in sidebar
            displayRouteDetails(currentRoute, routes);

            // Show notification
            showNotification(`Route found: ${currentRoute.distance} km, ~${currentRoute.duration} mins`, 'success');

            // Switch to directions tab
            switchToDirectionsTab();
        });

        // Listen to routing error
        routingControl.on('routingerror', function(e) {
            console.error('❌ Routing error:', e);
            showNotification('Unable to find route. Please try again.', 'error');
        });

    } catch (error) {
        console.error('❌ Error initializing route:', error);
        showNotification('Error calculating route', 'error');
    }
}

/**
 * Display route details in the directions tab
 * @param {Object} route - Route information
 * @param {Array} routes - All available routes
 */
function displayRouteDetails(route, routes) {
    const directionsContent = document.getElementById('directionsContent');
    if (!directionsContent) return;

    const props = route.facility.properties;
    const category = getCategoryFromFeature(route.facility);
    const icon = getCategoryIcon(category);
    const color = getMarkerColor(category);

    let html = `
        <!-- Destination Info -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
            <div class="flex items-start gap-3">
                <div style="color: ${color};" class="text-3xl">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-lg text-gray-800">${props.name}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        <i class="fas fa-map-marker-alt mr-1"></i> ${props.address || props.sector}
                    </p>
                </div>
            </div>
        </div>

        <!-- Route Summary -->
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-green-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-green-700">${route.distance} km</div>
                <div class="text-xs text-gray-600 mt-1">Distance</div>
            </div>
            <div class="bg-blue-50 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-blue-700">~${route.duration} min</div>
                <div class="text-xs text-gray-600 mt-1">Duration</div>
            </div>
        </div>

        <!-- Alternative Routes -->
        ${routes.length > 1 ? `
            <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">
                    <i class="fas fa-info-circle mr-1"></i> ${routes.length} routes available
                </p>
            </div>
        ` : ''}

        <!-- Turn-by-Turn Directions -->
        <div class="mb-4">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                <i class="fas fa-list-ol mr-2"></i> Turn-by-Turn Directions
            </h4>
            <div class="space-y-2">
    `;

    // Add each instruction
    route.instructions.forEach((instruction, index) => {
        const distance = (instruction.distance / 1000).toFixed(2);
        const direction = getDirectionIcon(instruction.type);

        html += `
            <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fas ${direction} text-blue-600"></i>
                        <span class="font-medium text-gray-800">${instruction.text || instruction.road || 'Continue'}</span>
                    </div>
                    ${instruction.distance > 0 ? `<p class="text-xs text-gray-500">Continue for ${distance} km</p>` : ''}
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
            <button onclick="clearRoute()" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition">
                <i class="fas fa-times mr-2"></i> Clear Route
            </button>
            <button onclick="printDirections()" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition">
                <i class="fas fa-print mr-2"></i> Print
            </button>
        </div>
    `;

    directionsContent.innerHTML = html;
}

/**
 * Get Font Awesome icon for direction type
 * @param {string} type - Instruction type
 * @returns {string} Icon class
 */
function getDirectionIcon(type) {
    const icons = {
        'Straight': 'fa-arrow-up',
        'SlightRight': 'fa-arrow-right',
        'Right': 'fa-arrow-right',
        'SharpRight': 'fa-arrow-right',
        'TurnAround': 'fa-undo',
        'SharpLeft': 'fa-arrow-left',
        'Left': 'fa-arrow-left',
        'SlightLeft': 'fa-arrow-left',
        'WaypointReached': 'fa-flag-checkered',
        'Roundabout': 'fa-circle-notch',
        'DestinationReached': 'fa-flag-checkered'
    };

    return icons[type] || 'fa-arrow-up';
}

/**
 * Clear current route from map
 */
function clearRoute() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
        currentRoute = null;
        console.log('🗑️ Route cleared');

        // Reset directions content
        const directionsContent = document.getElementById('directionsContent');
        if (directionsContent) {
            directionsContent.innerHTML = `
                <div class="text-gray-600 text-center py-8">
                    <i class="fas fa-route text-4xl text-gray-300 mb-2"></i>
                    <p>Select a facility and click "Get Directions"</p>
                </div>
            `;
        }

        showNotification('Route cleared', 'info');
    }
}

/**
 * Get directions to a facility
 * @param {string} facilityId - Facility ID
 * @param {string} category - Facility category
 */
function getDirectionsToFacility(facilityId, category) {
    // Check if user location is available
    if (!userLocation) {
        showNotification('Please enable your location first by clicking "Near Me"', 'warning');
        return;
    }

    // Find the facility
    const facilities = facilityData[category];
    const facility = facilities.find(f => f.id === facilityId);

    if (!facility) {
        showNotification('Facility not found', 'error');
        return;
    }

    selectedFacility = facility;
    const coords = facility.geometry.coordinates;

    // Show loading
    showLoading(true, 'Calculating route...');

    // Initialize route
    setTimeout(() => {
        initializeRoute(
            userLocation.lat,
            userLocation.lng,
            coords[1],  // lat
            coords[0],  // lng
            facility
        );
        showLoading(false);
    }, 500);
}

/**
 * Switch to directions tab in sidebar
 */
function switchToDirectionsTab() {
    const detailsTab = document.querySelector('[data-tab="details"]');
    const directionsTab = document.querySelector('[data-tab="directions"]');
    const detailsContent = document.getElementById('detailsTab');
    const directionsContent = document.getElementById('directionsTab');

    if (detailsTab && directionsTab && detailsContent && directionsContent) {
        detailsTab.classList.remove('active');
        directionsTab.classList.add('active');
        detailsContent.classList.add('hidden');
        detailsContent.classList.remove('active');
        directionsContent.classList.remove('hidden');
        directionsContent.classList.add('active');
    }
}

/**
 * Print directions
 */
function printDirections() {
    if (!currentRoute) {
        showNotification('No route to print', 'warning');
        return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    const props = currentRoute.facility.properties;

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Directions to ${props.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #2563eb; }
                .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .instruction { padding: 10px; border-bottom: 1px solid #e5e7eb; }
                .instruction:last-child { border-bottom: none; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <h1>Directions to ${props.name}</h1>
            <p><strong>Address:</strong> ${props.address || props.sector}</p>
            <div class="summary">
                <p><strong>Distance:</strong> ${currentRoute.distance} km</p>
                <p><strong>Estimated Time:</strong> ~${currentRoute.duration} minutes</p>
            </div>
            <h2>Turn-by-Turn Directions:</h2>
            <div>
    `;

    currentRoute.instructions.forEach((instruction, index) => {
        const distance = (instruction.distance / 1000).toFixed(2);
        html += `
            <div class="instruction">
                <strong>${index + 1}.</strong> ${instruction.text || instruction.road || 'Continue'}
                ${instruction.distance > 0 ? ` - ${distance} km` : ''}
            </div>
        `;
    });

    html += `
            </div>
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    showNotification('Print preview opened', 'success');
}

console.log('✅ Routing.js initialized');
