'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchDistrictById, updateDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  MapPin,
  Image as ImageIcon,
  Calendar,
  Users,
  Maximize,
  Edit,
  CloudUpload,
  Link as LinkIcon,
  X,
  Globe,
  Mountain,
  Trees
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';

export default function EditDistrictPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedDistrict, loading, error, success } = useSelector((state) => state.district);

  const [isEditing, setIsEditing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    headerImage: '',
    formationYear: '',
    area: '',
    population: '',
    coordinates: { lat: '', lng: '' },
    // administrativeDivisions: [],
    // politicalConstituencies: { lokSabha: [], vidhanSabha: [] },
    majorRivers: [],
    hills: [],
    naturalSpots: [],
    historyAndCulture: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [tempInputs, setTempInputs] = useState({ river: '', hill: '', naturalSpot: '' });

  useEffect(() => {
    if (params.id && (!selectedDistrict || selectedDistrict._id !== params.id)) {
      dispatch(fetchDistrictById(params.id));
    }
  }, [params.id, selectedDistrict?._id, dispatch]);

  useEffect(() => {
    if (selectedDistrict && selectedDistrict._id === params.id) {
      setFormData({
        name: selectedDistrict.name || '',
        slug: selectedDistrict.slug || '',
        headerImage: selectedDistrict.headerImage || '',
        formationYear: selectedDistrict.formationYear || '',
        area: selectedDistrict.area || '',
        population: selectedDistrict.population || '',
        coordinates: {
          lat: selectedDistrict.coordinates?.lat || '',
          lng: selectedDistrict.coordinates?.lng || ''
        },
        // administrativeDivisions: selectedDistrict.administrativeDivisions || [],
        // politicalConstituencies: {
        //   lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
        //   vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
        // },
        majorRivers: selectedDistrict.majorRivers || [],
        hills: selectedDistrict.hills || [],
        naturalSpots: selectedDistrict.naturalSpots || [],
        historyAndCulture: selectedDistrict.historyAndCulture || '',
        status: selectedDistrict.status || 'active'
      });
      setPreview(selectedDistrict.headerImage || null);
    }
  }, [selectedDistrict, params.id]);

  useEffect(() => {
  if (success) {
    toast.success('District updated successfully!');
    dispatch(clearSuccess());
    setIsEditing(false);
    setFile(null);
    setIsSaving(false);
  }
  if (error) {
    toast.error(error.message || 'Failed to update district');
    dispatch(clearError());
    setIsSaving(false);
  }
}, [success, error, dispatch]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      const maxSize = 95 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 50MB limit');
        return;
      }

      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUrlChange = (url) => {
    setFormData(prev => ({ ...prev, headerImage: url }));
    setPreview(url);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(formData.headerImage);
    setUploadMethod('url');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'District name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (uploadMethod === 'file' && !file) {
      newErrors.headerImage = 'Header image is required';
    } else if (uploadMethod === 'url' && !formData.headerImage.trim()) {
      newErrors.headerImage = 'Header image URL is required';
    }
    if (!formData.coordinates.lat) newErrors.lat = 'Latitude is required';
    if (!formData.coordinates.lng) newErrors.lng = 'Longitude is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    toast.error('Please fix all errors');
    return;
  }

  setIsSaving(true);

  try {
    if (uploadMethod === 'file' && file) {
      const submitData = new FormData();
      submitData.append('headerImage', file);
      submitData.append('uploadMethod', 'file');
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('formationYear', formData.formationYear);
      submitData.append('area', formData.area);
      submitData.append('population', formData.population);
      submitData.append('coordinates[lat]', formData.coordinates.lat);
      submitData.append('coordinates[lng]', formData.coordinates.lng);
      submitData.append('status', formData.status);
      submitData.append('historyAndCulture', formData.historyAndCulture);
      submitData.append('majorRivers', formData.majorRivers.join(','));
      submitData.append('hills', formData.hills.join(','));
      submitData.append('naturalSpots', formData.naturalSpots.join(','));
      submitData.append('touristPlaces', '[]');
      submitData.append('famousPersonalities', '[]');
      await dispatch(updateDistrict({ id: params.id, districtData: submitData })).unwrap();
    } else {
      await dispatch(updateDistrict({ id: params.id, districtData: formData })).unwrap();
    }
  } catch (err) {
    console.error(err);
    setIsSaving(false);
  }
};

  const handleAddItem = (field, value) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setTempInputs(prev => ({ ...prev, [field === 'majorRivers' ? 'river' : field === 'hills' ? 'hill' : 'naturalSpot']: '' }));
  };

  const handleRemoveItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFile(null);
    setUploadMethod('url');
    if (selectedDistrict) {
      setFormData({
        name: selectedDistrict.name || '',
        slug: selectedDistrict.slug || '',
        headerImage: selectedDistrict.headerImage || '',
        formationYear: selectedDistrict.formationYear || '',
        area: selectedDistrict.area || '',
        population: selectedDistrict.population || '',
        coordinates: {
          lat: selectedDistrict.coordinates?.lat || '',
          lng: selectedDistrict.coordinates?.lng || ''
        },
        // administrativeDivisions: selectedDistrict.administrativeDivisions || [],
        // politicalConstituencies: {
        //   lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
        //   vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
        // },
        majorRivers: selectedDistrict.majorRivers || [],
        hills: selectedDistrict.hills || [],
        naturalSpots: selectedDistrict.naturalSpots || [],
        historyAndCulture: selectedDistrict.historyAndCulture || '',
        status: selectedDistrict.status || 'active'
      });
      setPreview(selectedDistrict.headerImage || null);
    }
    setErrors({});
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' }
  ];

  if (loading && !selectedDistrict) return <div className="fixed inset-0 z-[9999]">
          <Loader message={"Loading..."} />
        </div>;

  if (!selectedDistrict) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">District not found</div>
        <Link href="/admin/districts" className="no-underline">
          <Button 
            sx={{
              backgroundColor: "#1348e8",
              color: "white",
              "&:hover": { backgroundColor: "#0d3a9d" },
              mt: 2
            }}
          >
            Back to Districts
          </Button>
        </Link>
      </div>
    );
  }

 


    // <div className="p-4 md:p-6 max-w-7xl mx-auto">
    //   {/* Header Section */}
    //   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    //     <div className="flex items-center gap-4">
    //       <Link href="/admin/districts" className="no-underline">
    //         <Button
    //           variant="outlined"
    //           sx={{
    //             borderColor: "#1348e8",
    //             color: "#1348e8",
    //             "&:hover": {
    //               borderColor: "#0d3a9d",
    //               backgroundColor: "#1348e810",
    //             },
    //             minWidth: "auto",
    //             padding: "12px"
    //           }}
    //         >
    //           <ArrowLeft size={20} />
    //         </Button>
    //       </Link>

    //       <div>
    //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
    //           {selectedDistrict.name}
    //         </h1>
    //         <div className="text-sm text-gray-600 mt-1">
    //           {isEditing ? 'Edit district details' : 'View district details'}
    //         </div>
    //       </div>
    //     </div>
        
    //     {!isEditing ? (
    //       <Button
    //         onClick={() => setIsEditing(true)}
    //         startIcon={<Edit size={20} />}
    //         sx={{
    //           backgroundColor: "#1348e8",
    //           color: "white",
    //           "&:hover": { backgroundColor: "#0d3a9d" },
    //           textTransform: "none",
    //           fontSize: { xs: "0.875rem", sm: "1rem" },
    //         }}
    //       >
    //         Edit District
    //       </Button>
    //     ) : (
    //       <div className="flex gap-2">
    //         <Button 
    //           onClick={handleCancel} 
    //           variant="outlined"
    //           sx={{
    //             borderColor: "#6b7280",
    //             color: "#374151",
    //             "&:hover": {
    //               borderColor: "#374151",
    //               backgroundColor: "#f9fafb",
    //             },
    //             fontSize: { xs: "0.875rem", sm: "1rem" },
    //           }}
    //         >
    //           Cancel
    //         </Button>
    //         <Button 
    //           onClick={handleSubmit} 
    //           disabled={loading} 
    //           startIcon={<Save size={20} />}
    //           sx={{
    //             backgroundColor: "#1348e8",
    //             color: "white",
    //             "&:hover": { backgroundColor: "#0d3a9d" },
    //             "&:disabled": { backgroundColor: "#9ca3af" },
    //             fontSize: { xs: "0.875rem", sm: "1rem" },
    //           }}
    //         >
    //           {loading ? 'Saving...' : 'Save Changes'}
    //         </Button>
    //       </div>
    //     )}
    //   </div>

    //   <form onSubmit={handleSubmit}>
    //     {/* Image and Geography in one row */}
    //     <div className="flex flex-col xl:flex-row gap-6 mb-6">
    //       {/* Image Section - 70% width */}
    //       <div className="w-full xl:w-[70%]">
    //         <div className="border border-[#1348e820] overflow-hidden bg-white h-full rounded-lg">
    //           <div className="relative bg-[#1348e805] p-0 h-full">
    //             <div className="flex justify-center items-center h-full">
    //               {preview ? (
    //                 <img 
    //                   src={preview} 
    //                   alt={selectedDistrict.name} 
    //                   className="w-full  object-cover rounded-lg"
    //                   style={{ maxHeight: isEditing ? '400px' : 'none' }}
    //                 />
    //               ) : (
    //                 <div className="text-center text-gray-500 py-16">
    //                   <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
    //                   <div>No header image set</div>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Geography Section - 30% width */}
    //       <div className="w-full xl:w-[30%]">
    //         <Card 
    //           sx={{ 
    //             p: 3, 
    //             border: "1px solid", 
    //             borderColor: "#1348e820", 
    //             backgroundColor: "white",
    //             height: "100%"
    //           }}
    //         >
    //           <h3 className="text-xl font-bold text-gray-900 mb-4">Geography</h3>
              
    //           {/* Major Rivers */}
    //           <div className="mb-6">
    //             <div className="flex items-center gap-2 mb-3">
    //               <MapPin size={18} className="text-[#1348e8]" />
    //               <h4 className="font-semibold text-gray-900">Major Rivers</h4>
    //             </div>
    //             {isEditing && (
    //               <div className="flex flex-col sm:flex-row gap-2 mb-3">
    //                 <TextField 
    //                   value={tempInputs.river} 
    //                   onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })} 
    //                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))}
    //                   placeholder="Betwa" 
    //                   fullWidth 
    //                 />
    //                 <Button 
    //                   type="button" 
    //                   onClick={() => handleAddItem('majorRivers', tempInputs.river)}
    //                   sx={{
    //                     backgroundColor: "#1348e8",
    //                     color: "white",
    //                     "&:hover": { backgroundColor: "#0d3a9d" },
    //                     fontWeight: "600",
    //                     minWidth: "80px"
    //                   }}
    //                 >
    //                   Add
    //                 </Button>
    //               </div>
    //             )}
    //             <div className="flex flex-wrap gap-2">
    //               {formData.majorRivers.map((river, index) => (
    //                 <div
    //                   key={index}
    //                   className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium"
    //                 >
    //                   {river}
    //                   {isEditing && (
    //                     <button
    //                       onClick={() => handleRemoveItem('majorRivers', index)}
    //                       className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5"
    //                     >
    //                       <X size={14} />
    //                     </button>
    //                   )}
    //                 </div>
    //               ))}
    //             </div>
    //           </div>

    //           {/* Hills */}
    //           <div className="mb-6">
    //             <div className="flex items-center gap-2 mb-3">
    //               <Mountain size={18} className="text-[#1348e8]" />
    //               <h4 className="font-semibold text-gray-900">Hills</h4>
    //             </div>
    //             {isEditing && (
    //               <div className="flex flex-col sm:flex-row gap-2 mb-3">
    //                 <TextField 
    //                   value={tempInputs.hill} 
    //                   onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })} 
    //                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))}
    //                   placeholder="Vindhyachal" 
    //                   fullWidth 
    //                 />
    //                 <Button 
    //                   type="button" 
    //                   onClick={() => handleAddItem('hills', tempInputs.hill)}
    //                   sx={{
    //                     backgroundColor: "#1348e8",
    //                     color: "white",
    //                     "&:hover": { backgroundColor: "#0d3a9d" },
    //                     fontWeight: "600",
    //                     minWidth: "80px"
    //                   }}
    //                 >
    //                   Add
    //                 </Button>
    //               </div>
    //             )}
    //             <div className="flex flex-wrap gap-2">
    //               {formData.hills.map((hill, index) => (
    //                 <div
    //                   key={index}
    //                   className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium"
    //                 >
    //                   {hill}
    //                   {isEditing && (
    //                     <button
    //                       onClick={() => handleRemoveItem('hills', index)}
    //                       className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5"
    //                     >
    //                       <X size={14} />
    //                     </button>
    //                   )}
    //                 </div>
    //               ))}
    //             </div>
    //           </div>

    //           {/* Natural Spots */}
    //           <div>
    //             <div className="flex items-center gap-2 mb-3">
    //               <Trees size={18} className="text-[#1348e8]" />
    //               <h4 className="font-semibold text-gray-900">Natural Spots</h4>
    //             </div>
    //             {isEditing && (
    //               <div className="flex flex-col sm:flex-row gap-2 mb-3">
    //                 <TextField 
    //                   value={tempInputs.naturalSpot} 
    //                   onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })} 
    //                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))}
    //                   placeholder="Upper Lake" 
    //                   fullWidth 
    //                 />
    //                 <Button 
    //                   type="button" 
    //                   onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)}
    //                   sx={{
    //                     backgroundColor: "#1348e8",
    //                     color: "white",
    //                     "&:hover": { backgroundColor: "#0d3a9d" },
    //                     fontWeight: "600",
    //                     minWidth: "80px"
    //                   }}
    //                 >
    //                   Add
    //                 </Button>
    //               </div>
    //             )}
    //             <div className="flex flex-wrap gap-2">
    //               {formData.naturalSpots.map((spot, index) => (
    //                 <div
    //                   key={index}
    //                   className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium"
    //                 >
    //                   {spot}
    //                   {isEditing && (
    //                     <button
    //                       onClick={() => handleRemoveItem('naturalSpots', index)}
    //                       className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5"
    //                     >
    //                       <X size={14} />
    //                     </button>
    //                   )}
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         </Card>
    //       </div>
    //     </div>

    //     {/* Basic Information and Statistics in one row */}
    //     <div className="flex flex-col lg:flex-row gap-6 mb-6">
    //       {/* Basic Information - 70% */}
    //       <div className="w-full lg:w-[70%]">
    //         <Card 
    //           sx={{ 
    //             p: 3, 
    //             border: "1px solid", 
    //             borderColor: "#1348e820", 
    //             backgroundColor: "white"
    //           }}
    //         >
    //           <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
    //           <div className="flex flex-col gap-4">
    //             <div className="flex flex-col md:flex-row gap-4">
    //               <TextField 
    //                 label="District Name *" 
    //                 value={formData.name} 
    //                 onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
    //                 error={errors.name}
    //                 helperText={errors.name}
    //                 disabled={!isEditing} 
    //                 fullWidth 
    //               />
    //               <TextField 
    //                 label="Slug *" 
    //                 value={formData.slug} 
    //                 onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
    //                 error={errors.slug}
    //                 helperText={errors.slug}
    //                 disabled={!isEditing} 
    //                 fullWidth 
    //               />
    //             </div>

    //             {/* Header Image Upload */}
    //             {isEditing && (
    //               <div>
    //                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
    //                 <div className="flex border-b border-gray-200 mb-4">
    //                   <button
    //                     type="button"
    //                     onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }}
    //                     className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
    //                       uploadMethod === 'url' 
    //                         ? 'border-[#1348e8] text-[#1348e8]' 
    //                         : 'border-transparent text-gray-500 hover:text-gray-700'
    //                     }`}
    //                   >
    //                     <LinkIcon size={18} />
    //                     Use URL
    //                   </button>
    //                   <button
    //                     type="button"
    //                     onClick={() => setUploadMethod('file')}
    //                     className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
    //                       uploadMethod === 'file' 
    //                         ? 'border-[#1348e8] text-[#1348e8]' 
    //                         : 'border-transparent text-gray-500 hover:text-gray-700'
    //                     }`}
    //                   >
    //                     <CloudUpload size={18} />
    //                     Upload File
    //                   </button>
    //                 </div>

    //                 {uploadMethod === 'file' ? (
    //                   <>
    //                     {!file ? (
    //                       <div 
    //                         className="border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors"
    //                         onClick={() => document.getElementById('file-upload').click()}
    //                       >
    //                         <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
    //                         <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
    //                         <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 95MB)</div>
    //                       </div>
    //                     ) : (
    //                       <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
    //                         <div className="flex items-center justify-between mb-3">
    //                           <div className="flex items-center gap-3">
    //                             <ImageIcon size={24} className="text-[#1348e8]" />
    //                             <div>
    //                               <div className="font-semibold text-gray-900">{file.name}</div>
    //                               <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
    //                             </div>
    //                           </div>
    //                           <button 
    //                             onClick={removeFile}
    //                             className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
    //                           >
    //                             <X size={20} />
    //                           </button>
    //                         </div>
    //                         <div className="flex justify-center">
    //                           <img 
    //                             src={preview} 
    //                             alt="Preview" 
    //                             className="w-full h-48 object-contain rounded-lg"
    //                           />
    //                         </div>
    //                       </div>
    //                     )}
    //                     <input 
    //                       id="file-upload" 
    //                       type="file" 
    //                       accept="image/*" 
    //                       onChange={handleFileChange} 
    //                       className="hidden" 
    //                     />
    //                   </>
    //                 ) : (
    //                   <TextField 
    //                     label="Header Image URL *" 
    //                     value={formData.headerImage} 
    //                     onChange={(e) => handleUrlChange(e.target.value)} 
    //                     error={errors.headerImage}
    //                     helperText={errors.headerImage || "Paste direct URL to header image"}
    //                     placeholder="https://example.com/district-header.jpg" 
    //                     startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} 
    //                     fullWidth 
    //                   />
    //                 )}
    //                 {errors.headerImage && (
    //                   <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>
    //                 )}
    //               </div>
    //             )}

    //             <div className="flex flex-col md:flex-row gap-4">
    //               <TextField 
    //                 label="Formation Year" 
    //                 type="number" 
    //                 value={formData.formationYear} 
    //                 onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })} 
    //                 placeholder="1972" 
    //                 disabled={!isEditing} 
    //                 startIcon={<Calendar size={20} className="text-[#1348e8]" />} 
    //                 fullWidth 
    //               />
    //               <SelectField 
    //                 label="Status" 
    //                 value={formData.status} 
    //                 onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
    //                 options={statusOptions} 
    //                 disabled={!isEditing} 
    //                 fullWidth 
    //               />
    //             </div>
    //           </div>
    //         </Card>
    //       </div>

    //       {/* Statistics and Coordinates - 30% */}
    //       <div className="w-full lg:w-[30%]">
    //         <div className="flex flex-col gap-6">
    //           {/* Statistics */}
    //           <Card 
    //             sx={{ 
    //               p: 3, 
    //               border: "1px solid", 
    //               borderColor: "#1348e820", 
    //               backgroundColor: "white"
    //             }}
    //           >
    //             <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
    //             <div className="flex flex-col gap-4">
    //               <TextField 
    //                 label="Area (sq km)" 
    //                 type="number" 
    //                 value={formData.area} 
    //                 onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
    //                 placeholder="2772" 
    //                 disabled={!isEditing} 
    //                 startIcon={<Maximize size={20} className="text-[#1348e8]" />} 
    //                 fullWidth 
    //               />
    //               <TextField 
    //                 label="Population" 
    //                 type="number" 
    //                 value={formData.population} 
    //                 onChange={(e) => setFormData({ ...formData, population: e.target.value })} 
    //                 placeholder="2371059" 
    //                 disabled={!isEditing} 
    //                 startIcon={<Users size={20} className="text-[#1348e8]" />} 
    //                 fullWidth 
    //               />
    //             </div>
    //           </Card>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Coordinates Section */}
    //     <Card 
    //       sx={{ 
    //         p: 3, 
    //         my: 3, 
    //         border: "1px solid", 
    //         borderColor: "#1348e820", 
    //         backgroundColor: "white"
    //       }}
    //     >
    //       <div className="flex items-center gap-2 mb-4">
    //         <Globe size={20} className="text-[#1348e8]" />
    //         <h3 className="text-lg font-semibold text-gray-900">Coordinates *</h3>
    //       </div>
    //       <div className="flex gap-3">
    //         <TextField 
    //           label="Latitude *" 
    //           type="number" 
    //           step="any" 
    //           value={formData.coordinates.lat} 
    //           onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} 
    //           error={errors.lat}
    //           helperText={errors.lat}
    //           placeholder="23.25" 
    //           disabled={!isEditing} 
    //           fullWidth 
    //         />
    //         <TextField 
    //           label="Longitude *" 
    //           type="number" 
    //           step="any" 
    //           value={formData.coordinates.lng} 
    //           onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} 
    //           error={errors.lng}
    //           helperText={errors.lng}
    //           placeholder="77.42" 
    //           disabled={!isEditing} 
    //           fullWidth 
    //         />
    //       </div>
    //     </Card>

    //     {/* History & Culture - Full width at bottom */}
    //     <div className="mb-6">
    //       <Card 
    //         sx={{ 
    //           p: 3, 
    //           border: "1px solid", 
    //           borderColor: "#1348e820", 
    //           backgroundColor: "white"
    //         }}
    //       >
    //         <h2 className="text-xl font-bold text-gray-900 mb-4">History & Culture</h2>
    //         <textarea
    //           value={formData.historyAndCulture}
    //           onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
    //           placeholder="Write about the district's history, culture, and significance..."
    //           disabled={!isEditing}
    //           rows={8}
    //           className="w-full text-lg text px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
    //         />
    //       </Card>
    //     </div>
    //   </form>
    // </div>

     return (
  <>
    {isSaving && <div className="fixed inset-0 z-[9999]"><Loader message="Saving..." /></div>}
     <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/districts" className="no-underline">
            <Button
              variant="outlined"
              sx={{
                borderColor: "#1348e8",
                color: "#1348e8",
                "&:hover": {
                  borderColor: "#0d3a9d",
                  backgroundColor: "#1348e810",
                },
                minWidth: "auto",
                padding: "12px"
              }}
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0">
              {selectedDistrict.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1 mb-0">
              {isEditing ? 'Edit district details' : 'View district details'}
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            startIcon={<Edit size={20} />}
            sx={{
              backgroundColor: "#1348e8",
              color: "white",
              "&:hover": { backgroundColor: "#0d3a9d" },
            }}
          >
            Edit District
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleCancel} 
              variant="outlined"
              sx={{
                borderColor: "#d1d5db",
                color: "#4b5563",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              startIcon={<Save size={20} />}
              sx={{
                backgroundColor: "#1348e8",
                color: "white",
                "&:hover": { backgroundColor: "#0d3a9d" },
                "&:disabled": { backgroundColor: "#9ca3af", color: "#e5e7eb" },
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col xl:flex-row gap-6 mb-6">
          <div className="w-full xl:w-[70%]">
            <div className="border border-[#e5e7eb] overflow-hidden bg-white rounded-xl shadow-sm">
              <div className="relative bg-gray-50 p-0">
                <div className="flex justify-center items-center">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt={selectedDistrict.name} 
                      className="w-full object-cover"
                      style={{ maxHeight: isEditing ? '400px' : '500px' }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 py-20">
                      <ImageIcon size={48} className="mx-auto mb-4" />
                      <p className="text-base font-medium mb-0">No header image set</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[30%]">
            <Card 
              sx={{ 
                p: 3, 
                border: "1px solid #e5e7eb", 
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                height: "100%"
              }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Geography</h3>
              
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-[#1348e8]" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-0">Major Rivers</h4>
                </div>
                {isEditing && (
                  <div className="flex gap-2 mb-3">
                    <TextField 
                      value={tempInputs.river} 
                      onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))}
                      placeholder="Enter river name" 
                      size="small"
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.875rem',
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleAddItem('majorRivers', tempInputs.river)}
                      size="small"
                      sx={{
                        backgroundColor: "#1348e8",
                        color: "white",
                        "&:hover": { backgroundColor: "#0d3a9d" },
                        minWidth: "70px",
                        fontSize: "0.875rem"
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.majorRivers.length > 0 ? formData.majorRivers.map((river, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-blue-50 text-gray-700 border border-blue-100 rounded-full px-3 py-1.5 text-sm font-medium"
                    >
                      <span>{river}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('majorRivers', index)}
                          className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-blue-100 p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic mb-0">No rivers added</p>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Mountain size={18} className="text-[#1348e8]" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-0">Hills</h4>
                </div>
                {isEditing && (
                  <div className="flex gap-2 mb-3">
                    <TextField 
                      value={tempInputs.hill} 
                      onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))}
                      placeholder="Enter hill name" 
                      size="small"
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.875rem',
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleAddItem('hills', tempInputs.hill)}
                      size="small"
                      sx={{
                        backgroundColor: "#1348e8",
                        color: "white",
                        "&:hover": { backgroundColor: "#0d3a9d" },
                        minWidth: "70px",
                        fontSize: "0.875rem"
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.hills.length > 0 ? formData.hills.map((hill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-blue-50 text-gray-700 border border-blue-100 rounded-full px-3 py-1.5 text-sm font-medium"
                    >
                      <span>{hill}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('hills', index)}
                          className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-blue-100 p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic mb-0">No hills added</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trees size={18} className="text-[#1348e8]" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-0">Natural Spots</h4>
                </div>
                {isEditing && (
                  <div className="flex gap-2 mb-3">
                    <TextField 
                      value={tempInputs.naturalSpot} 
                      onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))}
                      placeholder="Enter spot name" 
                      size="small"
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.875rem',
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)}
                      size="small"
                      sx={{
                        backgroundColor: "#1348e8",
                        color: "white",
                        "&:hover": { backgroundColor: "#0d3a9d" },
                        minWidth: "70px",
                        fontSize: "0.875rem"
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.naturalSpots.length > 0 ? formData.naturalSpots.map((spot, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-blue-50 text-gray-700 border border-blue-100 rounded-full px-3 py-1.5 text-sm font-medium"
                    >
                      <span>{spot}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('naturalSpots', index)}
                          className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-blue-100 p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic mb-0">No natural spots added</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="w-full lg:w-[70%]">
            <Card 
              sx={{ 
                p: 3, 
                border: "1px solid #e5e7eb", 
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
              }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <TextField 
                    label="District Name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    error={errors.name}
                    helperText={errors.name}
                    disabled={!isEditing} 
                    required
                    fullWidth 
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.9375rem',
                        color: isEditing ? '#111827' : '#6b7280'
                      }
                    }}
                  />
                  <TextField 
                    label="Slug" 
                    value={formData.slug} 
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                    error={errors.slug}
                    helperText={errors.slug}
                    disabled={!isEditing} 
                    required
                    fullWidth 
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.9375rem',
                        color: isEditing ? '#111827' : '#6b7280'
                      }
                    }}
                  />
                </div>

                {isEditing && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Header Image *</h3>
                    <div className="flex border-b border-gray-200 mb-4">
                      <button
                        type="button"
                        onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }}
                        className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
                          uploadMethod === 'url' 
                            ? 'border-[#1348e8] text-[#1348e8]' 
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <LinkIcon size={18} />
                        Use URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${
                          uploadMethod === 'file' 
                            ? 'border-[#1348e8] text-[#1348e8]' 
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <CloudUpload size={18} />
                        Upload File
                      </button>
                    </div>

                    {uploadMethod === 'file' ? (
                      <>
                        {!file ? (
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#1348e8] transition-all"
                            onClick={() => document.getElementById('file-upload').click()}
                          >
                            <CloudUpload size={40} className="text-gray-400 mx-auto mb-3" />
                            <p className="text-base font-semibold text-gray-900 mb-1">Click to upload header image</p>
                            <p className="text-sm text-gray-600 mb-0">Supports JPG, PNG, WebP (Max 95MB)</p>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-xl p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <ImageIcon size={24} className="text-[#1348e8]" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 mb-0">{file.name}</p>
                                  <p className="text-xs text-gray-600 mb-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={removeFile}
                                className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <X size={20} />
                              </button>
                            </div>
                            <div className="flex justify-center">
                              <img 
                                src={preview} 
                                alt="Preview" 
                                className="w-full h-48 object-contain rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                        <input 
                          id="file-upload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </>
                    ) : (
                      <TextField 
                        label="Header Image URL" 
                        value={formData.headerImage} 
                        onChange={(e) => handleUrlChange(e.target.value)} 
                        error={errors.headerImage}
                        helperText={errors.headerImage || "Paste direct URL to header image"}
                        placeholder="https://example.com/district-header.jpg" 
                        startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} 
                        required
                        fullWidth 
                      />
                    )}
                    {errors.headerImage && (
                      <p className="text-red-600 text-sm mt-2 mb-0">{errors.headerImage}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                  <TextField 
                    label="Formation Year" 
                    type="number" 
                    value={formData.formationYear} 
                    onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })} 
                    placeholder="1972" 
                    disabled={!isEditing} 
                    startIcon={<Calendar size={20} className="text-[#1348e8]" />} 
                    fullWidth 
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.9375rem',
                        color: isEditing ? '#111827' : '#6b7280'
                      }
                    }}
                  />
                  <SelectField 
                    label="Status" 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                    options={statusOptions} 
                    disabled={!isEditing} 
                    fullWidth 
                    sx={{
                      '& .MuiSelect-select': {
                        fontSize: '0.9375rem',
                        color: isEditing ? '#111827' : '#6b7280'
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="w-full lg:w-[30%]">
            <Card 
              sx={{ 
                p: 3, 
                border: "1px solid #e5e7eb", 
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
              }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="flex flex-col gap-4">
                <TextField 
                  label="Area (sq km)" 
                  type="number" 
                  value={formData.area} 
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
                  placeholder="2772" 
                  disabled={!isEditing} 
                  startIcon={<Maximize size={20} className="text-[#1348e8]" />} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.9375rem',
                      color: isEditing ? '#111827' : '#6b7280'
                    }
                  }}
                />
                <TextField 
                  label="Population" 
                  type="number" 
                  value={formData.population} 
                  onChange={(e) => setFormData({ ...formData, population: e.target.value })} 
                  placeholder="2371059" 
                  disabled={!isEditing} 
                  startIcon={<Users size={20} className="text-[#1348e8]" />} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.9375rem',
                      color: isEditing ? '#111827' : '#6b7280'
                    }
                  }}
                />
              </div>
            </Card>
          </div>
        </div>

        <Card 
          sx={{ 
            p: 3, 
            mb: 3, 
            border: "1px solid #e5e7eb", 
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-[#1348e8]" />
            <h3 className="text-lg font-semibold text-gray-900 mb-0">Coordinates</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <TextField 
              label="Latitude" 
              type="number" 
              step="any" 
              value={formData.coordinates.lat} 
              onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} 
              error={errors.lat}
              helperText={errors.lat}
              placeholder="23.25" 
              disabled={!isEditing} 
              required
              fullWidth 
              sx={{
                '& .MuiOutlinedInput-input': {
                  fontSize: '0.9375rem',
                  color: isEditing ? '#111827' : '#6b7280'
                }
              }}
            />
            <TextField 
              label="Longitude" 
              type="number" 
              step="any" 
              value={formData.coordinates.lng} 
              onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} 
              error={errors.lng}
              helperText={errors.lng}
              placeholder="77.42" 
              disabled={!isEditing} 
              required
              fullWidth 
              sx={{
                '& .MuiOutlinedInput-input': {
                  fontSize: '0.9375rem',
                  color: isEditing ? '#111827' : '#6b7280'
                }
              }}
            />
          </div>
        </Card>

        <Card 
          sx={{ 
            p: 3, 
            mb: 3,
            border: "1px solid #e5e7eb", 
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
          }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">History & Culture</h2>
          <textarea
            value={formData.historyAndCulture}
            onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
            placeholder="Write about the district's history, culture, and significance..."
            disabled={!isEditing}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed resize-vertical transition-colors"
            style={{ 
              fontSize: '0.9375rem',
              lineHeight: '1.6',
              color: isEditing ? '#111827' : '#6b7280'
            }}
          />
        </Card>
      </form>
    </div>
  </>
  );
}





// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchDistrictById, updateDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   MapPin,
//   Image as ImageIcon,
//   Calendar,
//   Users,
//   Maximize,
//   Edit,
//   CloudUpload,
//   Link as LinkIcon,
//   X,
//   Globe,
//   Mountain,
//   Trees
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';

// export default function EditDistrictPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedDistrict, loading, error, success } = useSelector((state) => state.district);

//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadMethod, setUploadMethod] = useState('url');
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     slug: '',
//     headerImage: '',
//     formationYear: '',
//     area: '',
//     population: '',
//     coordinates: { lat: '', lng: '' },
//     // administrativeDivisions: [],
//     // politicalConstituencies: { lokSabha: [], vidhanSabha: [] },
//     majorRivers: [],
//     hills: [],
//     naturalSpots: [],
//     historyAndCulture: '',
//     status: 'active'
//   });

//   const [errors, setErrors] = useState({});
//   const [tempInputs, setTempInputs] = useState({ river: '', hill: '', naturalSpot: '' });

//   useEffect(() => {
//     if (params.id && (!selectedDistrict || selectedDistrict._id !== params.id)) {
//       dispatch(fetchDistrictById(params.id));
//     }
//   }, [params.id, selectedDistrict?._id, dispatch]);

//   useEffect(() => {
//     if (selectedDistrict && selectedDistrict._id === params.id) {
//       setFormData({
//         name: selectedDistrict.name || '',
//         slug: selectedDistrict.slug || '',
//         headerImage: selectedDistrict.headerImage || '',
//         formationYear: selectedDistrict.formationYear || '',
//         area: selectedDistrict.area || '',
//         population: selectedDistrict.population || '',
//         coordinates: {
//           lat: selectedDistrict.coordinates?.lat || '',
//           lng: selectedDistrict.coordinates?.lng || ''
//         },
//         // administrativeDivisions: selectedDistrict.administrativeDivisions || [],
//         // politicalConstituencies: {
//         //   lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
//         //   vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
//         // },
//         majorRivers: selectedDistrict.majorRivers || [],
//         hills: selectedDistrict.hills || [],
//         naturalSpots: selectedDistrict.naturalSpots || [],
//         historyAndCulture: selectedDistrict.historyAndCulture || '',
//         status: selectedDistrict.status || 'active'
//       });
//       setPreview(selectedDistrict.headerImage || null);
//     }
//   }, [selectedDistrict, params.id]);

//   useEffect(() => {
//     if (success) {
//       toast.success('District updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       setFile(null);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update district');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, WebP)');
//         return;
//       }

//       const maxSize = 95 * 1024 * 1024;
//       if (selectedFile.size > maxSize) {
//         toast.error('File size exceeds 50MB limit');
//         return;
//       }

//       setFile(selectedFile);
      
//       const reader = new FileReader();
//       reader.onload = (event) => setPreview(event.target.result);
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const handleUrlChange = (url) => {
//     setFormData(prev => ({ ...prev, headerImage: url }));
//     setPreview(url);
//   };

//   const removeFile = () => {
//     setFile(null);
//     setPreview(formData.headerImage);
//     setUploadMethod('url');
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'District name is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (uploadMethod === 'file' && !file) {
//       newErrors.headerImage = 'Header image is required';
//     } else if (uploadMethod === 'url' && !formData.headerImage.trim()) {
//       newErrors.headerImage = 'Header image URL is required';
//     }
//     if (!formData.coordinates.lat) newErrors.lat = 'Latitude is required';
//     if (!formData.coordinates.lng) newErrors.lng = 'Longitude is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Please fix all errors');
//       return;
//     }

//     try {
//       if (uploadMethod === 'file' && file) {
//         const submitData = new FormData();
//         submitData.append('headerImage', file);
//         submitData.append('uploadMethod', 'file');
//         submitData.append('name', formData.name);
//         submitData.append('slug', formData.slug);
//         submitData.append('formationYear', formData.formationYear);
//         submitData.append('area', formData.area);
//         submitData.append('population', formData.population);
//         submitData.append('coordinates[lat]', formData.coordinates.lat);
//         submitData.append('coordinates[lng]', formData.coordinates.lng);
//         submitData.append('status', formData.status);
//         submitData.append('historyAndCulture', formData.historyAndCulture);
//         // submitData.append('administrativeDivisions', formData.administrativeDivisions.join(','));
//         // submitData.append('politicalConstituencies[lokSabha]', formData.politicalConstituencies.lokSabha.join(','));
//         // submitData.append('politicalConstituencies[vidhanSabha]', formData.politicalConstituencies.vidhanSabha.join(','));
//         submitData.append('majorRivers', formData.majorRivers.join(','));
//         submitData.append('hills', formData.hills.join(','));
//         submitData.append('naturalSpots', formData.naturalSpots.join(','));
//         submitData.append('touristPlaces', '[]');
//         submitData.append('famousPersonalities', '[]');
//         await dispatch(updateDistrict({ id: params.id, districtData: submitData })).unwrap();
//       } else {
//         await dispatch(updateDistrict({ id: params.id, districtData: formData })).unwrap();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleAddItem = (field, value) => {
//     if (!value.trim()) return;
//     setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
//     setTempInputs(prev => ({ ...prev, [field === 'majorRivers' ? 'river' : field === 'hills' ? 'hill' : 'naturalSpot']: '' }));
//   };

//   const handleRemoveItem = (field, index) => {
//     setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setFile(null);
//     setUploadMethod('url');
//     if (selectedDistrict) {
//       setFormData({
//         name: selectedDistrict.name || '',
//         slug: selectedDistrict.slug || '',
//         headerImage: selectedDistrict.headerImage || '',
//         formationYear: selectedDistrict.formationYear || '',
//         area: selectedDistrict.area || '',
//         population: selectedDistrict.population || '',
//         coordinates: {
//           lat: selectedDistrict.coordinates?.lat || '',
//           lng: selectedDistrict.coordinates?.lng || ''
//         },
//         // administrativeDivisions: selectedDistrict.administrativeDivisions || [],
//         // politicalConstituencies: {
//         //   lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
//         //   vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
//         // },
//         majorRivers: selectedDistrict.majorRivers || [],
//         hills: selectedDistrict.hills || [],
//         naturalSpots: selectedDistrict.naturalSpots || [],
//         historyAndCulture: selectedDistrict.historyAndCulture || '',
//         status: selectedDistrict.status || 'active'
//       });
//       setPreview(selectedDistrict.headerImage || null);
//     }
//     setErrors({});
//   };

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   if (loading && !selectedDistrict) return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading..."} />
//         </div>;

//   if (!selectedDistrict) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-gray-600 mb-4">District not found</div>
//         <Link href="/admin/districts" className="no-underline">
//           <Button className="mt-2 text-[#1348e8]">Back to Districts</Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-4">
//           <Link href="/admin/districts" className="no-underline">
//   <Button
//     variant="outlined"
//     sx={{
//       borderColor: "#1348e8",
//       color: "#1348e8",
//       "&:hover": {
//         borderColor: "#0d3a9d",
//         backgroundColor: "#1348e810",
//       },
//     }}
//     className="!min-w-auto !p-3"
//   >
//     <ArrowLeft size={20} />
//   </Button>
// </Link>

//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//               {selectedDistrict.name}
//             </h1>
//             <div className="text-sm text-gray-600 mt-1">
//               {isEditing ? 'Edit district details' : 'View district details'}
//             </div>
//           </div>
//         </div>
        
//         {!isEditing ? (
//         <Button
//   onClick={() => setIsEditing(true)}
//   startIcon={<Edit size={20} />}
//   sx={{
//     backgroundColor: "#1348e8",
//     color: "white",
//     "&:hover": { backgroundColor: "#0d3a9d" },
//     textTransform: "none",
//     fontSize: { xs: "0.875rem", sm: "1rem" },
//   }}
// >
//   Edit District
// </Button>

//         ) : (
//           <div className="flex gap-2">
//             <Button 
//               onClick={handleCancel} 
//               variant="outlined" 
//               className="border-gray-500 text-gray-600 hover:border-gray-700 hover:bg-gray-50 text-sm sm:text-base"
//             >
//               Cancel
//             </Button>
//             <Button 
//               onClick={handleSubmit} 
//               disabled={loading} 
//               startIcon={<Save size={20} />} 
//               className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] text-sm sm:text-base"
//             >
//               {loading ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit}>
//         {/* Image and Geography in one row */}
//         <div className="flex flex-col xl:flex-row gap-6 mb-6">
//           {/* Image Section - 60% width */}
//           <div className="w-full xl:w-[70%]">
//             <div className="border border-[#1348e820] overflow-hidden bg-white h-full">
//               <div className="relative bg-[#1348e805] p-0 h-full">
//                 <div className="flex justify-center items-center h-full">
//                   {preview ? (
//                     <img 
//                       src={preview} 
//                       alt={selectedDistrict.name} 
//                       className="w-full max-w-4xl h-full object-cover rounded-lg shadow-lg"
//                     />
//                   ) : (
//                     <div className="text-center text-gray-500 py-16">
//                       <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
//                       <div>No header image set</div>
//                     </div>
//                   )}
//                 </div>
//                 {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-6">
//                   <h2 className="text-2xl font-bold mb-2">{selectedDistrict.name}</h2>
//                   <div className="flex gap-4 flex-wrap">
//                     {selectedDistrict.area && (
//                       <div className="flex items-center gap-1">
//                         <Maximize size={16} />
//                         <span>{selectedDistrict.area} sq km</span>
//                       </div>
//                     )}
//                     {selectedDistrict.population && (
//                       <div className="flex items-center gap-1">
//                         <Users size={16} />
//                         <span>{selectedDistrict.population.toLocaleString()} people</span>
//                       </div>
//                     )}
//                     {selectedDistrict.formationYear && (
//                       <div className="flex items-center gap-1">
//                         <Calendar size={16} />
//                         <span>Formed in {selectedDistrict.formationYear}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div> */}
//               </div>
//             </div>
//           </div>

//           {/* Geography Section - 40% width */}
//           <div className="w-full xl:w-[40%]">
//             <Card className="p-6 border border-[#1348e820] bg-white h-full">
//               <h3 className="text-xl font-bold text-gray-900 mb-4">Geography</h3>
              
//               {/* Major Rivers */}
//               <div className="mb-6">
//                 <div className="flex items-center gap-2 mb-3">
//                   <MapPin size={18} className="text-[#1348e8]" />
//                   <h4 className="font-semibold text-gray-900">Major Rivers</h4>
//                 </div>
//                 {isEditing && (
//                   <div className="flex flex-col sm:flex-row gap-2 mb-3">
//                     <TextField 
//                       value={tempInputs.river} 
//                       onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })} 
//                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))}
//                       placeholder="Betwa" 
//                       fullWidth 
//                     />
//                     <Button 
//                       type="button" 
//                       onClick={() => handleAddItem('majorRivers', tempInputs.river)}
//                       className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] font-semibold min-w-20"
//                     >
//                       Add
//                     </Button>
//                   </div>
//                 )}
//                 <div className="flex flex-wrap gap-2">
//                   {formData.majorRivers.map((river, index) => (
//                     <div
//                       key={index}
//                       className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium"
//                     >
//                       {river}
//                       {isEditing && (
//                         <button
//                           onClick={() => handleRemoveItem('majorRivers', index)}
//                           className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5"
//                         >
//                           <X size={14} />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Hills */}
//               <div className="mb-6">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Mountain size={18} className="text-[#1348e8]" />
//                   <h4 className="font-semibold text-gray-900">Hills</h4>
//                 </div>
//                 {isEditing && (
//                   <div className="flex flex-col sm:flex-row gap-2 mb-3">
//                     <TextField 
//                       value={tempInputs.hill} 
//                       onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })} 
//                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))}
//                       placeholder="Vindhyachal" 
//                       fullWidth 
//                     />
//                     <Button 
//                       type="button" 
//                       onClick={() => handleAddItem('hills', tempInputs.hill)}
//                       className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] font-semibold min-w-20"
//                     >
//                       Add
//                     </Button>
//                   </div>
//                 )}
//                 <div className="flex flex-wrap gap-2">
//                   {formData.hills.map((hill, index) => (
//                     <div
//                       key={index}
//                       className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium"
//                     >
//                       {hill}
//                       {isEditing && (
//                         <button
//                           onClick={() => handleRemoveItem('hills', index)}
//                           className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5"
//                         >
//                           <X size={14} />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Natural Spots */}
//               <div>
//                 <div className="flex items-center gap-2 mb-3">
//                   <Trees size={18} className="text-[#1348e8]" />
//                   <h4 className="font-semibold text-gray-900">Natural Spots</h4>
//                 </div>
//                 {isEditing && (
//                   <div className="flex flex-col sm:flex-row gap-2 mb-3">
//                     <TextField 
//                       value={tempInputs.naturalSpot} 
//                       onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })} 
//                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))}
//                       placeholder="Upper Lake" 
//                       fullWidth 
//                     />
//                     <Button 
//                       type="button" 
//                       onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)}
//                       className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] font-semibold min-w-20"
//                     >
//                       Add
//                     </Button>
//                   </div>
//                 )}
//                 <div className="flex flex-wrap gap-2">
//                   {formData.naturalSpots.map((spot, index) => (
//                     <div
//                       key={index}
//                       className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium"
//                     >
//                       {spot}
//                       {isEditing && (
//                         <button
//                           onClick={() => handleRemoveItem('naturalSpots', index)}
//                           className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5"
//                         >
//                           <X size={14} />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </Card>
//           </div>
//         </div>

//         {/* Basic Information and Statistics in one row */}
//         <div className="flex flex-col lg:flex-row gap-6 mb-6">
//           {/* Basic Information - 60% */}
//           <div className="w-full lg:w-[70%]">
//             <Card className="p-6 border border-[#1348e820] bg-white">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
//               <div className="flex flex-col gap-4">
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <TextField 
//                     label="District Name *" 
//                     value={formData.name} 
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
//                     error={errors.name}
//                     helperText={errors.name}
//                     disabled={!isEditing} 
//                     fullWidth 
//                   />
//                   <TextField 
//                     label="Slug *" 
//                     value={formData.slug} 
//                     onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
//                     error={errors.slug}
//                     helperText={errors.slug}
//                     disabled={!isEditing} 
//                     fullWidth 
//                   />
//                 </div>

//                 {/* Header Image Upload */}
//                 {isEditing && (
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
//                     <div className="flex border-b border-gray-200 mb-4">
//                       <button
//                         type="button"
//                         onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }}
//                         className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
//                           uploadMethod === 'url' 
//                             ? 'border-[#1348e8] text-[#1348e8]' 
//                             : 'border-transparent text-gray-500 hover:text-gray-700'
//                         }`}
//                       >
//                         <LinkIcon size={18} />
//                         Use URL
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setUploadMethod('file')}
//                         className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
//                           uploadMethod === 'file' 
//                             ? 'border-[#1348e8] text-[#1348e8]' 
//                             : 'border-transparent text-gray-500 hover:text-gray-700'
//                         }`}
//                       >
//                         <CloudUpload size={18} />
//                         Upload File
//                       </button>
//                     </div>

//                     {uploadMethod === 'file' ? (
//                       <>
//                         {!file ? (
//                           <div 
//                             className="border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors"
//                             onClick={() => document.getElementById('file-upload').click()}
//                           >
//                             <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
//                             <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
//                             <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 95MB)</div>
//                           </div>
//                         ) : (
//                           <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="flex items-center gap-3">
//                                 <ImageIcon size={24} className="text-[#1348e8]" />
//                                 <div>
//                                   <div className="font-semibold text-gray-900">{file.name}</div>
//                                   <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
//                                 </div>
//                               </div>
//                               <button 
//                                 onClick={removeFile}
//                                 className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
//                               >
//                                 <X size={20} />
//                               </button>
//                             </div>
//                             <div className="flex justify-center">
//                               <img 
//                                 src={preview} 
//                                 alt="Preview" 
//                                 className="w-full max-h-48 object-contain rounded-lg"
//                               />
//                             </div>
//                           </div>
//                         )}
//                         <input 
//                           id="file-upload" 
//                           type="file" 
//                           accept="image/*" 
//                           onChange={handleFileChange} 
//                           className="hidden" 
//                         />
//                       </>
//                     ) : (
//                       <TextField 
//                         label="Header Image URL *" 
//                         value={formData.headerImage} 
//                         onChange={(e) => handleUrlChange(e.target.value)} 
//                         error={errors.headerImage}
//                         helperText={errors.headerImage || "Paste direct URL to header image"}
//                         placeholder="https://example.com/district-header.jpg" 
//                         startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} 
//                         fullWidth 
//                       />
//                     )}
//                     {errors.headerImage && (
//                       <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>
//                     )}
//                   </div>
//                 )}

//                 <div className="flex flex-col md:flex-row gap-4">
//                   <TextField 
//                     label="Formation Year" 
//                     type="number" 
//                     value={formData.formationYear} 
//                     onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })} 
//                     placeholder="1972" 
//                     disabled={!isEditing} 
//                     startIcon={<Calendar size={20} className="text-[#1348e8]" />} 
//                     fullWidth 
//                   />
//                   <SelectField 
//                     label="Status" 
//                     value={formData.status} 
//                     onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
//                     options={statusOptions} 
//                     disabled={!isEditing} 
//                     fullWidth 
//                   />
//                 </div>
//               </div>
//             </Card>
//           </div>

//           {/* Statistics and Coordinates - 40% */}
//           <div className="w-full lg:w-[40%]">
//             <div className="flex flex-col gap-6">
//               {/* Statistics */}
//               <Card className="p-6 border border-[#1348e820] bg-white">
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
//                 <div className="flex flex-col gap-4">
//                   <TextField 
//                     label="Area (sq km)" 
//                     type="number" 
//                     value={formData.area} 
//                     onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
//                     placeholder="2772" 
//                     disabled={!isEditing} 
//                     startIcon={<Maximize size={20} className="text-[#1348e8]" />} 
//                     fullWidth 
//                   />
//                   <TextField 
//                     label="Population" 
//                     type="number" 
//                     value={formData.population} 
//                     onChange={(e) => setFormData({ ...formData, population: e.target.value })} 
//                     placeholder="2371059" 
//                     disabled={!isEditing} 
//                     startIcon={<Users size={20} className="text-[#1348e8]" />} 
//                     fullWidth 
//                   />
//                 </div>
//               </Card>
//             </div>
//           </div>
//         </div>
//                     <Card className="p-6 my-5 border border-[#1348e820] bg-white">
//                 <div className="flex items-center gap-2 mb-4">
//                   <Globe size={20} className="text-[#1348e8]" />
//                   <h3 className="text-lg font-semibold text-gray-900">Coordinates *</h3>
//                 </div>
//                 <div className="flex  gap-3">
//                   <TextField 
//                     label="Latitude *" 
//                     type="number" 
//                     step="any" 
//                     value={formData.coordinates.lat} 
//                     onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} 
//                     error={errors.lat}
//                     helperText={errors.lat}
//                     placeholder="23.25" 
//                     disabled={!isEditing} 
//                     fullWidth 
//                   />
//                   <TextField 
//                     label="Longitude *" 
//                     type="number" 
//                     step="any" 
//                     value={formData.coordinates.lng} 
//                     onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} 
//                     error={errors.lng}
//                     helperText={errors.lng}
//                     placeholder="77.42" 
//                     disabled={!isEditing} 
//                     fullWidth 
//                   />
//                 </div>
//               </Card>
//         {/* History & Culture - Full width at bottom */}
//         <div className="mb-6">
//           <Card className="p-6 border border-[#1348e820] bg-white">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">History & Culture</h2>
//             <textarea
//               value={formData.historyAndCulture}
//               onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
//               placeholder="Write about the district's history, culture, and significance..."
//               disabled={!isEditing}
//               rows={8}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
//             />
//           </Card>
//         </div>
//       </form>
//     </div>
//   );
// }

// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchDistrictById, updateDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   MapPin,
//   Image as ImageIcon,
//   Calendar,
//   Users,
//   Maximize,
//   Edit,
//   CloudUpload,
//   Link as LinkIcon,
//   X
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton,
//   Tabs,
//   Tab
// } from '@mui/material';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function EditDistrictPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedDistrict, loading, error, success } = useSelector((state) => state.district);

//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadMethod, setUploadMethod] = useState('url');
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     slug: '',
//     headerImage: '',
//     formationYear: '',
//     area: '',
//     population: '',
//     coordinates: { lat: '', lng: '' },
//     administrativeDivisions: [],
//     politicalConstituencies: { lokSabha: [], vidhanSabha: [] },
//     majorRivers: [],
//     hills: [],
//     naturalSpots: [],
//     historyAndCulture: '',
//     status: 'active'
//   });

//   const [errors, setErrors] = useState({});
//   const [tempInputs, setTempInputs] = useState({ river: '', hill: '', naturalSpot: '' });

//   useEffect(() => {
//     if (params.id && (!selectedDistrict || selectedDistrict._id !== params.id)) {
//       dispatch(fetchDistrictById(params.id));
//     }
//   }, [params.id, selectedDistrict?._id, dispatch]);

//   useEffect(() => {
//     if (selectedDistrict && selectedDistrict._id === params.id) {
//       setFormData({
//         name: selectedDistrict.name || '',
//         slug: selectedDistrict.slug || '',
//         headerImage: selectedDistrict.headerImage || '',
//         formationYear: selectedDistrict.formationYear || '',
//         area: selectedDistrict.area || '',
//         population: selectedDistrict.population || '',
//         coordinates: {
//           lat: selectedDistrict.coordinates?.lat || '',
//           lng: selectedDistrict.coordinates?.lng || ''
//         },
//         administrativeDivisions: selectedDistrict.administrativeDivisions || [],
//         politicalConstituencies: {
//           lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
//           vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
//         },
//         majorRivers: selectedDistrict.majorRivers || [],
//         hills: selectedDistrict.hills || [],
//         naturalSpots: selectedDistrict.naturalSpots || [],
//         historyAndCulture: selectedDistrict.historyAndCulture || '',
//         status: selectedDistrict.status || 'active'
//       });
//       setPreview(selectedDistrict.headerImage || null);
//     }
//   }, [selectedDistrict, params.id]);

//   useEffect(() => {
//     if (success) {
//       toast.success('District updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       setFile(null);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update district');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, WebP)');
//         return;
//       }

//       const maxSize = 95 * 1024 * 1024;
//       if (selectedFile.size > maxSize) {
//         toast.error('File size exceeds 50MB limit');
//         return;
//       }

//       setFile(selectedFile);
      
//       const reader = new FileReader();
//       reader.onload = (event) => setPreview(event.target.result);
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const handleUrlChange = (url) => {
//     setFormData(prev => ({ ...prev, headerImage: url }));
//     setPreview(url);
//   };

//   const removeFile = () => {
//     setFile(null);
//     setPreview(formData.headerImage);
//     setUploadMethod('url');
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'District name is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (uploadMethod === 'file' && !file) {
//       newErrors.headerImage = 'Header image is required';
//     } else if (uploadMethod === 'url' && !formData.headerImage.trim()) {
//       newErrors.headerImage = 'Header image URL is required';
//     }
//     if (!formData.coordinates.lat) newErrors.lat = 'Latitude is required';
//     if (!formData.coordinates.lng) newErrors.lng = 'Longitude is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Please fix all errors');
//       return;
//     }

//     try {
//       if (uploadMethod === 'file' && file) {
//         const submitData = new FormData();
//         submitData.append('headerImage', file);
//         submitData.append('uploadMethod', 'file');
//         submitData.append('name', formData.name);
//         submitData.append('slug', formData.slug);
//         submitData.append('formationYear', formData.formationYear);
//         submitData.append('area', formData.area);
//         submitData.append('population', formData.population);
//         submitData.append('coordinates[lat]', formData.coordinates.lat);
//         submitData.append('coordinates[lng]', formData.coordinates.lng);
//         submitData.append('status', formData.status);
//         submitData.append('historyAndCulture', formData.historyAndCulture);
//         submitData.append('administrativeDivisions', formData.administrativeDivisions.join(','));
//         submitData.append('politicalConstituencies[lokSabha]', formData.politicalConstituencies.lokSabha.join(','));
//         submitData.append('politicalConstituencies[vidhanSabha]', formData.politicalConstituencies.vidhanSabha.join(','));
//         submitData.append('majorRivers', formData.majorRivers.join(','));
//         submitData.append('hills', formData.hills.join(','));
//         submitData.append('naturalSpots', formData.naturalSpots.join(','));
//         submitData.append('touristPlaces', '[]');
//         submitData.append('famousPersonalities', '[]');
//         await dispatch(updateDistrict({ id: params.id, districtData: submitData })).unwrap();
//       } else {
//         await dispatch(updateDistrict({ id: params.id, districtData: formData })).unwrap();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleAddItem = (field, value) => {
//     if (!value.trim()) return;
//     setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
//     setTempInputs(prev => ({ ...prev, [field === 'majorRivers' ? 'river' : field === 'hills' ? 'hill' : 'naturalSpot']: '' }));
//   };

//   const handleRemoveItem = (field, index) => {
//     setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setFile(null);
//     setUploadMethod('url');
//     if (selectedDistrict) {
//       setFormData({
//         name: selectedDistrict.name || '',
//         slug: selectedDistrict.slug || '',
//         headerImage: selectedDistrict.headerImage || '',
//         formationYear: selectedDistrict.formationYear || '',
//         area: selectedDistrict.area || '',
//         population: selectedDistrict.population || '',
//         coordinates: {
//           lat: selectedDistrict.coordinates?.lat || '',
//           lng: selectedDistrict.coordinates?.lng || ''
//         },
//         administrativeDivisions: selectedDistrict.administrativeDivisions || [],
//         politicalConstituencies: {
//           lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
//           vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
//         },
//         majorRivers: selectedDistrict.majorRivers || [],
//         hills: selectedDistrict.hills || [],
//         naturalSpots: selectedDistrict.naturalSpots || [],
//         historyAndCulture: selectedDistrict.historyAndCulture || '',
//         status: selectedDistrict.status || 'active'
//       });
//       setPreview(selectedDistrict.headerImage || null);
//     }
//     setErrors({});
//   };

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   if (loading && !selectedDistrict) return <Loader />;

//   if (!selectedDistrict) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Typography variant="body1" color="text.secondary" gutterBottom>District not found</Typography>
//         <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
//           <Button sx={{ mt: 2, color: '#144ae9' }}>Back to Districts</Button>
//         </Link>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
//      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//     <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
//       <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9', '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' } }}>
//         <ArrowLeft size={20} />
//       </Button>
//     </Link>
//     <Box>
//       <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//         {selectedDistrict.name}
//       </Typography>
//       <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//         {isEditing ? 'Edit district details' : 'View district details'}
//       </Typography>
//     </Box>
//   </Box>
  
//   {!isEditing ? (
//     <Button 
//       onClick={() => setIsEditing(true)} 
//       startIcon={<Edit size={20} />} 
//       sx={{ 
//         backgroundColor: '#144ae9', 
//         color: 'white', 
//         '&:hover': { backgroundColor: '#0d3ec7' },
//         fontSize: { xs: '0.875rem', sm: '1rem' }
//       }}
//     >
//       Edit District
//     </Button>
//   ) : (
//     <Box sx={{ display: 'flex', gap: 1 }}>
//       <Button 
//         onClick={handleCancel} 
//         variant="outlined" 
//         sx={{ 
//           borderColor: '#6b7280', 
//           color: '#6b7280', 
//           '&:hover': { borderColor: '#374151', backgroundColor: '#6b728010' },
//           fontSize: { xs: '0.875rem', sm: '1rem' }
//         }}
//       >
//         Cancel
//       </Button>
//       <Button 
//         onClick={handleSubmit} 
//         disabled={loading} 
//         startIcon={<Save size={20} />} 
//         sx={{ 
//           backgroundColor: '#144ae9', 
//           color: 'white', 
//           '&:hover': { backgroundColor: '#0d3ec7' },
//           fontSize: { xs: '0.875rem', sm: '1rem' }
//         }}
//       >
//         {loading ? 'Saving...' : 'Save Changes'}
//       </Button>
//     </Box>
//   )}
// </Box>

//       <Card sx={{ mb: 4, border: '1px solid #144ae920', overflow: 'hidden' }}>
//         <Box sx={{ position: 'relative', height: 300, bgcolor: '#144ae905' }}>
//           {preview && <img src={preview} alt={selectedDistrict.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
//           <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white', p: 3 }}>
//             <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{selectedDistrict.name}</Typography>
//             <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
//               {selectedDistrict.area && <Typography variant="body1">📏 {selectedDistrict.area} sq km</Typography>}
//               {selectedDistrict.population && <Typography variant="body1">👥 {selectedDistrict.population.toLocaleString()} people</Typography>}
//               {selectedDistrict.formationYear && <Typography variant="body1">📅 Formed in {selectedDistrict.formationYear}</Typography>}
//             </Box>
//           </Box>
//         </Box>
//       </Card>

//       <Box component="form" onSubmit={handleSubmit}>
//         <Grid container spacing={3}>
//           <Grid item xs={12} lg={8}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>Basic Information</Typography>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                   <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                     <TextField label="District Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={!!errors.name} helperText={errors.name} disabled={!isEditing} fullWidth />
//                     <TextField label="Slug *" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} error={!!errors.slug} helperText={errors.slug} disabled={!isEditing} fullWidth />
//                   </Box>

//                   {isEditing && (
//                     <Box>
//                       <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">Header Image *</Typography>
//                       <Tabs value={uploadMethod} onChange={(e, newValue) => { setUploadMethod(newValue); if (newValue === 'url') { setFile(null); setPreview(formData.headerImage); } }} sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
//                         <Tab icon={<LinkIcon size={18} />} iconPosition="start" label="Use URL" value="url" />
//                         <Tab icon={<CloudUpload size={18} />} iconPosition="start" label="Upload File" value="file" />
//                       </Tabs>

//                       {uploadMethod === 'file' ? (
//                         <>
//                           {!file ? (
//                             <Box sx={{ border: '2px dashed', borderColor: errors.headerImage ? '#d32f2f' : '#144ae9', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', backgroundColor: '#144ae905', '&:hover': { backgroundColor: '#144ae910', borderColor: '#0d3ec7' } }} onClick={() => document.getElementById('file-upload').click()}>
//                               <CloudUpload size={36} color="#144ae9" style={{ marginBottom: 12 }} />
//                               <Typography variant="h6" color="text.primary" gutterBottom>Click to upload header image</Typography>
//                               <Typography variant="body2" color="text.secondary">Supports JPG, PNG, WebP (Max 95MB)</Typography>
//                             </Box>
//                           ) : (
//                             <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                                   <ImageIcon size={24} color="#144ae9" />
//                                   <Box>
//                                     <Typography variant="body1" fontWeight={600}>{file.name}</Typography>
//                                     <Typography variant="body2" color="text.secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</Typography>
//                                   </Box>
//                                 </Box>
//                                 <IconButton onClick={removeFile} sx={{ color: '#d32f2f', '&:hover': { backgroundColor: '#d32f2f10' } }}><X size={20} /></IconButton>
//                               </Box>
//                               <img src={preview} alt="Preview" style={{ maxHeight: '200px', width: '100%', objectFit: 'contain', borderRadius: '8px' }} />
//                             </Box>
//                           )}
//                           <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
//                         </>
//                       ) : (
//                         <TextField label="Header Image URL *" value={formData.headerImage} onChange={(e) => handleUrlChange(e.target.value)} error={!!errors.headerImage} helperText={errors.headerImage || "Paste direct URL to header image"} placeholder="https://example.com/district-header.jpg" startIcon={<LinkIcon size={20} color="#144ae9" />} fullWidth />
//                       )}
//                       {errors.headerImage && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{errors.headerImage}</Typography>}
//                     </Box>
//                   )}

//                   <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                     <TextField label="Formation Year" type="number" value={formData.formationYear} onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })} placeholder="1956" disabled={!isEditing} startIcon={<Calendar size={20} color="#144ae9" />} fullWidth />
//                     <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={statusOptions} disabled={!isEditing} fullWidth />
//                   </Box>
//                 </Box>
//               </Card>

//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>Statistics</Typography>
//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField label="Area (sq km)" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="2772" disabled={!isEditing} startIcon={<Maximize size={20} color="#144ae9" />} fullWidth />
//                   <TextField label="Population" type="number" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} placeholder="2371061" disabled={!isEditing} startIcon={<Users size={20} color="#144ae9" />} fullWidth />
//                 </Box>
//               </Card>

//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>History & Culture</Typography>
//                 <TextField multiline rows={6} value={formData.historyAndCulture} onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })} placeholder="Write about the district's history, culture, and significance..." disabled={!isEditing} fullWidth />
//               </Card>
//             </Box>
//           </Grid>

//           <Grid item xs={12} lg={4}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//                   <MapPin size={20} color="#144ae9" />
//                   <Typography variant="h5" fontWeight="bold" color="text.primary">Coordinates *</Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                   <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} error={!!errors.lat} helperText={errors.lat} placeholder="23.2599" disabled={!isEditing} fullWidth />
//                   <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} error={!!errors.lng} helperText={errors.lng} placeholder="77.4126" disabled={!isEditing} fullWidth />
//                 </Box>
//               </Card>

//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>Geography</Typography>
                
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Major Rivers</Typography>
//                   {isEditing && (
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <TextField value={tempInputs.river} onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))} placeholder="Betwa" fullWidth />
//                       <Button type="button" onClick={() => handleAddItem('majorRivers', tempInputs.river)} sx={{ color: 'white', backgroundColor: '#144ae9', fontWeight: 'bold', minWidth: '100px', '&:hover': { backgroundColor: '#0d3ec7' } }}>Add</Button>
//                     </Box>
//                   )}
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {formData.majorRivers.map((river, index) => (
//                       <Chip key={index} label={river} onDelete={isEditing ? () => handleRemoveItem('majorRivers', index) : undefined} sx={{ backgroundColor: '#144ae910', color: '#144ae9', border: '1px solid #144ae920', fontWeight: 500, '& .MuiChip-deleteIcon': { color: '#144ae9', '&:hover': { color: '#0d3ec7' } } }} />
//                     ))}
//                   </Box>
//                 </Box>

//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Hills</Typography>
//                   {isEditing && (
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <TextField value={tempInputs.hill} onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))} placeholder="Vindhyachal" fullWidth />
//                       <Button type="button" onClick={() => handleAddItem('hills', tempInputs.hill)} sx={{ color: 'white', backgroundColor: '#144ae9', fontWeight: 'bold', minWidth: '100px', '&:hover': { backgroundColor: '#0d3ec7' } }}>Add</Button>
//                     </Box>
//                   )}
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {formData.hills.map((hill, index) => (
//                       <Chip key={index} label={hill} onDelete={isEditing ? () => handleRemoveItem('hills', index) : undefined} sx={{ backgroundColor: '#144ae910', color: '#144ae9', border: '1px solid #144ae920', fontWeight: 500, '& .MuiChip-deleteIcon': { color: '#144ae9', '&:hover': { color: '#0d3ec7' } } }} />
//                     ))}
//                   </Box>
//                 </Box>

//                 <Box>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>Natural Spots</Typography>
//                   {isEditing && (
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <TextField value={tempInputs.naturalSpot} onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))} placeholder="Upper Lake" fullWidth />
//                       <Button type="button" onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)} sx={{ color: 'white', backgroundColor: '#144ae9', fontWeight: 'bold', minWidth: '100px', '&:hover': { backgroundColor: '#0d3ec7' } }}>Add</Button>
//                     </Box>
//                   )}
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {formData.naturalSpots.map((spot, index) => (
//                       <Chip key={index} label={spot} onDelete={isEditing ? () => handleRemoveItem('naturalSpots', index) : undefined} sx={{ backgroundColor: '#144ae910', color: '#144ae9', border: '1px solid #144ae920', fontWeight: 500, '& .MuiChip-deleteIcon': { color: '#144ae9', '&:hover': { color: '#0d3ec7' } } }} />
//                     ))}
//                   </Box>
//                 </Box>
//               </Card>
//             </Box>
//           </Grid>
//         </Grid>
//       </Box>
//     </Box>
//   );
// }

// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchDistrictById, updateDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   MapPin,
//   Image as ImageIcon,
//   Calendar,
//   Users,
//   Maximize,
//   Edit,
//   CloudUpload,
//   Link as LinkIcon,
//   X
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton,
//   Tabs,
//   Tab
// } from '@mui/material';

// // Import your custom components
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function EditDistrictPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedDistrict, loading, error, success } = useSelector((state) => state.district);

//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadMethod, setUploadMethod] = useState('url'); // 'file' or 'url'
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [dataLoaded, setDataLoaded] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     slug: '',
//     headerImage: '',
//     formationYear: '',
//     area: '',
//     population: '',
//     coordinates: {
//       lat: '',
//       lng: ''
//     },
//     administrativeDivisions: [],
//     politicalConstituencies: {
//       lokSabha: [],
//       vidhanSabha: []
//     },
//     majorRivers: [],
//     hills: [],
//     naturalSpots: [],
//     historyAndCulture: '',
//     status: 'active'
//   });

//   const [errors, setErrors] = useState({});
//   const [tempInputs, setTempInputs] = useState({
//     river: '',
//     hill: '',
//     naturalSpot: ''
//   });

//   // LOAD DATA ONLY ONCE
//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchDistrictById(params.id));
//       setDataLoaded(true);
//     }
//   }, [params.id, dataLoaded, dispatch]);

//   // POPULATE FORM
//   useEffect(() => {
//     if (selectedDistrict && selectedDistrict._id === params.id) {
//       setFormData({
//         name: selectedDistrict.name || '',
//         slug: selectedDistrict.slug || '',
//         headerImage: selectedDistrict.headerImage || '',
//         formationYear: selectedDistrict.formationYear || '',
//         area: selectedDistrict.area || '',
//         population: selectedDistrict.population || '',
//         coordinates: {
//           lat: selectedDistrict.coordinates?.lat || '',
//           lng: selectedDistrict.coordinates?.lng || ''
//         },
//         administrativeDivisions: selectedDistrict.administrativeDivisions || [],
//         politicalConstituencies: {
//           lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
//           vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
//         },
//         majorRivers: selectedDistrict.majorRivers || [],
//         hills: selectedDistrict.hills || [],
//         naturalSpots: selectedDistrict.naturalSpots || [],
//         historyAndCulture: selectedDistrict.historyAndCulture || '',
//         status: selectedDistrict.status || 'active'
//       });
//       setPreview(selectedDistrict.headerImage || null);
//     }
//   }, [selectedDistrict, params.id]);

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success('District updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       setFile(null);
//       dispatch(fetchDistrictById(params.id));
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update district');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch, params.id]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, WebP)');
//         return;
//       }

//       // Validate file size (50MB)
//       const maxSize = 95 * 1024 * 1024;
//       if (selectedFile.size > maxSize) {
//         toast.error('File size exceeds 50MB limit');
//         return;
//       }

//       setFile(selectedFile);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (event) => setPreview(event.target.result);
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const handleUrlChange = (url) => {
//     setFormData(prev => ({ ...prev, headerImage: url }));
//     setPreview(url);
//   };

//   const removeFile = () => {
//     setFile(null);
//     setPreview(formData.headerImage); // Reset to original image
//     setUploadMethod('url');
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = 'District name is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
//     // Validate header image based on upload method
//     if (uploadMethod === 'file' && !file) {
//       newErrors.headerImage = 'Header image is required';
//     } else if (uploadMethod === 'url' && !formData.headerImage.trim()) {
//       newErrors.headerImage = 'Header image URL is required';
//     }
    
//     if (!formData.coordinates.lat) newErrors.lat = 'Latitude is required';
//     if (!formData.coordinates.lng) newErrors.lng = 'Longitude is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Please fix all errors');
//       return;
//     }

//     // Create FormData for file upload or use JSON for URL
//     if (uploadMethod === 'file' && file) {
//       const submitData = new FormData();
      
//       // Append file and upload method
//       submitData.append('headerImage', file);
//       submitData.append('uploadMethod', 'file');
      
//       // Append other form data
//       submitData.append('name', formData.name);
//       submitData.append('slug', formData.slug);
//       submitData.append('formationYear', formData.formationYear);
//       submitData.append('area', formData.area);
//       submitData.append('population', formData.population);
//       submitData.append('coordinates[lat]', formData.coordinates.lat);
//       submitData.append('coordinates[lng]', formData.coordinates.lng);
//       submitData.append('status', formData.status);
//       submitData.append('historyAndCulture', formData.historyAndCulture);
      
//       // Append arrays
//       submitData.append('administrativeDivisions', formData.administrativeDivisions.join(','));
//       submitData.append('politicalConstituencies[lokSabha]', formData.politicalConstituencies.lokSabha.join(','));
//       submitData.append('politicalConstituencies[vidhanSabha]', formData.politicalConstituencies.vidhanSabha.join(','));
//       submitData.append('majorRivers', formData.majorRivers.join(','));
//       submitData.append('hills', formData.hills.join(','));
//       submitData.append('naturalSpots', formData.naturalSpots.join(','));
      
//       // Append empty arrays for tourist places and famous personalities
//       submitData.append('touristPlaces', '[]');
//       submitData.append('famousPersonalities', '[]');

//       dispatch(updateDistrict({ id: params.id, districtData: submitData }));
//     } else {
//       // Use regular JSON for URL upload
//       dispatch(updateDistrict({ id: params.id, districtData: formData }));
//     }
//   };

//   const handleAddItem = (field, value) => {
//     if (!value.trim()) return;

//     setFormData(prev => ({
//       ...prev,
//       [field]: [...prev[field], value.trim()]
//     }));

//     setTempInputs(prev => ({ ...prev, [field]: '' }));
//   };

//   const handleRemoveItem = (field, index) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index)
//     }));
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setFile(null);
//     setUploadMethod('url');
//     if (selectedDistrict) {
//       setFormData({
//         name: selectedDistrict.name || '',
//         slug: selectedDistrict.slug || '',
//         headerImage: selectedDistrict.headerImage || '',
//         formationYear: selectedDistrict.formationYear || '',
//         area: selectedDistrict.area || '',
//         population: selectedDistrict.population || '',
//         coordinates: {
//           lat: selectedDistrict.coordinates?.lat || '',
//           lng: selectedDistrict.coordinates?.lng || ''
//         },
//         administrativeDivisions: selectedDistrict.administrativeDivisions || [],
//         politicalConstituencies: {
//           lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
//           vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
//         },
//         majorRivers: selectedDistrict.majorRivers || [],
//         hills: selectedDistrict.hills || [],
//         naturalSpots: selectedDistrict.naturalSpots || [],
//         historyAndCulture: selectedDistrict.historyAndCulture || '',
//         status: selectedDistrict.status || 'active'
//       });
//       setPreview(selectedDistrict.headerImage || null);
//     }
//     setErrors({});
//   };

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   if (loading && !selectedDistrict) {
//     return <Loader />;
//   }

//   if (!selectedDistrict) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           District not found
//         </Typography>
//         <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
//           <Button sx={{ mt: 2, color: '#144ae9' }}>
//             Back to Districts
//           </Button>
//         </Link>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
//             <Button 
//               variant="outlined" 
//               sx={{ 
//                 minWidth: 'auto', 
//                 p: 1.5,
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight="bold" color="text.primary">
//               {selectedDistrict.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {isEditing ? 'Edit district details' : 'View district details'}
//             </Typography>
//           </Box>
//         </Box>
        
//         {!isEditing ? (
//           <Button
//             onClick={() => setIsEditing(true)}
//             startIcon={<Edit size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Edit District
//           </Button>
//         ) : (
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button
//               onClick={handleCancel}
//               variant="outlined"
//               sx={{
//                 borderColor: '#6b7280',
//                 color: '#6b7280',
//                 '&:hover': {
//                   borderColor: '#374151',
//                   backgroundColor: '#6b728010'
//                 }
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               disabled={loading}
//               startIcon={loading ? <Loader /> : <Save size={20} />}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 '&:hover': {
//                   backgroundColor: '#144ae9'
//                 }
//               }}
//             >
//               {loading ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </Box>
//         )}
//       </Box>

//       {/* HEADER IMAGE PREVIEW */}
//       <Card sx={{ mb: 4, border: '1px solid #144ae920', overflow: 'hidden' }}>
//         <Box sx={{ position: 'relative', height: 300, bgcolor: '#144ae905' }}>
//           {preview && (
//             <img
//               src={preview}
//               alt={selectedDistrict.name}
//               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//             />
//           )}
//           <Box sx={{ 
//             position: 'absolute', 
//             bottom: 0, 
//             left: 0, 
//             right: 0, 
//             background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
//             color: 'white',
//             p: 3
//           }}>
//             <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
//               {selectedDistrict.name}
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
//               {selectedDistrict.area && (
//                 <Typography variant="body1">
//                   📏 {selectedDistrict.area} sq km
//                 </Typography>
//               )}
//               {selectedDistrict.population && (
//                 <Typography variant="body1">
//                   👥 {selectedDistrict.population.toLocaleString()} people
//                 </Typography>
//               )}
//               {selectedDistrict.formationYear && (
//                 <Typography variant="body1">
//                   📅 Formed in {selectedDistrict.formationYear}
//                 </Typography>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       </Card>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit}>
//         <Grid container spacing={3}>
//           {/* LEFT COLUMN - BASIC INFO */}
//           <Grid item xs={12} lg={8}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {/* BASIC INFO */}
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//                   Basic Information
//                 </Typography>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                   {/* FIRST ROW */}
//                   <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                     <TextField
//                       label="District Name *"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       error={!!errors.name}
//                       helperText={errors.name}
//                       disabled={!isEditing}
//                       fullWidth
//                     />
//                     <TextField
//                       label="Slug *"
//                       value={formData.slug}
//                       onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//                       error={!!errors.slug}
//                       helperText={errors.slug}
//                       disabled={!isEditing}
//                       fullWidth
//                     />
//                   </Box>

//                   {/* HEADER IMAGE UPLOAD */}
//                   {isEditing && (
//                     <Box>
//                       <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
//                         Header Image *
//                       </Typography>
                      
//                       <Tabs
//                         value={uploadMethod}
//                         onChange={(e, newValue) => {
//                           setUploadMethod(newValue);
//                           if (newValue === 'url') {
//                             setFile(null);
//                             setPreview(formData.headerImage);
//                           }
//                         }}
//                         sx={{
//                           mb: 3,
//                           '& .MuiTab-root': {
//                             textTransform: 'none',
//                             fontWeight: 600,
//                           }
//                         }}
//                       >
//                         <Tab 
//                           icon={<LinkIcon size={18} />} 
//                           iconPosition="start" 
//                           label="Use URL" 
//                           value="url" 
//                         />
//                         <Tab 
//                           icon={<CloudUpload size={18} />} 
//                           iconPosition="start" 
//                           label="Upload File" 
//                           value="file" 
//                         />
//                       </Tabs>

//                       {uploadMethod === 'file' ? (
//                         <>
//                           {!file ? (
//                             <Box
//                               sx={{
//                                 border: '2px dashed',
//                                 borderColor: errors.headerImage ? '#d32f2f' : '#144ae9',
//                                 borderRadius: 2,
//                                 p: 4,
//                                 textAlign: 'center',
//                                 cursor: 'pointer',
//                                 backgroundColor: '#144ae905',
//                                 '&:hover': {
//                                   backgroundColor: '#144ae910',
//                                   borderColor: '#0d3ec7'
//                                 }
//                               }}
//                               onClick={() => document.getElementById('file-upload').click()}
//                             >
//                               <CloudUpload size={36} color="#144ae9" style={{ marginBottom: 12 }} />
//                               <Typography variant="h6" color="text.primary" gutterBottom>
//                                 Click to upload header image
//                               </Typography>
//                               <Typography variant="body2" color="text.secondary">
//                                 Supports JPG, PNG, WebP (Max 95MB)
//                               </Typography>
//                             </Box>
//                           ) : (
//                             <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                                   <ImageIcon size={24} color="#144ae9" />
//                                   <Box>
//                                     <Typography variant="body1" fontWeight={600}>
//                                       {file.name}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                       {(file.size / (1024 * 1024)).toFixed(2)} MB
//                                     </Typography>
//                                   </Box>
//                                 </Box>
//                                 <IconButton
//                                   onClick={removeFile}
//                                   sx={{
//                                     color: '#d32f2f',
//                                     '&:hover': {
//                                       backgroundColor: '#d32f210'
//                                     }
//                                   }}
//                                 >
//                                   <X size={20} />
//                                 </IconButton>
//                               </Box>
                              
//                               <img
//                                 src={preview}
//                                 alt="Preview"
//                                 style={{ 
//                                   maxHeight: '200px', 
//                                   width: '100%', 
//                                   objectFit: 'contain',
//                                   borderRadius: '8px'
//                                 }}
//                               />
//                             </Box>
//                           )}
                          
//                           <input
//                             id="file-upload"
//                             type="file"
//                             accept="image/*"
//                             onChange={handleFileChange}
//                             style={{ display: 'none' }}
//                           />
//                         </>
//                       ) : (
//                         <TextField
//                           label="Header Image URL *"
//                           value={formData.headerImage}
//                           onChange={(e) => handleUrlChange(e.target.value)}
//                           error={!!errors.headerImage}
//                           helperText={errors.headerImage || "Paste direct URL to header image"}
//                           placeholder="https://example.com/district-header.jpg"
//                           startIcon={<LinkIcon size={20} color="#144ae9" />}
//                           fullWidth
//                         />
//                       )}

//                       {errors.headerImage && (
//                         <Typography variant="body2" color="error" sx={{ mt: 1 }}>
//                           {errors.headerImage}
//                         </Typography>
//                       )}
//                     </Box>
//                   )}

//                   {/* SECOND ROW */}
//                   <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                     <TextField
//                       label="Formation Year"
//                       type="number"
//                       value={formData.formationYear}
//                       onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })}
//                       placeholder="1956"
//                       disabled={!isEditing}
//                       startIcon={<Calendar size={20} color="#144ae9" />}
//                       fullWidth
//                     />
//                     <SelectField
//                       label="Status"
//                       value={formData.status}
//                       onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                       options={statusOptions}
//                       disabled={!isEditing}
//                       fullWidth
//                     />
//                   </Box>
//                 </Box>
//               </Card>

//               {/* STATISTICS */}
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//                   Statistics
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Area (sq km)"
//                     type="number"
//                     value={formData.area}
//                     onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//                     placeholder="2772"
//                     disabled={!isEditing}
//                     startIcon={<Maximize size={20} color="#144ae9" />}
//                     fullWidth
//                   />
//                   <TextField
//                     label="Population"
//                     type="number"
//                     value={formData.population}
//                     onChange={(e) => setFormData({ ...formData, population: e.target.value })}
//                     placeholder="2371061"
//                     disabled={!isEditing}
//                     startIcon={<Users size={20} color="#144ae9" />}
//                     fullWidth
//                   />
//                 </Box>
//               </Card>

//               {/* HISTORY & CULTURE */}
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//                   History & Culture
//                 </Typography>
//                 <TextField
//                   multiline
//                   rows={6}
//                   value={formData.historyAndCulture}
//                   onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
//                   placeholder="Write about the district's history, culture, and significance..."
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Card>
//             </Box>
//           </Grid>

//           {/* RIGHT COLUMN - GEOGRAPHY & COORDINATES */}
//           <Grid item xs={12} lg={4}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {/* COORDINATES */}
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//                   <MapPin size={20} color="#144ae9" />
//                   <Typography variant="h5" fontWeight="bold" color="text.primary">
//                     Coordinates *
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                   <TextField
//                     label="Latitude *"
//                     type="number"
//                     step="any"
//                     value={formData.coordinates.lat}
//                     onChange={(e) => setFormData({
//                       ...formData,
//                       coordinates: { ...formData.coordinates, lat: e.target.value }
//                     })}
//                     error={!!errors.lat}
//                     helperText={errors.lat}
//                     placeholder="23.2599"
//                     disabled={!isEditing}
//                     fullWidth
//                   />
//                   <TextField
//                     label="Longitude *"
//                     type="number"
//                     step="any"
//                     value={formData.coordinates.lng}
//                     onChange={(e) => setFormData({
//                       ...formData,
//                       coordinates: { ...formData.coordinates, lng: e.target.value }
//                     })}
//                     error={!!errors.lng}
//                     helperText={errors.lng}
//                     placeholder="77.4126"
//                     disabled={!isEditing}
//                     fullWidth
//                   />
//                 </Box>
//               </Card>

//               {/* GEOGRAPHY */}
//               <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//                   Geography
//                 </Typography>
                
//                 {/* MAJOR RIVERS */}
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                     Major Rivers
//                   </Typography>
//                   {isEditing && (
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <TextField
//                         value={tempInputs.river}
//                         onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })}
//                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))}
//                         placeholder="Betwa"
//                         fullWidth
//                       />
//                       <Button
//                         type="button"
//                         onClick={() => handleAddItem('majorRivers', tempInputs.river)}
//                         sx={{ 
//                           color: 'white',
//                           backgroundColor: '#144ae9',
//                           fontWeight: 'bold',
//                           minWidth: '100px',
//                           '&:hover': {
//                             backgroundColor: '#0d3ec7'
//                           }
//                         }}
//                       >
//                         Add
//                       </Button>
//                     </Box>
//                   )}
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {formData.majorRivers.map((river, index) => (
//                       <Chip
//                         key={index}
//                         label={river}
//                         onDelete={isEditing ? () => handleRemoveItem('majorRivers', index) : undefined}
//                         sx={{
//                           backgroundColor: '#144ae910',
//                           color: '#144ae9',
//                           border: '1px solid #144ae920',
//                           fontWeight: 500,
//                           '& .MuiChip-deleteIcon': {
//                             color: '#144ae9',
//                             '&:hover': {
//                               color: '#0d3ec7'
//                             }
//                           }
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </Box>

//                 {/* HILLS */}
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                     Hills
//                   </Typography>
//                   {isEditing && (
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <TextField
//                         value={tempInputs.hill}
//                         onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })}
//                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))}
//                         placeholder="Vindhyachal"
//                         fullWidth
//                       />
//                       <Button
//                         type="button"
//                         onClick={() => handleAddItem('hills', tempInputs.hill)}
//                         sx={{ 
//                           color: 'white',
//                           backgroundColor: '#144ae9',
//                           fontWeight: 'bold',
//                           minWidth: '100px',
//                           '&:hover': {
//                             backgroundColor: '#0d3ec7'
//                           }
//                         }}
//                       >
//                         Add
//                       </Button>
//                     </Box>
//                   )}
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {formData.hills.map((hill, index) => (
//                       <Chip
//                         key={index}
//                         label={hill}
//                         onDelete={isEditing ? () => handleRemoveItem('hills', index) : undefined}
//                         sx={{
//                           backgroundColor: '#144ae910',
//                           color: '#144ae9',
//                           border: '1px solid #144ae920',
//                           fontWeight: 500,
//                           '& .MuiChip-deleteIcon': {
//                             color: '#144ae9',
//                             '&:hover': {
//                               color: '#0d3ec7'
//                             }
//                           }
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </Box>

//                 {/* NATURAL SPOTS */}
//                 <Box>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                     Natural Spots
//                   </Typography>
//                   {isEditing && (
//                     <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                       <TextField
//                         value={tempInputs.naturalSpot}
//                         onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })}
//                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))}
//                         placeholder="Upper Lake"
//                         fullWidth
//                       />
//                       <Button
//                         type="button"
//                         onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)}
//                         sx={{ 
//                           color: 'white',
//                           backgroundColor: '#144ae9',
//                           fontWeight: 'bold',
//                           minWidth: '100px',
//                           '&:hover': {
//                             backgroundColor: '#0d3ec7'
//                           }
//                         }}
//                       >
//                         Add
//                       </Button>
//                     </Box>
//                   )}
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {formData.naturalSpots.map((spot, index) => (
//                       <Chip
//                         key={index}
//                         label={spot}
//                         onDelete={isEditing ? () => handleRemoveItem('naturalSpots', index) : undefined}
//                         sx={{
//                           backgroundColor: '#144ae910',
//                           color: '#144ae9',
//                           border: '1px solid #144ae920',
//                           fontWeight: 500,
//                           '& .MuiChip-deleteIcon': {
//                             color: '#144ae9',
//                             '&:hover': {
//                               color: '#0d3ec7'
//                             }
//                           }
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </Box>
//               </Card>
//             </Box>
//           </Grid>
//         </Grid>
//       </Box>
//     </Box>
//   );
// }


