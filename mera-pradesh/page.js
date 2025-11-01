'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, MapPin, Search, Users, Calendar, MapIcon } from 'lucide-react';
import Image from 'next/image';

export default function MeraPradeshPage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapContainerRef, setMapContainerRef] = useState(null);
  const mapRef = useRef(null);

  const colors = {
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333',
    lightGray: '#F5F5F5'
  };

  // Complete Madhya Pradesh Districts Data
  const [districts] = useState([
    {
      id: 1,
      slug: 'indore',
      nameEn: 'Indore',
      nameHi: 'इंदौर',
      coords: [22.7196, 75.8577],
      region: 'West',
      image: '🏙️',
      established: 1886,
      population: '3.2M',
      area: '3,105 km²',
      rivers: ['Narmada', 'Khan'],
      majorTouristPlaces: ['Rajwada Palace', 'Khande Rao Market', 'Lal Bagh Palace', 'Annapurna Temple'],
      description: 'Commercial and cultural hub of Madhya Pradesh, known for business and heritage sites.'
    },
    {
      id: 2,
      slug: 'bhopal',
      nameEn: 'Bhopal',
      nameHi: 'भोपाल',
      coords: [23.1815, 77.4104],
      region: 'Central',
      image: '🏛️',
      established: 1728,
      population: '1.8M',
      area: '2,772 km²',
      rivers: ['Narmada', 'Bets'],
      majorTouristPlaces: ['Taj Ul-Masajid', 'Sanchi Stupa', 'Upper & Lower Lakes', 'Van Vihar'],
      description: 'Capital city of Madhya Pradesh, famous for lakes, mosques, and cultural heritage.'
    },
    {
      id: 3,
      slug: 'jabalpur',
      nameEn: 'Jabalpur',
      nameHi: 'जबलपुर',
      coords: [23.1815, 79.9864],
      region: 'East',
      image: '🏞️',
      established: 1867,
      population: '1.3M',
      area: '3,414 km²',
      rivers: ['Narmada', 'Sonbhadra'],
      majorTouristPlaces: ['Marble Rocks', 'Dhuandhar Falls', 'Madan Mahal Fort', 'Rani Durgavati Museum'],
      description: 'Heart of Madhya Pradesh, known for marble rocks and Dhuandhar waterfall.'
    },
    {
      id: 4,
      slug: 'gwalior',
      nameEn: 'Gwalior',
      nameHi: 'ग्वालियर',
      coords: [26.2295, 78.1828],
      region: 'North',
      image: '🏰',
      established: 1874,
      population: '1.1M',
      area: '3,626 km²',
      rivers: ['Chambal', 'Sindh'],
      majorTouristPlaces: ['Gwalior Fort', 'Man Mandir Palace', 'Gujari Mahal', 'Tansen Tomb'],
      description: 'Historical city famous for magnificent fort and music legacy.'
    },
    {
      id: 5,
      slug: 'ujjain',
      nameEn: 'Ujjain',
      nameHi: 'उज्जैन',
      coords: [23.1815, 75.7833],
      region: 'West',
      image: '🕉️',
      established: 1901,
      population: '0.5M',
      area: '2,355 km²',
      rivers: ['Shipra'],
      majorTouristPlaces: ['Mahakaleshwar Temple', 'Ramghat', 'Chintaman Ganesh', 'Sandipani Ashram'],
      description: 'Sacred pilgrimage city, one of the four Kumbh Mela sites.'
    },
    {
      id: 6,
      slug: 'khajuraho',
      nameEn: 'Khajuraho',
      nameHi: 'खजुराहो',
      coords: [24.8318, 79.9199],
      region: 'East',
      image: '⛩️',
      established: 1986,
      population: '0.3M',
      area: '2,024 km²',
      rivers: ['Prabhavati'],
      majorTouristPlaces: ['Khajuraho Temples', 'Raneh Falls', 'Panna National Park', 'Diamond Mines'],
      description: 'UNESCO World Heritage Site famous for intricate temple sculptures.'
    },
    {
      id: 7,
      slug: 'mandu',
      nameEn: 'Mandu',
      nameHi: 'मांडू',
      coords: [22.3333, 75.4],
      region: 'West',
      image: '🏛️',
      established: 1960,
      population: '0.2M',
      area: '1,738 km²',
      rivers: ['Narmada'],
      majorTouristPlaces: ['Jahaz Mahal', 'Hindola Mahal', 'Jami Mosque', 'Shopuri Lake'],
      description: 'Historical city of palaces with Indo-Islamic architecture.'
    },
    {
      id: 8,
      slug: 'pachmarhi',
      nameEn: 'Pachmarhi',
      nameHi: 'पचमढ़ी',
      coords: [22.4676, 78.4333],
      region: 'Central',
      image: '⛰️',
      established: 1956,
      population: '0.4M',
      area: '5,355 km²',
      rivers: ['Denwa', 'Tawa'],
      majorTouristPlaces: ['Pachmarhi Caves', 'Bee Falls', 'Priyadarshini Point', 'Satpura National Park'],
      description: 'Hill station and adventure destination with natural caves and waterfalls.'
    },
    {
      id: 9,
      slug: 'omkareshwar',
      nameEn: 'Omkareshwar',
      nameHi: 'ओंकारेश्वर',
      coords: [22.2333, 76.1333],
      region: 'West',
      image: '🕉️',
      established: 1959,
      population: '0.5M',
      area: '2,550 km²',
      rivers: ['Narmada'],
      majorTouristPlaces: ['Omkareshwar Temple', 'Siddhanath Temple', 'Hanuman Temple', 'Narmada Boat Ride'],
      description: 'Sacred island pilgrimage site with Shiva temple on Narmada river.'
    },
    {
      id: 10,
      slug: 'kanha',
      nameEn: 'Kanha',
      nameHi: 'कान्हा',
      coords: [22.3344, 80.6119],
      region: 'East',
      image: '🐯',
      established: 1974,
      population: '0.6M',
      area: '6,144 km²',
      rivers: ['Narmada', 'Banjar'],
      majorTouristPlaces: ['Kanha National Park', 'Tiger Reserve', 'Jungle Safari', 'Wildlife Reserve'],
      description: 'Major tiger reserve and wildlife sanctuary, inspiration for Jungle Book.'
    },
    {
      id: 11,
      slug: 'satna',
      nameEn: 'Satna',
      nameHi: 'सतना',
      coords: [24.5892, 80.8343],
      region: 'East',
      image: '⛰️',
      established: 1956,
      population: '1M',
      area: '7,252 km²',
      rivers: ['Tons', 'Jonk'],
      majorTouristPlaces: ['Chitrakoot Falls', 'Raneh Falls', 'Panna National Park', 'Kalinjar Fort'],
      description: 'District known for waterfalls and mineral resources.'
    },
    {
      id: 12,
      slug: 'rewa',
      nameEn: 'Rewa',
      nameHi: 'रीवा',
      coords: [24.5410, 81.3092],
      region: 'East',
      image: '🏛️',
      established: 1956,
      population: '1.2M',
      area: '6,606 km²',
      rivers: ['Narmada', 'Tons'],
      majorTouristPlaces: ['Govardhan Palace', 'Rewa Palace', 'Khimti Falls', 'White Tiger Heritage'],
      description: 'Historical kingdom known for white tigers and royal heritage.'
    }
  ]);

  // Filter districts based on search
  const filteredDistricts = districts.filter(district => {
    const searchLower = searchQuery.toLowerCase();
    return (
      district.nameEn.toLowerCase().includes(searchLower) ||
      district.nameHi.toLowerCase().includes(searchLower) ||
      district.region.toLowerCase().includes(searchLower)
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
    script.onerror = () => console.error('Failed to load Leaflet library');
    document.body.appendChild(script);
  };

  const initMap = () => {
    if (!window.L || mapRef.current || !mapContainerRef) return;

    try {
      // Initialize map
      const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Create a simple marker icon (using default Leaflet icon)
      const createCustomIcon = () => {
        return window.L.divIcon({
          html: `<div style="
            background-color: ${colors.saffron};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">📍</div>`,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        });
      };

      // Alternative: Use default Leaflet icon (more reliable)
      const defaultIcon = new window.L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add markers for each district
      districts.forEach(district => {
        const marker = window.L.marker(district.coords, {
          icon: defaultIcon // Use default icon instead of custom one
        }).addTo(map);

        // Add click event
        marker.on('click', () => {
          setSelectedDistrict(district);
          map.setView(district.coords, 9);
        });

        // Add popup
        marker.bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <div style="font-weight: bold; color: ${colors.saffron}; font-size: 16px; margin-bottom: 4px;">
              ${district.nameEn}
            </div>
            <div style="color: ${colors.green}; font-size: 12px;">
              ${district.nameHi}
            </div>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">
              ${district.region} Region
            </div>
          </div>
        `);
      });

      mapRef.current = map;

      // Fix map sizing issues
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      console.log('Map initialized successfully with', districts.length, 'markers');

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  loadLeaflet();

  // Cleanup function
  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };
}, [mapContainerRef, districts, colors.saffron, colors.green]);
  // Initialize Leaflet Map
  // useEffect(() => {
  //   if (!mapContainerRef) return;

  //   const loadLeaflet = async () => {
  //     if (window.L) {
  //       initMap();
  //       return;
  //     }

  //     const link = document.createElement('link');
  //     link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  //     link.rel = 'stylesheet';
  //     document.head.appendChild(link);

  //     const script = document.createElement('script');
  //     script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  //     script.async = true;
  //     script.onload = initMap;
  //     document.body.appendChild(script);
  //   };

  //   const initMap = () => {
  //     if (!window.L || mapRef.current) return;

  //     const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

  //     window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '© OpenStreetMap contributors',
  //       maxZoom: 19
  //     }).addTo(map);

  //     const createCustomIcon = () => {
  //       return window.L.icon({
  //         iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMEMxMS43IDE1IDAgMjAgMCAyOGMwIDYuNjMgOC45NyAxMiAyMCAxMnMyMC01LjM3IDIwLTEyYzAtOC0xMS43LTEzLTIwLTI4eiIgZmlsbD0iIkYzOTAyQyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjI4IiByPSI0IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  //         iconSize: [40, 40],
  //         iconAnchor: [20, 40],
  //         popupAnchor: [0, -40]
  //       });
  //     };

  //     districts.forEach(district => {
  //       const marker = window.L.marker(district.coords, {
  //         icon: createCustomIcon()
  //       }).addTo(map);

  //       marker.on('click', () => {
  //         setSelectedDistrict(district);
  //         map.setView(district.coords, 9);
  //       });

  //       marker.bindPopup(`<div style="text-align: center; font-weight: bold; color: #F3902C;">${district.nameEn}</div>`);
  //     });

  //     mapRef.current = map;

  //     setTimeout(() => {
  //       map.invalidateSize();
  //     }, 100);
  //   };

  //   loadLeaflet();

  //   return () => {
  //     if (mapRef.current) {
  //       mapRef.current.remove();
  //       mapRef.current = null;
  //     }
  //   };
  // }, [mapContainerRef]);

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
  };

  const handleViewDetails = (slug) => {
    router.push(`/district/${slug}`);
  };

  return (
  <> 
 
    <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
      <div className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.green }}>
        <div className="max-w-7xl  px-35">
          <div className="mb-4  text-6xl">🗺️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
            {t('DistrictsPage.title')}
          </h1>
          <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
            {t('DistrictsPage.subtitle')}
          </p>
           <img src="/images/tiger.png" alt="tiger" className='h-100 right-60 absolute top-15 transform rotate-[5deg] drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)]' />
        </div>
      </div>
    {/* <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
      <div className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.saffron }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-4 text-6xl">🗺️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
            {t('DistrictsPage.title')}
          </h1>
          <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
            {t('DistrictsPage.subtitle')}
          </p>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0" style={{ borderTopColor: colors.green }}>
          <div ref={setMapContainerRef} className="w-full h-96 md:h-[500px]" />
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={24} style={{ color: colors.saffron }} />
            <input
              type="text"
              placeholder="Search districts by name or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg"
              style={{
                borderColor: colors.saffron,
                boxShadow: `0 0 0 0px ${colors.saffron}33`
              }}
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm" style={{ color: colors.green }}>
              Found {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Districts Grid */}
        <div>
          <h2 className="text-3xl font-bold mb-8" style={{ color: colors.green }}>
            {t('DistrictsPage.selectDistrict')}
          </h2>
          {filteredDistricts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDistricts.map((district) => (
                <div
                  key={district.id}
                  onClick={() => handleDistrictClick(district)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden"
                  style={{ borderLeftColor: colors.saffron }}
                >
                  {/* Card Header */}
                  <div 
                    className="h-16 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: colors.bgColor }}
                  >
                    {district.image}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkGray }}>
                      {district.nameEn}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: colors.saffron }}>
                      {district.nameHi}
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.green }}>
                      <MapIcon size={16} />
                      {district.region} Region
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl" style={{ color: colors.darkGray }}>
                No districts found matching "{searchQuery}"
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
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="h-40 flex items-center justify-center text-7xl relative"
              style={{ backgroundColor: colors.saffron }}
            >
              {selectedDistrict.image}
              <button
                onClick={() => setSelectedDistrict(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} style={{ color: colors.saffron }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Title */}
              <h2 className="text-4xl font-bold mb-2" style={{ color: colors.saffron }}>
                {selectedDistrict.nameEn}
              </h2>
              <p className="text-lg mb-6" style={{ color: colors.green }}>
                {selectedDistrict.nameHi}
              </p>

              {/* Description */}
              <p className="text-gray-700 mb-8 leading-relaxed">
                {selectedDistrict.description}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
                    ESTABLISHED
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.darkGray }}>
                    {selectedDistrict.established}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
                    POPULATION
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.darkGray }}>
                    {selectedDistrict.population}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
                    AREA
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.darkGray }}>
                    {selectedDistrict.area}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: colors.green }}>
                    REGION
                  </p>
                  <p className="text-lg font-semibold" style={{ color: colors.darkGray }}>
                    {selectedDistrict.region}
                  </p>
                </div>
              </div>

              {/* Rivers */}
              <div className="mb-8">
                <p className="text-sm font-bold mb-3" style={{ color: colors.green }}>
                  MAJOR RIVERS
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDistrict.rivers.map((river, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: colors.skyBlue }}
                    >
                      {river}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tourist Places */}
              <div className="mb-8">
                <p className="text-sm font-bold mb-3" style={{ color: colors.green }}>
                  MAJOR TOURIST PLACES
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDistrict.majorTouristPlaces.map((place, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: colors.bgColor }}
                    >
                      <MapPin size={18} style={{ color: colors.saffron }} />
                      <span style={{ color: colors.darkGray }}>{place}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleViewDetails(selectedDistrict.slug)}
                  className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg"
                  style={{ backgroundColor: colors.green }}
                >
                  Explore District
                </button>
                <button 
                  onClick={() => setSelectedDistrict(null)}
                  className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg"
                  style={{ color: colors.saffron, borderWidth: '2px', borderColor: colors.saffron }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div></>
  );
}

// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useTranslations } from 'next-intl';
// import { useRouter } from 'next/navigation';
// import { X, MapPin } from 'lucide-react';

// export default function MeraPradeshPage() {
//   const t = useTranslations();
//   const router = useRouter();
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);

//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#FFF7EB',
//     darkGray: '#333333'
//   };

//   // Madhya Pradesh Districts Data
//   const districts = [
//     { id: 1, slug: 'indore', name: t('Districts.indore'), coords: [22.7196, 75.8577], region: 'West' },
//     { id: 2, slug: 'bhopal', name: t('Districts.bhopal'), coords: [23.1815, 77.4104], region: 'Central' },
//     { id: 3, slug: 'jabalpur', name: t('Districts.jabalpur'), coords: [23.1815, 79.9864], region: 'East' },
//     { id: 4, slug: 'gwalior', name: t('Districts.gwalior'), coords: [26.2295, 78.1828], region: 'North' },
//     { id: 5, slug: 'ujjain', name: t('Districts.ujjain'), coords: [23.1815, 75.7833], region: 'West' },
//     { id: 6, slug: 'khajuraho', name: t('Districts.khajuraho'), coords: [24.8318, 79.9199], region: 'East' },
//     { id: 7, slug: 'mandu', name: t('Districts.mandu'), coords: [22.3333, 75.4], region: 'West' },
//     { id: 8, slug: 'pachmarhi', name: t('Districts.pachmarhi'), coords: [22.4676, 78.4333], region: 'Central' },
//     { id: 9, slug: 'omkareshwar', name: t('Districts.omkareshwar'), coords: [22.2333, 76.1333], region: 'West' },
//     { id: 10, slug: 'kanha', name: t('Districts.kanha'), coords: [22.3344, 80.6119], region: 'East' },
//     { id: 11, slug: 'satna', name: t('Districts.satna'), coords: [24.5892, 80.8343], region: 'East' },
//     { id: 12, slug: 'rewa', name: t('Districts.rewa'), coords: [24.5410, 81.3092], region: 'East' },
//   ];

//   // Initialize Leaflet Map
//   useEffect(() => {
//     if (!mapContainerRef.current) return;

//     const loadLeaflet = async () => {
//       if (window.L) {
//         initMap();
//         return;
//       }

//       const link = document.createElement('link');
//       link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
//       link.rel = 'stylesheet';
//       document.head.appendChild(link);

//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
//       script.async = true;
//       script.onload = initMap;
//       document.body.appendChild(script);
//     };

//     const initMap = () => {
//       if (!window.L || mapRef.current) return;

//       const map = window.L.map(mapContainerRef.current).setView([23.1815, 77.4104], 7);

//       window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors',
//         maxZoom: 19
//       }).addTo(map);

//       const createCustomIcon = (name) => {
//         return window.L.divIcon({
//           html: `<div style="font-size: 24px; text-shadow: 2px 2px 6px rgba(0,0,0,0.5); cursor: pointer; background: ${colors.saffron}; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(255,153,51,0.4); font-weight: bold; color: white; font-size: 12px; text-align: center; padding: 4px; line-height: 1.2;">📍</div>`,
//           className: 'district-marker',
//           iconSize: [48, 48],
//           iconAnchor: [24, 48]
//         });
//       };

//       districts.forEach(district => {
//         const marker = window.L.marker(district.coords, {
//           icon: createCustomIcon(district.name)
//         }).addTo(map);

//         marker.on('click', () => {
//           setSelectedDistrict(district);
//           map.setView(district.coords, 9);
//         });

//         const popup = window.L.popup()
//           .setLatLng(district.coords)
//           .setContent(`<div style="font-weight: bold; color: ${colors.saffron};">${district.name}</div>`)
//           .openOn(map);
//       });

//       mapRef.current = map;

//       setTimeout(() => {
//         map.invalidateSize();
//       }, 100);
//     };

//     loadLeaflet();

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Hero Section */}
//       <div className="py-12 px-4 md:px-8" style={{ backgroundColor: colors.saffron }}>
//         <div className="max-w-7xl mx-auto text-center">
//           <div className="mb-4 text-5xl">🗺️</div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.white }}>
//             {t('DistrictsPage.title')}
//           </h1>
//           <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
//             {t('DistrictsPage.subtitle')}
//           </p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//         {/* Map Section */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border-t-4 relative z-0" style={{ borderTopColor: colors.green }}>
//           <div ref={mapContainerRef} className="w-full h-96 md:h-[500px]" />
//         </div>

//         {/* Districts Grid */}
//         <div>
//           <h2 className="text-3xl font-bold mb-8" style={{ color: colors.green }}>
//             {t('DistrictsPage.selectDistrict')}
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {districts.map((district) => (
//               <div
//                 key={district.id}
//                 onClick={() => setSelectedDistrict(district)}
//                 className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-1"
//                 style={{ borderLeftColor: colors.green }}
//               >
//                 <div className="p-6">
//                   <div className="flex items-center gap-3 mb-3">
//                     <MapPin size={24} style={{ color: colors.green }} />
//                     <h3 className="text-xl font-bold" style={{ color: colors.darkGray }}>
//                       {district.name}
//                     </h3>
//                   </div>
//                   <p className="text-sm" style={{ color: colors.green }}>
//                     {district.region} Region
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* District Details Modal */}
//       {selectedDistrict && (
//         <div
//   className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
//   onClick={() => setSelectedDistrict(null)}
// >
//           <div 
//             className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all duration-300"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div 
//               className="h-32 flex items-center justify-center text-6xl relative"
//               style={{ backgroundColor: colors.saffron }}
//             >
//               🏛️
//               <button
//                 onClick={() => setSelectedDistrict(null)}
//                 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
//               >
//                 <X size={24} style={{ color: colors.saffron }} />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6">
//               <h2 className="text-3xl font-bold mb-3" style={{ color: colors.saffron }}>
//                 {selectedDistrict.name}
//               </h2>
              
//               <div className="mb-6">
//                 <p className="text-sm font-semibold mb-2" style={{ color: colors.green }}>
//                   REGION
//                 </p>
//                 <p className="text-gray-700">{selectedDistrict.region}</p>
//               </div>

//               <div className="mb-6">
//                 <p className="text-sm font-semibold mb-2" style={{ color: colors.green }}>
//                   COORDINATES
//                 </p>
//                 <p className="text-gray-700 font-mono text-sm">
//                   {selectedDistrict.coords[0].toFixed(4)}, {selectedDistrict.coords[1].toFixed(4)}
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button 
//                   className="flex-1 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
//                   style={{ backgroundColor: colors.green }}
//                 >
//                   View Details
//                 </button>
//                 <button 
//                   className="flex-1 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-lg"
//                   style={{ color: colors.saffron, borderWidth: '2px', borderColor: colors.saffron }}
//                 >
//                   Gallery
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }