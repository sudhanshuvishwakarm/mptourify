'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, MapPin, Heart, Share2, ArrowLeft, Navigation, Clock } from 'lucide-react';

export default function RegionalExplorePage() {
  const params = useParams();
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [likedPlaces, setLikedPlaces] = useState([]);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const regionSlug = params.region;

  // Tourism destinations data for all regions
  const regionsData = {
    'central': {
      name: 'Central India',
      nameHi: 'मध्य भारत',
      icon: '🏛️',
      center: [22.9734, 78.6569],
      zoom: 7,
      color: '#A8E6CF',
      description: 'Marvel at UNESCO heritage sites and natural wonders',
      places: [
        {
          id: 1,
          name: 'Khajuraho Temples',
          location: 'Madhya Pradesh',
          coords: [24.8318, 79.9199],
          category: 'Heritage',
          image: '🕌',
          description: 'UNESCO World Heritage Site featuring stunning medieval architecture and intricate erotic sculptures dating back to the 10th century.',
          highlights: ['Stunning sculptures', 'Ancient architecture', 'UNESCO World Heritage'],
          bestTime: 'October to March'
        },
        {
          id: 2,
          name: 'Kanha National Park',
          location: 'Madhya Pradesh',
          coords: [22.3344, 80.6119],
          category: 'Wildlife',
          image: '🐅',
          description: 'One of India\'s largest tiger reserves and the inspiration for Rudyard Kipling\'s "The Jungle Book".',
          highlights: ['Tiger sightings', 'Rich biodiversity', 'Jungle safaris'],
          bestTime: 'November to June'
        },
        {
          id: 3,
          name: 'Sanchi Stupa',
          location: 'Madhya Pradesh',
          coords: [23.4793, 77.7397],
          category: 'Heritage',
          image: '⛩️',
          description: 'Ancient Buddhist complex dating back to the 3rd century BCE, featuring magnificent stone gateways and sculptures.',
          highlights: ['Buddhist monument', 'Ancient carvings', 'Peaceful retreat'],
          bestTime: 'September to April'
        },
        {
          id: 4,
          name: 'Pachmarhi',
          location: 'Madhya Pradesh',
          coords: [22.4676, 78.4333],
          category: 'Hill Station',
          image: '⛰️',
          description: 'Queen of Satpura - a beautiful hill station with cascading waterfalls, scenic valleys, and thrilling trekking trails.',
          highlights: ['Waterfalls', 'Trekking', 'Scenic views'],
          bestTime: 'April to June, September to November'
        },
        {
          id: 5,
          name: 'Gwalior Fort',
          location: 'Madhya Pradesh',
          coords: [26.2295, 78.1828],
          category: 'Monument',
          image: '🏰',
          description: 'Majestic hilltop fort showcasing brilliant medieval architecture with ornate palaces, temples, and impressive defensive structures.',
          highlights: ['Panoramic views', 'Royal palaces', 'Historic significance'],
          bestTime: 'October to March'
        },
        {
          id: 6,
          name: 'Bhimbetka Caves',
          location: 'Madhya Pradesh',
          coords: [22.9333, 77.6167],
          category: 'Heritage',
          image: '🗿',
          description: 'Archaeological treasure with 500+ rock shelters featuring prehistoric paintings dating back 30,000 years.',
          highlights: ['Prehistoric art', 'Ancient shelter', 'Archaeological site'],
          bestTime: 'September to May'
        },
        {
          id: 7,
          name: 'Omkareshwar',
          location: 'Madhya Pradesh',
          coords: [22.2333, 76.1333],
          category: 'Spiritual',
          image: '🛕',
          description: 'Sacred island temple on the Narmada river, one of India\'s 12 most sacred Jyotirlingas (Shiva shrines).',
          highlights: ['Sacred pilgrimage', 'River views', 'Spiritual experience'],
          bestTime: 'Year-round'
        },
        {
          id: 8,
          name: 'Bandhavgarh National Park',
          location: 'Madhya Pradesh',
          coords: [23.7000, 81.0333],
          category: 'Wildlife',
          image: '🦁',
          description: 'Known for having the highest density of royal Bengal tigers in India, offering thrilling wildlife viewing experiences.',
          highlights: ['Tiger density', 'Wildlife safaris', 'Jungle exploration'],
          bestTime: 'November to June'
        },
        {
          id: 9,
          name: 'Orchha',
          location: 'Madhya Pradesh',
          coords: [25.3500, 78.6400],
          category: 'Heritage',
          image: '🏯',
          description: 'Medieval town with magnificent Bundela palaces, temples, and cenotaphs set along the serene Betwa river.',
          highlights: ['Medieval architecture', 'Royal heritage', 'River town'],
          bestTime: 'October to March'
        },
        {
          id: 10,
          name: 'Bhedaghat',
          location: 'Madhya Pradesh',
          coords: [23.1333, 79.8000],
          category: 'Nature',
          image: '🚤',
          description: 'Scenic marble rocks and the spectacular Dhuandhar waterfall along the Narmada river, perfect for boat rides.',
          highlights: ['Marble formations', 'Waterfall', 'Boat rides'],
          bestTime: 'October to April'
        }
      ]
    },
    'north': {
      name: 'North India',
      nameHi: 'उत्तर भारत',
      icon: '🏔️',
      center: [31.0, 77.0],
      zoom: 6,
      color: '#FF6B6B',
      description: 'Experience the majesty of the Himalayas and historic monuments',
      places: [
        {
          id: 1,
          name: 'Taj Mahal',
          location: 'Uttar Pradesh',
          coords: [27.1751, 78.0421],
          category: 'Monument',
          image: '🕌',
          description: 'The world\'s greatest monument to love - a stunning white marble mausoleum built by Emperor Shah Jahan.',
          highlights: ['Iconic beauty', 'UNESCO site', 'Love monument'],
          bestTime: 'October to March'
        },
        {
          id: 2,
          name: 'Shimla',
          location: 'Himachal Pradesh',
          coords: [31.7724, 77.1889],
          category: 'Hill Station',
          image: '❄️',
          description: 'Charming hill station with colonial architecture, pine forests, and stunning Himalayan views.',
          highlights: ['Colonial charm', 'Snow views', 'Adventure activities'],
          bestTime: 'December to March'
        }
      ]
    },
    'south': {
      name: 'South India',
      nameHi: 'दक्षिण भारत',
      icon: '🛶',
      center: [11.0, 78.5],
      zoom: 6,
      color: '#C7CEEA',
      description: 'Relax in backwaters, explore ancient temples, and taste spices',
      places: [
        {
          id: 1,
          name: 'Alleppey Backwaters',
          location: 'Kerala',
          coords: [9.4981, 76.3388],
          category: 'Nature',
          image: '🛶',
          description: 'Serene backwater cruises through lush green landscapes and traditional houseboats.',
          highlights: ['Houseboat cruises', 'Scenic beauty', 'Peaceful experience'],
          bestTime: 'September to March'
        }
      ]
    }
  };

  const regionData = regionsData[regionSlug] || regionsData['central'];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const loadLeaflet = async () => {
      if (window.L) {
        initMap();
        return;
      }

      const link = document.createElement('link');
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!window.L || mapRef.current) return;

      const map = window.L.map(mapContainerRef.current).setView(regionData.center, regionData.zoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const createCustomIcon = (emoji) => {
        return window.L.divIcon({
          html: `<div style="font-size: 28px; text-shadow: 2px 2px 6px rgba(0,0,0,0.5); cursor: pointer; background: rgba(255,255,255,0.95); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border: 3px solid #015E6C; box-shadow: 0 4px 12px rgba(1,94,108,0.3);">${emoji}</div>`,
          className: 'custom-marker',
          iconSize: [50, 50],
          iconAnchor: [25, 50]
        });
      };

      regionData.places.forEach(place => {
        const marker = window.L.marker(place.coords, {
          icon: createCustomIcon(place.image)
        }).addTo(map);

        marker.on('click', () => {
          setSelectedPlace(place);
          map.setView(place.coords, 10);
        });
      });

      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [regionSlug]);

  const toggleLike = (placeId) => {
    setLikedPlaces(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/explore')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ color: '#015E6C' }}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#015E6C' }}>
                  {regionData.icon} {regionData.name}
                </h1>
                <p className="text-gray-600 mt-1">{regionData.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <div ref={mapContainerRef} className="w-full h-96 md:h-[500px]" />
            </div>
          </div>

          {/* Destination Count */}
          <div className="bg-gradient-to-br rounded-2xl shadow-lg border border-gray-100 p-8" style={{ backgroundColor: regionData.color }}>
            <div className="text-center">
              <div className="text-5xl mb-4">{regionData.icon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">{regionData.places.length}</h2>
              <p className="text-white text-opacity-90 mb-4">Destinations to Explore</p>
              <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                <MapPin size={16} />
                Peak season: All year
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#015E6C' }}>
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionData.places.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-opacity-0 transform hover:-translate-y-1"
              >
                {/* Image/Icon */}
                <div 
                  className="h-40 flex items-center justify-center text-6xl relative overflow-hidden"
                  style={{ backgroundColor: regionData.color }}
                >
                  <span className="group-hover:scale-125 transition-transform duration-300">
                    {place.image}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{place.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} />
                        {place.location}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(place.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Heart
                        size={20}
                        className={likedPlaces.includes(place.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <span 
                      className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: regionData.color }}
                    >
                      {place.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {place.description}
                  </p>

                  {/* Best Time */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock size={14} />
                    {place.bestTime}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedPlace(place)}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    style={{ backgroundColor: '#015E6C' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Place Details Modal */}
      {selectedPlace && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setSelectedPlace(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="relative h-48 flex items-center justify-center text-7xl"
              style={{ backgroundColor: regionData.color }}
            >
              {selectedPlace.image}
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={24} style={{ color: '#015E6C' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Title */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold mb-2" style={{ color: '#015E6C' }}>
                  {selectedPlace.name}
                </h2>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <MapPin size={18} />
                  {selectedPlace.location}
                </p>
              </div>

              {/* Category & Best Time */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span 
                  className="text-sm font-semibold px-4 py-2 rounded-full text-white"
                  style={{ backgroundColor: regionData.color }}
                >
                  {selectedPlace.category}
                </span>
                <span className="text-sm font-semibold px-4 py-2 rounded-full bg-gray-100 text-gray-700 flex items-center gap-2">
                  <Clock size={16} />
                  {selectedPlace.bestTime}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                {selectedPlace.description}
              </p>

              {/* Highlights */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-3" style={{ color: '#015E6C' }}>
                  Highlights
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedPlace.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: '#015E6C' }}
                      />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => toggleLike(selectedPlace.id)}
                  className="flex-1 py-4 rounded-xl border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                  style={{
                    borderColor: '#015E6C',
                    color: likedPlaces.includes(selectedPlace.id) ? '#fff' : '#015E6C',
                    backgroundColor: likedPlaces.includes(selectedPlace.id) ? '#015E6C' : 'transparent'
                  }}
                >
                  <Heart size={20} className={likedPlaces.includes(selectedPlace.id) ? 'fill-current' : ''} />
                  {likedPlaces.includes(selectedPlace.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  className="flex-1 py-4 rounded-xl border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                  style={{
                    borderColor: '#015E6C',
                    color: '#015E6C'
                  }}
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>

              {/* Book Button */}
              <button 
                className="w-full mt-4 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#015E6C' }}
              >
                Plan Your Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}