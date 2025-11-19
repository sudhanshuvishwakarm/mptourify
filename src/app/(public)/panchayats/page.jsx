'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { 
  MapPin, Search, Users, Calendar, ChevronDown, 
  Home, ArrowRight, TreePine, Sparkles, Map as MapIcon,
  Image as ImageIcon, Loader2, Filter
} from 'lucide-react';
import TextField from '@/components/ui/TextField';

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
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 12;
  const districtRef = useRef(null);
  const filtersRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setIsDistrictOpen(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get district from URL params
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam && districtParam !== 'all') {
      setSelectedDistrict(districtParam);
    }
  }, [searchParams]);

  // Smart data fetching with cache
  useEffect(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    const shouldFetchPanchayats = panchayats.length === 0 || !lastFetched || lastFetched < oneHourAgo;
    const shouldFetchDistricts = districts.length === 0;

    if (shouldFetchPanchayats) {
      dispatch(fetchPanchayats({ limit: 100 }));
    }
    
    if (shouldFetchDistricts) {
      dispatch(fetchDistricts());
    }
  }, [dispatch, panchayats.length, districts.length, lastFetched]);

  // Memoized district options
  const districtOptions = useMemo(() => [
    { value: 'all', label: 'All Districts' },
    ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
  ], [districts]);

  // Memoized filtered panchayats
  const filteredPanchayats = useMemo(() => {
    return panchayats.filter(item => {
      // Search filter
      if (searchTerm && 
          !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // District filter
      const matchesDistrict = selectedDistrict === 'all' || 
                             item.district?._id === selectedDistrict ||
                             item.district === selectedDistrict;
      
      return matchesDistrict;
    });
  }, [panchayats, selectedDistrict, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPanchayats.length / itemsPerPage);
  const paginatedPanchayats = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPanchayats.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPanchayats, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistrict, searchTerm]);

  // Memoized handlers
  const handleCardClick = useCallback((slug) => {
    router.push(`/panchayats/${slug}`);
  }, [router]);

  const handleDistrictChange = useCallback((district) => {
    setSelectedDistrict(district);
    setIsDistrictOpen(false);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedDistrict('all');
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

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Hero Header */}
      <div className="bg-[#117307] relative ">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
          {/* Mobile & Tablet Layout */}
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

            {/* Search & Filter */}
            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20" ref={filtersRef}>
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

                {/* Filter Toggle Button for Mobile */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                  <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Filters Container - Conditionally rendered */}
                {showFilters && (
                  <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#117307]/20">
                    {/* District Dropdown */}
                    <div className="relative" ref={districtRef}>
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
                )}
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

          {/* Desktop Layout - Updated to match News & Announcements */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            {/* Header Content - Left Side */}
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

            {/* Search & Filter - Right Side */}
            <div className="flex-1 max-w-lg">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* Search and Filter Side by Side - 70% / 30% width */}
                <div className="flex gap-3 items-center">
                  {/* Search - 70% width */}
                  <div className="w-[70%]">
                    <TextField
                      placeholder="Search panchayats..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      fullWidth
                      startIcon={<Search size={20} className="text-[#117307]" />}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#117307',
                            borderWidth: '2px',
                          },
                          '&:hover fieldset': {
                            borderColor: '#117307',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#117307',
                            borderWidth: '2px',
                          },
                          height: '48px'
                        },
                        '& .MuiInputBase-input': {
                          color: '#117307',
                          fontWeight: 500
                        }
                      }}
                    />
                  </div>

                  {/* District Dropdown - 30% width */}
                  <div className="w-[30%] relative bg-white" ref={districtRef}>
                    <button
                      onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                      className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-medium bg-white transition-colors text-sm h-12"
                    >
                      <span className="truncate">{currentDistrictLabel}</span>
                      <ChevronDown 
                        size={16} 
                        className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {isDistrictOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                        {districtOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleDistrictChange(option.value)}
                            className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold transition-colors text-sm ${
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

                {/* Stats Bar */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPanchayats.map((panchayat) => (
                <div
                  key={panchayat._id}
                  onClick={() => handleCardClick(panchayat.slug)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
                >
                  {/* Image - Clean without any overlay badges */}
                  <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                    {panchayat.headerImage ? (
                      <img
                        src={panchayat.headerImage}
                        alt={panchayat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="fallback-icon absolute inset-0 flex items-center justify-center bg-[#117307]/5" style={{ display: panchayat.headerImage ? 'none' : 'flex' }}>
                      <Home size={64} className="text-[#117307] opacity-20" />
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
                      <MapPin size={14} className="text-[#1a5e10]" />
                      <span className="truncate">
                        {panchayat.block}, {panchayat.district?.name || 'District'}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-[#0d4d03] mb-3 line-clamp-2 leading-tight group-hover:text-[#0a3a02] transition-colors">
                      {panchayat.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
                      {panchayat.historicalBackground || 
                       panchayat.traditions || 
                       panchayat.localArt ||
                       `Discover the unique culture and heritage of ${panchayat.name}.`}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {panchayat.population && (
                        <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
                          <Users size={14} className="text-[#117307]" />
                          <span className="font-medium">{formatPopulation(panchayat.population)}</span>
                        </div>
                      )}
                      {panchayat.area && (
                        <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
                          <MapIcon size={14} className="text-[#117307]" />
                          <span className="font-medium">{formatArea(panchayat.area)}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">
                      {panchayat.establishmentYear && (
                        <div className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
                          <Calendar size={14} />
                          <span>Est. {panchayat.establishmentYear}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm ml-auto">
                        Explore
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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

// 'use client';

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { 
//   MapPin, Search, Users, Calendar, ChevronDown, 
//   Home, ArrowRight, TreePine, Sparkles, Map as MapIcon,
//   Image as ImageIcon, Landmark
// } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import Loader from '@/components/ui/Loader';

// export default function PanchayatPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { panchayats, loading, error, lastFetched, totalPanchayats } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);
//   const districtRef = useRef(null);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

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
//       if (searchTerm && 
//           !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.block?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.district?.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
//       return matchesDistrict;
//     });
//   }, [panchayats, selectedDistrict, searchTerm]);

//   // Memoized handlers
//   const handleCardClick = useCallback((slug) => {
//     router.push(`/panchayat/${slug}`);
//   }, [router]);

//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const toggleDistrictDropdown = useCallback(() => {
//     setIsDistrictOpen(prev => !prev);
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

//   const showLoader = loading && panchayats.length === 0;

//   if (showLoader) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Hero Header */}
//       <div className="bg-[#117307] relative overflow-hidden">
//         {/* Decorative Pattern */}
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 relative z-10">
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
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
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

//                 <div className="relative" ref={districtRef}>
//                   <button
//                     onClick={toggleDistrictDropdown}
//                     className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white transition-colors"
//                   >
//                     <span>{currentDistrictLabel}</span>
//                     <ChevronDown 
//                       size={20} 
//                       className={`transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                     />
//                   </button>
                  
//                   {isDistrictOpen && (
//                     <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                       {districtOptions.map((option) => (
//                         <button
//                           key={option.value}
//                           onClick={() => handleDistrictChange(option.value)}
//                           className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors font-semibold ${
//                             selectedDistrict === option.value 
//                               ? 'bg-[#117307] text-white' 
//                               : 'text-[#117307]'
//                           }`}
//                         >
//                           {option.label}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
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
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Home size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Village Stories</span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                  Gram Panchayats
//               </h1>
//               <p className="text-lg text-white/90">
//                 Experience the heart of rural Madhya Pradesh - authentic villages, rich traditions, and vibrant communities
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
//                           '&.Mui-focused fieldset': { borderColor: '#117307', borderWidth: '2px' }
//                         },
//                         '& .MuiInputBase-input': { color: '#117307', fontWeight: 500 }
//                       }}
//                     />
//                   </div>

//                   <div className="w-[30%] relative" ref={districtRef}>
//                     <button
//                       onClick={toggleDistrictDropdown}
//                       className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold md:h-14 bg-white transition-colors text-sm"
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

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
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
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredPanchayats.map((panchayat) => (
//               <div
//                 key={panchayat._id}
//                 onClick={() => handleCardClick(panchayat.slug)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
//               >
//                 {/* Image */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {panchayat.headerImage ? (
//                     <img
//                       src={panchayat.headerImage}
//                       alt={panchayat.name}
//                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#117307]/5"><svg class="w-20 h-20 text-[#117307] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>';
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#117307]/5">
//                       <Home size={64} className="text-[#117307] opacity-20" />
//                     </div>
//                   )}
                  
//                   {/* Overlay Badges */}
//                   <div className="absolute top-4 left-4 flex gap-2">
//                     <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
//                       <TreePine size={14} className="text-[#117307]" />
//                       <span className="text-xs font-bold text-[#117307]">Village</span>
//                     </div>
//                     {panchayat.status === 'verified' && (
//                       <div className="bg-emerald-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
//                         <Landmark size={14} className="text-white" />
//                         <span className="text-xs font-bold text-white">Verified</span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Media Gallery Indicator */}
//                   {panchayat.mediaGallery && panchayat.mediaGallery.length > 0 && (
//                     <div className="absolute bottom-4 right-4">
//                       <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
//                         <ImageIcon size={14} className="text-white" />
//                         <span className="text-xs font-bold text-white">
//                           {panchayat.mediaGallery.length} {panchayat.mediaGallery.length === 1 ? 'photo' : 'photos'}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-6">
//                   {/* Location */}
//                   <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
//                     <MapPin size={14} className="text-[#1a5e10]" />
//                     <span className="truncate">
//                       {panchayat.block}, {panchayat.district?.name || 'District'}
//                     </span>
//                   </div>

//                   {/* Name */}
//                   <h3 className="text-xl font-bold text-[#0d4d03] mb-3 
//                                  line-clamp-2 leading-tight 
//                                  group-hover:text-[#0a3a02] transition-colors">
//                     {panchayat.name}
//                   </h3>

//                   {/* Description */}
//                   <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
//                     {panchayat.historicalBackground || 
//                      panchayat.traditions || 
//                      panchayat.localArt ||
//                      `Discover the unique culture and heritage of ${panchayat.name}.`}
//                   </p>

//                   {/* Stats Grid */}
//                   <div className="grid grid-cols-2 gap-3 mb-4">
//                     {panchayat.population && (
//                       <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                         <Users size={14} className="text-[#117307]" />
//                         <span>{formatPopulation(panchayat.population)}</span>
//                       </div>
//                     )}
//                     {panchayat.area && (
//                       <div className="flex items-center gap-2 text-sm text-[#2E3A3B]">
//                         <MapIcon size={14} className="text-[#117307]" />
//                         <span>{formatArea(panchayat.area)}</span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Major Rivers Tags */}
//                   {panchayat.majorRivers && panchayat.majorRivers.length > 0 && (
//                     <div className="mb-4">
//                       <div className="flex flex-wrap gap-1">
//                         {panchayat.majorRivers.slice(0, 2).map((river, idx) => (
//                           <span
//                             key={idx}
//                             className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold"
//                           >
//                             🌊 {river}
//                           </span>
//                         ))}
//                         {panchayat.majorRivers.length > 2 && (
//                           <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-semibold">
//                             +{panchayat.majorRivers.length - 2} more
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">
//                     {panchayat.establishmentYear && (
//                       <div className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
//                         <Calendar size={14} />
//                         <span>Est. {panchayat.establishmentYear}</span>
//                       </div>
//                     )}

//                     <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm ml-auto">
//                       Explore
//                       <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }