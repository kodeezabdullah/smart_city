// Utility functions for export, share, and statistics

console.log('🔧 Utils.js loaded');

/**
 * Generate and display statistics dashboard
 */
function generateStatistics() {
    const statsContent = document.getElementById('statsContent');
    if (!statsContent) return;

    // Calculate statistics
    const stats = {
        total: getTotalFacilityCount(),
        hospitals: getFacilityCountByCategory('hospitals'),
        police: getFacilityCountByCategory('police-stations'),
        parks: getFacilityCountByCategory('parks'),
        mosques: getFacilityCountByCategory('mosques'),
        schools: getFacilityCountByCategory('schools'),
        colleges: getFacilityCountByCategory('colleges'),
        universities: getFacilityCountByCategory('universities')
    };

    // Calculate percentages
    const percentages = {};
    Object.keys(stats).forEach(key => {
        if (key !== 'total') {
            percentages[key] = ((stats[key] / stats.total) * 100).toFixed(1);
        }
    });

    let html = `
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center">
                <div class="text-3xl font-bold">${stats.total}</div>
                <div class="text-sm opacity-90 mt-1">Total Facilities</div>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 text-center">
                <div class="text-3xl font-bold">${stats.hospitals}</div>
                <div class="text-sm opacity-90 mt-1">Hospitals</div>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 text-center">
                <div class="text-3xl font-bold">${stats.parks}</div>
                <div class="text-sm opacity-90 mt-1">Parks</div>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 text-center">
                <div class="text-3xl font-bold">${stats.mosques}</div>
                <div class="text-sm opacity-90 mt-1">Mosques</div>
            </div>
        </div>

        <!-- Distribution Chart -->
        <div class="bg-white rounded-lg p-6 mb-6 shadow">
            <h3 class="font-bold text-lg mb-4 text-gray-800">
                <i class="fas fa-chart-pie mr-2"></i> Facility Distribution
            </h3>
            <canvas id="distributionChart" style="max-height: 300px;"></canvas>
        </div>

        <!-- Category Breakdown -->
        <div class="bg-white rounded-lg p-6 mb-6 shadow">
            <h3 class="font-bold text-lg mb-4 text-gray-800">
                <i class="fas fa-list mr-2"></i> Category Breakdown
            </h3>
            <div class="space-y-3">
                ${generateStatBar('Hospitals', stats.hospitals, percentages.hospitals, '#dc2626')}
                ${generateStatBar('Police Stations', stats.police, percentages.police, '#2563eb')}
                ${generateStatBar('Parks', stats.parks, percentages.parks, '#16a34a')}
                ${generateStatBar('Mosques', stats.mosques, percentages.mosques, '#9333ea')}
                ${generateStatBar('Schools', stats.schools, percentages.schools, '#ea580c')}
                ${generateStatBar('Colleges', stats.colleges, percentages.colleges, '#eab308')}
                ${generateStatBar('Universities', stats.universities, percentages.universities, '#4338ca')}
            </div>
        </div>

        <!-- Interesting Facts -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 class="font-bold text-lg mb-4 text-gray-800">
                <i class="fas fa-lightbulb mr-2"></i> Did You Know?
            </h3>
            <ul class="space-y-2 text-gray-700">
                <li><i class="fas fa-check text-green-600 mr-2"></i> Islamabad has ${stats.mosques} mosques in our database</li>
                <li><i class="fas fa-check text-green-600 mr-2"></i> There are ${stats.parks} parks and green spaces</li>
                <li><i class="fas fa-check text-green-600 mr-2"></i> ${stats.schools + stats.colleges + stats.universities} educational institutions</li>
                <li><i class="fas fa-check text-green-600 mr-2"></i> ${stats.hospitals} healthcare facilities available</li>
                <li><i class="fas fa-check text-green-600 mr-2"></i> The largest category is ${getLargestCategory(stats)}</li>
            </ul>
        </div>
    `;

    statsContent.innerHTML = html;

    // Create pie chart
    setTimeout(() => createDistributionChart(stats), 100);
}

/**
 * Generate a statistics bar
 * @param {string} label - Category label
 * @param {number} count - Count
 * @param {number} percentage - Percentage
 * @param {string} color - Color
 * @returns {string} HTML
 */
function generateStatBar(label, count, percentage, color) {
    return `
        <div>
            <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-gray-700">${label}</span>
                <span class="text-gray-600">${count} (${percentage}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="h-3 rounded-full transition-all duration-500"
                     style="width: ${percentage}%; background-color: ${color};"></div>
            </div>
        </div>
    `;
}

