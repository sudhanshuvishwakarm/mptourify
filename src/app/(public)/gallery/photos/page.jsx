'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
import { Image as ImageIcon, Search, MapPin, Calendar, Camera, ChevronDown, Filter, ArrowLeft, Loader2 } from 'lucide-react';
import TextField from '@/components/ui/TextField';

export default function PhotosPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { media, loading, error, lastFetched } = useSelector((state) => state.media);
  const { districts } = useSelector((state) => state.district);
  const { panchayats } = useSelector((state) => state.panchayat);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedPanchayat, setSelectedPanchayat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [isPanchayatOpen, setIsPanchayatOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  const categoryRef = useRef(null);
  const districtRef = useRef(null);
  const panchayatRef = useRef(null);
  const filtersRef = useRef(null);

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'natural', label: 'Natural' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'event', label: 'Events' },
    { value: 'festival', label: 'Festivals' }
  ], []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setIsDistrictOpen(false);
      }
      if (panchayatRef.current && !panchayatRef.current.contains(event.target)) {
        setIsPanchayatOpen(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    if (media.length === 0 || !lastFetched || lastFetched < oneHourAgo) {
      dispatch(fetchMedia({ limit: 100, status: 'approved', fileType: 'image' }));
    }
    
    if (districts.length === 0) {
      dispatch(fetchDistricts());
    }
    
    if (panchayats.length === 0) {
      dispatch(fetchPanchayats());
    }
  }, [dispatch, media.length, districts.length, panchayats.length, lastFetched]);

  const districtOptions = useMemo(() => [
    { value: 'all', label: 'All Districts' },
    ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
  ], [districts]);

  const panchayatOptions = useMemo(() => {
    const filtered = selectedDistrict === 'all' 
      ? panchayats 
      : panchayats.filter(p => p.district?._id === selectedDistrict || p.district === selectedDistrict);
    
    return [
      { value: 'all', label: 'All Panchayats' },
      ...(filtered?.map(p => ({ value: p._id, label: p.name })) || [])
    ];
  }, [panchayats, selectedDistrict]);

  const filteredPhotos = useMemo(() => {
    return media.filter(item => {
      if (item.fileType !== 'image') return false;
      if (item.status !== 'approved' && item.status !== undefined) return false;
      
      if (searchTerm && 
          !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      const matchesPanchayat = selectedPanchayat === 'all' || item.gramPanchayat?._id === selectedPanchayat;
      
      return matchesCategory && matchesDistrict && matchesPanchayat;
    });
  }, [media, selectedCategory, selectedDistrict, selectedPanchayat, searchTerm]);

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
  const paginatedPhotos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPhotos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPhotos, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDistrict, selectedPanchayat, searchTerm]);

  const handleImageError = useCallback((itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  }, []);

  const handleCardClick = useCallback((id) => {
    router.push(`/gallery/${id}`);
  }, [router]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDistrict('all');
    setSelectedPanchayat('all');
  }, []);

  const handleBackToGallery = useCallback(() => router.push('/gallery'), [router]);

  const currentCategoryLabel = useMemo(() => 
    categoryOptions.find(opt => opt.value === selectedCategory)?.label || 'All Categories',
    [selectedCategory, categoryOptions]
  );

  const currentDistrictLabel = useMemo(() =>
    districtOptions.find(opt => opt.value === selectedDistrict)?.label || 'All Districts',
    [selectedDistrict, districtOptions]
  );

  const currentPanchayatLabel = useMemo(() =>
    panchayatOptions.find(opt => opt.value === selectedPanchayat)?.label || 'All Panchayats',
    [selectedPanchayat, panchayatOptions]
  );

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header */}
      <div className="bg-[#117307] relative ">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 relative z-10">
          {/* Mobile & Tablet */}
          <div className="lg:hidden space-y-6">
            <div className="text-center">
              <button
                onClick={handleBackToGallery}
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-base mb-6"
              >
                <ArrowLeft size={20} />
                Back to Gallery
              </button>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Photo Gallery
              </h1>
              <p className="text-base md:text-lg text-white/90">
                Capturing the beauty of Madhya Pradesh
              </p>
            </div>

            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6 relative z-20" ref={filtersRef}>
              <div className="space-y-4">
                <TextField
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                  <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#117307]/20">
                    <div className="relative" ref={categoryRef}>
                      <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                      >
                        <span>{currentCategoryLabel}</span>
                        <ChevronDown size={20} className={`transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isCategoryOpen && (
                        <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                          {categoryOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setSelectedCategory(option.value); setIsCategoryOpen(false); }}
                              className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] font-semibold ${
                                selectedCategory === option.value ? 'bg-[#117307] text-white' : 'text-[#117307]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={districtRef}>
                      <button
                        onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                      >
                        <span>{currentDistrictLabel}</span>
                        <ChevronDown size={20} className={`transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isDistrictOpen && (
                        <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                          {districtOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setSelectedDistrict(option.value); setIsDistrictOpen(false); }}
                              className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] font-semibold ${
                                selectedDistrict === option.value ? 'bg-[#117307] text-white' : 'text-[#117307]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={panchayatRef}>
                      <button
                        onClick={() => setIsPanchayatOpen(!isPanchayatOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2]"
                      >
                        <span>{currentPanchayatLabel}</span>
                        <ChevronDown size={20} className={`transform transition-transform ${isPanchayatOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isPanchayatOpen && (
                        <div className="absolute z-30 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                          {panchayatOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setSelectedPanchayat(option.value); setIsPanchayatOpen(false); }}
                              className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] font-semibold ${
                                selectedPanchayat === option.value ? 'bg-[#117307] text-white' : 'text-[#117307]'
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

                {/* <div className="pt-3 border-t border-[#117307]/10 text-center">
                  <span className="text-[#117307] font-medium">{filteredPhotos.length} photos</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            <div className="flex-1 max-w-xl">
              <button
                onClick={handleBackToGallery}
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-lg mb-6"
              >
                <ArrowLeft size={22} />
                Back to Gallery
              </button>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Photo Gallery
              </h1>
              <p className="text-lg text-white/90">
                Capturing the beauty, culture, and heritage of Madhya Pradesh
              </p>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl shadow-lg p-6 ">
                <div className="space-y-4">
                  <TextField
                    placeholder="Search photos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="relative" ref={categoryRef}>
                      <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2] text-sm"
                      >
                        <span className="truncate">{currentCategoryLabel}</span>
                        <ChevronDown size={16} className={`flex-shrink-0 transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isCategoryOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                          {categoryOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setSelectedCategory(option.value); setIsCategoryOpen(false); }}
                              className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold text-sm ${
                                selectedCategory === option.value ? 'bg-[#117307] text-white' : 'text-[#117307]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={districtRef}>
                      <button
                        onClick={() => setIsDistrictOpen(!isDistrictOpen)}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2] text-sm"
                      >
                        <span className="truncate">{currentDistrictLabel}</span>
                        <ChevronDown size={16} className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isDistrictOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                          {districtOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setSelectedDistrict(option.value); setIsDistrictOpen(false); }}
                              className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold text-sm ${
                                selectedDistrict === option.value ? 'bg-[#117307] text-white' : 'text-[#117307]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative" ref={panchayatRef}>
                      <button
                        onClick={() => setIsPanchayatOpen(!isPanchayatOpen)}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold bg-white hover:bg-[#f5fbf2] text-sm"
                      >
                        <span className="truncate">{currentPanchayatLabel}</span>
                        <ChevronDown size={16} className={`flex-shrink-0 transform transition-transform ${isPanchayatOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isPanchayatOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                          {panchayatOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => { setSelectedPanchayat(option.value); setIsPanchayatOpen(false); }}
                              className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] font-semibold text-sm ${
                                selectedPanchayat === option.value ? 'bg-[#117307] text-white' : 'text-[#117307]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <div className="pt-4 border-t border-[#117307]/10 text-center">
                    <span className="text-[#117307] font-medium">{filteredPhotos.length} photos found</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading && media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
            <p className="text-[#117307] text-lg font-medium">Loading photos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Camera size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-[#117307] text-lg font-medium">Failed to load photos</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Camera size={48} className="mx-auto text-[#117307] opacity-20 mb-4" />
            <p className="text-[#117307] text-lg font-medium mb-2">No photos found</p>
            <button onClick={handleClearFilters} className="text-[#117307] underline font-medium">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPhotos.map((item,index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(item._id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
                >
                  <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                    {imageErrors[item._id] ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#117307]/5">
                        <ImageIcon size={48} className="text-[#117307] opacity-20" />
                      </div>
                    ) : (
                      <img
                        src={item.fileUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(item._id)}
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-[#0d4d03] mb-2 line-clamp-2 leading-tight group-hover:text-[#0a3a02] transition-colors">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-sm text-[#1a5e10] font-medium leading-relaxed mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-[#117307]/10">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#1a5e10]">
                        <MapPin size={14} />
                        <span className="line-clamp-1">
                          {item.district?.name || 'Unknown'}
                        </span>
                      </div>
                      
                      {item.captureDate && (
                        <div className="flex items-center gap-1.5 text-xs text-[#4d674f]">
                          <Calendar size={12} />
                          <span>
                            {new Date(item.captureDate).toLocaleDateString('en-US', { 
                              month: 'short', day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
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

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { Image, Search, MapPin, Calendar, Camera, Filter, X } from 'lucide-react';

// export default function PhotosPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { media, loading, error } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);

//   const colors = {
//     primary: '#138808',
//     primaryLight: '#4CAF50',
//     primaryDark: '#0A5C08',
//     secondary: '#1E88E5',
//     accent: '#43A047',
//     white: '#FFFFFF',
//     bgColor: '#F8FDF7',
//     lightBg: '#E8F5E9',
//     darkGray: '#2E3A3B',
//     lightGray: '#F5F5F5',
//     text: '#374151'
//   };

//   const categoryOptions = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' },
//     { value: 'wildlife', label: 'Wildlife' },
//     { value: 'architecture', label: 'Architecture' }
//   ];

//   useEffect(() => {
//     dispatch(fetchMedia({ 
//       limit: 100, 
//       status: 'approved', 
//       fileType: 'image',
//       sortBy: 'createdAt',
//       sortOrder: 'desc'
//     }));
//     dispatch(fetchDistricts());
//   }, [dispatch]);

//   const districtOptions = [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ];

//   // Filter photos from actual media data
//   const photos = media.filter(item => 
//     item.fileType === 'image' && 
//     (item.status === 'approved' || !item.status) // Include approved or items without status
//   );

//   const filteredPhotos = photos.filter(item => {
//     const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//     const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
//     const matchesSearch = searchTerm === '' || 
//       item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
//     return matchesCategory && matchesDistrict && matchesSearch;
//   });

//   const getCategoryColor = (category) => {
//     const colors = {
//       heritage: 'bg-green-600',
//       natural: 'bg-green-500',
//       cultural: 'bg-green-700',
//       event: 'bg-green-400',
//       festival: 'bg-green-800',
//       wildlife: 'bg-green-900',
//       architecture: 'bg-green-600'
//     };
//     return colors[category] || 'bg-green-500';
//   };

//   const getCategoryLabel = (category) => {
//     const labels = {
//       heritage: 'Heritage',
//       natural: 'Natural',
//       cultural: 'Cultural',
//       event: 'Event',
//       festival: 'Festival',
//       wildlife: 'Wildlife',
//       architecture: 'Architecture'
//     };
//     return labels[category] || category;
//   };

//   const handleCardClick = (id) => {
//     router.push(`/gallery/${id}`);
//   };

//   const clearFilters = () => {
//     setSelectedCategory('all');
//     setSelectedDistrict('all');
//     setSearchTerm('');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
//           <p className="text-green-600 font-medium">Loading photos...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Header Section */}
//       <div style={{ backgroundColor: colors.primary }}>
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
//           {/* Mobile & Tablet */}
//           <div className="lg:hidden space-y-6">
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} style={{ color: colors.white }} />
//                 <span className="text-sm font-semibold" style={{ color: colors.white }}>
//                   Photo Gallery
//                 </span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: colors.white }}>
//                 Visual Heritage
//               </h1>
//               <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: colors.white, opacity: 0.95 }}>
//                 Capturing the beauty, culture, and heritage of Madhya Pradesh
//               </p>
//             </div>

//             {/* Mobile Search & Filters */}
//             <div className="bg-white rounded-2xl shadow-lg p-4">
//               <div className="space-y-4">
//                 {/* Search Bar */}
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.primary }} />
//                   <input
//                     type="text"
//                     placeholder="Search photos..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-20 text-lg transition-all duration-300"
//                     style={{
//                       borderColor: colors.primaryLight,
//                       backgroundColor: colors.white,
//                       color: colors.primaryDark
//                     }}
//                   />
//                 </div>

//                 {/* Filter Toggle */}
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all duration-300"
//                   style={{
//                     borderColor: colors.primaryLight,
//                     color: colors.primary,
//                     backgroundColor: colors.lightBg
//                   }}
//                 >
//                   <Filter size={18} />
//                   Filters
//                   {(selectedCategory !== 'all' || selectedDistrict !== 'all') && (
//                     <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
//                       Active
//                     </span>
//                   )}
//                 </button>

//                 {/* Filters Dropdown */}
//                 {showFilters && (
//                   <div className="space-y-3 p-4 rounded-xl border-2" style={{ borderColor: colors.primaryLight, backgroundColor: colors.lightBg }}>
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryDark }}>
//                         Category
//                       </label>
//                       <select
//                         value={selectedCategory}
//                         onChange={(e) => setSelectedCategory(e.target.value)}
//                         className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-300"
//                         style={{
//                           borderColor: colors.primaryLight,
//                           backgroundColor: colors.white,
//                           color: colors.primaryDark
//                         }}
//                       >
//                         {categoryOptions.map(option => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryDark }}>
//                         District
//                       </label>
//                       <select
//                         value={selectedDistrict}
//                         onChange={(e) => setSelectedDistrict(e.target.value)}
//                         className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-300"
//                         style={{
//                           borderColor: colors.primaryLight,
//                           backgroundColor: colors.white,
//                           color: colors.primaryDark
//                         }}
//                       >
//                         {districtOptions.map(option => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {(selectedCategory !== 'all' || selectedDistrict !== 'all') && (
//                       <button
//                         onClick={clearFilters}
//                         className="w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
//                         style={{
//                           backgroundColor: colors.primary,
//                           color: colors.white
//                         }}
//                       >
//                         <X size={16} />
//                         Clear Filters
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: colors.primaryLight }}>
//                   <span className="font-medium" style={{ color: colors.primary }}>
//                     {filteredPhotos.length} photos
//                   </span>
//                   <button
//                     onClick={() => router.push('/gallery/videos')}
//                     className="font-medium hover:underline transition-all duration-300"
//                     style={{ color: colors.primary }}
//                   >
//                     View Videos →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop Layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} style={{ color: colors.white }} />
//                 <span className="text-sm font-semibold" style={{ color: colors.white }}>
//                   Photo Gallery
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: colors.white }}>
//                 Visual Heritage
//               </h1>
//               <p className="text-lg" style={{ color: colors.white, opacity: 0.95 }}>
//                 Capturing the beauty, culture, and heritage of Madhya Pradesh through stunning photography
//               </p>
//             </div>

//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   {/* Search Bar */}
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.primary }} />
//                     <input
//                       type="text"
//                       placeholder="Search photos by title, description, or tags..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-opacity-20 text-lg transition-all duration-300"
//                       style={{
//                         borderColor: colors.primaryLight,
//                         backgroundColor: colors.white,
//                         color: colors.primaryDark
//                       }}
//                     />
//                   </div>

//                   {/* Filters Row */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryDark }}>
//                         Category
//                       </label>
//                       <select
//                         value={selectedCategory}
//                         onChange={(e) => setSelectedCategory(e.target.value)}
//                         className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-300"
//                         style={{
//                           borderColor: colors.primaryLight,
//                           backgroundColor: colors.white,
//                           color: colors.primaryDark
//                         }}
//                       >
//                         {categoryOptions.map(option => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryDark }}>
//                         District
//                       </label>
//                       <select
//                         value={selectedDistrict}
//                         onChange={(e) => setSelectedDistrict(e.target.value)}
//                         className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-300"
//                         style={{
//                           borderColor: colors.primaryLight,
//                           backgroundColor: colors.white,
//                           color: colors.primaryDark
//                         }}
//                       >
//                         {districtOptions.map(option => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {/* Results and Actions */}
//                   <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.primaryLight }}>
//                     <div className="flex items-center gap-4">
//                       <span className="font-medium" style={{ color: colors.primary }}>
//                         {filteredPhotos.length} photos found
//                       </span>
//                       {(selectedCategory !== 'all' || selectedDistrict !== 'all' || searchTerm) && (
//                         <button
//                           onClick={clearFilters}
//                           className="text-sm font-medium hover:underline transition-all duration-300 flex items-center gap-1"
//                           style={{ color: colors.primary }}
//                         >
//                           <X size={14} />
//                           Clear filters
//                         </button>
//                       )}
//                     </div>
//                     <button
//                       onClick={() => router.push('/gallery/videos')}
//                       className="font-medium hover:underline transition-all duration-300"
//                       style={{ color: colors.primary }}
//                     >
//                       View Videos →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Photos Grid */}
//       <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Image size={48} className="mx-auto mb-4" style={{ color: colors.primary, opacity: 0.5 }} />
//             <p className="text-lg font-medium mb-2" style={{ color: colors.primary }}>
//               Failed to load photos
//             </p>
//             <button
//               onClick={() => dispatch(fetchMedia({ limit: 100, status: 'approved', fileType: 'image' }))}
//               className="px-6 py-2 rounded-lg font-medium transition-all duration-300"
//               style={{ backgroundColor: colors.primary, color: colors.white }}
//             >
//               Try Again
//             </button>
//           </div>
//         ) : filteredPhotos.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto mb-4" style={{ color: colors.primary, opacity: 0.2 }} />
//             <p className="text-lg font-medium mb-2" style={{ color: colors.primary }}>
//               No photos found
//             </p>
//             <p className="mb-4" style={{ color: colors.text }}>
//               {photos.length === 0 ? 'No photos available yet.' : 'Try adjusting your filters.'}
//             </p>
//             <button
//               onClick={clearFilters}
//               className="px-6 py-2 rounded-lg font-medium transition-all duration-300"
//               style={{ backgroundColor: colors.primary, color: colors.white }}
//             >
//               Clear Filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredPhotos.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-green-500"
//               >
//                 {/* Image Container */}
//                 <div className="h-48 bg-gray-100 relative overflow-hidden">
//                   {item.fileUrl ? (
//                     <img
//                       src={item.fileUrl}
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.nextSibling.style.display = 'flex';
//                       }}
//                     />
//                   ) : null}
//                   <div 
//                     className={`absolute inset-0 flex items-center justify-center ${item.fileUrl ? 'hidden' : 'flex'}`}
//                     style={{ backgroundColor: colors.lightBg }}
//                   >
//                     <Camera size={48} style={{ color: colors.primary, opacity: 0.3 }} />
//                   </div>
                  
//                   {/* Category Badge */}
//                   {item.category && (
//                     <div className="absolute top-3 left-3">
//                       <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                         {getCategoryLabel(item.category)}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Content */}
//                 <div className="p-5">
//                   <h3 className="font-bold mb-2 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors" style={{ color: colors.primaryDark }}>
//                     {item.title || 'Untitled Photo'}
//                   </h3>

//                   {item.description && (
//                     <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: colors.text }}>
//                       {item.description}
//                     </p>
//                   )}

//                   {/* Meta Information */}
//                   <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: colors.lightBg }}>
//                     <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.primary }}>
//                       <MapPin size={14} />
//                       <span className="line-clamp-1">
//                         {item.district?.name || 'Unknown District'}
//                       </span>
//                     </div>
                    
//                     {item.createdAt && (
//                       <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.text }}>
//                         <Calendar size={12} />
//                         <span>{formatDate(item.createdAt)}</span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Tags */}
//                   {item.tags && item.tags.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mt-3">
//                       {item.tags.slice(0, 3).map((tag, index) => (
//                         <span
//                           key={index}
//                           className="px-2 py-1 rounded text-xs font-medium"
//                           style={{ backgroundColor: colors.lightBg, color: colors.primary }}
//                         >
//                           #{tag}
//                         </span>
//                       ))}
//                       {item.tags.length > 3 && (
//                         <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: colors.lightBg, color: colors.primary }}>
//                           +{item.tags.length - 3}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { Image, Search, MapPin, Calendar, Camera } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function PhotosPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { media, loading, error } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');

//   const categoryOptions = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' }
//   ];

//   useEffect(() => {
//     dispatch(fetchMedia({ limit: 50, status: 'approved', fileType: 'image' }));
//     dispatch(fetchDistricts());
//   }, [dispatch]);

//   const districtOptions = [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ];

//   // Dummy photos data
//   const dummyPhotos = [
//     {
//       _id: 'photo1',
//       title: 'Khajuraho Temple Complex',
//       description: 'Ancient temples showcasing exquisite architecture',
//       fileUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
//       fileType: 'image',
//       category: 'heritage',
//       district: { _id: 'dist1', name: 'Chhatarpur' },
//       captureDate: '2024-10-15',
//       photographer: 'RTC Team',
//       tags: ['temple', 'UNESCO']
//     },
//     {
//       _id: 'photo2',
//       title: 'Pachmarhi Hills',
//       description: 'Scenic beauty of Satpura ranges',
//       fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
//       fileType: 'image',
//       category: 'natural',
//       district: { _id: 'dist2', name: 'Hoshangabad' },
//       captureDate: '2024-10-20',
//       photographer: 'RTC Team',
//       tags: ['hills', 'nature']
//     },
//     {
//       _id: 'photo3',
//       title: 'Narmada River Sunset',
//       description: 'Golden hour at the sacred Narmada',
//       fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
//       fileType: 'image',
//       category: 'natural',
//       district: { _id: 'dist3', name: 'Jabalpur' },
//       captureDate: '2024-10-25',
//       photographer: 'RTC Team',
//       tags: ['river', 'sunset']
//     },
//     {
//       _id: 'photo4',
//       title: 'Diwali Celebrations',
//       description: 'Festival of lights across villages',
//       fileUrl: 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=800',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=400',
//       fileType: 'image',
//       category: 'festival',
//       district: { _id: 'dist4', name: 'Indore' },
//       captureDate: '2024-11-05',
//       photographer: 'RTC Team',
//       tags: ['diwali', 'festival']
//     },
//     {
//       _id: 'photo5',
//       title: 'Traditional Pottery',
//       description: 'Local artisan crafting clay pots',
//       fileUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
//       fileType: 'image',
//       category: 'cultural',
//       district: { _id: 'dist5', name: 'Sagar' },
//       captureDate: '2024-10-30',
//       photographer: 'RTC Team',
//       tags: ['craft', 'pottery']
//     },
//     {
//       _id: 'photo6',
//       title: 'Bandhavgarh Tiger',
//       description: 'Royal Bengal Tiger in natural habitat',
//       fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
//       fileType: 'image',
//       category: 'natural',
//       district: { _id: 'dist6', name: 'Umaria' },
//       captureDate: '2024-11-08',
//       photographer: 'RTC Team',
//       tags: ['wildlife', 'tiger']
//     }
//   ];

//   const displayPhotos = media.length > 0 ? media.filter(m => m.fileType === 'image') : dummyPhotos;

//   const filteredPhotos = displayPhotos.filter(item => {
//     if (item.status !== 'approved' && item.status !== undefined) return false;
//     const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//     const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
//     const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
//     return matchesCategory && matchesDistrict && matchesSearch;
//   });

//   const getCategoryColor = (category) => {
//     const colors = {
//       heritage: 'bg-amber-500',
//       natural: 'bg-emerald-500',
//       cultural: 'bg-purple-500',
//       event: 'bg-blue-500',
//       festival: 'bg-pink-500'
//     };
//     return colors[category] || 'bg-gray-500';
//   };

//   const getCategoryLabel = (category) => {
//     const labels = {
//       heritage: 'Heritage',
//       natural: 'Natural',
//       cultural: 'Cultural',
//       event: 'Event',
//       festival: 'Festival'
//     };
//     return labels[category] || category;
//   };

//   const handleCardClick = (id) => {
//     router.push(`/gallery/${id}`);
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header Section */}
//       <div className="bg-[#138808]">
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
//           {/* Mobile & Tablet */}
//           <div className="lg:hidden space-y-8">
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Image size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Photo Gallery</span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Photographic Journey
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Capturing the beauty and heritage of Madhya Pradesh
//               </p>
//             </div>

//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search photos..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#138808]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
//                       '&:hover fieldset': { borderColor: '#138808' },
//                       '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
//                     },
//                     '& .MuiInputBase-input': { color: '#138808', fontWeight: 500 }
//                   }}
//                 />

//                 <div className="grid grid-cols-2 gap-3">
//                   <SelectField
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     options={categoryOptions}
//                     fullWidth
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
//                         '&:hover fieldset': { borderColor: '#138808' },
//                         '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
//                       },
//                       '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
//                     }}
//                   />

//                   <SelectField
//                     value={selectedDistrict}
//                     onChange={(e) => setSelectedDistrict(e.target.value)}
//                     options={districtOptions}
//                     fullWidth
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
//                         '&:hover fieldset': { borderColor: '#138808' },
//                         '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
//                       },
//                       '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#138808] font-medium">
//                   {filteredPhotos.length} photos
//                 </span>
//                 <button
//                   onClick={() => router.push('/gallery/videos')}
//                   className="text-[#138808] font-medium hover:underline"
//                 >
//                   View Videos →
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Desktop */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Image size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Photo Gallery</span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Photographic Journey
//               </h1>
//               <p className="text-lg text-white/90">
//                 Capturing the beauty and heritage of Madhya Pradesh
//               </p>
//             </div>

//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   <TextField
//                     placeholder="Search photos..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     fullWidth
//                     startIcon={<Search size={20} className="text-[#138808]" />}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
//                         '&:hover fieldset': { borderColor: '#138808' },
//                         '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
//                       },
//                       '& .MuiInputBase-input': { color: '#138808', fontWeight: 500 }
//                     }}
//                   />

//                   <div className="grid grid-cols-2 gap-3">
//                     <SelectField
//                       value={selectedCategory}
//                       onChange={(e) => setSelectedCategory(e.target.value)}
//                       options={categoryOptions}
//                       fullWidth
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
//                           '&:hover fieldset': { borderColor: '#138808' },
//                           '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
//                         },
//                         '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
//                       }}
//                     />

//                     <SelectField
//                       value={selectedDistrict}
//                       onChange={(e) => setSelectedDistrict(e.target.value)}
//                       options={districtOptions}
//                       fullWidth
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
//                           '&:hover fieldset': { borderColor: '#138808' },
//                           '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
//                         },
//                         '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
//                       }}
//                     />
//                   </div>

//                   <div className="pt-4 border-t border-[#138808]/10 flex items-center justify-between">
//                     <span className="text-[#138808] font-medium">
//                       {filteredPhotos.length} photos found
//                     </span>
//                     <button
//                       onClick={() => router.push('/gallery/videos')}
//                       className="text-[#138808] font-medium hover:underline"
//                     >
//                       View Videos →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Photos Grid */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Image size={48} className="mx-auto text-red-500 mb-4" />
//             <p className="text-[#138808] text-lg font-medium">Failed to load photos</p>
//           </div>
//         ) : filteredPhotos.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Image size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
//             <p className="text-[#138808] text-lg font-medium mb-2">No photos found</p>
//             <button
//               onClick={() => {
//                 setSearchTerm('');
//                 setSelectedCategory('all');
//                 setSelectedDistrict('all');
//               }}
//               className="text-[#138808] underline font-medium"
//             >
//               Clear filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredPhotos.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   <img
//                     src={item.thumbnailUrl || item.fileUrl}
//                     alt={item.title}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                       e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#138808]/5"><svg class="w-20 h-20 text-[#138808] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
//                     }}
//                   />
                  
//                   <div className="absolute top-4 left-4">
//                     <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.description}
//                   </p>

//                   <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-2 text-[#138808] font-bold text-sm">
//                       <MapPin size={14} />
//                       <span className="font-medium line-clamp-1">
//                         {item.district?.name || 'Unknown'}
//                       </span>
//                     </div>
//                     {item.captureDate && (
//                       <div className="flex items-center gap-1.5 text-[#138808]/60 text-xs">
//                         <Calendar size={14} />
//                         <span>
//                           {new Date(item.captureDate).toLocaleDateString('en-US', { 
//                             month: 'short', 
//                             day: 'numeric'
//                           })}
//                         </span>
//                       </div>
//                     )}
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