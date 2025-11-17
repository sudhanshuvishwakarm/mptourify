'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { Image as ImageIcon, Video, Search, MapPin, Calendar, Camera, ChevronDown, Filter, ArrowRight } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import Loader from '@/components/ui/Loader';

export default function GalleryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { media, loading, error, lastFetched } = useSelector((state) => state.media);
  const { districts } = useSelector((state) => state.district);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Refs for dropdowns
  const categoryRef = useRef(null);
  const typeRef = useRef(null);
  const districtRef = useRef(null);
  const filtersRef = useRef(null);

  // Memoized category options
  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'natural', label: 'Natural' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'event', label: 'Events' },
    { value: 'festival', label: 'Festivals' }
  ], []);

  // Memoized type options
  const typeOptions = useMemo(() => [
    { value: 'all', label: 'All Media' },
    { value: 'image', label: 'Photos' },
    { value: 'video', label: 'Videos' }
  ], []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setIsTypeOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setIsDistrictOpen(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // OPTIMIZED: Smart useEffect with better cache control
  useEffect(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
    // Only fetch media if it's empty or data is older than 1 hour
    const shouldFetchMedia = media.length === 0 || !lastFetched || lastFetched < oneHourAgo;
    const shouldFetchDistricts = districts.length === 0;

    if (shouldFetchMedia) {
      dispatch(fetchMedia({ limit: 50, status: 'approved' }));
    }
    
    if (shouldFetchDistricts) {
      dispatch(fetchDistricts());
    }
  }, [dispatch, media.length, districts.length, lastFetched]);

  // Memoized district options
  const districtOptions = useMemo(() => [
    { value: 'all', label: 'All Districts' },
    ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
  ], [districts]);

  // Memoized category color mapping
  const getCategoryColor = useCallback((category) => {
    const colors = {
      heritage: 'bg-amber-500',
      natural: 'bg-emerald-500',
      cultural: 'bg-purple-500',
      event: 'bg-blue-500',
      festival: 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  }, []);

  // Memoized category label mapping
  const getCategoryLabel = useCallback((category) => {
    const labels = {
      heritage: 'Heritage',
      natural: 'Natural',
      cultural: 'Cultural',
      event: 'Event',
      festival: 'Festival'
    };
    return labels[category] || category;
  }, []);

  // Memoized image error handler
  const handleImageError = useCallback((itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  }, []);

  // OPTIMIZED: Memoized filtered media with early returns
  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      if (item.status !== 'approved' && item.status !== undefined) return false;
      
      // Early return if search term doesn't match
      if (searchTerm && 
          !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesType = selectedType === 'all' || item.fileType === selectedType;
      const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      
      return matchesCategory && matchesType && matchesDistrict;
    });
  }, [media, selectedCategory, selectedType, selectedDistrict, searchTerm]);

  // Memoized card click handler
  const handleCardClick = useCallback((id) => {
    router.push(`/gallery/${id}`);
  }, [router]);

  // Memoized clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedDistrict('all');
  }, []);

  // Memoized navigation handlers
  const handlePhotosNavigation = useCallback(() => {
    router.push('/gallery/photos');
  }, [router]);

  const handleVideosNavigation = useCallback(() => {
    router.push('/gallery/videos');
  }, [router]);

  // Memoized search handler
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized category change handler
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
  }, []);

  // Memoized type change handler
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    setIsTypeOpen(false);
  }, []);

  // Memoized district change handler
  const handleDistrictChange = useCallback((district) => {
    setSelectedDistrict(district);
    setIsDistrictOpen(false);
  }, []);

  // Toggle dropdown handlers with proper functionality
  const toggleCategoryDropdown = useCallback(() => {
    setIsCategoryOpen(prev => !prev);
  }, []);

  const toggleTypeDropdown = useCallback(() => {
    setIsTypeOpen(prev => !prev);
  }, []);

  const toggleDistrictDropdown = useCallback(() => {
    setIsDistrictOpen(prev => !prev);
  }, []);

  // Toggle mobile filters
  const toggleMobileFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Get current labels
  const currentCategoryLabel = useMemo(() => {
    return categoryOptions.find(option => option.value === selectedCategory)?.label || 'All Categories';
  }, [selectedCategory, categoryOptions]);

  const currentTypeLabel = useMemo(() => {
    return typeOptions.find(option => option.value === selectedType)?.label || 'All Media';
  }, [selectedType, typeOptions]);

  const currentDistrictLabel = useMemo(() => {
    return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
  }, [selectedDistrict, districtOptions]);

  // OPTIMIZED: Only show loader on initial load when there's no data
  const showLoader = loading && media.length === 0;

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header Section */}
      
      <div className="bg-[#117307]">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
          {/* Mobile & Tablet: Stack layout */}
          <div className="lg:hidden space-y-6">
            {/* Header Content */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Explore Madhya Pradesh
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                Visual stories from every corner of our state
              </p>

              {/* Quick Navigation Buttons - Mobile */}
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={handlePhotosNavigation}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <ImageIcon size={16} />
                  <span>Photos</span>
                </button>
                <button
                  onClick={handleVideosNavigation}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <Video size={16} />
                  <span>Videos</span>
                </button>
              </div>
            </div>

            {/* Search & Filter for Mobile */}
            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6" ref={filtersRef}>
              <div className="space-y-4">
                {/* Search Bar */}
                <TextField
                  placeholder="Search gallery..."
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
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#117307',
                      fontWeight: 500
                    }
                  }}
                />

                {/* Filter Toggle Button for Mobile */}
                <button
                  onClick={toggleMobileFilters}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                  <ChevronDown 
                    size={20} 
                    className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Filters Dropdown - Only show when toggled */}
                {showFilters && (
                  <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#117307]/20">
                    {/* Category Dropdown */}
                    <div className="relative" ref={categoryRef}>
                      <button
                        onClick={toggleCategoryDropdown}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
                      >
                        <span>{currentCategoryLabel}</span>
                        <ChevronDown 
                          size={20} 
                          className={`transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {isCategoryOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                          {categoryOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleCategoryChange(option.value)}
                              className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer font-semibold ${
                                selectedCategory === option.value 
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

                    {/* Type Dropdown */}
                    <div className="relative" ref={typeRef}>
                      <button
                        onClick={toggleTypeDropdown}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
                      >
                        <span>{currentTypeLabel}</span>
                        <ChevronDown 
                          size={20} 
                          className={`transform transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {isTypeOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                          {typeOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleTypeChange(option.value)}
                              className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer font-semibold ${
                                selectedType === option.value 
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

                    {/* District Dropdown */}
                    <div className="relative" ref={districtRef}>
                      <button
                        onClick={toggleDistrictDropdown}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
                      >
                        <span>{currentDistrictLabel}</span>
                        <ChevronDown 
                          size={20} 
                          className={`transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {isDistrictOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                          {districtOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleDistrictChange(option.value)}
                              className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer font-semibold ${
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
            </div>
          </div>

          {/* Desktop: Side by side layout */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            {/* Header Content - Left Side */}
            <div className="flex-1 max-w-xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Explore Madhya Pradesh
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Visual stories from every corner of our state
              </p>

              {/* Quick Navigation Buttons - Desktop */}
              <div className="flex gap-4">
                <button
                  onClick={handlePhotosNavigation}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <ImageIcon size={20} />
                  <span>Browse Photos</span>
                </button>
                <button
                  onClick={handleVideosNavigation}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <Video size={20} />
                  <span>Browse Videos</span>
                </button>
              </div>
            </div>

            {/* Search & Filter - Right Side */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                  <TextField
                    placeholder="Search gallery..."
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

                  <div className="grid grid-cols-3 mt-3 gap-3">
                    {/* Category Dropdown */}
                    <div className="relative" ref={categoryRef}>
                      <button
                        onClick={toggleCategoryDropdown}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
                      >
                        <span className="truncate">{currentCategoryLabel}</span>
                        <ChevronDown 
                          size={16} 
                          className={`flex-shrink-0 transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {isCategoryOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                          {categoryOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleCategoryChange(option.value)}
                              className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
                                selectedCategory === option.value 
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

                    {/* Type Dropdown */}
                    <div className="relative" ref={typeRef}>
                      <button
                        onClick={toggleTypeDropdown}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
                      >
                        <span className="truncate">{currentTypeLabel}</span>
                        <ChevronDown 
                          size={16} 
                          className={`flex-shrink-0 transform transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {isTypeOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                          {typeOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleTypeChange(option.value)}
                              className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
                                selectedType === option.value 
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

                    {/* District Dropdown */}
                    <div className="relative" ref={districtRef}>
                      <button
                        onClick={toggleDistrictDropdown}
                        className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
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
                              className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Camera size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-[#117307] text-lg font-medium">Failed to load gallery</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Camera size={48} className="mx-auto text-[#117307] opacity-20 mb-4" />
            <p className="text-[#117307] text-lg font-medium mb-2">No media found</p>
            <button
              onClick={handleClearFilters}
              className="text-[#117307] underline font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMedia.map((item) => (
              <div
                key={item._id}
                onClick={() => handleCardClick(item._id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
              >
                {/* Image/Video Container */}
                <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                  {item.fileType === 'video' ? (
                    // Video thumbnail with play icon overlay
                    <div className="relative w-full h-full">
                      {item.thumbnailUrl && !imageErrors[item._id] ? (
                        <>
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                            onError={() => handleImageError(item._id)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <Video size={32} className="text-white" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#117307]/20 to-[#117307]/40 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <Video size={48} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : imageErrors[item._id] ? (
                    // Fallback when image fails to load
                    <div className="absolute inset-0 flex items-center justify-center bg-[#117307]/5">
                      <ImageIcon size={64} className="text-[#117307] opacity-20" />
                    </div>
                  ) : (
                    // Image display
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={() => handleImageError(item._id)}
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
                    <Calendar size={14} className="text-[#1a5e10]" />
                    <span>
                      {item.captureDate 
                        ? new Date(item.captureDate).toLocaleDateString('en-US', { 
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Date not available'
                      }
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#0d4d03] mb-3 
                                 line-clamp-2 leading-tight 
                                 group-hover:text-[#0a3a02] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
                      <MapPin size={14} />
                      <span className="line-clamp-1">
                        {item.district?.name || 'Unknown District'}
                      </span>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm">
                      View Details
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 'use client';

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { Image as ImageIcon, Video, Search, MapPin, Calendar, Camera, ChevronDown, Filter } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import Loader from '@/components/ui/Loader';

// export default function GalleryPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { media, loading, error, lastFetched } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedType, setSelectedType] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [imageErrors, setImageErrors] = useState({});
//   const [isCategoryOpen, setIsCategoryOpen] = useState(false);
//   const [isTypeOpen, setIsTypeOpen] = useState(false);
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);
//   const [showFilters, setShowFilters] = useState(false); // New state for mobile filters

//   // Refs for dropdowns
//   const categoryRef = useRef(null);
//   const typeRef = useRef(null);
//   const districtRef = useRef(null);
//   const filtersRef = useRef(null);

//   // Memoized category options
//   const categoryOptions = useMemo(() => [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' }
//   ], []);

//   // Memoized type options
//   const typeOptions = useMemo(() => [
//     { value: 'all', label: 'All Media' },
//     { value: 'image', label: 'Photos' },
//     { value: 'video', label: 'Videos' }
//   ], []);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (categoryRef.current && !categoryRef.current.contains(event.target)) {
//         setIsCategoryOpen(false);
//       }
//       if (typeRef.current && !typeRef.current.contains(event.target)) {
//         setIsTypeOpen(false);
//       }
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//       if (filtersRef.current && !filtersRef.current.contains(event.target) && window.innerWidth < 1024) {
//         setShowFilters(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // OPTIMIZED: Smart useEffect with better cache control
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
//     // Only fetch media if it's empty or data is older than 1 hour
//     const shouldFetchMedia = media.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchMedia) {
//       dispatch(fetchMedia({ limit: 50, status: 'approved' }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, media.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized category color mapping
//   const getCategoryColor = useCallback((category) => {
//     const colors = {
//       heritage: 'bg-amber-500',
//       natural: 'bg-emerald-500',
//       cultural: 'bg-purple-500',
//       event: 'bg-blue-500',
//       festival: 'bg-pink-500'
//     };
//     return colors[category] || 'bg-gray-500';
//   }, []);

//   // Memoized category label mapping
//   const getCategoryLabel = useCallback((category) => {
//     const labels = {
//       heritage: 'Heritage',
//       natural: 'Natural',
//       cultural: 'Cultural',
//       event: 'Event',
//       festival: 'Festival'
//     };
//     return labels[category] || category;
//   }, []);

//   // Memoized image error handler
//   const handleImageError = useCallback((itemId) => {
//     setImageErrors(prev => ({
//       ...prev,
//       [itemId]: true
//     }));
//   }, []);

//   // OPTIMIZED: Memoized filtered media with early returns
//   const filteredMedia = useMemo(() => {
//     return media.filter(item => {
//       if (item.status !== 'approved' && item.status !== undefined) return false;
      
//       // Early return if search term doesn't match
//       if (searchTerm && 
//           !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
//         return false;
//       }
      
//       const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//       const matchesType = selectedType === 'all' || item.fileType === selectedType;
//       const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      
//       return matchesCategory && matchesType && matchesDistrict;
//     });
//   }, [media, selectedCategory, selectedType, selectedDistrict, searchTerm]);

//   // Memoized card click handler
//   const handleCardClick = useCallback((id) => {
//     router.push(`/gallery/${id}`);
//   }, [router]);

//   // Memoized clear filters handler
//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedCategory('all');
//     setSelectedType('all');
//     setSelectedDistrict('all');
//   }, []);

//   // Memoized navigation handlers
//   const handlePhotosNavigation = useCallback(() => {
//     router.push('/gallery/photos');
//   }, [router]);

//   const handleVideosNavigation = useCallback(() => {
//     router.push('/gallery/videos');
//   }, [router]);

//   // Memoized search handler
//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   // Memoized category change handler
//   const handleCategoryChange = useCallback((category) => {
//     setSelectedCategory(category);
//     setIsCategoryOpen(false);
//   }, []);

//   // Memoized type change handler
//   const handleTypeChange = useCallback((type) => {
//     setSelectedType(type);
//     setIsTypeOpen(false);
//   }, []);

//   // Memoized district change handler
//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   // Toggle dropdown handlers with proper functionality
//   const toggleCategoryDropdown = useCallback(() => {
//     setIsCategoryOpen(prev => !prev);
//   }, []);

//   const toggleTypeDropdown = useCallback(() => {
//     setIsTypeOpen(prev => !prev);
//   }, []);

//   const toggleDistrictDropdown = useCallback(() => {
//     setIsDistrictOpen(prev => !prev);
//   }, []);

//   // Toggle mobile filters
//   const toggleMobileFilters = useCallback(() => {
//     setShowFilters(prev => !prev);
//   }, []);

//   // Get current labels
//   const currentCategoryLabel = useMemo(() => {
//     return categoryOptions.find(option => option.value === selectedCategory)?.label || 'All Categories';
//   }, [selectedCategory, categoryOptions]);

//   const currentTypeLabel = useMemo(() => {
//     return typeOptions.find(option => option.value === selectedType)?.label || 'All Media';
//   }, [selectedType, typeOptions]);

//   const currentDistrictLabel = useMemo(() => {
//     return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
//   }, [selectedDistrict, districtOptions]);

//   // OPTIMIZED: Only show loader on initial load when there's no data
//   const showLoader = loading && media.length === 0;

//   if (showLoader) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header Section */}
//       <div className="bg-[#138808]">
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
//           {/* Mobile & Tablet: Stack layout */}
//           <div className="lg:hidden space-y-6">
//             {/* Header Content */}
//             <div className="text-center">
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Mobile */}
//               <div className="flex gap-3 justify-center mt-6">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <ImageIcon size={16} />
//                   <span>Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <Video size={16} />
//                   <span>Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter for Mobile */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6" ref={filtersRef}>
//               <div className="space-y-4">
//                 {/* Search Bar */}
//                 <TextField
//                   placeholder="Search gallery..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#138808]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#138808',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiInputBase-input': {
//                       color: '#138808',
//                       fontWeight: 500
//                     }
//                   }}
//                 />

//                 {/* Filter Toggle Button for Mobile */}
//                 <button
//                   onClick={toggleMobileFilters}
//                   className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                 >
//                   <Filter size={20} />
//                   <span>Filters</span>
//                   <ChevronDown 
//                     size={20} 
//                     className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
//                   />
//                 </button>

//                 {/* Filters Dropdown - Only show when toggled */}
//                 {showFilters && (
//                   <div className="grid grid-cols-1 gap-3 pt-3 border-t border-[#138808]/20">
//                     {/* Category Dropdown */}
//                     <div className="relative" ref={categoryRef}>
//                       <button
//                         onClick={toggleCategoryDropdown}
//                         className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                       >
//                         <span>{currentCategoryLabel}</span>
//                         <ChevronDown 
//                           size={20} 
//                           className={`transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isCategoryOpen && (
//                         <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                           {categoryOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleCategoryChange(option.value)}
//                               className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer font-semibold ${
//                                 selectedCategory === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* Type Dropdown */}
//                     <div className="relative" ref={typeRef}>
//                       <button
//                         onClick={toggleTypeDropdown}
//                         className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                       >
//                         <span>{currentTypeLabel}</span>
//                         <ChevronDown 
//                           size={20} 
//                           className={`transform transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isTypeOpen && (
//                         <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                           {typeOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleTypeChange(option.value)}
//                               className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer font-semibold ${
//                                 selectedType === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* District Dropdown */}
//                     <div className="relative" ref={districtRef}>
//                       <button
//                         onClick={toggleDistrictDropdown}
//                         className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                       >
//                         <span>{currentDistrictLabel}</span>
//                         <ChevronDown 
//                           size={20} 
//                           className={`transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isDistrictOpen && (
//                         <div className="absolute z-20 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                           {districtOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleDistrictChange(option.value)}
//                               className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer font-semibold ${
//                                 selectedDistrict === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
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
//             </div>
//           </div>

//           {/* Desktop: Side by side layout - No changes */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             {/* Header Content - Left Side */}
//             <div className="flex-1 max-w-xl">
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-lg text-white/90 mb-6">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Desktop */}
//               <div className="flex gap-4">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <ImageIcon size={20} />
//                   <span>Browse Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <Video size={20} />
//                   <span>Browse Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter - Right Side */}
//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   <TextField
//                     placeholder="Search gallery..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
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

//                   <div className="grid grid-cols-3 mt-3 gap-3">
//                     {/* Category Dropdown */}
//                     <div className="relative" ref={categoryRef}>
//                       <button
//                         onClick={toggleCategoryDropdown}
//                         className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#138808] rounded-md text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
//                       >
//                         <span className="truncate">{currentCategoryLabel}</span>
//                         <ChevronDown 
//                           size={16} 
//                           className={`flex-shrink-0 transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isCategoryOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                           {categoryOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleCategoryChange(option.value)}
//                               className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
//                                 selectedCategory === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* Type Dropdown */}
//                     <div className="relative" ref={typeRef}>
//                       <button
//                         onClick={toggleTypeDropdown}
//                         className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#138808] rounded-md text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
//                       >
//                         <span className="truncate">{currentTypeLabel}</span>
//                         <ChevronDown 
//                           size={16} 
//                           className={`flex-shrink-0 transform transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isTypeOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                           {typeOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleTypeChange(option.value)}
//                               className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
//                                 selectedType === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* District Dropdown */}
//                     <div className="relative" ref={districtRef}>
//                       <button
//                         onClick={toggleDistrictDropdown}
//                         className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#138808] rounded-md text-[#138808] font-semibold bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
//                       >
//                         <span className="truncate">{currentDistrictLabel}</span>
//                         <ChevronDown 
//                           size={16} 
//                           className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isDistrictOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                           {districtOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleDistrictChange(option.value)}
//                               className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
//                                 selectedDistrict === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Gallery Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-red-500 mb-4" />
//             <p className="text-[#138808] text-lg font-medium">Failed to load gallery</p>
//           </div>
//         ) : filteredMedia.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
//             <p className="text-[#138808] text-lg font-medium mb-2">No media found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#138808] underline font-medium cursor-pointer"
//             >
//               Clear all filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredMedia.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 {/* Image/Video Container */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {item.fileType === 'video' ? (
//                     // Video thumbnail with play icon overlay
//                     <div className="relative w-full h-full">
//                       {item.thumbnailUrl && !imageErrors[item._id] ? (
//                         <>
//                           <img
//                             src={item.thumbnailUrl}
//                             alt={item.title}
//                             className="w-full h-full object-cover"
//                             onError={() => handleImageError(item._id)}
//                             loading="lazy"
//                           />
//                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
//                             <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                               <Video size={32} className="text-white" />
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#138808]/40 flex items-center justify-center">
//                           <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                             <Video size={48} className="text-white" />
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : imageErrors[item._id] ? (
//                     // Fallback when image fails to load
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
//                       <ImageIcon size={64} className="text-[#138808] opacity-20" />
//                     </div>
//                   ) : (
//                     // Image display
//                     <img
//                       src={item.fileUrl}
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       onError={() => handleImageError(item._id)}
//                       loading="lazy"
//                     />
//                   )}
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-4 left-4">
//                     <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>

//                   {/* Video Badge */}
//                   {item.fileType === 'video' && (
//                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                       <Video size={14} />
//                       Video
//                     </div>
//                   )}
//                 </div>

//                <div className="p-6">
//   {/* Title */}
//   <h3 className="text-xl font-bold text-[#0d4d03] mb-3 
//                  line-clamp-2 leading-tight 
//                  group-hover:text-[#0a3a02] transition-colors">
//     {item.title}
//   </h3>

//   {/* Description */}
//   <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
//     {item.description}
//   </p>

//   {/* Footer */}
//   <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
//     <div className="flex items-center gap-2 text-[#1a5e10] font-semibold text-sm">
//       <MapPin size={14} />
//       <span className="line-clamp-1">
//         {item.district?.name || 'Unknown'}
//       </span>
//     </div>
//     {item.captureDate && (
//       <div className="flex items-center gap-1.5 text-[#5f6f61] font-medium text-xs">
//         <Calendar size={14} />
//         <span>
//           {new Date(item.captureDate).toLocaleDateString('en-US', { 
//             month: 'short', 
//             day: 'numeric'
//           })}
//         </span>
//       </div>
//     )}
//   </div>
// </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { Image as ImageIcon, Video, Search, MapPin, Calendar, Camera, ChevronDown } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import Loader from '@/components/ui/Loader';

// export default function GalleryPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { media, loading, error, lastFetched } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedType, setSelectedType] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [imageErrors, setImageErrors] = useState({});
//   const [isCategoryOpen, setIsCategoryOpen] = useState(false);
//   const [isTypeOpen, setIsTypeOpen] = useState(false);
//   const [isDistrictOpen, setIsDistrictOpen] = useState(false);

//   // Refs for dropdowns
//   const categoryRef = useRef(null);
//   const typeRef = useRef(null);
//   const districtRef = useRef(null);

//   // Memoized category options
//   const categoryOptions = useMemo(() => [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' }
//   ], []);

//   // Memoized type options
//   const typeOptions = useMemo(() => [
//     { value: 'all', label: 'All Media' },
//     { value: 'image', label: 'Photos' },
//     { value: 'video', label: 'Videos' }
//   ], []);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (categoryRef.current && !categoryRef.current.contains(event.target)) {
//         setIsCategoryOpen(false);
//       }
//       if (typeRef.current && !typeRef.current.contains(event.target)) {
//         setIsTypeOpen(false);
//       }
//       if (districtRef.current && !districtRef.current.contains(event.target)) {
//         setIsDistrictOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // OPTIMIZED: Smart useEffect with better cache control
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
//     // Only fetch media if it's empty or data is older than 1 hour
//     const shouldFetchMedia = media.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchMedia) {
//       dispatch(fetchMedia({ limit: 50, status: 'approved' }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, media.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized category color mapping
//   const getCategoryColor = useCallback((category) => {
//     const colors = {
//       heritage: 'bg-amber-500',
//       natural: 'bg-emerald-500',
//       cultural: 'bg-purple-500',
//       event: 'bg-blue-500',
//       festival: 'bg-pink-500'
//     };
//     return colors[category] || 'bg-gray-500';
//   }, []);

//   // Memoized category label mapping
//   const getCategoryLabel = useCallback((category) => {
//     const labels = {
//       heritage: 'Heritage',
//       natural: 'Natural',
//       cultural: 'Cultural',
//       event: 'Event',
//       festival: 'Festival'
//     };
//     return labels[category] || category;
//   }, []);

//   // Memoized image error handler
//   const handleImageError = useCallback((itemId) => {
//     setImageErrors(prev => ({
//       ...prev,
//       [itemId]: true
//     }));
//   }, []);

//   // OPTIMIZED: Memoized filtered media with early returns
//   const filteredMedia = useMemo(() => {
//     return media.filter(item => {
//       if (item.status !== 'approved' && item.status !== undefined) return false;
      
//       // Early return if search term doesn't match
//       if (searchTerm && 
//           !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
//         return false;
//       }
      
//       const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//       const matchesType = selectedType === 'all' || item.fileType === selectedType;
//       const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      
//       return matchesCategory && matchesType && matchesDistrict;
//     });
//   }, [media, selectedCategory, selectedType, selectedDistrict, searchTerm]);

//   // Memoized card click handler
//   const handleCardClick = useCallback((id) => {
//     router.push(`/gallery/${id}`);
//   }, [router]);

//   // Memoized clear filters handler
//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedCategory('all');
//     setSelectedType('all');
//     setSelectedDistrict('all');
//   }, []);

//   // Memoized navigation handlers
//   const handlePhotosNavigation = useCallback(() => {
//     router.push('/gallery/photos');
//   }, [router]);

//   const handleVideosNavigation = useCallback(() => {
//     router.push('/gallery/videos');
//   }, [router]);

//   // Memoized search handler
//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   // Memoized category change handler
//   const handleCategoryChange = useCallback((category) => {
//     setSelectedCategory(category);
//     setIsCategoryOpen(false);
//   }, []);

//   // Memoized type change handler
//   const handleTypeChange = useCallback((type) => {
//     setSelectedType(type);
//     setIsTypeOpen(false);
//   }, []);

//   // Memoized district change handler
//   const handleDistrictChange = useCallback((district) => {
//     setSelectedDistrict(district);
//     setIsDistrictOpen(false);
//   }, []);

//   // Get current labels
//   const currentCategoryLabel = useMemo(() => {
//     return categoryOptions.find(option => option.value === selectedCategory)?.label || 'All Categories';
//   }, [selectedCategory, categoryOptions]);

//   const currentTypeLabel = useMemo(() => {
//     return typeOptions.find(option => option.value === selectedType)?.label || 'All Media';
//   }, [selectedType, typeOptions]);

//   const currentDistrictLabel = useMemo(() => {
//     return districtOptions.find(option => option.value === selectedDistrict)?.label || 'All Districts';
//   }, [selectedDistrict, districtOptions]);

//   // OPTIMIZED: Only show loader on initial load when there's no data
//   const showLoader = loading && media.length === 0;

//   if (showLoader) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header Section */}
//       <div className="bg-[#138808]">
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
//           {/* Mobile & Tablet: Stack layout */}
//           <div className="lg:hidden space-y-8">
//             {/* Header Content */}
//             <div className="text-center">
//               {/* <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Media Gallery
//                 </span>
//               </div> */}
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Mobile */}
//               <div className="flex gap-3 justify-center mt-6">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <ImageIcon size={16} />
//                   <span>Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <Video size={16} />
//                   <span>Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search gallery..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#138808]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#138808',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiInputBase-input': {
//                       color: '#138808',
//                       fontWeight: 500
//                     }
//                   }}
//                 />

//                 <div className="grid grid-cols-1 mt-3 gap-3">
//                   {/* Category Dropdown */}
//                   <div className="relative" ref={categoryRef}>
//                     <button
//                       onClick={() => setIsCategoryOpen(!isCategoryOpen)}
//                       className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-medium bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                     >
//                       <span>{currentCategoryLabel}</span>
//                       <ChevronDown 
//                         size={20} 
                        
//                         className={`transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
                    
//                     {isCategoryOpen && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                         {categoryOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             onClick={() => handleCategoryChange(option.value)}
//                             className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer ${
//                               selectedCategory === option.value 
//                                 ? 'bg-[#138808] text-white' 
//                                 : 'text-[#138808]'
//                             }`}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* Type Dropdown */}
//                   <div className="relative" ref={typeRef}>
//                     <button
//                       onClick={() => setIsTypeOpen(!isTypeOpen)}
//                       className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-medium bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                     >
//                       <span>{currentTypeLabel}</span>
//                       <ChevronDown 
//                         size={20} 
//                         className={`transform transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
                    
//                     {isTypeOpen && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                         {typeOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             onClick={() => handleTypeChange(option.value)}
//                             className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer ${
//                               selectedType === option.value 
//                                 ? 'bg-[#138808] text-white' 
//                                 : 'text-[#138808]'
//                             }`}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* District Dropdown */}
//                   <div className="relative" ref={districtRef}>
//                     <button
//                       onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                       className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#138808] rounded-lg text-[#138808] font-medium bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2]"
//                     >
//                       <span>{currentDistrictLabel}</span>
//                       <ChevronDown 
//                         size={20} 
//                         className={`transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
                    
//                     {isDistrictOpen && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                         {districtOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             onClick={() => handleDistrictChange(option.value)}
//                             className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors cursor-pointer ${
//                               selectedDistrict === option.value 
//                                 ? 'bg-[#138808] text-white' 
//                                 : 'text-[#138808]'
//                             }`}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* <div className="pt-4 border-t border-[#138808]/10">
//                   <span className="text-[#138808] font-medium text-sm">
//                     {filteredMedia.length} items found
//                   </span>
//                 </div> */}
//               </div>
//             </div>
//           </div>

//           {/* Desktop: Side by side layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             {/* Header Content - Left Side */}
//             <div className="flex-1 max-w-xl">
//               {/* <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Media Gallery
//                 </span>
//               </div> */}
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-lg text-white/90 mb-6">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Desktop */}
//               <div className="flex gap-4">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <ImageIcon size={20} />
//                   <span>Browse Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer"
//                 >
//                   <Video size={20} />
//                   <span>Browse Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter - Right Side */}
//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   <TextField
//                     placeholder="Search gallery..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
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

//                   <div className="grid grid-cols-3 mt-3 gap-3">
//                     {/* Category Dropdown */}
//                     <div className="relative" ref={categoryRef}>
//                       <button
//                         onClick={() => setIsCategoryOpen(!isCategoryOpen)}
//                         className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#138808] rounded-md text-[#138808] font-medium bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
//                       >
//                         <span className="truncate">{currentCategoryLabel}</span>
//                         <ChevronDown 
//                           size={16} 
//                           className={`flex-shrink-0 transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isCategoryOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                           {categoryOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleCategoryChange(option.value)}
//                               className={`w-full font-semibold text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
//                                 selectedCategory === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* Type Dropdown */}
//                     <div className="relative" ref={typeRef}>
//                       <button
//                         onClick={() => setIsTypeOpen(!isTypeOpen)}
//                         className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#138808] rounded-md text-[#138808] font-medium bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
//                       >
//                         <span className="truncate">{currentTypeLabel}</span>
//                         <ChevronDown 
//                           size={16} 
//                           className={`flex-shrink-0 transform transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isTypeOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden">
//                           {typeOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleTypeChange(option.value)}
//                               className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
//                                 selectedType === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* District Dropdown */}
//                     <div className="relative" ref={districtRef}>
//                       <button
//                         onClick={() => setIsDistrictOpen(!isDistrictOpen)}
//                         className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#138808] rounded-md text-[#138808] font-medium bg-white transition-colors cursor-pointer hover:bg-[#f5fbf2] text-sm"
//                       >
//                         <span className="truncate">{currentDistrictLabel}</span>
//                         <ChevronDown 
//                           size={16} 
//                           className={`flex-shrink-0 transform transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
//                         />
//                       </button>
                      
//                       {isDistrictOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#138808] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
//                           {districtOptions.map((option) => (
//                             <button
//                               key={option.value}
//                               onClick={() => handleDistrictChange(option.value)}
//                               className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] transition-colors cursor-pointer text-sm ${
//                                 selectedDistrict === option.value 
//                                   ? 'bg-[#138808] text-white' 
//                                   : 'text-[#138808]'
//                               }`}
//                             >
//                               {option.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* <div className="pt-4 border-t border-[#138808]/10">
//                     <span className="text-[#138808] font-medium">
//                       {filteredMedia.length} items found
//                     </span>
//                   </div> */}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Gallery Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-red-500 mb-4" />
//             <p className="text-[#138808] text-lg font-medium">Failed to load gallery</p>
//           </div>
//         ) : filteredMedia.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
//             <p className="text-[#138808] text-lg font-medium mb-2">No media found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#138808] underline font-medium cursor-pointer"
//             >
//               Clear all filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredMedia.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 {/* Image/Video Container */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {item.fileType === 'video' ? (
//                     // Video thumbnail with play icon overlay
//                     <div className="relative w-full h-full">
//                       {item.thumbnailUrl && !imageErrors[item._id] ? (
//                         <>
//                           <img
//                             src={item.thumbnailUrl}
//                             alt={item.title}
//                             className="w-full h-full object-cover"
//                             onError={() => handleImageError(item._id)}
//                             loading="lazy"
//                           />
//                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
//                             <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                               <Video size={32} className="text-white" />
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#138808]/40 flex items-center justify-center">
//                           <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                             <Video size={48} className="text-white" />
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : imageErrors[item._id] ? (
//                     // Fallback when image fails to load
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
//                       <ImageIcon size={64} className="text-[#138808] opacity-20" />
//                     </div>
//                   ) : (
//                     // Image display
//                     <img
//                       src={item.fileUrl}
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       onError={() => handleImageError(item._id)}
//                       loading="lazy"
//                     />
//                   )}
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-4 left-4">
//                     <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>

//                   {/* Video Badge */}
//                   {item.fileType === 'video' && (
//                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                       <Video size={14} />
//                       Video
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-6">
//                   {/* Title */}
//                   <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   {/* Description */}
//                   <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.description}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-2 text-[#138808] font-bold text-sm">
//                       <MapPin size={14} />
//                       <span className="font-medium line-clamp-1">
//                         {item.district?.name || 'Unknown'}
//                       </span>
//                     </div>
//                     {item.captureDate && (
//                       <div className="flex items-center gap-1.5 text-[#138808] font-semibold text-xs">
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

// 'use client';

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { Image as ImageIcon, Video, Search, MapPin, Calendar, Camera } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function GalleryPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { media, loading, error, lastFetched } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedType, setSelectedType] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [imageErrors, setImageErrors] = useState({});

//   // Memoized category options
//   const categoryOptions = useMemo(() => [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' }
//   ], []);

//   // Memoized type options
//   const typeOptions = useMemo(() => [
//     { value: 'all', label: 'All Media' },
//     { value: 'image', label: 'Photos' },
//     { value: 'video', label: 'Videos' }
//   ], []);

//   // OPTIMIZED: Smart useEffect with better cache control
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
//     // Only fetch media if it's empty or data is older than 1 hour
//     const shouldFetchMedia = media.length === 0 || !lastFetched || lastFetched < oneHourAgo;
//     const shouldFetchDistricts = districts.length === 0;

//     if (shouldFetchMedia) {
//       dispatch(fetchMedia({ limit: 50, status: 'approved' }));
//     }
    
//     if (shouldFetchDistricts) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, media.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized category color mapping
//   const getCategoryColor = useCallback((category) => {
//     const colors = {
//       heritage: 'bg-amber-500',
//       natural: 'bg-emerald-500',
//       cultural: 'bg-purple-500',
//       event: 'bg-blue-500',
//       festival: 'bg-pink-500'
//     };
//     return colors[category] || 'bg-gray-500';
//   }, []);

//   // Memoized category label mapping
//   const getCategoryLabel = useCallback((category) => {
//     const labels = {
//       heritage: 'Heritage',
//       natural: 'Natural',
//       cultural: 'Cultural',
//       event: 'Event',
//       festival: 'Festival'
//     };
//     return labels[category] || category;
//   }, []);

//   // Memoized image error handler
//   const handleImageError = useCallback((itemId) => {
//     setImageErrors(prev => ({
//       ...prev,
//       [itemId]: true
//     }));
//   }, []);

//   // OPTIMIZED: Memoized filtered media with early returns
//   const filteredMedia = useMemo(() => {
//     return media.filter(item => {
//       if (item.status !== 'approved' && item.status !== undefined) return false;
      
//       // Early return if search term doesn't match
//       if (searchTerm && 
//           !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
//         return false;
//       }
      
//       const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//       const matchesType = selectedType === 'all' || item.fileType === selectedType;
//       const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      
//       return matchesCategory && matchesType && matchesDistrict;
//     });
//   }, [media, selectedCategory, selectedType, selectedDistrict, searchTerm]);

//   // Memoized card click handler
//   const handleCardClick = useCallback((id) => {
//     router.push(`/gallery/${id}`);
//   }, [router]);

//   // Memoized clear filters handler
//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedCategory('all');
//     setSelectedType('all');
//     setSelectedDistrict('all');
//   }, []);

//   // Memoized navigation handlers
//   const handlePhotosNavigation = useCallback(() => {
//     router.push('/gallery/photos');
//   }, [router]);

//   const handleVideosNavigation = useCallback(() => {
//     router.push('/gallery/videos');
//   }, [router]);

//   // Memoized search handler
//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   // Memoized category change handler
//   const handleCategoryChange = useCallback((e) => {
//     setSelectedCategory(e.target.value);
//   }, []);

//   // Memoized type change handler
//   const handleTypeChange = useCallback((e) => {
//     setSelectedType(e.target.value);
//   }, []);

//   // Memoized district change handler
//   const handleDistrictChange = useCallback((e) => {
//     setSelectedDistrict(e.target.value);
//   }, []);

//   // OPTIMIZED: Only show loader on initial load when there's no data
//   const showLoader = loading && media.length === 0;

//   if (showLoader) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header Section */}
//       <div className="bg-[#138808]">
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
//           {/* Mobile & Tablet: Stack layout */}
//           <div className="lg:hidden space-y-8">
//             {/* Header Content */}
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Media Gallery
//                 </span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Mobile */}
//               <div className="flex gap-3 justify-center mt-6">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
//                 >
//                   <ImageIcon size={16} />
//                   <span>Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
//                 >
//                   <Video size={16} />
//                   <span>Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search gallery..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#138808]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#138808',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiInputBase-input': {
//                       color: '#138808',
//                       fontWeight: 500
//                     }
//                   }}
//                 />

//                 <div className="grid grid-cols-1 mt-3 gap-3">
//                   <SelectField
//                     value={selectedCategory}
//                     onChange={handleCategoryChange}
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
//                     value={selectedType}
//                     onChange={handleTypeChange}
//                     options={typeOptions}
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
//                     onChange={handleDistrictChange}
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

//                 <div className="pt-4 border-t border-[#138808]/10">
//                   <span className="text-[#138808] font-medium text-sm">
//                     {filteredMedia.length} items found
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop: Side by side layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             {/* Header Content - Left Side */}
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Media Gallery
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-lg text-white/90 mb-6">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Desktop */}
//               <div className="flex gap-4">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
//                 >
//                   <ImageIcon size={20} />
//                   <span>Browse Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
//                 >
//                   <Video size={20} />
//                   <span>Browse Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter - Right Side */}
//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   <TextField
//                     placeholder="Search gallery..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
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

//                   <div className="grid grid-cols-3 mt-3 gap-3">
//                     <SelectField
//                       value={selectedCategory}
//                       onChange={handleCategoryChange}
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
//                       value={selectedType}
//                       onChange={handleTypeChange}
//                       options={typeOptions}
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
//                       onChange={handleDistrictChange}
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

//                   <div className="pt-4 border-t border-[#138808]/10">
//                     <span className="text-[#138808] font-medium">
//                       {filteredMedia.length} items found
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Gallery Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-red-500 mb-4" />
//             <p className="text-[#138808] text-lg font-medium">Failed to load gallery</p>
//           </div>
//         ) : filteredMedia.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
//             <p className="text-[#138808] text-lg font-medium mb-2">No media found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#138808] underline font-medium"
//             >
//               Clear all filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredMedia.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 {/* Image/Video Container */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {item.fileType === 'video' ? (
//                     // Video thumbnail with play icon overlay
//                     <div className="relative w-full h-full">
//                       {item.thumbnailUrl && !imageErrors[item._id] ? (
//                         <>
//                           <img
//                             src={item.thumbnailUrl}
//                             alt={item.title}
//                             className="w-full h-full object-cover"
//                             onError={() => handleImageError(item._id)}
//                             loading="lazy"
//                           />
//                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
//                             <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                               <Video size={32} className="text-white" />
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#138808]/40 flex items-center justify-center">
//                           <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                             <Video size={48} className="text-white" />
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : imageErrors[item._id] ? (
//                     // Fallback when image fails to load
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
//                       <ImageIcon size={64} className="text-[#138808] opacity-20" />
//                     </div>
//                   ) : (
//                     // Image display
//                     <img
//                       src={item.fileUrl}
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       onError={() => handleImageError(item._id)}
//                       loading="lazy"
//                     />
//                   )}
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-4 left-4">
//                     <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>

//                   {/* Video Badge */}
//                   {item.fileType === 'video' && (
//                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                       <Video size={14} />
//                       Video
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-6">
//                   {/* Title */}
//                   <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   {/* Description */}
//                   <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.description}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-2 text-[#138808] font-bold text-sm">
//                       <MapPin size={14} />
//                       <span className="font-medium line-clamp-1">
//                         {item.district?.name || 'Unknown'}
//                       </span>
//                     </div>
//                     {item.captureDate && (
//                       <div className="flex items-center gap-1.5 text-[#138808] font-semibold text-xs">
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


// 'use client';

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { Image as ImageIcon, Video, Search, MapPin, Calendar, Camera } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function GalleryPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { media, loading, error, lastFetched } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedType, setSelectedType] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [imageErrors, setImageErrors] = useState({});

//   // Memoized category options
//   const categoryOptions = useMemo(() => [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' }
//   ], []);

//   // Memoized type options
//   const typeOptions = useMemo(() => [
//     { value: 'all', label: 'All Media' },
//     { value: 'image', label: 'Photos' },
//     { value: 'video', label: 'Videos' }
//   ], []);

//   // UPDATED: Smart useEffect with cache control
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
//     // Only fetch media if it's empty or data is older than 1 hour
//     if (media.length === 0 || !lastFetched || lastFetched < oneHourAgo) {
//       dispatch(fetchMedia({ limit: 50, status: 'approved' }));
//     }
    
//     // Only fetch districts if empty
//     if (districts.length === 0) {
//       dispatch(fetchDistricts());
//     }
//   }, [dispatch, media.length, districts.length, lastFetched]);

//   // Memoized district options
//   const districtOptions = useMemo(() => [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ], [districts]);

//   // Memoized category color mapping
//   const getCategoryColor = useCallback((category) => {
//     const colors = {
//       heritage: 'bg-amber-500',
//       natural: 'bg-emerald-500',
//       cultural: 'bg-purple-500',
//       event: 'bg-blue-500',
//       festival: 'bg-pink-500'
//     };
//     return colors[category] || 'bg-gray-500';
//   }, []);

//   // Memoized category label mapping
//   const getCategoryLabel = useCallback((category) => {
//     const labels = {
//       heritage: 'Heritage',
//       natural: 'Natural',
//       cultural: 'Cultural',
//       event: 'Event',
//       festival: 'Festival'
//     };
//     return labels[category] || category;
//   }, []);

//   // Memoized image error handler
//   const handleImageError = useCallback((itemId) => {
//     setImageErrors(prev => ({
//       ...prev,
//       [itemId]: true
//     }));
//   }, []);

//   // Memoized filtered media
//   const filteredMedia = useMemo(() => {
//     return media.filter(item => {
//       if (item.status !== 'approved' && item.status !== undefined) return false;
//       const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//       const matchesType = selectedType === 'all' || item.fileType === selectedType;
//       const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
//       const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
//       return matchesCategory && matchesType && matchesDistrict && matchesSearch;
//     });
//   }, [media, selectedCategory, selectedType, selectedDistrict, searchTerm]);

//   // Memoized card click handler
//   const handleCardClick = useCallback((id) => {
//     router.push(`/gallery/${id}`);
//   }, [router]);

//   // Memoized clear filters handler
//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedCategory('all');
//     setSelectedType('all');
//     setSelectedDistrict('all');
//   }, []);

//   // Memoized navigation handlers
//   const handlePhotosNavigation = useCallback(() => {
//     router.push('/gallery/photos');
//   }, [router]);

//   const handleVideosNavigation = useCallback(() => {
//     router.push('/gallery/videos');
//   }, [router]);

//   // Memoized search handler
//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   // Memoized category change handler
//   const handleCategoryChange = useCallback((e) => {
//     setSelectedCategory(e.target.value);
//   }, []);

//   // Memoized type change handler
//   const handleTypeChange = useCallback((e) => {
//     setSelectedType(e.target.value);
//   }, []);

//   // Memoized district change handler
//   const handleDistrictChange = useCallback((e) => {
//     setSelectedDistrict(e.target.value);
//   }, []);

//   // Only show loader on initial load when there's no data
//   const showLoader = loading && media.length === 0;

//   if (showLoader) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header Section */}
//       <div className="bg-[#138808]">
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
//           {/* Mobile & Tablet: Stack layout */}
//           <div className="lg:hidden space-y-8">
//             {/* Header Content */}
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Media Gallery
//                 </span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Mobile */}
//               <div className="flex gap-3 justify-center mt-6">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
//                 >
//                   <ImageIcon size={16} />
//                   <span>Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
//                 >
//                   <Video size={16} />
//                   <span>Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search gallery..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#138808]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#138808',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#138808',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiInputBase-input': {
//                       color: '#138808',
//                       fontWeight: 500
//                     }
//                   }}
//                 />

//                 <div className="grid grid-cols-1 gap-3">
//                   <SelectField
//                     value={selectedCategory}
//                     onChange={handleCategoryChange}
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
//                     value={selectedType}
//                     onChange={handleTypeChange}
//                     options={typeOptions}
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
//                     onChange={handleDistrictChange}
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

//                 <div className="pt-4 border-t border-[#138808]/10">
//                   <span className="text-[#138808] font-medium text-sm">
//                     {filteredMedia.length} items found
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop: Side by side layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             {/* Header Content - Left Side */}
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Camera size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Media Gallery
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Explore Madhya Pradesh
//               </h1>
//               <p className="text-lg text-white/90 mb-6">
//                 Visual stories from every corner of our state
//               </p>

//               {/* Quick Navigation Buttons - Desktop */}
//               <div className="flex gap-4">
//                 <button
//                   onClick={handlePhotosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
//                 >
//                   <ImageIcon size={20} />
//                   <span>Browse Photos</span>
//                 </button>
//                 <button
//                   onClick={handleVideosNavigation}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
//                 >
//                   <Video size={20} />
//                   <span>Browse Videos</span>
//                 </button>
//               </div>
//             </div>

//             {/* Search & Filter - Right Side */}
//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   <TextField
//                     placeholder="Search gallery..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
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

//                   <div className="grid grid-cols-3 gap-3">
//                     <SelectField
//                       value={selectedCategory}
//                       onChange={handleCategoryChange}
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
//                       value={selectedType}
//                       onChange={handleTypeChange}
//                       options={typeOptions}
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
//                       onChange={handleDistrictChange}
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

//                   <div className="pt-4 border-t border-[#138808]/10">
//                     <span className="text-[#138808] font-medium">
//                       {filteredMedia.length} items found
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Gallery Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-red-500 mb-4" />
//             <p className="text-[#138808] text-lg font-medium">Failed to load gallery</p>
//           </div>
//         ) : filteredMedia.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Camera size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
//             <p className="text-[#138808] text-lg font-medium mb-2">No media found</p>
//             <button
//               onClick={handleClearFilters}
//               className="text-[#138808] underline font-medium"
//             >
//               Clear all filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredMedia.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 {/* Image/Video Container */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {item.fileType === 'video' ? (
//                     // Video thumbnail with play icon overlay
//                     <div className="relative w-full h-full">
//                       {item.thumbnailUrl && !imageErrors[item._id] ? (
//                         <>
//                           <img
//                             src={item.thumbnailUrl}
//                             alt={item.title}
//                             className="w-full h-full object-cover"
//                             onError={() => handleImageError(item._id)}
//                             loading="lazy"
//                           />
//                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
//                             <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                               <Video size={32} className="text-white" />
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#138808]/40 flex items-center justify-center">
//                           <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//                             <Video size={48} className="text-white" />
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : imageErrors[item._id] ? (
//                     // Fallback when image fails to load
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
//                       <ImageIcon size={64} className="text-[#138808] opacity-20" />
//                     </div>
//                   ) : (
//                     // Image display
//                     <img
//                       src={item.fileUrl}
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       onError={() => handleImageError(item._id)}
//                       loading="lazy"
//                     />
//                   )}
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-4 left-4">
//                     <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>

//                   {/* Video Badge */}
//                   {item.fileType === 'video' && (
//                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                       <Video size={14} />
//                       Video
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-6">
//                   {/* Title */}
//                   <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   {/* Description */}
//                   <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.description}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-2 text-[#138808] font-bold text-sm">
//                       <MapPin size={14} />
//                       <span className="font-medium line-clamp-1">
//                         {item.district?.name || 'Unknown'}
//                       </span>
//                     </div>
//                     {item.captureDate && (
//                       <div className="flex items-center gap-1.5 text-[#138808] font-semibold text-xs">
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