/**
 * Get largest category name
 * @param {Object} stats - Statistics object
 * @returns {string} Category name
 */
function getLargestCategory(stats) {
    let max = 0;
    let maxCategory = '';

    Object.keys(stats).forEach(key => {
        if (key !== 'total' && stats[key] > max) {
            max = stats[key];
            maxCategory = key;
        }
    });

    return maxCategory.charAt(0).toUpperCase() + maxCategory.slice(1);
}

/**
 * Create distribution pie chart
 * @param {Object} stats - Statistics object
 */
function createDistributionChart(stats) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hospitals', 'Police', 'Parks', 'Mosques', 'Schools', 'Colleges', 'Universities'],
            datasets: [{
                data: [
                    stats.hospitals,
                    stats.police,
                    stats.parks,
                    stats.mosques,
                    stats.schools,
                    stats.colleges,
                    stats.universities
                ],
                backgroundColor: [
                    '#dc2626',
                    '#2563eb',
                    '#16a34a',
                    '#9333ea',
                    '#ea580c',
                    '#eab308',
                    '#4338ca'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Export facilities to CSV
 * @param {Array} facilities - Facilities to export
 * @param {string} filename - Output filename
 */
function exportToCSV(facilities, filename = 'islamabad_facilities.csv') {
    if (!facilities || facilities.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }

    // CSV headers
    let csv = 'Name,Category,Address,Sector,Phone,Latitude,Longitude\n';

    // Add rows
    facilities.forEach(facility => {
        const props = facility.properties;
        const coords = facility.geometry.coordinates;

        const row = [
            `"${props.name || ''}"`,
            `"${props.category || ''}"`,
            `"${props.address || ''}"`,
            `"${props.sector || ''}"`,
            `"${props.phone || ''}"`,
            coords[1],  // lat
            coords[0]   // lng
        ].join(',');

        csv += row + '\n';
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${facilities.length} facilities to CSV`, 'success');
    console.log(`📥 Exported ${facilities.length} facilities to ${filename}`);
}

/**
 * Export current view facilities
 */
function exportCurrentView() {
    const facilities = getAllFacilities(currentCategory);
    const filename = currentCategory === 'all'
        ? 'all_facilities.csv'
        : `${currentCategory}_facilities.csv`;

    exportToCSV(facilities, filename);
}

/**
 * Share current location/facility
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} name - Location name
 */
function shareLocation(lat, lng, name) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    const text = `${name} - Islamabad Smart City`;

    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: text,
            text: `Check out ${name} on Islamabad Smart City`,
            url: url
        }).then(() => {
            showNotification('Shared successfully', 'success');
        }).catch((error) => {
            console.log('Share failed:', error);
            copyToClipboard(url);
        });
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(url);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * Fallback copy to clipboard
 * @param {string} text - Text to copy
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showNotification('Link copied to clipboard', 'success');
    } catch (err) {
        showNotification('Failed to copy link', 'error');
    }

    document.body.removeChild(textArea);
}

/**
 * Share facility on WhatsApp
 * @param {Object} facility - Facility object
 */
function shareOnWhatsApp(facility) {
    const props = facility.properties;
    const coords = facility.geometry.coordinates;
    const url = `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;

    const message = encodeURIComponent(
        `🗺️ *${props.name}*\n\n` +
        `📍 ${props.address || props.sector}\n` +
        `📞 ${props.phone || 'N/A'}\n\n` +
        `View on map: ${url}\n\n` +
        `Shared from Islamabad Smart City`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
    showNotification('Opening WhatsApp...', 'info');
}

/**
 * Print current map view
 */
function printMap() {
    showNotification('Preparing map for print...', 'info');

    setTimeout(() => {
        window.print();
    }, 500);
}

/**
 * Open/Close Modal Functions
 */
function openStatsModal() {
    document.getElementById('statsModal').classList.remove('hidden');
    document.getElementById('statsModal').classList.add('flex');
    generateStatistics();
}

function closeStatsModal() {
    document.getElementById('statsModal').classList.add('hidden');
    document.getElementById('statsModal').classList.remove('flex');
}

function openAboutModal() {
    document.getElementById('aboutModal').classList.remove('hidden');
    document.getElementById('aboutModal').classList.add('flex');
}

function closeAboutModal() {
    document.getElementById('aboutModal').classList.add('hidden');
    document.getElementById('aboutModal').classList.remove('flex');
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    } else {
        return `${(meters / 1000).toFixed(1)} km`;
    }
}

/**
 * Format time for display
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time
 */
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }
}

/**
 * Get current timestamp
 * @returns {string} Formatted timestamp
 */
function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('✅ Utils.js initialized');
