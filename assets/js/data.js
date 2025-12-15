// Data management and filtering

// Global data storage
const facilityData = {
    hospitals: [],
    'police-stations': [],
    parks: [],
    mosques: [],
    schools: [],
    colleges: [],
    universities: []
};

// Track loading status
let dataLoadStatus = {
    hospitals: false,
    'police-stations': false,
    parks: false,
    mosques: false,
    schools: false,
    colleges: false,
    universities: false
};

// Base path for data files
const DATA_PATH = 'data/';

/**
 * Load all facility data from JSON files
 */
async function loadAllFacilities() {
    console.log('📥 Starting to load facility data...');
    console.log('   Current URL:', window.location.href);
    console.log('   Data path:', DATA_PATH);

    const categories = Object.keys(facilityData);
    console.log('   Categories to load:', categories);

    const loadPromises = categories.map(category => loadFacilityData(category));

    try {
        const results = await Promise.all(loadPromises);

        // Check how many loaded successfully
        const successCount = results.filter(r => r !== null).length;
        const totalCount = categories.length;

        console.log(`📊 Loading complete: ${successCount}/${totalCount} categories loaded`);
        console.log(`📊 Total facilities: ${getTotalFacilityCount()}`);

        if (successCount === 0) {
            console.error('❌ CRITICAL: No facility data loaded!');
            console.error('   Make sure JSON files exist in the "data/" folder');
            console.error('   Files needed:', categories.map(c => `${c}.json`));

            // Show user-friendly alert
            alert(
                '⚠️ Data Loading Failed!\n\n' +
                'Unable to load facility data files.\n\n' +
                'Please ensure:\n' +
                '1. You are running the app via a local server (not file://)\n' +
                '2. The "data/" folder contains all JSON files\n' +
                '3. Check browser console (F12) for detailed errors\n\n' +
                'Try: python -m http.server 8000'
            );

            return false;
        } else if (successCount < totalCount) {
            console.warn(`⚠️ Partial load: ${totalCount - successCount} categories failed`);
            if (typeof showNotification === 'function') {
                showNotification(`Warning: Only ${successCount}/${totalCount} facility types loaded`, 'warning');
            }
        } else {
            console.log('✅ All facility data loaded successfully!');
            if (typeof showNotification === 'function') {
                showNotification(`Loaded ${getTotalFacilityCount()} facilities successfully!`, 'success');
            }
        }

        updateFacilityCount();
        return successCount > 0;
    } catch (error) {
        console.error('❌ Error loading facility data:', error);
        alert('Error loading facility data. Check console for details.');
        return false;
    }
}

/**
 * Load facility data for a specific category
 * @param {string} category - The facility category (e.g., 'hospitals', 'mosques')
 */
