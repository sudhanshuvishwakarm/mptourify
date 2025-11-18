'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchMediaById } from '@/redux/slices/mediaSlice';
import { ArrowLeft, MapPin, Calendar, Camera, Tag, Share2, Play, Pause, Volume2, VolumeX, Maximize2, X, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function GalleryDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { selectedMedia, loading, error, media: allMedia } = useSelector((state) => state.media);
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Changed to false - video starts with sound
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVideoIcon, setShowVideoIcon] = useState(true);
  const videoRef = useRef(null);

  // Check if media is already in the list (from gallery page)
  const existingMedia = useMemo(() => {
    if (!params?.id) return null;
    return allMedia.find(item => item._id === params.id);
  }, [allMedia, params?.id]);

  // Smart useEffect - only fetch if not already loaded
  useEffect(() => {
    if (params?.id) {
      // If media is not in the list or selectedMedia is different, fetch it
      if (!existingMedia || selectedMedia?._id !== params.id) {
        dispatch(fetchMediaById(params.id));
      }
    }
  }, [dispatch, params?.id, existingMedia, selectedMedia]);

  // Use existing media data if available (for faster loading)
  const currentMedia = selectedMedia?._id === params?.id ? selectedMedia : existingMedia;

  // Memoized video controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setShowVideoIcon(false);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.log(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  }, [duration]);

  // Memoized utility functions
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  // Share functionality
  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert(`Please copy this link manually: ${window.location.href}`);
    }
  }, []);

  const handleSocialShare = useCallback((platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentMedia?.title || 'Check out this media');
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  }, [currentMedia]);

  // Memoized navigation handlers
  const handleBackToGallery = useCallback(() => {
    router.push('/gallery');
  }, [router]);

  const handleDistrictNavigation = useCallback((slug) => {
    if (slug) {
      router.push(`/districts/${slug}`);
    }
  }, [router]);

  const handlePanchayatNavigation = useCallback((slug) => {
    if (slug) {
      router.push(`/panchayats/${slug}`);
    }
  }, [router]);

  // Only show loader if no data exists and still loading
  const showLoader = loading && !currentMedia;

  if (showLoader) {
    return <Loader />;
  }

  if (error && !currentMedia) {
    return (
      <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
            <Camera size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#117307] mb-2">Media Not Found</h2>
          <p className="text-[#117307]/70 mb-6">The media you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center gap-2 bg-[#117307] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0d5c06] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  // Use currentMedia for rendering
  const displayMedia = currentMedia;

  if (!displayMedia) {
    return (
      <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <Camera size={64} className="mx-auto text-[#117307] opacity-20 mb-4" />
          <h2 className="text-2xl font-bold text-[#117307] mb-2">Loading Media...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header with Back Button and Share Button */}
      <div className="bg-[#117307] py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Back Button */}
            <button
              onClick={handleBackToGallery}
              className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
            >
              <ArrowLeft size={22} />
              Back to Gallery
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
              <h3 className="text-xl font-bold text-[#117307]">Share This Media</h3>
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
                Share this media with your friends and colleagues
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Media Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative bg-black">
                {displayMedia.fileType === 'video' ? (
                  <div className="relative aspect-video bg-black group">
                    {/* Video Player */}
                    <video
                      ref={videoRef}
                      src={displayMedia.fileUrl}
                      poster={displayMedia.thumbnailUrl}
                      className="w-full h-full object-contain max-h-[70vh]"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onPlay={() => {
                        setIsPlaying(true);
                        setShowVideoIcon(false);
                      }}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      muted={isMuted}
                      playsInline
                    />
                    
                    {/* Video Icon Overlay when not playing */}
                    {showVideoIcon && !isPlaying && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                          <Play size={48} className="text-white ml-2" />
                        </div>
                      </div>
                    )}
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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
                            className="bg-[#117307] h-1 rounded-full transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={togglePlay}
                              className="text-white hover:text-[#117307] transition-colors"
                            >
                              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            
                            <button
                              onClick={toggleMute}
                              className="text-white hover:text-[#117307] transition-colors"
                            >
                              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            
                            <span className="text-white text-sm font-medium">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>

                          {/* Fullscreen Button */}
                          <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-[#117307] transition-colors"
                          >
                            <Maximize2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isImageLoaded && (
                      <div className="aspect-video flex items-center justify-center bg-[#117307]/5">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#117307] border-t-transparent"></div>
                      </div>
                    )}
                    <img
                      src={displayMedia.fileUrl}
                      alt={displayMedia.title}
                      className={`w-full h-full object-contain max-h-[70vh] ${isImageLoaded ? 'block' : 'hidden'}`}
                      onLoad={() => setIsImageLoaded(true)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="aspect-video flex flex-col items-center justify-center bg-[#117307]/5">
                            <Camera size={64} class="text-[#117307] opacity-20 mb-2" />
                            <p class="text-[#117307] opacity-50 text-sm">Failed to load image</p>
                          </div>
                        `;
                      }}
                    />
                  </>
                )}
              </div>

              {/* Content Below Media */}
              <div className="p-8 lg:p-12">
                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-6 leading-tight">
                  {displayMedia.title}
                </h1>

                {/* Meta Information - Date and Category in same row */}
                <div className="flex justify-between items-center gap-6 pb-6 mb-6 border-b border-[#117307]/10">
                  {/* Date on left */}
                  {displayMedia.captureDate && (
                    <div className="flex items-center gap-2 text-[#4d674f] font-medium">
                      <Calendar size={18} className="text-[#1a5e10]" />
                      <span>
                        {new Date(displayMedia.captureDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}

                  {/* Category on right - Simple style like date */}
                  <div className="flex items-center gap-2 text-[#4d674f] font-medium">
                    <Tag size={18} className="text-[#1a5e10]" />
                    <span>{getCategoryLabel(displayMedia.category)}</span>
                  </div>
                </div>

                {/* Description */}
                {displayMedia.description && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
                      {displayMedia.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {displayMedia.tags && displayMedia.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#117307]/10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Tag size={18} className="text-[#117307]" />
                      <div className="flex flex-wrap gap-2">
                        {displayMedia.tags.map((tag, index) => (
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
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#117307]" />
                Location Details
              </h3>
              
              <div className="space-y-4">
                {displayMedia.district && (
                  <div className="pb-4 border-b border-[#117307]/10">
                    <p className="text-xs text-[#4d674f] mb-1 font-medium">District</p>
                    <button
                      onClick={() => handleDistrictNavigation(displayMedia.district?.slug)}
                      className="text-[#0d4d03] font-bold text-lg hover:text-[#117307] transition-colors hover:underline"
                    >
                      {displayMedia.district.name}
                    </button>
                  </div>
                )}

                {displayMedia.gramPanchayat && (
                  <div className="pb-4 border-b border-[#117307]/10">
                    <p className="text-xs text-[#4d674f] mb-1 font-medium">Gram Panchayat</p>
                    <button
                      onClick={() => handlePanchayatNavigation(displayMedia.gramPanchayat?.slug)}
                      className="text-[#0d4d03] font-bold hover:text-[#117307] transition-colors hover:underline"
                    >
                      {displayMedia.gramPanchayat.name}
                    </button>
                  </div>
                )}

                {!displayMedia.district && !displayMedia.gramPanchayat && (
                  <p className="text-[#4d674f] text-sm italic">Location information not available</p>
                )}
              </div>
            </div>

            {/* Capture Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
                <Camera size={20} className="text-[#117307]" />
                Capture Details
              </h3>
              
              <div className="space-y-4">
                {displayMedia.photographer && (
                  <div className="pb-4 border-b border-[#117307]/10">
                    <p className="text-xs text-[#4d674f] mb-1 font-medium">Photographer</p>
                    <p className="text-[#0d4d03] font-bold">{displayMedia.photographer}</p>
                  </div>
                )}

                {displayMedia.createdAt && (
                  <div>
                    <p className="text-xs text-[#4d674f] mb-1 font-medium">Uploaded On</p>
                    <p className="text-[#0d4d03] font-medium text-sm">
                      {new Date(displayMedia.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
              <p className="text-white/90 text-sm mb-4">
                Get the latest media and updates delivered to your inbox.
              </p>
              <button className="w-full bg-white text-[#117307] py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
                Subscribe Now
              </button>
            </div>   
          </div>
        </div>
      </div>
    </div>
  );
}// 'use client';

// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchMediaById } from '@/redux/slices/mediaSlice';
// import { ArrowLeft, MapPin, Calendar, Camera, Tag, Video, Image, Share2, Download, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function GalleryDetailPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const { selectedMedia, loading, error, media: allMedia } = useSelector((state) => state.media);
  
//   const [isImageLoaded, setIsImageLoaded] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const videoRef = useRef(null);

//   // Check if media is already in the list (from gallery page)
//   const existingMedia = useMemo(() => {
//     if (!params?.id) return null;
//     return allMedia.find(item => item._id === params.id);
//   }, [allMedia, params?.id]);

//   // Smart useEffect - only fetch if not already loaded
//   useEffect(() => {
//     if (params?.id) {
//       // If media is not in the list or selectedMedia is different, fetch it
//       if (!existingMedia || selectedMedia?._id !== params.id) {
//         dispatch(fetchMediaById(params.id));
//       }
//     }
//   }, [dispatch, params?.id, existingMedia, selectedMedia]);

//   // Use existing media data if available (for faster loading)
//   const currentMedia = selectedMedia?._id === params?.id ? selectedMedia : existingMedia;

//   // Memoized video controls
//   const togglePlay = useCallback(() => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   }, [isPlaying]);

//   const toggleMute = useCallback(() => {
//     if (videoRef.current) {
//       videoRef.current.muted = !videoRef.current.muted;
//       setIsMuted(!isMuted);
//     }
//   }, [isMuted]);

//   const handleTimeUpdate = useCallback(() => {
//     if (videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//       setDuration(videoRef.current.duration || 0);
//     }
//   }, []);

//   const handleLoadedMetadata = useCallback(() => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration);
//     }
//   }, []);

//   const handleSeek = useCallback((e) => {
//     if (videoRef.current && duration) {
//       const rect = e.currentTarget.getBoundingClientRect();
//       const percent = (e.clientX - rect.left) / rect.width;
//       videoRef.current.currentTime = percent * duration;
//     }
//   }, [duration]);

//   // Memoized utility functions
//   const formatTime = useCallback((time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   }, []);

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

//   const handleShare = useCallback(async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: currentMedia?.title,
//           text: currentMedia?.description,
//           url: window.location.href,
//         });
//       } catch (err) {
//         console.log('Share failed:', err);
//       }
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert('Link copied to clipboard!');
//     }
//   }, [currentMedia]);

//   // Memoized navigation handlers
//   const handleBackToGallery = useCallback(() => {
//     router.push('/gallery');
//   }, [router]);

//   const handleDistrictNavigation = useCallback((slug) => {
//     if (slug) {
//       router.push(`/districts/${slug}`);
//     }
//   }, [router]);

//   const handlePanchayatNavigation = useCallback((slug) => {
//     if (slug) {
//       router.push(`/panchayats/${slug}`);
//     }
//   }, [router]);

//   // Only show loader if no data exists and still loading
//   const showLoader = loading && !currentMedia;

//   if (showLoader) {
//     return <Loader />;
//   }

//   if (error && !currentMedia) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <Camera size={64} className="mx-auto text-red-500 mb-4" />
//           <h2 className="text-2xl font-bold text-[#117307] mb-2">Media Not Found</h2>
//           <p className="text-[#117307]/70 mb-6">The media you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={handleBackToGallery}
//             className="bg-[#117307] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d5c06] transition-colors"
//           >
//             Back to Gallery
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Use currentMedia for rendering - rename to avoid conflict
//   const displayMedia = currentMedia;

//   if (!displayMedia) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <Camera size={64} className="mx-auto text-[#117307] opacity-20 mb-4" />
//           <h2 className="text-2xl font-bold text-[#117307] mb-2">Loading Media...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Navigation Header */}
//       <div className="bg-[#127307] border-b-2 border-[#117307]/10 sticky top-0 z-10 shadow-sm">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <div className="flex items-center  justify-between">
//             <button
//               onClick={handleBackToGallery}
//               className="flex items-center gap-2 text-white font-bold hover:text-[#0d5c06] transition-colors"
//             >
//               <ArrowLeft size={20} />
//               <span className="hidden sm:inline">Back to Gallery</span>
//               <span className="sm:hidden">Back</span>
//             </button>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleShare}
//                 className="p-2 rounded-lg bg-[#117307]/10 text-[#117307] text-white transition-colors"
//                 title="Share"
//               >
//                 <Share2 size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Media Display */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Media Container */}
//             <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
//               <div className="relative bg-black">
//                 {displayMedia.fileType === 'video' ? (
//                   <div className="relative aspect-video bg-black group">
//                     {/* Video Player */}
//                     <video
//                       ref={videoRef}
//                       src={displayMedia.fileUrl}
//                       poster={displayMedia.thumbnailUrl}
//                       className="w-full h-full object-contain max-h-[70vh]"
//                       onTimeUpdate={handleTimeUpdate}
//                       onLoadedMetadata={handleLoadedMetadata}
//                       onPlay={() => setIsPlaying(true)}
//                       onPause={() => setIsPlaying(false)}
//                       onEnded={() => setIsPlaying(false)}
//                       muted={isMuted}
//                       playsInline
//                     />
                    
//                     {/* Video Controls Overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                       {/* Top Controls - Only Category */}
//                       <div className="absolute top-4 left-4">
//                         <div className={`${getCategoryColor(displayMedia.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                           {getCategoryLabel(displayMedia.category)}
//                         </div>
//                       </div>

//                       {/* Center Play Button */}
//                       <button
//                         onClick={togglePlay}
//                         className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
//                       >
//                         {isPlaying ? (
//                           <Pause size={32} className="text-white" />
//                         ) : (
//                           <Play size={32} className="text-white ml-1" />
//                         )}
//                       </button>

//                       {/* Bottom Controls */}
//                       <div className="absolute bottom-4 left-4 right-4">
//                         {/* Progress Bar */}
//                         <div 
//                           className="w-full bg-white/30 h-1 rounded-full mb-3 cursor-pointer"
//                           onClick={handleSeek}
//                         >
//                           <div 
//                             className="bg-[#117307] h-1 rounded-full transition-all"
//                             style={{ width: `${(currentTime / duration) * 100}%` }}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <button
//                               onClick={togglePlay}
//                               className="text-white hover:text-[#117307] transition-colors"
//                             >
//                               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                             </button>
                            
//                             <button
//                               onClick={toggleMute}
//                               className="text-white hover:text-[#117307] transition-colors"
//                             >
//                               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
//                             </button>
                            
//                             <span className="text-white text-sm font-medium">
//                               {formatTime(currentTime)} / {formatTime(duration)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     {!isImageLoaded && (
//                       <div className="aspect-video flex items-center justify-center bg-[#117307]/5">
//                         <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#117307] border-t-transparent"></div>
//                       </div>
//                     )}
//                     <img
//                       src={displayMedia.fileUrl}
//                       alt={displayMedia.title}
//                       className={`w-full object-contain max-h-[70vh] ${isImageLoaded ? 'block' : 'hidden'}`}
//                       onLoad={() => setIsImageLoaded(true)}
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         const parent = e.target.parentElement;
//                         parent.innerHTML = `
//                           <div class="aspect-video flex flex-col items-center justify-center bg-[#117307]/5">
//                             <Image size={64} class="text-[#117307] opacity-20 mb-2" />
//                             <p class="text-[#117307] opacity-50 text-sm">Failed to load image</p>
//                           </div>
//                         `;
//                       }}
//                     />
//                   </>
//                 )}
//               </div>

//               {/* Media Info Bar - Removed type indicator */}
//               <div className="p-4 bg-[#117307]/5 border-t-2 border-[#117307]/10">
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-4">
//                     {/* Removed file type indicator */}
//                   </div>
//                   {displayMedia.fileType === 'image' && (
//                     <div className={`${getCategoryColor(displayMedia.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
//                       {getCategoryLabel(displayMedia.category)}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Description Section */}
//             <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
//               <h1 className="text-2xl lg:text-3xl font-bold text-[#0d4d03] mb-4 leading-tight">
//                 {displayMedia.title}
//               </h1>
              
//               <div className="prose prose-lg max-w-none">
//                 <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                   {displayMedia.description}
//                 </p>
//               </div>
//             </div>

//             {/* Tags Section */}
//             {displayMedia.tags && displayMedia.tags.length > 0 && (
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <div className="flex items-center gap-2 mb-4">
//                   <Tag size={20} className="text-[#117307]" />
//                   <h3 className="text-lg font-bold text-[#117307]">Tags</h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {displayMedia.tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className="bg-[#117307]/10 text-[#117307] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#117307] hover:text-white transition-colors cursor-pointer"
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
//               <h3 className="text-lg font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                 <MapPin size={20} className="text-[#117307]" />
//                 Location Details
//               </h3>
              
//               <div className="space-y-4">
//                 {displayMedia.district && (
//                   <div className="pb-4 border-b border-[#117307]/10">
//                     <p className="text-xs text-[#4d674f] mb-1 font-medium">District</p>
//                     <button
//                       onClick={() => handleDistrictNavigation(displayMedia.district?.slug)}
//                       className="text-[#0d4d03] font-bold text-lg hover:text-[#117307] transition-colors hover:underline"
//                     >
//                       {displayMedia.district.name}
//                     </button>
//                   </div>
//                 )}

//                 {displayMedia.gramPanchayat && (
//                   <div className="pb-4 border-b border-[#117307]/10">
//                     <p className="text-xs text-[#4d674f] mb-1 font-medium">Gram Panchayat</p>
//                     <button
//                       onClick={() => handlePanchayatNavigation(displayMedia.gramPanchayat?.slug)}
//                       className="text-[#0d4d03] font-bold hover:text-[#117307] transition-colors hover:underline"
//                     >
//                       {displayMedia.gramPanchayat.name}
//                     </button>
//                   </div>
//                 )}

//                 {!displayMedia.district && !displayMedia.gramPanchayat && (
//                   <p className="text-[#4d674f] text-sm italic">Location information not available</p>
//                 )}
//               </div>
//             </div>

//             {/* Capture Details */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-lg font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                 <Camera size={20} className="text-[#117307]" />
//                 Capture Details
//               </h3>
              
//               <div className="space-y-4">
//                 {displayMedia.photographer && (
//                   <div className="pb-4 border-b border-[#117307]/10">
//                     <p className="text-xs text-[#4d674f] mb-1 font-medium">Photographer</p>
//                     <p className="text-[#0d4d03] font-bold">{displayMedia.photographer}</p>
//                   </div>
//                 )}

//                 {displayMedia.captureDate && (
//                   <div className="pb-4 border-b border-[#117307]/10">
//                     <p className="text-xs text-[#4d674f] mb-1 font-medium">Captured On</p>
//                     <div className="flex items-center gap-2">
//                       <Calendar size={16} className="text-[#117307]" />
//                       <p className="text-[#0d4d03] font-bold">
//                         {new Date(displayMedia.captureDate).toLocaleDateString('en-US', { 
//                           year: 'numeric',
//                           month: 'long', 
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {displayMedia.createdAt && (
//                   <div>
//                     <p className="text-xs text-[#4d674f] mb-1 font-medium">Uploaded On</p>
//                     <p className="text-[#0d4d03] font-medium text-sm">
//                       {new Date(displayMedia.createdAt).toLocaleDateString('en-US', { 
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
//             <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-2xl p-6 shadow-lg text-white">
//               <h3 className="text-lg font-bold mb-4">Actions</h3>
              
//               <div className="space-y-3">
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

// 'use client';

// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchMediaById } from '@/redux/slices/mediaSlice';
// import { ArrowLeft, MapPin, Calendar, Camera, Tag, Video, Image, Share2, Download, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function GalleryDetailPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const { selectedMedia, loading, error, media: allMedia } = useSelector((state) => state.media);
  
//   const [isImageLoaded, setIsImageLoaded] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const videoRef = useRef(null);

//   // Check if media is already in the list (from gallery page)
//   const existingMedia = useMemo(() => {
//     if (!params?.id) return null;
//     return allMedia.find(item => item._id === params.id);
//   }, [allMedia, params?.id]);

//   // Smart useEffect - only fetch if not already loaded
//   useEffect(() => {
//     if (params?.id) {
//       // If media is not in the list or selectedMedia is different, fetch it
//       if (!existingMedia || selectedMedia?._id !== params.id) {
//         dispatch(fetchMediaById(params.id));
//       }
//     }
//   }, [dispatch, params?.id, existingMedia, selectedMedia]);

//   // Use existing media data if available (for faster loading)
//   const currentMedia = selectedMedia?._id === params?.id ? selectedMedia : existingMedia;

//   // Memoized video controls
//   const togglePlay = useCallback(() => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   }, [isPlaying]);

//   const toggleMute = useCallback(() => {
//     if (videoRef.current) {
//       videoRef.current.muted = !videoRef.current.muted;
//       setIsMuted(!isMuted);
//     }
//   }, [isMuted]);

//   const handleTimeUpdate = useCallback(() => {
//     if (videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//       setDuration(videoRef.current.duration || 0);
//     }
//   }, []);

//   const handleLoadedMetadata = useCallback(() => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration);
//     }
//   }, []);

//   const handleSeek = useCallback((e) => {
//     if (videoRef.current && duration) {
//       const rect = e.currentTarget.getBoundingClientRect();
//       const percent = (e.clientX - rect.left) / rect.width;
//       videoRef.current.currentTime = percent * duration;
//     }
//   }, [duration]);

//   // Memoized utility functions
//   const formatTime = useCallback((time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   }, []);

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

//   const handleShare = useCallback(async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: currentMedia?.title,
//           text: currentMedia?.description,
//           url: window.location.href,
//         });
//       } catch (err) {
//         console.log('Share failed:', err);
//       }
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert('Link copied to clipboard!');
//     }
//   }, [currentMedia]);

//   // Memoized navigation handlers
//   const handleBackToGallery = useCallback(() => {
//     router.push('/gallery');
//   }, [router]);

//   const handleDistrictNavigation = useCallback((slug) => {
//     if (slug) {
//       router.push(`/districts/${slug}`);
//     }
//   }, [router]);

//   const handlePanchayatNavigation = useCallback((slug) => {
//     if (slug) {
//       router.push(`/panchayats/${slug}`);
//     }
//   }, [router]);

//   // Only show loader if no data exists and still loading
//   const showLoader = loading && !currentMedia;

//   if (showLoader) {
//     return <Loader />;
//   }

//   if (error && !currentMedia) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <Camera size={64} className="mx-auto text-red-500 mb-4" />
//           <h2 className="text-2xl font-bold text-[#138808] mb-2">Media Not Found</h2>
//           <p className="text-[#138808]/70 mb-6">The media you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={handleBackToGallery}
//             className="bg-[#138808] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d5c06] transition-colors"
//           >
//             Back to Gallery
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Use currentMedia for rendering - rename to avoid conflict
//   const displayMedia = currentMedia;

//   if (!displayMedia) {
//     return (
//       <div className="min-h-screen bg-[#f5fbf2] flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
//           <Camera size={64} className="mx-auto text-[#138808] opacity-20 mb-4" />
//           <h2 className="text-2xl font-bold text-[#138808] mb-2">Loading Media...</h2>
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
//               onClick={handleBackToGallery}
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
//                 {displayMedia.fileType === 'video' ? (
//                   <div className="relative aspect-video bg-black group">
//                     {/* Video Player */}
//                     <video
//                       ref={videoRef}
//                       src={displayMedia.fileUrl}
//                       poster={displayMedia.thumbnailUrl}
//                       className="w-full h-full object-contain max-h-[70vh]"
//                       onTimeUpdate={handleTimeUpdate}
//                       onLoadedMetadata={handleLoadedMetadata}
//                       onPlay={() => setIsPlaying(true)}
//                       onPause={() => setIsPlaying(false)}
//                       onEnded={() => setIsPlaying(false)}
//                       muted={isMuted}
//                       playsInline
//                     />
                    
//                     {/* Video Controls Overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                       {/* Top Controls */}
//                       <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
//                         <div className={`${getCategoryColor(displayMedia.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                           {getCategoryLabel(displayMedia.category)}
//                         </div>
//                         <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                           <Video size={14} />
//                           Video
//                         </div>
//                       </div>

//                       {/* Center Play Button */}
//                       <button
//                         onClick={togglePlay}
//                         className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
//                       >
//                         {isPlaying ? (
//                           <Pause size={32} className="text-white" />
//                         ) : (
//                           <Play size={32} className="text-white ml-1" />
//                         )}
//                       </button>

//                       {/* Bottom Controls */}
//                       <div className="absolute bottom-4 left-4 right-4">
//                         {/* Progress Bar */}
//                         <div 
//                           className="w-full bg-white/30 h-1 rounded-full mb-3 cursor-pointer"
//                           onClick={handleSeek}
//                         >
//                           <div 
//                             className="bg-[#138808] h-1 rounded-full transition-all"
//                             style={{ width: `${(currentTime / duration) * 100}%` }}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <button
//                               onClick={togglePlay}
//                               className="text-white hover:text-[#138808] transition-colors"
//                             >
//                               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                             </button>
                            
//                             <button
//                               onClick={toggleMute}
//                               className="text-white hover:text-[#138808] transition-colors"
//                             >
//                               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
//                             </button>
                            
//                             <span className="text-white text-sm font-medium">
//                               {formatTime(currentTime)} / {formatTime(duration)}
//                             </span>
//                           </div>
//                         </div>
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
//                       src={displayMedia.fileUrl}
//                       alt={displayMedia.title}
//                       className={`w-full object-contain max-h-[70vh] ${isImageLoaded ? 'block' : 'hidden'}`}
//                       onLoad={() => setIsImageLoaded(true)}
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                         const parent = e.target.parentElement;
//                         parent.innerHTML = `
//                           <div class="aspect-video flex flex-col items-center justify-center bg-[#138808]/5">
//                             <Image size={64} class="text-[#138808] opacity-20 mb-2" />
//                             <p class="text-[#138808] opacity-50 text-sm">Failed to load image</p>
//                           </div>
//                         `;
//                       }}
//                     />
//                   </>
//                 )}
//               </div>

//               {/* Media Info Bar */}
//               <div className="p-4 bg-[#138808]/5 border-t-2 border-[#138808]/10">
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-1.5 text-[#138808]">
//                       {displayMedia.fileType === 'video' ? (
//                         <Video size={16} />
//                       ) : (
//                         <Image size={16} />
//                       )}
//                       <span className="font-medium">
//                         {displayMedia.fileType === 'video' ? 'Video' : 'Photo'}
//                       </span>
//                     </div>
//                   </div>
//                   {displayMedia.fileType === 'image' && (
//                     <div className={`${getCategoryColor(displayMedia.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
//                       {getCategoryLabel(displayMedia.category)}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Description Section */}
//             <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg">
//               <h1 className="text-2xl lg:text-3xl font-bold text-[#138808] mb-4 leading-tight">
//                 {displayMedia.title}
//               </h1>
              
//               <div className="prose prose-lg max-w-none">
//                 <p className="text-[#138808]/80 leading-relaxed whitespace-pre-line">
//                   {displayMedia.description}
//                 </p>
//               </div>
//             </div>

//             {/* Tags Section */}
//             {displayMedia.tags && displayMedia.tags.length > 0 && (
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <div className="flex items-center gap-2 mb-4">
//                   <Tag size={20} className="text-[#138808]" />
//                   <h3 className="text-lg font-bold text-[#138808]">Tags</h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {displayMedia.tags.map((tag, index) => (
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
//                 {displayMedia.district && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">District</p>
//                     <button
//                       onClick={() => handleDistrictNavigation(displayMedia.district?.slug)}
//                       className="text-[#138808] font-bold text-lg hover:text-[#0d5c06] transition-colors hover:underline"
//                     >
//                       {displayMedia.district.name}
//                     </button>
//                   </div>
//                 )}

//                 {displayMedia.gramPanchayat && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Gram Panchayat</p>
//                     <button
//                       onClick={() => handlePanchayatNavigation(displayMedia.gramPanchayat?.slug)}
//                       className="text-[#138808] font-bold hover:text-[#0d5c06] transition-colors hover:underline"
//                     >
//                       {displayMedia.gramPanchayat.name}
//                     </button>
//                   </div>
//                 )}

//                 {!displayMedia.district && !displayMedia.gramPanchayat && (
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
//                 {displayMedia.photographer && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Photographer</p>
//                     <p className="text-[#138808] font-bold">{displayMedia.photographer}</p>
//                   </div>
//                 )}

//                 {displayMedia.captureDate && (
//                   <div className="pb-4 border-b border-[#138808]/10">
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Captured On</p>
//                     <div className="flex items-center gap-2">
//                       <Calendar size={16} className="text-[#138808]" />
//                       <p className="text-[#138808] font-bold">
//                         {new Date(displayMedia.captureDate).toLocaleDateString('en-US', { 
//                           year: 'numeric',
//                           month: 'long', 
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {displayMedia.createdAt && (
//                   <div>
//                     <p className="text-xs text-[#138808]/60 mb-1 font-medium">Uploaded On</p>
//                     <p className="text-[#138808] font-medium text-sm">
//                       {new Date(displayMedia.createdAt).toLocaleDateString('en-US', { 
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


// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchMediaById } from '@/redux/slices/mediaSlice';
// import { ArrowLeft, MapPin, Calendar, Camera, Tag, Video, Image, Share2, Download, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function GalleryDetailPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const { selectedMedia, loading, error } = useSelector((state) => state.media);
  
//   const [isImageLoaded, setIsImageLoaded] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (params?.id) {
//       dispatch(fetchMediaById(params.id));
//     }
//   }, [dispatch, params?.id]);

//   // Video controls
//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const toggleMute = () => {
//     if (videoRef.current) {
//       videoRef.current.muted = !videoRef.current.muted;
//       setIsMuted(!isMuted);
//     }
//   };

//   const handleTimeUpdate = () => {
//     if (videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//       setDuration(videoRef.current.duration || 0);
//     }
//   };

//   const handleLoadedMetadata = () => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration);
//     }
//   };

//   const handleSeek = (e) => {
//     if (videoRef.current) {
//       const rect = e.currentTarget.getBoundingClientRect();
//       const percent = (e.clientX - rect.left) / rect.width;
//       videoRef.current.currentTime = percent * duration;
//     }
//   };

//   const formatTime = (time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

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
//           title: selectedMedia?.title,
//           text: selectedMedia?.description,
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

//   // const handleDownload = () => {
//   //   if (!selectedMedia) return;
    
//   //   const link = document.createElement('a');
//   //   link.href = selectedMedia.fileUrl;
//   //   link.download = selectedMedia.title;
//   //   link.target = '_blank';
//   //   document.body.appendChild(link);
//   //   link.click();
//   //   document.body.removeChild(link);
//   // };

//   if (loading) {
//     return <Loader />;
//   }

//   if (error || !selectedMedia) {
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

//   const media = selectedMedia;

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
//               {/* <button
//                 onClick={handleDownload}
//                 className="p-2 rounded-lg bg-[#138808]/10 text-[#138808] hover:bg-[#138808] hover:text-white transition-colors"
//                 title="Download"
//               >
//                 <Download size={20} />
//               </button> */}
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
//                   <div className="relative aspect-video bg-black group">
//                     {/* Video Player */}
//                     <video
//                       ref={videoRef}
//                       src={media.fileUrl}
//                       poster={media.thumbnailUrl}
//                       className="w-full h-full object-contain max-h-[70vh]"
//                       onTimeUpdate={handleTimeUpdate}
//                       onLoadedMetadata={handleLoadedMetadata}
//                       onPlay={() => setIsPlaying(true)}
//                       onPause={() => setIsPlaying(false)}
//                       onEnded={() => setIsPlaying(false)}
//                       muted={isMuted}
//                       playsInline
//                     />
                    
//                     {/* Video Controls Overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                       {/* Top Controls */}
//                       <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
//                         <div className={`${getCategoryColor(media.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
//                           {getCategoryLabel(media.category)}
//                         </div>
//                         <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
//                           <Video size={14} />
//                           Video
//                         </div>
//                       </div>

//                       {/* Center Play Button */}
//                       <button
//                         onClick={togglePlay}
//                         className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
//                       >
//                         {isPlaying ? (
//                           <Pause size={32} className="text-white" />
//                         ) : (
//                           <Play size={32} className="text-white ml-1" />
//                         )}
//                       </button>

//                       {/* Bottom Controls */}
//                       <div className="absolute bottom-4 left-4 right-4">
//                         {/* Progress Bar */}
//                         <div 
//                           className="w-full bg-white/30 h-1 rounded-full mb-3 cursor-pointer"
//                           onClick={handleSeek}
//                         >
//                           <div 
//                             className="bg-[#138808] h-1 rounded-full transition-all"
//                             style={{ width: `${(currentTime / duration) * 100}%` }}
//                           />
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <button
//                               onClick={togglePlay}
//                               className="text-white hover:text-[#138808] transition-colors"
//                             >
//                               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                             </button>
                            
//                             <button
//                               onClick={toggleMute}
//                               className="text-white hover:text-[#138808] transition-colors"
//                             >
//                               {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
//                             </button>
                            
//                             <span className="text-white text-sm font-medium">
//                               {formatTime(currentTime)} / {formatTime(duration)}
//                             </span>
//                           </div>

//                           {/* <button
//                             onClick={handleDownload}
//                             className="bg-[#138808] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d5c06] transition-colors flex items-center gap-2"
//                           >
//                             <Download size={16} />
//                             Download
//                           </button> */}
//                         </div>
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
//                         const parent = e.target.parentElement;
//                         parent.innerHTML = `
//                           <div class="aspect-video flex flex-col items-center justify-center bg-[#138808]/5">
//                             <Image size={64} class="text-[#138808] opacity-20 mb-2" />
//                             <p class="text-[#138808] opacity-50 text-sm">Failed to load image</p>
//                           </div>
//                         `;
//                       }}
//                     />
//                   </>
//                 )}
//               </div>

//               {/* Media Info Bar */}
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
//                     {/* <div className="flex items-center gap-1.5 text-[#138808]/60">
//                       <Eye size={16} />
//                       <span>{media.views || 0} views</span>
//                     </div> */}
//                   </div>
//                   {media.fileType === 'image' && (
//                     <div className={`${getCategoryColor(media.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
//                       {getCategoryLabel(media.category)}
//                     </div>
//                   )}
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
//                       onClick={() => media.district?.slug && router.push(`/districts/${media.district.slug}`)}
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
//                       onClick={() => media.gramPanchayat?.slug && router.push(`/panchayats/${media.gramPanchayat.slug}`)}
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
//                 {/* <button
//                   onClick={handleDownload}
//                   className="w-full bg-white text-[#138808] py-3 rounded-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Download size={20} />
//                   Download Media
//                 </button> */}
                
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
