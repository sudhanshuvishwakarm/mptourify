'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { Image as ImageIcon, Video, Search, MapPin, Calendar, Camera } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function GalleryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { media, loading, error } = useSelector((state) => state.media);
  const { districts } = useSelector((state) => state.district);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});

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

  useEffect(() => {
    dispatch(fetchMedia({ limit: 50, status: 'approved' }));
    dispatch(fetchDistricts());
  }, [dispatch]);

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

  // Memoized filtered media
  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      if (item.status !== 'approved' && item.status !== undefined) return false;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesType = selectedType === 'all' || item.fileType === selectedType;
      const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesType && matchesDistrict && matchesSearch;
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
  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);

  // Memoized type change handler
  const handleTypeChange = useCallback((e) => {
    setSelectedType(e.target.value);
  }, []);

  // Memoized district change handler
  const handleDistrictChange = useCallback((e) => {
    setSelectedDistrict(e.target.value);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header Section */}
      <div className="bg-[#138808]">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
          {/* Mobile & Tablet: Stack layout */}
          <div className="lg:hidden space-y-8">
            {/* Header Content */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Camera size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">
                  Media Gallery
                </span>
              </div>
              
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
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  <ImageIcon size={16} />
                  <span>Photos</span>
                </button>
                <button
                  onClick={handleVideosNavigation}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  <Video size={16} />
                  <span>Videos</span>
                </button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
              <div className="space-y-4">
                <TextField
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  fullWidth
                  startIcon={<Search size={20} className="text-[#138808]" />}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#138808',
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#138808',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#138808',
                        borderWidth: '2px',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#138808',
                      fontWeight: 500
                    }
                  }}
                />

                <div className="grid grid-cols-1 gap-3">
                  <SelectField
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#138808' },
                        '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                      },
                      '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
                    }}
                  />

                  <SelectField
                    value={selectedType}
                    onChange={handleTypeChange}
                    options={typeOptions}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#138808' },
                        '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                      },
                      '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
                    }}
                  />

                  <SelectField
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    options={districtOptions}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#138808' },
                        '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                      },
                      '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
                    }}
                  />
                </div>

                <div className="pt-4 border-t border-[#138808]/10">
                  <span className="text-[#138808] font-medium text-sm">
                    {filteredMedia.length} items found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Side by side layout */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            {/* Header Content - Left Side */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Camera size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">
                  Media Gallery
                </span>
              </div>
              
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
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  <ImageIcon size={20} />
                  <span>Browse Photos</span>
                </button>
                <button
                  onClick={handleVideosNavigation}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
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
                    startIcon={<Search size={20} className="text-[#138808]" />}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                        '&:hover fieldset': { borderColor: '#138808' },
                        '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                      },
                      '& .MuiInputBase-input': { color: '#138808', fontWeight: 500 }
                    }}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <SelectField
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#138808' },
                          '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                        },
                        '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
                      }}
                    />

                    <SelectField
                      value={selectedType}
                      onChange={handleTypeChange}
                      options={typeOptions}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#138808' },
                          '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                        },
                        '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
                      }}
                    />

                    <SelectField
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      options={districtOptions}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#138808', borderWidth: '2px' },
                          '&:hover fieldset': { borderColor: '#138808' },
                          '&.Mui-focused fieldset': { borderColor: '#138808', borderWidth: '2px' }
                        },
                        '& .MuiSelect-select': { color: '#138808', fontWeight: 500 }
                      }}
                    />
                  </div>

                  <div className="pt-4 border-t border-[#138808]/10">
                    <span className="text-[#138808] font-medium">
                      {filteredMedia.length} items found
                    </span>
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
            <p className="text-[#138808] text-lg font-medium">Failed to load gallery</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Camera size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
            <p className="text-[#138808] text-lg font-medium mb-2">No media found</p>
            <button
              onClick={handleClearFilters}
              className="text-[#138808] underline font-medium"
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
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
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
                            className="w-full h-full object-cover"
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
                        <div className="absolute inset-0 bg-gradient-to-br from-[#138808]/20 to-[#138808]/40 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <Video size={48} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : imageErrors[item._id] ? (
                    // Fallback when image fails to load
                    <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
                      <ImageIcon size={64} className="text-[#138808] opacity-20" />
                    </div>
                  ) : (
                    // Image display
                    <img
                      src={item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(item._id)}
                      loading="lazy"
                    />
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  {/* Video Badge */}
                  {item.fileType === 'video' && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Video size={14} />
                      Video
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
                    <div className="flex items-center gap-2 text-[#138808] font-bold text-sm">
                      <MapPin size={14} />
                      <span className="font-medium line-clamp-1">
                        {item.district?.name || 'Unknown'}
                      </span>
                    </div>
                    {item.captureDate && (
                      <div className="flex items-center gap-1.5 text-[#138808] font-semibold text-xs">
                        <Calendar size={14} />
                        <span>
                          {new Date(item.captureDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}// 'use client';

// import { useState, useEffect } from 'react';
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
//   const { media, loading, error } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedType, setSelectedType] = useState('all');
//   const [selectedDistrict, setSelectedDistrict] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [imageErrors, setImageErrors] = useState({});

//   const categoryOptions = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'heritage', label: 'Heritage' },
//     { value: 'natural', label: 'Natural' },
//     { value: 'cultural', label: 'Cultural' },
//     { value: 'event', label: 'Events' },
//     { value: 'festival', label: 'Festivals' }
//   ];

//   const typeOptions = [
//     { value: 'all', label: 'All Media' },
//     { value: 'image', label: 'Photos' },
//     { value: 'video', label: 'Videos' }
//   ];

//   useEffect(() => {
//     dispatch(fetchMedia({ limit: 50, status: 'approved' }));
//     dispatch(fetchDistricts());
//   }, [dispatch]);

//   const districtOptions = [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ];

//   // Handle image loading errors
//   const handleImageError = (itemId) => {
//     setImageErrors(prev => ({
//       ...prev,
//       [itemId]: true
//     }));
//   };

//   const filteredMedia = media.filter(item => {
//     if (item.status !== 'approved' && item.status !== undefined) return false;
//     const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//     const matchesType = selectedType === 'all' || item.fileType === selectedType;
//     const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
//     const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
//     return matchesCategory && matchesType && matchesDistrict && matchesSearch;
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
//                   onClick={() => router.push('/gallery/photos')}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all"
//                 >
//                   <ImageIcon size={16} />
//                   <span>Photos</span>
//                 </button>
//                 <button
//                   onClick={() => router.push('/gallery/videos')}
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
//                   onChange={(e) => setSearchTerm(e.target.value)}
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
//                     value={selectedType}
//                     onChange={(e) => setSelectedType(e.target.value)}
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
//                   onClick={() => router.push('/gallery/photos')}
//                   className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all"
//                 >
//                   <ImageIcon size={20} />
//                   <span>Browse Photos</span>
//                 </button>
//                 <button
//                   onClick={() => router.push('/gallery/videos')}
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

//                   <div className="grid grid-cols-3 gap-3">
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
//                       value={selectedType}
//                       onChange={(e) => setSelectedType(e.target.value)}
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
//               onClick={() => {
//                 setSearchTerm('');
//                 setSelectedCategory('all');
//                 setSelectedType('all');
//                 setSelectedDistrict('all');
//               }}
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
