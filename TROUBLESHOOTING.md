# 🔧 Troubleshooting Guide

## Issues Fixed in Latest Update

### ✅ Issue 1: Map in Urdu Instead of English
**Status**: FIXED
- Changed tile URL from `https://{s}.tile.openstreetmap.org/` to `https://tile.openstreetmap.org/`
- Map should now display in English

### ✅ Issue 2: Facility Data Not Loading
**Status**: FIXED with better diagnostics
- Added comprehensive error logging
- Added alerts if data fails to load
- Shows which files failed and why

### ✅ Issue 3: Location Not Detected
**Status**: FIXED with enhanced debugging
- Added detailed console logging
- Added protocol and secure context checks
- Better error messages with troubleshooting steps

---

## How to Test the Fixes

### 1. **Start Local Server**

You MUST run via a local server. Opening `index.html` directly in browser (file://) won't work due to CORS restrictions.

**Using Python 3:**
```bash
cd D:\Muaaz\islamabad-smart-city
python -m http.server 8000
```

**Using Python 2:**
```bash
cd D:\Muaaz\islamabad-smart-city
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
cd D:\Muaaz\islamabad-smart-city
npx http-server -p 8000
```

**Using PHP:**
```bash
cd D:\Muaaz\islamabad-smart-city
php -S localhost:8000
```

### 2. **Open in Browser**
```
http://localhost:8000
```

### 3. **Open Browser Console**
Press **F12** or **Ctrl+Shift+I** to open Developer Tools and view console.

---

## Testing Each Fix

### Test 1: Map Language (English)
1. Open the app
2. Look at the map labels
3. **Expected**: Street names and labels should be in English
4. **If still in Urdu**: Clear browser cache and refresh (Ctrl+Shift+R)

### Test 2: Data Loading
1. Open browser console (F12)
2. Look for these messages:
   ```
   📥 Starting to load facility data...
   ✅ Loaded X hospitals from data/hospitals.json
   ✅ Loaded X mosques from data/mosques.json
   ...
   ✅ All facility data loaded successfully!
   📊 Total facilities: 688
   ```

**If data doesn't load:**
- Check console for error messages
- Verify you're running via local server (not file://)
- Check that `data/` folder contains all 7 JSON files:
  - hospitals.json
  - police-stations.json
  - parks.json
  - mosques.json
  - schools.json
  - colleges.json
  - universities.json

### Test 3: Geolocation
1. Click "Near Me" button (green button in search bar)
2. Allow location permission when browser prompts
3. Look at console for messages:
   ```
   📍 Attempting to get user location...
   ✓ Geolocation API available
   ✓ Requesting position...
   ✅ Location obtained!
      Latitude: XX.XXXXXX
      Longitude: XX.XXXXXX
      Accuracy: XXX meters
   ```

**If location fails:**

**Error: "Permission Denied"**
- You clicked "Block" on the permission prompt
- Solution: Click the lock icon in address bar → Reset permissions → Refresh page

**Error: "Position Unavailable"**
- Your device can't determine location
- Solution: Enable GPS/location services on your device

**Error: "Timeout"**
- Taking too long to get location
- Solution: Try again, move to area with better GPS signal

**Warning: "Requires HTTPS or localhost"**
- You're not using localhost or HTTPS
- Solution: Access via `http://localhost:8000` not `file://`

---

## Common Issues & Solutions

### Issue: "No facilities found" / Map is empty
**Possible Causes:**
1. Data files not loaded
2. Running from file:// instead of local server
3. CORS errors

**Solution:**
1. Open console (F12) and check for errors
2. Make sure you're running via local server
3. Look for red error messages about CORS or fetch failures
4. Verify all JSON files are in `data/` folder

### Issue: Map shows gray tiles or doesn't load
**Possible Causes:**
1. No internet connection
2. OpenStreetMap servers down
3. Browser blocking requests

**Solution:**
1. Check your internet connection
2. Open browser console and look for tile loading errors
3. Try refreshing the page (Ctrl+R)
4. Try different browser

### Issue: "Near Me" button does nothing
**Possible Causes:**
1. Location permissions blocked
2. Not running on localhost/HTTPS
3. Device location services disabled

**Solution:**
1. Check browser permissions (lock icon in address bar)
2. Access via `http://localhost:8000`
3. Enable location services on your device
4. Open console (F12) to see detailed error messages

### Issue: Search doesn't work
**Possible Causes:**
1. No facilities loaded
2. JavaScript errors

**Solution:**
1. Open console (F12) and check for errors
2. Verify facility count shows in top right
3. Try refreshing the page

---

## Console Diagnostic Commands

Open browser console (F12) and run these commands:

### Check if facilities loaded:
```javascript
getTotalFacilityCount()
```
Should return: `688`

### Check each category:
```javascript
console.log({
    hospitals: getFacilityCountByCategory('hospitals'),
    police: getFacilityCountByCategory('police-stations'),
    parks: getFacilityCountByCategory('parks'),
    mosques: getFacilityCountByCategory('mosques'),
    schools: getFacilityCountByCategory('schools'),
    colleges: getFacilityCountByCategory('colleges'),
    universities: getFacilityCountByCategory('universities')
});
```

### Test geolocation manually:
```javascript
navigator.geolocation.getCurrentPosition(
    pos => console.log('✅ Location:', pos.coords.latitude, pos.coords.longitude),
    err => console.error('❌ Error:', err.message)
);
```

### Check if map initialized:
```javascript
console.log('Map:', map);
console.log('Marker cluster:', markerClusterGroup);
```

---

## Browser Compatibility

**Recommended Browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**Not Supported:**
- ❌ Internet Explorer
- ❌ Very old browser versions

---

## Still Having Issues?

1. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Firefox: Ctrl+Shift+Delete → Cached Web Content

2. **Try Different Browser**:
   - Test in Chrome if using Firefox, or vice versa

3. **Check Console for Errors**:
   - Press F12
   - Look for red error messages
   - Copy error messages for troubleshooting

4. **Verify File Structure**:
   ```
   islamabad-smart-city/
   ├── index.html
   ├── data/
   │   ├── hospitals.json ✓
   │   ├── police-stations.json ✓
   │   ├── parks.json ✓
   │   ├── mosques.json ✓
   │   ├── schools.json ✓
   │   ├── colleges.json ✓
   │   └── universities.json ✓
   └── assets/
       ├── css/
       │   └── style.css
       └── js/
           ├── main.js
           ├── map.js
           ├── data.js
           ├── routing.js
           ├── favorites.js
           └── utils.js
   ```

---

## Expected Console Output (Success)

When everything works correctly, you should see:

```
⚙️  Main.js loaded
🗺️  Map.js loaded - Ready to initialize map
🚀 Data.js loaded - Ready to load facility data
💖 Favorites.js loaded
🛣️  Routing.js loaded
🔧 Utils.js loaded
🚀 DOM loaded - Initializing application...
🗺️  Initializing Leaflet map...
✅ Map div found: [object HTMLDivElement]
✅ Map instance created
✅ OpenStreetMap tiles added
✅ Map initialized successfully!
📍 Center: 33.6844, 73.0479
🔍 Zoom level: 12
📥 Starting to load facility data...
   Current URL: http://localhost:8000/
   Data path: data/
   Categories to load: ["hospitals", "police-stations", "parks", ...]
📥 Attempting to load: data/hospitals.json
✅ Loaded 75 hospitals from data/hospitals.json
📥 Attempting to load: data/police-stations.json
✅ Loaded 35 police-stations from data/police-stations.json
... (more categories)
📊 Loading complete: 7/7 categories loaded
📊 Total facilities: 688
✅ All facility data loaded successfully!
📌 Adding 688 markers for all...
✅ Added 688 markers to map
🎯 Setting up event listeners...
✅ Event listeners set up successfully
✅ Main.js initialized - Application ready!
🎉 Map initialization complete!
```

---

## Contact & Support

If you continue to have issues after following this guide:
1. Note the exact error messages from console
2. Note which step fails (map loading, data loading, or geolocation)
3. Include browser and OS information
4. Check README.md for additional information

---

*Last Updated: January 2025*
