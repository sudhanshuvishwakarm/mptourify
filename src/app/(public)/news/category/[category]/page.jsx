'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchNews } from '@/redux/slices/newsSlice';
import { Calendar, Clock, ArrowRight, Search, Tag, Newspaper, ArrowLeft, Filter } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import Loader from '@/components/ui/Loader';

export default function NewsCategoryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { news, loading, error } = useSelector((state) => state.news);
  
  const [searchTerm, setSearchTerm] = useState('');

  const categoryInfo = {
    'media_coverage': {
      label: 'Media Coverage',
      description: 'See how MP Tourify is featured in news outlets and media publications',
      icon: '📰',
      lightColor: 'bg-blue-50'
    },
    'press_release': {
      label: 'Press Releases',
      description: 'Official press releases and statements from MP Tourify',
      icon: '📢',
      lightColor: 'bg-purple-50'
    },
    'announcement': {
      label: 'Announcements',
      description: 'Important announcements and updates about the platform',
      icon: '📣',
      lightColor: 'bg-[#f5fbf2]'
    },
    'update': {
      label: 'Updates',
      description: 'Latest updates, improvements, and new features',
      icon: '🔔',
      lightColor: 'bg-orange-50'
    }
  };

  const currentCategory = params.category;
  const categoryData = categoryInfo[currentCategory] || categoryInfo['announcement'];

  // Dummy data for fallback
  const dummyNews = [
    {
      _id: 'dummy1',
      title: 'MP Tourify Launched on Madhya Pradesh Sthapna Diwas',
      slug: 'mp-tourify-launched-madhya-pradesh',
      excerpt: 'A new digital initiative to document and promote every district and gram panchayat of Madhya Pradesh was officially launched on November 1st.',
      featuredImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      category: 'announcement',
      author: { name: 'MP Tourism Department' },
      createdAt: '2024-11-01',
      views: 1250,
      status: 'published',
      tags: ['Launch', 'Digital Initiative', 'Tourism']
    },
    {
      _id: 'dummy2',
      title: 'RTC Teams Begin Comprehensive Panchayat Survey Across State',
      slug: 'rtc-teams-begin-panchayat-survey',
      excerpt: 'Regional Tourism Coordinators have commenced field surveys to document cultural heritage, natural beauty, and local traditions across all panchayats.',
      featuredImage: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
      category: 'update',
      author: { name: 'RTC Team' },
      createdAt: '2024-11-05',
      views: 890,
      status: 'published',
      tags: ['Survey', 'RTC', 'Heritage']
    },
    {
      _id: 'dummy3',
      title: 'New Tourism Guidelines Announced for Heritage Sites',
      slug: 'new-tourism-guidelines-heritage-sites',
      excerpt: 'Updated guidelines for visiting and documenting heritage sites across Madhya Pradesh have been released.',
      featuredImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
      category: 'press_release',
      author: { name: 'MP Tourism Department' },
      createdAt: '2024-10-28',
      views: 650,
      status: 'published',
      tags: ['Guidelines', 'Heritage', 'Tourism']
    },
    {
      _id: 'dummy4',
      title: 'MP Tourify Featured in National Media Coverage',
      slug: 'mp-tourify-national-media-coverage',
      excerpt: 'Major national newspapers and TV channels highlight the innovative digital documentation project.',
      featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
      category: 'media_coverage',
      author: { name: 'Media Team' },
      createdAt: '2024-11-03',
      views: 1580,
      status: 'published',
      tags: ['Media', 'Coverage', 'National']
    }
  ];

  useEffect(() => {
    // Fetch all news and filter on client side
    dispatch(fetchNews({ limit: 50 }));
  }, [dispatch]);

  const handleCardClick = (slug) => {
    router.push(`/news/${slug}`);
  };

  // Use real data if available, otherwise use dummy data
  const displayNews = news.length > 0 ? news : dummyNews;

  // Filter by current category and search term
  const filteredNews = displayNews.filter(item => {
    if (item.status !== 'published') return false;
    const matchesCategory = item.category === currentCategory;
    const matchesSearch = searchTerm === '' || 
                         item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Category Header - Uniform with news/page.js */}
      <div className='bg-[#1b8c11] '>
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
          {/* Back Button */}
          <button
            onClick={() => router.push('/news')}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-lg mb-6"
          >
            <ArrowLeft size={22} />
            Back to All News
          </button>

          {/* Mobile & Tablet: Stack layout */}
          <div className="lg:hidden space-y-8">
            {/* Category Info */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Filter size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">Category</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {categoryData.label}
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                {categoryData.description}
              </p>
            </div>

            {/* Search Bar - Uniform style */}
            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
              <TextField
                placeholder="Search in this category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              
              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
                <span className="text-[#138808] font-medium">
                  {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
                </span>
                <div className="flex items-center gap-2 text-[#138808]/60">
                  <Clock size={16} />
                  <span>Updated daily</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Side by side layout - Uniform with news/page.js */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            {/* Category Info - Left Side */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Filter size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">Category</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                {categoryData.label}
              </h1>
              <p className="text-lg text-white/90">
                {categoryData.description}
              </p>
            </div>

            {/* Search - Right Side - Uniform width and style */}
            <div className="flex-1 max-w-lg">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <TextField
                  placeholder="Search in this category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                
                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-[#138808]/10 flex items-center justify-between text-sm">
                  <span className="text-[#138808] font-medium">
                    {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
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

      {/* Main Content - Exactly like news/page.js */}
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
            <div className={`inline-flex items-center justify-center w-20 h-20 ${categoryData.lightColor} rounded-full mb-4`}>
              <Newspaper size={32} className={categoryData.color.replace('bg-', 'text-')} />
            </div>
            <p className="text-[#138808] text-lg font-medium mb-2">No articles found in this category.</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#138808] underline font-medium"
              >
                Clear search
              </button>
            )}
            <div className="mt-6">
              <button
                onClick={() => router.push('/news')}
                className="inline-flex items-center gap-2 bg-[#138808] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0d5c06] transition-colors"
              >
                View All News
                <ArrowRight size={18} />
              </button>
            </div>
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
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${categoryData.color} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                      {categoryData.label}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-[#138808]/60 text-sm mb-3">
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
                  <p className="text-[#138808]/70 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
                    <div className="flex items-center gap-2 text-[#138808]/60 text-xs">
                      <Clock size={14} />
                      <span>{item.views || 0} views</span>
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