async function loadFacilityData(category) {
    const filename = `${category}.json`;
    const filepath = DATA_PATH + filename;

    console.log(`📥 Attempting to load: ${filepath}`);

    try {
        const response = await fetch(filepath);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${filepath}`);
        }

        const data = await response.json();

        // Validate data structure
        if (!data || !data.features) {
            throw new Error(`Invalid data structure in ${filename}`);
        }

        facilityData[category] = data.features || [];
        dataLoadStatus[category] = true;

        console.log(`✅ Loaded ${facilityData[category].length} ${category} from ${filepath}`);
        return data;
    } catch (error) {
        console.error(`❌ Failed to load ${category}:`, error);
        console.error(`   File path: ${filepath}`);
        console.error(`   Error details:`, error.message);
        dataLoadStatus[category] = false;

        // Show user-friendly error
        if (typeof showNotification === 'function') {
            showNotification(`Failed to load ${category} data. Check console for details.`, 'error');
        }

        return null;
    }
}

/**
 * Get all facilities (optionally filtered by category)
 * @param {string} category - Optional category filter
 * @returns {Array} Array of facility features
 */
function getAllFacilities(category = 'all') {
    if (category === 'all') {
        let allFacilities = [];
        Object.keys(facilityData).forEach(cat => {
            allFacilities = allFacilities.concat(facilityData[cat]);
        });
        return allFacilities;
    } else {
        return facilityData[category] || [];
    }
}

/**
 * Get total count of all facilities
 * @returns {number} Total count
 */
function getTotalFacilityCount() {
    let count = 0;
    Object.keys(facilityData).forEach(category => {
        count += facilityData[category].length;
    });
    return count;
}

/**
 * Get count of facilities by category
 * @param {string} category - Category name
 * @returns {number} Count
 */
function getFacilityCountByCategory(category) {
    if (category === 'all') {
        return getTotalFacilityCount();
    }
    return facilityData[category]?.length || 0;
}

/**
 * Parse search query to extract intent
 * Handles queries like "mosque near me", "hospitals in F-7", "PIMS"
 * @param {string} query - Search query
 * @returns {Object} Parsed query object
 */
function parseSearchQuery(query) {
    const q = query.toLowerCase().trim();

    const parsed = {
        originalQuery: query,
        facilityType: null,
        sector: null,
        nearMe: false,
        specificName: null
    };

    // Check for "near me" pattern
    if (q.includes('near me') || q.includes('nearby')) {
        parsed.nearMe = true;
        console.log('🔍 Detected "near me" query');
    }

    // Check for sector pattern (e.g., "in F-7", "F-7", "in G-11")
    const sectorMatch = q.match(/\b([a-z]-?\d{1,2})\b|in ([a-z]-?\d{1,2})/i);
    if (sectorMatch) {
        parsed.sector = (sectorMatch[1] || sectorMatch[2]).toUpperCase().replace(/([A-Z])(\d)/, '$1-$2');
        console.log(`🔍 Detected sector: ${parsed.sector}`);
    }

    // Map common terms to facility types (including Urdu transliterations)
    const typeMap = {
        'hospital': 'hospitals',
        'hospitals': 'hospitals',
        'clinic': 'hospitals',
        'doctor': 'hospitals',
        'medical': 'hospitals',

        'police': 'police-stations',
        'station': 'police-stations',
        'thana': 'police-stations',
        'rescue': 'police-stations',

        'park': 'parks',
        'parks': 'parks',
        'garden': 'parks',
        'playground': 'parks',

        'mosque': 'mosques',
        'mosques': 'mosques',
        'masjid': 'mosques',
        'masjids': 'mosques',
        'jamia': 'mosques',

        'school': 'schools',
        'schools': 'schools',
        'academy': 'schools',

        'college': 'colleges',
        'colleges': 'colleges',

        'university': 'universities',
        'universities': 'universities',
        'varsity': 'universities'
    };

    // Check for facility type
    for (const [keyword, type] of Object.entries(typeMap)) {
        if (q.includes(keyword)) {
            parsed.facilityType = type;
            console.log(`🔍 Detected facility type: ${type}`);
            break;
        }
    }

    // If no type detected, treat as specific name search
    if (!parsed.facilityType && !parsed.sector && query.length > 2) {
        parsed.specificName = query;
        console.log(`🔍 Searching for specific name: ${query}`);
    }

    return parsed;
}

/**
 * Advanced search with query parsing
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Array} Matching facilities
 */
function advancedSearch(query, filters = {}) {
    console.log(`🔎 Advanced search: "${query}"`, filters);

    if (!query || query.trim() === '') {
        return filterFacilities(getAllFacilities('all'), filters);
    }

    const parsed = parseSearchQuery(query);
    let results = [];

    // Get facilities based on parsed query
    if (parsed.facilityType) {
        results = getAllFacilities(parsed.facilityType);
    } else {
        results = getAllFacilities('all');
    }

    // Filter by sector if specified
    if (parsed.sector) {
        results = results.filter(f => {
            const facilitySector = f.properties.sector?.toUpperCase() || '';
            return facilitySector.includes(parsed.sector) ||
                   facilitySector.replace('-', '').includes(parsed.sector.replace('-', ''));
        });
    }

    // Filter by specific name if provided
    if (parsed.specificName) {
        const searchTerm = parsed.specificName.toLowerCase();
        results = results.filter(f => {
            const name = f.properties.name?.toLowerCase() || '';
            const address = f.properties.address?.toLowerCase() || '';
            const category = f.properties.category?.toLowerCase() || '';

            return name.includes(searchTerm) ||
                   address.includes(searchTerm) ||
                   category.includes(searchTerm);
        });
    }

    // Apply additional filters
    results = filterFacilities(results, filters);

    console.log(`✅ Found ${results.length} results`);
    return results;
}

/**
 * Search facilities by name or address (basic search)
 * @param {string} query - Search query
 * @param {string} category - Optional category filter
 * @returns {Array} Matching facilities
 */
function searchFacilities(query, category = 'all') {
    if (!query || query.trim() === '') {
        return getAllFacilities(category);
    }

    const searchTerm = query.toLowerCase().trim();
    const facilities = getAllFacilities(category);

    return facilities.filter(facility => {
        const name = facility.properties.name?.toLowerCase() || '';
        const address = facility.properties.address?.toLowerCase() || '';
        const sector = facility.properties.sector?.toLowerCase() || '';
        const categoryName = facility.properties.category?.toLowerCase() || '';

        return name.includes(searchTerm) ||
               address.includes(searchTerm) ||
               sector.includes(searchTerm) ||
               categoryName.includes(searchTerm);
    });
}

/**
 * Filter facilities based on multiple criteria
 * @param {Array} facilities - Facilities to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered facilities
 */
function filterFacilities(facilities, filters = {}) {
    let filtered = [...facilities];

    // Filter by rating
    if (filters.minRating) {
        filtered = filtered.filter(f => {
            const rating = f.properties.rating || 0;
            return rating >= filters.minRating;
        });
    }

    // Filter by sectors
    if (filters.sectors && filters.sectors.length > 0) {
        filtered = filtered.filter(f => {
            const sector = f.properties.sector?.toUpperCase() || '';
            return filters.sectors.some(s => sector.includes(s.toUpperCase()));
        });
    }

    // Filter by amenities/services
    if (filters.amenities && filters.amenities.length > 0) {
        filtered = filtered.filter(f => {
            const facilityAmenities = [
                ...(f.properties.amenities || []),
                ...(f.properties.services || []),
                ...(f.properties.facilities || [])
            ].map(a => a.toLowerCase());

            return filters.amenities.some(a =>
                facilityAmenities.some(fa => fa.includes(a.toLowerCase()))
            );
        });
    }

    // Filter by "open now" (24/7 or current time within timing)
    if (filters.openNow) {
        filtered = filtered.filter(f => {
            const timing = f.properties.timing?.toLowerCase() || '';
            return timing.includes('24/7') || timing.includes('24 hours');
        });
    }

    return filtered;
}

/**
 * Filter facilities by distance from a point
 * @param {number} lat - Latitude of center point
 * @param {number} lng - Longitude of center point
 * @param {number} radiusKm - Radius in kilometers
 * @param {string} category - Optional category filter
 * @returns {Array} Facilities within radius
 */
function filterByDistance(lat, lng, radiusKm, category = 'all') {
    const facilities = getAllFacilities(category);

    return facilities.filter(facility => {
        const coords = facility.geometry.coordinates;
        const facilityLng = coords[0];
        const facilityLat = coords[1];

        const distance = calculateDistance(lat, lng, facilityLat, facilityLng);
        return distance <= radiusKm;
    });
}

/**
 * Get nearby facilities sorted by distance
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {number} radiusKm - Search radius in km
 * @param {string} type - Facility type (optional)
 * @returns {Array} Facilities with distance property, sorted by distance
 */
function getNearbyFacilities(lat, lng, radiusKm = 5, type = 'all') {
    console.log(`📍 Finding facilities within ${radiusKm}km of [${lat}, ${lng}]`);

    const facilities = type === 'all' ? getAllFacilities() : getAllFacilities(type);

    // Calculate distance for each facility
    const facilitiesWithDistance = facilities.map(facility => {
        const coords = facility.geometry.coordinates;
        const distance = calculateDistance(lat, lng, coords[1], coords[0]);

        return {
            ...facility,
            distance: distance,
            distanceText: distance < 1 ?
                `${Math.round(distance * 1000)}m` :
                `${distance.toFixed(1)}km`
        };
    });

    // Filter by radius and sort by distance
    const nearby = facilitiesWithDistance
        .filter(f => f.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

    console.log(`✅ Found ${nearby.length} facilities within ${radiusKm}km`);
    return nearby;
}

/**
 * Sort facilities by distance from a point
 * @param {Array} facilities - Facilities to sort
 * @param {number} lat - Reference latitude
 * @param {number} lng - Reference longitude
 * @returns {Array} Sorted facilities with distance property
 */
function sortByDistance(facilities, lat, lng) {
    return facilities.map(facility => {
        const coords = facility.geometry.coordinates;
        const distance = calculateDistance(lat, lng, coords[1], coords[0]);

        return {
            ...facility,
            distance: distance,
            distanceText: distance < 1 ?
                `${Math.round(distance * 1000)}m` :
                `${distance.toFixed(1)}km`
        };
    }).sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Get category from facility feature
 * @param {Object} facility - Facility feature object
 * @returns {string} Category name
 */
function getCategoryFromFeature(facility) {
    // Try to determine category from the feature
    const id = facility.id || '';

    if (id.startsWith('hosp_')) return 'hospitals';
    if (id.startsWith('police_')) return 'police-stations';
    if (id.startsWith('park_')) return 'parks';
    if (id.startsWith('mosque_')) return 'mosques';
    if (id.startsWith('school_')) return 'schools';
    if (id.startsWith('college_')) return 'colleges';
    if (id.startsWith('uni_')) return 'universities';

    return 'unknown';
}

/**
 * Update facility count display
 */
function updateFacilityCount(count = null) {
    const countElement = document.getElementById('facilityCount');
    if (countElement) {
        const displayCount = count !== null ? count : getTotalFacilityCount();
        countElement.textContent = `${displayCount} facilities found`;
    }
}

/**
 * Get marker color for category
 * @param {string} category
 * @returns {string} Color code
 */
function getMarkerColor(category) {
    const colors = {
        'hospitals': '#dc2626',        // red-600
        'police-stations': '#2563eb',  // blue-600
        'parks': '#16a34a',            // green-600
        'mosques': '#9333ea',          // purple-600
        'schools': '#ea580c',          // orange-600
        'colleges': '#eab308',         // yellow-500
        'universities': '#4338ca'      // indigo-700
    };

    return colors[category] || '#6b7280'; // default gray
}

/**
 * Get icon for category
 * @param {string} category
 * @returns {string} Font Awesome icon class
 */
function getCategoryIcon(category) {
    const icons = {
        'hospitals': 'fa-hospital',
        'police-stations': 'fa-shield-alt',
        'parks': 'fa-tree',
        'mosques': 'fa-mosque',
        'schools': 'fa-school',
        'colleges': 'fa-graduation-cap',
        'universities': 'fa-university'
    };

    return icons[category] || 'fa-map-marker-alt';
}

// Initialize data loading
console.log('🚀 Data.js loaded - Ready to load facility data');
