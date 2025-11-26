'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { X, MapPin, Search, Map, Users, Mountain } from 'lucide-react';
import { fetchDistricts, fetchMapCoordinates } from '@/redux/slices/districtSlice';

export default function MeraPradeshPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { districts, mapDistricts, loading, lastFetched, mapLastFetched } = useSelector(state => state.district);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapContainerRef, setMapContainerRef] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const lastClickedMarkerRef = useRef(null); // Track last clicked marker

  // Fetch districts data on component mount
  useEffect(() => {
    // Fetch districts if not already loaded or data is stale
    if (districts.length === 0 || !lastFetched || Date.now() - lastFetched > 300000) { // 5 minutes
      dispatch(fetchDistricts());
    }
    
    // Fetch map coordinates specifically
    if (mapDistricts.length === 0 || !mapLastFetched || Date.now() - mapLastFetched > 300000) {
      dispatch(fetchMapCoordinates());
    }
  }, [dispatch, districts.length, lastFetched, mapDistricts.length, mapLastFetched]);

  // Filter districts based on search
  const filteredDistricts = districts.filter(district => {
    const searchLower = searchQuery.toLowerCase();
    return (
      district.name?.toLowerCase().includes(searchLower) ||
      (district.nameHi && district.nameHi.toLowerCase().includes(searchLower)) ||
      (district.region && district.region.toLowerCase().includes(searchLower))
    );
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef) return;

    const loadLeaflet = async () => {
      if (window.L) {
        initMap();
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.rel = 'stylesheet';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Leaflet library');
        setMapLoading(false);
      };
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!window.L || !mapContainerRef) return;

      try {
        // If map already exists, just update markers and return
        if (mapRef.current) {
          updateMapMarkers();
          return;
        }

        // Initialize map centered on MP
        const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapRef.current = map;
        
        // Fix map sizing issues
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        console.log('Map initialized successfully');
        setMapLoading(false);

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoading(false);
      }
    };

    const updateMapMarkers = () => {
      if (!mapRef.current || !window.L) return;

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Use districts that have coordinates
      const districtsWithCoords = districts.filter(district => 
        district.coordinates && 
        district.coordinates.lat && 
        district.coordinates.lng
      );

      console.log('Adding markers for districts:', districtsWithCoords);

      // Green marker icon
      const greenIcon = new window.L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add markers for each district
      districtsWithCoords.forEach(district => {
        const coords = [district.coordinates.lat, district.coordinates.lng];

        const marker = window.L.marker(coords, {
          icon: greenIcon
        }).addTo(mapRef.current);

        markersRef.current.push(marker);

        // Add click event with new behavior
        marker.on('click', () => {
          const currentMarker = marker;
          const currentCoords = coords;
          
          // Check if this is the same marker that was clicked last time
          if (lastClickedMarkerRef.current === currentMarker) {
            // Second click on same marker - show the card
            setSelectedDistrict(district);
          } else {
            // First click on this marker - only zoom, don't show card
            mapRef.current.setView(currentCoords, 9);
            lastClickedMarkerRef.current = currentMarker;
          }
        });

        // Add popup
        marker.bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 150px;">
            <div style="font-weight: bold; color: #117307; font-size: 16px; margin-bottom: 4px;">
              ${district.name || 'District'}
            </div>
            <div style="color: #0d5c06; font-size: 12px;">
              ${district.nameHi || ''}
            </div>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">
              ${district.region || 'Madhya Pradesh'} Region
            </div>
            <button 
              onclick="document.dispatchEvent(new CustomEvent('districtSelect', { detail: '${district._id}' }))"
              style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
          onmouseover="this.style.background='#0d5c06'"
          onmouseout="this.style.background='#117307'"
            >
              View Details
            </button>
          </div>
        `);
      });

      console.log(`Map markers updated with ${districtsWithCoords.length} markers`);
    };

    // Listen for district selection from popup
    const handleDistrictSelect = (event) => {
      const districtId = event.detail;
      const district = districts.find(d => d._id === districtId);
      if (district) {
        setSelectedDistrict(district);
      }
    };

    document.addEventListener('districtSelect', handleDistrictSelect);

    loadLeaflet();

    // Cleanup function
    return () => {
      document.removeEventListener('districtSelect', handleDistrictSelect);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
      lastClickedMarkerRef.current = null;
    };
  }, [mapContainerRef]);

  // Update markers when districts data changes - SIMPLIFIED VERSION
  useEffect(() => {
    if (mapRef.current && window.L && !mapLoading) {
      // Small timeout to ensure the map is ready
      const timer = setTimeout(() => {
        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Use districts that have coordinates
        const districtsWithCoords = districts.filter(district => 
          district.coordinates && 
          district.coordinates.lat && 
          district.coordinates.lng
        );

        console.log('Updating markers with districts:', districtsWithCoords);

        // Green marker icon
        const greenIcon = new window.L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add markers for each district
        districtsWithCoords.forEach(district => {
          const coords = [district.coordinates.lat, district.coordinates.lng];

          const marker = window.L.marker(coords, {
            icon: greenIcon
          }).addTo(mapRef.current);

          markersRef.current.push(marker);

          // Add click event with new behavior
          marker.on('click', () => {
            const currentMarker = marker;
            const currentCoords = coords;
            
            // Check if this is the same marker that was clicked last time
            if (lastClickedMarkerRef.current === currentMarker) {
              // Second click on same marker - show the card
              setSelectedDistrict(district);
            } else {
              // First click on this marker - only zoom, don't show card
              mapRef.current.setView(currentCoords, 9);
              lastClickedMarkerRef.current = currentMarker;
            }
          });

          marker.bindPopup(`
            <div style="text-align: center; padding: 8px; min-width: 150px;">
              <div style="font-weight: bold; color: #117307; font-size: 16px; margin-bottom: 4px;">
                ${district.name || 'District'}
              </div>
              <div style="color: #0d5c06; font-size: 12px;">
                ${district.nameHi || ''}
              </div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                ${district.region || 'Madhya Pradesh'} Region
              </div>
              <button 
                onclick="document.dispatchEvent(new CustomEvent('districtSelect', { detail: '${district._id}' }))"
                style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
          onmouseover="this.style.background='#0d5c06'"
          onmouseout="this.style.background='#117307'"
              >
                View Details
              </button>
            </div>
          `);
        });

        console.log(`Markers updated: ${districtsWithCoords.length} districts`);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [districts, mapDistricts, mapLoading]);

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
    // Pan map to selected district
    if (mapRef.current && district.coordinates) {
      mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
    }
  };

  const handleViewDetails = (slug) => {
    if (slug) {
      router.push(`/districts/${slug}`);
    }
  };

  const getDistrictEmoji = (district) => {
    const name = district.name || '';
    if (name.includes('Indore') || name.includes('Bhopal')) return '🏙️';
    if (name.includes('Khajuraho') || name.includes('Temple')) return '⛩️';
    if (name.includes('Kanha') || name.includes('Tiger')) return '🐯';
    if (name.includes('Pachmarhi') || name.includes('Hill')) return '⛰️';
    if (name.includes('Ujjain') || name.includes('Omkareshwar')) return '🕉️';
    return '🏛️';
  };

  const formatPopulation = (pop) => {
    if (!pop) return 'N/A';
    if (pop > 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
    return pop.toString();
  };

  const formatArea = (area) => {
    if (!area) return 'N/A';
    return `${area.toLocaleString()} km²`;
  };

  return (
    <div className="w-full min-h-screen bg-[#f5fbf2]">
      {/* Header */}
      <div className="py-16 px-4 md:px-8 bg-[#117307]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-6xl">🗺️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Our State Our Districts
          </h1>
          <p className="text-lg text-white opacity-95">
            Explore all districts of Madhya Pradesh
          </p>
          <img src="/images/tiger.png" alt="tiger" className='h-100 right-40 absolute hidden lg:block top-13 transform rotate-[3deg] drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)]' />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0 border-[#117307]">
          {mapLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#117307] mx-auto mb-4"></div>
                <p className="text-[#117307]">Loading map...</p>
              </div>
            </div>
          )}
          <div 
            ref={setMapContainerRef} 
            className="w-full h-96 md:h-[500px]"
          />
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#117307]" size={24} />
            <input
              type="text"
              placeholder="Search districts by name or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg border-[#117307] bg-white"
              style={{
                boxShadow: `0 0 0 0px #11730733`,
              }}
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-[#117307]">
              Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Districts Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-[#117307]">
            Click on any district to explore
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDistricts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDistricts.map((district) => (
                <div
                  key={district._id}
                  onClick={() => handleDistrictClick(district)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group border-[#117307]"
                >
                  {/* District Image */}
                  <div className="h-48 overflow-hidden relative">
                    {district.headerImage ? (
                      <img 
                        src={district.headerImage} 
                        alt={district.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(district.name);
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-6xl bg-[#f5fbf2]"
                      >
                        {getDistrictEmoji(district)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold">{district.name}</h3>
                        <p className="text-sm opacity-90">{district.nameHi || ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl mb-2 text-[#2E3A3B]">
                {districts.length === 0 ? 'No districts found' : `No districts found matching "${searchQuery}"`}
              </p>
              <p className="text-gray-600">
                {districts.length === 0 ? 'Please check your connection' : 'Try searching with different keywords'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* District Details Modal */}
      {selectedDistrict && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDistrict(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="h-64 relative overflow-hidden">
              {selectedDistrict.headerImage ? (
                <img 
                  src={selectedDistrict.headerImage} 
                  alt={selectedDistrict.name}
                  className="w-full h-full "
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedDistrict.name);
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]"
                >
                  {getDistrictEmoji(selectedDistrict)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <button
                onClick={() => setSelectedDistrict(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X size={24} className="text-[#117307]" />
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-4xl font-bold mb-2">{selectedDistrict.name}</h2>
                <p className="text-xl opacity-90">{selectedDistrict.nameHi || ''}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-8">
              {/* Description */}
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                {selectedDistrict.historyAndCulture || selectedDistrict.description || `Explore the rich heritage and culture of ${selectedDistrict.name}.`}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-bold mb-2 text-[#117307]">
                    ESTABLISHED
                  </p>
                  <p className="text-lg font-semibold text-[#2E3A3B]">
                    {selectedDistrict.formationYear || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2 text-[#117307]">
                    POPULATION
                  </p>
                  <p className="text-lg font-semibold text-[#2E3A3B]">
                    {formatPopulation(selectedDistrict.population)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2 text-[#117307]">
                    AREA
                  </p>
                  <p className="text-lg font-semibold text-[#2E3A3B]">
                    {formatArea(selectedDistrict.area)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2 text-[#117307]">
                    REGION
                  </p>
                  <p className="text-lg font-semibold text-[#2E3A3B]">
                    {selectedDistrict.region || 'Madhya Pradesh'}
                  </p>
                </div>
              </div>

              {/* Rivers */}
              {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm font-bold mb-3 text-[#117307]">
                    MAJOR RIVERS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDistrict.majorRivers.map((river, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1E88E5]"
                      >
                        {river}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleViewDetails(selectedDistrict.slug)}
                  className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307]"
                >
                  Explore District
                </button>
                <button 
                  onClick={() => setSelectedDistrict(null)}
                  className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg text-[#117307] border-2 border-[#117307]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { X, MapPin, Search, Map, Users, Mountain } from 'lucide-react';
// import { fetchDistricts, fetchMapCoordinates } from '@/redux/slices/districtSlice';

// export default function MeraPradeshPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { districts, mapDistricts, loading, lastFetched, mapLastFetched } = useSelector(state => state.district);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const [mapLoading, setMapLoading] = useState(true);
//   const mapRef = useRef(null);
//   const markersRef = useRef([]);

//   // Fetch districts data on component mount
//   useEffect(() => {
//     // Fetch districts if not already loaded or data is stale
//     if (districts.length === 0 || !lastFetched || Date.now() - lastFetched > 300000) { // 5 minutes
//       dispatch(fetchDistricts());
//     }
    
//     // Fetch map coordinates specifically
//     if (mapDistricts.length === 0 || !mapLastFetched || Date.now() - mapLastFetched > 300000) {
//       dispatch(fetchMapCoordinates());
//     }
//   }, [dispatch, districts.length, lastFetched, mapDistricts.length, mapLastFetched]);

//   // Filter districts based on search
//   const filteredDistricts = districts.filter(district => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       district.name?.toLowerCase().includes(searchLower) ||
//       (district.nameHi && district.nameHi.toLowerCase().includes(searchLower)) ||
//       (district.region && district.region.toLowerCase().includes(searchLower))
//     );
//   });

//   // Initialize Leaflet Map
//   useEffect(() => {
//     if (!mapContainerRef) return;

//     const loadLeaflet = async () => {
//       if (window.L) {
//         initMap();
//         return;
//       }

//       // Load Leaflet CSS
//       const link = document.createElement('link');
//       link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//       link.rel = 'stylesheet';
//       link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//       link.crossOrigin = '';
//       document.head.appendChild(link);

//       // Load Leaflet JS
//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//       script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//       script.crossOrigin = '';
//       script.async = true;
//       script.onload = initMap;
//       script.onerror = () => {
//         console.error('Failed to load Leaflet library');
//         setMapLoading(false);
//       };
//       document.body.appendChild(script);
//     };

//     const initMap = () => {
//       if (!window.L || !mapContainerRef) return;

//       try {
//         // If map already exists, just update markers and return
//         if (mapRef.current) {
//           updateMapMarkers();
//           return;
//         }

//         // Initialize map centered on MP
//         const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

//         // Add tile layer
//         window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '© OpenStreetMap contributors',
//           maxZoom: 19
//         }).addTo(map);

//         mapRef.current = map;
        
//         // Fix map sizing issues
//         setTimeout(() => {
//           map.invalidateSize();
//         }, 100);

//         console.log('Map initialized successfully');
//         setMapLoading(false);

//       } catch (error) {
//         console.error('Error initializing map:', error);
//         setMapLoading(false);
//       }
//     };

//     const updateMapMarkers = () => {
//       if (!mapRef.current || !window.L) return;

//       // Clear existing markers
//       markersRef.current.forEach(marker => {
//         mapRef.current.removeLayer(marker);
//       });
//       markersRef.current = [];

//       // Use districts that have coordinates
//       const districtsWithCoords = districts.filter(district => 
//         district.coordinates && 
//         district.coordinates.lat && 
//         district.coordinates.lng
//       );

//       console.log('Adding markers for districts:', districtsWithCoords);

//       // Green marker icon
//       const greenIcon = new window.L.Icon({
//         iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowSize: [41, 41]
//       });

//       // Add markers for each district
//       districtsWithCoords.forEach(district => {
//         const coords = [district.coordinates.lat, district.coordinates.lng];

//         const marker = window.L.marker(coords, {
//           icon: greenIcon
//         }).addTo(mapRef.current);

//         markersRef.current.push(marker);

//         // Add click event
//         marker.on('click', () => {
//           setSelectedDistrict(district);
//           mapRef.current.setView(coords, 9);
//         });

//         // Add popup
//         marker.bindPopup(`
//           <div style="text-align: center; padding: 8px; min-width: 150px;">
//             <div style="font-weight: bold; color: #117307; font-size: 16px; margin-bottom: 4px;">
//               ${district.name || 'District'}
//             </div>
//             <div style="color: #0d5c06; font-size: 12px;">
//               ${district.nameHi || ''}
//             </div>
//             <div style="color: #666; font-size: 12px; margin-top: 4px;">
//               ${district.region || 'Madhya Pradesh'} Region
//             </div>
//             <button 
//               onclick="document.dispatchEvent(new CustomEvent('districtSelect', { detail: '${district._id}' }))"
//               style="margin-top: 8px; padding: 4px 12px; background: #117307; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
//             >
//               View Details
//             </button>
//           </div>
//         `);
//       });

//       console.log(`Map markers updated with ${districtsWithCoords.length} markers`);
//     };

//     // Listen for district selection from popup
//     const handleDistrictSelect = (event) => {
//       const districtId = event.detail;
//       const district = districts.find(d => d._id === districtId);
//       if (district) {
//         setSelectedDistrict(district);
//       }
//     };

//     document.addEventListener('districtSelect', handleDistrictSelect);

//     loadLeaflet();

//     // Cleanup function
//     return () => {
//       document.removeEventListener('districtSelect', handleDistrictSelect);
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//       markersRef.current = [];
//     };
//   }, [mapContainerRef]);

//   // Update markers when districts data changes - SIMPLIFIED VERSION
//   useEffect(() => {
//     if (mapRef.current && window.L && !mapLoading) {
//       // Small timeout to ensure the map is ready
//       const timer = setTimeout(() => {
//         // Clear existing markers
//         markersRef.current.forEach(marker => {
//           mapRef.current.removeLayer(marker);
//         });
//         markersRef.current = [];

//         // Use districts that have coordinates
//         const districtsWithCoords = districts.filter(district => 
//           district.coordinates && 
//           district.coordinates.lat && 
//           district.coordinates.lng
//         );

//         console.log('Updating markers with districts:', districtsWithCoords);

//         // Green marker icon
//         const greenIcon = new window.L.Icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//           popupAnchor: [1, -34],
//           shadowSize: [41, 41]
//         });

//         // Add markers for each district
//         districtsWithCoords.forEach(district => {
//           const coords = [district.coordinates.lat, district.coordinates.lng];

//           const marker = window.L.marker(coords, {
//             icon: greenIcon
//           }).addTo(mapRef.current);

//           markersRef.current.push(marker);

//           marker.on('click', () => {
//             setSelectedDistrict(district);
//             mapRef.current.setView(coords, 9);
//           });

//           marker.bindPopup(`
//             <div style="text-align: center; padding: 8px; min-width: 150px;">
//               <div style="font-weight: bold; color: #117307; font-size: 16px; margin-bottom: 4px;">
//                 ${district.name || 'District'}
//               </div>
//               <div style="color: #0d5c06; font-size: 12px;">
//                 ${district.nameHi || ''}
//               </div>
//               <div style="color: #666; font-size: 12px; margin-top: 4px;">
//                 ${district.region || 'Madhya Pradesh'} Region
//               </div>
//               <button 
//                 onclick="document.dispatchEvent(new CustomEvent('districtSelect', { detail: '${district._id}' }))"
//                 style="margin-top: 8px; padding: 4px 12px; background: #117307; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
//               >
//                 View Details
//               </button>
//             </div>
//           `);
//         });

//         console.log(`Markers updated: ${districtsWithCoords.length} districts`);
//       }, 100);

//       return () => clearTimeout(timer);
//     }
//   }, [districts, mapDistricts, mapLoading]);

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//     // Pan map to selected district
//     if (mapRef.current && district.coordinates) {
//       mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//     }
//   };

//   const handleViewDetails = (slug) => {
//     if (slug) {
//       router.push(`/districts/${slug}`);
//     }
//   };

//   const getDistrictEmoji = (district) => {
//     const name = district.name || '';
//     if (name.includes('Indore') || name.includes('Bhopal')) return '🏙️';
//     if (name.includes('Khajuraho') || name.includes('Temple')) return '⛩️';
//     if (name.includes('Kanha') || name.includes('Tiger')) return '🐯';
//     if (name.includes('Pachmarhi') || name.includes('Hill')) return '⛰️';
//     if (name.includes('Ujjain') || name.includes('Omkareshwar')) return '🕉️';
//     return '🏛️';
//   };

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000000) return `${(pop / 1000000).toFixed(1)}M`;
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="w-full min-h-screen bg-[#f5fbf2]">
//       {/* Header */}
//       <div className="py-16 px-4 md:px-8 bg-[#117307]">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-4 text-6xl">🗺️</div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
//             Our State Our Districts
//           </h1>
//           <p className="text-lg text-white opacity-95">
//             Explore all districts of Madhya Pradesh
//           </p>
//           <img src="/images/tiger.png" alt="tiger" className='h-100 right-40 absolute hidden lg:block top-13 transform rotate-[3deg] drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)]' />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//         {/* Map Section */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0 border-[#117307]">
//           {mapLoading && (
//             <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#117307] mx-auto mb-4"></div>
//                 <p className="text-[#117307]">Loading map...</p>
//               </div>
//             </div>
//           )}
//           <div 
//             ref={setMapContainerRef} 
//             className="w-full h-96 md:h-[500px]"
//           />
//           {/* <div className="p-4 bg-gray-50 border-t">
//             <p className="text-sm text-gray-600 text-center">
//               Showing {districts.filter(d => d.coordinates && d.coordinates.lat && d.coordinates.lng).length} districts on map
//             </p>
//           </div> */}
//         </div>

//         {/* Search Section */}
//         <div className="mb-12">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#117307]" size={24} />
//             <input
//               type="text"
//               placeholder="Search districts by name or region..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg border-[#117307] bg-white"
//               style={{
//                 boxShadow: `0 0 0 0px #11730733`,
//               }}
//             />
//           </div>
//           {searchQuery && (
//             <p className="mt-2 text-sm text-[#117307]">
//               Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
//             </p>
//           )}
//         </div>

//         {/* Districts Grid */}
//         <div>
//           <h2 className="text-3xl font-bold mb-8 text-[#117307]">
//             Click on any district to explore
//           </h2>
          
//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden">
//                   <div className="h-48 bg-gray-200"></div>
//                   <div className="p-6">
//                     <div className="h-6 bg-gray-200 rounded mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredDistricts.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {filteredDistricts.map((district) => (
//                 <div
//                   key={district._id}
//                   onClick={() => handleDistrictClick(district)}
//                   className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group border-[#117307]"
//                 >
//                   {/* District Image */}
//                   <div className="h-48 overflow-hidden relative">
//                     {district.headerImage ? (
//                       <img 
//                         src={district.headerImage} 
//                         alt={district.name}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(district.name);
//                         }}
//                       />
//                     ) : (
//                       <div 
//                         className="w-full h-full flex items-center justify-center text-6xl bg-[#f5fbf2]"
//                       >
//                         {getDistrictEmoji(district)}
//                       </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
//                       <div className="text-white">
//                         <h3 className="text-2xl font-bold">{district.name}</h3>
//                         <p className="text-sm opacity-90">{district.nameHi || ''}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card Content */}
//                   {/* <div className="p-6">
//                     <div className="flex items-center gap-2 text-sm mb-3 text-[#0d5c06]">
//                       <Map size={16} />
//                       {district.region || 'Madhya Pradesh'} Region
//                     </div>
//                     {district.population && (
//                       <div className="flex items-center gap-2 text-sm mb-2 text-[#2E3A3B]">
//                         <Users size={14} />
//                         Population: {formatPopulation(district.population)}
//                       </div>
//                     )}
//                     {district.area && (
//                       <div className="flex items-center gap-2 text-sm text-[#2E3A3A3B]">
//                         <Mountain size={14} />
//                         Area: {formatArea(district.area)}
//                       </div>
//                     )}
//                     {district.coordinates && (
//                       <div className="flex items-center gap-2 text-xs mt-3 text-gray-500">
//                         <MapPin size={12} />
//                         Lat: {district.coordinates.lat}, Lng: {district.coordinates.lng}
//                       </div>
//                     )}
//                   </div> */}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🔍</div>
//               <p className="text-xl mb-2 text-[#2E3A3B]">
//                 {districts.length === 0 ? 'No districts found' : `No districts found matching "${searchQuery}"`}
//               </p>
//               <p className="text-gray-600">
//                 {districts.length === 0 ? 'Please check your connection' : 'Try searching with different keywords'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* District Details Modal */}
//       {selectedDistrict && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//           onClick={() => setSelectedDistrict(null)}
//         >
//           <div 
//             className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header with Image */}
//             <div className="h-64 relative overflow-hidden">
//               {selectedDistrict.headerImage ? (
//                 <img 
//                   src={selectedDistrict.headerImage} 
//                   alt={selectedDistrict.name}
//                   className="w-full h-full "
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedDistrict.name);
//                   }}
//                 />
//               ) : (
//                 <div 
//                   className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]"
//                 >
//                   {getDistrictEmoji(selectedDistrict)}
//                 </div>
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//               <button
//                 onClick={() => setSelectedDistrict(null)}
//                 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//               >
//                 <X size={24} className="text-[#117307]" />
//               </button>
//               <div className="absolute bottom-6 left-6 right-6 text-white">
//                 <h2 className="text-4xl font-bold mb-2">{selectedDistrict.name}</h2>
//                 <p className="text-xl opacity-90">{selectedDistrict.nameHi || ''}</p>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <div className="p-8">
//               {/* Description */}
//               <p className="text-gray-700 mb-8 leading-relaxed text-lg">
//                 {selectedDistrict.historyAndCulture || selectedDistrict.description || `Explore the rich heritage and culture of ${selectedDistrict.name}.`}
//               </p>

//               {/* Info Grid */}
//               <div className="grid grid-cols-2 gap-6 mb-8">
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     ESTABLISHED
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {selectedDistrict.formationYear || 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     POPULATION
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {formatPopulation(selectedDistrict.population)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     AREA
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {formatArea(selectedDistrict.area)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     REGION
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {selectedDistrict.region || 'Madhya Pradesh'}
//                   </p>
//                 </div>
//               </div>

//               {/* Coordinates */}
//               {/* {selectedDistrict.coordinates && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3 text-[#117307]">
//                     COORDINATES
//                   </p>
//                   <div className="flex gap-4 text-sm">
//                     <span className="px-3 py-2 bg-gray-100 rounded">
//                       Lat: {selectedDistrict.coordinates.lat}
//                     </span>
//                     <span className="px-3 py-2 bg-gray-100 rounded">
//                       Lng: {selectedDistrict.coordinates.lng}
//                     </span>
//                   </div>
//                 </div>
//               )} */}

//               {/* Rivers */}
//               {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3 text-[#117307]">
//                     MAJOR RIVERS
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedDistrict.majorRivers.map((river, idx) => (
//                       <span
//                         key={idx}
//                         className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1E88E5]"
//                       >
//                         {river}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => handleViewDetails(selectedDistrict.slug)}
//                   className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307]"
//                 >
//                   Explore District
//                 </button>
//                 <button 
//                   onClick={() => setSelectedDistrict(null)}
//                   className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg text-[#117307] border-2 border-[#117307]"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
 
//       )}
//     </div>
//   );
// }


// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { X, MapPin, Search, Map, Users, Mountain } from 'lucide-react';
// import { fetchDistricts, fetchMapCoordinates } from '@/redux/slices/districtSlice';

// export default function MeraPradeshPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { districts, mapDistricts, loading, lastFetched, mapLastFetched } = useSelector(state => state.district);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const mapRef = useRef(null);

//   // Filter districts based on search
//   const filteredDistricts = districts.filter(district => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       district.name?.toLowerCase().includes(searchLower) ||
//       (district.nameHi && district.nameHi.toLowerCase().includes(searchLower)) ||
//       (district.region && district.region.toLowerCase().includes(searchLower))
//     );
//   });

//   // Initialize Leaflet Map with FIXED coordinate handling
//   useEffect(() => {
//     if (!mapContainerRef) return;

//     const loadLeaflet = async () => {
//       if (window.L) {
//         initMap();
//         return;
//       }

//       // Load Leaflet CSS
//       const link = document.createElement('link');
//       link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//       link.rel = 'stylesheet';
//       link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//       link.crossOrigin = '';
//       document.head.appendChild(link);

//       // Load Leaflet JS
//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//       script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//       script.crossOrigin = '';
//       script.async = true;
//       script.onload = initMap;
//       script.onerror = () => console.error('Failed to load Leaflet library');
//       document.body.appendChild(script);
//     };

//     const initMap = () => {
//       if (!window.L || !mapContainerRef) return;

//       // If map already exists, just update markers and return
//       if (mapRef.current) {
//         updateMapMarkers();
//         return;
//       }

//       try {
//         // Initialize map centered on MP
//         const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

//         // Add tile layer
//         window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '© OpenStreetMap contributors',
//           maxZoom: 19
//         }).addTo(map);

//         mapRef.current = map;
        
//         // Initial markers setup
//         updateMapMarkers();

//         // Fix map sizing issues
//         setTimeout(() => {
//           map.invalidateSize();
//         }, 100);

//         console.log('Map initialized successfully');

//       } catch (error) {
//         console.error('Error initializing map:', error);
//       }
//     };

//     const updateMapMarkers = () => {
//       if (!mapRef.current || !window.L) return;

//       // Clear existing markers
//       mapRef.current.eachLayer((layer) => {
//         if (layer instanceof window.L.Marker) {
//           mapRef.current.removeLayer(layer);
//         }
//       });

//       // Green marker icon
//       const greenIcon = new window.L.Icon({
//         iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowSize: [41, 41]
//       });

//       // Use mapDistricts if available, otherwise use districts as fallback
//       const districtsToShow = mapDistricts.length > 0 ? mapDistricts : districts;

//       // Add markers for each district - FIXED COORDINATE ACCESS
//       districtsToShow.forEach(district => {
//         // CORRECTLY access nested coordinates object
//         if (!district.coordinates || !district.coordinates.lat || !district.coordinates.lng) {
//           console.warn('District missing coordinates:', district.name);
//           return;
//         }

//         // Create coords array from nested object
//         const coords = [district.coordinates.lat, district.coordinates.lng];

//         const marker = window.L.marker(coords, {
//           icon: greenIcon
//         }).addTo(mapRef.current);

//         // Add click event
//         marker.on('click', () => {
//           setSelectedDistrict(district);
//           mapRef.current.setView(coords, 9);
//         });

//         // Add popup
//         marker.bindPopup(`
//           <div style="text-align: center; padding: 8px;">
//             <div style="font-weight: bold; color: #117307; font-size: 16px; margin-bottom: 4px;">
//               ${district.name || 'District'}
//             </div>
//             <div style="color: #0d5c06; font-size: 12px;">
//               ${district.nameHi || ''}
//             </div>
//             <div style="color: #666; font-size: 12px; margin-top: 4px;">
//               ${district.region || 'Madhya Pradesh'} Region
//             </div>
//           </div>
//         `);
//       });

//       console.log('Map markers updated with', districtsToShow.length, 'markers');
//     };

//     loadLeaflet();

//     // Cleanup function - ONLY run on component unmount
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, [mapContainerRef]); // Remove mapDistricts and districts from dependencies

//   // Separate useEffect to update markers when data changes
//   useEffect(() => {
//     if (mapRef.current && window.L) {
//       // Use a small timeout to ensure the map is ready
//       setTimeout(() => {
//         const initMap = () => {
//           if (!window.L || !mapRef.current) return;

//           // Clear existing markers
//           mapRef.current.eachLayer((layer) => {
//             if (layer instanceof window.L.Marker) {
//               mapRef.current.removeLayer(layer);
//             }
//           });

//           // Green marker icon
//           const greenIcon = new window.L.Icon({
//             iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//             shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//             iconSize: [25, 41],
//             iconAnchor: [12, 41],
//             popupAnchor: [1, -34],
//             shadowSize: [41, 41]
//           });

//           // Use mapDistricts if available, otherwise use districts as fallback
//           const districtsToShow = mapDistricts.length > 0 ? mapDistricts : districts;

//           // Add markers for each district
//           districtsToShow.forEach(district => {
//             if (!district.coordinates || !district.coordinates.lat || !district.coordinates.lng) {
//               console.warn('District missing coordinates:', district.name);
//               return;
//             }

//             const coords = [district.coordinates.lat, district.coordinates.lng];

//             const marker = window.L.marker(coords, {
//               icon: greenIcon
//             }).addTo(mapRef.current);

//             marker.on('click', () => {
//               setSelectedDistrict(district);
//               mapRef.current.setView(coords, 9);
//             });

//             marker.bindPopup(`
//               <div style="text-align: center; padding: 8px;">
//                 <div style="font-weight: bold; color: #117307; font-size: 16px; margin-bottom: 4px;">
//                   ${district.name || 'District'}
//                 </div>
//                 <div style="color: #0d5c06; font-size: 12px;">
//                   ${district.nameHi || ''}
//                 </div>
//                 <div style="color: #666; font-size: 12px; margin-top: 4px;">
//                   ${district.region || 'Madhya Pradesh'} Region
//                 </div>
//               </div>
//             `);
//           });
//         };

//         initMap();
//       }, 100);
//     }
//   }, [mapDistricts, districts]); // This effect handles marker updates

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//     // Pan map to selected district
//     if (mapRef.current && district.coordinates) {
//       mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//     }
//   };

//   const handleViewDetails = (slug) => {
//     if (slug) {
//       router.push(`/districts/${slug}`);
//     }
//   };

//   const getDistrictEmoji = (district) => {
//     const name = district.name || '';
//     if (name.includes('Indore') || name.includes('Bhopal')) return '🏙️';
//     if (name.includes('Khajuraho') || name.includes('Temple')) return '⛩️';
//     if (name.includes('Kanha') || name.includes('Tiger')) return '🐯';
//     if (name.includes('Pachmarhi') || name.includes('Hill')) return '⛰️';
//     if (name.includes('Ujjain') || name.includes('Omkareshwar')) return '🕉️';
//     return '🏛️';
//   };

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000000) return `${(pop / 1000000).toFixed(1)}M`;
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="w-full min-h-screen bg-[#f5fbf2]">
//       {/* Header */}
      
//       <div className="py-16 px-4 md:px-8 bg-[#117307]">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-4 text-6xl">🗺️</div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
//             Our State Our Districts
//           </h1>
//           <p className="text-lg text-white opacity-95">
//             Explore all districts of Madhya Pradesh
//           </p>
//           <img src="/images/tiger.png" alt="tiger" className='h-100 right-40 absolute hidden lg:block top-13 transform rotate-[3deg] drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)]' />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//         {/* Map Section */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0 border-[#117307]">
//           <div ref={setMapContainerRef} className="w-full h-96 md:h-[500px]" />
//         </div>

//         {/* Search Section */}
//         <div className="mb-12">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#117307]" size={24} />
//             <input
//               type="text"
//               placeholder="Search districts by name or region..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg border-[#117307] bg-white"
//               style={{
//                 boxShadow: `0 0 0 0px #11730733`,
//               }}
//             />
//           </div>
//           {searchQuery && (
//             <p className="mt-2 text-sm text-[#117307]">
//               Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
//             </p>
//           )}
//         </div>

//         {/* Districts Grid */}
//         <div>
//           <h2 className="text-3xl font-bold mb-8 text-[#117307]">
//             Click on any district to explore
//           </h2>
          
//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden">
//                   <div className="h-48 bg-gray-200"></div>
//                   <div className="p-6">
//                     <div className="h-6 bg-gray-200 rounded mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredDistricts.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {filteredDistricts.map((district) => (
//                 <div
//                   key={district._id}
//                   onClick={() => handleDistrictClick(district)}
//                   className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group border-[#117307]"
//                 >
//                   {/* District Image */}
//                   <div className="h-48 overflow-hidden relative">
//                     {district.headerImage ? (
//                       <img 
//                         src={district.headerImage} 
//                         alt={district.name}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(district.name);
//                         }}
//                       />
//                     ) : (
//                       <div 
//                         className="w-full h-full flex items-center justify-center text-6xl bg-[#f5fbf2]"
//                       >
//                         {getDistrictEmoji(district)}
//                       </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
//                       <div className="text-white">
//                         <h3 className="text-2xl font-bold">{district.name}</h3>
//                         <p className="text-sm opacity-90">{district.nameHi || ''}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card Content */}
//                   <div className="p-6">
//                     <div className="flex items-center gap-2 text-sm mb-3 text-[#0d5c06]">
//                       <Map size={16} />
//                       {district.region || 'Madhya Pradesh'} Region
//                     </div>
//                     {district.population && (
//                       <div className="flex items-center gap-2 text-sm mb-2 text-[#2E3A3B]">
//                         <Users size={14} />
//                         Population: {formatPopulation(district.population)}
//                       </div>
//                     )}
//                     {district.area && (
//                       <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                         <Mountain size={14} />
//                         Area: {formatArea(district.area)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🔍</div>
//               <p className="text-xl mb-2 text-[#2E3A3B]">
//                 {districts.length === 0 ? 'No districts found' : `No districts found matching "${searchQuery}"`}
//               </p>
//               <p className="text-gray-600">
//                 {districts.length === 0 ? 'Please check your connection' : 'Try searching with different keywords'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* District Details Modal */}
//       {selectedDistrict && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//           onClick={() => setSelectedDistrict(null)}
//         >
//           <div 
//             className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header with Image */}
//             <div className="h-64 relative overflow-hidden">
//               {selectedDistrict.headerImage ? (
//                 <img 
//                   src={selectedDistrict.headerImage} 
//                   alt={selectedDistrict.name}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedDistrict.name);
//                   }}
//                 />
//               ) : (
//                 <div 
//                   className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]"
//                 >
//                   {getDistrictEmoji(selectedDistrict)}
//                 </div>
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//               <button
//                 onClick={() => setSelectedDistrict(null)}
//                 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//               >
//                 <X size={24} className="text-[#117307]" />
//               </button>
//               <div className="absolute bottom-6 left-6 right-6 text-white">
//                 <h2 className="text-4xl font-bold mb-2">{selectedDistrict.name}</h2>
//                 <p className="text-xl opacity-90">{selectedDistrict.nameHi || ''}</p>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <div className="p-8">
//               {/* Description */}
//               <p className="text-gray-700 mb-8 leading-relaxed text-lg">
//                 {selectedDistrict.historyAndCulture || selectedDistrict.description || `Explore the rich heritage and culture of ${selectedDistrict.name}.`}
//               </p>

//               {/* Info Grid */}
//               <div className="grid grid-cols-2 gap-6 mb-8">
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     ESTABLISHED
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {selectedDistrict.formationYear || 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     POPULATION
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {formatPopulation(selectedDistrict.population)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     AREA
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {formatArea(selectedDistrict.area)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2 text-[#117307]">
//                     REGION
//                   </p>
//                   <p className="text-lg font-semibold text-[#2E3A3B]">
//                     {selectedDistrict.region || 'Madhya Pradesh'}
//                   </p>
//                 </div>
//               </div>

//               {/* Rivers */}
//               {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3 text-[#117307]">
//                     MAJOR RIVERS
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedDistrict.majorRivers.map((river, idx) => (
//                       <span
//                         key={idx}
//                         className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1E88E5]"
//                       >
//                         {river}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Tourist Places */}
//               {selectedDistrict.touristPlaces && selectedDistrict.touristPlaces.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3 text-[#117307]">
//                     MAJOR TOURIST PLACES
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {selectedDistrict.touristPlaces.map((place, idx) => (
//                       <div 
//                         key={idx}
//                         className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fbf2]"
//                       >
//                         <MapPin size={18} className="text-[#117307]" />
//                         <span className="text-[#2E3A3B]">
//                           {typeof place === 'string' ? place : place.name}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => handleViewDetails(selectedDistrict.slug)}
//                   className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307]"
//                 >
//                   Explore District
//                 </button>
//                 <button 
//                   onClick={() => setSelectedDistrict(null)}
//                   className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg text-[#117307] border-2 border-[#117307]"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { X, MapPin, Search, Map, Users, Mountain } from 'lucide-react';
// import { fetchDistricts, fetchMapCoordinates } from '@/redux/slices/districtSlice';

// export default function MeraPradeshPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { districts, mapDistricts, loading, lastFetched, mapLastFetched } = useSelector(state => state.district);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const mapRef = useRef(null);

//   const colors = {
//     primary: '#138808',
//     primaryDark: '#0A5C08',
//     secondary: '#1E88E5',
//     white: '#FFFFFF',
//     bgColor: '#F8FDF7',
//     black: '#2E3A3B',
//   };
//   // Filter districts based on search
//   const filteredDistricts = districts.filter(district => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       district.name?.toLowerCase().includes(searchLower) ||
//       (district.nameHi && district.nameHi.toLowerCase().includes(searchLower)) ||
//       (district.region && district.region.toLowerCase().includes(searchLower))
//     );
//   });

//   // Fetch districts data from Redux with cache check
//   // useEffect(() => {
//   //   // Only fetch if data is not cached or older than 5 minutes
//   //   const shouldFetchDistricts = !lastFetched || (Date.now() - lastFetched) > 300000;
//   //   const shouldFetchMap = !mapLastFetched || (Date.now() - mapLastFetched) > 300000;

//   //   if (shouldFetchDistricts) {
//   //     dispatch(fetchDistricts());
//   //   }
//   //   if (shouldFetchMap) {
//   //     dispatch(fetchMapCoordinates());
//   //   }
//   // }, [dispatch, lastFetched, mapLastFetched]);


//   // // Initialize Leaflet Map with FIXED coordinate handling
//   // useEffect(() => {
//   //   if (!mapContainerRef) return;

//   //   const loadLeaflet = async () => {
//   //     if (window.L) {
//   //       initMap();
//   //       return;
//   //     }

//   //     // Load Leaflet CSS
//   //     const link = document.createElement('link');
//   //     link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//   //     link.rel = 'stylesheet';
//   //     link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//   //     link.crossOrigin = '';
//   //     document.head.appendChild(link);

//   //     // Load Leaflet JS
//   //     const script = document.createElement('script');
//   //     script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//   //     script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//   //     script.crossOrigin = '';
//   //     script.async = true;
//   //     script.onload = initMap;
//   //     script.onerror = () => console.error('Failed to load Leaflet library');
//   //     document.body.appendChild(script);
//   //   };

//   //   const initMap = () => {
//   //     if (!window.L || mapRef.current || !mapContainerRef) return;

//   //     try {
//   //       // Initialize map centered on MP
//   //       const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

//   //       // Add tile layer
//   //       window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   //         attribution: '© OpenStreetMap contributors',
//   //         maxZoom: 19
//   //       }).addTo(map);

//   //       // Green marker icon
//   //       const greenIcon = new window.L.Icon({
//   //         iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//   //         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   //         iconSize: [25, 41],
//   //         iconAnchor: [12, 41],
//   //         popupAnchor: [1, -34],
//   //         shadowSize: [41, 41]
//   //       });

//   //       // Use mapDistricts if available, otherwise use districts as fallback
//   //       const districtsToShow = mapDistricts.length > 0 ? mapDistricts : districts;

//   //       // Add markers for each district - FIXED COORDINATE ACCESS
//   //       districtsToShow.forEach(district => {
//   //         // CORRECTLY access nested coordinates object
//   //         if (!district.coordinates || !district.coordinates.lat || !district.coordinates.lng) {
//   //           console.warn('District missing coordinates:', district.name);
//   //           return;
//   //         }

//   //         // Create coords array from nested object
//   //         const coords = [district.coordinates.lat, district.coordinates.lng];

//   //         const marker = window.L.marker(coords, {
//   //           icon: greenIcon
//   //         }).addTo(map);

//   //         // Add click event
//   //         marker.on('click', () => {
//   //           setSelectedDistrict(district);
//   //           map.setView(coords, 9);
//   //         });

//   //         // Add popup
//   //         marker.bindPopup(`
//   //           <div style="text-align: center; padding: 8px;">
//   //             <div style="font-weight: bold; color: ${colors.primary}; font-size: 16px; margin-bottom: 4px;">
//   //               ${district.name || 'District'}
//   //             </div>
//   //             <div style="color: ${colors.primaryDark}; font-size: 12px;">
//   //               ${district.nameHi || ''}
//   //             </div>
//   //             <div style="color: #666; font-size: 12px; margin-top: 4px;">
//   //               ${district.region || 'Madhya Pradesh'} Region
//   //             </div>
//   //           </div>
//   //         `);
//   //       });

//   //       mapRef.current = map;

//   //       // Fix map sizing issues
//   //       setTimeout(() => {
//   //         map.invalidateSize();
//   //       }, 100);

//   //       console.log('Map initialized successfully with', districtsToShow.length, 'markers');

//   //     } catch (error) {
//   //       console.error('Error initializing map:', error);
//   //     }
//   //   };

//   //   loadLeaflet();

//   //   // Cleanup function
//   //   return () => {
//   //     if (mapRef.current) {
//   //       mapRef.current.remove();
//   //       mapRef.current = null;
//   //     }
//   //   };
//   // }, [mapContainerRef, mapDistricts, districts, colors.primary, colors.primaryDark]);// Initialize Leaflet Map with FIXED coordinate handling
// useEffect(() => {
//   if (!mapContainerRef) return;

//   const loadLeaflet = async () => {
//     if (window.L) {
//       initMap();
//       return;
//     }

//     // Load Leaflet CSS
//     const link = document.createElement('link');
//     link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//     link.rel = 'stylesheet';
//     link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//     link.crossOrigin = '';
//     document.head.appendChild(link);

//     // Load Leaflet JS
//     const script = document.createElement('script');
//     script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//     script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//     script.crossOrigin = '';
//     script.async = true;
//     script.onload = initMap;
//     script.onerror = () => console.error('Failed to load Leaflet library');
//     document.body.appendChild(script);
//   };

//   const initMap = () => {
//     if (!window.L || !mapContainerRef) return;

//     // If map already exists, just update markers and return
//     if (mapRef.current) {
//       updateMapMarkers();
//       return;
//     }

//     try {
//       // Initialize map centered on MP
//       const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

//       // Add tile layer
//       window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors',
//         maxZoom: 19
//       }).addTo(map);

//       mapRef.current = map;
      
//       // Initial markers setup
//       updateMapMarkers();

//       // Fix map sizing issues
//       setTimeout(() => {
//         map.invalidateSize();
//       }, 100);

//       console.log('Map initialized successfully');

//     } catch (error) {
//       console.error('Error initializing map:', error);
//     }
//   };

//   const updateMapMarkers = () => {
//     if (!mapRef.current || !window.L) return;

//     // Clear existing markers
//     mapRef.current.eachLayer((layer) => {
//       if (layer instanceof window.L.Marker) {
//         mapRef.current.removeLayer(layer);
//       }
//     });

//     // Green marker icon
//     const greenIcon = new window.L.Icon({
//       iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowSize: [41, 41]
//     });

//     // Use mapDistricts if available, otherwise use districts as fallback
//     const districtsToShow = mapDistricts.length > 0 ? mapDistricts : districts;

//     // Add markers for each district - FIXED COORDINATE ACCESS
//     districtsToShow.forEach(district => {
//       // CORRECTLY access nested coordinates object
//       if (!district.coordinates || !district.coordinates.lat || !district.coordinates.lng) {
//         console.warn('District missing coordinates:', district.name);
//         return;
//       }

//       // Create coords array from nested object
//       const coords = [district.coordinates.lat, district.coordinates.lng];

//       const marker = window.L.marker(coords, {
//         icon: greenIcon
//       }).addTo(mapRef.current);

//       // Add click event
//       marker.on('click', () => {
//         setSelectedDistrict(district);
//         mapRef.current.setView(coords, 9);
//       });

//       // Add popup
//       marker.bindPopup(`
//         <div style="text-align: center; padding: 8px;">
//           <div style="font-weight: bold; color: ${colors.primary}; font-size: 16px; margin-bottom: 4px;">
//             ${district.name || 'District'}
//           </div>
//           <div style="color: ${colors.primaryDark}; font-size: 12px;">
//             ${district.nameHi || ''}
//           </div>
//           <div style="color: #666; font-size: 12px; margin-top: 4px;">
//             ${district.region || 'Madhya Pradesh'} Region
//           </div>
//         </div>
//       `);
//     });

//     console.log('Map markers updated with', districtsToShow.length, 'markers');
//   };

//   loadLeaflet();

//   // Cleanup function - ONLY run on component unmount
//   return () => {
//     if (mapRef.current) {
//       mapRef.current.remove();
//       mapRef.current = null;
//     }
//   };
// }, [mapContainerRef]); // Remove mapDistricts and districts from dependencies

// // Separate useEffect to update markers when data changes
// useEffect(() => {
//   if (mapRef.current && window.L) {
//     // Use a small timeout to ensure the map is ready
//     setTimeout(() => {
//       const initMap = () => {
//         if (!window.L || !mapRef.current) return;

//         // Clear existing markers
//         mapRef.current.eachLayer((layer) => {
//           if (layer instanceof window.L.Marker) {
//             mapRef.current.removeLayer(layer);
//           }
//         });

//         // Green marker icon
//         const greenIcon = new window.L.Icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//           popupAnchor: [1, -34],
//           shadowSize: [41, 41]
//         });

//         // Use mapDistricts if available, otherwise use districts as fallback
//         const districtsToShow = mapDistricts.length > 0 ? mapDistricts : districts;

//         // Add markers for each district
//         districtsToShow.forEach(district => {
//           if (!district.coordinates || !district.coordinates.lat || !district.coordinates.lng) {
//             console.warn('District missing coordinates:', district.name);
//             return;
//           }

//           const coords = [district.coordinates.lat, district.coordinates.lng];

//           const marker = window.L.marker(coords, {
//             icon: greenIcon
//           }).addTo(mapRef.current);

//           marker.on('click', () => {
//             setSelectedDistrict(district);
//             mapRef.current.setView(coords, 9);
//           });

//           marker.bindPopup(`
//             <div style="text-align: center; padding: 8px;">
//               <div style="font-weight: bold; color: ${colors.primary}; font-size: 16px; margin-bottom: 4px;">
//                 ${district.name || 'District'}
//               </div>
//               <div style="color: ${colors.primaryDark}; font-size: 12px;">
//                 ${district.nameHi || ''}
//               </div>
//               <div style="color: #666; font-size: 12px; margin-top: 4px;">
//                 ${district.region || 'Madhya Pradesh'} Region
//               </div>
//             </div>
//           `);
//         });
//       };

//       initMap();
//     }, 100);
//   }
// }, [mapDistricts, districts, colors.primary, colors.primaryDark]); // This effect handles marker updates

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//     // Pan map to selected district
//     if (mapRef.current && district.coordinates) {
//       mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//     }
//   };

//   const handleViewDetails = (slug) => {
//     if (slug) {
//       router.push(`/districts/${slug}`);
//     }
//   };

//   const getDistrictEmoji = (district) => {
//     const name = district.name || '';
//     if (name.includes('Indore') || name.includes('Bhopal')) return '🏙️';
//     if (name.includes('Khajuraho') || name.includes('Temple')) return '⛩️';
//     if (name.includes('Kanha') || name.includes('Tiger')) return '🐯';
//     if (name.includes('Pachmarhi') || name.includes('Hill')) return '⛰️';
//     if (name.includes('Ujjain') || name.includes('Omkareshwar')) return '🕉️';
//     return '🏛️';
//   };

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000000) return `${(pop / 1000000).toFixed(1)}M`;
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Header */}
//       {/* <div className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.primary }}>
//         <div className="max-w-7xl mx-auto relative">
//           <div className="mb-4 text-6xl">🗺️</div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
//             Mera Pradesh Mera Jila
//           </h1>
//           <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
//             Explore all districts of Madhya Pradesh
//           </p>
//           <img 
//             src="/images/tiger.png" 
//             alt="tiger" 
//             className='h-32 md:h-40 absolute right-0 top-0 transform rotate-[3deg] drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] hidden md:block' 
//           />
//         </div>
//       </div> */}
// <div className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.primary }}>
//            <div className="max-w-7xl px-35">
//              <div className="mb-4 text-6xl">🗺️</div>
//              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
//                Our State Our Districts
//              </h1>
//              <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
//                Explore all districts of Madhya Pradesh
//              </p>
//              <img src="/images/tiger.png" alt="tiger" className='h-100 right-40 absolute top-13 transform rotate-[3deg] drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)]' />
//            </div>
//          </div>
//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//         {/* Map Section */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0" style={{ borderTopColor: colors.primary }}>
//           <div ref={setMapContainerRef} className="w-full h-96 md:h-[500px]" />
//         </div>

//         {/* Search Section */}
//         <div className="mb-12">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={24} style={{ color: colors.primary }} />
//             <input
//               type="text"
//               placeholder="Search districts by name or region..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg"
//               style={{
//                 borderColor: colors.primary,
//                 boxShadow: `0 0 0 0px ${colors.primary}33`,
//                 backgroundColor: colors.white
//               }}
//             />
//           </div>
//           {searchQuery && (
//             <p className="mt-2 text-sm" style={{ color: colors.primary }}>
//               Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
//             </p>
//           )}
//         </div>

//         {/* Districts Grid */}
//         <div>
//           <h2 className="text-3xl font-bold mb-8" style={{ color: colors.primary }}>
//             Click on any district to explore
//           </h2>
          
//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden">
//                   <div className="h-48 bg-gray-200"></div>
//                   <div className="p-6">
//                     <div className="h-6 bg-gray-200 rounded mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredDistricts.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {filteredDistricts.map((district) => (
//                 <div
//                   key={district._id}
//                   onClick={() => handleDistrictClick(district)}
//                   className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group"
//                   style={{ borderLeftColor: colors.primary }}
//                 >
//                   {/* District Image */}
//                   <div className="h-48 overflow-hidden relative">
//                     {district.headerImage ? (
//                       <img 
//                         src={district.headerImage} 
//                         alt={district.name}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(district.name);
//                         }}
//                       />
//                     ) : (
//                       <div 
//                         className="w-full h-full flex items-center justify-center text-6xl"
//                         style={{ backgroundColor: colors.bgColor }}
//                       >
//                         {getDistrictEmoji(district)}
//                       </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
//                       <div className="text-white">
//                         <h3 className="text-2xl font-bold">{district.name}</h3>
//                         <p className="text-sm opacity-90">{district.nameHi || ''}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card Content */}
//                   <div className="p-6">
//                     <div className="flex items-center gap-2 text-sm mb-3" style={{ color: colors.primaryDark }}>
//                       <Map size={16} />
//                       {district.region || 'Madhya Pradesh'} Region
//                     </div>
//                     {district.population && (
//                       <div className="flex items-center gap-2 text-sm mb-2" style={{ color: colors.black }}>
//                         <Users size={14} />
//                         Population: {formatPopulation(district.population)}
//                       </div>
//                     )}
//                     {district.area && (
//                       <div className="flex items-center gap-2 text-sm" style={{ color: colors.black }}>
//                         <Mountain size={14} />
//                         Area: {formatArea(district.area)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🔍</div>
//               <p className="text-xl mb-2" style={{ color: colors.black }}>
//                 {districts.length === 0 ? 'No districts found' : `No districts found matching "${searchQuery}"`}
//               </p>
//               <p className="text-gray-600">
//                 {districts.length === 0 ? 'Please check your connection' : 'Try searching with different keywords'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* District Details Modal */}
//       {selectedDistrict && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//           onClick={() => setSelectedDistrict(null)}
//         >
//           <div 
//             className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header with Image */}
//             <div className="h-64 relative overflow-hidden">
//               {selectedDistrict.headerImage ? (
//                 <img 
//                   src={selectedDistrict.headerImage} 
//                   alt={selectedDistrict.name}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedDistrict.name);
//                   }}
//                 />
//               ) : (
//                 <div 
//                   className="w-full h-full flex items-center justify-center text-8xl"
//                   style={{ backgroundColor: colors.primary }}
//                 >
//                   {getDistrictEmoji(selectedDistrict)}
//                 </div>
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//               <button
//                 onClick={() => setSelectedDistrict(null)}
//                 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//               >
//                 <X size={24} style={{ color: colors.primary }} />
//               </button>
//               <div className="absolute bottom-6 left-6 right-6 text-white">
//                 <h2 className="text-4xl font-bold mb-2">{selectedDistrict.name}</h2>
//                 <p className="text-xl opacity-90">{selectedDistrict.nameHi || ''}</p>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <div className="p-8">
//               {/* Description */}
//               <p className="text-gray-700 mb-8 leading-relaxed text-lg">
//                 {selectedDistrict.historyAndCulture || selectedDistrict.description || `Explore the rich heritage and culture of ${selectedDistrict.name}.`}
//               </p>

//               {/* Info Grid */}
//               <div className="grid grid-cols-2 gap-6 mb-8">
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     ESTABLISHED
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {selectedDistrict.formationYear || 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     POPULATION
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {formatPopulation(selectedDistrict.population)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     AREA
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {formatArea(selectedDistrict.area)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     REGION
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {selectedDistrict.region || 'Madhya Pradesh'}
//                   </p>
//                 </div>
//               </div>

//               {/* Rivers */}
//               {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                     MAJOR RIVERS
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedDistrict.majorRivers.map((river, idx) => (
//                       <span
//                         key={idx}
//                         className="px-4 py-2 rounded-full text-sm font-semibold text-white"
//                         style={{ backgroundColor: colors.secondary }}
//                       >
//                         {river}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Tourist Places */}
//               {selectedDistrict.touristPlaces && selectedDistrict.touristPlaces.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                     MAJOR TOURIST PLACES
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {selectedDistrict.touristPlaces.map((place, idx) => (
//                       <div 
//                         key={idx}
//                         className="flex items-center gap-3 p-3 rounded-lg"
//                         style={{ backgroundColor: colors.bgColor }}
//                       >
//                         <MapPin size={18} style={{ color: colors.primary }} />
//                         <span style={{ color: colors.black }}>
//                           {typeof place === 'string' ? place : place.name}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => handleViewDetails(selectedDistrict.slug)}
//                   className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg"
//                   style={{ backgroundColor: colors.primary }}
//                 >
//                   Explore District
//                 </button>
//                 <button 
//                   onClick={() => setSelectedDistrict(null)}
//                   className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg"
//                   style={{ color: colors.primary, borderWidth: '2px', borderColor: colors.primary }}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { X, MapPin, Search, Map, Users, Mountain } from 'lucide-react';

// export default function MeraPradeshPage() {
//   // Mock data structure matching your schema
//   const mockDistricts = [
//     {
//       _id: '1',
//       name: 'Indore',
//       nameHi: 'इंदौर',
//       slug: 'indore',
//       headerImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
//       region: 'Malwa',
//       population: 3272335,
//       area: 3898,
//       formationYear: 1948,
//       coordinates: { lat: 22.7196, lng: 75.8577 },
//       majorRivers: ['Khan', 'Saraswati'],
//       description: 'Indore is the largest and most populous city in Madhya Pradesh, known as the commercial capital of the state.',
//       touristPlaces: [
//         { name: 'Rajwada Palace' },
//         { name: 'Lal Bagh Palace' },
//         { name: 'Kanch Mandir' }
//       ]
//     },
//     {
//       _id: '2',
//       name: 'Bhopal',
//       nameHi: 'भोपाल',
//       slug: 'bhopal',
//       headerImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
//       region: 'Central',
//       population: 2368145,
//       area: 2772,
//       formationYear: 1972,
//       coordinates: { lat: 23.2599, lng: 77.4126 },
//       majorRivers: ['Betwa'],
//       description: 'Bhopal is the capital city of Madhya Pradesh, known for its lakes and historic monuments.',
//       touristPlaces: [
//         { name: 'Upper Lake' },
//         { name: 'Taj-ul-Masajid' },
//         { name: 'Van Vihar' }
//       ]
//     },
//     {
//       _id: '3',
//       name: 'Gwalior',
//       nameHi: 'ग्वालियर',
//       slug: 'gwalior',
//       headerImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
//       region: 'Chambal',
//       population: 2032036,
//       area: 5214,
//       formationYear: 1956,
//       coordinates: { lat: 26.2183, lng: 78.1828 },
//       majorRivers: ['Chambal'],
//       description: 'Gwalior is a historic city known for its magnificent fort and rich cultural heritage.',
//       touristPlaces: [
//         { name: 'Gwalior Fort' },
//         { name: 'Jai Vilas Palace' },
//         { name: 'Tansen Tomb' }
//       ]
//     },
//     {
//       _id: '4',
//       name: 'Jabalpur',
//       nameHi: 'जबलपुर',
//       slug: 'jabalpur',
//       headerImage: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
//       region: 'Mahakoshal',
//       population: 2460714,
//       area: 5211,
//       formationYear: 1947,
//       coordinates: { lat: 23.1815, lng: 79.9864 },
//       majorRivers: ['Narmada'],
//       description: 'Jabalpur is famous for the marble rocks at Bhedaghat and Dhuandhar Falls.',
//       touristPlaces: [
//         { name: 'Marble Rocks' },
//         { name: 'Dhuandhar Falls' },
//         { name: 'Madan Mahal Fort' }
//       ]
//     },
//     {
//       _id: '5',
//       name: 'Ujjain',
//       nameHi: 'उज्जैन',
//       slug: 'ujjain',
//       headerImage: 'https://images.unsplash.com/photo-1633453515974-ceba043c7fdb?w=800',
//       region: 'Malwa',
//       population: 1986864,
//       area: 6091,
//       formationYear: 1956,
//       coordinates: { lat: 23.1765, lng: 75.7885 },
//       majorRivers: ['Shipra'],
//       description: 'Ujjain is one of the seven sacred cities in Hinduism, famous for the Mahakaleshwar Temple.',
//       touristPlaces: [
//         { name: 'Mahakaleshwar Temple' },
//         { name: 'Ram Ghat' },
//         { name: 'Kal Bhairav Temple' }
//       ]
//     }
//   ];

//   const [districts, setDistricts] = useState(mockDistricts);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const mapRef = useRef(null);
//   const [loading] = useState(false);

//   const colors = {
//     primary: '#138808',
//     primaryLight: '#4CAF50',
//     primaryDark: '#0A5C08',
//     secondary: '#1E88E5',
//     accent: '#43A047',
//     white: '#FFFFFF',
//     bgColor: '#F8FDF7',
//     bgColor: '#E8F5E9',
//     black: '#2E3A3B',
//     lightGray: '#F5F5F5',
//     text: '#374151'
//   };

//   // Filter districts based on search
//   const filteredDistricts = districts.filter(district => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       district.name?.toLowerCase().includes(searchLower) ||
//       (district.nameHi && district.nameHi.toLowerCase().includes(searchLower)) ||
//       (district.region && district.region.toLowerCase().includes(searchLower))
//     );
//   });

//   // Initialize Leaflet Map with CORRECT coordinate handling
//   useEffect(() => {
//     if (!mapContainerRef) return;

//     const loadLeaflet = async () => {
//       if (window.L) {
//         initMap();
//         return;
//       }

//       // Load Leaflet CSS
//       const link = document.createElement('link');
//       link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//       link.rel = 'stylesheet';
//       link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//       link.crossOrigin = '';
//       document.head.appendChild(link);

//       // Load Leaflet JS
//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//       script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//       script.crossOrigin = '';
//       script.async = true;
//       script.onload = initMap;
//       script.onerror = () => console.error('Failed to load Leaflet library');
//       document.body.appendChild(script);
//     };

//     const initMap = () => {
//       if (!window.L || mapRef.current || !mapContainerRef) return;

//       try {
//         // Initialize map centered on MP
//         const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

//         // Add tile layer
//         window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '© OpenStreetMap contributors',
//           maxZoom: 19
//         }).addTo(map);

//         // Green marker icon
//         const greenIcon = new window.L.Icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//           popupAnchor: [1, -34],
//           shadowSize: [41, 41]
//         });

//         // Add markers for each district - FIXED COORDINATE ACCESS
//         districts.forEach(district => {
//           // CORRECTLY access nested coordinates object
//           if (!district.coordinates || !district.coordinates.lat || !district.coordinates.lng) {
//             console.warn('District missing coordinates:', district.name);
//             return;
//           }

//           const coords = [district.coordinates.lat, district.coordinates.lng];

//           const marker = window.L.marker(coords, {
//             icon: greenIcon
//           }).addTo(map);

//           // Add click event
//           marker.on('click', () => {
//             setSelectedDistrict(district);
//             map.setView(coords, 9);
//           });

//           // Add popup
//           marker.bindPopup(`
//             <div style="text-align: center; padding: 8px;">
//               <div style="font-weight: bold; color: ${colors.primary}; font-size: 16px; margin-bottom: 4px;">
//                 ${district.name || 'District'}
//               </div>
//               <div style="color: ${colors.primaryDark}; font-size: 12px;">
//                 ${district.nameHi || ''}
//               </div>
//               <div style="color: #666; font-size: 12px; margin-top: 4px;">
//                 ${district.region || 'Madhya Pradesh'} Region
//               </div>
//             </div>
//           `);
//         });

//         mapRef.current = map;

//         // Fix map sizing issues
//         setTimeout(() => {
//           map.invalidateSize();
//         }, 100);

//         console.log('Map initialized successfully with', districts.length, 'markers');

//       } catch (error) {
//         console.error('Error initializing map:', error);
//       }
//     };

//     loadLeaflet();

//     // Cleanup function
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, [mapContainerRef, districts, colors.primary, colors.primaryDark]);

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//     // Pan map to selected district
//     if (mapRef.current && district.coordinates) {
//       mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//     }
//   };

//   const handleViewDetails = (slug) => {
//     console.log('Navigate to:', `/district/${slug}`);
//   };

//   const getDistrictEmoji = (district) => {
//     const name = district.name || '';
//     if (name.includes('Indore') || name.includes('Bhopal')) return '🏙️';
//     if (name.includes('Khajuraho') || name.includes('Temple')) return '⛩️';
//     if (name.includes('Kanha') || name.includes('Tiger')) return '🐯';
//     if (name.includes('Pachmarhi') || name.includes('Hill')) return '⛰️';
//     if (name.includes('Ujjain') || name.includes('Omkareshwar')) return '🕉️';
//     return '🏛️';
//   };

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000000) return `${(pop / 1000000).toFixed(1)}M`;
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Header */}
//       <div className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.primary }}>
//         <div className="max-w-7xl mx-auto relative">
//           <div className="mb-4 text-6xl">🗺️</div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
//             Mera Pradesh Mera Jila
//           </h1>
//           <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
//             Explore all districts of Madhya Pradesh
//           </p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//         {/* Map Section */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0" style={{ borderTopColor: colors.primary }}>
//           <div ref={setMapContainerRef} className="w-full h-96 md:h-[500px]" />
//         </div>

//         {/* Search Section */}
//         <div className="mb-12">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={24} style={{ color: colors.primary }} />
//             <input
//               type="text"
//               placeholder="Search districts by name or region..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg"
//               style={{
//                 borderColor: colors.primary,
//                 boxShadow: `0 0 0 0px ${colors.primary}33`,
//                 backgroundColor: colors.white
//               }}
//             />
//           </div>
//           {searchQuery && (
//             <p className="mt-2 text-sm" style={{ color: colors.primary }}>
//               Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
//             </p>
//           )}
//         </div>

//         {/* Districts Grid */}
//         <div>
//           <h2 className="text-3xl font-bold mb-8" style={{ color: colors.primary }}>
//             Click on any district to explore
//           </h2>
          
//           {loading ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden">
//                   <div className="h-48 bg-gray-200"></div>
//                   <div className="p-6">
//                     <div className="h-6 bg-gray-200 rounded mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded mb-4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredDistricts.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {filteredDistricts.map((district) => (
//                 <div
//                   key={district._id}
//                   onClick={() => handleDistrictClick(district)}
//                   className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group"
//                   style={{ borderLeftColor: colors.primary }}
//                 >
//                   {/* District Image */}
//                   <div className="h-48 overflow-hidden relative">
//                     <img 
//                       src={district.headerImage} 
//                       alt={district.name}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                     />
//                     <div 
//                       className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"
//                     >
//                       <div className="text-white">
//                         <h3 className="text-2xl font-bold">{district.name}</h3>
//                         <p className="text-sm opacity-90">{district.nameHi || ''}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card Content */}
//                   <div className="p-6">
//                     <div className="flex items-center gap-2 text-sm mb-3" style={{ color: colors.primaryDark }}>
//                       <Map size={16} />
//                       {district.region || 'Madhya Pradesh'} Region
//                     </div>
//                     {district.population && (
//                       <div className="flex items-center gap-2 text-sm mb-2" style={{ color: colors.black }}>
//                         <Users size={14} />
//                         Population: {formatPopulation(district.population)}
//                       </div>
//                     )}
//                     {district.area && (
//                       <div className="flex items-center gap-2 text-sm" style={{ color: colors.black }}>
//                         <Mountain size={14} />
//                         Area: {formatArea(district.area)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🔍</div>
//               <p className="text-xl mb-2" style={{ color: colors.black }}>
//                 {districts.length === 0 ? 'No districts found' : `No districts found matching "${searchQuery}"`}
//               </p>
//               <p className="text-gray-600">
//                 {districts.length === 0 ? 'Please check your connection' : 'Try searching with different keywords'}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* District Details Modal */}
//       {selectedDistrict && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//           onClick={() => setSelectedDistrict(null)}
//         >
//           <div 
//             className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header with Image */}
//             <div className="h-64 relative overflow-hidden">
//               <img 
//                 src={selectedDistrict.headerImage} 
//                 alt={selectedDistrict.name}
//                 className="w-full h-full object-cover"
//               />
//               <div 
//                 className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
//               />
//               <button
//                 onClick={() => setSelectedDistrict(null)}
//                 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//               >
//                 <X size={24} style={{ color: colors.primary }} />
//               </button>
//               <div className="absolute bottom-6 left-6 right-6 text-white">
//                 <h2 className="text-4xl font-bold mb-2">{selectedDistrict.name}</h2>
//                 <p className="text-xl opacity-90">{selectedDistrict.nameHi || ''}</p>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <div className="p-8">
//               {/* Description */}
//               <p className="text-gray-700 mb-8 leading-relaxed text-lg">
//                 {selectedDistrict.description || `Explore the rich heritage and culture of ${selectedDistrict.name}.`}
//               </p>

//               {/* Info Grid */}
//               <div className="grid grid-cols-2 gap-6 mb-8">
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     ESTABLISHED
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {selectedDistrict.formationYear || 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     POPULATION
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {formatPopulation(selectedDistrict.population)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     AREA
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {formatArea(selectedDistrict.area)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold mb-2" style={{ color: colors.primary }}>
//                     REGION
//                   </p>
//                   <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                     {selectedDistrict.region || 'Madhya Pradesh'}
//                   </p>
//                 </div>
//               </div>

//               {/* Rivers */}
//               {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                     MAJOR RIVERS
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedDistrict.majorRivers.map((river, idx) => (
//                       <span
//                         key={idx}
//                         className="px-4 py-2 rounded-full text-sm font-semibold text-white"
//                         style={{ backgroundColor: colors.secondary }}
//                       >
//                         {river}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Tourist Places */}
//               {selectedDistrict.touristPlaces && selectedDistrict.touristPlaces.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                     MAJOR TOURIST PLACES
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {selectedDistrict.touristPlaces.map((place, idx) => (
//                       <div 
//                         key={idx}
//                         className="flex items-center gap-3 p-3 rounded-lg"
//                         style={{ backgroundColor: colors.bgColor }}
//                       >
//                         <MapPin size={18} style={{ color: colors.primary }} />
//                         <span style={{ color: colors.black }}>{place.name || place}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => handleViewDetails(selectedDistrict.slug)}
//                   className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg"
//                   style={{ backgroundColor: colors.primary }}
//                 >
//                   Explore District
//                 </button>
//                 <button 
//                   onClick={() => setSelectedDistrict(null)}
//                   className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg"
//                   style={{ color: colors.primary, borderWidth: '2px', borderColor: colors.primary }}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { X, MapPin, Search, MapIcon } from 'lucide-react';

// export default function MeraPradeshPage() {
//   const router = useRouter();
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const mapRef = useRef(null);

//   const colors = {
//     saffron: '#F3902C',
//     green: '#138808',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#F5FBF2',
//     black: '#333333',
//     lightGray: '#F5F5F5'
//   };

//   // Complete Madhya Pradesh Districts Data
//   const [districts] = useState([
//     {
//       id: 1,
//       slug: 'indore',
//       nameEn: 'Indore',
//       nameHi: 'इंदौर',
//       coords: [22.7196, 75.8577],
//       region: 'West',
//       image: '🏙️',
//       established: 1886,
//       population: '3.2M',
//       area: '3,105 km²',
//       rivers: ['Narmada', 'Khan'],
//       majorTouristPlaces: ['Rajwada Palace', 'Khande Rao Market', 'Lal Bagh Palace', 'Annapurna Temple'],
//       description: 'Commercial and cultural hub of Madhya Pradesh, known for business and heritage sites.'
//     },
//     {
//       id: 2,
//       slug: 'bhopal',
//       nameEn: 'Bhopal',
//       nameHi: 'भोपाल',
//       coords: [23.1815, 77.4104],
//       region: 'Central',
//       image: '🏛️',
//       established: 1728,
//       population: '1.8M',
//       area: '2,772 km²',
//       rivers: ['Narmada', 'Bets'],
//       majorTouristPlaces: ['Taj Ul-Masajid', 'Sanchi Stupa', 'Upper & Lower Lakes', 'Van Vihar'],
//       description: 'Capital city of Madhya Pradesh, famous for lakes, mosques, and cultural heritage.'
//     },
//     {
//       id: 3,
//       slug: 'jabalpur',
//       nameEn: 'Jabalpur',
//       nameHi: 'जबलपुर',
//       coords: [23.1815, 79.9864],
//       region: 'East',
//       image: '🏞️',
//       established: 1867,
//       population: '1.3M',
//       area: '3,414 km²',
//       rivers: ['Narmada', 'Sonbhadra'],
//       majorTouristPlaces: ['Marble Rocks', 'Dhuandhar Falls', 'Madan Mahal Fort', 'Rani Durgavati Museum'],
//       description: 'Heart of Madhya Pradesh, known for marble rocks and Dhuandhar waterfall.'
//     },
//     {
//       id: 4,
//       slug: 'gwalior',
//       nameEn: 'Gwalior',
//       nameHi: 'ग्वालियर',
//       coords: [26.2295, 78.1828],
//       region: 'North',
//       image: '🏰',
//       established: 1874,
//       population: '1.1M',
//       area: '3,626 km²',
//       rivers: ['Chambal', 'Sindh'],
//       majorTouristPlaces: ['Gwalior Fort', 'Man Mandir Palace', 'Gujari Mahal', 'Tansen Tomb'],
//       description: 'Historical city famous for magnificent fort and music legacy.'
//     },
//     {
//       id: 5,
//       slug: 'ujjain',
//       nameEn: 'Ujjain',
//       nameHi: 'उज्जैन',
//       coords: [23.1815, 75.7833],
//       region: 'West',
//       image: '🕉️',
//       established: 1901,
//       population: '0.5M',
//       area: '2,355 km²',
//       rivers: ['Shipra'],
//       majorTouristPlaces: ['Mahakaleshwar Temple', 'Ramghat', 'Chintaman Ganesh', 'Sandipani Ashram'],
//       description: 'Sacred pilgrimage city, one of the four Kumbh Mela sites.'
//     },
//     {
//       id: 6,
//       slug: 'khajuraho',
//       nameEn: 'Khajuraho',
//       nameHi: 'खजुराहो',
//       coords: [24.8318, 79.9199],
//       region: 'East',
//       image: '⛩️',
//       established: 1986,
//       population: '0.3M',
//       area: '2,024 km²',
//       rivers: ['Prabhavati'],
//       majorTouristPlaces: ['Khajuraho Temples', 'Raneh Falls', 'Panna National Park', 'Diamond Mines'],
//       description: 'UNESCO World Heritage Site famous for intricate temple sculptures.'
//     },
//     {
//       id: 7,
//       slug: 'mandu',
//       nameEn: 'Mandu',
//       nameHi: 'मांडू',
//       coords: [22.3333, 75.4],
//       region: 'West',
//       image: '🏛️',
//       established: 1960,
//       population: '0.2M',
//       area: '1,738 km²',
//       rivers: ['Narmada'],
//       majorTouristPlaces: ['Jahaz Mahal', 'Hindola Mahal', 'Jami Mosque', 'Shopuri Lake'],
//       description: 'Historical city of palaces with Indo-Islamic architecture.'
//     },
//     {
//       id: 8,
//       slug: 'pachmarhi',
//       nameEn: 'Pachmarhi',
//       nameHi: 'पचमढ़ी',
//       coords: [22.4676, 78.4333],
//       region: 'Central',
//       image: '⛰️',
//       established: 1956,
//       population: '0.4M',
//       area: '5,355 km²',
//       rivers: ['Denwa', 'Tawa'],
//       majorTouristPlaces: ['Pachmarhi Caves', 'Bee Falls', 'Priyadarshini Point', 'Satpura National Park'],
//       description: 'Hill station and adventure destination with natural caves and waterfalls.'
//     },
//     {
//       id: 9,
//       slug: 'omkareshwar',
//       nameEn: 'Omkareshwar',
//       nameHi: 'ओंकारेश्वर',
//       coords: [22.2333, 76.1333],
//       region: 'West',
//       image: '🕉️',
//       established: 1959,
//       population: '0.5M',
//       area: '2,550 km²',
//       rivers: ['Narmada'],
//       majorTouristPlaces: ['Omkareshwar Temple', 'Siddhanath Temple', 'Hanuman Temple', 'Narmada Boat Ride'],
//       description: 'Sacred island pilgrimage site with Shiva temple on Narmada river.'
//     },
//     {
//       id: 10,
//       slug: 'kanha',
//       nameEn: 'Kanha',
//       nameHi: 'कान्हा',
//       coords: [22.3344, 80.6119],
//       region: 'East',
//       image: '🐯',
//       established: 1974,
//       population: '0.6M',
//       area: '6,144 km²',
//       rivers: ['Narmada', 'Banjar'],
//       majorTouristPlaces: ['Kanha National Park', 'Tiger Reserve', 'Jungle Safari', 'Wildlife Reserve'],
//       description: 'Major tiger reserve and wildlife sanctuary, inspiration for Jungle Book.'
//     },
//     {
//       id: 11,
//       slug: 'satna',
//       nameEn: 'Satna',
//       nameHi: 'सतना',
//       coords: [24.5892, 80.8343],
//       region: 'East',
//       image: '⛰️',
//       established: 1956,
//       population: '1M',
//       area: '7,252 km²',
//       rivers: ['Tons', 'Jonk'],
//       majorTouristPlaces: ['Chitrakoot Falls', 'Raneh Falls', 'Panna National Park', 'Kalinjar Fort'],
//       description: 'District known for waterfalls and mineral resources.'
//     },
//     {
//       id: 12,
//       slug: 'rewa',
//       nameEn: 'Rewa',
//       nameHi: 'रीवा',
//       coords: [24.5410, 81.3092],
//       region: 'East',
//       image: '🏛️',
//       established: 1956,
//       population: '1.2M',
//       area: '6,606 km²',
//       rivers: ['Narmada', 'Tons'],
//       majorTouristPlaces: ['Govardhan Palace', 'Rewa Palace', 'Khimti Falls', 'White Tiger Heritage'],
//       description: 'Historical kingdom known for white tigers and royal heritage.'
//     }
//   ]);

//   // Filter districts based on search
//   const filteredDistricts = districts.filter(district => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       district.nameEn.toLowerCase().includes(searchLower) ||
//       district.nameHi.toLowerCase().includes(searchLower) ||
//       district.region.toLowerCase().includes(searchLower)
//     );
//   });

//   // Initialize Leaflet Map
//   useEffect(() => {
//     if (!mapContainerRef) return;

//     const loadLeaflet = async () => {
//       if (window.L) {
//         initMap();
//         return;
//       }

//       // Load Leaflet CSS
//       const link = document.createElement('link');
//       link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//       link.rel = 'stylesheet';
//       link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
//       link.crossOrigin = '';
//       document.head.appendChild(link);

//       // Load Leaflet JS
//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//       script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
//       script.crossOrigin = '';
//       script.async = true;
//       script.onload = initMap;
//       script.onerror = () => console.error('Failed to load Leaflet library');
//       document.body.appendChild(script);
//     };

//     const initMap = () => {
//       if (!window.L || mapRef.current || !mapContainerRef) return;

//       try {
//         // Initialize map
//         const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

//         // Add tile layer
//         window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '© OpenStreetMap contributors',
//           maxZoom: 19
//         }).addTo(map);

//         // Create a simple marker icon (using default Leaflet icon)
//         const createCustomIcon = () => {
//           return window.L.divIcon({
//             html: `<div style="
//               background-color: ${colors.saffron};
//               width: 30px;
//               height: 30px;
//               border-radius: 50%;
//               border: 3px solid white;
//               box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//               display: flex;
//               align-items: center;
//               justify-content: center;
//               color: white;
//               font-size: 14px;
//               font-weight: bold;
//             ">📍</div>`,
//             className: 'custom-marker',
//             iconSize: [30, 30],
//             iconAnchor: [15, 30],
//             popupAnchor: [0, -30]
//           });
//         };

//         // Alternative: Use default Leaflet icon (more reliable)
//         const defaultIcon = new window.L.Icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
//           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//           popupAnchor: [1, -34],
//           shadowSize: [41, 41]
//         });

//         // Add markers for each district
//         districts.forEach(district => {
//           const marker = window.L.marker(district.coords, {
//             icon: defaultIcon // Use default icon instead of custom one
//           }).addTo(map);

//           // Add click event
//           marker.on('click', () => {
//             setSelectedDistrict(district);
//             map.setView(district.coords, 9);
//           });

//           // Add popup
//           marker.bindPopup(`
//             <div style="text-align: center; padding: 8px;">
//               <div style="font-weight: bold; color: ${colors.saffron}; font-size: 16px; margin-bottom: 4px;">
//                 ${district.nameEn}
//               </div>
//               <div style="color: ${colors.green}; font-size: 12px;">
//                 ${district.nameHi}
//               </div>
//               <div style="color: #666; font-size: 12px; margin-top: 4px;">
//                 ${district.region} Region
//               </div>
//             </div>
//           `);
//         });

//         mapRef.current = map;

//         // Fix map sizing issues
//         setTimeout(() => {
//           map.invalidateSize();
//         }, 100);

//         console.log('Map initialized successfully with', districts.length, 'markers');

//       } catch (error) {
//         console.error('Error initializing map:', error);
//       }
//     };

//     loadLeaflet();

//     // Cleanup function
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, [mapContainerRef, districts, colors.saffron, colors.green]);

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//   };

//   const handleViewDetails = (slug) => {
//     router.push(`/district/${slug}`);
//   };

//   return (
//     <> 
//       <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//         <div className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.green }}>
//           <div className="max-w-7xl px-35">
//             <div className="mb-4 text-6xl">🗺️</div>
//             <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
//               Mera Pradesh Mera Jila
//             </h1>
//             <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
//               Explore all districts of Madhya Pradesh
//             </p>
//             <img src="/images/tiger.png" alt="tiger" className='h-100 right-40 absolute top-13 transform rotate-[3deg] drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)]' />
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//           {/* Map Section */}
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0" style={{ borderTopColor: colors.green }}>
//             <div ref={setMapContainerRef} className="w-full h-96 md:h-[500px]" />
//           </div>

//           {/* Search Section */}
//           <div className="mb-12">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={24} style={{ color: colors.saffron }} />
//               <input
//                 type="text"
//                 placeholder="Search districts by name or region..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg"
//                 style={{
//                   borderColor: colors.saffron,
//                   boxShadow: `0 0 0 0px ${colors.saffron}33`
//                 }}
//               />
//             </div>
//             {searchQuery && (
//               <p className="mt-2 text-sm" style={{ color: colors.green }}>
//                 Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
//               </p>
//             )}
//           </div>

//           {/* Districts Grid */}
//           <div>
//             <h2 className="text-3xl font-bold mb-8" style={{ color: colors.green }}>
//               Click on any district to explore
//             </h2>
//             {filteredDistricts.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {filteredDistricts.map((district) => (
//                   <div
//                     key={district.id}
//                     onClick={() => handleDistrictClick(district)}
//                     className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden"
//                     style={{ borderLeftColor: colors.saffron }}
//                   >
//                     {/* Card Header */}
//                     <div 
//                       className="h-16 flex items-center justify-center text-4xl"
//                       style={{ backgroundColor: colors.bgColor }}
//                     >
//                       {district.image}
//                     </div>

//                     {/* Card Content */}
//                     <div className="p-6">
//                       <h3 className="text-xl font-bold mb-2" style={{ color: colors.black }}>
//                         {district.nameEn}
//                       </h3>
//                       <p className="text-sm mb-4" style={{ color: colors.saffron }}>
//                         {district.nameHi}
//                       </p>
//                       <div className="flex items-center gap-2 text-sm" style={{ color: colors.green }}>
//                         <MapIcon size={16} />
//                         {district.region} Region
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <p className="text-xl" style={{ color: colors.black }}>
//                   No districts found matching "{searchQuery}"
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* District Details Modal */}
//         {selectedDistrict && (
//           <div
//             className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//             onClick={() => setSelectedDistrict(null)}
//           >
//             <div 
//               className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Modal Header */}
//               <div 
//                 className="h-40 flex items-center justify-center text-7xl relative"
//                 style={{ backgroundColor: colors.saffron }}
//               >
//                 {selectedDistrict.image}
//                 <button
//                   onClick={() => setSelectedDistrict(null)}
//                   className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <X size={24} style={{ color: colors.saffron }} />
//                 </button>
//               </div>

//               {/* Modal Content */}
//               <div className="p-8">
//                 {/* Title */}
//                 <h2 className="text-4xl font-bold mb-2" style={{ color: colors.saffron }}>
//                   {selectedDistrict.nameEn}
//                 </h2>
//                 <p className="text-lg mb-6" style={{ color: colors.green }}>
//                   {selectedDistrict.nameHi}
//                 </p>

//                 {/* Description */}
//                 <p className="text-gray-700 mb-8 leading-relaxed">
//                   {selectedDistrict.description}
//                 </p>

//                 {/* Info Grid */}
//                 <div className="grid grid-cols-2 gap-6 mb-8">
//                   <div>
//                     <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
//                       ESTABLISHED
//                     </p>
//                     <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                       {selectedDistrict.established}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
//                       POPULATION
//                     </p>
//                     <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                       {selectedDistrict.population}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
//                       AREA
//                     </p>
//                     <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                       {selectedDistrict.area}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
//                       REGION
//                     </p>
//                     <p className="text-lg font-semibold" style={{ color: colors.black }}>
//                       {selectedDistrict.region}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Rivers */}
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3" style={{ color: colors.green }}>
//                     MAJOR RIVERS
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedDistrict.rivers.map((river, idx) => (
//                       <span
//                         key={idx}
//                         className="px-4 py-2 rounded-full text-sm font-semibold text-white"
//                         style={{ backgroundColor: colors.skyBlue }}
//                       >
//                         {river}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Tourist Places */}
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3" style={{ color: colors.green }}>
//                     MAJOR TOURIST PLACES
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {selectedDistrict.majorTouristPlaces.map((place, idx) => (
//                       <div 
//                         key={idx}
//                         className="flex items-center gap-3 p-3 rounded-lg"
//                         style={{ backgroundColor: colors.bgColor }}
//                       >
//                         <MapPin size={18} style={{ color: colors.saffron }} />
//                         <span style={{ color: colors.black }}>{place}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-3">
//                   <button 
//                     onClick={() => handleViewDetails(selectedDistrict.slug)}
//                     className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg"
//                     style={{ backgroundColor: colors.green }}
//                   >
//                     Explore District
//                   </button>
//                   <button 
//                     onClick={() => setSelectedDistrict(null)}
//                     className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg"
//                     style={{ color: colors.saffron, borderWidth: '2px', borderColor: colors.saffron }}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }