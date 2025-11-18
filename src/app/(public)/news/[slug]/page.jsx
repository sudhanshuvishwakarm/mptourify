'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchNewsBySlug, fetchLatestNews } from '@/redux/slices/newsSlice';
import { Calendar, Clock, Tag, User, Share2, ArrowLeft, ArrowRight, Newspaper, X, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function NewsDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { selectedNews, latestNews, loading, error, news } = useSelector((state) => state.news);
  const [showShareModal, setShowShareModal] = useState(false);

  // Check if news is already in the list (from news page)
  const existingNews = useMemo(() => {
    if (!params?.slug) return null;
    return news.find(item => item.slug === params.slug);
  }, [news, params?.slug]);

  // Smart useEffect - only fetch if not already loaded
  useEffect(() => {
    if (params.slug) {
      // If news is not in the list or selectedNews is different, fetch it
      if (!existingNews || selectedNews?.slug !== params.slug) {
        dispatch(fetchNewsBySlug(params.slug));
      }
      
      // Always fetch latest news as it's time-sensitive
      dispatch(fetchLatestNews(4));
    }
  }, [dispatch, params.slug, existingNews, selectedNews]);

  // Use existing news data if available (for faster loading)
  const currentNews = selectedNews?.slug === params?.slug ? selectedNews : existingNews;

  // Memoized utility functions
  const getCategoryLabel = useCallback((category) => {
    const map = {
      'media_coverage': 'Media Coverage',
      'press_release': 'Press Release',
      'announcement': 'Announcement',
      'update': 'Update'
    };
    return map[category] || category;
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      'media_coverage': 'bg-blue-500',
      'press_release': 'bg-purple-500',
      'announcement': 'bg-[#117307]',
      'update': 'bg-orange-500'
    };
    return colors[category] || 'bg-[#117307]';
  }, []);

  // Memoized event handlers
  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      // Fallback method for clipboard
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Show success feedback
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: show the URL for manual copy
      alert(`Please copy this link manually: ${window.location.href}`);
    }
  }, []);

  const handleSocialShare = useCallback((platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentNews?.title || 'Check out this news article');
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  }, [currentNews]);

  const handleBackToNews = useCallback(() => {
    router.push('/news');
  }, [router]);

  const handleNewsNavigation = useCallback((slug) => {
    router.push(`/news/${slug}`);
  }, [router]);

  const handleViewAllNews = useCallback(() => {
    router.push('/news');
  }, [router]);

  // Only show loader if no data exists and still loading
  const showLoader = loading && !currentNews;

  if (showLoader) {
    return <Loader />;
  }

  // Show error state only if no data exists
  if ((error && !currentNews) || (!loading && !currentNews)) {
    return (
      <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
            <Newspaper size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#117307] mb-2">Article Not Found</h2>
          <p className="text-[#117307]/70 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBackToNews}
            className="inline-flex items-center gap-2 bg-[#117307] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0d5c06] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to News
          </button>
        </div>
      </div>
    );
  }

  // Use currentNews for rendering
  const displayNews = currentNews;

  if (!displayNews) {
    return (
      <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <Newspaper size={64} className="mx-auto text-[#117307] opacity-20 mb-4" />
          <h2 className="text-2xl font-bold text-[#117307] mb-2">Loading Article...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header with Back Button and Share Button - Reduced Height */}
      <div className="bg-[#117307] py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Back Button */}
            <button
              onClick={handleBackToNews}
              className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
            >
              <ArrowLeft size={22} />
              Back to News
            </button>

            {/* Share Button - Opposite to Back Button */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
              >
                <Share2 size={22} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#117307]">Share This Article</h3>
              <button
                onClick={handleCloseShareModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Twitter size={32} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <Facebook size={32} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Linkedin size={32} className="text-blue-700" />
                <span className="text-sm font-medium text-gray-700">LinkedIn</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#f5fbf2] hover:bg-[#117307]/10 transition-colors"
              >
                <Link2 size={32} className="text-[#117307]" />
                <span className="text-sm font-medium text-gray-700">Copy Link</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Share this article with your friends and colleagues
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article - 2/3 width */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Featured Image - Full width without padding */}
              {displayNews.featuredImage && (
                <div className="w-full  bg-[#f5fbf2] relative overflow-hidden">
                  <img
                    src={displayNews.featuredImage}
                    alt={displayNews.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="p-8 lg:p-12">
                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-6 leading-tight">
                  {displayNews.title}
                </h1>

                {/* Meta Information - Date and Category in same row */}
                <div className="flex justify-between items-center gap-6 pb-6 mb-6 border-b border-[#117307]/10">
                  {/* Date on left */}
                  <div className="flex items-center gap-2 text-[#4d674f] font-medium">
                    <Calendar size={18} className="text-[#1a5e10]" />
                    <span>
                      {new Date(displayNews.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Category on right */}
                  <div className="flex items-center gap-2">
                    <span className={`${getCategoryColor(displayNews.category)} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                      {getCategoryLabel(displayNews.category)}
                    </span>
                  </div>
                </div>

                {/* Excerpt */}
                {displayNews.excerpt && (
                  <div className="bg-[#f5fbf2] border-l-4 border-[#117307] p-6 mb-8 rounded-r-xl">
                    <p className="text-lg text-[#1a5e10] font-medium italic leading-relaxed">
                      {displayNews.excerpt}
                    </p>
                  </div>
                )}

                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-[#1a5e10] leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: displayNews.content }}
                  />
                </div>

                {/* Tags */}
                {displayNews.tags && displayNews.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-[#117307]/10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Tag size={18} className="text-[#117307]" />
                      <div className="flex flex-wrap gap-2">
                        {displayNews.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-[#117307]/10 text-[#117307] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#117307]/20 transition-colors cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Latest News */}
              {latestNews && latestNews.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
                    <Newspaper size={20} className="text-[#117307]" />
                    Latest News
                  </h3>
                  <div className="space-y-4">
                    {latestNews
                      .filter(item => item._id !== displayNews._id)
                      .slice(0, 3)
                      .map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleNewsNavigation(item.slug)}
                          className="group cursor-pointer pb-4 border-b border-[#117307]/10 last:border-0 last:pb-0 hover:bg-[#f5fbf2] p-3 rounded-xl transition-colors"
                        >
                          <div className="flex gap-3">
                            {item.featuredImage && (
                              <div className="w-20 h-20 bg-[#f5fbf2] rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.featuredImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#0d4d03] text-sm mb-1 line-clamp-2 group-hover:text-[#117307] transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-[#4d674f] flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(item.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <span className="text-xs text-[#117307] font-semibold mt-1 inline-block">
                                {getCategoryLabel(item.category)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={handleViewAllNews}
                    className="w-full mt-4 text-[#117307] font-semibold text-sm flex items-center justify-center gap-2 hover:gap-3 transition-all group py-3 rounded-xl hover:bg-[#f5fbf2]"
                  >
                    View All News
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                <p className="text-white/90 text-sm mb-4">
                  Get the latest news and updates delivered to your inbox.
                </p>
                <button className="w-full bg-white text-[#117307] py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
                  Subscribe Now
                </button>
              </div>   
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';
// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchNewsBySlug, fetchLatestNews } from '@/redux/slices/newsSlice';
// import { Calendar, Clock, Tag, User, Share2, ArrowLeft, ArrowRight, Newspaper } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function NewsDetailPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const { selectedNews, latestNews, loading, error, news } = useSelector((state) => state.news);
//   const [shareTooltip, setShareTooltip] = useState(false);

//   // Check if news is already in the list (from news page)
//   const existingNews = useMemo(() => {
//     if (!params?.slug) return null;
//     return news.find(item => item.slug === params.slug);
//   }, [news, params?.slug]);

//   // Smart useEffect - only fetch if not already loaded
//   useEffect(() => {
//     if (params.slug) {
//       // If news is not in the list or selectedNews is different, fetch it
//       if (!existingNews || selectedNews?.slug !== params.slug) {
//         dispatch(fetchNewsBySlug(params.slug));
//       }
      
//       // Always fetch latest news as it's time-sensitive
//       dispatch(fetchLatestNews(4));
//     }
//   }, [dispatch, params.slug, existingNews, selectedNews]);

//   // Use existing news data if available (for faster loading)
//   const currentNews = selectedNews?.slug === params?.slug ? selectedNews : existingNews;

//   // Memoized utility functions
//   const getCategoryLabel = useCallback((category) => {
//     const map = {
//       'media_coverage': 'Media Coverage',
//       'press_release': 'Press Release',
//       'announcement': 'Announcement',
//       'update': 'Update'
//     };
//     return map[category] || category;
//   }, []);

//   const getCategoryColor = useCallback((category) => {
//     const colors = {
//       'media_coverage': 'bg-blue-500',
//       'press_release': 'bg-purple-500',
//       'announcement': 'bg-[#138808]',
//       'update': 'bg-orange-500'
//     };
//     return colors[category] || 'bg-[#138808]';
//   }, []);

//   // Memoized event handlers
//   const handleShare = useCallback(async () => {
//     try {
//       await navigator.clipboard.writeText(window.location.href);
//       setShareTooltip(true);
//       setTimeout(() => setShareTooltip(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   }, []);

//   const handleBackToNews = useCallback(() => {
//     router.push('/news');
//   }, [router]);

//   const handleNewsNavigation = useCallback((slug) => {
//     router.push(`/news/${slug}`);
//   }, [router]);

//   const handleViewAllNews = useCallback(() => {
//     router.push('/news');
//   }, [router]);

//   // Only show loader if no data exists and still loading
//   const showLoader = loading && !currentNews;

//   if (showLoader) {
//     return <Loader />;
//   }

//   // Show error state only if no data exists
//   if ((error && !currentNews) || (!loading && !currentNews)) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
//             <Newspaper size={32} className="text-red-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-[#138808] mb-2">Article Not Found</h2>
//           <p className="text-[#138808]/70 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={handleBackToNews}
//             className="inline-flex items-center gap-2 bg-[#138808] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0d5c06] transition-colors"
//           >
//             <ArrowLeft size={18} />
//             Back to News
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Use currentNews for rendering
//   const displayNews = currentNews;

//   if (!displayNews) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <Newspaper size={64} className="mx-auto text-[#138808] opacity-20 mb-4" />
//           <h2 className="text-2xl font-bold text-[#138808] mb-2">Loading Article...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header with Back Button */}
//       <div className="bg-[#138808] py-8">
//         <div className="max-w-6xl mx-auto px-4">
//           <button
//             onClick={handleBackToNews}
//             className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//           >
//             <ArrowLeft size={22} />
//             Back to News
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Article - 2/3 width */}
//           <div className="lg:col-span-2">
//             <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
//               {/* Featured Image */}
//               {displayNews.featuredImage && (
//                 <div className="h-96 bg-[#f5fbf2] relative overflow-hidden">
//                   <img
//                     src={displayNews.featuredImage}
//                     alt={displayNews.title}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                     }}
//                   />
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-6 left-6">
//                     <span className={`${getCategoryColor(displayNews.category)} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
//                       {getCategoryLabel(displayNews.category)}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Article Content */}
//               <div className="p-8 lg:p-12">
//                 {/* Title */}
//                 <h1 className="text-3xl lg:text-4xl font-bold text-[#138808] mb-6 leading-tight">
//                   {displayNews.title}
//                 </h1>

//                 {/* Meta Information */}
//                 <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-[#138808]/10">
//                   <div className="flex items-center gap-2 text-[#138808]/70">
//                     <Calendar size={18} />
//                     <span className="font-medium">
//                       {new Date(displayNews.createdAt).toLocaleDateString('en-US', { 
//                         month: 'long', 
//                         day: 'numeric', 
//                         year: 'numeric' 
//                       })}
//                     </span>
//                   </div>

//                   {displayNews.author?.name && (
//                     <div className="flex items-center gap-2 text-[#138808]/70">
//                       <User size={18} />
//                       <span className="font-medium">{displayNews.author.name}</span>
//                     </div>
//                   )}

//                   {/* Share Button */}
//                   <div className="ml-auto relative">
//                     <button
//                       onClick={handleShare}
//                       className="flex items-center gap-2 text-[#138808] hover:text-[#0d5c06] font-medium transition-colors"
//                     >
//                       <Share2 size={18} />
//                       <span className="hidden sm:inline">Share</span>
//                     </button>
//                     {shareTooltip && (
//                       <div className="absolute top-full mt-2 right-0 bg-[#138808] text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
//                         Link copied!
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Excerpt */}
//                 {displayNews.excerpt && (
//                   <div className="bg-[#138808]/5 border-l-4 border-[#138808] p-6 mb-8 rounded-r-xl">
//                     <p className="text-lg text-[#138808] font-medium italic leading-relaxed">
//                       {displayNews.excerpt}
//                     </p>
//                   </div>
//                 )}

//                 {/* Main Content */}
//                 <div className="prose prose-lg max-w-none">
//                   <div 
//                     className="text-[#138808]/80 leading-relaxed space-y-4"
//                     dangerouslySetInnerHTML={{ __html: displayNews.content }}
//                   />
//                 </div>

//                 {/* Tags */}
//                 {displayNews.tags && displayNews.tags.length > 0 && (
//                   <div className="mt-12 pt-8 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-3 flex-wrap">
//                       <Tag size={18} className="text-[#138808]" />
//                       <div className="flex flex-wrap gap-2">
//                         {displayNews.tags.map((tag, index) => (
//                           <span
//                             key={index}
//                             className="bg-[#138808]/10 text-[#138808] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#138808]/20 transition-colors cursor-pointer"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </article>
//           </div>

//           {/* Sidebar - 1/3 width */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-6 space-y-6">
//               {/* Latest News */}
//               {latestNews && latestNews.length > 0 && (
//                 <div className="bg-white rounded-2xl shadow-lg p-6">
//                   <h3 className="text-xl font-bold text-[#138808] mb-4 flex items-center gap-2">
//                     <Newspaper size={20} />
//                     Latest News
//                   </h3>
//                   <div className="space-y-4">
//                     {latestNews
//                       .filter(item => item._id !== displayNews._id)
//                       .slice(0, 3)
//                       .map((item) => (
//                         <div
//                           key={item._id}
//                           onClick={() => handleNewsNavigation(item.slug)}
//                           className="group cursor-pointer pb-4 border-b border-[#138808]/10 last:border-0 last:pb-0"
//                         >
//                           <div className="flex gap-3">
//                             {item.featuredImage && (
//                               <div className="w-20 h-20 bg-[#f5fbf2] rounded-lg overflow-hidden flex-shrink-0">
//                                 <img
//                                   src={item.featuredImage}
//                                   alt={item.title}
//                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                   onError={(e) => {
//                                     e.target.style.display = 'none';
//                                   }}
//                                 />
//                               </div>
//                             )}
//                             <div className="flex-1 min-w-0">
//                               <h4 className="font-semibold text-[#138808] text-sm mb-1 line-clamp-2 group-hover:text-[#0d5c06] transition-colors">
//                                 {item.title}
//                               </h4>
//                               <p className="text-xs text-[#138808]/60 flex items-center gap-1">
//                                 <Calendar size={12} />
//                                 {new Date(item.createdAt).toLocaleDateString('en-US', { 
//                                   month: 'short', 
//                                   day: 'numeric' 
//                                 })}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                   <button
//                     onClick={handleViewAllNews}
//                     className="w-full mt-4 text-[#138808] font-semibold text-sm flex items-center justify-center gap-2 hover:gap-3 transition-all group"
//                   >
//                     View All News
//                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 </div>
//               )}

//               {/* Newsletter Signup */}
//               <div className="bg-gradient-to-br from-[#138808] to-[#0d5c06] rounded-2xl shadow-lg p-6 text-white">
//                 <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
//                 <p className="text-white/90 text-sm mb-4">
//                   Get the latest news and updates delivered to your inbox.
//                 </p>
//                 <button className="w-full bg-white text-[#138808] py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
//                   Subscribe Now
//                 </button>
//               </div>   
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchNewsBySlug, fetchLatestNews } from '@/redux/slices/newsSlice';
// import { Calendar, Clock, Tag, User, Share2, ArrowLeft, ArrowRight, Newspaper } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function NewsDetailPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const { selectedNews, latestNews, loading, error } = useSelector((state) => state.news);
//   const [shareTooltip, setShareTooltip] = useState(false);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   useEffect(() => {
//     if (params.slug) {
//       dispatch(fetchNewsBySlug(params.slug));
//       dispatch(fetchLatestNews(4));
//     }
//   }, [dispatch, params.slug]);

//   // Additional effect to track when data is actually loaded
//   useEffect(() => {
//     if (selectedNews && !loading) {
//       setDataLoaded(true);
//     }
//   }, [selectedNews, loading]);

//   const handleShare = async () => {
//     try {
//       await navigator.clipboard.writeText(window.location.href);
//       setShareTooltip(true);
//       setTimeout(() => setShareTooltip(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   const getCategoryLabel = (category) => {
//     const map = {
//       'media_coverage': 'Media Coverage',
//       'press_release': 'Press Release',
//       'announcement': 'Announcement',
//       'update': 'Update'
//     };
//     return map[category] || category;
//   };

//   const getCategoryColor = (category) => {
//     const colors = {
//       'media_coverage': 'bg-blue-500',
//       'press_release': 'bg-purple-500',
//       'announcement': 'bg-[#138808]',
//       'update': 'bg-orange-500'
//     };
//     return colors[category] || 'bg-[#138808]';
//   };

//   // Show loader only on initial load, not when data is being refreshed
//   if (loading && !dataLoaded) {
//     return <Loader />;
//   }

//   // Only show error state after we've attempted to load data
//   if ((error && dataLoaded) || (!loading && !selectedNews && dataLoaded)) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
//             <Newspaper size={32} className="text-red-500" />
//           </div>
//           <h2 className="text-2xl font-bold text-[#138808] mb-2">Article Not Found</h2>
//           <p className="text-[#138808]/70 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={() => router.push('/news')}
//             className="inline-flex items-center gap-2 bg-[#138808] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0d5c06] transition-colors"
//           >
//             <ArrowLeft size={18} />
//             Back to News
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Don't render anything if we're still loading and no data is available yet
//   if (!selectedNews) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header with Back Button */}
//       <div className="bg-[#138808] py-8">
//         <div className="max-w-6xl mx-auto px-4">
//           <button
//             onClick={() => router.push('/news')}
//             className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//           >
//             <ArrowLeft size={22} />
//             Back to News
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Article - 2/3 width */}
//           <div className="lg:col-span-2">
//             <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
//               {/* Featured Image */}
//               {selectedNews.featuredImage && (
//                 <div className="h-96 bg-[#f5fbf2] relative overflow-hidden">
//                   <img
//                     src={selectedNews.featuredImage}
//                     alt={selectedNews.title}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                     }}
//                   />
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-6 left-6">
//                     <span className={`${getCategoryColor(selectedNews.category)} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
//                       {getCategoryLabel(selectedNews.category)}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Article Content */}
//               <div className="p-8 lg:p-12">
//                 {/* Title */}
//                 <h1 className="text-3xl lg:text-4xl font-bold text-[#138808] mb-6 leading-tight">
//                   {selectedNews.title}
//                 </h1>

//                 {/* Meta Information */}
//                 <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-[#138808]/10">
//                   <div className="flex items-center gap-2 text-[#138808]/70">
//                     <Calendar size={18} />
//                     <span className="font-medium">
//                       {new Date(selectedNews.createdAt).toLocaleDateString('en-US', { 
//                         month: 'long', 
//                         day: 'numeric', 
//                         year: 'numeric' 
//                       })}
//                     </span>
//                   </div>

//                   {selectedNews.author?.name && (
//                     <div className="flex items-center gap-2 text-[#138808]/70">
//                       <User size={18} />
//                       <span className="font-medium">{selectedNews.author.name}</span>
//                     </div>
//                   )}

//                   {/* <div className="flex items-center gap-2 text-[#138808]/70">
//                     <Clock size={18} />
//                     <span className="font-medium">{selectedNews.views || 0} views</span>
//                   </div> */}

//                   {/* Share Button */}
//                   <div className="ml-auto relative">
//                     <button
//                       onClick={handleShare}
//                       className="flex items-center gap-2 text-[#138808] hover:text-[#0d5c06] font-medium transition-colors"
//                     >
//                       <Share2 size={18} />
//                       <span className="hidden sm:inline">Share</span>
//                     </button>
//                     {shareTooltip && (
//                       <div className="absolute top-full mt-2 right-0 bg-[#138808] text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
//                         Link copied!
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Excerpt */}
//                 {selectedNews.excerpt && (
//                   <div className="bg-[#138808]/5 border-l-4 border-[#138808] p-6 mb-8 rounded-r-xl">
//                     <p className="text-lg text-[#138808] font-medium italic leading-relaxed">
//                       {selectedNews.excerpt}
//                     </p>
//                   </div>
//                 )}

//                 {/* Main Content */}
//                 <div className="prose prose-lg max-w-none">
//                   <div 
//                     className="text-[#138808]/80 leading-relaxed space-y-4"
//                     dangerouslySetInnerHTML={{ __html: selectedNews.content }}
//                   />
//                 </div>

//                 {/* Tags */}
//                 {selectedNews.tags && selectedNews.tags.length > 0 && (
//                   <div className="mt-12 pt-8 border-t border-[#138808]/10">
//                     <div className="flex items-center gap-3 flex-wrap">
//                       <Tag size={18} className="text-[#138808]" />
//                       <div className="flex flex-wrap gap-2">
//                         {selectedNews.tags.map((tag, index) => (
//                           <span
//                             key={index}
//                             className="bg-[#138808]/10 text-[#138808] px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#138808]/20 transition-colors cursor-pointer"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </article>
//           </div>

//           {/* Sidebar - 1/3 width */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-6 space-y-6">
//               {/* Latest News */}
//               {latestNews && latestNews.length > 0 && (
//                 <div className="bg-white rounded-2xl shadow-lg p-6">
//                   <h3 className="text-xl font-bold text-[#138808] mb-4 flex items-center gap-2">
//                     <Newspaper size={20} />
//                     Latest News
//                   </h3>
//                   <div className="space-y-4">
//                     {latestNews
//                       .filter(item => item._id !== selectedNews._id)
//                       .slice(0, 3)
//                       .map((item) => (
//                         <div
//                           key={item._id}
//                           onClick={() => router.push(`/news/${item.slug}`)}
//                           className="group cursor-pointer pb-4 border-b border-[#138808]/10 last:border-0 last:pb-0"
//                         >
//                           <div className="flex gap-3">
//                             {item.featuredImage && (
//                               <div className="w-20 h-20 bg-[#f5fbf2] rounded-lg overflow-hidden flex-shrink-0">
//                                 <img
//                                   src={item.featuredImage}
//                                   alt={item.title}
//                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                   onError={(e) => {
//                                     e.target.style.display = 'none';
//                                   }}
//                                 />
//                               </div>
//                             )}
//                             <div className="flex-1 min-w-0">
//                               <h4 className="font-semibold text-[#138808] text-sm mb-1 line-clamp-2 group-hover:text-[#0d5c06] transition-colors">
//                                 {item.title}
//                               </h4>
//                               <p className="text-xs text-[#138808]/60 flex items-center gap-1">
//                                 <Calendar size={12} />
//                                 {new Date(item.createdAt).toLocaleDateString('en-US', { 
//                                   month: 'short', 
//                                   day: 'numeric' 
//                                 })}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                   <button
//                     onClick={() => router.push('/news')}
//                     className="w-full mt-4 text-[#138808] font-semibold text-sm flex items-center justify-center gap-2 hover:gap-3 transition-all group"
//                   >
//                     View All News
//                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 </div>
//               )}

//               {/* Newsletter Signup */}
//               <div className="bg-gradient-to-br from-[#138808] to-[#0d5c06] rounded-2xl shadow-lg p-6 text-white">
//                 <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
//                 <p className="text-white/90 text-sm mb-4">
//                   Get the latest news and updates delivered to your inbox.
//                 </p>
//                 <button className="w-full bg-white text-[#138808] py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
//                   Subscribe Now
//                 </button>
//               </div>   
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }