import React from 'react'

const page = () => {
  return (
    <div>
      page in contruction
    </div>
  )
}

export default page
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   MapPin, Calendar, Users, Mountain, Droplet, 
//   Camera, ArrowLeft, Share2, Home, Building2, 
//   BookOpen, TreePine, UtensilsCrossed, Palette,
//   Image as ImageIcon, Video, Landmark, FileText, Loader2
// } from 'lucide-react';
// import { fetchPanchayatById } from '@/redux/slices/panchayatSlice';
// import { fetchMediaByPanchayat } from '@/redux/slices/panchayatSlice';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function PanchayatDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { selectedPanchayat, loading, panchayatCache, error } = useSelector(state => state.panchayat);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPanchayat, setCurrentPanchayat] = useState(null);
//   const [panchayatMedia, setPanchayatMedia] = useState([]);

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       return;
//     }

//     const loadPanchayat = async () => {
//       try {
//         setIsLoading(true);
        
//         // Check cache
//         const cached = panchayatCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000; // 5 min
        
//         if (isCacheValid) {
//           setCurrentPanchayat(cached.data);
//           setIsLoading(false);
//           return;
//         }

//         if (selectedPanchayat && selectedPanchayat.slug === slug) {
//           setCurrentPanchayat(selectedPanchayat);
//           setIsLoading(false);
//           return;
//         }

//         // Fetch by slug (you might need to find by _id if slug doesn't work)
//         const result = await dispatch(fetchPanchayatById(slug)).unwrap();
        
//         if (result.panchayat) {
//           setCurrentPanchayat(result.panchayat);
          
//           // Fetch media for this panchayat
//           if (result.panchayat._id) {
//             try {
//               const mediaResult = await dispatch(fetchMediaByPanchayat({ 
//                 panchayatId: result.panchayat._id 
//               })).unwrap();
//               setPanchayatMedia(mediaResult.media || []);
//             } catch (err) {
//               console.error('Error loading media:', err);
//             }
//           }
//         }
//       } catch (err) {
//         console.error('Error loading panchayat:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadPanchayat();
//   }, [params?.slug, dispatch, panchayatCache, selectedPanchayat]);

//   // Show loader
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <div className="flex flex-col items-center">
//           <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
//           <p className="text-[#117307] text-lg font-medium">Loading panchayat...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error
//   if (!isLoading && !currentPanchayat) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">
//             Panchayat Not Found
//           </h2>
//           <p className="text-[#1a5e10] mb-6">
//             {error || "The panchayat you're looking for doesn't exist."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Button
//               variant="outlined"
//               onClick={() => router.push('/panchayats')}
//               sx={{ borderColor: '#117307', color: '#117307' }}
//             >
//               Back to Panchayats
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
//     { id: 'overview', label: 'Overview', icon: Home },
//     { id: 'culture', label: 'Culture & Heritage', icon: BookOpen },
//     { id: 'geography', label: 'Geography', icon: Mountain },
//     { id: 'media', label: 'Media Gallery', icon: Camera },
//   ];

//   if (currentPanchayat.rtcReport) {
//     tabs.push({ id: 'rtc-report', label: 'RTC Report', icon: FileText });
//   }

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header */}
//       <div className="bg-[#117307] py-6 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//         </div>
        
//         <div className="max-w-6xl mx-auto px-4 relative z-10">
//           <div className="flex justify-between items-center">
//             <button
//               onClick={() => router.push('/panchayats')}
//               className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//             >
//               <ArrowLeft size={22} />
//               Back to Panchayats
//             </button>

//             <button
//               onClick={() => {
//                 if (navigator.share) {
//                   navigator.share({
//                     title: currentPanchayat.name,
//                     text: `Explore ${currentPanchayat.name} - ${currentPanchayat.district?.name || 'Madhya Pradesh'}`,
//                     url: window.location.href
//                   });
//                 }
//               }}
//               className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg"
//             >
//               <Share2 size={22} />
//               Share
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left: Main Content - 75% */}
//           <div className="lg:w-3/4">
//             {/* Header Image */}
//             <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
//               <div className="relative h-96 bg-[#f5fbf2]">
//                 {currentPanchayat.headerImage ? (
//                   <img
//                     src={currentPanchayat.headerImage}
//                     alt={currentPanchayat.name}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                       e.target.nextSibling.style.display = 'flex';
//                     }}
//                   />
//                 ) : null}

//                 <div
//                   className={`absolute inset-0 items-center justify-center bg-[#117307] ${
//                     currentPanchayat.headerImage ? 'hidden' : 'flex'
//                   }`}
//                 >
//                   <Home size={96} className="text-white opacity-50" />
//                 </div>

//                 {/* Status Badge */}
//                 {currentPanchayat.status === 'verified' && (
//                   <div className="absolute top-4 right-4">
//                     <div className="bg-emerald-500 px-4 py-2 rounded-full flex items-center gap-2">
//                       <Landmark size={18} className="text-white" />
//                       <span className="text-sm font-bold text-white">Verified Panchayat</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Title & Location */}
//             <div className="mb-8">
//               <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-3">
//                 {currentPanchayat.name}
//               </h1>
              
//               <div className="flex flex-wrap gap-4 text-[#4d674f]">
//                 <div className="flex items-center gap-2">
//                   <MapPin size={18} className="text-[#1a5e10]" />
//                   <span className="font-medium">
//                     {currentPanchayat.block}, {currentPanchayat.district?.name || 'District'}
//                   </span>
//                 </div>
//                 {currentPanchayat.establishmentYear && (
//                   <div className="flex items-center gap-2">
//                     <Calendar size={18} className="text-[#1a5e10]" />
//                     <span className="font-medium">Est. {currentPanchayat.establishmentYear}</span>
//                   </div>
//                 )}
//               </div>
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
//               {/* Overview Tab */}
//               {activeTab === 'overview' && (
//                 <div className="space-y-6">
//                   {/* Key Statistics */}
//                   <Card>
//                     <h2 className="text-2xl font-bold text-[#0d4d03] mb-6">Key Statistics</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Users size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Population</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {formatNumber(currentPanchayat.population)}
//                         </p>
//                       </div>

//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Mountain size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Area</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {currentPanchayat.area ? `${currentPanchayat.area.toLocaleString()} km²` : 'N/A'}
//                         </p>
//                       </div>

//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <MapPin size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Block</h3>
//                         <p className="text-xl font-bold text-[#0d4d03]">
//                           {currentPanchayat.block || 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                   </Card>

//                   {/* Historical Background */}
//                   {currentPanchayat.historicalBackground && (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <BookOpen size={24} className="text-[#117307]" />
//                         Historical Background
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.historicalBackground}
//                       </p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {/* Culture & Heritage Tab */}
//               {activeTab === 'culture' && (
//                 <div className="space-y-6">
//                   {/* Local Art */}
//                   {currentPanchayat.localArt && (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <Palette size={24} className="text-[#117307]" />
//                         Local Art & Crafts
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.localArt}
//                       </p>
//                     </Card>
//                   )}

//                   {/* Local Cuisine */}
//                   {currentPanchayat.localCuisine && (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <UtensilsCrossed size={24} className="text-[#117307]" />
//                         Local Cuisine
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.localCuisine}
//                       </p>
//                     </Card>
//                   )}

//                   {/* Traditions */}
//                   {currentPanchayat.traditions && (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <TreePine size={24} className="text-[#117307]" />
//                         Traditions & Festivals
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.traditions}
//                       </p>
//                     </Card>
//                   )}

//                   {!currentPanchayat.localArt && !currentPanchayat.localCuisine && !currentPanchayat.traditions && (
//                     <Card>
//                       <div className="text-center py-12">
//                         <BookOpen size={48} className="mx-auto text-[#117307] opacity-20 mb-4" />
//                         <p className="text-[#1a5e10]">Cultural information coming soon...</p>
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {/* Geography Tab */}
//               {activeTab === 'geography' && (
//                 <div className="space-y-6">
//                   {/* Coordinates */}
//                   {currentPanchayat.coordinates && (
//                     <Card>
//                       <h2 className="text-2xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                         <MapPin size={24} className="text-[#117307]" />
//                         Geographic Location
//                       </h2>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="p-4 rounded-lg bg-[#f5fbf2]">
//                           <p className="text-sm font-semibold text-[#4d674f] mb-1">Latitude</p>
//                           <p className="text-lg font-bold text-[#0d4d03]">
//                             {currentPanchayat.coordinates.lat}°
//                           </p>
//                         </div>
//                         <div className="p-4 rounded-lg bg-[#f5fbf2]">
//                           <p className="text-sm font-semibold text-[#4d674f] mb-1">Longitude</p>
//                           <p className="text-lg font-bold text-[#0d4d03]">
//                             {currentPanchayat.coordinates.lng}°
//                           </p>
//                         </div>
//                       </div>
//                     </Card>
//                   )}

