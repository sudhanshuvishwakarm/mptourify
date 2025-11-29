'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { 
  Search, ChevronDown, Home, ArrowRight, Sparkles, Loader2, X
} from 'lucide-react';
import TextField from '@/components/ui/TextField';
import { clearCache } from '@/redux/slices/adminSlice';

export default function PanchayatPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { panchayats, loading, error, lastFetched } = useSelector((state) => state.panchayat);
  const { districts } = useSelector((state) => state.district);
  
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [mapContainerRef, setMapContainerRef] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [hoveredPanchayat, setHoveredPanchayat] = useState(null);
  
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const lastClickedMarkerRef = useRef(null);
  const itemsPerPage = 12;
  const districtRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (districtRef.current && !districtRef.current.contains(event.target)) {
      setIsDistrictOpen(false);
    }
  };
  
  if (isDistrictOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isDistrictOpen]);

  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam && districtParam !== 'all') {
      setSelectedDistrict(districtParam);
    }
  }, [searchParams]);

 useEffect(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
  const shouldFetchDistricts = districts.length === 0;

  if (shouldFetchPanchayats) {
    // Clear cache before fetching to ensure fresh verified data
    dispatch(clearCache());
    dispatch(fetchPanchayats({ limit: 100, status: 'Verified' }));
  }
  
  if (shouldFetchDistricts) {
    dispatch(fetchDistricts());
  }
}, [dispatch, districts.length, lastFetched]); // Remove panchayats.length from dependencies
  // useEffect(() => {
  //   const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
  //   const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
  //   const shouldFetchDistricts = districts.length === 0;

  //   if (shouldFetchPanchayats) {
  //     dispatch(fetchPanchayats({ limit: 100 }));
  //   }
    
  //   if (shouldFetchDistricts) {
  //     dispatch(fetchDistricts());
  //   }
  // }, [dispatch, panchayats.length, districts.length, lastFetched]);

  const districtOptions = useMemo(() => [
    { value: 'all', label: 'All Districts' },
    ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
  ], [districts]);

  const filteredPanchayats = useMemo(() => {
  return panchayats.filter(item => {
    // Only show verified panchayats on public page
    if (item.status !== 'Verified') {
      return false;
    }
    
    if (searchTerm && 
        !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    const matchesDistrict = selectedDistrict === 'all' || 
                           item.district?._id === selectedDistrict ||
                           item.district === selectedDistrict;
    
    return matchesDistrict;
  });
}, [panchayats, selectedDistrict, searchTerm]);

  const handleDistrictChange = useCallback((district) => {
  setSelectedDistrict(district);
  setIsDistrictOpen(false);
  
  if (mapRef.current && window.L) {
    if (district !== 'all') {
      const selectedDistrictData = districts.find(d => d._id === district);
      if (selectedDistrictData && selectedDistrictData.coordinates) {
        mapRef.current.setView(
          [selectedDistrictData.coordinates.lat, selectedDistrictData.coordinates.lng], 
          9
        );
      }
    } else {
      mapRef.current.setView([23.1815, 77.4104], 7);
    }
  }
}, [districts]);

  useEffect(() => {
    if (!mapContainerRef) return;

    const loadLeaflet = async () => {
      if (window.L) {
        initMap();
        return;
      }

      const link = document.createElement('link');
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.rel = 'stylesheet';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

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
        if (mapRef.current) {
          updateMapMarkers();
          return;
        }

        const map = window.L.map(mapContainerRef).setView([23.1815, 77.4104], 7);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapRef.current = map;
        
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        setMapLoading(false);

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoading(false);
      }
    };

    const updateMapMarkers = () => {
      if (!mapRef.current || !window.L) return;

      markersRef.current.forEach(marker => {
        mapRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      const panchayatsToShow = filteredPanchayats.filter(p => 
        p.coordinates && p.coordinates.lat && p.coordinates.lng
      );

      const greenIcon = new window.L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      panchayatsToShow.forEach(panchayat => {
        const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

        const marker = window.L.marker(coords, {
          icon: greenIcon
        }).addTo(mapRef.current);

        markersRef.current.push(marker);

     

        marker.panchayatData = panchayat;

        marker.on('click', () => {
          const currentMarker = marker;
          
          if (lastClickedMarkerRef.current === currentMarker) {
            setSelectedPanchayat(panchayat);
          } else {
            mapRef.current.setView(coords, 12);
            lastClickedMarkerRef.current = currentMarker;
          }
        });

        marker.bindPopup(`
          <div style="text-align: center; padding: 10px; min-width: 180px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span style="font-weight: 600; color: #117307; font-size: 13px;">
                ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
              </span>
            </div>
            <div style="font-weight: bold; color: #0d4d03; font-size: 18px; margin-bottom: 4px;">
              ${panchayat.name || 'Panchayat'}
            </div>
            ${panchayat.basicInfo?.population ? `<div style="color: #1a5e10; font-size: 12px; margin-top: 4px; font-weight: 500;">Population: ${formatPopulation(panchayat.basicInfo.population)}</div>` : ''}
            <button 
              onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
              style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
              onmouseover="this.style.background='#0d5c06'"
              onmouseout="this.style.background='#117307'"
            >
              View Details
            </button>
          </div>
        `);
      });

      const style = document.createElement('style');
      style.textContent = `
        .panchayat-marker-label {
          background: rgba(17, 115, 7, 0.9);
          border: 2px solid white;
          border-radius: 12px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          white-space: nowrap;
        }
        .leaflet-tooltip-top.panchayat-marker-label::before {
          border-top-color: rgba(17, 115, 7, 0.9);
        }
      `;
      document.head.appendChild(style);
    };

    const handlePanchayatSelect = (event) => {
      const panchayatId = event.detail;
      const panchayat = panchayats.find(p => p._id === panchayatId);
      if (panchayat) {
        setSelectedPanchayat(panchayat);
      }
    };

    document.addEventListener('panchayatSelect', handlePanchayatSelect);

    loadLeaflet();

    return () => {
      document.removeEventListener('panchayatSelect', handlePanchayatSelect);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [mapContainerRef]);

  useEffect(() => {
    if (mapRef.current && window.L && !mapLoading) {
      const timer = setTimeout(() => {
        markersRef.current.forEach(marker => {
          mapRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        const panchayatsToShow = filteredPanchayats.filter(p => 
          p.coordinates && p.coordinates.lat && p.coordinates.lng
        );

        const greenIcon = new window.L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        panchayatsToShow.forEach(panchayat => {
          const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

          const marker = window.L.marker(coords, {
            icon: greenIcon
          }).addTo(mapRef.current);

          markersRef.current.push(marker);

          

          marker.panchayatData = panchayat;

          marker.on('click', () => {
            const currentMarker = marker;
            
            if (lastClickedMarkerRef.current === currentMarker) {
              setSelectedPanchayat(panchayat);
            } else {
              mapRef.current.setView(coords, 12);
              lastClickedMarkerRef.current = currentMarker;
            }
          });

          marker.bindPopup(`
            <div style="text-align: center; padding: 10px; min-width: 180px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span style="font-weight: 600; color: #117307; font-size: 13px;">
                  ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
                </span>
              </div>
              <div style="font-weight: bold; color: #0d4d03; font-size: 18px; margin-bottom: 4px;">
                ${panchayat.name || 'Panchayat'}
              </div>
              ${panchayat.basicInfo?.population ? `<div style="color: #1a5e10; font-size: 12px; margin-top: 4px; font-weight: 500;">Population: ${formatPopulation(panchayat.basicInfo.population)}</div>` : ''}
              <button 
                onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
                style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
                onmouseover="this.style.background='#0d5c06'"
                onmouseout="this.style.background='#117307'"
              >
                View Details
              </button>
            </div>
          `);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [filteredPanchayats, mapLoading]);

  const totalPages = Math.ceil(filteredPanchayats.length / itemsPerPage);
  const paginatedPanchayats = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPanchayats.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPanchayats, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistrict, searchTerm]);

  const handleCardClick = useCallback((slug) => {
    router.push(`/panchayats/${slug}`);
  }, [router]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedDistrict('all');
    if (mapRef.current) {
      mapRef.current.setView([23.1815, 77.4104], 7);
    }
  }, []);

  const currentDistrictLabel = useMemo(() => {
    return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
  }, [selectedDistrict, districtOptions]);

  const formatPopulation = (pop) => {
    if (!pop) return 'N/A';
    if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
    return pop.toString();
  };

  const formatArea = (area) => {
    if (!area) return 'N/A';
    return `${area.toLocaleString()} km²`;
  };

  const getPanchayatEmoji = (panchayat) => {
    const name = panchayat.name || '';
    if (name.includes('River') || name.includes('Nadi')) return '🌊';
    if (name.includes('Forest') || name.includes('Van')) return '🌳';
    if (name.includes('Hill') || name.includes('Pahad')) return '⛰️';
    if (name.includes('Farm') || name.includes('Khet')) return '🚜';
    return '🏡';
  };

  return (
    <div className="min-h-screen hideExtra bg-[#f5fbf2]">
      <div className="bg-[#117307] relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
          <div className="lg:hidden space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Home size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">Village Stories</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Gram Panchayats
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                Experience the heart of rural Madhya Pradesh - authentic villages, rich traditions, and vibrant communities
              </p>
            </div>

            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20">
              <div className="space-y-4">
                <TextField
                  placeholder="Search panchayats, blocks, or districts..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  fullWidth
                  startIcon={<Search size={20} className="text-[#117307]" />}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
                      '&:hover fieldset': { borderColor: '#117307' },
                      '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' }
                    },
                    '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
                  }}
                />

                <div className="relative" ref={districtRef}>
                  <button
                    onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                    className="w-full flex items-center justify-between mt-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                  >
                    <span className="truncate">{currentDistrictLabel}</span>
                    <ChevronDown 
                      size={20} 
                      className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {isDistrictOpen && (
                    <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {districtOptions.map((option) => (
               <button
  key={option.value}
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDistrictChange(option.value);
  }}
  className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold ${
    selectedDistrict === option.value 
      ? 'bg-[#117307] text-white' 
      : 'text-[#117307]'
  }`}
>
  {option.label}
</button>

                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
                <span className="text-[#117307] font-medium">
                  {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
                </span>
                <div className="flex items-center gap-2 text-[#117307]/60">
                  <Sparkles size={16} />
                  <span>Explore Villages</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-between items-start gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Home size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">
                  Village Stories
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Gram Panchayats
              </h1>
              <p className="text-lg text-white/90">
                Experience the heart of rural Madhya Pradesh - authentic villages and traditions
              </p>
            </div>

            <div className="flex-1 max-w-lg">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <TextField
                      placeholder="Search panchayats..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      fullWidth
                      startIcon={<Search size={20} className="text-[#117307]" />}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#117307' },
                          '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' },
                          height: '48px'
                        },
                        '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
                      }}
                    />
                  </div>

                  <div className="w-48 relative" ref={districtRef}>
                    <button
                      onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                    >
                      <span className="truncate">{currentDistrictLabel}</span>
                      <ChevronDown 
                        size={20} 
                        className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {isDistrictOpen && (
                      <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                        {districtOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleDistrictChange(option.value)}
                            className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold ${
                              selectedDistrict === option.value 
                                ? 'bg-[#117307] text-white' 
                                : 'text-[#117307]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
                  <span className="text-[#117307] font-medium">
                    {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
                  </span>
                  <div className="flex items-center gap-2 text-[#117307] font-medium">
                    <Sparkles size={16} />
                    <span>Explore Villages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading && panchayats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
            <p className="text-[#117307] text-lg font-medium">Loading panchayats...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
              <Home size={32} className="text-red-500" />
            </div>
            <p className="text-[#117307] text-lg font-medium">Failed to load panchayats</p>
          </div>
        ) : filteredPanchayats.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
              <Home size={32} className="text-[#117307]" />
            </div>
            <p className="text-[#117307] text-lg font-medium mb-2">No panchayats found</p>
            <button
              onClick={handleClearFilters}
              className="text-[#117307] underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedPanchayats.map((panchayat) => (
                <div
                  key={panchayat._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group border-[#117307] relative"
                  onMouseEnter={() => setHoveredPanchayat(panchayat._id)}
                  onMouseLeave={() => setHoveredPanchayat(null)}
                  onClick={() => setSelectedPanchayat(panchayat)}
                >
                  <div className="h-48 overflow-hidden relative">
                    {panchayat.headerImage ? (
                      <img 
                        src={panchayat.headerImage} 
                        alt={panchayat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(panchayat.name);
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-6xl bg-[#f5fbf2]"
                      >
                        {getPanchayatEmoji(panchayat)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="text-xl font-bold">{panchayat.name}</h3>
                        <p className="text-sm opacity-90">{panchayat.block}, {panchayat.district?.name}</p>
                      </div>
                    </div>
                    
                    <div className={`absolute inset-0 bg-[#117307]/90 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredPanchayat === panchayat._id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="text-center text-white p-4">
                        <p className="text-lg font-semibold mb-2">Explore {panchayat.name}</p>
                        <p className="text-sm opacity-90">Discover the authentic rural experience</p>
                        <div className="mt-3 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                          Click to explore
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg border-2 border-[#117307] font-semibold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-[#117307] text-white' 
                          : 'text-[#117307] hover:bg-[#117307] hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPanchayat && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPanchayat(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-64 relative overflow-hidden">
              {selectedPanchayat.headerImage ? (
                <img 
                  src={selectedPanchayat.headerImage} 
                  alt={selectedPanchayat.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedPanchayat.name);
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]"
                >
                  {getPanchayatEmoji(selectedPanchayat)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <button
                onClick={() => setSelectedPanchayat(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X size={24} className="text-[#117307]" />
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-4xl font-bold mb-2">{selectedPanchayat.name}</h2>
                <p className="text-xl opacity-90">{selectedPanchayat.block}, {selectedPanchayat.district?.name}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                {selectedPanchayat.basicInfo?.establishmentYear && (
                  <div>
                    <p className="text-sm font-bold mb-2 text-[#117307]">
                      ESTABLISHED
                    </p>
                    <p className="text-lg font-semibold text-[#2E3A3B]">
                      {selectedPanchayat.basicInfo.establishmentYear}
                    </p>
                  </div>
                )}
                {selectedPanchayat.basicInfo?.population && (
                  <div>
                    <p className="text-sm font-bold mb-2 text-[#117307]">
                      POPULATION
                    </p>
                    <p className="text-lg font-semibold text-[#2E3A3B]">
                      {formatPopulation(selectedPanchayat.basicInfo.population)}
                    </p>
                  </div>
                )}
                {selectedPanchayat.basicInfo?.area && (
                  <div>
                    <p className="text-sm font-bold mb-2 text-[#117307]">
                      AREA
                    </p>
                    <p className="text-lg font-semibold text-[#2E3A3B]">
                      {formatArea(selectedPanchayat.basicInfo.area)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold mb-2 text-[#117307]">
                    BLOCK
                  </p>
                  <p className="text-lg font-semibold text-[#2E3A3B]">
                    {selectedPanchayat.block || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleCardClick(selectedPanchayat.slug)}
                  className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307] hover:bg-[#0d5c06]"
                >
                  Explore
                </button>
                <button 
                  onClick={() => setSelectedPanchayat(null)}
                  className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg text-[#117307] border-2 border-[#117307] hover:bg-[#117307] hover:text-white"
                >
                  Cancel
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

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { 
//   MapPin, Search, Users, Calendar, ChevronDown, 
//   Home, ArrowRight, TreePine, Sparkles, Map as MapIcon,
//   Image as ImageIcon, Loader2, Filter, X
// } from 'lucide-react';
// import TextField from '@/components/ui/TextField';

// export default function PanchayatPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { panchayats, loading, error, lastFetched } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const [mapLoading, setMapLoading] = useState(true);
//   const [selectedPanchayat, setSelectedPanchayat] = useState(null);
//   const [hoveredPanchayat, setHoveredPanchayat] = useState(null);
  
//   const mapRef = useRef(null);
//   const markersRef = useRef([]);
//   const itemsPerPage = 12;
//   const districtRef = useRef(null);
//   const filtersRef = useRef(null);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//       if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
//         setShowFilters(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Get district from URL params
//   useEffect(() => {
//     const districtParam = searchParams.get('district');
//     if (districtParam && districtParam !== 'all') {
//       setSelectedDistrict(districtParam);
//     }
//   }, [searchParams]);

//   // Smart data fetching with cache
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
//     const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchPanchayats) {
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, panchayats.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized filtered panchayats
//   const filteredPanchayats = useMemo(() => {
//     return panchayats.filter(item => {
//       // Search filter
//       if (searchTerm && 
//           !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       // District filter
//       const matchesDistrict = selectedDistrict === 'all' || 
//                              item.district?._id === selectedDistrict ||
//                              item.district === selectedDistrict;
      
//       return matchesDistrict;
//     });
//   }, [panchayats, selectedDistrict, searchTerm]);

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
// const updateMapMarkers = () => {
//   if (!mapRef.current || !window.L) return;

//   // Clear existing markers
//   markersRef.current.forEach(marker => {
//     mapRef.current.removeLayer(marker);
//   });
//   markersRef.current = [];

//   // Get panchayats for display based on filters
//   const panchayatsToShow = filteredPanchayats.filter(p => 
//     p.coordinates && p.coordinates.lat && p.coordinates.lng
//   );

//   console.log('Adding markers for panchayats:', panchayatsToShow.length);

//   // Green marker icon for panchayats
//   const greenIcon = new window.L.Icon({
//     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
//   });

//   // Add markers for each panchayat
//   panchayatsToShow.forEach(panchayat => {
//     const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

//     const marker = window.L.marker(coords, {
//       icon: greenIcon
//     }).addTo(mapRef.current);

//     markersRef.current.push(marker);

//     // Remove the permanent tooltip - only show on hover
//     marker.bindTooltip(panchayat.name, {
//       permanent: false, // Changed from true to false
//       direction: 'top',
//       offset: [0, -10],
//       className: 'panchayat-marker-label'
//     });

//     // Store panchayat data in marker for later access
//     marker.panchayatData = panchayat;

//     marker.on('click', () => {
//       // Only show modal if zoomed in enough
//       if (zoomLevel > 10) {
//         setSelectedPanchayat(panchayat);
//       } else {
//         // First click - zoom to panchayat
//         mapRef.current.setView(coords, 12);
//         setZoomLevel(12);
//       }
//     });

//     marker.bindPopup(`
//       <div style="text-align: center; padding: 10px; min-width: 180px;">
//         <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
//           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//             <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
//             <circle cx="12" cy="10" r="3"></circle>
//           </svg>
//           <span style="font-weight: 600; color: #117307; font-size: 13px;">
//             ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
//           </span>
//         </div>
//         <div style="font-weight: bold; color: #0d4d03; font-size: 18px; margin-bottom: 4px;">
//           ${panchayat.name || 'Panchayat'}
//         </div>
//         ${panchayat.basicInfo?.population ? `<div style="color: #1a5e10; font-size: 12px; margin-top: 4px; font-weight: 500;">Population: ${formatPopulation(panchayat.basicInfo.population)}</div>` : ''}
//         <button 
//           onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
//           style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
//           onmouseover="this.style.background='#0d5c06'"
//           onmouseout="this.style.background='#117307'"
//         >
//           View Details
//         </button>
//       </div>
//     `);
//   });

//   // Add custom CSS for marker labels (for hover tooltips)
//   const style = document.createElement('style');
//   style.textContent = `
//     .panchayat-marker-label {
//       background: rgba(17, 115, 7, 0.9);
//       border: 2px solid white;
//       border-radius: 12px;
//       padding: 4px 8px;
//       font-size: 11px;
//       font-weight: 600;
//       color: white;
//       text-shadow: 0 1px 2px rgba(0,0,0,0.3);
//       white-space: nowrap;
//     }
//     .leaflet-tooltip-top.panchayat-marker-label::before {
//       border-top-color: rgba(17, 115, 7, 0.9);
//     }
//   `;
//   document.head.appendChild(style);

//   // Zoom to selected district if not "all"
//   if (selectedDistrict !== 'all') {
//     const district = districts.find(d => d._id === selectedDistrict);
//     if (district && district.coordinates) {
//       mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//       setZoomLevel(9);
//     }
//   } else {
//     // Reset to MP view
//     mapRef.current.setView([23.1815, 77.4104], 7);
//     setZoomLevel(7);
//   }

//   console.log(`Map markers updated with ${panchayatsToShow.length} panchayats`);
// };
//     // const updateMapMarkers = () => {
//     //   if (!mapRef.current || !window.L) return;

//     //   // Clear existing markers
//     //   markersRef.current.forEach(marker => {
//     //     mapRef.current.removeLayer(marker);
//     //   });
//     //   markersRef.current = [];

//     //   // Get panchayats for display based on filters
//     //   const panchayatsToShow = filteredPanchayats.filter(p => 
//     //     p.coordinates && p.coordinates.lat && p.coordinates.lng
//     //   );

//     //   console.log('Adding markers for panchayats:', panchayatsToShow.length);

//     //   // Green marker icon for panchayats
//     //   const greenIcon = new window.L.Icon({
//     //     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//     //     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     //     iconSize: [25, 41],
//     //     iconAnchor: [12, 41],
//     //     popupAnchor: [1, -34],
//     //     shadowSize: [41, 41]
//     //   });

//     //   // Add markers for each panchayat
//     //   panchayatsToShow.forEach(panchayat => {
//     //     const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

//     //     const marker = window.L.marker(coords, {
//     //       icon: greenIcon
//     //     }).addTo(mapRef.current);

//     //     markersRef.current.push(marker);

//     //     // Add panchayat name as tooltip (shown on hover)
//     //     marker.bindTooltip(panchayat.name, {
//     //       permanent: true,
//     //       direction: 'top',
//     //       offset: [0, -10],
//     //       className: 'panchayat-marker-label'
//     //     });

//     //     marker.on('click', () => {
//     //       setSelectedPanchayat(panchayat);
//     //       mapRef.current.setView(coords, 12);
//     //     });

//     //     marker.bindPopup(`
//     //       <div style="text-align: center; padding: 10px; min-width: 180px;">
//     //         <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
//     //           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//     //             <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
//     //             <circle cx="12" cy="10" r="3"></circle>
//     //           </svg>
//     //           <span style="font-weight: 600; color: #117307; font-size: 13px;">
//     //             ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
//     //           </span>
//     //         </div>
//     //         <div style="font-weight: bold; color: #0d4d03; font-size: 18px; margin-bottom: 4px;">
//     //           ${panchayat.name || 'Panchayat'}
//     //         </div>
//     //         ${panchayat.population ? `<div style="color: #1a5e10; font-size: 12px; margin-top: 4px; font-weight: 500;">Population: ${formatPopulation(panchayat.population)}</div>` : ''}
//     //         <button 
//     //           onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
//     //           style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
//     //           onmouseover="this.style.background='#0d5c06'"
//     //           onmouseout="this.style.background='#117307'"
//     //         >
//     //           View Details
//     //         </button>
//     //       </div>
//     //     `);
//     //   });

//     //   // Add custom CSS for marker labels
//     //   const style = document.createElement('style');
//     //   style.textContent = `
//     //     .panchayat-marker-label {
//     //       background: rgba(17, 115, 7, 0.9);
//     //       border: 2px solid white;
//     //       border-radius: 12px;
//     //       padding: 4px 8px;
//     //       font-size: 11px;
//     //       font-weight: 600;
//     //       color: white;
//     //       text-shadow: 0 1px 2px rgba(0,0,0,0.3);
//     //       white-space: nowrap;
//     //     }
//     //     .leaflet-tooltip-top.panchayat-marker-label::before {
//     //       border-top-color: rgba(17, 115, 7, 0.9);
//     //     }
//     //   `;
//     //   document.head.appendChild(style);

//     //   // Zoom to selected district if not "all"
//     //   if (selectedDistrict !== 'all') {
//     //     const district = districts.find(d => d._id === selectedDistrict);
//     //     if (district && district.coordinates) {
//     //       mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//     //     }
//     //   } else {
//     //     // Reset to MP view
//     //     mapRef.current.setView([23.1815, 77.4104], 7);
//     //   }

//     //   console.log(`Map markers updated with ${panchayatsToShow.length} panchayats`);
//     // };

//     // Listen for panchayat selection from popup
//     const handlePanchayatSelect = (event) => {
//       const panchayatId = event.detail;
//       const panchayat = panchayats.find(p => p._id === panchayatId);
//       if (panchayat) {
//         setSelectedPanchayat(panchayat);
//       }
//     };

//     document.addEventListener('panchayatSelect', handlePanchayatSelect);

//     loadLeaflet();

//     return () => {
//       document.removeEventListener('panchayatSelect', handlePanchayatSelect);
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//       markersRef.current = [];
//     };
//   }, [mapContainerRef]);

//   // Update markers when filters change
//   useEffect(() => {
//     if (mapRef.current && window.L && !mapLoading) {
//       const timer = setTimeout(() => {
//         // Clear existing markers
//         markersRef.current.forEach(marker => {
//           mapRef.current.removeLayer(marker);
//         });
//         markersRef.current = [];

//         // Get panchayats for display
//         const panchayatsToShow = filteredPanchayats.filter(p => 
//           p.coordinates && p.coordinates.lat && p.coordinates.lng
//         );

//         console.log('Updating markers with panchayats:', panchayatsToShow.length);

//         // Green marker icon
//         const greenIcon = new window.L.Icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//           popupAnchor: [1, -34],
//           shadowSize: [41, 41]
//         });

//         // Add markers
//         panchayatsToShow.forEach(panchayat => {
//           const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

//           const marker = window.L.marker(coords, {
//             icon: greenIcon
//           }).addTo(mapRef.current);

//           markersRef.current.push(marker);

//           // Add panchayat name as permanent label
//           marker.bindTooltip(panchayat.name, {
//             permanent: true,
//             direction: 'top',
//             offset: [0, -10],
//             className: 'panchayat-marker-label'
//           });

//           marker.on('click', () => {
//             setSelectedPanchayat(panchayat);
//             mapRef.current.setView(coords, 12);
//           });

//           marker.bindPopup(`
//             <div style="text-align: center; padding: 10px; min-width: 180px;">
//               <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                   <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
//                   <circle cx="12" cy="10" r="3"></circle>
//                 </svg>
//                 <span style="font-weight: 600; color: #117307; font-size: 13px;">
//                   ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
//                 </span>
//               </div>
//               <div style="font-weight: bold; color: #0d4d03; font-size: 18px; margin-bottom: 4px;">
//                 ${panchayat.name || 'Panchayat'}
//               </div>
//               ${panchayat.population ? `<div style="color: #1a5e10; font-size: 12px; margin-top: 4px; font-weight: 500;">Population: ${formatPopulation(panchayat.population)}</div>` : ''}
//               <button 
//                 onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
//                 style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
//                 onmouseover="this.style.background='#0d5c06'"
//                 onmouseout="this.style.background='#117307'"
//               >
//                 View Details
//               </button>
//             </div>
//           `);
//         });

//         // Zoom to selected district
//         if (selectedDistrict !== 'all') {
//           const district = districts.find(d => d._id === selectedDistrict);
//           if (district && district.coordinates) {
//             mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//           }
//         } else {
//           mapRef.current.setView([23.1815, 77.4104], 7);
//         }

//         console.log(`Markers updated: ${panchayatsToShow.length} panchayats`);
//       }, 100);

//       return () => clearTimeout(timer);
//     }
//   }, [filteredPanchayats, selectedDistrict, districts, mapLoading]);

//   // Pagination
//   const totalPages = Math.ceil(filteredPanchayats.length / itemsPerPage);
//   const paginatedPanchayats = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredPanchayats.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredPanchayats, currentPage, itemsPerPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedDistrict, searchTerm]);

//   // Handlers
//   const handleCardClick = useCallback((slug) => {
//     router.push(`/panchayats/${slug}`);
//   }, [router]);

//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedDistrict('all');
//   }, []);

//   const currentDistrictLabel = useMemo(() => {
//     return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
//   }, [selectedDistrict, districtOptions]);

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   const getPanchayatEmoji = (panchayat) => {
//     const name = panchayat.name || '';
//     if (name.includes('River') || name.includes('Nadi')) return '🌊';
//     if (name.includes('Forest') || name.includes('Van')) return '🌳';
//     if (name.includes('Hill') || name.includes('Pahad')) return '⛰️';
//     if (name.includes('Farm') || name.includes('Khet')) return '🚜';
//     return '🏡';
//   };

//   return (
//     <div className="min-h-screen hideExtra bg-[#f5fbf2]">
//       {/* Hero Header */}
//       <div className="bg-[#117307] relative">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
//           {/* Mobile & Tablet Layout */}
//           <div className="lg:hidden space-y-8">
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Village Stories</span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Gram Panchayats
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Experience the heart of rural Madhya Pradesh - authentic villages, rich traditions, and vibrant communities
//               </p>
//             </div>

//             {/* Search & Filter */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20" ref={filtersRef}>
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search panchayats, blocks, or districts..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#117307]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                       '&:hover fieldset': { borderColor: '#117307' },
//                       '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' }
//                     },
//                     '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//                   }}
//                 />

//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//                 >
//                   <Filter size={20} />
//                   <span>Filters</span>
//                   <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//                 </button>

//                 {showFilters && (
//                   <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#117307]/20">
//                     <div className="relative" ref={districtRef}>
//                       <button
//                         onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                         className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//                       >
//                         <span className="truncate">{currentDistrictLabel}</span>
//                         <ChevronDown 
//                           size={20} 
//                           className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isDistrictOpen && (
//                         <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                           {districtOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleDistrictChange(option.value)}
//                               className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold ${
//                                 selectedDistrict === option.value 
//                                   ? 'bg-[#117307] text-white' 
//                                   : 'text-[#117307]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#117307] font-medium">
//                   {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//                 </span>
//                 <div className="flex items-center gap-2 text-[#117307]/60">
//                   <Sparkles size={16} />
//                   <span>Explore Villages</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop Layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             <div className="flex-1 max-w-2xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Village Stories
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Gram Panchayats
//               </h1>
//               <p className="text-lg text-white/90">
//                 Experience the heart of rural Madhya Pradesh - authentic villages and traditions
//               </p>
//             </div>

//             <div className="flex-1 max-w-lg">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="flex gap-3 items-center">
//                   <div className="w-[70%]">
//                     <TextField
//                       placeholder="Search panchayats..."
//                       value={searchTerm}
//                       onChange={handleSearchChange}
//                       fullWidth
//                       startIcon={<Search size={20} className="text-[#117307]" />}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                           '&:hover fieldset': { borderColor: '#117307' },
//                           '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                           height: '48px'
//                         },
//                         '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//                       }}
//                     />
//                   </div>

//                   <div className="w-[30%] relative bg-white" ref={districtRef}>
//                     <button
//                       onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                       className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-medium bg-white transition-colors text-sm h-12"
//                     >
//                       <span className="truncate">{currentDistrictLabel}</span>
//                       <ChevronDown 
//                         size={16} 
//                         className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
                    
//                     {isDistrictOpen && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                         {districtOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             onClick={() => handleDistrictChange(option.value)}
//                             className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold transition-colors text-sm ${
//                               selectedDistrict === option.value 
//                                 ? 'bg-[#117307] text-white' 
//                                 : 'text-[#117307]'
//                             }`}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                   <span className="text-[#117307] font-medium">
//                     {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//                   </span>
//                   <div className="flex items-center gap-2 text-[#117307] font-medium">
//                     <Sparkles size={16} />
//                     <span>Explore Villages</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Map Section */}
//       <div className="max-w-7xl mx-auto px-4 py-8">
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
//         </div>
//       </div>

//       {/* Panchayats Grid - Simplified Cards */}
//       <div className="max-w-7xl mx-auto px-4 pb-12">
//         {loading && panchayats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
//             <p className="text-[#117307] text-lg font-medium">Loading panchayats...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
//               <Home size={32} className="text-red-500" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium">Failed to load panchayats</p>
//           </div>
//         ) : filteredPanchayats.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
//               <Home size={32} className="text-[#117307]" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium mb-2">No panchayats found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#117307] underline font-medium"
//             >
//               Clear filters
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {paginatedPanchayats.map((panchayat) => (
//                 <div
//                   key={panchayat._id}
//                   className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 transform hover:-translate-y-2 overflow-hidden group border-[#117307] relative"
//                   onMouseEnter={() => setHoveredPanchayat(panchayat._id)}
//                   onMouseLeave={() => setHoveredPanchayat(null)}
//                   onClick={() => setSelectedPanchayat(panchayat)}
//                 >
//                   {/* Panchayat Image */}
//                   <div className="h-48 overflow-hidden relative">
//                     {panchayat.headerImage ? (
//                       <img 
//                         src={panchayat.headerImage} 
//                         alt={panchayat.name}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.onerror = null;
//                           e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(panchayat.name);
//                         }}
//                       />
//                     ) : (
//                       <div 
//                         className="w-full h-full flex items-center justify-center text-6xl bg-[#f5fbf2]"
//                       >
//                         {getPanchayatEmoji(panchayat)}
//                       </div>
//                     )}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
//                       <div className="text-white">
//                         <h3 className="text-xl font-bold">{panchayat.name}</h3>
//                         <p className="text-sm opacity-90">{panchayat.block}, {panchayat.district?.name}</p>
//                       </div>
//                     </div>
                    
//                     {/* Hover Overlay */}
//                     <div className={`absolute inset-0 bg-[#117307]/90 flex items-center justify-center transition-opacity duration-300 ${
//                       hoveredPanchayat === panchayat._id ? 'opacity-100' : 'opacity-0'
//                     }`}>
//                       <div className="text-center text-white p-4">
//                         <p className="text-lg font-semibold mb-2">Explore {panchayat.name}</p>
//                         <p className="text-sm opacity-90">Discover the authentic rural experience</p>
//                         <div className="mt-3 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
//                           Click to explore
//                           <ArrowRight size={12} />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-2 mt-12">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Previous
//                 </button>
                
//                 {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                   let pageNum;
//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       className={`px-4 py-2 rounded-lg border-2 border-[#117307] font-semibold transition-all ${
//                         currentPage === pageNum 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307] hover:bg-[#117307] hover:text-white'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
                
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Panchayat Details Modal */}
//       {selectedPanchayat && (
//         // <div
//         //   className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//         //   onClick={() => setSelectedPanchayat(null)}
//         // >
//         //   <div 
//         //     className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//         //     onClick={(e) => e.stopPropagation()}
//         //   >
//         //     {/* Modal Header with Image */}
//         //     <div className="h-64 relative overflow-hidden">
//         //       {selectedPanchayat.headerImage ? (
//         //         <img 
//         //           src={selectedPanchayat.headerImage} 
//         //           alt={selectedPanchayat.name}
//         //           className="w-full h-full object-cover"
//         //           onError={(e) => {
//         //             e.target.onerror = null;
//         //             e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedPanchayat.name);
//         //           }}
//         //         />
//         //       ) : (
//         //         <div 
//         //           className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]"
//         //         >
//         //           {getPanchayatEmoji(selectedPanchayat)}
//         //         </div>
//         //       )}
//         //       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//         //       <button
//         //         onClick={() => setSelectedPanchayat(null)}
//         //         className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//         //       >
//         //         <X size={24} className="text-[#117307]" />
//         //       </button>
//         //       <div className="absolute bottom-6 left-6 right-6 text-white">
//         //         <h2 className="text-4xl font-bold mb-2">{selectedPanchayat.name}</h2>
//         //         <p className="text-xl opacity-90">{selectedPanchayat.block}, {selectedPanchayat.district?.name}</p>
//         //       </div>
//         //     </div>

//         //     {/* Modal Content */}
//         //     <div className="p-8">
//         //       {/* Description */}
//         //       <p className="text-gray-700 mb-8 leading-relaxed text-lg">
//         //         {selectedPanchayat.historicalBackground || selectedPanchayat.traditions || selectedPanchayat.localArt || `Explore the rich heritage and culture of ${selectedPanchayat.name}.`}
//         //       </p>

//         //       {/* Info Grid */}
//         //       <div className="grid grid-cols-2 gap-6 mb-8">
//         //         {selectedPanchayat.establishmentYear && (
//         //           <div>
//         //             <p className="text-sm font-bold mb-2 text-[#117307]">
//         //               ESTABLISHED
//         //             </p>
//         //             <p className="text-lg font-semibold text-[#2E3A3B]">
//         //               {selectedPanchayat.establishmentYear}
//         //             </p>
//         //           </div>
//         //         )}
//         //         {selectedPanchayat.population && (
//         //           <div>
//         //             <p className="text-sm font-bold mb-2 text-[#117307]">
//         //               POPULATION
//         //             </p>
//         //             <p className="text-lg font-semibold text-[#2E3A3B]">
//         //               {formatPopulation(selectedPanchayat.population)}
//         //             </p>
//         //           </div>
//         //         )}
//         //         {selectedPanchayat.area && (
//         //           <div>
//         //             <p className="text-sm font-bold mb-2 text-[#117307]">
//         //               AREA
//         //             </p>
//         //             <p className="text-lg font-semibold text-[#2E3A3B]">
//         //               {formatArea(selectedPanchayat.area)}
//         //             </p>
//         //           </div>
//         //         )}
//         //         <div>
//         //           <p className="text-sm font-bold mb-2 text-[#117307]">
//         //             BLOCK
//         //           </p>
//         //           <p className="text-lg font-semibold text-[#2E3A3B]">
//         //             {selectedPanchayat.block || 'N/A'}
//         //           </p>
//         //         </div>
//         //       </div>

//         //       {/* Rivers */}
//         //       {selectedPanchayat.majorRivers && selectedPanchayat.majorRivers.length > 0 && (
//         //         <div className="mb-8">
//         //           <p className="text-sm font-bold mb-3 text-[#117307]">
//         //             MAJOR RIVERS
//         //           </p>
//         //           <div className="flex flex-wrap gap-2">
//         //             {selectedPanchayat.majorRivers.map((river, idx) => (
//         //               <span
//         //                 key={idx}
//         //                 className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1E88E5]"
//         //               >
//         //                 {river}
//         //               </span>
//         //             ))}
//         //           </div>
//         //         </div>
//         //       )}

//         //       {/* Action Buttons */}
//         //       <div className="flex gap-3">
//         //         <button 
//         //           onClick={() => handleCardClick(selectedPanchayat.slug)}
//         //           className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307]"
//         //         >
//         //           Explore Panchayat
//         //         </button>
//         //         <button 
//         //           onClick={() => setSelectedPanchayat(null)}
//         //           className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg text-[#117307] border-2 border-[#117307]"
//         //         >
//         //           Cancel
//         //         </button>
//         //       </div>
//         //     </div>
//         //   </div>
//         // </div>
//         <div
//   className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//   onClick={() => setSelectedPanchayat(null)}
// >
//   <div 
//     className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//     onClick={(e) => e.stopPropagation()}
//   >
//     {/* Modal Header with Image */}
//     <div className="h-64 relative overflow-hidden">
//       {selectedPanchayat.headerImage ? (
//         <img 
//           src={selectedPanchayat.headerImage} 
//           alt={selectedPanchayat.name}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.src = 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(selectedPanchayat.name);
//           }}
//         />
//       ) : (
//         <div 
//           className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]"
//         >
//           {getPanchayatEmoji(selectedPanchayat)}
//         </div>
//       )}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//       <button
//         onClick={() => setSelectedPanchayat(null)}
//         className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//       >
//         <X size={24} className="text-[#117307]" />
//       </button>
//       <div className="absolute bottom-6 left-6 right-6 text-white">
//         <h2 className="text-4xl font-bold mb-2">{selectedPanchayat.name}</h2>
//         <p className="text-xl opacity-90">{selectedPanchayat.block}, {selectedPanchayat.district?.name}</p>
//       </div>
//     </div>

//     {/* Modal Content */}
//     <div className="p-8">
    

//       {/* Info Grid */}
//       <div className="grid grid-cols-2 gap-6 mb-8">
//         {selectedPanchayat.basicInfo?.establishmentYear && (
//           <div>
//             <p className="text-sm font-bold mb-2 text-[#117307]">
//               ESTABLISHED
//             </p>
//             <p className="text-lg font-semibold text-[#2E3A3B]">
//               {selectedPanchayat.basicInfo.establishmentYear}
//             </p>
//           </div>
//         )}
//         {selectedPanchayat.basicInfo?.population && (
//           <div>
//             <p className="text-sm font-bold mb-2 text-[#117307]">
//               POPULATION
//             </p>
//             <p className="text-lg font-semibold text-[#2E3A3B]">
//               {formatPopulation(selectedPanchayat.basicInfo.population)}
//             </p>
//           </div>
//         )}
//         {selectedPanchayat.basicInfo?.area && (
//           <div>
//             <p className="text-sm font-bold mb-2 text-[#117307]">
//               AREA
//             </p>
//             <p className="text-lg font-semibold text-[#2E3A3B]">
//               {formatArea(selectedPanchayat.basicInfo.area)}
//             </p>
//           </div>
//         )}
//         <div>
//           <p className="text-sm font-bold mb-2 text-[#117307]">
//             BLOCK
//           </p>
//           <p className="text-lg font-semibold text-[#2E3A3B]">
//             {selectedPanchayat.block || 'N/A'}
//           </p>
//         </div>
//       </div>

    

//       {/* Action Buttons */}
//       <div className="flex gap-3">
//         <button 
//           onClick={() => handleCardClick(selectedPanchayat.slug)}
//           className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307] hover:bg-[#0d5c06]"
//         >
//           Explore Panchayat
//         </button>
//         <button 
//           onClick={() => setSelectedPanchayat(null)}
//           className="flex-1 py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg text-lg text-[#117307] border-2 border-[#117307] hover:bg-[#117307] hover:text-white"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// </div>
//       )}
//     </div>
//   );
// }













// 'use client';

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { 
//   MapPin, Search, Users, Calendar, ChevronDown, 
//   Home, ArrowRight, TreePine, Sparkles, Map as MapIcon,
//   Image as ImageIcon, Loader2, Filter
// } from 'lucide-react';
// import TextField from '@/components/ui/TextField';

// export default function PanchayatPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { panchayats, loading, error, lastFetched } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [mapContainerRef, setMapContainerRef] = useState(null);
//   const [mapLoading, setMapLoading] = useState(true);
//   const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  
//   const mapRef = useRef(null);
//   const markersRef = useRef([]);
//   const itemsPerPage = 12;
//   const districtRef = useRef(null);
//   const filtersRef = useRef(null);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//       if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
//         setShowFilters(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Get district from URL params
//   useEffect(() => {
//     const districtParam = searchParams.get('district');
//     if (districtParam && districtParam !== 'all') {
//       setSelectedDistrict(districtParam);
//     }
//   }, [searchParams]);

//   // Smart data fetching with cache
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
//     const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchPanchayats) {
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, panchayats.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized filtered panchayats
//   const filteredPanchayats = useMemo(() => {
//     return panchayats.filter(item => {
//       // Search filter
//       if (searchTerm && 
//           !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       // District filter
//       const matchesDistrict = selectedDistrict === 'all' || 
//                              item.district?._id === selectedDistrict ||
//                              item.district === selectedDistrict;
      
//       return matchesDistrict;
//     });
//   }, [panchayats, selectedDistrict, searchTerm]);

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

//       // Get panchayats for display based on filters
//       const panchayatsToShow = filteredPanchayats.filter(p => 
//         p.coordinates && p.coordinates.lat && p.coordinates.lng
//       );

//       console.log('Adding markers for panchayats:', panchayatsToShow.length);

//       // Blue marker icon for panchayats
//       const blueIcon = new window.L.Icon({
//         iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowSize: [41, 41]
//       });

//       // Add markers for each panchayat
//       panchayatsToShow.forEach(panchayat => {
//         const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

//         const marker = window.L.marker(coords, {
//           icon: blueIcon
//         }).addTo(mapRef.current);

//         markersRef.current.push(marker);

//         marker.on('click', () => {
//           setSelectedPanchayat(panchayat);
//           mapRef.current.setView(coords, 12);
//         });

//         marker.bindPopup(`
//           <div style="text-align: center; padding: 8px; min-width: 150px;">
//             <div style="font-weight: bold; color: #1E88E5; font-size: 16px; margin-bottom: 4px;">
//               ${panchayat.name || 'Panchayat'}
//             </div>
//             <div style="color: #666; font-size: 12px; margin-top: 4px;">
//               ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
//             </div>
//             ${panchayat.population ? `<div style="color: #666; font-size: 11px; margin-top: 2px;">Population: ${formatPopulation(panchayat.population)}</div>` : ''}
//             <button 
//               onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
//               style="margin-top: 8px; padding: 4px 12px; background: #1E88E5; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
//             >
//               View Details
//             </button>
//           </div>
//         `);
//       });

//       // Zoom to selected district if not "all"
//       if (selectedDistrict !== 'all') {
//         const district = districts.find(d => d._id === selectedDistrict);
//         if (district && district.coordinates) {
//           mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//         }
//       } else {
//         // Reset to MP view
//         mapRef.current.setView([23.1815, 77.4104], 7);
//       }

//       console.log(`Map markers updated with ${panchayatsToShow.length} panchayats`);
//     };

//     // Listen for panchayat selection from popup
//     const handlePanchayatSelect = (event) => {
//       const panchayatId = event.detail;
//       const panchayat = panchayats.find(p => p._id === panchayatId);
//       if (panchayat) {
//         setSelectedPanchayat(panchayat);
//       }
//     };

//     document.addEventListener('panchayatSelect', handlePanchayatSelect);

//     loadLeaflet();

//     return () => {
//       document.removeEventListener('panchayatSelect', handlePanchayatSelect);
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//       markersRef.current = [];
//     };
//   }, [mapContainerRef]);

//   // Update markers when filters change
//   useEffect(() => {
//     if (mapRef.current && window.L && !mapLoading) {
//       const timer = setTimeout(() => {
//         // Clear existing markers
//         markersRef.current.forEach(marker => {
//           mapRef.current.removeLayer(marker);
//         });
//         markersRef.current = [];

//         // Get panchayats for display
//         const panchayatsToShow = filteredPanchayats.filter(p => 
//           p.coordinates && p.coordinates.lat && p.coordinates.lng
//         );

//         console.log('Updating markers with panchayats:', panchayatsToShow.length);

//         // Blue marker icon
//         const blueIcon = new window.L.Icon({
//           iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//           shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//           iconSize: [25, 41],
//           iconAnchor: [12, 41],
//           popupAnchor: [1, -34],
//           shadowSize: [41, 41]
//         });

//         // Add markers
//         panchayatsToShow.forEach(panchayat => {
//           const coords = [panchayat.coordinates.lat, panchayat.coordinates.lng];

//           const marker = window.L.marker(coords, {
//             icon: blueIcon
//           }).addTo(mapRef.current);

//           markersRef.current.push(marker);

//           marker.on('click', () => {
//             setSelectedPanchayat(panchayat);
//             mapRef.current.setView(coords, 12);
//           });

//           marker.bindPopup(`
//             <div style="text-align: center; padding: 10px; min-width: 180px;">
//               <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#117307" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                   <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
//                   <circle cx="12" cy="10" r="3"></circle>
//                 </svg>
//                 <span style="font-weight: 600; color: #117307; font-size: 13px;">
//                   ${panchayat.block || ''}, ${panchayat.district?.name || 'District'}
//                 </span>
//               </div>
//               <div style="font-weight: bold; color: #0d4d03; font-size: 18px; margin-bottom: 4px;">
//                 ${panchayat.name || 'Panchayat'}
//               </div>
//               ${panchayat.population ? `<div style="color: #1a5e10; font-size: 12px; margin-top: 4px; font-weight: 500;">Population: ${formatPopulation(panchayat.population)}</div>` : ''}
//               <button 
//                 onclick="document.dispatchEvent(new CustomEvent('panchayatSelect', { detail: '${panchayat._id}' }))"
//                 style="margin-top: 10px; padding: 6px 16px; background: #117307; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;"
//                 onmouseover="this.style.background='#0d5c06'"
//                 onmouseout="this.style.background='#117307'"
//               >
//                 View Details
//               </button>
//             </div>
//           `);
//         });

//         // Zoom to selected district
//         if (selectedDistrict !== 'all') {
//           const district = districts.find(d => d._id === selectedDistrict);
//           if (district && district.coordinates) {
//             mapRef.current.setView([district.coordinates.lat, district.coordinates.lng], 9);
//           }
//         } else {
//           mapRef.current.setView([23.1815, 77.4104], 7);
//         }

//         console.log(`Markers updated: ${panchayatsToShow.length} panchayats`);
//       }, 100);

//       return () => clearTimeout(timer);
//     }
//   }, [filteredPanchayats, selectedDistrict, districts, mapLoading]);

//   // Pagination
//   const totalPages = Math.ceil(filteredPanchayats.length / itemsPerPage);
//   const paginatedPanchayats = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredPanchayats.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredPanchayats, currentPage, itemsPerPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedDistrict, searchTerm]);

//   // Handlers
//   const handleCardClick = useCallback((slug) => {
//     router.push(`/panchayats/${slug}`);
//   }, [router]);

//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedDistrict('all');
//   }, []);

//   const currentDistrictLabel = useMemo(() => {
//     return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
//   }, [selectedDistrict, districtOptions]);

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Hero Header */}
//       <div className="bg-[#117307] relative">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
//           {/* Mobile & Tablet Layout */}
//           <div className="lg:hidden space-y-8">
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Village Stories</span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Gram Panchayats
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Experience the heart of rural Madhya Pradesh - authentic villages, rich traditions, and vibrant communities
//               </p>
//             </div>

//             {/* Search & Filter */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20" ref={filtersRef}>
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search panchayats, blocks, or districts..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#117307]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                       '&:hover fieldset': { borderColor: '#117307' },
//                       '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' }
//                     },
//                     '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//                   }}
//                 />

//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//                 >
//                   <Filter size={20} />
//                   <span>Filters</span>
//                   <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//                 </button>

//                 {showFilters && (
//                   <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#117307]/20">
//                     <div className="relative" ref={districtRef}>
//                       <button
//                         onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                         className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//                       >
//                         <span className="truncate">{currentDistrictLabel}</span>
//                         <ChevronDown 
//                           size={20} 
//                           className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isDistrictOpen && (
//                         <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                           {districtOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleDistrictChange(option.value)}
//                               className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold ${
//                                 selectedDistrict === option.value 
//                                   ? 'bg-[#117307] text-white' 
//                                   : 'text-[#117307]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#117307] font-medium">
//                   {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//                 </span>
//                 <div className="flex items-center gap-2 text-[#117307]/60">
//                   <Sparkles size={16} />
//                   <span>Explore Villages</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop Layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             <div className="flex-1 max-w-2xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Village Stories
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Gram Panchayats
//               </h1>
//               <p className="text-lg text-white/90">
//                 Experience the heart of rural Madhya Pradesh - authentic villages and traditions
//               </p>
//             </div>

//             <div className="flex-1 max-w-lg">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="flex gap-3 items-center">
//                   <div className="w-[70%]">
//                     <TextField
//                       placeholder="Search panchayats..."
//                       value={searchTerm}
//                       onChange={handleSearchChange}
//                       fullWidth
//                       startIcon={<Search size={20} className="text-[#117307]" />}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                           '&:hover fieldset': { borderColor: '#117307' },
//                           '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                           height: '48px'
//                         },
//                         '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//                       }}
//                     />
//                   </div>

//                   <div className="w-[30%] relative bg-white" ref={districtRef}>
//                     <button
//                       onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                       className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-medium bg-white transition-colors text-sm h-12"
//                     >
//                       <span className="truncate">{currentDistrictLabel}</span>
//                       <ChevronDown 
//                         size={16} 
//                         className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
                    
//                     {isDistrictOpen && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                         {districtOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             onClick={() => handleDistrictChange(option.value)}
//                             className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold transition-colors text-sm ${
//                               selectedDistrict === option.value 
//                                 ? 'bg-[#117307] text-white' 
//                                 : 'text-[#117307]'
//                             }`}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                   <span className="text-[#117307] font-medium">
//                     {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//                   </span>
//                   <div className="flex items-center gap-2 text-[#117307] font-medium">
//                     <Sparkles size={16} />
//                     <span>Explore Villages</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Map Section */}
//       <div className="max-w-7xl mx-auto px-4 py-8">
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
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 pb-12">
//         {loading && panchayats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
//             <p className="text-[#117307] text-lg font-medium">Loading panchayats...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
//               <Home size={32} className="text-red-500" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium">Failed to load panchayats</p>
//           </div>
//         ) : filteredPanchayats.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
//               <Home size={32} className="text-[#117307]" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium mb-2">No panchayats found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#117307] underline font-medium"
//             >
//               Clear filters
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {paginatedPanchayats.map((panchayat) => (
//                 <div
//                   key={panchayat._id}
//                   onClick={() => handleCardClick(panchayat.slug)}
//                   className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
//                 >
//                   <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                     {panchayat.headerImage ? (
//                       <img
//                         src={panchayat.headerImage}
//                         alt={panchayat.name}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                           e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
//                         }}
//                       />
//                     ) : null}
//                     <div className="fallback-icon absolute inset-0 flex items-center justify-center bg-[#117307]/5" style={{ display: panchayat.headerImage ? 'none' : 'flex' }}>
//                       <Home size={64} className="text-[#117307] opacity-20" />
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
//                       <MapPin size={14} className="text-[#1a5e10]" />
//                       <span className="truncate">
//                         {panchayat.block}, {panchayat.district?.name || 'District'}
//                       </span>
//                     </div>

//                     <h3 className="text-xl font-bold text-[#0d4d03] mb-3 line-clamp-2 leading-tight group-hover:text-[#0a3a02] transition-colors">
//                       {panchayat.name}
//                     </h3>

//                     <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
//                       {panchayat.historicalBackground || 
//                        panchayat.traditions || 
//                        panchayat.localArt ||
//                        `Discover the unique culture and heritage of ${panchayat.name}.`}
//                     </p>

//                     <div className="grid grid-cols-2 gap-3 mb-4">
//                       {panchayat.population && (
//                         <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                           <Users size={14} className="text-[#117307]" />
//                           <span className="font-medium">{formatPopulation(panchayat.population)}</span>
//                         </div>
//                       )}
//                       {panchayat.area && (
//                         <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                           <MapIcon size={14} className="text-[#117307]" />
//                           <span className="font-medium">{formatArea(panchayat.area)}</span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">
//                       {panchayat.establishmentYear && (
//                         <div className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
//                           <Calendar size={14} />
//                           <span>Est. {panchayat.establishmentYear}</span>
//                         </div>
//                       )}

//                       <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm ml-auto">
//                         Explore
//                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-2 mt-12">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Previous
//                 </button>
                
//                 {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                   let pageNum;
//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       className={`px-4 py-2 rounded-lg border-2 border-[#117307] font-semibold transition-all ${
//                         currentPage === pageNum 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307] hover:bg-[#117307] hover:text-white'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
                
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Panchayat Details Modal */}
//       {selectedPanchayat && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
//           onClick={() => setSelectedPanchayat(null)}
//         >
//           <div 
//             className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="h-64 relative overflow-hidden">
//               {selectedPanchayat.headerImage ? (
//                 <img 
//                   src={selectedPanchayat.headerImage} 
//                   alt={selectedPanchayat.name}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.style.display = 'none';
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-8xl bg-[#117307]/10">
//                   <Home size={80} className="text-[#117307]" />
//                 </div>
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//               <button
//                 onClick={() => setSelectedPanchayat(null)}
//                 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
//               >
//                 <span className="text-[#117307] text-xl font-bold">×</span>
//               </button>
//               <div className="absolute bottom-6 left-6 right-6 text-white">
//                 <h2 className="text-4xl font-bold mb-2">{selectedPanchayat.name}</h2>
//                 <p className="text-lg opacity-90">{selectedPanchayat.block}, {selectedPanchayat.district?.name}</p>
//               </div>
//             </div>

//             <div className="p-8">
//               <p className="text-gray-700 mb-8 leading-relaxed text-lg">
//                 {selectedPanchayat.historicalBackground || 
//                  selectedPanchayat.traditions || 
//                  selectedPanchayat.localArt ||
//                  `Explore the rich heritage and culture of ${selectedPanchayat.name}.`}
//               </p>

//               <div className="grid grid-cols-2 gap-6 mb-8">
//                 {selectedPanchayat.establishmentYear && (
//                   <div>
//                     <p className="text-sm font-bold mb-2 text-[#117307]">ESTABLISHED</p>
//                     <p className="text-lg font-semibold text-[#2E3A3B]">{selectedPanchayat.establishmentYear}</p>
//                   </div>
//                 )}
//                 {selectedPanchayat.population && (
//                   <div>
//                     <p className="text-sm font-bold mb-2 text-[#117307]">POPULATION</p>
//                     <p className="text-lg font-semibold text-[#2E3A3B]">{formatPopulation(selectedPanchayat.population)}</p>
//                   </div>
//                 )}
//                 {selectedPanchayat.area && (
//                   <div>
//                     <p className="text-sm font-bold mb-2 text-[#117307]">AREA</p>
//                     <p className="text-lg font-semibold text-[#2E3A3B]">{formatArea(selectedPanchayat.area)}</p>
//                   </div>
//                 )}
//                 {selectedPanchayat.block && (
//                   <div>
//                     <p className="text-sm font-bold mb-2 text-[#117307]">BLOCK</p>
//                     <p className="text-lg font-semibold text-[#2E3A3B]">{selectedPanchayat.block}</p>
//                   </div>
//                 )}
//               </div>

//               {selectedPanchayat.coordinates && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3 text-[#117307]">COORDINATES</p>
//                   <div className="flex gap-4 text-sm">
//                     <span className="px-3 py-2 bg-gray-100 rounded">
//                       Lat: {selectedPanchayat.coordinates.lat}
//                     </span>
//                     <span className="px-3 py-2 bg-gray-100 rounded">
//                       Lng: {selectedPanchayat.coordinates.lng}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {selectedPanchayat.majorRivers && selectedPanchayat.majorRivers.length > 0 && (
//                 <div className="mb-8">
//                   <p className="text-sm font-bold mb-3 text-[#117307]">MAJOR RIVERS</p>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedPanchayat.majorRivers.map((river, idx) => (
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

//               <div className="flex gap-3">
//                 <button 
//                   onClick={() => handleCardClick(selectedPanchayat.slug)}
//                   className="flex-1 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg text-lg bg-[#117307]"
//                 >
//                   Explore Panchayat
//                 </button>
//                 <button 
//                   onClick={() => setSelectedPanchayat(null)}
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

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { 
//   MapPin, Search, Users, Calendar, ChevronDown, 
//   Home, ArrowRight, TreePine, Sparkles, Map as MapIcon,
//   Image as ImageIcon, Loader2, Filter
// } from 'lucide-react';
// import TextField from '@/components/ui/TextField';

// export default function PanchayatPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { panchayats, loading, error, lastFetched } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
  
//   const itemsPerPage = 12;
//   const districtRef = useRef(null);
//   const filtersRef = useRef(null);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//       if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
//         setShowFilters(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Get district from URL params
//   useEffect(() => {
//     const districtParam = searchParams.get('district');
//     if (districtParam && districtParam !== 'all') {
//       setSelectedDistrict(districtParam);
//     }
//   }, [searchParams]);

//   // Smart data fetching with cache
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
//     const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchPanchayats) {
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, panchayats.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized filtered panchayats
//   const filteredPanchayats = useMemo(() => {
//     return panchayats.filter(item => {
//       // Search filter
//       if (searchTerm && 
//           !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       // District filter
//       const matchesDistrict = selectedDistrict === 'all' || 
//                              item.district?._id === selectedDistrict ||
//                              item.district === selectedDistrict;
      
//       return matchesDistrict;
//     });
//   }, [panchayats, selectedDistrict, searchTerm]);

//   // Pagination
//   const totalPages = Math.ceil(filteredPanchayats.length / itemsPerPage);
//   const paginatedPanchayats = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredPanchayats.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredPanchayats, currentPage, itemsPerPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedDistrict, searchTerm]);

//   // Memoized handlers
//   const handleCardClick = useCallback((slug) => {
//     router.push(`/panchayats/${slug}`);
//   }, [router]);

//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedDistrict('all');
//   }, []);

//   const currentDistrictLabel = useMemo(() => {
//     return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
//   }, [selectedDistrict, districtOptions]);

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Hero Header */}
//       <div className="bg-[#117307] relative ">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
//           {/* Mobile & Tablet Layout */}
//           <div className="lg:hidden space-y-8">
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Village Stories</span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Gram Panchayats
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Experience the heart of rural Madhya Pradesh - authentic villages, rich traditions, and vibrant communities
//               </p>
//             </div>

//             {/* Search & Filter */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20" ref={filtersRef}>
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search panchayats, blocks, or districts..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#117307]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                       '&:hover fieldset': { borderColor: '#117307' },
//                       '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' }
//                     },
//                     '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//                   }}
//                 />

//                 {/* Filter Toggle Button for Mobile */}
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//                 >
//                   <Filter size={20} />
//                   <span>Filters</span>
//                   <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//                 </button>

//                 {/* Filters Container - Conditionally rendered */}
//                 {showFilters && (
//                   <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#117307]/20">
//                     {/* District Dropdown */}
//                     <div className="relative" ref={districtRef}>
//                       <button
//                         onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                         className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//                       >
//                         <span className="truncate">{currentDistrictLabel}</span>
//                         <ChevronDown 
//                           size={20} 
//                           className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isDistrictOpen && (
//                         <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                           {districtOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleDistrictChange(option.value)}
//                               className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold ${
//                                 selectedDistrict === option.value 
//                                   ? 'bg-[#117307] text-white' 
//                                   : 'text-[#117307]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#117307] font-medium">
//                   {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//                 </span>
//                 <div className="flex items-center gap-2 text-[#117307]/60">
//                   <Sparkles size={16} />
//                   <span>Explore Villages</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop Layout - Updated to match News & Announcements */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             {/* Header Content - Left Side */}
//             <div className="flex-1 max-w-2xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Village Stories
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Gram Panchayats
//               </h1>
//               <p className="text-lg text-white/90">
//                 Experience the heart of rural Madhya Pradesh - authentic villages and traditions
//               </p>
//             </div>

//             {/* Search & Filter - Right Side */}
//             <div className="flex-1 max-w-lg">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 {/* Search and Filter Side by Side - 70% / 30% width */}
//                 <div className="flex gap-3 items-center">
//                   {/* Search - 70% width */}
//                   <div className="w-[70%]">
//                     <TextField
//                       placeholder="Search panchayats..."
//                       value={searchTerm}
//                       onChange={handleSearchChange}
//                       fullWidth
//                       startIcon={<Search size={20} className="text-[#117307]" />}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': {
//                             borderColor: '#117307',
//                             borderWidth: '2px',
//                           },
//                           '&:hover fieldset': {
//                             borderColor: '#117307',
//                           },
//                           '&.Mui-focused fieldset': {
//                             borderColor: '#117307',
//                             borderWidth: '2px',
//                           },
//                           height: '48px'
//                         },
//                         '& .MuiInputBase-input': {
//                           color: '#117307',
//                           fontWeight: 500
//                         }
//                       }}
//                     />
//                   </div>

//                   {/* District Dropdown - 30% width */}
//                   <div className="w-[30%] relative bg-white" ref={districtRef}>
//                     <button
//                       onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                       className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-medium bg-white transition-colors text-sm h-12"
//                     >
//                       <span className="truncate">{currentDistrictLabel}</span>
//                       <ChevronDown 
//                         size={16} 
//                         className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
                    
//                     {isDistrictOpen && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                         {districtOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             onClick={() => handleDistrictChange(option.value)}
//                             className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold transition-colors text-sm ${
//                               selectedDistrict === option.value 
//                                 ? 'bg-[#117307] text-white' 
//                                 : 'text-[#117307]'
//                             }`}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Stats Bar */}
//                 <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                   <span className="text-[#117307] font-medium">
//                     {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//                   </span>
//                   <div className="flex items-center gap-2 text-[#117307] font-medium">
//                     <Sparkles size={16} />
//                     <span>Explore Villages</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {loading && panchayats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
//             <p className="text-[#117307] text-lg font-medium">Loading panchayats...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
//               <Home size={32} className="text-red-500" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium">Failed to load panchayats</p>
//           </div>
//         ) : filteredPanchayats.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
//               <Home size={32} className="text-[#117307]" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium mb-2">No panchayats found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#117307] underline font-medium"
//             >
//               Clear filters
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {paginatedPanchayats.map((panchayat) => (
//                 <div
//                   key={panchayat._id}
//                   onClick={() => handleCardClick(panchayat.slug)}
//                   className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
//                 >
//                   {/* Image - Clean without any overlay badges */}
//                   <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                     {panchayat.headerImage ? (
//                       <img
//                         src={panchayat.headerImage}
//                         alt={panchayat.name}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                           e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
//                         }}
//                       />
//                     ) : null}
//                     <div className="fallback-icon absolute inset-0 flex items-center justify-center bg-[#117307]/5" style={{ display: panchayat.headerImage ? 'none' : 'flex' }}>
//                       <Home size={64} className="text-[#117307] opacity-20" />
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     {/* Location */}
//                     <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
//                       <MapPin size={14} className="text-[#1a5e10]" />
//                       <span className="truncate">
//                         {panchayat.block}, {panchayat.district?.name || 'District'}
//                       </span>
//                     </div>

//                     {/* Name */}
//                     <h3 className="text-xl font-bold text-[#0d4d03] mb-3 line-clamp-2 leading-tight group-hover:text-[#0a3a02] transition-colors">
//                       {panchayat.name}
//                     </h3>

//                     {/* Description */}
//                     <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
//                       {panchayat.historicalBackground || 
//                        panchayat.traditions || 
//                        panchayat.localArt ||
//                        `Discover the unique culture and heritage of ${panchayat.name}.`}
//                     </p>

//                     {/* Stats Grid */}
//                     <div className="grid grid-cols-2 gap-3 mb-4">
//                       {panchayat.population && (
//                         <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                           <Users size={14} className="text-[#117307]" />
//                           <span className="font-medium">{formatPopulation(panchayat.population)}</span>
//                         </div>
//                       )}
//                       {panchayat.area && (
//                         <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                           <MapIcon size={14} className="text-[#117307]" />
//                           <span className="font-medium">{formatArea(panchayat.area)}</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Footer */}
//                     <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">
//                       {panchayat.establishmentYear && (
//                         <div className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
//                           <Calendar size={14} />
//                           <span>Est. {panchayat.establishmentYear}</span>
//                         </div>
//                       )}

//                       <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm ml-auto">
//                         Explore
//                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-2 mt-12">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Previous
//                 </button>
                
//                 {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                   let pageNum;
//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       className={`px-4 py-2 rounded-lg border-2 border-[#117307] font-semibold transition-all ${
//                         currentPage === pageNum 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307] hover:bg-[#117307] hover:text-white'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
                
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { 
//   MapPin, Search, Users, Calendar, ChevronDown, 
//   Home, ArrowRight, TreePine, Sparkles, Map as MapIcon,
//   Image as ImageIcon, Landmark, Loader2
// } from 'lucide-react';
// import TextField from '@/components/ui/TextField';

// export default function PanchayatPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { panchayats, loading, error, lastFetched } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);
//   const [isStatusOpen, setIsStatusOpen] = useState(false);
  
//   const itemsPerPage = 12;
//   const districtRef = useRef(null);
//   const statusRef = useRef(null);

//   // Status options
//   // const statusOptions = useMemo(() => [
//   //   { value: 'all', label: 'All Status' },
//   //   { value: 'verified', label: 'Verified' },
//   //   { value: 'pending', label: 'Pending' },
//   //   { value: 'draft', label: 'Draft' }
//   // ], []);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//       if (statusRef.current && !statusRef.current.contains(event.target)) {
//         setIsStatusOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Get district from URL params
//   useEffect(() => {
//     const districtParam = searchParams.get('district');
//     if (districtParam && districtParam !== 'all') {
//       setSelectedDistrict(districtParam);
//     }
//   }, [searchParams]);

//   // Smart data fetching with cache
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
//     const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchPanchayats) {
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, panchayats.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized filtered panchayats
//   const filteredPanchayats = useMemo(() => {
//     return panchayats.filter(item => {
//       // Search filter
//       if (searchTerm && 
//           !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       // District filter
//       const matchesDistrict = selectedDistrict === 'all' || 
//                              item.district?._id === selectedDistrict ||
//                              item.district === selectedDistrict;
      
//       // Status filter
//       const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
//       return matchesDistrict && matchesStatus;
//     });
//   }, [panchayats, selectedDistrict, selectedStatus, searchTerm]);

//   // Pagination
//   const totalPages = Math.ceil(filteredPanchayats.length / itemsPerPage);
//   const paginatedPanchayats = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredPanchayats.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredPanchayats, currentPage, itemsPerPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedDistrict, selectedStatus, searchTerm]);

//   // Memoized handlers
//   const handleCardClick = useCallback((slug) => {
//     router.push(`/panchayats/${slug}`);
//   }, [router]);

//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   const handleStatusChange = useCallback((status) => {
//     setSelectedStatus(status);
//     setIsStatusOpen(false);
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedDistrict('all');
//     setSelectedStatus('all');
//   }, []);

//   const currentDistrictLabel = useMemo(() => {
//     return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
//   }, [selectedDistrict, districtOptions]);

//   // const currentStatusLabel = useMemo(() => {
//   //   return statusOptions.find(option => option.value === selectedStatus)?.label || 'All Status';
//   // }, [selectedStatus, statusOptions]);

//   const formatPopulation = (pop) => {
//     if (!pop) return 'N/A';
//     if (pop > 1000) return `${(pop / 1000).toFixed(1)}K`;
//     return pop.toString();
//   };

//   const formatArea = (area) => {
//     if (!area) return 'N/A';
//     return `${area.toLocaleString()} km²`;
//   };

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Hero Header */}
//       <div className="bg-[#117307] relative ">
//   <div className="absolute inset-0 opacity-10 pointer-events-none">
//     <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//     <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
//   </div>

//   <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
//     {/* Mobile & Tablet Layout */}
//     <div className="lg:hidden space-y-8">
//       <div className="text-center">
//         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//           <Home size={18} className="text-white" />
//           <span className="text-sm font-semibold text-white">Village Stories</span>
//         </div>
        
//         <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//           Gram Panchayats
//         </h1>
//         <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//           Experience the heart of rural Madhya Pradesh - authentic villages, rich traditions, and vibrant communities
//         </p>
//       </div>

//       {/* Search & Filter */}
//       <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20">
//         <div className="space-y-4">
//           <TextField
//             placeholder="Search panchayats, blocks, or districts..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             fullWidth
//             startIcon={<Search size={20} className="text-[#117307]" />}
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 '& fieldset': { borderColor: '#117307', borderWidth: '2px' },
//                 '&:hover fieldset': { borderColor: '#117307' },
//                 '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' }
//               },
//               '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//             }}
//           />

//           <div className="grid grid-cols-2 gap-3 mt-2 w-full">
//             {/* District Dropdown */}
//             <div className="relative w-full" ref={districtRef}>
//               <button
//                 onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                 className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//               >
//                 <span className="truncate text-sm">{currentDistrictLabel}</span>
//                 <ChevronDown 
//                   size={18} 
//                   className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                 />
//               </button>
              
//               {isDistrictOpen && (
//                 <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                   {districtOptions.map((option) => (
//                     <button
//                       key={option.value}
//                       onClick={() => handleDistrictChange(option.value)}
//                       className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold text-sm ${
//                         selectedDistrict === option.value 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307]'
//                       }`}
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Status Dropdown */}
//             {/* <div className="relative" ref={statusRef}>
//               <button
//                 onClick={() => setIsStatusOpen(!isStatusOpen)}
//                 className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
//               >
//                 <span className="truncate text-sm">{currentStatusLabel}</span>
//                 <ChevronDown 
//                   size={18} 
//                   className={`flex-shrink-0 transform transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
//                 />
//               </button>
              
//               {isStatusOpen && (
//                 <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
//                   {statusOptions.map((option) => (
//                     <button
//                       key={option.value}
//                       onClick={() => handleStatusChange(option.value)}
//                       className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold text-sm ${
//                         selectedStatus === option.value 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307]'
//                       }`}
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div> */}
//           </div>
//         </div>

//         <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//           <span className="text-[#117307] font-medium">
//             {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//           </span>
//           <div className="flex items-center gap-2 text-[#117307]/60">
//             <Sparkles size={16} />
//             <span>Explore Villages</span>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Desktop Layout - Updated to match News & Announcements */}
//     <div className="hidden lg:flex justify-between items-start gap-12">
//       {/* Header Content - Left Side */}
//       <div className="flex-1 max-w-2xl">
//         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//           <Home size={18} className="text-white" />
//           <span className="text-sm font-semibold text-white">
//             Village Stories
//           </span>
//         </div>
        
//         <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//           Gram Panchayats
//         </h1>
//         <p className="text-lg text-white/90">
//           Experience the heart of rural Madhya Pradesh - authentic villages and traditions
//         </p>
//       </div>

//       {/* Search & Filter - Right Side */}
//       <div className="flex-1 max-w-lg">
//         <div className="bg-white rounded-2xl shadow-lg p-6">
//           {/* Search and Filter Side by Side - 70% / 30% width */}
//           <div className="flex gap-3 items-center">
//             {/* Search - 70% width */}
//             <div className="w-[70%]">
//               <TextField
//                 placeholder="Search panchayats..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 fullWidth
//                 startIcon={<Search size={20} className="text-[#117307]" />}
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     '& fieldset': {
//                       borderColor: '#117307',
//                       borderWidth: '2px',
//                     },
//                     '&:hover fieldset': {
//                       borderColor: '#117307',
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor: '#117307',
//                       borderWidth: '2px',
//                     },
//                     height: '48px'
//                   },
//                   '& .MuiInputBase-input': {
//                     color: '#117307',
//                     fontWeight: 500
//                   }
//                 }}
//               />
//             </div>

//             {/* District Dropdown - 30% width */}
//             <div className="w-[30%] relative bg-white" ref={districtRef}>
//               <button
//                 onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                 className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-medium bg-white transition-colors text-sm h-12"
//               >
//                 <span className="truncate">{currentDistrictLabel}</span>
//                 <ChevronDown 
//                   size={16} 
//                   className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                 />
//               </button>
              
//               {isDistrictOpen && (
//                 <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                   {districtOptions.map((option) => (
//                     <button
//                       key={option.value}
//                       onClick={() => handleDistrictChange(option.value)}
//                       className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold transition-colors text-sm ${
//                         selectedDistrict === option.value 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307]'
//                       }`}
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Stats Bar */}
//           <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//             <span className="text-[#117307] font-medium">
//               {filteredPanchayats.length} {filteredPanchayats.length === 1 ? 'panchayat' : 'panchayats'}
//             </span>
//             <div className="flex items-center gap-2 text-[#117307] font-medium">
//               <Sparkles size={16} />
//               <span>Explore Villages</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {loading && panchayats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
//             <p className="text-[#117307] text-lg font-medium">Loading panchayats...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
//               <Home size={32} className="text-red-500" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium">Failed to load panchayats</p>
//           </div>
//         ) : filteredPanchayats.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
//               <Home size={32} className="text-[#117307]" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium mb-2">No panchayats found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#117307] underline font-medium"
//             >
//               Clear filters
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {paginatedPanchayats.map((panchayat) => (
//                 <div
//                   key={panchayat._id}
//                   onClick={() => handleCardClick(panchayat.slug)}
//                   className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
//                 >
//                   {/* Image */}
//                   <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                     {panchayat.headerImage ? (
//                       <img
//                         src={panchayat.headerImage}
//                         alt={panchayat.name}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                           e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
//                         }}
//                       />
//                     ) : null}
//                     <div className="fallback-icon absolute inset-0 flex items-center justify-center bg-[#117307]/5" style={{ display: panchayat.headerImage ? 'none' : 'flex' }}>
//                       <Home size={64} className="text-[#117307] opacity-20" />
//                     </div>
                    
//                     {/* Overlay Badges */}
//                     <div className="absolute top-4 left-4 flex gap-2">
//                       <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
//                         <TreePine size={14} className="text-[#117307]" />
//                         <span className="text-xs font-bold text-[#117307]">Village</span>
//                       </div>
//                       {panchayat.status === 'verified' && (
//                         <div className="bg-emerald-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
//                           <Landmark size={14} className="text-white" />
//                           <span className="text-xs font-bold text-white">Verified</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Media Gallery Indicator */}
//                     {panchayat.mediaGallery && panchayat.mediaGallery.length > 0 && (
//                       <div className="absolute bottom-4 right-4">
//                         <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
//                           <ImageIcon size={14} className="text-white" />
//                           <span className="text-xs font-bold text-white">
//                             {panchayat.mediaGallery.length}
//                           </span>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-6">
//                     {/* Location */}
//                     <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
//                       <MapPin size={14} className="text-[#1a5e10]" />
//                       <span className="truncate">
//                         {panchayat.block}, {panchayat.district?.name || 'District'}
//                       </span>
//                     </div>

//                     {/* Name */}
//                     <h3 className="text-xl font-bold text-[#0d4d03] mb-3 line-clamp-2 leading-tight group-hover:text-[#0a3a02] transition-colors">
//                       {panchayat.name}
//                     </h3>

//                     {/* Description */}
//                     <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
//                       {panchayat.historicalBackground || 
//                        panchayat.traditions || 
//                        panchayat.localArt ||
//                        `Discover the unique culture and heritage of ${panchayat.name}.`}
//                     </p>

//                     {/* Stats Grid */}
//                     <div className="grid grid-cols-2 gap-3 mb-4">
//                       {panchayat.population && (
//                         <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                           <Users size={14} className="text-[#117307]" />
//                           <span className="font-medium">{formatPopulation(panchayat.population)}</span>
//                         </div>
//                       )}
//                       {panchayat.area && (
//                         <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                           <MapIcon size={14} className="text-[#117307]" />
//                           <span className="font-medium">{formatArea(panchayat.area)}</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Major Rivers Tags */}
//                     {panchayat.majorRivers && panchayat.majorRivers.length > 0 && (
//                       <div className="mb-4">
//                         <div className="flex flex-wrap gap-1">
//                           {panchayat.majorRivers.slice(0, 2).map((river, idx) => (
//                             <span
//                               key={idx}
//                               className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold"
//                             >
//                               🌊 {river}
//                             </span>
//                           ))}
//                           {panchayat.majorRivers.length > 2 && (
//                             <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-semibold">
//                               +{panchayat.majorRivers.length - 2}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Footer */}
//                     <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">
//                       {panchayat.establishmentYear && (
//                         <div className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
//                           <Calendar size={14} />
//                           <span>Est. {panchayat.establishmentYear}</span>
//                         </div>
//                       )}

//                       <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm ml-auto">
//                         Explore
//                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-2 mt-12">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Previous
//                 </button>
                
//                 {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                   let pageNum;
//                   if (totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (currentPage >= totalPages - 2) {
//                     pageNum = totalPages - 4 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       className={`px-4 py-2 rounded-lg border-2 border-[#117307] font-semibold transition-all ${
//                         currentPage === pageNum 
//                           ? 'bg-[#117307] text-white' 
//                           : 'text-[#117307] hover:bg-[#117307] hover:text-white'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
                
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 rounded-lg border-2 border-[#117307] text-[#117307] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#117307] hover:text-white transition-all"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
