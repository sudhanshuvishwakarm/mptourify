'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { Video, Search, MapPin, Calendar, Camera, Play, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function VideosPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { media, loading, error, lastFetched } = useSelector((state) => state.media);
  const { districts } = useSelector((state) => state.district);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // Smart useEffect with cache control
  useEffect(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
    // Only fetch media if it's empty or data is older than 1 hour
    if (media.length === 0 || !lastFetched || lastFetched < oneHourAgo) {
      dispatch(fetchMedia({ limit: 50, status: 'approved', fileType: 'video' }));
    }
    
    // Only fetch districts if empty
    if (districts.length === 0) {
      dispatch(fetchDistricts());
    }
  }, [dispatch, media.length, districts.length, lastFetched]);

  // Memoized district options
  const districtOptions = useMemo(() => [
    { value: 'all', label: 'All Districts' },
    ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
  ], [districts]);

  // Memoized filtered videos - only videos
  const filteredVideos = useMemo(() => {
    return media.filter(item => {
      // Filter for videos only
      if (item.fileType !== 'video') return false;
      if (item.status !== 'approved' && item.status !== undefined) return false;
      
      // Early return if search term doesn't match
      if (searchTerm && 
          !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
      
      return matchesCategory && matchesDistrict;
    });
  }, [media, selectedCategory, selectedDistrict, searchTerm]);

  const handleBackToGallery  = ()=>{
    router.push('/gallery');
  }

  // Memoized utility functions
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

  // Memoized event handlers
  const handleCardClick = useCallback((id) => {
    router.push(`/gallery/${id}`);
  }, [router]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDistrict('all');
  }, []);

  const handlePhotosNavigation = useCallback(() => {
    router.push('/gallery/photos');
  }, [router]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);

  const handleDistrictChange = useCallback((e) => {
    setSelectedDistrict(e.target.value);
  }, []);

  // Only show loader on initial load when there's no data
  const showLoader = loading && media.length === 0;

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header Section */}
      <div className="bg-[#138808]">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
          {/* Mobile & Tablet */}
          <div className="lg:hidden space-y-8">
            <div className="text-center">
              <button
              onClick={handleBackToGallery}
                         className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-lg mb-6"
                       >
                         <ArrowLeft size={22} />
                         Back to All Media Gallery
                       </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Video Stories
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                Experience Madhya Pradesh through captivating video stories
              </p>
            </div>

            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
              <div className="space-y-4">
                <TextField
                  placeholder="Search videos..."
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

                <div className="grid grid-cols-2 gap-3 mt-3">
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
              </div>

              <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
                <span className="text-[#138808] font-medium">
                  {filteredVideos.length} videos
                </span>
                <button
                  onClick={handlePhotosNavigation}
                  className="text-[#138808] font-medium hover:underline"
                >
                  View Photos →
                </button>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex justify-between items-center gap-12">
            <div className="flex-1 max-w-xl justify-center items-center">
               <button
               onClick={handleBackToGallery}
                         className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-lg mb-6"
                       >
                        
                         <ArrowLeft size={22} />
                         Back to All Media Gallery
                       </button>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Video Stories
              </h1>
              <p className="text-lg text-white/90">
                Experience Madhya Pradesh through captivating video stories
              </p>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                  <TextField
                    placeholder="Search videos..."
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

                  <div className="grid grid-cols-2 gap-3 mt-3">
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

                  <div className="pt-4 border-t border-[#138808]/10 flex items-center justify-between">
                    <span className="text-[#138808] font-medium">
                      {filteredVideos.length} videos found
                    </span>
                    <button
                      onClick={handlePhotosNavigation}
                      className="text-[#138808] font-medium hover:underline"
                    >
                      View Photos →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Video size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-[#138808] text-lg font-medium">Failed to load videos</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Video size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
            <p className="text-[#138808] text-lg font-medium mb-2">No videos found</p>
            <button
              onClick={handleClearFilters}
              className="text-[#138808] underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((item) => (
              <div
                key={item._id}
                onClick={() => handleCardClick(item._id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
              >
                {/* Video Container */}
                <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                  <div className="relative w-full h-full">
                    {item.thumbnailUrl && !imageErrors[item._id] ? (
                      <>
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={() => handleImageError(item._id)}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                            <Play size={32} className="text-white ml-1" />
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
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  {/* Video Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Video size={14} />
                    Video
                  </div>
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
// import { Video, Search, MapPin, Calendar, Play } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function VideosPage() {
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
//     dispatch(fetchMedia({ limit: 50, status: 'approved', fileType: 'video' }));
//     dispatch(fetchDistricts());
//   }, [dispatch]);

//   const districtOptions = [
//     { value: 'all', label: 'All Districts' },
//     ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
//   ];

//   // Dummy videos data
//   const dummyVideos = [
//     {
//       _id: 'video1',
//       title: 'Gond Tribal Dance Performance',
//       description: 'Traditional folk dance celebrating tribal heritage and culture',
//       fileUrl: 'https://example.com/video1.mp4',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
//       fileType: 'video',
//       category: 'cultural',
//       district: { _id: 'dist1', name: 'Mandla' },
//       captureDate: '2024-11-01',
//       photographer: 'RTC Team',
//       tags: ['dance', 'tribal']
//     },
//     {
//       _id: 'video2',
//       title: 'Village Market Activities',
//       description: 'Weekly market showcasing local produce and crafts',
//       fileUrl: 'https://example.com/video2.mp4',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
//       fileType: 'video',
//       category: 'event',
//       district: { _id: 'dist2', name: 'Sagar' },
//       captureDate: '2024-10-30',
//       photographer: 'RTC Team',
//       tags: ['market', 'village']
//     },
//     {
//       _id: 'video3',
//       title: 'Narmada Aarti Ceremony',
//       description: 'Evening prayer rituals on the sacred Narmada river',
//       fileUrl: 'https://example.com/video3.mp4',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
//       fileType: 'video',
//       category: 'cultural',
//       district: { _id: 'dist3', name: 'Jabalpur' },
//       captureDate: '2024-10-28',
//       photographer: 'RTC Team',
//       tags: ['ritual', 'narmada']
//     },
//     {
//       _id: 'video4',
//       title: 'Khajuraho Dance Festival',
//       description: 'Classical dance performances at the historic temple complex',
//       fileUrl: 'https://example.com/video4.mp4',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
//       fileType: 'video',
//       category: 'festival',
//       district: { _id: 'dist4', name: 'Chhatarpur' },
//       captureDate: '2024-11-03',
//       photographer: 'RTC Team',
//       tags: ['festival', 'dance']
//     },
//     {
//       _id: 'video5',
//       title: 'Pachmarhi Nature Trail',
//       description: 'Journey through the beautiful Satpura hill ranges',
//       fileUrl: 'https://example.com/video5.mp4',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
//       fileType: 'video',
//       category: 'natural',
//       district: { _id: 'dist5', name: 'Hoshangabad' },
//       captureDate: '2024-10-22',
//       photographer: 'RTC Team',
//       tags: ['nature', 'hills']
//     },
//     {
//       _id: 'video6',
//       title: 'Traditional Handicraft Making',
//       description: 'Artisans demonstrating age-old craft techniques',
//       fileUrl: 'https://example.com/video6.mp4',
//       thumbnailUrl: 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=400',
//       fileType: 'video',
//       category: 'cultural',
//       district: { _id: 'dist6', name: 'Indore' },
//       captureDate: '2024-11-06',
//       photographer: 'RTC Team',
//       tags: ['craft', 'handicraft']
//     }
//   ];

//   const displayVideos = media.length > 0 ? media.filter(m => m.fileType === 'video') : dummyVideos;

//   const filteredVideos = displayVideos.filter(item => {
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
//                 <Video size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Video Gallery</span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 Stories in Motion
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Experience Madhya Pradesh through moving images
//               </p>
//             </div>

//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search videos..."
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
//                   {filteredVideos.length} videos
//                 </span>
//                 <button
//                   onClick={() => router.push('/gallery/photos')}
//                   className="text-[#138808] font-medium hover:underline"
//                 >
//                   View Photos →
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Desktop */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Video size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">Video Gallery</span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 Stories in Motion
//               </h1>
//               <p className="text-lg text-white/90">
//                 Experience Madhya Pradesh through moving images
//               </p>
//             </div>

//             <div className="flex-1 max-w-2xl">
//               <div className="bg-white rounded-2xl shadow-lg p-6">
//                 <div className="space-y-4">
//                   <TextField
//                     placeholder="Search videos..."
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
//                       {filteredVideos.length} videos found
//                     </span>
//                     <button
//                       onClick={() => router.push('/gallery/photos')}
//                       className="text-[#138808] font-medium hover:underline"
//                     >
//                       View Photos →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Videos Grid */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {error ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Video size={48} className="mx-auto text-red-500 mb-4" />
//             <p className="text-[#138808] text-lg font-medium">Failed to load videos</p>
//           </div>
//         ) : filteredVideos.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <Video size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
//             <p className="text-[#138808] text-lg font-medium mb-2">No videos found</p>
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
//             {filteredVideos.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item._id)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 <div className="h-52 bg-gradient-to-br from-[#138808]/20 to-[#138808]/40 relative overflow-hidden">
//                   {item.thumbnailUrl ? (
//                     <div className="relative w-full h-full">
//                       <img
//                         src={item.thumbnailUrl}
//                         alt={item.title}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         onError={(e) => {
//                           e.target.style.display = 'none';
//                         }}
//                       />
//                       <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
//                         <div className="relative">
//                           <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
//                           <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
//                             <Play size={32} className="text-[#138808]" fill="#138808" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <div className="relative">
//                         <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
//                         <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
//                           <Play size={32} className="text-[#138808]" fill="#138808" />
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="absolute top-4 left-4">
//                     <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>

//                   <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                     <Video size={14} />
//                     Video
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