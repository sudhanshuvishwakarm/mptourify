'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createPanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice.js';
import { fetchDistricts } from '@/redux/slices/districtSlice.js';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft, Save, MapPin, Image as ImageIcon, CloudUpload,
  Link as LinkIcon, X, Calendar, Users, Maximize
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function CreatePanchayatPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.panchayat);
  const { districts } = useSelector((state) => state.district);

  const [uploadMethod, setUploadMethod] = useState('file');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    headerImage: '',
    district: '',
    block: '',
    coordinates: { lat: '', lng: '' },
    establishmentYear: '',
    historicalBackground: '',
    population: '',
    area: '',
    localArt: '',
    localCuisine: '',
    traditions: '',
    majorRivers: [],
    status: 'pending'
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [tempRiver, setTempRiver] = useState('');

  useEffect(() => {
    dispatch(fetchDistricts({ limit: 100 }));
  }, []);

  useEffect(() => {
    if (success) {
      toast.success('Panchayat created successfully!');
      dispatch(clearSuccess());
      router.push('/admin/panchayats');
    }
    if (error) {
      toast.error(error.message || 'Failed to create panchayat');
      dispatch(clearError());
    }
  }, [success, error]);

  useEffect(() => {
    if (formData.name) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      const maxSize = 50 * 1024 * 1024;
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
    setPreview(null);
    if (uploadMethod === 'url') {
      setFormData(prev => ({ ...prev, headerImage: '' }));
    }
  };

  const handleAddRiver = () => {
    if (!tempRiver.trim()) return;
    setFormData(prev => ({ ...prev, majorRivers: [...prev.majorRivers, tempRiver.trim()] }));
    setTempRiver('');
  };

  const handleRemoveRiver = (index) => {
    setFormData(prev => ({ ...prev, majorRivers: prev.majorRivers.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Panchayat name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.block.trim()) newErrors.block = 'Block is required';
    
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
      toast.error('Please fill all required fields.');
      return;
    }

    if (uploadMethod === 'file' && file) {
      const submitData = new FormData();
      
      submitData.append('headerImage', file);
      submitData.append('uploadMethod', 'file');
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('district', formData.district);
      submitData.append('block', formData.block);
      submitData.append('coordinates[lat]', formData.coordinates.lat);
      submitData.append('coordinates[lng]', formData.coordinates.lng);
      submitData.append('status', formData.status);
      submitData.append('establishmentYear', formData.establishmentYear);
      submitData.append('historicalBackground', formData.historicalBackground);
      submitData.append('population', formData.population);
      submitData.append('area', formData.area);
      submitData.append('localArt', formData.localArt);
      submitData.append('localCuisine', formData.localCuisine);
      submitData.append('traditions', formData.traditions);
      submitData.append('majorRivers', formData.majorRivers.join(','));

      dispatch(createPanchayat(submitData));
    } else {
      dispatch(createPanchayat(formData));
    }
  };

  const districtOptions = [
    { value: '', label: 'Select a district' },
    ...districts.map((district) => ({
      value: district._id,
      label: district.name
    }))
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' }
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {
        loading && <div className="fixed inset-0 z-[9999]">
          <Loader message={"Creating..."} />
        </div>
      }
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/panchayats" className="no-underline">
          <Button 
            variant="outlined" 
            sx={{ 
              minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9',
              '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' }
            }}
          >
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Create New Panchayat</h1>
          <div className="text-sm text-gray-600 mt-1">Add a new gram panchayat to the system</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* BASIC INFO */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Panchayat Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                />
                <TextField
                  label="Slug *"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  error={!!errors.slug}
                  helperText={errors.slug}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { backgroundColor: '#144ae905' } }}
                />
              </div>

              {/* HEADER IMAGE */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
                
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    type="button"
                    onClick={() => { setUploadMethod('file'); setFile(null); setPreview(null); setFormData(prev => ({ ...prev, headerImage: '' })); }}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                      uploadMethod === 'file' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <CloudUpload size={18} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadMethod('url'); setFile(null); setPreview(null); setFormData(prev => ({ ...prev, headerImage: '' })); }}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                      uploadMethod === 'url' 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LinkIcon size={18} />
                    Paste URL
                  </button>
                </div>

                {uploadMethod === 'file' ? (
                  <>
                    {!file ? (
                      <div
                        className="border-2 border-dashed border-blue-600 rounded-lg p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <CloudUpload size={36} className="text-blue-600 mx-auto mb-3" />
                        <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
                        <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 50MB)</div>
                      </div>
                    ) : (
                      <div className="border border-blue-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <ImageIcon size={24} className="text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-900">{file.name}</div>
                              <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                            </div>
                          </div>
                          <Button type="button" onClick={removeFile} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Remove
                          </Button>
                        </div>
                        <img src={preview} alt="Preview" className="max-h-48 w-full object-contain rounded-lg" />
                      </div>
                    )}
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </>
                ) : (
                  <TextField
                    label="Header Image URL *"
                    value={formData.headerImage}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    error={!!errors.headerImage}
                    helperText={errors.headerImage || "Paste direct URL to header image"}
                    placeholder="https://example.com/panchayat-header.jpg"
                    startIcon={<LinkIcon size={20} className="text-blue-600" />}
                    fullWidth
                  />
                )}

                {preview && (uploadMethod === 'url' && formData.headerImage) && (
                  <div className="mt-3 border border-blue-200 rounded-lg p-3 bg-white">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Preview:</div>
                    <img src={preview} alt="URL Preview" className="max-h-32 w-full object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}

                {errors.headerImage && <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="District *"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  options={districtOptions}
                  error={!!errors.district}
                  helperText={errors.district}
                  fullWidth
                />
                <TextField
                  label="Block *"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  error={!!errors.block}
                  helperText={errors.block}
                  placeholder="e.g., Indore Block"
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Establishment Year"
                  type="number"
                  value={formData.establishmentYear}
                  onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value })}
                  placeholder="1952"
                  startIcon={<Calendar size={20} className="text-blue-600" />}
                  fullWidth
                />
                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={statusOptions}
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* STATISTICS */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Population"
                type="number"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                placeholder="5000"
                startIcon={<Users size={20} className="text-blue-600" />}
                fullWidth
              />
              <TextField
                label="Area (sq km)"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="25.5"
                startIcon={<Maximize size={20} className="text-blue-600" />}
                fullWidth
              />
            </div>
          </Card>

          {/* COORDINATES */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Coordinates *</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Latitude *"
                type="number"
                step="any"
                value={formData.coordinates.lat}
                onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })}
                error={!!errors.lat}
                helperText={errors.lat}
                placeholder="22.7196"
                fullWidth
              />
              <TextField
                label="Longitude *"
                type="number"
                step="any"
                value={formData.coordinates.lng}
                onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })}
                error={!!errors.lng}
                helperText={errors.lng}
                placeholder="75.8577"
                fullWidth
              />
            </div>
          </Card>

          {/* GEOGRAPHY */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Geography</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Major Rivers</h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <TextField
                  value={tempRiver}
                  onChange={(e) => setTempRiver(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRiver())}
                  placeholder="Betwa"
                  fullWidth
                />
                <Button type="button" onClick={handleAddRiver} sx={{ backgroundColor: '#144ae9', fontWeight: '600', minWidth: '100px', '&:hover': { backgroundColor: '#0d3ec7' } }}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.majorRivers.map((river, index) => (
                  <div key={index} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-sm font-medium">
                    {river}
                    <button onClick={() => handleRemoveRiver(index)} className="text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-200 p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* CULTURAL INFO */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cultural Information</h2>
            <div className="space-y-4 flex flex-col gap-5">
              <TextField
                label="Historical Background"
                value={formData.historicalBackground}
                onChange={(e) => setFormData({ ...formData, historicalBackground: e.target.value })}
                multiline
                rows={4}
                placeholder="Write about the historical significance..."
                fullWidth
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Local Art"
                  value={formData.localArt}
                  onChange={(e) => setFormData({ ...formData, localArt: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Traditional art forms..."
                  fullWidth
                />
                <TextField
                  label="Local Cuisine"
                  value={formData.localCuisine}
                  onChange={(e) => setFormData({ ...formData, localCuisine: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Traditional dishes..."
                  fullWidth
                />
              </div>
              <TextField
                label="Traditions"
                value={formData.traditions}
                onChange={(e) => setFormData({ ...formData, traditions: e.target.value })}
                multiline
                rows={3}
                placeholder="Cultural traditions..."
                fullWidth
              />
            </div>
          </Card>

          {/* SUBMIT BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={loading}
              startIcon={!loading && <Save size={20} />}
              size="large"
              sx={{ flex: 1, backgroundColor: '#144ae9', fontWeight: 600, '&:hover': { backgroundColor: '#0d3ec7' } }}
            >
              {loading ? 'Creating...' : 'Create Panchayat'}
            </Button>
            <Link href="/admin/panchayats" className="no-underline flex-1">
              <Button variant="outlined" size="large" sx={{ width: '100%', borderColor: '#144ae9', color: '#144ae9', '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' } }}>
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}


// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { createPanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { fetchDistricts } from "@/redux/slices/districtSlice.js"
// import { toast } from "react-toastify"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowLeft, Plus } from "lucide-react"
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import Loader from "@/components/ui/Loader"

// export default function CreatePanchayatPage() {
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { loading, error, success } = useSelector((state) => state.panchayat)
//   const { districts } = useSelector((state) => state.district)

//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     district: "",
//     block: "",
//     coordinates: { lat: "", lng: "" },
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//     status: "pending",
//   })

//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }))
//   }, [])

//   useEffect(() => {
//     if (success) {
//       toast.success("Panchayat created successfully!")
//       dispatch(clearSuccess())
//       router.push("/admin/panchayats")
//     }
//     if (error) {
//       toast.error(error.message || "Something went wrong")
//       dispatch(clearError())
//     }
//   }, [success, error])

//   const handleChange = (e) => {
//     const { name, value } = e.target
    
//     if (name.includes("coordinates")) {
//       const key = name.split(".")[1]
//       setFormData((prev) => ({
//         ...prev,
//         coordinates: { ...prev.coordinates, [key]: parseFloat(value) || value },
//       }))
//     } else {
//       setFormData((prev) => ({ 
//         ...prev, 
//         [name]: name === "population" || name === "establishmentYear" 
//           ? parseInt(value) || value 
//           : value 
//       }))
//     }
//   }

//   const generateSlug = (name) => {
//     return name
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-")
//   }

//   const handleNameChange = (e) => {
//     const name = e.target.value
//     setFormData((prev) => ({
//       ...prev,
//       name,
//       slug: generateSlug(name),
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.name || !formData.district || !formData.block || !formData.coordinates.lat || !formData.coordinates.lng) {
//       toast.error("Please fill all required fields")
//       return
//     }

//     const submitData = {
//       ...formData,
//       coordinates: {
//         lat: parseFloat(formData.coordinates.lat),
//         lng: parseFloat(formData.coordinates.lng)
//       },
//       population: formData.population ? parseInt(formData.population) : undefined,
//       establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
//     }

//     try {
//       await dispatch(createPanchayat(submitData)).unwrap()
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const districtOptions = [
//     { value: "", label: "Select a district" },
//     ...districts.map((district) => ({
//       value: district._id,
//       label: district.name
//     }))
//   ]

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "pending", label: "Pending" },
//     { value: "verified", label: "Verified" }
//   ]

//   return (
//     <div className="p-4 md:p-6 max-w-5xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-6">
//         <Link href="/admin/panchayats" className="no-underline">
//           <Button 
//             variant="outlined" 
//             sx={{ 
//               minWidth: 'auto', 
//               p: 1.5,
//               borderColor: '#144ae9',
//               color: '#144ae9',
//               '&:hover': {
//                 borderColor: '#0d3ec7',
//                 backgroundColor: '#144ae910'
//               }
//             }}
//           >
//             <ArrowLeft size={20} />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
//             Create New Panchayat
//           </h1>
//           <div className="text-sm text-gray-600 mt-1">
//             Add a new gram panchayat to the system
//           </div>
//         </div>
//       </div>

//       {/* Form */}
//       <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
//         <form onSubmit={handleSubmit}>
//           <div className="space-y-6">
//             {/* Basic Information */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Basic Information
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField
//                   label="Panchayat Name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleNameChange}
//                   placeholder="e.g., Gram Panchayat..."
//                   required
//                   fullWidth
//                 />
//                 <TextField
//                   label="Slug"
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleChange}
//                   placeholder="auto-generated-slug"
//                   InputProps={{
//                     readOnly: true,
//                   }}
//                   fullWidth
//                   sx={{
//                     '& .MuiInputBase-input': {
//                       backgroundColor: '#144ae905',
//                     }
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Location Information */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Location Information
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <SelectField
//                   label="District"
//                   name="district"
//                   value={formData.district}
//                   onChange={handleChange}
//                   options={districtOptions}
//                   required
//                   fullWidth
//                 />
//                 <TextField
//                   label="Block"
//                   name="block"
//                   value={formData.block}
//                   onChange={handleChange}
//                   placeholder="e.g., Indore Block"
//                   required
//                   fullWidth
//                 />
//                 <TextField
//                   label="Latitude"
//                   name="coordinates.lat"
//                   type="number"
//                   value={formData.coordinates.lat}
//                   onChange={handleChange}
//                   placeholder="e.g., 22.7196"
//                   inputProps={{ step: "0.0001" }}
//                   required
//                   fullWidth
//                 />
//                 <TextField
//                   label="Longitude"
//                   name="coordinates.lng"
//                   type="number"
//                   value={formData.coordinates.lng}
//                   onChange={handleChange}
//                   placeholder="e.g., 75.8577"
//                   inputProps={{ step: "0.0001" }}
//                   required
//                   fullWidth
//                 />
//               </div>
//             </div>

//             {/* Detailed Information */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Detailed Information
//               </h2>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <TextField
//                     label="Population"
//                     name="population"
//                     type="number"
//                     value={formData.population}
//                     onChange={handleChange}
//                     placeholder="e.g., 5000"
//                     fullWidth
//                   />
//                   <TextField
//                     label="Establishment Year"
//                     name="establishmentYear"
//                     type="number"
//                     value={formData.establishmentYear}
//                     onChange={handleChange}
//                     placeholder="e.g., 1952"
//                     fullWidth
//                   />
//                 </div>
                
//                 {/* Full width fields for larger content */}
//                 <TextField
//                   label="Historical Background"
//                   name="historicalBackground"
//                   value={formData.historicalBackground}
//                   onChange={handleChange}
//                   multiline
//                   rows={4}
//                   placeholder="Write about the historical significance..."
//                   fullWidth
//                 />
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
//                   <TextField
//                     label="Local Art"
//                     name="localArt"
//                     value={formData.localArt}
//                     onChange={handleChange}
//                     multiline
//                     rows={3}
//                     placeholder="Traditional art forms..."
//                     fullWidth
//                   />
//                   <TextField
//                     label="Local Cuisine"
//                     name="localCuisine"
//                     value={formData.localCuisine}
//                     onChange={handleChange}
//                     multiline
//                     rows={3}
//                     placeholder="Traditional dishes and cuisine..."
//                     fullWidth
//                   />
//                 </div>
                
//                 <TextField
//                   label="Traditions"
//                   name="traditions"
//                   value={formData.traditions}
//                   onChange={handleChange}
//                   multiline
//                   rows={3}
//                   placeholder="Cultural traditions..."
//                   fullWidth
//                 />
//               </div>
//             </div>

//             {/* Status */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Status
//               </h2>
//               <div className="max-w-md">
//                 <SelectField
//                   label="Status"
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   options={statusOptions}
//                   fullWidth
//                 />
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="pt-6 border-t border-gray-200">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <Button
//                   type="submit"
//                   disabled={loading}
//                   startIcon={loading ? <Loader size={20} /> : <Plus size={20} />}
//                   size="large"
//                   sx={{ 
//                     flex: 1,
//                     backgroundColor: '#144ae9',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#144ae950'
//                     }
//                   }}
//                 >
//                   {loading ? 'Creating...' : 'Create Panchayat'}
//                 </Button>
//                 <Link href="/admin/panchayats" className="no-underline flex-1">
//                   <Button
//                     variant="outlined"
//                     size="large"
//                     sx={{ 
//                       width: '100%',
//                       borderColor: '#144ae9',
//                       color: '#144ae9',
//                       '&:hover': {
//                         borderColor: '#0d3ec7',
//                         backgroundColor: '#144ae910'
//                       }
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </form>
//       </Card>
//     </div>
//   )
// }
