'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchNews } from '@/redux/slices/newsSlice';
import { Calendar, Clock, ArrowRight, Search, Tag, Newspaper, ChevronDown } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import Loader from '@/components/ui/Loader';

export default function NewsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { news, loading, error, lastFetched } = useSelector((state) => state.news);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    if (category === 'all') {
      // Already on all category
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

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

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

  // Get current category label
  const currentCategoryLabel = useMemo(() => {
    return categoryOptions.find(option => option.value === selectedCategory)?.label || 'All Categories';
  }, [selectedCategory, categoryOptions]);

  // Only show loader on initial load when there's no data
  const showLoader = loading && news.length === 0;

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Green Header with White Text */}
      
      <div className="bg-[#117307] relative ">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
  </div>
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

                {/* Custom Dropdown */}
                <div className="relative bg-white">
                  <button
                    onClick={toggleDropdown}
                    className="w-full mt-2 flex items-center justify-between px-4 py-3 border-2 border-[#117307] rounded-lg text-[#117307] font-medium bg-white  transition-colors"
                  >
                    <span>{currentCategoryLabel}</span>
                    <ChevronDown 
                      size={20} 
                      className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleCategoryClick(option.value)}
                          className={`w-full text-left px-4 py-3 hover:bg-[#f5fbf2] transition-colors ${
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
              </div>

              {/* Stats Bar */}
              <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
                <span className="text-[#117307] font-medium">
                  Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
                </span>
                <div className="flex items-center gap-2 text-[#117307]/60">
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
                  </div>

                  {/* Custom Dropdown - 30% width */}
                  <div className="w-[30%] relative bg-white">
                    <button
                      onClick={toggleDropdown}
                      className="w-full flex items-center justify-between px-3 py-3 border-2 border-[#117307] rounded-md text-[#117307] font-medium md:h-14 bg-white  transition-colors text-sm"
                    >
                      <span className="truncate">{currentCategoryLabel}</span>
                      <ChevronDown 
                        size={16} 
                        className={`flex-shrink-0 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#117307] rounded-lg shadow-lg overflow-hidden">
                        {categoryOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleCategoryClick(option.value)}
                            className={`w-full text-left px-3 py-2 hover:bg-[#f5fbf2] md:font-semibold transition-colors text-sm ${
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
                </div>

                {/* Stats Bar */}
                <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
                  <span className="text-[#117307] font-medium">
                    Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
                  </span>
                  <div className="flex items-center gap-2 text-[#117307] font-medium">
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
            <p className="text-[#117307] text-lg font-medium">Failed to load news. Please try again.</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
              <Newspaper size={32} className="text-[#117307]" />
            </div>
            <p className="text-[#117307] text-lg font-medium">No news found matching your criteria.</p>
            <button 
              onClick={handleClearFilters}
              className="mt-4 text-[#117307] underline font-medium"
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
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
              >
                {/* Image */}
                <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#117307]/5"><svg class="w-20 h-20 text-[#117307] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#117307]/5">
                      <Newspaper size={64} className="text-[#117307] opacity-20" />
                    </div>
                  )}
                </div>

                {/* <div className="p-6">
                
<div className="flex items-center gap-2 text-[#5f6f61] font-medium text-sm mb-3">
  <Calendar size={14} />
  <span>
    {new Date(item.createdAt).toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}
  </span>
</div>


<h3 className="text-xl font-bold text-[#0d4d03] mb-3 
               line-clamp-2 leading-tight 
               group-hover:text-[#0a3a02] transition-colors">
  {item.title}
</h3>
<p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
  {item.excerpt}
</p>
<div className="flex justify-between items-center pt-4 border-t border-[#117307]/10">
  <span className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
    {getCategoryLabel(item.category)}
  </span>

  <div className="flex items-center gap-1.5 text-[#0d4d03] font-semibold text-sm">
    Read More
    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
  </div>
</div>

                </div> */}
                
                <div className="p-6">

  {/* Date */}
  <div className="flex items-center gap-2 text-[#4d674f] font-medium text-sm mb-3">
    <Calendar size={14} className="text-[#1a5e10]" />
    <span>
      {new Date(item.createdAt).toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}
    </span>
  </div>

  {/* Title */}
  <h3 className="text-xl font-bold text-[#0d4d03] mb-3 
                 line-clamp-2 leading-tight 
                 group-hover:text-[#0a3a02] transition-colors">
    {item.title}
  </h3>

  {/* Excerpt */}
  <p className="text-[#1a5e10] font-medium text-sm leading-relaxed mb-4 line-clamp-3">
    {item.excerpt}
  </p>

  {/* Footer */}
  <div className="flex justify-between items-center pt-4 border-t border-[#117307]/15">

    {/* Category */}
    <span className="flex items-center gap-1.5 text-[#1a5e10] font-semibold text-sm">
      {getCategoryLabel(item.category)}
    </span>

    {/* Read More */}
    <div className="flex items-center gap-1.5 text-[#0d4d03] font-bold text-sm">
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

// import { useState, useEffect, useMemo, useCallback } from 'react';
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
//   const { news, loading, error, lastFetched } = useSelector((state) => state.news);
  
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');

//   // Memoized category options
//   const categoryOptions = useMemo(() => [
//     { value: 'all', label: 'All Categories' },
//     { value: 'media_coverage', label: 'Media Coverage' },
//     { value: 'press_release', label: 'Press Release' },
//     { value: 'announcement', label: 'Announcement' },
//     { value: 'update', label: 'Update' }
//   ], []);

//   // Smart useEffect with cache control
//   useEffect(() => {
//     const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour cache
    
//     // Only fetch news if it's empty or data is older than 1 hour
//     if (news.length === 0 || !lastFetched || lastFetched < oneHourAgo) {
//       dispatch(fetchNews({ limit: 20 }));
//     }
//   }, [dispatch, news.length, lastFetched]);

//   // Memoized event handlers
//   const handleCardClick = useCallback((slug) => {
//     router.push(`/news/${slug}`);
//   }, [router]);

//   const handleCategoryClick = useCallback((category) => {
//     if (category === 'all') {
//       setSelectedCategory('all');
//     } else {
//       router.push(`/news/category/${category}`);
//     }
//   }, [router]);

//   const handleClearFilters = useCallback(() => {
//     setSearchTerm('');
//     setSelectedCategory('all');
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     setSearchTerm(e.target.value);
//   }, []);

//   const handleCategoryChange = useCallback((e) => {
//     handleCategoryClick(e.target.value);
//   }, [handleCategoryClick]);

//   // Memoized filtered news
//   const filteredNews = useMemo(() => {
//     return news.filter(item => {
//       if (item.status !== 'published') return false;
      
//       // Early return if search term doesn't match
//       if (searchTerm && 
//           !item.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
//           !item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }
      
//       const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
//       return matchesCategory;
//     });
//   }, [news, selectedCategory, searchTerm]);

//   // Memoized utility function
//   const getCategoryLabel = useCallback((category) => {
//     const map = {
//       'media_coverage': 'Media Coverage',
//       'press_release': 'Press Release',
//       'announcement': 'Announcement',
//       'update': 'Update'
//     };
//     return map[category] || category;
//   }, []);

//   // Only show loader on initial load when there's no data
//   const showLoader = loading && news.length === 0;

//   if (showLoader) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Green Header with White Text */}
//       <div className="bg-[#117307]">
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
//                   onChange={handleSearchChange}
//                   fullWidth
//                   startIcon={<Search size={20} className="text-[#117307]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#117307',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiInputBase-input': {
//                       color: '#117307',
//                       fontWeight: 500
//                     }
//                   }}
//                 />

//                 <SelectField
//                   value={selectedCategory}
//                   onChange={handleCategoryChange}
//                   options={categoryOptions}
//                   fullWidth
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#117307',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiSelect-select': {
//                       color: '#117307',
//                       fontWeight: 500
//                     }
//                   }}
//                 />
//               </div>

//               {/* Stats Bar */}
//               <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#117307] font-medium">
//                   Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
//                 </span>
//                 <div className="flex items-center gap-2 text-[#117307]/60">
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
//                           }
//                         },
//                         '& .MuiInputBase-input': {
//                           color: '#117307',
//                           fontWeight: 500
//                         }
//                       }}
//                     />
//                   </div>

//                   {/* Category - 30% width */}
//                   <div className="w-[30%]">
//                     <SelectField
//                       value={selectedCategory}
//                       onChange={handleCategoryChange}
//                       options={categoryOptions}
//                       fullWidth
//                       sx={{
//       '& .MuiOutlinedInput-root': {
//         '& fieldset': {
//           borderColor: '#117307',
//           borderWidth: '2px',
//         },
//         '&:hover fieldset': {
//           borderColor: '#117307',
//         },
//         '&.Mui-focused fieldset': {
//           borderColor: '#117307',
//           borderWidth: '2px',
//         }
//       },
//       '& .MuiSelect-select': {
//         color: '#117307',
//         fontWeight: 500,
//       }
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* Stats Bar */}
//                 <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                   <span className="text-[#117307] font-medium">
//                     Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
//                   </span>
//                   <div className="flex items-center gap-2 text-[#117307] font-medium">
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
//             <p className="text-[#117307] text-lg font-medium">Failed to load news. Please try again.</p>
//           </div>
//         ) : filteredNews.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
//               <Newspaper size={32} className="text-[#117307]" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium">No news found matching your criteria.</p>
//             <button 
//               onClick={handleClearFilters}
//               className="mt-4 text-[#117307] underline font-medium"
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
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
//               >
//                 {/* Image */}
//                 <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
//                   {item.featuredImage ? (
//                     <img
//                       src={item.featuredImage}
//                       alt={item.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#117307]/5"><svg class="w-20 h-20 text-[#117307] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#117307]/5">
//                       <Newspaper size={64} className="text-[#117307] opacity-20" />
//                     </div>
//                   )}
                  
//                   {/* Category Badge on Image */}
//                   <div className="absolute top-4 left-4">
//                     <span className="bg-[#117307] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   {/* Date */}
//                   <div className="flex items-center gap-2 text-[#117307] font-bold text-sm mb-3">
//                     <Calendar size={14} />
//                     <span className="font-medium">
//                       {new Date(item.createdAt).toLocaleDateString('en-US', { 
//                         month: 'long', 
//                         day: 'numeric', 
//                         year: 'numeric' 
//                       })}
//                     </span>
//                   </div>

//                   {/* Title */}
//                   <h3 className="text-xl font-bold text-[#117307] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   {/* Excerpt */}
//                   <p className="text-[#117307]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.excerpt}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#117307]/10">
//                     <div className="flex items-center gap-2 text-[#117307]/60 text-xs">
//                       <span>By {item.author?.name || 'Admin'}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5 text-[#117307] font-bold text-sm group-hover:gap-3 transition-all">
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
//       <div className="bg-[#117307]">
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
//                   startIcon={<Search size={20} className="text-[#117307]" />}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       '& fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#117307',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiInputBase-input': {
//                       color: '#117307',
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
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       },
//                       '&:hover fieldset': {
//                         borderColor: '#117307',
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: '#117307',
//                         borderWidth: '2px',
//                       }
//                     },
//                     '& .MuiSelect-select': {
//                       color: '#117307',
//                       fontWeight: 500
//                     }
//                   }}
//                 />
//               </div>

//               {/* Stats Bar */}
//               <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                 <span className="text-[#117307] font-medium">
//                   Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
//                 </span>
//                 <div className="flex items-center gap-2 text-[#117307]/60">
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
//                           }
//                         },
//                         '& .MuiInputBase-input': {
//                           color: '#117307',
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
//                             borderColor: '#117307',
//                             borderWidth: '2px',
//                           },
//                           '&:hover fieldset': {
//                             borderColor: '#117307',
//                           },
//                           '&.Mui-focused fieldset': {
//                             borderColor: '#117307',
//                             borderWidth: '2px',
//                           }
//                         },
//                         '& .MuiSelect-select': {
//                           color: '#117307',
//                           fontWeight: 500
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* Stats Bar */}
//                 <div className="mt-4 pt-4 border-t border-[#117307]/10 flex items-center justify-between text-sm">
//                   <span className="text-[#117307] font-medium">
//                     Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
//                   </span>
//                   <div className="flex items-center gap-2 text-[#117307] font-medium">
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
//             <p className="text-[#117307] text-lg font-medium">Failed to load news. Please try again.</p>
//           </div>
//         ) : filteredNews.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#117307]/10 rounded-full mb-4">
//               <Newspaper size={32} className="text-[#117307]" />
//             </div>
//             <p className="text-[#117307] text-lg font-medium">No news found matching your criteria.</p>
//             <button 
//               onClick={() => {
//                 setSearchTerm('');
//                 setSelectedCategory('all');
//               }}
//               className="mt-4 text-[#117307] underline font-medium"
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
//                 className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#117307]"
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
//                         e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#117307]/5"><svg class="w-20 h-20 text-[#117307] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 flex items-center justify-center bg-[#117307]/5">
//                       <Newspaper size={64} className="text-[#117307] opacity-20" />
//                     </div>
//                   )}
                  
//                   {/* Category Badge on Image */}
//                   <div className="absolute top-4 left-4">
//                     <span className="bg-[#117307] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
//                       {getCategoryLabel(item.category)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   {/* Date */}
             

//                   {/* Title */}
//                   <h3 className="text-xl font-bold text-[#117307] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
//                     {item.title}
//                   </h3>

//                   {/* Excerpt */}
//                   <p className="text-[#117307]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
//                     {item.excerpt}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center pt-4 border-t border-[#117307]/10">
//                     <div className="flex items-center gap-2 text-[#117307]/60 text-xs">
//                           <div className="flex items-center gap-2 text-[#117307] font-bold text-sm mb-3">
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
//                     <div className="flex items-center gap-1.5 text-[#117307] font-bold text-sm group-hover:gap-3 transition-all">
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