//                   {/* Major Rivers */}
//                   {currentPanchayat.majorRivers && currentPanchayat.majorRivers.length > 0 && (
//                     <Card>
//                       <div className="flex items-center gap-3 mb-4">
//                         <Droplet size={24} className="text-[#117307]" />
//                         <h3 className="text-xl font-bold text-[#0d4d03]">Major Rivers</h3>
//                         <span className="text-base font-bold text-[#117307] ml-auto">
//                           {currentPanchayat.majorRivers.length}
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentPanchayat.majorRivers.map((river, idx) => (
//                           <span
//                             key={idx}
//                             className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold"
//                           >
//                             🌊 {river}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {/* Media Gallery Tab */}
//               {activeTab === 'media' && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-6 flex items-center gap-2">
//                     <Camera size={24} className="text-[#117307]" />
//                     Media Gallery
//                   </h2>
                  
//                   {panchayatMedia.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {panchayatMedia.map((media) => (
//                         <div
//                           key={media._id}
//                           className="relative group rounded-lg overflow-hidden cursor-pointer"
//                           onClick={() => router.push(`/gallery/${media._id}`)}
//                         >
//                           <div className="aspect-video bg-[#f5fbf2]">
//                             {media.fileType === 'video' ? (
//                               media.thumbnailUrl ? (
//                                 <img
//                                   src={media.thumbnailUrl}
//                                   alt={media.title}
//                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                 />
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
//                                   <Video size={48} className="text-[#117307]" />
//                                 </div>
//                               )
//                             ) : (
//                               <img
//                                 src={media.fileUrl}
//                                 alt={media.title}
//                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                               />
//                             )}
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="absolute bottom-0 left-0 right-0 p-4">
//                               <p className="text-white font-semibold line-clamp-2">{media.title}</p>
//                             </div>
//                           </div>
//                           {media.fileType === 'video' && (
//                             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
//                               <Video size={16} className="text-white" />
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-12">
//                       <ImageIcon size={48} className="mx-auto text-[#117307] opacity-20 mb-4" />
//                       <p className="text-[#1a5e10]">No media available yet</p>
//                     </div>
//                   )}
//                 </Card>
//               )}

//               {/* RTC Report Tab */}
//               {activeTab === 'rtc-report' && currentPanchayat.rtcReport && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-6 flex items-center gap-2">
//                     <FileText size={24} className="text-[#117307]" />
//                     RTC Report
//                   </h2>
                  
//                   <div className="space-y-4">
//                     {currentPanchayat.rtcReport.reportDate && (
//                       <div className="flex items-center gap-2 text-[#4d674f]">
//                         <Calendar size={18} className="text-[#117307]" />
//                         <span className="font-medium">
//                           Report Date: {new Date(currentPanchayat.rtcReport.reportDate).toLocaleDateString('en-US', {
//                             year: 'numeric', month: 'long', day: 'numeric'
//                           })}
//                         </span>
//                       </div>
//                     )}
                    
//                     {currentPanchayat.rtcReport.summary && (
//                       <div>
//                         <h3 className="text-lg font-bold text-[#0d4d03] mb-2">Summary</h3>
//                         <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                           {currentPanchayat.rtcReport.summary}
//                         </p>
//                       </div>
//                     )}

//                     {currentPanchayat.rtcReport.fieldVisitPhotos && currentPanchayat.rtcReport.fieldVisitPhotos.length > 0 && (
//                       <div>
//                         <h3 className="text-lg font-bold text-[#0d4d03] mb-3">Field Visit Photos</h3>
//                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                           {currentPanchayat.rtcReport.fieldVisitPhotos.map((photo, idx) => (
//                             <div key={idx} className="aspect-square rounded-lg overflow-hidden">
//                               <img
//                                 src={photo}
//                                 alt={`Field visit ${idx + 1}`}
//                                 className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           </div>

//           {/* Right: Sidebar - 25% */}
//           <div className="lg:w-1/4">
//             <div className="space-y-4 sticky top-4">
//               {/* Action Buttons */}
//               <div className="space-y-3">
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<Camera size={18} />}
//                   onClick={() => router.push(`/gallery?panchayat=${currentPanchayat._id}`)}
//                   sx={{ 
//                     py: 2,
//                     backgroundColor: '#117307',
//                     '&:hover': { backgroundColor: '#0d5c06' }
//                   }}
//                 >
//                   View Gallery
//                 </Button>

//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<Building2 size={18} />}
//                   onClick={() => router.push(`/districts/${currentPanchayat.district?.slug || currentPanchayat.district?._id}`)}
//                   sx={{ 
//                     py: 2,
//                     backgroundColor: '#117307',
//                     '&:hover': { backgroundColor: '#0d5c06' }
//                   }}
//                 >
//                   View District
//                 </Button>
//               </div>

//               {/* Quick Info Card */}
//               <div className="bg-white rounded-xl shadow-lg p-4">
//                 <h3 className="font-bold text-[#0d4d03] mb-3 text-sm">Quick Information</h3>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-[#4d674f]">District:</span>
//                     <span className="font-semibold text-[#0d4d03]">{currentPanchayat.district?.name || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-[#4d674f]">Block:</span>
//                     <span className="font-semibold text-[#0d4d03]">{currentPanchayat.block || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-[#4d674f]">Status:</span>
//                     <span className={`font-semibold ${
//                       currentPanchayat.status === 'verified' ? 'text-emerald-600' : 
//                       currentPanchayat.status === 'pending' ? 'text-yellow-600' : 
//                       'text-gray-600'
//                     }`}>
//                       {currentPanchayat.status?.charAt(0).toUpperCase() + currentPanchayat.status?.slice(1) || 'N/A'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Newsletter */}
//               <div className="bg-gradient-to-br from-[#117307] to-[#0d5c06] rounded-xl shadow-lg p-4 text-white">
//                 <h3 className="font-bold mb-2 text-sm">Stay Updated</h3>
//                 <p className="text-white/90 text-xs mb-3">
//                   Get updates about {currentPanchayat.name}
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