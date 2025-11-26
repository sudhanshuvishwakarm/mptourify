'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MapPin, Calendar, Users, Mountain, Droplet, 
  Camera, Newspaper, Building2, ArrowLeft, User,Share2,
  Landmark, Trees, BookOpen, Loader2, Video, Image as ImageIcon
} from 'lucide-react';
import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DistrictDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const { selectedDistrict, districtCache, error: reduxError } = useSelector(state => state.district);
  const { media } = useSelector(state => state.media);
  console.log(selectedDistrict)
  const [activeTab, setActiveTab] = useState('history-culture');
  const [isLoading, setIsLoading] = useState(true);
  const [currentDistrict, setCurrentDistrict] = useState(null);
  const [districtMedia, setDistrictMedia] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) {
      setIsLoading(false);
      setError("No district slug provided");
      return;
    }

    const loadDistrict = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const cached = districtCache[slug];
        const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000;
        
        if (isCacheValid) {
          setCurrentDistrict(cached.data);
          loadMediaForDistrict(cached.data._id);
          setIsLoading(false);
          return;
        }

        if (selectedDistrict && selectedDistrict.slug === slug) {
          setCurrentDistrict(selectedDistrict);
          loadMediaForDistrict(selectedDistrict._id);
          setIsLoading(false);
          return;
        }

        const result = await dispatch(fetchDistrictBySlug(slug)).unwrap();
        
        if (result.district) {
          setCurrentDistrict(result.district);
          loadMediaForDistrict(result.district._id);
        } else {
          setError("District not found");
        }
      } catch (err) {
        console.error('Error loading district:', err);
        setError(err?.message || "Failed to load district");
      } finally {
        setIsLoading(false);
      }
    };

    const loadMediaForDistrict = async (districtId) => {
      try {
        const mediaResult = await dispatch(fetchMedia({ 
          district: districtId,
          status: 'approved',
          limit: 50
        })).unwrap();
        setDistrictMedia(mediaResult.media || []);
      } catch (err) {
        console.error('Error loading media:', err);
      }
    };

    loadDistrict();
  }, [params?.slug, dispatch, districtCache, selectedDistrict]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
          <p className="text-[#117307] text-lg font-medium">Loading district...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !currentDistrict) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
        <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">District Not Found</h2>
          <p className="text-[#1a5e10] mb-6">
            {error || reduxError || "The district you're looking for doesn't exist."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outlined" onClick={() => router.push('/districts')} sx={{ borderColor: '#117307', color: '#117307' }}>
              Back to Districts
            </Button>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ backgroundColor: '#117307' }}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const tabs = [
    { id: 'history-culture', label: 'History & Culture', icon: BookOpen },
    { id: 'basic-info', label: 'Basic Info', icon: Building2 },
    { id: 'media', label: 'Media Gallery', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      <div className="bg-[#117307] py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center">
            <button onClick={() => router.push('/districts')} className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
              <ArrowLeft size={22} />
              Back to Districts
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: currentDistrict.name,
                    text: `Explore ${currentDistrict.name} - Madhya Pradesh`,
                    url: window.location.href
                  });
                }
              }}
              className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
            >
              <Share2 size={22} />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
              <div className="relative bg-[#f5fbf2]">
                {currentDistrict.headerImage ? (
                  <img
                    src={currentDistrict.headerImage}
                    alt={currentDistrict.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div className={`absolute inset-0 items-center justify-center bg-[#117307] ${currentDistrict.headerImage ? 'hidden' : 'flex'}`}>
                  <Landmark size={96} className="text-white opacity-50" />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-3">
                {currentDistrict.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-[#4d674f]">
                {currentDistrict.formationYear && (
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#1a5e10]" />
                    <span className="font-medium">Est. {currentDistrict.formationYear}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#1a5e10]" />
                  <span className="font-medium">Madhya Pradesh</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 border-b-2 border-[#f5fbf2]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
                    style={{
                      color: activeTab === tab.id ? '#117307' : '#1a5e10',
                      borderBottom: activeTab === tab.id ? '3px solid #117307' : 'none',
                      marginBottom: '-2px'
                    }}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {activeTab === 'history-culture' && (
                <Card>
                  <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
                    <BookOpen size={24} className="text-[#117307]" />
                    History & Cultural Heritage
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
                      {currentDistrict.historyAndCulture || 
                        `${currentDistrict.name} has a rich historical and cultural heritage that dates back centuries. The district has witnessed various dynasties and rulers, each contributing to its diverse cultural tapestry.`}
                    </p>
                  </div>
                </Card>
              )}

              {activeTab === 'basic-info' && (
                <div className="space-y-6">
                  <Card>
                    <h2 className="text-2xl font-bold text-[#0d4d03] mb-6">Key Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
                        <div className="flex justify-center mb-2">
                          <Users size={24} className="text-[#117307]" />
                        </div>
                        <h3 className="text-base font-semibold text-[#4d674f] mb-1">Population</h3>
                        <p className="text-2xl font-bold text-[#0d4d03]">
                          {formatNumber(currentDistrict.population)}
                        </p>
                      </div>

                      <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
                        <div className="flex justify-center mb-2">
                          <Mountain size={24} className="text-[#117307]" />
                        </div>
                        <h3 className="text-base font-semibold text-[#4d674f] mb-1">Area</h3>
                        <p className="text-2xl font-bold text-[#0d4d03]">
                          {currentDistrict.area ? `${currentDistrict.area.toLocaleString()} km²` : 'N/A'}
                        </p>
                      </div>

                      <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
                        <div className="flex justify-center mb-2">
                          <Building2 size={24} className="text-[#117307]" />
                        </div>
                        <h3 className="text-base font-semibold text-[#4d674f] mb-1">Establishment</h3>
                        <p className="text-2xl font-bold text-[#0d4d03]">
                          {currentDistrict.formationYear || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {currentDistrict.majorRivers && currentDistrict.majorRivers.length > 0 && (
                    <Card>
                      <div className="flex items-center gap-3 mb-4">
                        <Droplet size={24} className="text-[#117307]" />
                        <h3 className="text-xl font-bold text-[#0d4d03]">Major Rivers</h3>
                        <span className="text-base font-bold text-[#117307] ml-auto">
                          {currentDistrict.majorRivers.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentDistrict.majorRivers.map((river, idx) => (
                          <span key={idx} className="bg-[#117307]/10 text-[#117307] px-3 py-1 rounded-full text-sm font-medium">
                            {river}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
                    (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
                    <Card>
                      <div className="flex items-center gap-3 mb-4">
                        <Trees size={24} className="text-[#117307]" />
                        <h3 className="text-xl font-bold text-[#0d4d03]">Natural Attractions</h3>
                        <span className="text-base font-bold text-[#117307] ml-auto">
                          {(currentDistrict.hills?.length || 0) + (currentDistrict.naturalSpots?.length || 0)}
                        </span>
                      </div>
                      
                      {currentDistrict.hills && currentDistrict.hills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-[#0d4d03] mb-2 flex items-center gap-2">
                            <Mountain size={18} className="text-[#117307]" />
                            Hills & Mountains
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {currentDistrict.hills.map((hill, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#f5fbf2]">
                                <Mountain size={16} className="text-[#117307]" />
                                <span className="text-[#0d4d03] font-medium text-sm">{hill}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-[#0d4d03] mb-2 flex items-center gap-2">
                            <Trees size={18} className="text-[#117307]" />
                            Natural Spots
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {currentDistrict.naturalSpots.map((spot, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#f5fbf2]">
                                <Trees size={16} className="text-[#117307]" />
                                <span className="text-[#0d4d03] font-medium text-sm">{spot}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <Card>
                  <h2 className="text-2xl font-bold text-[#0d4d03] mb-6 flex items-center gap-2">
                    <Camera size={24} className="text-[#117307]" />
                    Media Gallery
                    {districtMedia.length > 0 && (
                      <span className="text-base font-bold text-[#117307] ml-auto">
                        {districtMedia.length} {districtMedia.length === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </h2>
                  
                  {districtMedia.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {districtMedia.map((mediaItem) => (
                        <div
                          key={mediaItem._id}
                          className="relative group rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/gallery/${mediaItem._id}`)}
                        >
                          <div className="aspect-video bg-[#f5fbf2]">
                            {mediaItem.fileType === 'video' ? (
                              mediaItem.thumbnailUrl ? (
                                <>
                                  <img
                                    src={mediaItem.thumbnailUrl}
                                    alt={mediaItem.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                      <Video size={32} className="text-white" />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
                                  <Video size={48} className="text-[#117307]" />
                                </div>
                              )
                            ) : (
                              <img
                                src={mediaItem.fileUrl}
                                alt={mediaItem.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white font-semibold line-clamp-2">{mediaItem.title}</p>
                            </div>
                          </div>
                          {mediaItem.fileType === 'video' && (
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                              <Video size={16} className="text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon size={48} className="mx-auto text-[#117307] opacity-20 mb-4" />
                      <p className="text-[#1a5e10]">No media available yet</p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>

          <div className="lg:w-1/4">
            <div className="space-y-4 sticky top-24">
                  <Card sx={{ p: 4 }}>
      <h3 className="text-lg font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
        <User size={18} className="text-[#117307]" />
        Created By
      </h3>
      {currentDistrict.createdBy ? (
        <div className="space-y-2">
          <p className="text-[#1a5e10] text-base">
            <span className="font-medium">Admin:</span> {currentDistrict.createdBy.name || 'Admin User'}
          </p>
          {currentDistrict.createdAt && (
            <p className="text-[#1a5e10] text-base">
            <span className="font-medium">Email:</span> {currentDistrict.createdBy.email || ''}
          </p>
          )}
        </div>
      ) : (
        <p className="text-[#4d674f] text-base">Information not available</p>
      )}
    </Card>
              <div className="flex flex-col gap-4">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Building2 size={18} />}
                  onClick={() => router.push(`/panchayats?district=${currentDistrict._id}`)}
                  sx={{ py: 2, backgroundColor: '#117307', fontSize: '0.875rem', '&:hover': { backgroundColor: '#0d5c06' } }}
                >
                  View Panchayats
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Camera size={18} />}
                  onClick={() => router.push(`/gallery?district=${currentDistrict._id}`)}
                  sx={{ py: 2, backgroundColor: '#117307', fontSize: '0.875rem', '&:hover': { backgroundColor: '#0d5c06' } }}
                >
                  Visit Gallery
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Newspaper size={18} />}
                  onClick={() => router.push(`/news?district=${currentDistrict._id}`)}
                  sx={{ py: 2, backgroundColor: '#117307', fontSize: '0.875rem', '&:hover': { backgroundColor: '#0d5c06' } }}
                >
                  Latest News
                </Button>
              </div>
            
              {/* <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-xl shadow-lg p-4 text-white">
                <h3 className="font-bold mb-2 text-sm">Stay Updated</h3>
                <p className="text-white/90 text-xs mb-3">
                  Get updates about {currentDistrict.name}
                </p>
                <button className="w-full bg-white text-[#117307] py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">
                  Subscribe
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, Newspaper, Building2, ArrowLeft, Share2,
//   Landmark, Trees, BookOpen
// } from 'lucide-react';
// import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
// import Loader from '@/components/ui/Loader';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function DistrictDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedDistrict, loading, districtCache, error } = useSelector(state => state.district);
  
//   const [activeTab, setActiveTab] = useState('history-culture');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentDistrict, setCurrentDistrict] = useState(null);

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       return;
//     }

//     const loadDistrict = async () => {
//       try {
//         setIsLoading(true);
        
//         const cached = districtCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000;
        
//         if (isCacheValid) {
//           setCurrentDistrict(cached.data);
//           setIsLoading(false);
//           return;
//         }

//         if (selectedDistrict && selectedDistrict.slug === slug) {
//           setCurrentDistrict(selectedDistrict);
//           setIsLoading(false);
//           return;
//         }

//         const result = await dispatch(fetchDistrictBySlug(slug)).unwrap();
        
//         if (result.district) {
//           setCurrentDistrict(result.district);
//         } else {
//           console.error('No district data in response');
//         }
//       } catch (err) {
//         console.error('Error loading district:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadDistrict();
//   }, [params?.slug, dispatch, districtCache, selectedDistrict]);

//   // Show loader during initial load
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Loader />
//       </div>
//     );
//   }

//   // Show error state if no district found
//   if (!isLoading && !currentDistrict) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">
//             District Not Found
//           </h2>
//           <p className="text-[#1a5e10] mb-6">
//             {error || "The district you're looking for doesn't exist or has been removed."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Button
//               variant="outlined"
//               onClick={() => router.push('/districts')}
//               sx={{ borderColor: '#117307', color: '#117307' }}
//             >
//               Back to Districts
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => window.location.reload()}
//               sx={{ backgroundColor: '#117307' }}
//             >
//               Try Again
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   const formatNumber = (num) => {
//     if (!num) return 'N/A';
//     if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toLocaleString();
//   };

//   // Navigation tabs
//   const tabs = [
//     { id: 'history-culture', label: 'History & Culture', icon: BookOpen },
//     { id: 'basic-info', label: 'Basic Info', icon: Building2 },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header with Back Button and Share Button */}
//       <div className="bg-[#117307] py-6">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="flex justify-between items-center">
//             <button
//               onClick={() => router.push('/districts')}
//               className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//             >
//               <ArrowLeft size={22} />
//               Back to Districts
//             </button>

//             <button
//               onClick={() => {/* Add share functionality */}}
//               className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//             >
//               <Share2 size={22} />
//               Share
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Hero Section */}
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left: Main Content - 80% width */}
//           <div className="lg:w-4/5">
//             {/* District Image - Full width */}
//             <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
//               <div className="relative  bg-[#f5fbf2]">
//                 {currentDistrict.headerImage ? (
//                   <img
//                     src={currentDistrict.headerImage}
//                     alt={currentDistrict.name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                       e.target.nextSibling.style.display = 'flex';
//                     }}
//                   />
//                 ) : null}

//                 {/* Fallback background */}
//                 <div
//                   className={`absolute inset-0 items-center justify-center ${
//                     currentDistrict.headerImage ? 'hidden' : 'flex'
//                   }`}
//                   style={{ backgroundColor: '#117307' }}
//                 >
//                   <div className="text-9xl text-white">🏛️</div>
//                 </div>
//               </div>

//               {/* Title and Meta Info */}
//               {/* <div className="p-6">
//                 <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-2">
//                   {currentDistrict.name}
//                 </h1>
//                 <p className="text-xl text-[#1a5e10] mb-4">
//                   {currentDistrict.nameHi || ''}
//                 </p>
                
//                 <div className="flex flex-wrap gap-4 text-[#4d674f]">
//                   {currentDistrict.formationYear && (
//                     <div className="flex items-center gap-2">
//                       <Calendar size={18} className="text-[#1a5e10]" />
//                       <span>Est. {currentDistrict.formationYear}</span>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-2">
//                     <MapPin size={18} className="text-[#1a5e10]" />
//                     <span>{currentDistrict.region || 'Madhya Pradesh'} Region</span>
//                   </div>
//                 </div>
//               </div> */}
//             </div>

//             {/* Navigation Tabs */}
//             <div className="mb-6">
//               <div className="flex flex-wrap gap-2 border-b-2 border-[#f5fbf2]">
//                 {tabs.map(tab => (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
//                     style={{
//                       color: activeTab === tab.id ? '#117307' : '#1a5e10',
//                       borderBottom: activeTab === tab.id ? '3px solid #117307' : 'none',
//                       marginBottom: '-2px'
//                     }}
//                   >
//                     <tab.icon size={20} />
//                     {tab.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Tab Content */}
//             <div>
//               {/* History & Culture Tab */}
//               {activeTab === 'history-culture' && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <BookOpen size={24} className="text-[#117307]" />
//                     History & Cultural Heritage
//                   </h2>
//                   <div className="prose prose-lg max-w-none">
//                     <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                       {currentDistrict.historyAndCulture || 
//                         `${currentDistrict.name} has a rich historical and cultural heritage that dates back centuries. The district has witnessed various dynasties and rulers, each contributing to its diverse cultural tapestry.`}
//                     </p>
//                   </div>
//                 </Card>
//               )}

//               {/* Basic Info Tab */}
//               {activeTab === 'basic-info' && (
//                 <div className="space-y-6">
//                   {/* Key Statistics */}
//                   <Card>
//                     <h2 className="text-2xl font-bold text-[#0d4d03] mb-6">Key Statistics</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {/* Population */}
//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Users size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Population</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {formatNumber(currentDistrict.population)}
//                         </p>
//                       </div>

//                       {/* Area */}
//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Mountain size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Area</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {currentDistrict.area ? `${currentDistrict.area.toLocaleString()} km²` : 'N/A'}
//                         </p>
//                       </div>

//                       {/* Establishment */}
//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Building2 size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Establishment</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {currentDistrict.formationYear || 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </Card>

//                   {/* Major Rivers */}
//                   {currentDistrict.majorRivers && currentDistrict.majorRivers.length > 0 && (
//                     <Card>
//                       <div className="flex items-center gap-3 mb-4">
//                         <Droplet size={24} className="text-[#117307]" />
//                         <h3 className="text-xl font-bold text-[#0d4d03]">Major Rivers</h3>
//                         <span className="text-base font-bold text-[#117307] ml-auto">
//                           {currentDistrict.majorRivers.length}
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentDistrict.majorRivers.map((river, idx) => (
//                           <span
//                             key={idx}
//                             className="bg-[#117307]/10 text-[#117307] px-3 py-1 rounded-full text-sm font-medium"
//                           >
//                             {river}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {/* Natural Attractions */}
//                   {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
//                     (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
//                     <Card>
//                       <div className="flex items-center gap-3 mb-4">
//                         <Trees size={24} className="text-[#117307]" />
//                         <h3 className="text-xl font-bold text-[#0d4d03]">Natural Attractions</h3>
//                         <span className="text-base font-bold text-[#117307] ml-auto">
//                           {(currentDistrict.hills?.length || 0) + (currentDistrict.naturalSpots?.length || 0)}
//                         </span>
//                       </div>
                      
//                       {/* Hills Category */}
//                       {currentDistrict.hills && currentDistrict.hills.length > 0 && (
//                         <div className="mb-4">
//                           <h4 className="text-lg font-semibold text-[#0d4d03] mb-2 flex items-center gap-2">
//                             <Mountain size={18} className="text-[#117307]" />
//                             Hills & Mountains
//                           </h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                             {currentDistrict.hills.map((hill, idx) => (
//                               <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#f5fbf2]">
//                                 <Mountain size={16} className="text-[#117307]" />
//                                 <span className="text-[#0d4d03] font-medium text-sm">{hill}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Natural Spots Category */}
//                       {currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0 && (
//                         <div>
//                           <h4 className="text-lg font-semibold text-[#0d4d03] mb-2 flex items-center gap-2">
//                             <Trees size={18} className="text-[#117307]" />
//                             Natural Spots
//                           </h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                             {currentDistrict.naturalSpots.map((spot, idx) => (
//                               <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#f5fbf2]">
//                                 <Trees size={16} className="text-[#117307]" />
//                                 <span className="text-[#0d4d03] font-medium text-sm">{spot}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </Card>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right: Sidebar - 20% width */}
//           <div className="lg:w-1/5">
//             <div className="space-y-4">
//               {/* Action Buttons */}
//               <div className="space-y-3 flex flex-col gap-4">
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<Building2 size={18} />}
//                   onClick={() => router.push(`/panchayats?district=${currentDistrict._id}`)}
//                   sx={{ 
//                     py: 2,
//                     backgroundColor: '#117307',
//                     fontSize: '0.875rem',
//                     '&:hover': { backgroundColor: '#0d5c06' }
//                   }}
//                 >
//                   View Panchayats
//                 </Button>

//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<Camera size={18} />}
//                   onClick={() => router.push(`/gallery`)}
//                   sx={{ 
//                     py: 2,
//                     backgroundColor: '#117307',
//                     fontSize: '0.875rem',
//                     '&:hover': { backgroundColor: '#0d5c06' }
//                   }}
//                 >
//                   Visit Gallery
//                 </Button>

//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<Newspaper size={18} />}
//                   onClick={() => router.push(`/news?district=${currentDistrict._id}`)}
//                   sx={{ 
//                     py: 2,
//                     backgroundColor: '#117307',
//                     fontSize: '0.875rem',
//                     '&:hover': { backgroundColor: '#0d5c06' }
//                   }}
//                 >
//                   Latest News
//                 </Button>
//               </div>

//               {/* Newsletter */}
//               <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-xl shadow-lg p-4 text-white">
//                 <h3 className="font-bold mb-2 text-sm">Stay Updated</h3>
//                 <p className="text-white/90 text-xs mb-3">
//                   Get updates about {currentDistrict.name}
//                 </p>
//                 <button className="w-full bg-white text-[#117307] py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">
//                   Subscribe
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
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, Newspaper, Building2, ArrowLeft, Share2,
//   ChevronRight, Star, Landmark, Trees, Award, Eye,
//   BookOpen
// } from 'lucide-react';
// import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
// import Loader from '@/components/ui/Loader';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function DistrictDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedDistrict, loading, districtCache, error } = useSelector(state => state.district);
  
//   const [activeTab, setActiveTab] = useState('history-culture'); // Default to History & Culture
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentDistrict, setCurrentDistrict] = useState(null);
//   const [showShareModal, setShowShareModal] = useState(false);

//   // Share functionality
//   const handleShare = () => {
//     setShowShareModal(true);
//   };

//   const handleCloseShareModal = () => {
//     setShowShareModal(false);
//   };

//   const handleCopyLink = async () => {
//     try {
//       const url = window.location.href;
//       if (navigator.clipboard && navigator.clipboard.writeText) {
//         await navigator.clipboard.writeText(url);
//       } else {
//         const textArea = document.createElement('textarea');
//         textArea.value = url;
//         document.body.appendChild(textArea);
//         textArea.select();
//         document.execCommand('copy');
//         document.body.removeChild(textArea);
//       }
//       alert('Link copied to clipboard!');
//       setShowShareModal(false);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//       alert(`Please copy this link manually: ${window.location.href}`);
//     }
//   };

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       return;
//     }

//     const loadDistrict = async () => {
//       try {
//         setIsLoading(true);
        
//         // Check cache first
//         const cached = districtCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000; // 5 minutes
        
//         if (isCacheValid) {
//           console.log('Using cached district data');
//           setCurrentDistrict(cached.data);
//           setIsLoading(false);
//           return;
//         }

//         // Check if selectedDistrict matches the current slug
//         if (selectedDistrict && selectedDistrict.slug === slug) {
//           console.log('Using selectedDistrict from Redux');
//           setCurrentDistrict(selectedDistrict);
//           setIsLoading(false);
//           return;
//         }

//         // Fetch from API
//         console.log('Fetching district from API...');
//         const result = await dispatch(fetchDistrictBySlug(slug)).unwrap();
        
//         if (result.district) {
//           setCurrentDistrict(result.district);
//         } else {
//           console.error('No district data in response');
//         }
//       } catch (err) {
//         console.error('Error loading district:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadDistrict();
//   }, [params?.slug, dispatch, districtCache, selectedDistrict]);

//   // Show loader during initial load
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Loader />
//       </div>
//     );
//   }

//   // Show error state if no district found
//   if (!isLoading && !currentDistrict) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">
//             District Not Found
//           </h2>
//           <p className="text-[#1a5e10] mb-6">
//             {error || "The district you're looking for doesn't exist or has been removed."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Button
//               variant="outlined"
//               onClick={() => router.push('/districts')}
//               sx={{ borderColor: '#117307', color: '#117307' }}
//             >
//               Back to Districts
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => window.location.reload()}
//               sx={{ backgroundColor: '#117307' }}
//             >
//               Try Again
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   const formatNumber = (num) => {
//     if (!num) return 'N/A';
//     if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toLocaleString();
//   };

//   // Navigation tabs
//   const tabs = [
//     { id: 'history-culture', label: 'History & Culture', icon: BookOpen },
//     { id: 'basic-info', label: 'Basic Info', icon: Building2 },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header with Back Button and Share Button */}
//       <div className="bg-[#117307] py-6">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="flex justify-between items-center">
//             {/* Back Button */}
//             <button
//               onClick={() => router.push('/districts')}
//               className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//             >
//               <ArrowLeft size={22} />
//               Back to Districts
//             </button>

//             {/* Share Button - Opposite to Back Button */}
//             <div className="relative">
//               <button
//                 onClick={handleShare}
//                 className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//               >
//                 <Share2 size={22} />
//                 Share
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Hero Section */}
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left: District Image */}
//           <div className="lg:w-2/3">
//             <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
//               <div className="relative bg-[#f5fbf2]">
//                 {currentDistrict.headerImage ? (
//                   <img
//                     src={currentDistrict.headerImage}
//                     alt={currentDistrict.name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                       e.target.nextSibling.style.display = 'flex';
//                     }}
//                   />
//                 ) : null}

//                 {/* Fallback background */}
//                 <div
//                   className={`absolute inset-0 items-center justify-center ${
//                     currentDistrict.headerImage ? 'hidden' : 'flex'
//                   }`}
//                   style={{ backgroundColor: '#117307' }}
//                 >
//                   <div className="text-9xl text-white">🏛️</div>
//                 </div>
//               </div>

//               {/* Content Below Image */}
//               {/* <div className="p-8">
//                 <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-2">
//                   {currentDistrict.name}
//                 </h1>
//                 <p className="text-xl text-[#1a5e10] mb-6">
//                   {currentDistrict.nameHi || ''}
//                 </p>

                
//                 <div className="flex justify-between items-center gap-6 pb-6 mb-6 border-b border-[#117307]/10">
               
//                   {currentDistrict.formationYear && (
//                     <div className="flex items-center gap-2 text-[#4d674f] font-medium">
//                       <Calendar size={18} className="text-[#1a5e10]" />
//                       <span>Est. {currentDistrict.formationYear}</span>
//                     </div>
//                   )}

                
//                   <div className="flex items-center gap-2 text-[#4d674f] font-medium">
//                     <MapPin size={18} className="text-[#1a5e10]" />
//                     <span>{currentDistrict.region || 'Madhya Pradesh'} Region</span>
//                   </div>
//                 </div>
//               </div> */}
//             </div>

//             {/* Navigation Tabs */}
//             <div className="mt-8">
//               <div className="flex flex-wrap gap-2 border-b-2 border-[#f5fbf2]">
//                 {tabs.map(tab => (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
//                     style={{
//                       color: activeTab === tab.id ? '#117307' : '#1a5e10',
//                       borderBottom: activeTab === tab.id ? '3px solid #117307' : 'none',
//                       marginBottom: '-2px'
//                     }}
//                   >
//                     <tab.icon size={20} />
//                     {tab.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Tab Content */}
//             <div className="mt-8">
//               {/* History & Culture Tab */}
//               {activeTab === 'history-culture' && (
//                 <div className="space-y-6">
//                   <Card>
//                     <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                       <BookOpen size={24} className="text-[#117307]" />
//                       History & Cultural Heritage
//                     </h2>
//                     <div className="prose prose-lg max-w-none">
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentDistrict.historyAndCulture || 
//                           `${currentDistrict.name} has a rich historical and cultural heritage that dates back centuries. The district has witnessed various dynasties and rulers, each contributing to its diverse cultural tapestry.`}
//                       </p>
//                     </div>
//                   </Card>

//                   {/* Quick Actions */}
             
//                 </div>
//               )}

//               {/* Basic Info Tab */}
//               {activeTab === 'basic-info' && (
//                 <div className="space-y-6">
//                   {/* Key Statistics */}
//                   <Card>
//                     <h2 className="text-2xl font-bold text-[#0d4d03] mb-6">Key Statistics</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       {/* Population */}
//                       <div className="text-center p-6 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-3">
//                           <Users size={32} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-[#4d674f] mb-2">Population</h3>
//                         <p className="text-3xl font-bold text-[#0d4d03]">
//                           {formatNumber(currentDistrict.population)}
//                         </p>
//                       </div>

//                       {/* Area */}
//                       <div className="text-center p-6 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-3">
//                           <Mountain size={32} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-[#4d674f] mb-2">Area</h3>
//                         <p className="text-3xl font-bold text-[#0d4d03]">
//                           {currentDistrict.area ? `${currentDistrict.area.toLocaleString()} km²` : 'N/A'}
//                         </p>
//                       </div>

//                       {/* Establishment */}
//                       <div className="text-center p-6 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-3">
//                           <Building2 size={32} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-[#4d674f] mb-2">Establishment</h3>
//                         <p className="text-3xl font-bold text-[#0d4d03]">
//                           {currentDistrict.formationYear || 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </Card>

//                   {/* Major Rivers */}
//                   {currentDistrict.majorRivers && currentDistrict.majorRivers.length > 0 && (
//                     <Card>
//                       <div className="flex items-center gap-3 mb-4">
//                         <Droplet size={28} className="text-[#117307]" />
//                         <h3 className="text-2xl font-bold text-[#0d4d03]">Major Rivers</h3>
//                         <span className="text-lg font-bold text-[#117307] ml-auto">
//                           {currentDistrict.majorRivers.length}
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-3">
//                         {currentDistrict.majorRivers.map((river, idx) => (
//                           <span
//                             key={idx}
//                             className="bg-[#117307]/10 text-[#117307] px-4 py-2 rounded-full font-medium"
//                           >
//                             {river}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {/* Natural Attractions */}
//                   {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
//                     (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
//                     <Card>
//                       <div className="flex items-center gap-3 mb-4">
//                         <Trees size={28} className="text-[#117307]" />
//                         <h3 className="text-2xl font-bold text-[#0d4d03]">Natural Attractions</h3>
//                         <span className="text-lg font-bold text-[#117307] ml-auto">
//                           {(currentDistrict.hills?.length || 0) + (currentDistrict.naturalSpots?.length || 0)}
//                         </span>
//                       </div>
                      
//                       {/* Hills Category */}
//                       {currentDistrict.hills && currentDistrict.hills.length > 0 && (
//                         <div className="mb-6">
//                           <h4 className="text-lg font-semibold text-[#0d4d03] mb-3 flex items-center gap-2">
//                             <Mountain size={20} className="text-[#117307]" />
//                             Hills & Mountains
//                           </h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {currentDistrict.hills.map((hill, idx) => (
//                               <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fbf2]">
//                                 <Mountain size={16} className="text-[#117307]" />
//                                 <span className="text-[#0d4d03] font-medium">{hill}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {/* Natural Spots Category */}
//                       {currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0 && (
//                         <div>
//                           <h4 className="text-lg font-semibold text-[#0d4d03] mb-3 flex items-center gap-2">
//                             <Trees size={20} className="text-[#117307]" />
//                             Natural Spots
//                           </h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {currentDistrict.naturalSpots.map((spot, idx) => (
//                               <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fbf2]">
//                                 <Trees size={16} className="text-[#117307]" />
//                                 <span className="text-[#0d4d03] font-medium">{spot}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {/* Attractions Tab */}
//               {activeTab === 'attractions' && (
//                 <div className="space-y-6">
//                   {/* Tourist Places */}
//                   {currentDistrict.touristPlaces && currentDistrict.touristPlaces.length > 0 ? (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <MapPin size={24} className="text-[#117307]" />
//                         Tourist Attractions
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {currentDistrict.touristPlaces.map((place, idx) => (
//                           <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-[#117307]/10">
//                             <div className="flex items-start gap-3 mb-3">
//                               <div className="p-2 rounded-lg bg-[#f5fbf2]">
//                                 {place.category === 'monument' && <Landmark size={20} className="text-[#117307]" />}
//                                 {place.category === 'natural' && <Trees size={20} className="text-[#117307]" />}
//                                 {place.category === 'religious' && <Star size={20} className="text-[#117307]" />}
//                                 {place.category === 'cultural' && <Award size={20} className="text-[#117307]" />}
//                                 {!place.category && <MapPin size={20} className="text-[#117307]" />}
//                               </div>
//                               <div className="flex-1">
//                                 <h3 className="font-bold text-[#0d4d03] mb-1">
//                                   {typeof place === 'string' ? place : place.name}
//                                 </h3>
//                                 {place.category && (
//                                   <span className="text-[#117307] text-xs font-medium bg-[#117307]/10 px-2 py-1 rounded-full">
//                                     {place.category}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             {place.description && (
//                               <p className="text-[#1a5e10] text-sm">{place.description}</p>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   ) : (
//                     <Card>
//                       <div className="text-center py-12">
//                         <MapPin size={48} className="mx-auto mb-4 text-[#117307]" />
//                         <p className="text-xl text-[#1a5e10]">No tourist places information available</p>
//                       </div>
//                     </Card>
//                   )}

//                   {/* Famous Personalities */}
//                   {currentDistrict.famousPersonalities && currentDistrict.famousPersonalities.length > 0 && (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <Award size={24} className="text-[#117307]" />
//                         Notable Personalities
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {currentDistrict.famousPersonalities.map((person, idx) => (
//                           <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-[#f5fbf2]">
//                             <Award size={24} className="text-[#117307] mt-1" />
//                             <div className="flex-1">
//                               <h3 className="font-bold text-[#0d4d03] text-lg mb-1">{person.name}</h3>
//                               <p className="text-[#117307] font-medium mb-2">{person.field}</p>
//                               {person.description && (
//                                 <p className="text-[#1a5e10] text-sm">{person.description}</p>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right: Newsletter Sidebar */}
//           <div className="lg:w-1/4">
//             <div className="space-y-6">
//                   <div className="grid grid-cols-1  gap-4">
//                     <Button
//                       variant="contained"
//                       fullWidth
//                       startIcon={<Building2 />}
//                       onClick={() => router.push(`/panchayats?district=${currentDistrict._id}`)}
//                       sx={{ 
//                         py: 2,
//                         backgroundColor: '#117307',
//                         '&:hover': { backgroundColor: '#0d5c06' }
//                       }}
//                     >
//                       View Panchayats
//                     </Button>

//                     <Button
//                       variant="contained"
//                       fullWidth
//                       startIcon={<Camera />}
//                       onClick={() => router.push(`/gallery`)}
//                       sx={{ 
//                         py: 2,
//                         backgroundColor: '#117307',
//                         '&:hover': { backgroundColor: '#0d5c06' }
//                       }}
//                     >
//                       Visit Gallery
//                     </Button>

//                     <Button
//                       variant="contained"
//                       fullWidth
//                       startIcon={<Newspaper />}
//                       onClick={() => router.push(`/news?district=${currentDistrict._id}`)}
//                       sx={{ 
//                         py: 2,
//                         backgroundColor: '#117307',
//                         '&:hover': { backgroundColor: '#0d5c06' }
//                       }}
//                     >
//                       Latest News
//                     </Button>
//                   </div>
//               <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-2xl shadow-lg p-6 text-white">
//                 <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
//                 <p className="text-white/90 text-sm mb-4">
//                   Get the latest updates about {currentDistrict.name} delivered to your inbox.
//                 </p>
//                 <button className="w-full bg-white text-[#117307] py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
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
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, Newspaper, Building2, ArrowLeft, Share2,
//   ChevronRight, Star, Landmark, Trees, Award, Eye
// } from 'lucide-react';
// import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
// import Loader from '@/components/ui/Loader';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function DistrictDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedDistrict, loading, districtCache, error } = useSelector(state => state.district);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentDistrict, setCurrentDistrict] = useState(null);
//   const [showShareModal, setShowShareModal] = useState(false);

//   // Share functionality
//   const handleShare = () => {
//     setShowShareModal(true);
//   };

//   const handleCloseShareModal = () => {
//     setShowShareModal(false);
//   };

//   const handleCopyLink = async () => {
//     try {
//       const url = window.location.href;
//       if (navigator.clipboard && navigator.clipboard.writeText) {
//         await navigator.clipboard.writeText(url);
//       } else {
//         const textArea = document.createElement('textarea');
//         textArea.value = url;
//         document.body.appendChild(textArea);
//         textArea.select();
//         document.execCommand('copy');
//         document.body.removeChild(textArea);
//       }
//       alert('Link copied to clipboard!');
//       setShowShareModal(false);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//       alert(`Please copy this link manually: ${window.location.href}`);
//     }
//   };

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       return;
//     }

//     const loadDistrict = async () => {
//       try {
//         setIsLoading(true);
        
//         // Check cache first
//         const cached = districtCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000; // 5 minutes
        
//         if (isCacheValid) {
//           console.log('Using cached district data');
//           setCurrentDistrict(cached.data);
//           setIsLoading(false);
//           return;
//         }

//         // Check if selectedDistrict matches the current slug
//         if (selectedDistrict && selectedDistrict.slug === slug) {
//           console.log('Using selectedDistrict from Redux');
//           setCurrentDistrict(selectedDistrict);
//           setIsLoading(false);
//           return;
//         }

//         // Fetch from API
//         console.log('Fetching district from API...');
//         const result = await dispatch(fetchDistrictBySlug(slug)).unwrap();
        
//         if (result.district) {
//           setCurrentDistrict(result.district);
//         } else {
//           console.error('No district data in response');
//         }
//       } catch (err) {
//         console.error('Error loading district:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadDistrict();
//   }, [params?.slug, dispatch, districtCache, selectedDistrict]);

//   // Show loader during initial load
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Loader />
//       </div>
//     );
//   }

//   // Show error state if no district found
//   if (!isLoading && !currentDistrict) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">
//             District Not Found
//           </h2>
//           <p className="text-[#1a5e10] mb-6">
//             {error || "The district you're looking for doesn't exist or has been removed."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Button
//               variant="outlined"
//               onClick={() => router.push('/districts')}
//               sx={{ borderColor: '#117307', color: '#117307' }}
//             >
//               Back to Districts
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => window.location.reload()}
//               sx={{ backgroundColor: '#117307' }}
//             >
//               Try Again
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   const formatNumber = (num) => {
//     if (!num) return 'N/A';
//     if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toLocaleString();
//   };

//   // Simplified tabs - removed unnecessary ones
//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Building2 },
//     { id: 'attractions', label: 'Attractions', icon: Eye }
//   ];

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header with Back Button and Share Button */}
//       <div className="bg-[#117307] py-6">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="flex justify-between items-center">
//             {/* Back Button */}
//             <button
//               onClick={() => router.push('/districts')}
//               className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//             >
//               <ArrowLeft size={22} />
//               Back to Districts
//             </button>

//             {/* Share Button - Opposite to Back Button */}
//             <div className="relative">
//               <button
//                 onClick={handleShare}
//                 className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//               >
//                 <Share2 size={22} />
//                 Share
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Hero Section */}
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left: District Image */}
//           <div className="lg:w-2/3">
//             <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
//               <div className="relative h-96 bg-[#f5fbf2]">
//                 {currentDistrict.headerImage ? (
//                   <img
//                     src={currentDistrict.headerImage}
//                     alt={currentDistrict.name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                       e.target.nextSibling.style.display = 'flex';
//                     }}
//                   />
//                 ) : null}

//                 {/* Fallback background */}
//                 <div
//                   className={`absolute inset-0 items-center justify-center ${
//                     currentDistrict.headerImage ? 'hidden' : 'flex'
//                   }`}
//                   style={{ backgroundColor: '#117307' }}
//                 >
//                   <div className="text-9xl text-white">🏛️</div>
//                 </div>
//               </div>

//               {/* Content Below Image */}
//               <div className="p-8">
//                 <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-2">
//                   {currentDistrict.name}
//                 </h1>
//                 <p className="text-xl text-[#1a5e10] mb-6">
//                   {currentDistrict.nameHi || ''}
//                 </p>

//                 {/* Meta Information - Date and Category in same row */}
//                 <div className="flex justify-between items-center gap-6 pb-6 mb-6 border-b border-[#117307]/10">
//                   {/* Date on left */}
//                   {currentDistrict.formationYear && (
//                     <div className="flex items-center gap-2 text-[#4d674f] font-medium">
//                       <Calendar size={18} className="text-[#1a5e10]" />
//                       <span>Est. {currentDistrict.formationYear}</span>
//                     </div>
//                   )}

//                   {/* Region on right */}
//                   <div className="flex items-center gap-2 text-[#4d674f] font-medium">
//                     <MapPin size={18} className="text-[#1a5e10]" />
//                     <span>{currentDistrict.region || 'Madhya Pradesh'} Region</span>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 {currentDistrict.historyAndCulture && (
//                   <div className="prose prose-lg max-w-none">
//                     <p className="text-[#1a5e10] leading-relaxed">
//                       {currentDistrict.historyAndCulture}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//               <Button
//                 variant="contained"
//                 fullWidth
//                 startIcon={<Building2 />}
//                 onClick={() => router.push(`/panchayats?district=${currentDistrict._id}`)}
//                 sx={{ 
//                   py: 2,
//                   backgroundColor: '#117307',
//                   '&:hover': { backgroundColor: '#0d5c06' }
//                 }}
//               >
//                 View Panchayats
//               </Button>

//               <Button
//                 variant="contained"
//                 fullWidth
//                 startIcon={<Camera />}
//                 onClick={() => router.push(`/gallery`)}
//                 sx={{ 
//                   py: 2,
//                   backgroundColor: '#117307',
//                   '&:hover': { backgroundColor: '#0d5c06' }
//                 }}
//               >
//                 Visit Gallery
//               </Button>

//               <Button
//                 variant="contained"
//                 fullWidth
//                 startIcon={<Newspaper />}
//                 onClick={() => router.push(`/news?district=${currentDistrict._id}`)}
//                 sx={{ 
//                   py: 2,
//                   backgroundColor: '#117307',
//                   '&:hover': { backgroundColor: '#0d5c06' }
//                 }}
//               >
//                 Latest News
//               </Button>
//             </div>
//           </div>

//           {/* Right: Basic Info Sidebar */}
//           <div className="lg:w-1/3">
//             <div className="space-y-6">
//               {/* Basic Info Card */}
//               <Card sx={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
//                 <h3 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                   <Building2 size={20} className="text-[#117307]" />
//                   Basic Information
//                 </h3>
                
//                 <div className="space-y-4">
//                   {/* Population */}
//                   <div className="pb-4 border-b border-[#117307]/10">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Users size={20} className="text-[#117307]" />
//                       <span className="text-sm text-[#4d674f] font-medium">Population</span>
//                     </div>
//                     <p className="text-lg font-bold text-[#0d4d03]">
//                       {formatNumber(currentDistrict.population)}
//                     </p>
//                   </div>

//                   {/* Area */}
//                   <div className="pb-4 border-b border-[#117307]/10">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Mountain size={20} className="text-[#117307]" />
//                       <span className="text-sm text-[#4d674f] font-medium">Area</span>
//                     </div>
//                     <p className="text-lg font-bold text-[#0d4d03]">
//                       {currentDistrict.area ? `${currentDistrict.area.toLocaleString()} km²` : 'N/A'}
//                     </p>
//                   </div>

//                   {/* Major Rivers */}
//                   {currentDistrict.majorRivers && currentDistrict.majorRivers.length > 0 && (
//                     <div className="pb-4 border-b border-[#117307]/10">
//                       <div className="flex items-center gap-3 mb-2">
//                         <Droplet size={20} className="text-[#117307]" />
//                         <span className="text-sm text-[#4d674f] font-medium">Major Rivers</span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentDistrict.majorRivers.map((river, idx) => (
//                           <span
//                             key={idx}
//                             className="bg-[#117307]/10 text-[#117307] px-3 py-1 rounded-full text-sm font-medium"
//                           >
//                             {river}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Natural Attractions Count */}
//                   {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
//                     (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
//                     <div>
//                       <div className="flex items-center gap-3 mb-2">
//                         <Trees size={20} className="text-[#117307]" />
//                         <span className="text-sm text-[#4d674f] font-medium">Natural Attractions</span>
//                       </div>
//                       <p className="text-lg font-bold text-[#0d4d03]">
//                         {(currentDistrict.hills?.length || 0) + (currentDistrict.naturalSpots?.length || 0)}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </Card>

//               {/* Natural Attractions Preview */}
//               {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
//                 (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
//                 <Card sx={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
//                   <h3 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <Trees size={20} className="text-[#117307]" />
//                     Natural Highlights
//                   </h3>
//                   <div className="space-y-3">
//                     {currentDistrict.hills?.slice(0, 3).map((hill, idx) => (
//                       <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fbf2]">
//                         <Mountain size={16} className="text-[#117307]" />
//                         <span className="text-[#0d4d03] font-medium">{hill}</span>
//                       </div>
//                     ))}
//                     {currentDistrict.naturalSpots?.slice(0, 3).map((spot, idx) => (
//                       <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#f5fbf2]">
//                         <Trees size={16} className="text-[#117307]" />
//                         <span className="text-[#0d4d03] font-medium">{spot}</span>
//                       </div>
//                     ))}
//                     {((currentDistrict.hills?.length || 0) + (currentDistrict.naturalSpots?.length || 0)) > 3 && (
//                       <button
//                         onClick={() => setActiveTab('attractions')}
//                         className="w-full text-center text-[#117307] font-semibold py-2 hover:bg-[#f5fbf2] rounded-lg transition-colors"
//                       >
//                         View All Attractions →
//                       </button>
//                     )}
//                   </div>
//                 </Card>
//               )}

//               {/* Newsletter Signup */}
//               <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-2xl shadow-lg p-6 text-white">
//                 <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
//                 <p className="text-white/90 text-sm mb-4">
//                   Get the latest updates about {currentDistrict.name} delivered to your inbox.
//                 </p>
//                 <button className="w-full bg-white text-[#117307] py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
//                   Subscribe Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mt-12">
//           <div className="flex flex-wrap gap-2 border-b-2 border-[#f5fbf2]">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
//                 style={{
//                   color: activeTab === tab.id ? '#117307' : '#1a5e10',
//                   borderBottom: activeTab === tab.id ? '3px solid #117307' : 'none',
//                   marginBottom: '-2px'
//                 }}
//               >
//                 <tab.icon size={20} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="mt-8">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="space-y-6">
//               {/* Tourist Places */}
//               {currentDistrict.touristPlaces && currentDistrict.touristPlaces.length > 0 && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <MapPin size={24} className="text-[#117307]" />
//                     Popular Tourist Places
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {currentDistrict.touristPlaces.slice(0, 4).map((place, idx) => (
//                       <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-[#f5fbf2]">
//                         <div className="p-2 rounded-lg bg-white">
//                           {place.category === 'monument' && <Landmark size={20} className="text-[#117307]" />}
//                           {place.category === 'natural' && <Trees size={20} className="text-[#117307]" />}
//                           {place.category === 'religious' && <Star size={20} className="text-[#117307]" />}
//                           {place.category === 'cultural' && <Award size={20} className="text-[#117307]" />}
//                           {!place.category && <MapPin size={20} className="text-[#117307]" />}
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="font-bold text-[#0d4d03] mb-1">
//                             {typeof place === 'string' ? place : place.name}
//                           </h3>
//                           {place.description && (
//                             <p className="text-[#1a5e10] text-sm">{place.description}</p>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Famous Personalities */}
//               {currentDistrict.famousPersonalities && currentDistrict.famousPersonalities.length > 0 && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <Award size={24} className="text-[#117307]" />
//                     Notable Personalities
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {currentDistrict.famousPersonalities.slice(0, 4).map((person, idx) => (
//                       <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-[#f5fbf2]">
//                         <Award size={20} className="text-[#117307] mt-1" />
//                         <div>
//                           <h3 className="font-bold text-[#0d4d03]">{person.name}</h3>
//                           <p className="text-[#117307] text-sm font-medium">{person.field}</p>
//                           {person.description && (
//                             <p className="text-[#1a5e10] text-sm mt-1">{person.description}</p>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {/* Attractions Tab */}
//           {activeTab === 'attractions' && (
//             <div className="space-y-6">
//               {/* Natural Attractions */}
//               {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
//                 (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <Trees size={24} className="text-[#117307]" />
//                     Natural Attractions
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {currentDistrict.hills?.map((hill, idx) => (
//                       <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-[#f5fbf2]">
//                         <Mountain size={20} className="text-[#117307]" />
//                         <span className="font-medium text-[#0d4d03]">{hill}</span>
//                       </div>
//                     ))}
//                     {currentDistrict.naturalSpots?.map((spot, idx) => (
//                       <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-[#f5fbf2]">
//                         <Trees size={20} className="text-[#117307]" />
//                         <span className="font-medium text-[#0d4d03]">{spot}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Tourist Places */}
//               {currentDistrict.touristPlaces && currentDistrict.touristPlaces.length > 0 && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <MapPin size={24} className="text-[#117307]" />
//                     Tourist Attractions
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {currentDistrict.touristPlaces.map((place, idx) => (
//                       <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-[#117307]/10">
//                         <div className="flex items-start gap-3 mb-3">
//                           <div className="p-2 rounded-lg bg-[#f5fbf2]">
//                             {place.category === 'monument' && <Landmark size={20} className="text-[#117307]" />}
//                             {place.category === 'natural' && <Trees size={20} className="text-[#117307]" />}
//                             {place.category === 'religious' && <Star size={20} className="text-[#117307]" />}
//                             {place.category === 'cultural' && <Award size={20} className="text-[#117307]" />}
//                             {!place.category && <MapPin size={20} className="text-[#117307]" />}
//                           </div>
//                           <div className="flex-1">
//                             <h3 className="font-bold text-[#0d4d03] mb-1">
//                               {typeof place === 'string' ? place : place.name}
//                             </h3>
//                             {place.category && (
//                               <span className="text-[#117307] text-xs font-medium bg-[#117307]/10 px-2 py-1 rounded-full">
//                                 {place.category}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         {place.description && (
//                           <p className="text-[#1a5e10] text-sm">{place.description}</p>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, Newspaper, Building2, ArrowLeft, 
//   ChevronRight, Star, Landmark, Trees, Award
// } from 'lucide-react';
// import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
// import Loader from '@/components/ui/Loader';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function DistrictDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedDistrict, loading, districtCache, error } = useSelector(state => state.district);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentDistrict, setCurrentDistrict] = useState(null);

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
//     text: '#374151'
//   };

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       return;
//     }

//     const loadDistrict = async () => {
//       try {
//         setIsLoading(true);
        
//         // Check cache first
//         const cached = districtCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000; // 5 minutes
        
//         if (isCacheValid) {
//           console.log('Using cached district data');
//           setCurrentDistrict(cached.data);
//           setIsLoading(false);
//           return;
//         }

//         // Check if selectedDistrict matches the current slug
//         if (selectedDistrict && selectedDistrict.slug === slug) {
//           console.log('Using selectedDistrict from Redux');
//           setCurrentDistrict(selectedDistrict);
//           setIsLoading(false);
//           return;
//         }

//         // Fetch from API
//         console.log('Fetching district from API...');
//         const result = await dispatch(fetchDistrictBySlug(slug)).unwrap();
        
//         if (result.district) {
//           setCurrentDistrict(result.district);
//         } else {
//           console.error('No district data in response');
//         }
//       } catch (err) {
//         console.error('Error loading district:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadDistrict();
//   }, [params?.slug, dispatch, districtCache, selectedDistrict]);

//   // Show loader during initial load
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bgColor }}>
//         <Loader />
//       </div>
//     );
//   }

//   // Show error state if no district found
//   if (!isLoading && !currentDistrict) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bgColor }}>
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//             District Not Found
//           </h2>
//           <p className="text-gray-600 mb-6">
//             {error || "The district you're looking for doesn't exist or has been removed."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Button
//               variant="outlined"
//               onClick={() => router.push('/districts')}
//               sx={{ borderColor: colors.primary, color: colors.primary }}
//             >
//               Back to Districts
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => window.location.reload()}
//               sx={{ backgroundColor: colors.primary }}
//             >
//               Try Again
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   const formatNumber = (num) => {
//     if (!num) return 'N/A';
//     if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toLocaleString();
//   };

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Building2 },
//     { id: 'places', label: 'Tourist Places', icon: MapPin },
//     { id: 'culture', label: 'History & Culture', icon: Landmark },
//     { id: 'personalities', label: 'Famous People', icon: Award }
//   ];

//   return (
//     <div className="min-h-screen pt-10" style={{ backgroundColor: colors.bgColor }}>
//       {/* Hero Section */}
//     <div className="bg-gray-50"> {/* added top padding for fixed header */}
//   <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 px-4 md:px-8">

//     {/* LEFT: District Image (70%) */}
//     <div className="relative w-full lg:w-[70%] h-[500px] rounded-2xl overflow-hidden shadow-lg">
//       {currentDistrict.headerImage ? (
//         <img
//           src={currentDistrict.headerImage}
//           alt={currentDistrict.name}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             e.target.style.display = 'none';
//             e.target.nextSibling.style.display = 'flex';
//           }}
//         />
//       ) : null}

//       {/* Fallback background */}
//       <div
//         className={`absolute inset-0 items-center justify-center ${
//           currentDistrict.headerImage ? 'hidden' : 'flex'
//         }`}
//         style={{ backgroundColor: colors.primary }}
//       >
//         <div className="text-9xl">🏛️</div>
//       </div>

//       {/* Overlay */}
//       <div className="absolute inset-0 " />

//       {/* Back Button */}
//       <button
//         onClick={() => router.push('/districts')}
//         className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg z-10"
//       >
//         <ArrowLeft size={24} style={{ color: colors.primary }} />
//       </button>

//       {/* Title Overlay */}
//       {/* <div className="absolute bottom-0 left-0 right-0 p-8">
//         <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
//           {currentDistrict.name}
//         </h1>
//         <p className="text-xl text-white/90 mb-4">
//           {currentDistrict.nameHi || ''}
//         </p>
//         <div className="flex flex-wrap gap-4 text-white/90">
//           <div className="flex items-center gap-2">
//             <MapPin size={20} />
//             <span>{currentDistrict.region || 'Madhya Pradesh'} Region</span>
//           </div>
//           {currentDistrict.formationYear && (
//             <div className="flex items-center gap-2">
//               <Calendar size={20} />
//               <span>Est. {currentDistrict.formationYear}</span>
//             </div>
//           )}
//         </div>
//       </div> */}
//     </div>

//     {/* RIGHT: Stats / Content (30%) */}
//     <div className="w-full lg:w-[30%] flex flex-col gap-6">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
//         <Card sx={{ backgroundColor: colors.white, borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
//           <div className="flex items-start gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//               <Users size={28} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Population</p>
//               <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                 {formatNumber(currentDistrict.population)}
//               </p>
//             </div>
//           </div>
//         </Card>

//         <Card sx={{ backgroundColor: colors.white, borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
//           <div className="flex items-start gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//               <Mountain size={28} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Area</p>
//               <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                 {currentDistrict.area ? `${currentDistrict.area.toLocaleString()} km²` : 'N/A'}
//               </p>
//             </div>
//           </div>
//         </Card>

//         <Card sx={{ backgroundColor: colors.white, borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
//           <div className="flex items-start gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//               <Building2 size={28} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Establishment</p>
//               <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                 {currentDistrict.formationYear}
//               </p>
//             </div>
//           </div>
//         </Card>

//         <Card sx={{ backgroundColor: colors.white, borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
//           <div className="flex items-start gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//               <Droplet size={28} style={{ color: colors.primary }} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Major Rivers</p>
//               <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                 {currentDistrict.majorRivers?.length || 0}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   </div>
// </div>


//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Building2 />}
//             onClick={() => router.push(`/panchayats?district=${currentDistrict._id}`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.primary,
//               '&:hover': { backgroundColor: colors.primaryDark }
//             }}
//           >
//             View Panchayats
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Camera />}
//             onClick={() => router.push(`/gallery`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.secondary,
//               '&:hover': { backgroundColor: '#1565C0' }
//             }}
//           >
//             Visit Gallery
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Newspaper />}
//             onClick={() => router.push(`/news?district=${currentDistrict._id}`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.accent,
//               '&:hover': { backgroundColor: '#2E7D32' }
//             }}
//           >
//             Latest News
//           </Button>
//         </div>

//         {/* Tabs */}
//         <div className="mb-8">
//           <div className="flex flex-wrap gap-2 border-b-2" style={{ borderColor: colors.lightBg }}>
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
//                 style={{
//                   color: activeTab === tab.id ? colors.primary : colors.text,
//                   borderBottom: activeTab === tab.id ? `3px solid ${colors.primary}` : 'none',
//                   marginBottom: '-2px'
//                 }}
//               >
//                 <tab.icon size={20} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="space-y-8">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="space-y-8">
//               {/* About District */}
//               <Card>
//                 <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
//                   About {currentDistrict.name}
//                 </h2>
//                 <p className="text-lg leading-relaxed text-gray-700">
//                   {currentDistrict.historyAndCulture || `${currentDistrict.name} is a significant district in Madhya Pradesh known for its rich cultural heritage and historical importance.`}
//                 </p>
//               </Card>

//               {/* Rivers */}
//               {currentDistrict.majorRivers && currentDistrict.majorRivers.length > 0 && (
//                 <Card>
//                   <div className="flex items-center gap-3 mb-4">
//                     <Droplet size={28} style={{ color: colors.primary }} />
//                     <h3 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                       Major Rivers
//                     </h3>
//                   </div>
//                   <div className="flex flex-wrap gap-3">
//                     {currentDistrict.majorRivers.map((river, idx) => (
//                       <div
//                         key={idx}
//                         className="px-6 py-3 rounded-full text-white font-semibold"
//                         style={{ backgroundColor: colors.secondary }}
//                       >
//                         {river}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Hills & Natural Spots */}
//               {((currentDistrict.hills && currentDistrict.hills.length > 0) || 
//                 (currentDistrict.naturalSpots && currentDistrict.naturalSpots.length > 0)) && (
//                 <Card>
//                   <div className="flex items-center gap-3 mb-4">
//                     <Trees size={28} style={{ color: colors.primary }} />
//                     <h3 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                       Natural Attractions
//                     </h3>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {currentDistrict.hills?.map((hill, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-4 rounded-lg"
//                         style={{ backgroundColor: colors.lightBg }}
//                       >
//                         <Mountain size={20} style={{ color: colors.primary }} />
//                         <span className="font-medium">{hill}</span>
//                       </div>
//                     ))}
//                     {currentDistrict.naturalSpots?.map((spot, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-4 rounded-lg"
//                         style={{ backgroundColor: colors.lightBg }}
//                       >
//                         <Trees size={20} style={{ color: colors.primary }} />
//                         <span className="font-medium">{spot}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Political Constituencies */}
//               {/* {currentDistrict.politicalConstituencies && (
//                 currentDistrict.politicalConstituencies.lokSabha?.length > 0 || 
//                 currentDistrict.politicalConstituencies.vidhanSabha?.length > 0
//               ) && (
//                 <Card>
//                   <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//                     Political Constituencies
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {currentDistrict.politicalConstituencies.lokSabha?.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                           LOK SABHA
//                         </p>
//                         <div className="space-y-2">
//                           {currentDistrict.politicalConstituencies.lokSabha.map((seat, idx) => (
//                             <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                               {seat}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                     {currentDistrict.politicalConstituencies.vidhanSabha?.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                           VIDHAN SABHA
//                         </p>
//                         <div className="space-y-2">
//                           {currentDistrict.politicalConstituencies.vidhanSabha.map((seat, idx) => (
//                             <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                               {seat}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               )} */}

//               {/* Administrative Divisions */}
//               {/* {currentDistrict.administrativeDivisions && currentDistrict.administrativeDivisions.length > 0 && (
//                 <Card>
//                   <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//                     Administrative Divisions
//                   </h3>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                     {currentDistrict.administrativeDivisions.map((division, idx) => (
//                       <div
//                         key={idx}
//                         className="p-3 rounded-lg text-center font-medium"
//                         style={{ backgroundColor: colors.lightBg, color: colors.primary }}
//                       >
//                         {division}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )} */}
//             </div>
//           )}

//           {/* Tourist Places Tab */}
//           {activeTab === 'places' && (
//             <div className="space-y-6">
//               {currentDistrict.touristPlaces && currentDistrict.touristPlaces.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {currentDistrict.touristPlaces.map((place, idx) => (
//                     <Card key={idx} sx={{ overflow: 'hidden' }}>
//                       {place.images && place.images[0] && (
//                         <img 
//                           src={place.images[0]} 
//                           alt={place.name}
//                           className="w-full h-48 object-cover rounded-lg mb-4"
//                           onError={(e) => {
//                             e.target.style.display = 'none';
//                           }}
//                         />
//                       )}
//                       <div className="flex items-start gap-3 mb-3">
//                         <div className="p-2 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                           {place.category === 'monument' && <Landmark size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'natural' && <Trees size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'religious' && <Star size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'cultural' && <Award size={20} style={{ color: colors.primary }} />}
//                           {!place.category && <MapPin size={20} style={{ color: colors.primary }} />}
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkGray }}>
//                             {typeof place === 'string' ? place : place.name}
//                           </h3>
//                           {place.category && (
//                             <span 
//                               className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
//                               style={{ backgroundColor: colors.secondary }}
//                             >
//                               {place.category.toUpperCase()}
//                             </span>
//                           )}
//                           {place.description && (
//                             <p className="text-gray-600 leading-relaxed">{place.description}</p>
//                           )}
//                         </div>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <div className="text-center py-12">
//                     <MapPin size={48} className="mx-auto mb-4" style={{ color: colors.primary }} />
//                     <p className="text-xl text-gray-600">No tourist places information available</p>
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {/* History & Culture Tab */}
//           {activeTab === 'culture' && (
//             <Card>
//               <div className="flex items-center gap-3 mb-6">
//                 <Landmark size={32} style={{ color: colors.primary }} />
//                 <h2 className="text-3xl font-bold" style={{ color: colors.darkGray }}>
//                   History & Cultural Heritage
//                 </h2>
//               </div>
//               <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
//                 {currentDistrict.historyAndCulture || 
//                   `${currentDistrict.name} has a rich historical and cultural heritage that dates back centuries. The district has witnessed various dynasties and rulers, each contributing to its diverse cultural tapestry.`}
//               </p>
//             </Card>
//           )}

//           {/* Famous Personalities Tab */}
//           {activeTab === 'personalities' && (
//             <div className="space-y-6">
//               {currentDistrict.famousPersonalities && currentDistrict.famousPersonalities.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {currentDistrict.famousPersonalities.map((person, idx) => (
//                     <Card key={idx}>
//                       {person.image && (
//                         <img 
//                           src={person.image} 
//                           alt={person.name}
//                           className="w-full h-48 object-cover rounded-lg mb-4"
//                           onError={(e) => {
//                             e.target.style.display = 'none';
//                           }}
//                         />
//                       )}
//                       <div className="flex items-center gap-3 mb-3">
//                         <Award size={24} style={{ color: colors.primary }} />
//                         <h3 className="text-xl font-bold" style={{ color: colors.darkGray }}>
//                           {person.name}
//                         </h3>
//                       </div>
//                       <p 
//                         className="text-sm font-semibold mb-3 px-3 py-1 rounded-full inline-block"
//                         style={{ backgroundColor: colors.lightBg, color: colors.primary }}
//                       >
//                         {person.field}
//                       </p>
//                       {person.description && (
//                         <p className="text-gray-600 leading-relaxed">{person.description}</p>
//                       )}
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <div className="text-center py-12">
//                     <Award size={48} className="mx-auto mb-4" style={{ color: colors.primary }} />
//                     <p className="text-xl text-gray-600">No famous personalities information available</p>
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, Newspaper, Building2, ArrowLeft, 
//   ChevronRight, Star, Landmark, Trees, Award
// } from 'lucide-react';
// import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
// import Loader from '@/components/ui/Loader';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function DistrictDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedDistrict, loading, districtCache } = useSelector(state => state.district);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

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
//     text: '#374151'
//   };

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) return;

//     // Check if we already have this district in cache or selectedDistrict
//     const cached = districtCache[slug];
//     const hasDistrict = selectedDistrict && selectedDistrict.slug === slug;
    
//     if (hasDistrict) {
//       setIsInitialLoad(false);
//       return;
//     }

//     // Check cache validity (5 minutes)
//     const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000;
    
//     if (isCacheValid) {
//       setIsInitialLoad(false);
//     } else {
//       // Fetch only if not cached
//       dispatch(fetchDistrictBySlug(slug)).then(() => {
//         setIsInitialLoad(false);
//       }).catch(() => {
//         setIsInitialLoad(false);
//       });
//     }
//   }, [params?.slug, dispatch, districtCache, selectedDistrict]);

//   const formatNumber = (num) => {
//     if (!num) return 'N/A';
//     if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toLocaleString();
//   };

//   // Show loader only during initial load
//   if (isInitialLoad && loading) {
//     return <Loader />;
//   }

//   // Show error state if no district found after loading
//   if (!loading && !selectedDistrict) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bgColor }}>
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//             District Not Found
//           </h2>
//           <p className="text-gray-600 mb-6">
//             The district you're looking for doesn't exist or has been removed.
//           </p>
//           <Button
//             variant="contained"
//             onClick={() => router.push('/districts')}
//             sx={{ backgroundColor: colors.primary }}
//           >
//             Back to Districts
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Building2 },
//     { id: 'places', label: 'Tourist Places', icon: MapPin },
//     { id: 'culture', label: 'History & Culture', icon: Landmark },
//     { id: 'personalities', label: 'Famous People', icon: Award }
//   ];

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Hero Section */}
//       <div className="relative h-96 overflow-hidden">
//         {selectedDistrict.headerImage ? (
//           <img 
//             src={selectedDistrict.headerImage} 
//             alt={selectedDistrict.name}
//             className="w-full h-full object-cover"
//             onError={(e) => {
//               e.target.style.display = 'none';
//             }}
//           />
//         ) : (
//           <div 
//             className="w-full h-full flex items-center justify-center"
//             style={{ backgroundColor: colors.primary }}
//           >
//             <div className="text-9xl">🏛️</div>
//           </div>
//         )}
        
//         {/* Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
//         {/* Back Button */}
//         <button
//           onClick={() => router.push('/districts')}
//           className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
//         >
//           <ArrowLeft size={24} style={{ color: colors.primary }} />
//         </button>

//         {/* Title */}
//         <div className="absolute bottom-0 left-0 right-0 p-8">
//           <div className="max-w-6xl mx-auto">
//             <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
//               {selectedDistrict.name}
//             </h1>
//             <p className="text-2xl text-white/90 mb-4">
//               {selectedDistrict.nameHi || ''}
//             </p>
//             <div className="flex flex-wrap gap-4 text-white/90">
//               <div className="flex items-center gap-2">
//                 <MapPin size={20} />
//                 <span>{selectedDistrict.region || 'Madhya Pradesh'} Region</span>
//               </div>
//               {selectedDistrict.formationYear && (
//                 <div className="flex items-center gap-2">
//                   <Calendar size={20} />
//                   <span>Est. {selectedDistrict.formationYear}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10 mb-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Users size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Population</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {formatNumber(selectedDistrict.population)}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Mountain size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Area</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {selectedDistrict.area ? `${selectedDistrict.area.toLocaleString()} km²` : 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Building2 size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Divisions</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {selectedDistrict.administrativeDivisions?.length || 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Droplet size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Major Rivers</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {selectedDistrict.majorRivers?.length || 0}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Building2 />}
//             onClick={() => router.push(`/panchayats?district=${selectedDistrict._id}`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.primary,
//               '&:hover': { backgroundColor: colors.primaryDark }
//             }}
//           >
//             View Panchayats
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Camera />}
//             onClick={() => router.push(`/gallery?district=${selectedDistrict._id}`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.secondary,
//               '&:hover': { backgroundColor: '#1565C0' }
//             }}
//           >
//             Visit Gallery
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Newspaper />}
//             onClick={() => router.push(`/news?district=${selectedDistrict._id}`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.accent,
//               '&:hover': { backgroundColor: '#2E7D32' }
//             }}
//           >
//             Latest News
//           </Button>
//         </div>

//         {/* Tabs */}
//         <div className="mb-8">
//           <div className="flex flex-wrap gap-2 border-b-2" style={{ borderColor: colors.lightBg }}>
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
//                 style={{
//                   color: activeTab === tab.id ? colors.primary : colors.text,
//                   borderBottom: activeTab === tab.id ? `3px solid ${colors.primary}` : 'none',
//                   marginBottom: '-2px'
//                 }}
//               >
//                 <tab.icon size={20} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="space-y-8">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="space-y-8">
//               {/* About District */}
//               <Card>
//                 <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
//                   About {selectedDistrict.name}
//                 </h2>
//                 <p className="text-lg leading-relaxed text-gray-700">
//                   {selectedDistrict.historyAndCulture || `${selectedDistrict.name} is a significant district in Madhya Pradesh known for its rich cultural heritage and historical importance.`}
//                 </p>
//               </Card>

//               {/* Rivers */}
//               {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
//                 <Card>
//                   <div className="flex items-center gap-3 mb-4">
//                     <Droplet size={28} style={{ color: colors.primary }} />
//                     <h3 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                       Major Rivers
//                     </h3>
//                   </div>
//                   <div className="flex flex-wrap gap-3">
//                     {selectedDistrict.majorRivers.map((river, idx) => (
//                       <div
//                         key={idx}
//                         className="px-6 py-3 rounded-full text-white font-semibold"
//                         style={{ backgroundColor: colors.secondary }}
//                       >
//                         {river}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Hills & Natural Spots */}
//               {((selectedDistrict.hills && selectedDistrict.hills.length > 0) || 
//                 (selectedDistrict.naturalSpots && selectedDistrict.naturalSpots.length > 0)) && (
//                 <Card>
//                   <div className="flex items-center gap-3 mb-4">
//                     <Trees size={28} style={{ color: colors.primary }} />
//                     <h3 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                       Natural Attractions
//                     </h3>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {selectedDistrict.hills?.map((hill, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-4 rounded-lg"
//                         style={{ backgroundColor: colors.lightBg }}
//                       >
//                         <Mountain size={20} style={{ color: colors.primary }} />
//                         <span className="font-medium">{hill}</span>
//                       </div>
//                     ))}
//                     {selectedDistrict.naturalSpots?.map((spot, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-4 rounded-lg"
//                         style={{ backgroundColor: colors.lightBg }}
//                       >
//                         <Trees size={20} style={{ color: colors.primary }} />
//                         <span className="font-medium">{spot}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Political Constituencies */}
//               {selectedDistrict.politicalConstituencies && (
//                 selectedDistrict.politicalConstituencies.lokSabha?.length > 0 || 
//                 selectedDistrict.politicalConstituencies.vidhanSabha?.length > 0
//               ) && (
//                 <Card>
//                   <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//                     Political Constituencies
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {selectedDistrict.politicalConstituencies.lokSabha?.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                           LOK SABHA
//                         </p>
//                         <div className="space-y-2">
//                           {selectedDistrict.politicalConstituencies.lokSabha.map((seat, idx) => (
//                             <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                               {seat}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                     {selectedDistrict.politicalConstituencies.vidhanSabha?.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                           VIDHAN SABHA
//                         </p>
//                         <div className="space-y-2">
//                           {selectedDistrict.politicalConstituencies.vidhanSabha.map((seat, idx) => (
//                             <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                               {seat}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               )}

//               {/* Administrative Divisions */}
//               {selectedDistrict.administrativeDivisions && selectedDistrict.administrativeDivisions.length > 0 && (
//                 <Card>
//                   <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//                     Administrative Divisions
//                   </h3>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                     {selectedDistrict.administrativeDivisions.map((division, idx) => (
//                       <div
//                         key={idx}
//                         className="p-3 rounded-lg text-center font-medium"
//                         style={{ backgroundColor: colors.lightBg, color: colors.primary }}
//                       >
//                         {division}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {/* Tourist Places Tab */}
//           {activeTab === 'places' && (
//             <div className="space-y-6">
//               {selectedDistrict.touristPlaces && selectedDistrict.touristPlaces.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {selectedDistrict.touristPlaces.map((place, idx) => (
//                     <Card key={idx} sx={{ overflow: 'hidden' }}>
//                       {place.images && place.images[0] && (
//                         <img 
//                           src={place.images[0]} 
//                           alt={place.name}
//                           className="w-full h-48 object-cover rounded-lg mb-4"
//                           onError={(e) => {
//                             e.target.style.display = 'none';
//                           }}
//                         />
//                       )}
//                       <div className="flex items-start gap-3 mb-3">
//                         <div className="p-2 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                           {place.category === 'monument' && <Landmark size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'natural' && <Trees size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'religious' && <Star size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'cultural' && <Award size={20} style={{ color: colors.primary }} />}
//                           {!place.category && <MapPin size={20} style={{ color: colors.primary }} />}
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkGray }}>
//                             {typeof place === 'string' ? place : place.name}
//                           </h3>
//                           {place.category && (
//                             <span 
//                               className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
//                               style={{ backgroundColor: colors.secondary }}
//                             >
//                               {place.category.toUpperCase()}
//                             </span>
//                           )}
//                           {place.description && (
//                             <p className="text-gray-600 leading-relaxed">{place.description}</p>
//                           )}
//                         </div>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <div className="text-center py-12">
//                     <MapPin size={48} className="mx-auto mb-4" style={{ color: colors.primary }} />
//                     <p className="text-xl text-gray-600">No tourist places information available</p>
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {/* History & Culture Tab */}
//           {activeTab === 'culture' && (
//             <Card>
//               <div className="flex items-center gap-3 mb-6">
//                 <Landmark size={32} style={{ color: colors.primary }} />
//                 <h2 className="text-3xl font-bold" style={{ color: colors.darkGray }}>
//                   History & Cultural Heritage
//                 </h2>
//               </div>
//               <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
//                 {selectedDistrict.historyAndCulture || 
//                   `${selectedDistrict.name} has a rich historical and cultural heritage that dates back centuries. The district has witnessed various dynasties and rulers, each contributing to its diverse cultural tapestry.`}
//               </p>
//             </Card>
//           )}

//           {/* Famous Personalities Tab */}
//           {activeTab === 'personalities' && (
//             <div className="space-y-6">
//               {selectedDistrict.famousPersonalities && selectedDistrict.famousPersonalities.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {selectedDistrict.famousPersonalities.map((person, idx) => (
//                     <Card key={idx}>
//                       {person.image && (
//                         <img 
//                           src={person.image} 
//                           alt={person.name}
//                           className="w-full h-48 object-cover rounded-lg mb-4"
//                           onError={(e) => {
//                             e.target.style.display = 'none';
//                           }}
//                         />
//                       )}
//                       <div className="flex items-center gap-3 mb-3">
//                         <Award size={24} style={{ color: colors.primary }} />
//                         <h3 className="text-xl font-bold" style={{ color: colors.darkGray }}>
//                           {person.name}
//                         </h3>
//                       </div>
//                       <p 
//                         className="text-sm font-semibold mb-3 px-3 py-1 rounded-full inline-block"
//                         style={{ backgroundColor: colors.lightBg, color: colors.primary }}
//                       >
//                         {person.field}
//                       </p>
//                       {person.description && (
//                         <p className="text-gray-600 leading-relaxed">{person.description}</p>
//                       )}
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <div className="text-center py-12">
//                     <Award size={48} className="mx-auto mb-4" style={{ color: colors.primary }} />
//                     <p className="text-xl text-gray-600">No famous personalities information available</p>
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, Newspaper, Building2, ArrowLeft, 
//   Phone, Mail, Globe, ChevronRight, Star,
//   Landmark, Trees, Award, Image as ImageIcon
// } from 'lucide-react';
// import { fetchDistrictBySlug } from '@/redux/slices/districtSlice';
// import { fetchMediaByDistrict } from '@/redux/slices/mediaSlice';
// import { fetchNewsByDistrict } from '@/redux/slices/newsSlice';
// import { fetchPanchayatsByDistrict } from '@/redux/slices/panchayatSlice';
// import Loader from '@/components/ui/Loader';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function DistrictDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedDistrict, loading, districtCache } = useSelector(state => state.district);
//   const { media } = useSelector(state => state.media);
//   const { news } = useSelector(state => state.news);
//   const { panchayats } = useSelector(state => state.panchayat);
  
//   const [activeTab, setActiveTab] = useState('overview');

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
//     text: '#374151'
//   };

//   useEffect(() => {
//     if (params?.slug) {
//       // Check cache first
//       const cached = districtCache[params.slug];
//       const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000; // 5 min
      
//       if (!isCacheValid) {
//         dispatch(fetchDistrictBySlug(params.slug));
//       }
//     }
//   }, [params?.slug, dispatch, districtCache]);

//   useEffect(() => {
//     if (selectedDistrict?._id) {
//       dispatch(fetchMediaByDistrict({ districtId: selectedDistrict._id, params: { limit: 6 } }));
//       dispatch(fetchNewsByDistrict({ districtId: selectedDistrict._id, params: { limit: 5 } }));
//       dispatch(fetchPanchayatsByDistrict(selectedDistrict._id));
//     }
//   }, [selectedDistrict?._id, dispatch]);

//   const formatNumber = (num) => {
//     if (!num) return 'N/A';
//     if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`;
//     if (num > 1000) return `${(num / 1000).toFixed(1)}K`;
//     return num.toLocaleString();
//   };

//   if (loading || !selectedDistrict) {
//     return <Loader />;
//   }

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Building2 },
//     { id: 'places', label: 'Tourist Places', icon: MapPin },
//     { id: 'culture', label: 'History & Culture', icon: Landmark },
//     { id: 'personalities', label: 'Famous People', icon: Award }
//   ];

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Hero Section */}
//       <div className="relative h-96 overflow-hidden">
//         {selectedDistrict.headerImage ? (
//           <img 
//             src={selectedDistrict.headerImage} 
//             alt={selectedDistrict.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div 
//             className="w-full h-full flex items-center justify-center"
//             style={{ backgroundColor: colors.primary }}
//           >
//             <div className="text-9xl">🏛️</div>
//           </div>
//         )}
        
//         {/* Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
//         {/* Back Button */}
//         <button
//           onClick={() => router.back()}
//           className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
//         >
//           <ArrowLeft size={24} style={{ color: colors.primary }} />
//         </button>

//         {/* Title */}
//         <div className="absolute bottom-0 left-0 right-0 p-8">
//           <div className="max-w-6xl mx-auto">
//             <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
//               {selectedDistrict.name}
//             </h1>
//             <p className="text-2xl text-white/90 mb-4">
//               {selectedDistrict.nameHi || ''}
//             </p>
//             <div className="flex flex-wrap gap-4 text-white/90">
//               <div className="flex items-center gap-2">
//                 <MapPin size={20} />
//                 <span>{selectedDistrict.region || 'Madhya Pradesh'} Region</span>
//               </div>
//               {selectedDistrict.formationYear && (
//                 <div className="flex items-center gap-2">
//                   <Calendar size={20} />
//                   <span>Est. {selectedDistrict.formationYear}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10 mb-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Users size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Population</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {formatNumber(selectedDistrict.population)}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Mountain size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Area</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {selectedDistrict.area ? `${selectedDistrict.area.toLocaleString()} km²` : 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Building2 size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Panchayats</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {panchayats?.length || 0}
//                 </p>
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ backgroundColor: colors.white }}>
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                 <Droplet size={28} style={{ color: colors.primary }} />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Major Rivers</p>
//                 <p className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                   {selectedDistrict.majorRivers?.length || 0}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Building2 />}
//             onClick={() => router.push(`/district/${params.slug}/panchayats`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.primary,
//               '&:hover': { backgroundColor: colors.primaryDark }
//             }}
//           >
//             View Panchayats
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Camera />}
//             onClick={() => router.push(`/district/${params.slug}/gallery`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.secondary,
//               '&:hover': { backgroundColor: '#1565C0' }
//             }}
//           >
//             Visit Gallery
//           </Button>

//           <Button
//             variant="contained"
//             fullWidth
//             startIcon={<Newspaper />}
//             onClick={() => router.push(`/district/${params.slug}/news`)}
//             sx={{ 
//               py: 2,
//               backgroundColor: colors.accent,
//               '&:hover': { backgroundColor: '#2E7D32' }
//             }}
//           >
//             Latest News
//           </Button>
//         </div>

//         {/* Tabs */}
//         <div className="mb-8">
//           <div className="flex flex-wrap gap-2 border-b-2" style={{ borderColor: colors.lightBg }}>
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
//                 style={{
//                   color: activeTab === tab.id ? colors.primary : colors.text,
//                   borderBottom: activeTab === tab.id ? `3px solid ${colors.primary}` : 'none',
//                   marginBottom: '-2px'
//                 }}
//               >
//                 <tab.icon size={20} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="space-y-8">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="space-y-8">
//               {/* About District */}
//               <Card>
//                 <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
//                   About {selectedDistrict.name}
//                 </h2>
//                 <p className="text-lg leading-relaxed text-gray-700">
//                   {selectedDistrict.historyAndCulture || `${selectedDistrict.name} is a significant district in Madhya Pradesh known for its rich cultural heritage and historical importance.`}
//                 </p>
//               </Card>

//               {/* Rivers */}
//               {selectedDistrict.majorRivers && selectedDistrict.majorRivers.length > 0 && (
//                 <Card>
//                   <div className="flex items-center gap-3 mb-4">
//                     <Droplet size={28} style={{ color: colors.primary }} />
//                     <h3 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                       Major Rivers
//                     </h3>
//                   </div>
//                   <div className="flex flex-wrap gap-3">
//                     {selectedDistrict.majorRivers.map((river, idx) => (
//                       <div
//                         key={idx}
//                         className="px-6 py-3 rounded-full text-white font-semibold"
//                         style={{ backgroundColor: colors.secondary }}
//                       >
//                         {river}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Hills & Natural Spots */}
//               {((selectedDistrict.hills && selectedDistrict.hills.length > 0) || 
//                 (selectedDistrict.naturalSpots && selectedDistrict.naturalSpots.length > 0)) && (
//                 <Card>
//                   <div className="flex items-center gap-3 mb-4">
//                     <Trees size={28} style={{ color: colors.primary }} />
//                     <h3 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
//                       Natural Attractions
//                     </h3>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {selectedDistrict.hills?.map((hill, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-4 rounded-lg"
//                         style={{ backgroundColor: colors.lightBg }}
//                       >
//                         <Mountain size={20} style={{ color: colors.primary }} />
//                         <span className="font-medium">{hill}</span>
//                       </div>
//                     ))}
//                     {selectedDistrict.naturalSpots?.map((spot, idx) => (
//                       <div
//                         key={idx}
//                         className="flex items-center gap-3 p-4 rounded-lg"
//                         style={{ backgroundColor: colors.lightBg }}
//                       >
//                         <Trees size={20} style={{ color: colors.primary }} />
//                         <span className="font-medium">{spot}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Political Constituencies */}
//               {selectedDistrict.politicalConstituencies && (
//                 <Card>
//                   <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkGray }}>
//                     Political Constituencies
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {selectedDistrict.politicalConstituencies.lokSabha?.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                           LOK SABHA
//                         </p>
//                         <div className="space-y-2">
//                           {selectedDistrict.politicalConstituencies.lokSabha.map((seat, idx) => (
//                             <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                               {seat}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                     {selectedDistrict.politicalConstituencies.vidhanSabha?.length > 0 && (
//                       <div>
//                         <p className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
//                           VIDHAN SABHA
//                         </p>
//                         <div className="space-y-2">
//                           {selectedDistrict.politicalConstituencies.vidhanSabha.map((seat, idx) => (
//                             <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                               {seat}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {/* Tourist Places Tab */}
//           {activeTab === 'places' && (
//             <div className="space-y-6">
//               {selectedDistrict.touristPlaces && selectedDistrict.touristPlaces.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {selectedDistrict.touristPlaces.map((place, idx) => (
//                     <Card key={idx} sx={{ overflow: 'hidden' }}>
//                       {place.images && place.images[0] && (
//                         <img 
//                           src={place.images[0]} 
//                           alt={place.name}
//                           className="w-full h-48 object-cover rounded-lg mb-4"
//                         />
//                       )}
//                       <div className="flex items-start gap-3 mb-3">
//                         <div className="p-2 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
//                           {place.category === 'monument' && <Landmark size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'natural' && <Trees size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'religious' && <Star size={20} style={{ color: colors.primary }} />}
//                           {place.category === 'cultural' && <Award size={20} style={{ color: colors.primary }} />}
//                           {!place.category && <MapPin size={20} style={{ color: colors.primary }} />}
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkGray }}>
//                             {typeof place === 'string' ? place : place.name}
//                           </h3>
//                           {place.category && (
//                             <span 
//                               className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
//                               style={{ backgroundColor: colors.secondary }}
//                             >
//                               {place.category.toUpperCase()}
//                             </span>
//                           )}
//                           {place.description && (
//                             <p className="text-gray-600 leading-relaxed">{place.description}</p>
//                           )}
//                         </div>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <div className="text-center py-12">
//                     <MapPin size={48} className="mx-auto mb-4" style={{ color: colors.primary }} />
//                     <p className="text-xl text-gray-600">No tourist places information available</p>
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {/* History & Culture Tab */}
//           {activeTab === 'culture' && (
//             <Card>
//               <div className="flex items-center gap-3 mb-6">
//                 <Landmark size={32} style={{ color: colors.primary }} />
//                 <h2 className="text-3xl font-bold" style={{ color: colors.darkGray }}>
//                   History & Cultural Heritage
//                 </h2>
//               </div>
//               <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
//                 {selectedDistrict.historyAndCulture || 
//                   `${selectedDistrict.name} has a rich historical and cultural heritage that dates back centuries. The district has witnessed various dynasties and rulers, each contributing to its diverse cultural tapestry.`}
//               </p>
//             </Card>
//           )}

//           {/* Famous Personalities Tab */}
//           {activeTab === 'personalities' && (
//             <div className="space-y-6">
//               {selectedDistrict.famousPersonalities && selectedDistrict.famousPersonalities.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {selectedDistrict.famousPersonalities.map((person, idx) => (
//                     <Card key={idx}>
//                       {person.image && (
//                         <img 
//                           src={person.image} 
//                           alt={person.name}
//                           className="w-full h-48 object-cover rounded-lg mb-4"
//                         />
//                       )}
//                       <div className="flex items-center gap-3 mb-3">
//                         <Award size={24} style={{ color: colors.primary }} />
//                         <h3 className="text-xl font-bold" style={{ color: colors.darkGray }}>
//                           {person.name}
//                         </h3>
//                       </div>
//                       <p 
//                         className="text-sm font-semibold mb-3 px-3 py-1 rounded-full inline-block"
//                         style={{ backgroundColor: colors.lightBg, color: colors.primary }}
//                       >
//                         {person.field}
//                       </p>
//                       {person.description && (
//                         <p className="text-gray-600 leading-relaxed">{person.description}</p>
//                       )}
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <div className="text-center py-12">
//                     <Award size={48} className="mx-auto mb-4" style={{ color: colors.primary }} />
//                     <p className="text-xl text-gray-600">No famous personalities information available</p>
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Recent Gallery Section */}
//         {media && media.length > 0 && (
//           <div className="mt-12">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
//                 Recent Gallery
//               </h2>
//               <Button
//                 variant="outlined"
//                 endIcon={<ChevronRight />}
//                 onClick={() => router.push(`/district/${params.slug}/gallery`)}
//                 sx={{ borderColor: colors.primary, color: colors.primary }}
//               >
//                 View All
//               </Button>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//               {media.slice(0, 6).map((item, idx) => (
//                 <div 
//                   key={idx}
//                   className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
//                 >
//                   <img 
//                     src={item.url || item.fileUrl} 
//                     alt={item.title}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Latest News Section */}
//         {news && news.length > 0 && (
//           <div className="mt-12">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
//                 Latest News
//               </h2>
//               <Button
//                 variant="outlined"
//                 endIcon={<ChevronRight />}
//                 onClick={() => router.push(`/district/${params.slug}/news`)}
//                 sx={{ borderColor: colors.primary, color: colors.primary }}
//               >
//                 View All
//               </Button>
//             </div>
//             <div className="space-y-4">
//               {news.slice(0, 5).map((item, idx) => (
//                 <Card 
//                   key={idx}
//                   sx={{ 
//                     cursor: 'pointer',
//                     '&:hover': { boxShadow: 3 }
//                   }}
//                   onClick={() => router.push(`/news/${item.slug}`)}
//                 >
//                   <div className="flex gap-4">
//                     {item.featuredImage && (
//                       <img 
//                         src={item.featuredImage} 
//                         alt={item.title}
//                         className="w-32 h-32 object-cover rounded-lg"
//                       />
//                     )}
//                     <div className="flex-1">
//                       <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkGray }}>
//                         {item.title}
//                       </h3>
//                       <p className="text-gray-600 line-clamp-2 mb-2">
//                         {item.excerpt || item.content?.substring(0, 150)}
//                       </p>
//                       <p className="text-sm" style={{ color: colors.primary }}>
//                         {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-IN', {
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }