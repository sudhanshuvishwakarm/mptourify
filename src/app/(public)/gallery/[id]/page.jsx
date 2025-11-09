'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchMediaById } from '@/redux/slices/mediaSlice';
import { ArrowLeft, MapPin, Calendar, Camera, Tag, Video, Image, Share2, Download, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function GalleryDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { selectedMedia, loading, error } = useSelector((state) => state.media);
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (params?.id) {
      dispatch(fetchMediaById(params.id));
    }
  }, [dispatch, params?.id]);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      heritage: 'bg-amber-500',
      natural: 'bg-emerald-500',
      cultural: 'bg-purple-500',
      event: 'bg-blue-500',
      festival: 'bg-pink-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      heritage: 'Heritage',
      natural: 'Natural',
      cultural: 'Cultural',
      event: 'Event',
      festival: 'Festival'
    };
    return labels[category] || category;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedMedia?.title,
          text: selectedMedia?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // const handleDownload = () => {
  //   if (!selectedMedia) return;
    
  //   const link = document.createElement('a');
  //   link.href = selectedMedia.fileUrl;
  //   link.download = selectedMedia.title;
  //   link.target = '_blank';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  if (loading) {
    return <Loader />;
  }

  if (error || !selectedMedia) {
    return (
      <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <Camera size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-[#138808] mb-2">Media Not Found</h2>
          <p className="text-[#138808]/70 mb-6">The media you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/gallery')}
            className="bg-[#138808] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d5c06] transition-colors"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const media = selectedMedia;

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Navigation Header */}
      <div className="bg-white border-b-2 border-[#138808]/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/gallery')}
              className="flex items-center gap-2 text-[#138808] font-bold hover:text-[#0d5c06] transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Gallery</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-[#138808]/10 text-[#138808] hover:bg-[#138808] hover:text-white transition-colors"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              {/* <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-[#138808]/10 text-[#138808] hover:bg-[#138808] hover:text-white transition-colors"
                title="Download"
              >
                <Download size={20} />
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Media Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative bg-black">
                {media.fileType === 'video' ? (
                  <div className="relative aspect-video bg-black group">
                    {/* Video Player */}
                    <video
                      ref={videoRef}
                      src={media.fileUrl}
                      poster={media.thumbnailUrl}
                      className="w-full h-full object-contain max-h-[70vh]"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      muted={isMuted}
                      playsInline
                    />
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Top Controls */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        <div className={`${getCategoryColor(media.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                          {getCategoryLabel(media.category)}
                        </div>
                        <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <Video size={14} />
                          Video
                        </div>
                      </div>

                      {/* Center Play Button */}
                      <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause size={32} className="text-white" />
                        ) : (
                          <Play size={32} className="text-white ml-1" />
                        )}
                      </button>

                      {/* Bottom Controls */}
                      <div className="absolute bottom-4 left-4 right-4">
                        {/* Progress Bar */}
                        <div 
                          className="w-full bg-white/30 h-1 rounded-full mb-3 cursor-pointer"
                          onClick={handleSeek}
                        >
                          <div 
                            className="bg-[#138808] h-1 rounded-full transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={togglePlay}
                              className="text-white hover:text-[#138808] transition-colors"
                            >
                              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            
                            <button
                              onClick={toggleMute}
                              className="text-white hover:text-[#138808] transition-colors"
                            >
                              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            
                            <span className="text-white text-sm font-medium">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>

                          {/* <button
                            onClick={handleDownload}
                            className="bg-[#138808] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d5c06] transition-colors flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download
                          </button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isImageLoaded && (
                      <div className="aspect-video flex items-center justify-center bg-[#138808]/5">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#138808] border-t-transparent"></div>
                      </div>
                    )}
                    <img
                      src={media.fileUrl}
                      alt={media.title}
                      className={`w-full object-contain max-h-[70vh] ${isImageLoaded ? 'block' : 'hidden'}`}
                      onLoad={() => setIsImageLoaded(true)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="aspect-video flex flex-col items-center justify-center bg-[#138808]/5">
                            <Image size={64} class="text-[#138808] opacity-20 mb-2" />
                            <p class="text-[#138808] opacity-50 text-sm">Failed to load image</p>
                          </div>
                        `;
                      }}
                    />
                  </>
                )}
              </div>

              {/* Media Info Bar */}
              <div className="p-4 bg-[#138808]/5 border-t-2 border-[#138808]/10">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[#138808]">
                      {media.fileType === 'video' ? (
                        <Video size={16} />
                      ) : (
                        <Image size={16} />
                      )}
                      <span className="font-medium">
                        {media.fileType === 'video' ? 'Video' : 'Photo'}
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-1.5 text-[#138808]/60">
                      <Eye size={16} />
                      <span>{media.views || 0} views</span>
                    </div> */}
                  </div>
                  {media.fileType === 'image' && (
                    <div className={`${getCategoryColor(media.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {getCategoryLabel(media.category)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#138808] mb-4 leading-tight">
                {media.title}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-[#138808]/80 leading-relaxed whitespace-pre-line">
                  {media.description}
                </p>
              </div>
            </div>

            {/* Tags Section */}
            {media.tags && media.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={20} className="text-[#138808]" />
                  <h3 className="text-lg font-bold text-[#138808]">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {media.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#138808]/10 text-[#138808] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#138808] hover:text-white transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[#138808] mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Location Details
              </h3>
              
              <div className="space-y-4">
                {media.district && (
                  <div className="pb-4 border-b border-[#138808]/10">
                    <p className="text-xs text-[#138808]/60 mb-1 font-medium">District</p>
                    <button
                      onClick={() => media.district?.slug && router.push(`/districts/${media.district.slug}`)}
                      className="text-[#138808] font-bold text-lg hover:text-[#0d5c06] transition-colors hover:underline"
                    >
                      {media.district.name}
                    </button>
                  </div>
                )}

                {media.gramPanchayat && (
                  <div className="pb-4 border-b border-[#138808]/10">
                    <p className="text-xs text-[#138808]/60 mb-1 font-medium">Gram Panchayat</p>
                    <button
                      onClick={() => media.gramPanchayat?.slug && router.push(`/panchayats/${media.gramPanchayat.slug}`)}
                      className="text-[#138808] font-bold hover:text-[#0d5c06] transition-colors hover:underline"
                    >
                      {media.gramPanchayat.name}
                    </button>
                  </div>
                )}

                {!media.district && !media.gramPanchayat && (
                  <p className="text-[#138808]/60 text-sm italic">Location information not available</p>
                )}
              </div>
            </div>

            {/* Capture Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-[#138808] mb-4 flex items-center gap-2">
                <Camera size={20} />
                Capture Details
              </h3>
              
              <div className="space-y-4">
                {media.photographer && (
                  <div className="pb-4 border-b border-[#138808]/10">
                    <p className="text-xs text-[#138808]/60 mb-1 font-medium">Photographer</p>
                    <p className="text-[#138808] font-bold">{media.photographer}</p>
                  </div>
                )}

                {media.captureDate && (
                  <div className="pb-4 border-b border-[#138808]/10">
                    <p className="text-xs text-[#138808]/60 mb-1 font-medium">Captured On</p>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#138808]" />
                      <p className="text-[#138808] font-bold">
                        {new Date(media.captureDate).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {media.createdAt && (
                  <div>
                    <p className="text-xs text-[#138808]/60 mb-1 font-medium">Uploaded On</p>
                    <p className="text-[#138808] font-medium text-sm">
                      {new Date(media.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-br from-[#138808] to-[#0d5c06] rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-lg font-bold mb-4">Actions</h3>
              
              <div className="space-y-3">
                {/* <button
                  onClick={handleDownload}
                  className="w-full bg-white text-[#138808] py-3 rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Media
                </button> */}
                
                <button
                  onClick={handleShare}
                  className="w-full bg-white/10 backdrop-blur-sm text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share This
                </button>
              </div>
            </div>

            {/* Report Section */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <p className="text-sm text-amber-800 mb-3">
                Found an issue with this media? Help us maintain quality content.
              </p>
              <button className="text-amber-800 font-bold text-sm hover:text-amber-900 underline">
                Report This Media
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchMediaById } from '@/redux/slices/mediaSlice';
// import { ArrowLeft, MapPin, Calendar, Camera, Tag, Video, Image, Share2, Download, Eye } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function GalleryDetailPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const { selectedMedia, loading, error } = useSelector((state) => state.media);
  
//   const [isImageLoaded, setIsImageLoaded] = useState(false);

//   // Dummy data for demonstration
//   const dummyMedia = {
//     _id: 'dummy1',
//     title: 'Khajuraho Temple Complex - UNESCO World Heritage',
//     description: 'The Khajuraho Group of Monuments is a group of Hindu and Jain temples in Chhatarpur district of Madhya Pradesh. They are one of the most popular tourist destinations in India and a UNESCO World Heritage Site. The temples are famous for their nagara-style architectural symbolism and their erotic sculptures. Most Khajuraho temples were built between 950 and 1050 by the Chandela dynasty. Historical records note that the Khajuraho temple site had 85 temples by the 12th century, spread over 20 square kilometers. Of these, only about 25 temples have survived, spread over 6 square kilometers.',
//     fileUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',
//     thumbnailUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
//     fileType: 'image',
//     category: 'heritage',
//     district: { 
//       _id: 'dist1', 
//       name: 'Chhatarpur',
//       slug: 'chhatarpur'
//     },
//     gramPanchayat: {
//       _id: 'gp1',
//       name: 'Khajuraho Gram Panchayat',
//       slug: 'khajuraho-gram-panchayat'
//     },
//     captureDate: '2024-10-15T10:30:00Z',
//     photographer: 'Rajesh Kumar - RTC Team Chhatarpur',
//     tags: ['temple', 'UNESCO', 'architecture', 'heritage', 'chandela', 'sculpture'],
//     views: 1547,
//     status: 'approved',
//     createdAt: '2024-10-16T08:00:00Z'
//   };

//   useEffect(() => {
//     if (params?.id) {
//       dispatch(fetchMediaById(params.id));
//     }
//   }, [dispatch, params?.id]);

//   const media = selectedMedia || dummyMedia;

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

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: media.title,
//           text: media.description,
//           url: window.location.href,
//         });
//       } catch (err) {
//         console.log('Share failed:', err);
//       }
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert('Link copied to clipboard!');
//     }
//   };

//   const handleDownload = () => {
//     const link = document.createElement('a');
//     link.href = media.fileUrl;
//     link.download = media.title;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <Camera size={64} className="mx-auto text-red-500 mb-4" />
//           <h2 className="text-2xl font-bold text-[#138808] mb-2">Media Not Found</h2>
//           <p className="text-[#138808]/70 mb-6">The media you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={() => router.push('/gallery')}
//             className="bg-[#138808] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d5c06] transition-colors"
//           >
//             Back to Gallery
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Navigation Header */}
//       <div className="bg-white border-b-2 border-[#138808]/10 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <button
//               onClick={() => router.push('/gallery')}
//               className="flex items-center gap-2 text-[#138808] font-bold hover:text-[#0d5c06] transition-colors"
//             >
//               <ArrowLeft size={20} />
//               <span className="hidden sm:inline">Back to Gallery</span>
//               <span className="sm:hidden">Back</span>
//             </button>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleShare}
//                 className="p-2 rounded-lg bg-[#138808]/10 text-[#138808] hover:bg-[#138808] hover:text-white transition-colors"
//                 title="Share"
//               >
//                 <Share2 size={20} />
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 rounded-lg bg-[#138808]/10 text-[#138808] hover:bg-[#138808] hover:text-white transition-colors"
//                 title="Download"
//               >
//                 <Download size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Media Display */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Media Container */}
//             <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
//               <div className="relative bg-black">
//                 {media.fileType === 'video' ? (
//                   <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[#138808]/20 to-[#138808]/40">
//                     <div className="relative">
//                       <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
//                       <Video size={96} className="text-white relative z-10" />
//                     </div>
//                     <div className="absolute bottom-4 left-4 right-4">
//                       <div className="bg-black/60 backdrop-blur-md text-white px-4 py-3 rounded-xl">
//                         <p className="text-sm font-medium">Video Preview Not Available</p>
//                         <p className="text-xs text-white/70 mt-1">Click download to view the full video</p>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     {!isImageLoaded && (
//                       <div className="aspect-video flex items-center justify-center bg-[#138808]/5">
//                         <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#138808] border-t-transparent"></div>
//                       </div>
//                     )}
//                     <img
//                       src={media.fileUrl}
//                       alt={media.title}
//                       className={`w-full object-contain max-h-[70vh] ${isImageLoaded ? 'block' : 'hidden'}`}
//                       onLoad={() => setIsImageLoaded(true)}
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         e.target.parentElement.innerHTML = '<div class="aspect-video flex items-center justify-center bg-[#138808]/5"><svg class="w-24 h-24 text-[#138808] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
//                       }}
//                     />
//                   </>
//                 )}
//               </div>

//               {/* Image Info Bar */}
//               <div className="p-4 bg-[#138808]/5 border-t-2 border-[#138808]/10">
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-1.5 text-[#138808]">
//                       {media.fileType === 'video' ? (
//                         <Video size={16} />
//                       ) : (
//                         <Image size={16} />
//                       )}
//                       <span className="font-medium">
//                         {media.fileType === 'video' ? 'Video' : 'Photo'}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-1.5 text-[#138808]/60">
//                       <Eye size={16} />
//                       <span>{media.views || 0} views</span>
//                     </div>
//                   </div>
//                   <div className={`${getCategoryColor(media.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
//                     {getCategoryLabel(media.category)}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Description Section */}
//             <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
//               <h1 className="text-2xl lg:text-3xl font-bold text-[#138808] mb-4 leading-tight">
//                 {media.title}
//               </h1>
              
//               <div className="prose prose-lg max-w-none">
//                 <p className="text-[#138808]/80 leading-relaxed whitespace-pre-line">
//                   {media.description}
//                 </p>
//               </div>
//             </div>

//             {/* Tags Section */}
//             {media.tags && media.tags.length > 0 && (
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <div className="flex items-center gap-2 mb-4">
//                   <Tag size={20} className="text-[#138808]" />
//                   <h3 className="text-lg font-bold text-[#138808]">Tags</h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {media.tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className="bg-[#138808]/10 text-[#138808] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#138808] hover:text-white transition-colors cursor-pointer"
//                     >
//                       #{tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Right Column - Details */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Location Details */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-lg font-bold text-[#138808] mb-4 flex items-center gap-2">
//                 <MapPin size={20} />
//                 Location Details
//               </h3>
              
//               <div className="space-y-4">
//                 {media.district && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">District</p>
//                     <button
//                       onClick={() => router.push(`/districts/${media.district.slug}`)}
//                       className="text-[#138808] font-bold text-lg hover:text-[#0d5c06] transition-colors hover:underline"
//                     >
//                       {media.district.name}
//                     </button>
//                   </div>
//                 )}

//                 {media.gramPanchayat && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Gram Panchayat</p>
//                     <button
//                       onClick={() => router.push(`/panchayats/${media.gramPanchayat.slug}`)}
//                       className="text-[#138808] font-bold hover:text-[#0d5c06] transition-colors hover:underline"
//                     >
//                       {media.gramPanchayat.name}
//                     </button>
//                   </div>
//                 )}

//                 {!media.district && !media.gramPanchayat && (
//                   <p className="text-[#138808]/60 text-sm italic">Location information not available</p>
//                 )}
//               </div>
//             </div>

//             {/* Capture Details */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-lg font-bold text-[#138808] mb-4 flex items-center gap-2">
//                 <Camera size={20} />
//                 Capture Details
//               </h3>
              
//               <div className="space-y-4">
//                 {media.photographer && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Photographer</p>
//                     <p className="text-[#138808] font-bold">{media.photographer}</p>
//                   </div>
//                 )}

//                 {media.captureDate && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Captured On</p>
//                     <div className="flex items-center gap-2">
//                       <Calendar size={16} className="text-[#138808]" />
//                       <p className="text-[#138808] font-bold">
//                         {new Date(media.captureDate).toLocaleDateString('en-US', { 
//                           year: 'numeric',
//                           month: 'long', 
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {media.createdAt && (
//                   <div>
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Uploaded On</p>
//                     <p className="text-[#138808] font-medium text-sm">
//                       {new Date(media.createdAt).toLocaleDateString('en-US', { 
//                         year: 'numeric',
//                         month: 'long', 
//                         day: 'numeric'
//                       })}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="bg-gradient-to-br from-[#138808] to-[#0d5c06] rounded-2xl p-6 shadow-lg text-white">
//               <h3 className="text-lg font-bold mb-4">Actions</h3>
              
//               <div className="space-y-3">
//                 <button
//                   onClick={handleDownload}
//                   className="w-full bg-white text-[#138808] py-3 rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Download size={20} />
//                   Download Media
//                 </button>
                
//                 <button
//                   onClick={handleShare}
//                   className="w-full bg-white/10 backdrop-blur-sm text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Share2 size={20} />
//                   Share This
//                 </button>
//               </div>
//             </div>

//             {/* Report Section */}
//             <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
//               <p className="text-sm text-amber-800 mb-3">
//                 Found an issue with this media? Help us maintain quality content.
//               </p>
//               <button className="text-amber-800 font-bold text-sm hover:text-amber-900 underline">
//                 Report This Media
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }