'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MapPin, Calendar, Users, Mountain, Droplet, 
  Camera, ArrowLeft, Share2, Home, Building2, 
  BookOpen, TreePine, UtensilsCrossed, Palette,
  Video, Landmark, Loader2, Languages,
  Bus, Hotel, AlertCircle, Award, Landmark as PoliticalIcon,
  User
} from 'lucide-react';
import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import Card from '@/components/ui/Card';

export default function PanchayatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const { panchayats, panchayatCache } = useSelector(state => state.panchayat);
  const { media } = useSelector(state => state.media);
  
  const [activeTab, setActiveTab] = useState('culture');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPanchayat, setCurrentPanchayat] = useState(null);
  const [panchayatMedia, setPanchayatMedia] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const slug = params?.slug;

    if (!slug) {
      setIsLoading(false);
      setError("No panchayat slug provided");
      return;
    }

    const loadMediaForPanchayat = async (panchayatId) => {
      try {
        const mediaResult = await dispatch(fetchMedia({ 
          gramPanchayat: panchayatId,
          status: 'approved',
          limit: 50
        })).unwrap();
        setPanchayatMedia(mediaResult.media || []);
      } catch (err) {
        console.error('Error loading media:', err);
      }
    };

    const loadPanchayat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const cached = panchayatCache[slug];
        
        if (cached && (Date.now() - cached.lastFetched) < 300000) {
          setCurrentPanchayat(cached.data);
          loadMediaForPanchayat(cached.data._id);
          setIsLoading(false);
          return;
        }

        let foundPanchayat = panchayats?.find(p => p.slug === slug);

        if (!foundPanchayat) {
          const result = await dispatch(fetchPanchayats({ limit: 100 })).unwrap();
          foundPanchayat = result.panchayats?.find(p => p.slug === slug);
        }

        if (foundPanchayat) {
          setCurrentPanchayat(foundPanchayat);
          loadMediaForPanchayat(foundPanchayat._id);
        } else {
          setError("Panchayat not found");
        }

      } catch (err) {
        console.error('Error loading panchayat:', err);
        setError(err?.message || "Failed to load panchayat");
      } finally {
        setIsLoading(false);
      }
    };

    loadPanchayat();
  }, [params?.slug, dispatch, panchayatCache, panchayats]);

  // Simple loader like district page - no skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5fbf2]">
        {/* Header remains visible during loading */}
        <div className="bg-[#117307] py-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="flex justify-between items-center">
              <button className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
                <ArrowLeft size={22} />
                Back to Panchayats
              </button>

              <button className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
                <Share2 size={22} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Simple loader in content area only - no skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="text-[#117307] animate-spin mb-4" />
              <p className="text-[#117307] text-lg font-medium">Loading panchayat details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !currentPanchayat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2] p-4">
        <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">Panchayat Not Found</h2>
          <p className="text-[#1a5e10] mb-6">{error || "The panchayat you're looking for doesn't exist."}</p>
          <button onClick={() => router.push('/panchayats')} className="bg-[#117307] text-white px-6 py-2 rounded-lg hover:bg-[#0d5c06] transition-colors">
            Back to Panchayats
          </button>
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
    { id: 'culture', label: 'Culture', icon: BookOpen },
    { id: 'geography', label: 'Geography', icon: Mountain },
    { id: 'services', label: 'Services', icon: Building2 },
    { id: 'people', label: 'Notable People', icon: Award },
    { id: 'media', label: 'Gallery', icon: Camera },
    { id: 'political', label: 'Political Overview', icon: PoliticalIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f5fbf2]">
      {/* Header */}
      <div className="bg-[#117307] py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center">
            <button onClick={() => router.push('/panchayats')} className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
              <ArrowLeft size={22} />
              Back to Panchayats
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: currentPanchayat.name,
                    text: `Explore ${currentPanchayat.name}`,
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
            {/* Hero Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-6">
              <div className="relative bg-[#f5fbf2]">
                {currentPanchayat.headerImage ? (
                  <img
                    src={currentPanchayat.headerImage}
                    alt={currentPanchayat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div className={`absolute inset-0 items-center justify-center bg-[#117307] ${currentPanchayat.headerImage ? 'hidden' : 'flex'}`}>
                  <Home size={96} className="text-white opacity-50" />
                </div>

                {currentPanchayat.status === 'Verified' && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
                      <Landmark size={14} className="text-white" />
                      <span className="text-xs font-bold text-white">Verified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title Section - Simplified */}
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-2">
                {currentPanchayat.name}
              </h1>
            </div>

            {/* Tabs - Full width */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-1 border-b-2 border-[#f5fbf2]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-6 py-3 font-semibold transition-all text-base"
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

            {/* Tab Content */}
            <div>
              {activeTab === 'culture' && (
                <div className="space-y-4">
                  {currentPanchayat.culturalInfo?.historicalBackground && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <BookOpen size={20} className="text-[#117307]" />
                        Historical Background
                      </h2>
                      <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
                        {currentPanchayat.culturalInfo.historicalBackground}
                      </p>
                    </Card>
                  )}

                  {currentPanchayat.culturalInfo?.localArt && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <Palette size={20} className="text-[#117307]" />
                        Local Art & Crafts
                      </h2>
                      <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
                        {currentPanchayat.culturalInfo.localArt}
                      </p>
                    </Card>
                  )}

                  {currentPanchayat.culturalInfo?.localCuisine && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <UtensilsCrossed size={20} className="text-[#117307]" />
                        Local Cuisine
                      </h2>
                      <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
                        {currentPanchayat.culturalInfo.localCuisine}
                      </p>
                    </Card>
                  )}

                  {currentPanchayat.culturalInfo?.traditions && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <TreePine size={20} className="text-[#117307]" />
                        Traditions & Festivals
                      </h2>
                      <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
                        {currentPanchayat.culturalInfo.traditions}
                      </p>
                    </Card>
                  )}

                  {!currentPanchayat.culturalInfo?.historicalBackground && 
                   !currentPanchayat.culturalInfo?.localArt && 
                   !currentPanchayat.culturalInfo?.localCuisine && 
                   !currentPanchayat.culturalInfo?.traditions && (
                    <Card sx={{ p: 8, textAlign: 'center' }}>
                      <BookOpen size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
                      <p className="text-[#1a5e10] text-base">Cultural information coming soon...</p>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'geography' && (
                <div className="space-y-4">
                  {/* Updated Key Statistics - Clean design without big icons */}
                  <Card sx={{ p: 4 }}>
                    <h2 className="text-xl font-bold text-[#0d4d03] mb-4">Key Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
                        <h3 className="text-base font-semibold text-[#4d674f] mb-2">Population</h3>
                        <p className="text-2xl font-bold text-[#0d4d03]">
                          {formatNumber(currentPanchayat.basicInfo?.population)}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
                        <h3 className="text-base font-semibold text-[#4d674f] mb-2">Area</h3>
                        <p className="text-2xl font-bold text-[#0d4d03]">
                          {currentPanchayat.basicInfo?.area ? `${currentPanchayat.basicInfo.area} km²` : 'N/A'}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
                        <h3 className="text-base font-semibold text-[#4d674f] mb-2">Block</h3>
                        <p className="text-xl font-bold text-[#0d4d03]">{currentPanchayat.block || 'N/A'}</p>
                      </div>
                    </div>
                  </Card>

                  {currentPanchayat.coordinates && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <MapPin size={20} className="text-[#117307]" />
                        Coordinates
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-[#f5fbf2]">
                          <p className="text-sm font-semibold text-[#4d674f] mb-1">Latitude</p>
                          <p className="text-lg font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lat}°</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[#f5fbf2]">
                          <p className="text-sm font-semibold text-[#4d674f] mb-1">Longitude</p>
                          <p className="text-lg font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lng}°</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {currentPanchayat.basicInfo?.majorRivers && currentPanchayat.basicInfo.majorRivers.length > 0 && (
                    <Card sx={{ p: 4 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Droplet size={20} className="text-[#117307]" />
                        <h3 className="text-lg font-bold text-[#0d4d03]">Major Rivers</h3>
                        <span className="text-base font-bold text-[#117307] ml-auto">
                          {currentPanchayat.basicInfo.majorRivers.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentPanchayat.basicInfo.majorRivers.map((river, idx) => (
                          <span key={idx} className="bg-[#117307]/10 text-[#117307] px-3 py-2 rounded-full text-base font-medium">
                            {river}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}

                  {currentPanchayat.basicInfo?.languagesSpoken && currentPanchayat.basicInfo.languagesSpoken.length > 0 && (
                    <Card sx={{ p: 4 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Languages size={20} className="text-[#117307]" />
                        <h3 className="text-lg font-bold text-[#0d4d03]">Languages Spoken</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentPanchayat.basicInfo.languagesSpoken.map((lang, idx) => (
                          <span key={idx} className="bg-[#117307]/10 text-[#117307] px-3 py-2 rounded-full text-base font-medium">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-4">
                  {currentPanchayat.transportationServices && currentPanchayat.transportationServices.length > 0 && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <Bus size={20} className="text-[#117307]" />
                        Transportation
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentPanchayat.transportationServices.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
                            <p className="font-bold text-[#0d4d03] text-base mb-1">{item.name}</p>
                            <p className="text-[#4d674f] text-base">{item.type}</p>
                            <p className="text-[#1a5e10] text-base">{item.location}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {currentPanchayat.hospitalityServices && currentPanchayat.hospitalityServices.length > 0 && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <Hotel size={20} className="text-[#117307]" />
                        Hospitality
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentPanchayat.hospitalityServices.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
                            <p className="font-bold text-[#0d4d03] text-base mb-1">{item.name}</p>
                            <p className="text-[#4d674f] text-base">{item.type}</p>
                            <p className="text-[#1a5e10] text-base">{item.location}</p>
                            {item.contact?.phone && <p className="text-[#1a5e10] text-base mt-1">📞 {item.contact.phone}</p>}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {currentPanchayat.emergencyDirectory && currentPanchayat.emergencyDirectory.length > 0 && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <AlertCircle size={20} className="text-[#117307]" />
                        Emergency Contacts
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentPanchayat.emergencyDirectory.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-red-50 border border-red-100 flex justify-between items-center">
                            <span className="font-medium text-[#0d4d03] text-base">{item.service}</span>
                            <span className="text-red-600 font-bold text-base">{item.contactNumber}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {(!currentPanchayat.transportationServices || currentPanchayat.transportationServices.length === 0) &&
                   (!currentPanchayat.hospitalityServices || currentPanchayat.hospitalityServices.length === 0) &&
                   (!currentPanchayat.emergencyDirectory || currentPanchayat.emergencyDirectory.length === 0) && (
                    <Card sx={{ p: 8, textAlign: 'center' }}>
                      <Building2 size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
                      <p className="text-[#1a5e10] text-base">Service information coming soon...</p>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'people' && (
                <div>
                  {currentPanchayat.specialPersons && currentPanchayat.specialPersons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPanchayat.specialPersons.map((person, i) => (
                        <Card key={i} sx={{ p: 4 }}>
                          <div className="flex items-start gap-3">
                            <Award size={20} className="text-[#117307] flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-bold text-[#0d4d03] text-base mb-1">{person.name}</h3>
                              <p className="text-[#117307] text-base font-medium mb-2">{person.achievement}</p>
                              <p className="text-[#1a5e10] text-base">{person.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card sx={{ p: 8, textAlign: 'center' }}>
                      <Award size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
                      <p className="text-[#1a5e10] text-base">Notable people information coming soon...</p>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <Card sx={{ p: 4 }}>
                  <h2 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
                    <Camera size={20} className="text-[#117307]" />
                    Media Gallery
                    {panchayatMedia.length > 0 && (
                      <span className="text-base font-bold text-[#117307] ml-auto">{panchayatMedia.length}</span>
                    )}
                  </h2>
                  
                  {panchayatMedia.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {panchayatMedia.map((mediaItem) => (
                        <div
                          key={mediaItem._id}
                          className="relative group rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/gallery/${mediaItem._id}`)}
                        >
                          <div className="aspect-video bg-[#f5fbf2]">
                            {mediaItem.fileType === 'video' ? (
                              mediaItem.thumbnailUrl ? (
                                <>
                                  <img src={mediaItem.thumbnailUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
                              <img src={mediaItem.fileUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <p className="text-white font-semibold text-base line-clamp-2">{mediaItem.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
                      <p className="text-[#1a5e10] text-base">No media available yet</p>
                    </div>
                  )}
                </Card>
              )}

              {activeTab === 'political' && (
                <div className="space-y-4">
                  {currentPanchayat.politicalOverview && currentPanchayat.politicalOverview.length > 0 && (
                    <Card sx={{ p: 4 }}>
                      <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                        <PoliticalIcon size={20} className="text-[#117307]" />
                        Political Overview
                      </h2>
                      <div className="space-y-3">
                        {currentPanchayat.politicalOverview.map((item, i) => (
                          <div key={i} className="border-l-4 border-[#117307] pl-3">
                            <h3 className="font-bold text-[#0d4d03] text-base mb-1">{item.heading}</h3>
                            <p className="text-[#1a5e10] text-base">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Scrollable */}
          <div className="lg:w-1/4">
            <div className="space-y-4 sticky top-24 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <Card sx={{ p: 4 }}>
                <h3 className="text-lg font-bold text-[#0d4d03] mb-3">Location Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#1a5e10]" />
                    <p className="text-[#1a5e10] text-base">
                      {currentPanchayat.block}, {currentPanchayat.district?.name}
                    </p>
                  </div>
                  {currentPanchayat.basicInfo?.establishmentYear && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#1a5e10]" />
                      <p className="text-[#1a5e10] text-base">
                        Est. {currentPanchayat.basicInfo.establishmentYear}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card sx={{ p: 4 }}>
                <h3 className="text-lg font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
                  <User size={18} className="text-[#117307]" />
                  Created By
                </h3>
                {currentPanchayat.createdBy ? (
                  <div className="space-y-2">
                    <p className="text-[#1a5e10] text-base">
                      <span className="font-medium">Admin:</span> {currentPanchayat.createdBy.name || 'Admin User'}
                    </p>
                    {currentPanchayat.createdBy.email && (
                      <p className="text-[#1a5e10] text-base">
                        <span className="font-medium">Email:</span> {currentPanchayat.createdBy.email}
                      </p>
                    )}
                    {currentPanchayat.createdAt && (
                      <p className="text-[#4d674f] text-sm">
                        Created: {new Date(currentPanchayat.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[#4d674f] text-base">Information not available</p>
                )}
              </Card>
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
//   Camera, ArrowLeft, Share2, Home, Building2, 
//   BookOpen, TreePine, UtensilsCrossed, Palette,
//   Video, Landmark, Loader2, Languages,
//   Bus, Hotel, AlertCircle, Award, Landmark as PoliticalIcon
// } from 'lucide-react';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import Card from '@/components/ui/Card';

// export default function PanchayatDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { panchayats, panchayatCache } = useSelector(state => state.panchayat);
//   const { media } = useSelector(state => state.media);
  
//   const [activeTab, setActiveTab] = useState('culture');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPanchayat, setCurrentPanchayat] = useState(null);
//   const [panchayatMedia, setPanchayatMedia] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const slug = params?.slug;

//     if (!slug) {
//       setIsLoading(false);
//       setError("No panchayat slug provided");
//       return;
//     }

//     const loadMediaForPanchayat = async (panchayatId) => {
//       try {
//         const mediaResult = await dispatch(fetchMedia({ 
//           gramPanchayat: panchayatId,
//           status: 'approved',
//           limit: 50
//         })).unwrap();
//         setPanchayatMedia(mediaResult.media || []);
//       } catch (err) {
//         console.error('Error loading media:', err);
//       }
//     };

//     const loadPanchayat = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         const cached = panchayatCache[slug];
        
//         if (cached && (Date.now() - cached.lastFetched) < 300000) {
//           setCurrentPanchayat(cached.data);
//           loadMediaForPanchayat(cached.data._id);
//           setIsLoading(false);
//           return;
//         }

//         let foundPanchayat = panchayats?.find(p => p.slug === slug);

//         if (!foundPanchayat) {
//           const result = await dispatch(fetchPanchayats({ limit: 100 })).unwrap();
//           foundPanchayat = result.panchayats?.find(p => p.slug === slug);
//         }

//         if (foundPanchayat) {
//           setCurrentPanchayat(foundPanchayat);
//           loadMediaForPanchayat(foundPanchayat._id);
//         } else {
//           setError("Panchayat not found");
//         }

//       } catch (err) {
//         console.error('Error loading panchayat:', err);
//         setError(err?.message || "Failed to load panchayat");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadPanchayat();
//   }, [params?.slug, dispatch, panchayatCache, panchayats]);

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

//   if (!isLoading && !currentPanchayat) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2] p-4">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">Panchayat Not Found</h2>
//           <p className="text-[#1a5e10] mb-6">{error || "The panchayat you're looking for doesn't exist."}</p>
//           <button onClick={() => router.push('/panchayats')} className="bg-[#117307] text-white px-6 py-2 rounded-lg hover:bg-[#0d5c06] transition-colors">
//             Back to Panchayats
//           </button>
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
//     { id: 'culture', label: 'Culture', icon: BookOpen },
//     { id: 'geography', label: 'Geography', icon: Mountain },
//     { id: 'services', label: 'Services', icon: Building2 },
//     { id: 'people', label: 'Notable People', icon: Award },
//     { id: 'media', label: 'Gallery', icon: Camera },
//     { id: 'political', label: 'Political Overview', icon: PoliticalIcon },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header */}
//       <div className="bg-[#117307] py-6 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//         </div>
        
//         <div className="max-w-6xl mx-auto px-4 relative z-10">
//           <div className="flex justify-between items-center">
//             <button onClick={() => router.push('/panchayats')} className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
//               <ArrowLeft size={22} />
//               Back to Panchayats
//             </button>

//             <button
//               onClick={() => {
//                 if (navigator.share) {
//                   navigator.share({
//                     title: currentPanchayat.name,
//                     text: `Explore ${currentPanchayat.name}`,
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

//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           <div className="lg:w-3/4">
//             {/* Hero Image */}
//             <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-6">
//               <div className="relative  bg-[#f5fbf2]">
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

//                 <div className={`absolute inset-0 items-center justify-center bg-[#117307] ${currentPanchayat.headerImage ? 'hidden' : 'flex'}`}>
//                   <Home size={96} className="text-white opacity-50" />
//                 </div>

//                 {currentPanchayat.status === 'Verified' && (
//                   <div className="absolute top-3 right-3">
//                     <div className="bg-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
//                       <Landmark size={14} className="text-white" />
//                       <span className="text-xs font-bold text-white">Verified</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Title Section - Simplified */}
//             <div className="mb-6">
//               <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-2">
//                 {currentPanchayat.name}
//               </h1>
//             </div>

//             {/* Tabs - Full width */}
//             <div className="mb-6">
//               <div className="flex flex-wrap gap-1 border-b-2 border-[#f5fbf2]">
//                 {tabs.map(tab => (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className="flex items-center gap-2 px-6 py-3 font-semibold transition-all text-base"
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
//               {activeTab === 'culture' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.culturalInfo?.historicalBackground && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <BookOpen size={20} className="text-[#117307]" />
//                         Historical Background
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
//                         {currentPanchayat.culturalInfo.historicalBackground}
//                       </p>
//                     </Card>
//                   )}

//                   {currentPanchayat.culturalInfo?.localArt && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <Palette size={20} className="text-[#117307]" />
//                         Local Art & Crafts
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
//                         {currentPanchayat.culturalInfo.localArt}
//                       </p>
//                     </Card>
//                   )}

//                   {currentPanchayat.culturalInfo?.localCuisine && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <UtensilsCrossed size={20} className="text-[#117307]" />
//                         Local Cuisine
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
//                         {currentPanchayat.culturalInfo.localCuisine}
//                       </p>
//                     </Card>
//                   )}

//                   {currentPanchayat.culturalInfo?.traditions && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <TreePine size={20} className="text-[#117307]" />
//                         Traditions & Festivals
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line text-base">
//                         {currentPanchayat.culturalInfo.traditions}
//                       </p>
//                     </Card>
//                   )}

//                   {!currentPanchayat.culturalInfo?.historicalBackground && 
//                    !currentPanchayat.culturalInfo?.localArt && 
//                    !currentPanchayat.culturalInfo?.localCuisine && 
//                    !currentPanchayat.culturalInfo?.traditions && (
//                     <Card sx={{ p: 8, textAlign: 'center' }}>
//                       <BookOpen size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10] text-base">Cultural information coming soon...</p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'geography' && (
//                 <div className="space-y-4">
//                   {/* Key Statistics in Geography */}
//                   <Card sx={{ p: 4 }}>
//                     <h2 className="text-xl font-bold text-[#0d4d03] mb-4">Key Statistics</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Users size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Population</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {formatNumber(currentPanchayat.basicInfo?.population)}
//                         </p>
//                       </div>

//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Mountain size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Area</h3>
//                         <p className="text-2xl font-bold text-[#0d4d03]">
//                           {currentPanchayat.basicInfo?.area ? `${currentPanchayat.basicInfo.area} km²` : 'N/A'}
//                         </p>
//                       </div>

//                       <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                         <div className="flex justify-center mb-2">
//                           <Building2 size={24} className="text-[#117307]" />
//                         </div>
//                         <h3 className="text-base font-semibold text-[#4d674f] mb-1">Block</h3>
//                         <p className="text-xl font-bold text-[#0d4d03]">{currentPanchayat.block || 'N/A'}</p>
//                       </div>
//                     </div>
//                   </Card>

//                   {currentPanchayat.coordinates && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <MapPin size={20} className="text-[#117307]" />
//                         Coordinates
//                       </h2>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="p-3 rounded-lg bg-[#f5fbf2]">
//                           <p className="text-sm font-semibold text-[#4d674f] mb-1">Latitude</p>
//                           <p className="text-lg font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lat}°</p>
//                         </div>
//                         <div className="p-3 rounded-lg bg-[#f5fbf2]">
//                           <p className="text-sm font-semibold text-[#4d674f] mb-1">Longitude</p>
//                           <p className="text-lg font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lng}°</p>
//                         </div>
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.basicInfo?.majorRivers && currentPanchayat.basicInfo.majorRivers.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <div className="flex items-center gap-2 mb-3">
//                         <Droplet size={20} className="text-[#117307]" />
//                         <h3 className="text-lg font-bold text-[#0d4d03]">Major Rivers</h3>
//                         <span className="text-base font-bold text-[#117307] ml-auto">
//                           {currentPanchayat.basicInfo.majorRivers.length}
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentPanchayat.basicInfo.majorRivers.map((river, idx) => (
//                           <span key={idx} className="bg-[#117307]/10 text-[#117307] px-3 py-2 rounded-full text-base font-medium">
//                             🌊 {river}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.basicInfo?.languagesSpoken && currentPanchayat.basicInfo.languagesSpoken.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <div className="flex items-center gap-2 mb-3">
//                         <Languages size={20} className="text-[#117307]" />
//                         <h3 className="text-lg font-bold text-[#0d4d03]">Languages Spoken</h3>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentPanchayat.basicInfo.languagesSpoken.map((lang, idx) => (
//                           <span key={idx} className="bg-[#117307]/10 text-[#117307] px-3 py-2 rounded-full text-base font-medium">
//                             {lang}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'services' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.transportationServices && currentPanchayat.transportationServices.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <Bus size={20} className="text-[#117307]" />
//                         Transportation
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {currentPanchayat.transportationServices.map((item, i) => (
//                           <div key={i} className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
//                             <p className="font-bold text-[#0d4d03] text-base mb-1">{item.name}</p>
//                             <p className="text-[#4d674f] text-base">{item.type}</p>
//                             <p className="text-[#1a5e10] text-base">{item.location}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.hospitalityServices && currentPanchayat.hospitalityServices.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <Hotel size={20} className="text-[#117307]" />
//                         Hospitality
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {currentPanchayat.hospitalityServices.map((item, i) => (
//                           <div key={i} className="p-4 rounded-lg bg-[#f5fbf2] border border-green-100">
//                             <p className="font-bold text-[#0d4d03] text-base mb-1">{item.name}</p>
//                             <p className="text-[#4d674f] text-base">{item.type}</p>
//                             <p className="text-[#1a5e10] text-base">{item.location}</p>
//                             {item.contact?.phone && <p className="text-[#1a5e10] text-base mt-1">📞 {item.contact.phone}</p>}
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.emergencyDirectory && currentPanchayat.emergencyDirectory.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <AlertCircle size={20} className="text-[#117307]" />
//                         Emergency Contacts
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {currentPanchayat.emergencyDirectory.map((item, i) => (
//                           <div key={i} className="p-4 rounded-lg bg-red-50 border border-red-100 flex justify-between items-center">
//                             <span className="font-medium text-[#0d4d03] text-base">{item.service}</span>
//                             <span className="text-red-600 font-bold text-base">{item.contactNumber}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {(!currentPanchayat.transportationServices || currentPanchayat.transportationServices.length === 0) &&
//                    (!currentPanchayat.hospitalityServices || currentPanchayat.hospitalityServices.length === 0) &&
//                    (!currentPanchayat.emergencyDirectory || currentPanchayat.emergencyDirectory.length === 0) && (
//                     <Card sx={{ p: 8, textAlign: 'center' }}>
//                       <Building2 size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10] text-base">Service information coming soon...</p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'people' && (
//                 <div>
//                   {currentPanchayat.specialPersons && currentPanchayat.specialPersons.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {currentPanchayat.specialPersons.map((person, i) => (
//                         <Card key={i} sx={{ p: 4 }}>
//                           <div className="flex items-start gap-3">
//                             <Award size={20} className="text-[#117307] flex-shrink-0 mt-1" />
//                             <div>
//                               <h3 className="font-bold text-[#0d4d03] text-base mb-1">{person.name}</h3>
//                               <p className="text-[#117307] text-base font-medium mb-2">{person.achievement}</p>
//                               <p className="text-[#1a5e10] text-base">{person.description}</p>
//                             </div>
//                           </div>
//                         </Card>
//                       ))}
//                     </div>
//                   ) : (
//                     <Card sx={{ p: 8, textAlign: 'center' }}>
//                       <Award size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10] text-base">Notable people information coming soon...</p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'media' && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <Camera size={20} className="text-[#117307]" />
//                     Media Gallery
//                     {panchayatMedia.length > 0 && (
//                       <span className="text-base font-bold text-[#117307] ml-auto">{panchayatMedia.length}</span>
//                     )}
//                   </h2>
                  
//                   {panchayatMedia.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {panchayatMedia.map((mediaItem) => (
//                         <div
//                           key={mediaItem._id}
//                           className="relative group rounded-lg overflow-hidden cursor-pointer"
//                           onClick={() => router.push(`/gallery/${mediaItem._id}`)}
//                         >
//                           <div className="aspect-video bg-[#f5fbf2]">
//                             {mediaItem.fileType === 'video' ? (
//                               mediaItem.thumbnailUrl ? (
//                                 <>
//                                   <img src={mediaItem.thumbnailUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
//                                   <div className="absolute inset-0 flex items-center justify-center">
//                                     <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
//                                       <Video size={32} className="text-white" />
//                                     </div>
//                                   </div>
//                                 </>
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
//                                   <Video size={48} className="text-[#117307]" />
//                                 </div>
//                               )
//                             ) : (
//                               <img src={mediaItem.fileUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
//                             )}
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="absolute bottom-0 left-0 right-0 p-4">
//                               <p className="text-white font-semibold text-base line-clamp-2">{mediaItem.title}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8">
//                       <Camera size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10] text-base">No media available yet</p>
//                     </div>
//                   )}
//                 </Card>
//               )}

//               {activeTab === 'political' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.politicalOverview && currentPanchayat.politicalOverview.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <PoliticalIcon size={20} className="text-[#117307]" />
//                         Political Overview
//                       </h2>
//                       <div className="space-y-3">
//                         {currentPanchayat.politicalOverview.map((item, i) => (
//                           <div key={i} className="border-l-4 border-[#117307] pl-3">
//                             <h3 className="font-bold text-[#0d4d03] text-base mb-1">{item.heading}</h3>
//                             <p className="text-[#1a5e10] text-base">{item.description}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Sidebar - Scrollable */}
//           <div className="lg:w-1/4">
//             <div className="space-y-4 sticky top-24 max-h-[calc(100vh-2rem)] overflow-y-auto">
//               <Card sx={{ p: 4 }}>
//                 <h3 className="text-lg font-bold text-[#0d4d03] mb-3">Location Info</h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <MapPin size={16} className="text-[#1a5e10]" />
//                     <p className="text-[#1a5e10] text-base">
//                       {currentPanchayat.block}, {currentPanchayat.district?.name}
//                     </p>
//                   </div>
//                   {currentPanchayat.basicInfo?.establishmentYear && (
//                     <div className="flex items-center gap-2">
//                       <Calendar size={16} className="text-[#1a5e10]" />
//                       <p className="text-[#1a5e10] text-base">
//                         Est. {currentPanchayat.basicInfo.establishmentYear}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </Card>

//               <Card sx={{ p: 4 }}>
//                 <h3 className="text-lg font-bold text-[#0d4d03] mb-3">Created By</h3>
//                 {currentPanchayat.createdBy ? (
//                   <div className="space-y-2">
//                     <p className="text-[#1a5e10] text-base">
//                       <span className="font-medium">Admin:</span> {currentPanchayat.createdBy.name || 'Admin User'}
//                     </p>
//                     {currentPanchayat.createdAt && (
//                        <p className="text-[#1a5e10] text-base">
//                       <span className="font-medium">Email:</span> {currentPanchayat.createdBy.email || ''}
//                     </p>
//                     )}
//                   </div>
//                 ) : (
//                   <p className="text-[#4d674f] text-base">Information not available</p>
//                 )}
//               </Card>
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
//   Camera, ArrowLeft, Share2, Home, Building2, 
//   BookOpen, TreePine, UtensilsCrossed, Palette,
//   Video, Landmark, Loader2, Languages,
//   Bus, Hotel, AlertCircle, Award
// } from 'lucide-react';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import Card from '@/components/ui/Card';

// export default function PanchayatDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { panchayats, panchayatCache } = useSelector(state => state.panchayat);
//   const { media } = useSelector(state => state.media);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPanchayat, setCurrentPanchayat] = useState(null);
//   const [panchayatMedia, setPanchayatMedia] = useState([]);
//   const [error, setError] = useState(null);
//    useEffect(() => {
//     const slug = params?.slug;

//     if (!slug) {
//       setIsLoading(false);
//       setError("No panchayat slug provided");
//       return;
//     }

//     const loadMediaForPanchayat = async (panchayatId) => {
//       try {
//         const mediaResult = await dispatch(fetchMedia({ 
//           gramPanchayat: panchayatId,
//           status: 'approved',
//           limit: 50
//         })).unwrap();
//         setPanchayatMedia(mediaResult.media || []);
//       } catch (err) {
//         console.error('Error loading media:', err);
//       }
//     };

//     const loadPanchayat = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         const cached = panchayatCache[slug];
        
//         if (cached && (Date.now() - cached.lastFetched) < 300000) {
//           setCurrentPanchayat(cached.data);
//           loadMediaForPanchayat(cached.data._id);
//           setIsLoading(false);
//           return;
//         }

//         let foundPanchayat = panchayats?.find(p => p.slug === slug);

//         if (!foundPanchayat) {
//           const result = await dispatch(fetchPanchayats({ limit: 100 })).unwrap();
//           foundPanchayat = result.panchayats?.find(p => p.slug === slug);
//         }

//         if (foundPanchayat) {
//           setCurrentPanchayat(foundPanchayat);
//           loadMediaForPanchayat(foundPanchayat._id);
//         } else {
//           setError("Panchayat not found");
//         }

//       } catch (err) {
//         console.error('Error loading panchayat:', err);
//         setError(err?.message || "Failed to load panchayat");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadPanchayat();
//   }, [params?.slug, dispatch, panchayatCache, panchayats]);
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

//   if (!isLoading && !currentPanchayat) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2] p-4">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">Panchayat Not Found</h2>
//           <p className="text-[#1a5e10] mb-6">{error || "The panchayat you're looking for doesn't exist."}</p>
//           <button onClick={() => router.push('/panchayats')} className="bg-[#117307] text-white px-6 py-2 rounded-lg hover:bg-[#0d5c06] transition-colors">
//             Back to Panchayats
//           </button>
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
//     { id: 'overview', label: 'Overview', icon: Home },
//     { id: 'culture', label: 'Culture', icon: BookOpen },
//     { id: 'geography', label: 'Geography', icon: Mountain },
//     { id: 'services', label: 'Services', icon: Building2 },
//     { id: 'people', label: 'Notable People', icon: Award },
//     { id: 'media', label: 'Gallery', icon: Camera },
//   ];
//  return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header */}
//       <div className="bg-[#117307] py-6 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//         </div>
        
//         <div className="max-w-6xl mx-auto px-4 relative z-10">
//           <div className="flex justify-between items-center">
//             <button onClick={() => router.push('/panchayats')} className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
//               <ArrowLeft size={22} />
//               Back to Panchayats
//             </button>

//             <button
//               onClick={() => {
//                 if (navigator.share) {
//                   navigator.share({
//                     title: currentPanchayat.name,
//                     text: `Explore ${currentPanchayat.name}`,
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

//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           <div className="lg:w-3/4">
//             {/* Hero Image */}
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

//                 <div className={`absolute inset-0 items-center justify-center bg-[#117307] ${currentPanchayat.headerImage ? 'hidden' : 'flex'}`}>
//                   <Home size={96} className="text-white opacity-50" />
//                 </div>

//                 {currentPanchayat.status === 'Verified' && (
//                   <div className="absolute top-3 right-3">
//                     <div className="bg-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
//                       <Landmark size={14} className="text-white" />
//                       <span className="text-xs font-bold text-white">Verified</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Title Section */}
//             <div className="mb-8">
//               <h1 className="text-3xl lg:text-4xl font-bold text-[#0d4d03] mb-3">
//                 {currentPanchayat.name}
//               </h1>
              
//               <div className="flex flex-wrap gap-4 text-[#4d674f]">
//                 <div className="flex items-center gap-2">
//                   <MapPin size={18} className="text-[#1a5e10]" />
//                   <span className="font-medium">{currentPanchayat.block}, {currentPanchayat.district?.name}</span>
//                 </div>
//                 {currentPanchayat.basicInfo?.establishmentYear && (
//                   <div className="flex items-center gap-2">
//                     <Calendar size={18} className="text-[#1a5e10]" />
//                     <span className="font-medium">Est. {currentPanchayat.basicInfo.establishmentYear}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Stats Card */}
//             <Card sx={{ mb: 6 }}>
//               <h2 className="text-2xl font-bold text-[#0d4d03] mb-6">Key Statistics</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                   <div className="flex justify-center mb-2">
//                     <Users size={24} className="text-[#117307]" />
//                   </div>
//                   <h3 className="text-base font-semibold text-[#4d674f] mb-1">Population</h3>
//                   <p className="text-2xl font-bold text-[#0d4d03]">
//                     {formatNumber(currentPanchayat.basicInfo?.population)}
//                   </p>
//                 </div>

//                 <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                   <div className="flex justify-center mb-2">
//                     <Mountain size={24} className="text-[#117307]" />
//                   </div>
//                   <h3 className="text-base font-semibold text-[#4d674f] mb-1">Area</h3>
//                   <p className="text-2xl font-bold text-[#0d4d03]">
//                     {currentPanchayat.basicInfo?.area ? `${currentPanchayat.basicInfo.area} km²` : 'N/A'}
//                   </p>
//                 </div>

//                 <div className="text-center p-4 rounded-xl bg-[#f5fbf2]">
//                   <div className="flex justify-center mb-2">
//                     <Building2 size={24} className="text-[#117307]" />
//                   </div>
//                   <h3 className="text-base font-semibold text-[#4d674f] mb-1">Block</h3>
//                   <p className="text-xl font-bold text-[#0d4d03]">{currentPanchayat.block || 'N/A'}</p>
//                 </div>
//               </div>
//             </Card>

//             {/* Tabs */}
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

//             {/* TAB CONTENT CONTINUES IN PART 5 */}

//           </div>

//           {/* Right Sidebar */}
//           <div className="lg:w-1/4">
//             <Card sx={{ p: 4, position: 'sticky', top: 16 }}>
//               <h3 className="text-lg font-bold text-[#0d4d03] mb-3">Created By</h3>
//               {currentPanchayat.createdBy ? (
//                 <div className="space-y-2">
//                   <p className="text-[#1a5e10] text-sm">
//                     <span className="font-medium">Admin:</span> {currentPanchayat.createdBy.name || 'Admin User'}
//                   </p>
//                   {currentPanchayat.createdAt && (
//                     <p className="text-[#4d674f] text-xs">
//                       Created: {new Date(currentPanchayat.createdAt).toLocaleDateString()}
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-[#4d674f] text-sm">Information not available</p>
//               )}
//             </Card>
//           </div>
          
//         </div>
//          <div>
//               {activeTab === 'overview' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.culturalInfo?.historicalBackground && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <BookOpen size={20} className="text-[#117307]" />
//                         Historical Background
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.culturalInfo.historicalBackground}
//                       </p>
//                     </Card>
//                   )}

//                   {currentPanchayat.politicalOverview && currentPanchayat.politicalOverview.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3">Political Overview</h2>
//                       <div className="space-y-3">
//                         {currentPanchayat.politicalOverview.map((item, i) => (
//                           <div key={i} className="border-l-4 border-[#117307] pl-3">
//                             <h3 className="font-bold text-[#0d4d03] mb-1">{item.heading}</h3>
//                             <p className="text-[#1a5e10]">{item.description}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'culture' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.culturalInfo?.localArt && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <Palette size={20} className="text-[#117307]" />
//                         Local Art & Crafts
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.culturalInfo.localArt}
//                       </p>
//                     </Card>
//                   )}

//                   {currentPanchayat.culturalInfo?.localCuisine && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <UtensilsCrossed size={20} className="text-[#117307]" />
//                         Local Cuisine
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.culturalInfo.localCuisine}
//                       </p>
//                     </Card>
//                   )}

//                   {currentPanchayat.culturalInfo?.traditions && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <TreePine size={20} className="text-[#117307]" />
//                         Traditions & Festivals
//                       </h2>
//                       <p className="text-[#1a5e10] leading-relaxed whitespace-pre-line">
//                         {currentPanchayat.culturalInfo.traditions}
//                       </p>
//                     </Card>
//                   )}

//                   {!currentPanchayat.culturalInfo?.historicalBackground && 
//                    !currentPanchayat.culturalInfo?.localArt && 
//                    !currentPanchayat.culturalInfo?.localCuisine && 
//                    !currentPanchayat.culturalInfo?.traditions && (
//                     <Card sx={{ p: 8, textAlign: 'center' }}>
//                       <BookOpen size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10]">Cultural information coming soon...</p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'geography' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.coordinates && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <MapPin size={20} className="text-[#117307]" />
//                         Coordinates
//                       </h2>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="p-3 rounded-lg bg-[#f5fbf2]">
//                           <p className="text-xs font-semibold text-[#4d674f] mb-1">Latitude</p>
//                           <p className="text-base font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lat}°</p>
//                         </div>
//                         <div className="p-3 rounded-lg bg-[#f5fbf2]">
//                           <p className="text-xs font-semibold text-[#4d674f] mb-1">Longitude</p>
//                           <p className="text-base font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lng}°</p>
//                         </div>
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.basicInfo?.majorRivers && currentPanchayat.basicInfo.majorRivers.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <div className="flex items-center gap-2 mb-3">
//                         <Droplet size={20} className="text-[#117307]" />
//                         <h3 className="text-lg font-bold text-[#0d4d03]">Major Rivers</h3>
//                         <span className="text-sm font-bold text-[#117307] ml-auto">
//                           {currentPanchayat.basicInfo.majorRivers.length}
//                         </span>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentPanchayat.basicInfo.majorRivers.map((river, idx) => (
//                           <span key={idx} className="bg-[#117307]/10 text-[#117307] px-3 py-1 rounded-full text-sm font-medium">
//                             🌊 {river}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.basicInfo?.languagesSpoken && currentPanchayat.basicInfo.languagesSpoken.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <div className="flex items-center gap-2 mb-3">
//                         <Languages size={20} className="text-[#117307]" />
//                         <h3 className="text-lg font-bold text-[#0d4d03]">Languages Spoken</h3>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         {currentPanchayat.basicInfo.languagesSpoken.map((lang, idx) => (
//                           <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
//                             {lang}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'services' && (
//                 <div className="space-y-4">
//                   {currentPanchayat.transportationServices && currentPanchayat.transportationServices.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <Bus size={20} className="text-[#117307]" />
//                         Transportation
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {currentPanchayat.transportationServices.map((item, i) => (
//                           <div key={i} className="p-3 rounded-lg bg-[#f5fbf2] border border-green-100">
//                             <p className="font-bold text-[#0d4d03]">{item.name}</p>
//                             <p className="text-xs text-[#4d674f]">{item.type}</p>
//                             <p className="text-xs text-[#1a5e10]">{item.location}</p>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.hospitalityServices && currentPanchayat.hospitalityServices.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <Hotel size={20} className="text-[#117307]" />
//                         Hospitality
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {currentPanchayat.hospitalityServices.map((item, i) => (
//                           <div key={i} className="p-3 rounded-lg bg-[#f5fbf2] border border-green-100">
//                             <p className="font-bold text-[#0d4d03]">{item.name}</p>
//                             <p className="text-xs text-[#4d674f]">{item.type}</p>
//                             <p className="text-xs text-[#1a5e10]">{item.location}</p>
//                             {item.contact?.phone && <p className="text-xs text-blue-600 mt-1">📞 {item.contact.phone}</p>}
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {currentPanchayat.emergencyDirectory && currentPanchayat.emergencyDirectory.length > 0 && (
//                     <Card sx={{ p: 4 }}>
//                       <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                         <AlertCircle size={20} className="text-[#117307]" />
//                         Emergency Contacts
//                       </h2>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                         {currentPanchayat.emergencyDirectory.map((item, i) => (
//                           <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100 flex justify-between items-center">
//                             <span className="font-medium text-[#0d4d03]">{item.service}</span>
//                             <span className="text-red-600 font-bold">{item.contactNumber}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {(!currentPanchayat.transportationServices || currentPanchayat.transportationServices.length === 0) &&
//                    (!currentPanchayat.hospitalityServices || currentPanchayat.hospitalityServices.length === 0) &&
//                    (!currentPanchayat.emergencyDirectory || currentPanchayat.emergencyDirectory.length === 0) && (
//                     <Card sx={{ p: 8, textAlign: 'center' }}>
//                       <Building2 size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10]">Service information coming soon...</p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'people' && (
//                 <div>
//                   {currentPanchayat.specialPersons && currentPanchayat.specialPersons.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {currentPanchayat.specialPersons.map((person, i) => (
//                         <Card key={i} sx={{ p: 4 }}>
//                           <div className="flex items-start gap-3">
//                             <Award size={20} className="text-[#117307] flex-shrink-0 mt-1" />
//                             <div>
//                               <h3 className="font-bold text-[#0d4d03] text-base mb-1">{person.name}</h3>
//                               <p className="text-blue-600 text-sm font-medium mb-2">{person.achievement}</p>
//                               <p className="text-[#1a5e10] text-sm">{person.description}</p>
//                             </div>
//                           </div>
//                         </Card>
//                       ))}
//                     </div>
//                   ) : (
//                     <Card sx={{ p: 8, textAlign: 'center' }}>
//                       <Award size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10]">Notable people information coming soon...</p>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'media' && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                     <Camera size={20} className="text-[#117307]" />
//                     Media Gallery
//                     {panchayatMedia.length > 0 && (
//                       <span className="text-sm font-bold text-[#117307] ml-auto">{panchayatMedia.length}</span>
//                     )}
//                   </h2>
                  
//                   {panchayatMedia.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {panchayatMedia.map((mediaItem) => (
//                         <div
//                           key={mediaItem._id}
//                           className="relative group rounded-lg overflow-hidden cursor-pointer"
//                           onClick={() => router.push(`/gallery/${mediaItem._id}`)}
//                         >
//                           <div className="aspect-video bg-[#f5fbf2]">
//                             {mediaItem.fileType === 'video' ? (
//                               mediaItem.thumbnailUrl ? (
//                                 <>
//                                   <img src={mediaItem.thumbnailUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
//                                   <div className="absolute inset-0 flex items-center justify-center">
//                                     <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
//                                       <Video size={32} className="text-white" />
//                                     </div>
//                                   </div>
//                                 </>
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
//                                   <Video size={48} className="text-[#117307]" />
//                                 </div>
//                               )
//                             ) : (
//                               <img src={mediaItem.fileUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
//                             )}
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="absolute bottom-0 left-0 right-0 p-4">
//                               <p className="text-white font-semibold line-clamp-2">{mediaItem.title}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-8">
//                       <Camera size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                       <p className="text-[#1a5e10]">No media available yet</p>
//                     </div>
//                   )}
//                 </Card>
//               )}
//             </div>
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
//   Camera, ArrowLeft, Share2, Home, Building2, 
//   BookOpen, TreePine, UtensilsCrossed, Palette,
//   Image as ImageIcon, Video, Landmark, Loader2, Languages,
//   Bus, Hotel, Phone, AlertCircle, Award
// } from 'lucide-react';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import Card from '@/components/ui/Card';

// export default function PanchayatDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { panchayats, panchayatCache } = useSelector(state => state.panchayat);
//   const { media } = useSelector(state => state.media);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPanchayat, setCurrentPanchayat] = useState(null);
//   const [panchayatMedia, setPanchayatMedia] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const slug = params?.slug;

//     if (!slug) {
//       setIsLoading(false);
//       setError("No panchayat slug provided");
//       return;
//     }

//     const loadMediaForPanchayat = async (panchayatId) => {
//       try {
//         const mediaResult = await dispatch(fetchMedia({ 
//           gramPanchayat: panchayatId,
//           status: 'approved',
//           limit: 50
//         })).unwrap();
//         setPanchayatMedia(mediaResult.media || []);
//       } catch (err) {
//         console.error('Error loading media:', err);
//       }
//     };

//     const loadPanchayat = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         const cached = panchayatCache[slug];
        
//         if (cached && (Date.now() - cached.lastFetched) < 300000) {
//           setCurrentPanchayat(cached.data);
//           loadMediaForPanchayat(cached.data._id);
//           setIsLoading(false);
//           return;
//         }

//         let foundPanchayat = panchayats?.find(p => p.slug === slug);

//         if (!foundPanchayat) {
//           const result = await dispatch(fetchPanchayats({ limit: 100 })).unwrap();
//           foundPanchayat = result.panchayats?.find(p => p.slug === slug);
//         }

//         if (foundPanchayat) {
//           setCurrentPanchayat(foundPanchayat);
//           loadMediaForPanchayat(foundPanchayat._id);
//         } else {
//           setError("Panchayat not found");
//         }

//       } catch (err) {
//         console.error('Error loading panchayat:', err);
//         setError(err?.message || "Failed to load panchayat");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadPanchayat();
//   }, [params?.slug, dispatch, panchayatCache, panchayats]);

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

//   if (!isLoading && !currentPanchayat) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2] p-4">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">Panchayat Not Found</h2>
//           <p className="text-[#1a5e10] mb-6">{error || "The panchayat you're looking for doesn't exist."}</p>
//           <button onClick={() => router.push('/panchayats')} className="bg-[#117307] text-white px-6 py-2 rounded-lg hover:bg-[#0d5c06] transition-colors">
//             Back to Panchayats
//           </button>
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
//     { id: 'overview', label: 'Overview', icon: Home },
//     { id: 'culture', label: 'Culture', icon: BookOpen },
//     { id: 'geography', label: 'Geography', icon: Mountain },
//     { id: 'services', label: 'Services', icon: Building2 },
//     { id: 'people', label: 'Notable People', icon: Award },
//     { id: 'media', label: 'Gallery', icon: Camera },
//   ];

//   const hasCultureInfo = currentPanchayat.culturalInfo?.historicalBackground || 
//                          currentPanchayat.culturalInfo?.localArt || 
//                          currentPanchayat.culturalInfo?.localCuisine || 
//                          currentPanchayat.culturalInfo?.traditions;

//   const hasServices = currentPanchayat.transportationServices?.length > 0 ||
//                       currentPanchayat.hospitalityServices?.length > 0 ||
//                       currentPanchayat.emergencyDirectory?.length > 0;

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       {/* Header */}
//       <div className="bg-[#117307] py-4 shadow-md">
//         <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
//           <button onClick={() => router.push('/panchayats')} className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
//             <ArrowLeft size={20} />
//             <span className="font-medium">Back</span>
//           </button>

//           <button
//             onClick={() => {
//               if (navigator.share) {
//                 navigator.share({
//                   title: currentPanchayat.name,
//                   text: `Explore ${currentPanchayat.name}`,
//                   url: window.location.href
//                 });
//               }
//             }}
//             className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
//           >
//             <Share2 size={20} />
//             <span className="font-medium">Share</span>
//           </button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-6">
//         {/* Hero Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           {/* Image */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg overflow-hidden shadow-lg h-full">
//               <div className="relative aspect-square bg-[#f5fbf2]">
//                 {currentPanchayat.headerImage ? (
//                   <img
//                     src={currentPanchayat.headerImage}
//                     alt={currentPanchayat.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="absolute inset-0 flex items-center justify-center bg-[#117307]">
//                     <Home size={80} className="text-white opacity-50" />
//                   </div>
//                 )}

//                 {currentPanchayat.status === 'Verified' && (
//                   <div className="absolute top-3 right-3">
//                     <div className="bg-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
//                       <Landmark size={14} className="text-white" />
//                       <span className="text-xs font-bold text-white">Verified</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-lg p-6 h-full">
//               <h1 className="text-3xl font-bold text-[#0d4d03] mb-4">{currentPanchayat.name}</h1>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div className="flex items-center gap-2 text-[#1a5e10]">
//                   <MapPin size={18} className="flex-shrink-0" />
//                   <span className="text-sm">{currentPanchayat.block}, {currentPanchayat.district?.name}</span>
//                 </div>
                
//                 {currentPanchayat.basicInfo?.establishmentYear && (
//                   <div className="flex items-center gap-2 text-[#1a5e10]">
//                     <Calendar size={18} className="flex-shrink-0" />
//                     <span className="text-sm">Est. {currentPanchayat.basicInfo.establishmentYear}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Stats */}
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="text-center p-3 rounded-lg bg-[#f5fbf2]">
//                   <Users size={20} className="mx-auto text-[#117307] mb-1" />
//                   <p className="text-xs text-[#4d674f] mb-1">Population</p>
//                   <p className="text-lg font-bold text-[#0d4d03]">
//                     {formatNumber(currentPanchayat.basicInfo?.population)}
//                   </p>
//                 </div>

//                 <div className="text-center p-3 rounded-lg bg-[#f5fbf2]">
//                   <Mountain size={20} className="mx-auto text-[#117307] mb-1" />
//                   <p className="text-xs text-[#4d674f] mb-1">Area</p>
//                   <p className="text-lg font-bold text-[#0d4d03]">
//                     {currentPanchayat.basicInfo?.area ? `${currentPanchayat.basicInfo.area} km²` : 'N/A'}
//                   </p>
//                 </div>

//                 <div className="text-center p-3 rounded-lg bg-[#f5fbf2]">
//                   <Building2 size={20} className="mx-auto text-[#117307] mb-1" />
//                   <p className="text-xs text-[#4d674f] mb-1">Block</p>
//                   <p className="text-sm font-bold text-[#0d4d03]">{currentPanchayat.block || 'N/A'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mb-6">
//           <div className="flex flex-wrap gap-2 border-b-2 border-[#f5fbf2]">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className="flex items-center gap-2 px-4 py-2 font-medium transition-all text-sm"
//                 style={{
//                   color: activeTab === tab.id ? '#117307' : '#1a5e10',
//                   borderBottom: activeTab === tab.id ? '3px solid #117307' : 'none',
//                   marginBottom: '-2px'
//                 }}
//               >
//                 <tab.icon size={18} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div>
//           {activeTab === 'overview' && (
//             <div className="space-y-4">
//               {currentPanchayat.culturalInfo?.historicalBackground && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <BookOpen size={20} className="text-[#117307]" />
//                     Historical Background
//                   </h2>
//                   <p className="text-[#1a5e10] leading-relaxed text-sm">
//                     {currentPanchayat.culturalInfo.historicalBackground}
//                   </p>
//                 </Card>
//               )}

//               {currentPanchayat.politicalOverview && currentPanchayat.politicalOverview.length > 0 && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3">Political Overview</h2>
//                   <div className="space-y-3">
//                     {currentPanchayat.politicalOverview.map((item, i) => (
//                       <div key={i} className="border-l-4 border-[#117307] pl-3">
//                         <h3 className="font-bold text-[#0d4d03] text-sm mb-1">{item.heading}</h3>
//                         <p className="text-[#1a5e10] text-sm">{item.description}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {activeTab === 'culture' && (
//             <div className="space-y-4">
//               {currentPanchayat.culturalInfo?.localArt && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <Palette size={20} className="text-[#117307]" />
//                     Local Art & Crafts
//                   </h2>
//                   <p className="text-[#1a5e10] leading-relaxed text-sm">
//                     {currentPanchayat.culturalInfo.localArt}
//                   </p>
//                 </Card>
//               )}

//               {currentPanchayat.culturalInfo?.localCuisine && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <UtensilsCrossed size={20} className="text-[#117307]" />
//                     Local Cuisine
//                   </h2>
//                   <p className="text-[#1a5e10] leading-relaxed text-sm">
//                     {currentPanchayat.culturalInfo.localCuisine}
//                   </p>
//                 </Card>
//               )}

//               {currentPanchayat.culturalInfo?.traditions && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <TreePine size={20} className="text-[#117307]" />
//                     Traditions & Festivals
//                   </h2>
//                   <p className="text-[#1a5e10] leading-relaxed text-sm">
//                     {currentPanchayat.culturalInfo.traditions}
//                   </p>
//                 </Card>
//               )}

//               {!hasCultureInfo && (
//                 <Card sx={{ p: 8, textAlign: 'center' }}>
//                   <BookOpen size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                   <p className="text-[#1a5e10]">Cultural information coming soon...</p>
//                 </Card>
//               )}
//             </div>
//           )}

//           {activeTab === 'geography' && (
//             <div className="space-y-4">
//               {currentPanchayat.coordinates && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <MapPin size={20} className="text-[#117307]" />
//                     Coordinates
//                   </h2>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="p-3 rounded-lg bg-[#f5fbf2]">
//                       <p className="text-xs font-semibold text-[#4d674f] mb-1">Latitude</p>
//                       <p className="text-base font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lat}°</p>
//                     </div>
//                     <div className="p-3 rounded-lg bg-[#f5fbf2]">
//                       <p className="text-xs font-semibold text-[#4d674f] mb-1">Longitude</p>
//                       <p className="text-base font-bold text-[#0d4d03]">{currentPanchayat.coordinates.lng}°</p>
//                     </div>
//                   </div>
//                 </Card>
//               )}

//               {currentPanchayat.basicInfo?.majorRivers && currentPanchayat.basicInfo.majorRivers.length > 0 && (
//                 <Card sx={{ p: 4 }}>
//                   <div className="flex items-center gap-2 mb-3">
//                     <Droplet size={20} className="text-[#117307]" />
//                     <h3 className="text-lg font-bold text-[#0d4d03]">Major Rivers</h3>
//                     <span className="text-sm font-bold text-[#117307] ml-auto">
//                       {currentPanchayat.basicInfo.majorRivers.length}
//                     </span>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {currentPanchayat.basicInfo.majorRivers.map((river, idx) => (
//                       <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
//                         🌊 {river}
//                       </span>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {currentPanchayat.basicInfo?.languagesSpoken && currentPanchayat.basicInfo.languagesSpoken.length > 0 && (
//                 <Card sx={{ p: 4 }}>
//                   <div className="flex items-center gap-2 mb-3">
//                     <Languages size={20} className="text-[#117307]" />
//                     <h3 className="text-lg font-bold text-[#0d4d03]">Languages Spoken</h3>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {currentPanchayat.basicInfo.languagesSpoken.map((lang, idx) => (
//                       <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
//                         {lang}
//                       </span>
//                     ))}
//                   </div>
//                 </Card>
//               )}
//             </div>
//           )}

//           {activeTab === 'services' && (
//             <div className="space-y-4">
//               {currentPanchayat.transportationServices && currentPanchayat.transportationServices.length > 0 && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <Bus size={20} className="text-[#117307]" />
//                     Transportation
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {currentPanchayat.transportationServices.map((item, i) => (
//                       <div key={i} className="p-3 rounded-lg bg-[#f5fbf2] border border-green-100">
//                         <p className="font-bold text-[#0d4d03] text-sm">{item.name}</p>
//                         <p className="text-xs text-[#4d674f]">{item.type}</p>
//                         <p className="text-xs text-[#1a5e10]">{item.location}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {currentPanchayat.hospitalityServices && currentPanchayat.hospitalityServices.length > 0 && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <Hotel size={20} className="text-[#117307]" />
//                     Hospitality
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {currentPanchayat.hospitalityServices.map((item, i) => (
//                       <div key={i} className="p-3 rounded-lg bg-[#f5fbf2] border border-green-100">
//                         <p className="font-bold text-[#0d4d03] text-sm">{item.name}</p>
//                         <p className="text-xs text-[#4d674f]">{item.type}</p>
//                         <p className="text-xs text-[#1a5e10]">{item.location}</p>
//                         {item.contact?.phone && <p className="text-xs text-blue-600 mt-1">📞 {item.contact.phone}</p>}
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {currentPanchayat.emergencyDirectory && currentPanchayat.emergencyDirectory.length > 0 && (
//                 <Card sx={{ p: 4 }}>
//                   <h2 className="text-xl font-bold text-[#0d4d03] mb-3 flex items-center gap-2">
//                     <AlertCircle size={20} className="text-[#117307]" />
//                     Emergency Contacts
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                     {currentPanchayat.emergencyDirectory.map((item, i) => (
//                       <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100 flex justify-between items-center">
//                         <span className="font-medium text-[#0d4d03] text-sm">{item.service}</span>
//                         <span className="text-red-600 font-bold text-sm">{item.contactNumber}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {!hasServices && (
//                 <Card sx={{ p: 8, textAlign: 'center' }}>
//                   <Building2 size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                   <p className="text-[#1a5e10]">Service information coming soon...</p>
//                 </Card>
//               )}
//             </div>
//           )}

//           {activeTab === 'people' && (
//             <div>
//               {currentPanchayat.specialPersons && currentPanchayat.specialPersons.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {currentPanchayat.specialPersons.map((person, i) => (
//                     <Card key={i} sx={{ p: 4 }}>
//                       <div className="flex items-start gap-3">
//                         <Award size={20} className="text-[#117307] flex-shrink-0 mt-1" />
//                         <div>
//                           <h3 className="font-bold text-[#0d4d03] text-base mb-1">{person.name}</h3>
//                           <p className="text-blue-600 text-sm font-medium mb-2">{person.achievement}</p>
//                           <p className="text-[#1a5e10] text-sm">{person.description}</p>
//                         </div>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <Card sx={{ p: 8, textAlign: 'center' }}>
//                   <Award size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                   <p className="text-[#1a5e10]">Notable people information coming soon...</p>
//                 </Card>
//               )}
//             </div>
//           )}

//           {activeTab === 'media' && (
//             <Card sx={{ p: 4 }}>
//               <h2 className="text-xl font-bold text-[#0d4d03] mb-4 flex items-center gap-2">
//                 <Camera size={20} className="text-[#117307]" />
//                 Media Gallery
//                 {panchayatMedia.length > 0 && (
//                   <span className="text-sm font-bold text-[#117307] ml-auto">{panchayatMedia.length}</span>
//                 )}
//               </h2>
              
//               {panchayatMedia.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                   {panchayatMedia.map((mediaItem) => (
//                     <div
//                       key={mediaItem._id}
//                       className="relative group rounded-lg overflow-hidden cursor-pointer"
//                       onClick={() => router.push(`/gallery/${mediaItem._id}`)}
//                     >
//                       <div className="aspect-video bg-[#f5fbf2]">
//                         {mediaItem.fileType === 'video' ? (
//                           mediaItem.thumbnailUrl ? (
//                             <>
//                               <img src={mediaItem.thumbnailUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
//                               <div className="absolute inset-0 flex items-center justify-center">
//                                 <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
//                                   <Video size={24} className="text-white" />
//                                 </div>
//                               </div>
//                             </>
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
//                               <Video size={32} className="text-[#117307]" />
//                             </div>
//                           )
//                         ) : (
//                           <img src={mediaItem.fileUrl} alt={mediaItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
//                         )}
//                       </div>
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                         <div className="absolute bottom-0 left-0 right-0 p-3">
//                           <p className="text-white font-semibold line-clamp-2 text-sm">{mediaItem.title}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <ImageIcon size={40} className="mx-auto text-[#117307] opacity-20 mb-3" />
//                   <p className="text-[#1a5e10]">No media available yet</p>
//                 </div>
//               )}
//             </Card>
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
//   Camera, ArrowLeft, Share2, Home, Building2, 
//   BookOpen, TreePine, UtensilsCrossed, Palette,
//   Image as ImageIcon, Video, Landmark, FileText, Loader2
// } from 'lucide-react';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function PanchayatDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { panchayats, panchayatCache } = useSelector(state => state.panchayat);
//   const { media } = useSelector(state => state.media);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPanchayat, setCurrentPanchayat] = useState(null);
//   const [panchayatMedia, setPanchayatMedia] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       setError("No panchayat slug provided");
//       return;
//     }

//     const loadPanchayat = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         // Check cache
//         const cached = panchayatCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000;
        
//         if (isCacheValid) {
//           setCurrentPanchayat(cached.data);
//           loadMediaForPanchayat(cached.data._id);
//           setIsLoading(false);
//           return;
//         }

//         // Check existing panchayats array
//         let foundPanchayat = panchayats.find(p => p.slug === slug);
        
//         if (!foundPanchayat) {
//           const result = await dispatch(fetchPanchayats({ limit: 100 })).unwrap();
//           foundPanchayat = result.panchayats?.find(p => p.slug === slug);
//         }

//         if (foundPanchayat) {
//           setCurrentPanchayat(foundPanchayat);
//           loadMediaForPanchayat(foundPanchayat._id);
//         } else {
//           setError("Panchayat not found");
//         }

//       } catch (err) {
//         console.error('Error loading panchayat:', err);
//         setError(err?.message || "Failed to load panchayat");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const loadMediaForPanchayat = async (panchayatId) => {
//       try {
//         const mediaResult = await dispatch(fetchMedia({ 
//           gramPanchayat: panchayatId,
//           status: 'approved',
//           limit: 50
//         })).unwrap();
//         setPanchayatMedia(mediaResult.media || []);
//       } catch (err) {
//         console.error('Error loading media:', err);
//       }
//     };

//     loadPanchayat();
//   }, [params?.slug, dispatch, panchayatCache, panchayats]);

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

//   if (!isLoading && !currentPanchayat) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5fbf2]">
//         <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
//           <div className="text-6xl mb-4">🏛️</div>
//           <h2 className="text-2xl font-bold mb-4 text-[#0d4d03]">Panchayat Not Found</h2>
//           <p className="text-[#1a5e10] mb-6">{error || "The panchayat you're looking for doesn't exist."}</p>
//           <div className="flex gap-3 justify-center">
//             <Button variant="outlined" onClick={() => router.push('/panchayats')} sx={{ borderColor: '#117307', color: '#117307' }}>
//               Back to Panchayats
//             </Button>
//             <Button variant="contained" onClick={() => window.location.reload()} sx={{ backgroundColor: '#117307' }}>
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
//     { id: 'overview', label: 'Overview', icon: Home },
//     { id: 'culture', label: 'Culture & Heritage', icon: BookOpen },
//     { id: 'geography', label: 'Geography', icon: Mountain },
//     { id: 'media', label: 'Media Gallery', icon: Camera },
//   ];

//   // if (currentPanchayat.rtcReport) {
//   //   tabs.push({ id: 'rtc-report', label: 'RTC Report', icon: FileText });
//   // }

//   const hasCultureInfo = currentPanchayat.localArt || currentPanchayat.localCuisine || currentPanchayat.traditions;

//   return (
//     <div className="min-h-screen bg-[#f5fbf2]">
//       <div className="bg-[#117307] py-6 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10 pointer-events-none">
//           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
//         </div>
        
//         <div className="max-w-6xl mx-auto px-4 relative z-10">
//           <div className="flex justify-between items-center">
//             <button onClick={() => router.push('/panchayats')} className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors font-medium text-lg">
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

//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           <div className="lg:w-3/4">
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

//                 <div className={`absolute inset-0 items-center justify-center bg-[#117307] ${currentPanchayat.headerImage ? 'hidden' : 'flex'}`}>
//                   <Home size={96} className="text-white opacity-50" />
//                 </div>

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

//             <div>
//               {activeTab === 'overview' && (
//                 <div className="space-y-6">
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

//               {activeTab === 'culture' && (
//                 <div className="space-y-6">
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

//                   {!hasCultureInfo && (
//                     <Card>
//                       <div className="text-center py-12">
//                         <BookOpen size={48} className="mx-auto text-[#117307] opacity-20 mb-4" />
//                         <p className="text-[#1a5e10]">Cultural information coming soon...</p>
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'geography' && (
//                 <div className="space-y-6">
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
//                           <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
//                             🌊 {river}
//                           </span>
//                         ))}
//                       </div>
//                     </Card>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'media' && (
//                 <Card>
//                   <h2 className="text-2xl font-bold text-[#0d4d03] mb-6 flex items-center gap-2">
//                     <Camera size={24} className="text-[#117307]" />
//                     Media Gallery
//                     {panchayatMedia.length > 0 && (
//                       <span className="text-base font-bold text-[#117307] ml-auto">
//                         {panchayatMedia.length} {panchayatMedia.length === 1 ? 'item' : 'items'}
//                       </span>
//                     )}
//                   </h2>
                  
//                   {panchayatMedia.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {panchayatMedia.map((mediaItem) => (
//                         <div
//                           key={mediaItem._id}
//                           className="relative group rounded-lg overflow-hidden cursor-pointer"
//                           onClick={() => router.push(`/gallery/${mediaItem._id}`)}
//                         >
//                           <div className="aspect-video bg-[#f5fbf2]">
//                             {mediaItem.fileType === 'video' ? (
//                               mediaItem.thumbnailUrl ? (
//                                 <>
//                                   <img
//                                     src={mediaItem.thumbnailUrl}
//                                     alt={mediaItem.title}
//                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                   />
//                                   <div className="absolute inset-0 flex items-center justify-center">
//                                     <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
//                                       <Video size={32} className="text-white" />
//                                     </div>
//                                   </div>
//                                 </>
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
//                                   <Video size={48} className="text-[#117307]" />
//                                 </div>
//                               )
//                             ) : (
//                               <img
//                                 src={mediaItem.fileUrl}
//                                 alt={mediaItem.title}
//                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                               />
//                             )}
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="absolute bottom-0 left-0 right-0 p-4">
//                               <p className="text-white font-semibold line-clamp-2">{mediaItem.title}</p>
//                             </div>
//                           </div>
//                           {mediaItem.fileType === 'video' && (
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

//               {/* {activeTab === 'rtc-report' && currentPanchayat.rtcReport && (
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
//               )} */}
//             </div>
//           </div>

//           <div className="lg:w-1/4">
//             <div className="space-y-4 sticky top-4">
//               <div className="space-y-3">
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   startIcon={<Camera size={18} />}
//                   onClick={() => router.push(`/gallery?gramPanchayat=${currentPanchayat._id}`)}
//                   sx={{ py: 2, backgroundColor: '#117307', '&:hover': { backgroundColor: '#0d5c06' } }}
//                 >
//                   View Gallery
//                 </Button>

//                 {currentPanchayat.district && (
//                   <Button
//                     variant="contained"
//                     fullWidth
//                     startIcon={<Building2 size={18} />}
//                     onClick={() => router.push(`/districts/${currentPanchayat.district?.slug || currentPanchayat.district?._id}`)}
//                     sx={{ py: 2, backgroundColor: '#117307', '&:hover': { backgroundColor: '#0d5c06' } }}
//                   >
//                     View District
//                   </Button>
//                 )}
//               </div>

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
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { fetchMedia } from '@/redux/slices/mediaSlice';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';

// export default function PanchayatDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
  
//   const { panchayats, panchayatCache } = useSelector(state => state.panchayat);
//   const { media } = useSelector(state => state.media);
  
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPanchayat, setCurrentPanchayat] = useState(null);
//   const [panchayatMedia, setPanchayatMedia] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const slug = params?.slug;
//     if (!slug) {
//       setIsLoading(false);
//       setError("No panchayat slug provided");
//       return;
//     }

//     const loadPanchayat = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         // First check if we have it in cache by slug
//         const cached = panchayatCache[slug];
//         const isCacheValid = cached && (Date.now() - cached.lastFetched) < 300000; // 5 min
        
//         if (isCacheValid) {
//           setCurrentPanchayat(cached.data);
//           loadMediaForPanchayat(cached.data._id);
//           setIsLoading(false);
//           return;
//         }

//         // Check if we already have it in the panchayats array
//         let foundPanchayat = panchayats.find(p => p.slug === slug);
        
//         if (!foundPanchayat) {
//           // If not found, fetch all panchayats (they might not be loaded yet)
//           const result = await dispatch(fetchPanchayats({ limit: 100 })).unwrap();
//           foundPanchayat = result.panchayats?.find(p => p.slug === slug);
//         }

//         if (foundPanchayat) {
//           setCurrentPanchayat(foundPanchayat);
//           loadMediaForPanchayat(foundPanchayat._id);
//         } else {
//           setError("Panchayat not found");
//         }

//       } catch (err) {
//         console.error('Error loading panchayat:', err);
//         setError(err?.message || "Failed to load panchayat");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const loadMediaForPanchayat = async (panchayatId) => {
//       try {
//         // Fetch media filtered by panchayat ID
//         const mediaResult = await dispatch(fetchMedia({ 
//           gramPanchayat: panchayatId,
//           status: 'approved',
//           limit: 50
//         })).unwrap();
//         setPanchayatMedia(mediaResult.media || []);
//       } catch (err) {
//         console.error('Error loading media:', err);
//         // Don't show error for media, just log it
//       }
//     };

//     loadPanchayat();
//   }, [params?.slug, dispatch, panchayatCache, panchayats]);

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
//                 {/* {currentPanchayat.status === 'verified' && (
//                   <div className="absolute top-4 right-4">
//                     <div className="bg-emerald-500 px-4 py-2 rounded-full flex items-center gap-2">
//                       <Landmark size={18} className="text-white" />
//                       <span className="text-sm font-bold text-white">Verified Panchayat</span>
//                     </div>
//                   </div>
//                 )} */}
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
//                       {panchayatMedia.map((mediaItem) => (
//                         <div
//                           key={mediaItem._id}
//                           className="relative group rounded-lg overflow-hidden cursor-pointer"
//                           onClick={() => router.push(`/gallery/${mediaItem._id}`)}
//                         >
//                           <div className="aspect-video bg-[#f5fbf2]">
//                             {mediaItem.fileType === 'video' ? (
//                               mediaItem.thumbnailUrl ? (
//                                 <img
//                                   src={mediaItem.thumbnailUrl}
//                                   alt={mediaItem.title}
//                                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                                 />
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#117307]/20 to-[#117307]/40">
//                                   <Video size={48} className="text-[#117307]" />
//                                 </div>
//                               )
//                             ) : (
//                               <img
//                                 src={mediaItem.fileUrl}
//                                 alt={mediaItem.title}
//                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                               />
//                             )}
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="absolute bottom-0 left-0 right-0 p-4">
//                               <p className="text-white font-semibold line-clamp-2">{mediaItem.title}</p>
//                             </div>
//                           </div>
//                           {mediaItem.fileType === 'video' && (
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
//                   onClick={() => router.push(`/gallery?gramPanchayat=${currentPanchayat._id}`)}
//                   sx={{ 
//                     py: 2,
//                     backgroundColor: '#117307',
//                     '&:hover': { backgroundColor: '#0d5c06' }
//                   }}
//                 >
//                   View Gallery
//                 </Button>

//                 {currentPanchayat.district && (
//                   <Button
//                     variant="contained"
//                     fullWidth
//                     startIcon={<Building2 size={18} />}
//                     onClick={() => router.push(`/districts/${currentPanchayat.district?.slug || currentPanchayat.district?._id}`)}
//                     sx={{ 
//                       py: 2,
//                       backgroundColor: '#117307',
//                       '&:hover': { backgroundColor: '#0d5c06' }
//                     }}
//                   >
//                     View District
//                   </Button>
//                 )}
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