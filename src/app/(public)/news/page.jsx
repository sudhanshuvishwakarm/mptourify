'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchNews } from '@/redux/slices/newsSlice';
import { Calendar, Clock, ArrowRight, Search, Tag, Newspaper } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function NewsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { news, loading, error, lastFetched } = useSelector((state) => state.news);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized category options
  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    { value: 'media_coverage', label: 'Media Coverage' },
    { value: 'press_release', label: 'Press Release' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'update', label: 'Update' }
  ], []);

  // Smart useEffect with cache control
  useEffect(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
    // Only fetch news if it's empty or data is older than 1 hour
    if (news.length === 0 || !lastFetched || lastFetched < oneHourAgo) {
      dispatch(fetchNews({ limit: 20 }));
    }
  }, [dispatch, news.length, lastFetched]);

  // Memoized event handlers
  const handleCardClick = useCallback((slug) => {
    router.push(`/news/${slug}`);
  }, [router]);

  const handleCategoryClick = useCallback((category) => {
    if (category === 'all') {
      setSelectedCategory('all');
    } else {
      router.push(`/news/category/${category}`);
    }
  }, [router]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    handleCategoryClick(e.target.value);
  }, [handleCategoryClick]);

  // Memoized filtered news
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      if (item.status !== 'published') return false;
      
      // Early return if search term doesn't match
      if (searchTerm && 
          !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesCategory;
    });
  }, [news, selectedCategory, searchTerm]);

  // Memoized utility function
  const getCategoryLabel = useCallback((category) => {
    const map = {
      'media_coverage': 'Media Coverage',
      'press_release': 'Press Release',
      'announcement': 'Announcement',
      'update': 'Update'
    };
    return map[category] || category;
  }, []);

  // Only show loader on initial load when there's no data
  const showLoader = loading && news.length === 0;

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Green Header with White Text */}
      <div className="bg-[#138808]">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
          {/* Mobile & Tablet: Stack layout */}
          <div className="lg:hidden space-y-8">
            {/* Header Content */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Newspaper size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">
                  Latest Updates
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                News & Announcements
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                Stay informed with the latest developments and updates
              </p>
            </div>

            {/* Search & Filter - Stacked on mobile */}
            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
              <div className="space-y-4">
                <TextField
                  placeholder="Search news articles..."
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

                <SelectField
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  fullWidth
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
                    '& .MuiSelect-select': {
                      color: '#138808',
                      fontWeight: 500
                    }
                  }}
                />
              </div>

              {/* Stats Bar */}
              <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
                <span className="text-[#138808] font-medium">
                  Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
                </span>
                <div className="flex items-center gap-2 text-[#138808]/60">
                  <Clock size={16} />
                  <span>Updated daily</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Side by side layout */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            {/* Header Content - Left Side */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Newspaper size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">
                  Latest Updates
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                News & Announcements
              </h1>
              <p className="text-lg text-white/90">
                Stay informed with the latest developments and updates
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
                      placeholder="Search news articles..."
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
                  </div>

                  {/* Category - 30% width */}
                  <div className="w-[30%]">
                    <SelectField
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      fullWidth
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
      '& .MuiSelect-select': {
        color: '#138808',
        fontWeight: 500,
      }
                      }}
                    />
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
                  <span className="text-[#138808] font-medium">
                    Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
                  </span>
                  <div className="flex items-center gap-2 text-[#138808] font-medium">
                    <Clock size={16} />
                    <span>Updated daily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
              <Tag size={32} className="text-red-500" />
            </div>
            <p className="text-[#138808] text-lg font-medium">Failed to load news. Please try again.</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#138808]/10 rounded-full mb-4">
              <Newspaper size={32} className="text-[#138808]" />
            </div>
            <p className="text-[#138808] text-lg font-medium">No news found matching your criteria.</p>
            <button 
              onClick={handleClearFilters}
              className="mt-4 text-[#138808] underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <div
                key={item._id}
                onClick={() => handleCardClick(item.slug)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
              >
                {/* Image */}
                <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#138808]/5"><svg class="w-20 h-20 text-[#138808] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
                      <Newspaper size={64} className="text-[#138808] opacity-20" />
                    </div>
                  )}
                  
                  {/* Category Badge on Image */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#138808] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-[#138808] font-bold text-sm mb-3">
                    <Calendar size={14} />
                    <span className="font-medium">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
                    <div className="flex items-center gap-2 text-[#138808]/60 text-xs">
                      <span>By {item.author?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#138808] font-bold text-sm group-hover:gap-3 transition-all">
                      Read More
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

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { fetchNews } from '@/redux/slices/newsSlice';
// import { Calendar, Clock, ArrowRight, Search, Tag, Newspaper } from 'lucide-react';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function NewsPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { news, loading, error } = useSelector((state) => state.news);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');

//   const categoryOptions = [
//     { value: 'all', label: 'All Categories' },
//     { value: 'media_coverage', label: 'Media Coverage' },
//     { value: 'press_release', label: 'Press Release' },
//     { value: 'announcement', label: 'Announcement' },
//     { value: 'update', label: 'Update' }
//   ];

//   useEffect(() => {
//     dispatch(fetchNews({ limit: 20 }));
//   }, [dispatch]);

//   const handleCardClick = (slug) => {
//     router.push(`/news/${slug}`);
//   };

//   const handleCategoryClick = (category) => {
//     if (category === 'all') {
//       setSelectedCategory('all');
//     } else {
//       router.push(`/news/category/${category}`);
//     }
//   };

//   // Dummy data shown only if no real data
//   const dummyNews = [
//     {
//       _id: 'dummy1',
//       title: 'MP Tourify Launched on Madhya Pradesh Sthapna Diwas',
//       slug: 'mp-tourify-launched-madhya-pradesh',
//       excerpt: 'A new digital initiative to document and promote every district and gram panchayat of Madhya Pradesh was officially launched on November 1st.',
//       featuredImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
//       category: 'announcement',
//       author: { name: 'MP Tourism Department' },
//       createdAt: '2024-11-01',
//       views: 1250,
//       status: 'published',
//       tags: ['Launch', 'Digital Initiative', 'Tourism']
//     },
//     {
//       _id: 'dummy2',
//       title: 'RTC Teams Begin Comprehensive Panchayat Survey Across State',
//       slug: 'rtc-teams-begin-panchayat-survey',
//       excerpt: 'Regional Tourism Coordinators have commenced field surveys to document cultural heritage, natural beauty, and local traditions across all panchayats.',
//       featuredImage: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
//       category: 'update',
//       author: { name: 'RTC Team' },
//       createdAt: '2024-11-05',
//       views: 890,
//       status: 'published',
//       tags: ['Survey', 'RTC', 'Heritage']
//     }
//   ];

//   const displayNews = news.length > 0 ? news : dummyNews;

//   const filteredNews = displayNews.filter(item => {
//     if (item.status !== 'published') return false;
//     const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//     const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   const getCategoryLabel = (category) => {
//     const map = {
//       'media_coverage': 'Media Coverage',
//       'press_release': 'Press Release',
//       'announcement': 'Announcement',
//       'update': 'Update'
//     };
//     return map[category] || category;
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Green Header with White Text */}
//       <div className="bg-[#138808]">
//         <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
//           {/* Mobile & Tablet: Stack layout */}
//           <div className="lg:hidden space-y-8">
//             {/* Header Content */}
//             <div className="text-center">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Newspaper size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Latest Updates
//                 </span>
//               </div>
              
//               <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                 News & Announcements
//               </h1>
//               <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
//                 Stay informed with the latest developments and updates
//               </p>
//             </div>

//             {/* Search & Filter - Stacked on mobile */}
//             <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
//               <div className="space-y-4">
//                 <TextField
//                   placeholder="Search news articles..."
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

//                 <SelectField
//                   value={selectedCategory}
//                   onChange={(e) => handleCategoryClick(e.target.value)}
//                   options={categoryOptions}
//                   fullWidth
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
//                     '& .MuiSelect-select': {
//                       color: '#138808',
//                       fontWeight: 500
//                     }
//                   }}
//                 />
//               </div>

//               {/* Stats Bar */}
//               <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#138808] font-medium">
//                   Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
//                 </span>
//                 <div className="flex items-center gap-2 text-[#138808]/60">
//                   <Clock size={16} />
//                   <span>Updated daily</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Desktop: Side by side layout */}
//           <div className="hidden lg:flex justify-between items-start gap-12">
//             {/* Header Content - Left Side */}
//             <div className="flex-1 max-w-xl">
//               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
//                 <Newspaper size={18} className="text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Latest Updates
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
//                 News & Announcements
//               </h1>
//               <p className="text-lg text-white/90">
//                 Stay informed with the latest developments and updates
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
//                       placeholder="Search news articles..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       fullWidth
//                       startIcon={<Search size={20} className="text-[#138808]" />}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': {
//                             borderColor: '#138808',
//                             borderWidth: '2px',
//                           },
//                           '&:hover fieldset': {
//                             borderColor: '#138808',
//                           },
//                           '&.Mui-focused fieldset': {
//                             borderColor: '#138808',
//                             borderWidth: '2px',
//                           }
//                         },
//                         '& .MuiInputBase-input': {
//                           color: '#138808',
//                           fontWeight: 500
//                         }
//                       }}
//                     />
//                   </div>

//                   {/* Category - 30% width */}
//                   <div className="w-[30%]">
//                     <SelectField
//                       value={selectedCategory}
//                       onChange={(e) => handleCategoryClick(e.target.value)}
//                       options={categoryOptions}
//                       fullWidth
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           '& fieldset': {
//                             borderColor: '#138808',
//                             borderWidth: '2px',
//                           },
//                           '&:hover fieldset': {
//                             borderColor: '#138808',
//                           },
//                           '&.Mui-focused fieldset': {
//                             borderColor: '#138808',
//                             borderWidth: '2px',
//                           }
//                         },
//                         '& .MuiSelect-select': {
//                           color: '#138808',
//                           fontWeight: 500
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* Stats Bar */}
//                 <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
//                   <span className="text-[#138808] font-medium">
//                     Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
//                   </span>
//                   <div className="flex items-center gap-2 text-[#138808] font-medium">
//                     <Clock size={16} />
//                     <span>Updated daily</span>
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
//               <Tag size={32} className="text-red-500" />
//             </div>
//             <p className="text-[#138808] text-lg font-medium">Failed to load news. Please try again.</p>
//           </div>
//         ) : filteredNews.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#138808]/10 rounded-full mb-4">
//               <Newspaper size={32} className="text-[#138808]" />
//             </div>
//             <p className="text-[#138808] text-lg font-medium">No news found matching your criteria.</p>
//             <button 
//               onClick={() => {
//                 setSearchTerm('');
//                 setSelectedCategory('all');
//               }}
//               className="mt-4 text-[#138808] underline font-medium"
//             >
//               Clear filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredNews.map((item) => (
//               <div
//                 key={item._id}
//                 onClick={() => handleCardClick(item.slug)}
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
//               >
//                 {/* Image */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {item.featuredImage ? (
//                     <img
//                       src={item.featuredImage}
//                       alt={item.title}
//                       className="w-full h-full object-cover  transition-transform duration-500"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#138808]/5"><svg class="w-20 h-20 text-[#138808] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#138808]/5">
//                       <Newspaper size={64} className="text-[#138808] opacity-20" />
//                     </div>
//                   )}
                  
//                   {/* Category Badge on Image */}
//                   <div className="absolute top-4 left-4">
//                     <span className="bg-[#138808] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   {/* Date */}
             

//                   {/* Title */}
//                   <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   {/* Excerpt */}
//                   <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.excerpt}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-2 text-[#138808]/60 text-xs">
//                           <div className="flex items-center gap-2 text-[#138808] font-bold text-sm mb-3">
//                     <Calendar size={14} />
//                     <span className="font-medium">
//                       {new Date(item.createdAt).toLocaleDateString('en-US', { 
//                         month: 'long', 
//                         day: 'numeric', 
//                         year: 'numeric' 
//                       })}
//                     </span>
//                   </div>
//                     </div>
//                     <div className="flex items-center gap-1.5 text-[#138808] font-bold text-sm group-hover:gap-3 transition-all">
//                       Read More
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
