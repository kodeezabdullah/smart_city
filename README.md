# 🗺️ Islamabad Smart City WebGIS

A comprehensive, interactive Geographic Information System (WebGIS) for discovering and navigating civic facilities across Islamabad, Pakistan. Built with modern web technologies, this application helps residents and visitors find hospitals, schools, parks, mosques, police stations, and educational institutions with ease.

![Islamabad Smart City](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Core Functionality
- **Interactive Map**: Leaflet.js-powered map with OpenStreetMap tiles
- **688+ Facilities**: Comprehensive database covering 7 categories
- **Smart Search**: Natural language query parsing (e.g., "mosque near me", "hospitals in F-7")
- **Category Filters**: Quick filtering by facility type
- **Marker Clustering**: Performance-optimized for large datasets

### Advanced Features
- **Turn-by-Turn Directions**: OSRM-powered routing with step-by-step navigation
- **Near Me**: Geolocation-based facility discovery with radius filtering (1-10km)
- **Favorites System**: Save favorite locations with localStorage persistence
- **Search History**: Track and revisit recent searches
- **Drawing Tools**: Draw circles to search custom areas
- **Distance Calculations**: Haversine formula for accurate distance measurements

### User Experience
- **Dual View Modes**: Toggle between map and list views
- **Detailed Facility Info**: Comprehensive details with ratings, hours, and amenities
- **Statistics Dashboard**: Interactive charts showing facility distribution
- **Share & Export**: Share locations via WhatsApp/social media, export data to CSV
- **Print Support**: Optimized print layouts for directions
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators

## 📊 Data Coverage

| Category | Count | Icon |
|----------|-------|------|
| 🏥 Hospitals | 75 | Medical facilities, clinics, diagnostic centers |
| 🛡️ Police Stations | 35 | Police stations, traffic posts, Rescue 1122 |
| 🌳 Parks | 82 | Public parks, sector parks, sports complexes |
| 🕌 Mosques | 250 | Major mosques, sector mosques, prayer halls |
| 🎓 Schools | 175 | Government, private, and international schools |
| 🎓 Colleges | 46 | Government and private colleges |
| 🏛️ Universities | 25 | Major universities (NUST, QAU, COMSATS, etc.) |

**Total**: 688 facilities across Islamabad

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom styles with animations and transitions
- **Tailwind CSS 2.2.19**: Utility-first CSS framework
- **JavaScript (ES6+)**: Vanilla JS, no framework dependencies

### Mapping & Visualization
- **Leaflet.js 1.9.4**: Interactive map library
- **OpenStreetMap**: Free, community-driven map data
- **Leaflet.markercluster 1.5.3**: Marker clustering for performance
- **Leaflet Routing Machine 3.2.12**: Turn-by-turn directions
- **Leaflet Draw 1.0.4**: Drawing and measurement tools
- **OSRM**: Open Source Routing Machine for route calculation

### Data Visualization
- **Chart.js 3.9.1**: Interactive doughnut chart for statistics

### APIs & Services
- **Geolocation API**: Browser-based location services
- **Web Share API**: Native sharing on supported devices
- **localStorage**: Client-side data persistence

## 📁 Project Structure

```
islamabad-smart-city/
├── index.html                 # Main HTML file
├── README.md                  # Project documentation
├── test-map.html             # Map testing utility
├── assets/
│   ├── css/
│   │   └── style.css         # Custom styles and animations
│   └── js/
│       ├── main.js           # Main application logic & event listeners
│       ├── map.js            # Map initialization & marker management
│       ├── data.js           # Data loading, search, and filtering
│       ├── routing.js        # Turn-by-turn directions functionality
│       ├── favorites.js      # Favorites & search history management
│       └── utils.js          # Export, share, statistics utilities
└── data/
    ├── hospitals.json        # 75 hospital facilities
    ├── police-stations.json  # 35 police facilities
    ├── parks.json            # 82 park facilities
    ├── mosques.json          # 250 mosque facilities
    ├── schools.json          # 175 school facilities
    ├── colleges.json         # 46 college facilities
    └── universities.json     # 25 university facilities
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Local web server (for local development)
- Internet connection (for map tiles and routing)

### Installation

1. **Clone or Download**:
   ```bash
   git clone https://github.com/yourusername/islamabad-smart-city.git
   cd islamabad-smart-city
   ```

2. **Serve Locally**:

   **Option A: Python**
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Node.js**
   ```bash
   npx http-server -p 8000
   ```

   **Option C: PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open in Browser**:
   ```
   http://localhost:8000
   ```

## 📖 User Guide

### Basic Usage

1. **View Map**: The map loads automatically with all 688 facilities
2. **Search**: Type facility name, category, or sector
3. **Filter**: Click category buttons to filter facilities
4. **View Details**: Click any marker to see facility details

### Advanced Features

- **🧭 Get Directions**: Click "Get Directions" on any facility
- **❤️ Save Favorites**: Save frequently visited places
- **📍 Near Me**: Find facilities within custom radius
- **🖊️ Draw Search**: Draw custom search areas
- **📊 Statistics**: View facility distribution charts
- **📤 Share & Export**: Share locations or export data

## 🐛 Troubleshooting

### Map Not Loading
- Check browser console (F12) for errors
- Verify internet connection
- Try opening `test-map.html` for diagnosis

### Markers Not Appearing
- Verify JSON files are in `data/` folder
- Check browser console for loading errors

### Directions Not Working
- Ensure location permissions are enabled
- Verify OSRM routing service is accessible

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support:
- **Email**: info@islamabadsmartcity.com
- **GitHub Issues**: [Report a bug](https://github.com/yourusername/islamabad-smart-city/issues)

---

**Made with ❤️ for Islamabad**

*Last Updated: January 2025*
