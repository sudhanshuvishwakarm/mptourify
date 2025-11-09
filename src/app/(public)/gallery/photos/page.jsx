'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMedia } from '@/redux/slices/mediaSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { Image, Search, MapPin, Calendar, Camera } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function PhotosPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { media, loading, error } = useSelector((state) => state.media);
  const { districts } = useSelector((state) => state.district);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'natural', label: 'Natural' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'event', label: 'Events' },
    { value: 'festival', label: 'Festivals' }
  ];

  useEffect(() => {
    dispatch(fetchMedia({ limit: 50, status: 'approved', fileType: 'image' }));
    dispatch(fetchDistricts());
  }, [dispatch]);

  const districtOptions = [
    { value: 'all', label: 'All Districts' },
    ...(districts?.map(d => ({ value: d._id, label: d.name })) || [])
  ];

  // Dummy photos data
  const dummyPhotos = [
    {
      _id: 'photo1',
      title: 'Khajuraho Temple Complex',
      description: 'Ancient temples showcasing exquisite architecture',
      fileUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
      fileType: 'image',
      category: 'heritage',
      district: { _id: 'dist1', name: 'Chhatarpur' },
      captureDate: '2024-10-15',
      photographer: 'RTC Team',
      tags: ['temple', 'UNESCO']
    },
    {
      _id: 'photo2',
      title: 'Pachmarhi Hills',
      description: 'Scenic beauty of Satpura ranges',
      fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      fileType: 'image',
      category: 'natural',
      district: { _id: 'dist2', name: 'Hoshangabad' },
      captureDate: '2024-10-20',
      photographer: 'RTC Team',
      tags: ['hills', 'nature']
    },
    {
      _id: 'photo3',
      title: 'Narmada River Sunset',
      description: 'Golden hour at the sacred Narmada',
      fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      fileType: 'image',
      category: 'natural',
      district: { _id: 'dist3', name: 'Jabalpur' },
      captureDate: '2024-10-25',
      photographer: 'RTC Team',
      tags: ['river', 'sunset']
    },
    {
      _id: 'photo4',
      title: 'Diwali Celebrations',
      description: 'Festival of lights across villages',
      fileUrl: 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=400',
      fileType: 'image',
      category: 'festival',
      district: { _id: 'dist4', name: 'Indore' },
      captureDate: '2024-11-05',
      photographer: 'RTC Team',
      tags: ['diwali', 'festival']
    },
    {
      _id: 'photo5',
      title: 'Traditional Pottery',
      description: 'Local artisan crafting clay pots',
      fileUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      fileType: 'image',
      category: 'cultural',
      district: { _id: 'dist5', name: 'Sagar' },
      captureDate: '2024-10-30',
      photographer: 'RTC Team',
      tags: ['craft', 'pottery']
    },
    {
      _id: 'photo6',
      title: 'Bandhavgarh Tiger',
      description: 'Royal Bengal Tiger in natural habitat',
      fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      fileType: 'image',
      category: 'natural',
      district: { _id: 'dist6', name: 'Umaria' },
      captureDate: '2024-11-08',
      photographer: 'RTC Team',
      tags: ['wildlife', 'tiger']
    }
  ];

  const displayPhotos = media.length > 0 ? media.filter(m => m.fileType === 'image') : dummyPhotos;

  const filteredPhotos = displayPhotos.filter(item => {
    if (item.status !== 'approved' && item.status !== undefined) return false;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || item.district?._id === selectedDistrict;
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesDistrict && matchesSearch;
  });

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

  const handleCardClick = (id) => {
    router.push(`/gallery/${id}`);
  };

  if (loading) {
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
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Image size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">Photo Gallery</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Photographic Journey
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                Capturing the beauty and heritage of Madhya Pradesh
              </p>
            </div>

            <div className="bg-white max-w-3xl mx-auto rounded-2xl shadow-lg p-4 md:p-6">
              <div className="space-y-4">
                <TextField
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    onChange={(e) => setSelectedDistrict(e.target.value)}
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
                  {filteredPhotos.length} photos
                </span>
                <button
                  onClick={() => router.push('/gallery/videos')}
                  className="text-[#138808] font-medium hover:underline"
                >
                  View Videos →
                </button>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex justify-between items-start gap-12">
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Image size={18} className="text-white" />
                <span className="text-sm font-semibold text-white">Photo Gallery</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Photographic Journey
              </h1>
              <p className="text-lg text-white/90">
                Capturing the beauty and heritage of Madhya Pradesh
              </p>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                  <TextField
                    placeholder="Search photos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
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
                      onChange={(e) => setSelectedDistrict(e.target.value)}
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
                      {filteredPhotos.length} photos found
                    </span>
                    <button
                      onClick={() => router.push('/gallery/videos')}
                      className="text-[#138808] font-medium hover:underline"
                    >
                      View Videos →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Image size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-[#138808] text-lg font-medium">Failed to load photos</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Image size={48} className="mx-auto text-[#138808] opacity-20 mb-4" />
            <p className="text-[#138808] text-lg font-medium mb-2">No photos found</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDistrict('all');
              }}
              className="text-[#138808] underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPhotos.map((item) => (
              <div
                key={item._id}
                onClick={() => handleCardClick(item._id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 group border-2 border-transparent hover:border-[#138808]"
              >
                <div className="h-52 bg-[#f5fbf2] relative overflow-hidden">
                  <img
                    src={item.thumbnailUrl || item.fileUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-[#138808]/5"><svg class="w-20 h-20 text-[#138808] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                    }}
                  />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`${getCategoryColor(item.category)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#138808] mb-3 line-clamp-2 leading-tight group-hover:text-[#0d5c06] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-[#138808]/70 font-semibold text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-[#138808]/10">
                    <div className="flex items-center gap-2 text-[#138808] font-bold text-sm">
                      <MapPin size={14} />
                      <span className="font-medium line-clamp-1">
                        {item.district?.name || 'Unknown'}
                      </span>
                    </div>
                    {item.captureDate && (
                      <div className="flex items-center gap-1.5 text-[#138808]/60 text-xs">
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
}