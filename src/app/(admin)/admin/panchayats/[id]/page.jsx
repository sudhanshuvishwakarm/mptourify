'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft, Save, MapPin, CloudUpload, Link as LinkIcon, X, Edit, Calendar, Users, Maximize
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';

export default function EditPanchayatPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat);
  const { districts } = useSelector((state) => state.district);

  const [isEditing, setIsEditing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', headerImage: '', district: '', block: '',
    coordinates: { lat: '', lng: '' }, establishmentYear: '',
    historicalBackground: '', population: '', area: '', localArt: '',
    localCuisine: '', traditions: '', majorRivers: [], status: 'pending'
  });

  const [errors, setErrors] = useState({});
  const [tempRiver, setTempRiver] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchDistricts({ limit: 100 }));
    if (params.id && (!selectedPanchayat || selectedPanchayat._id !== params.id)) {
      dispatch(fetchPanchayatById(params.id));
    }
  }, [params.id]);

  useEffect(() => {
    if (selectedPanchayat && selectedPanchayat._id === params.id) {
      setFormData({
        name: selectedPanchayat.name || '',
        slug: selectedPanchayat.slug || '',
        headerImage: selectedPanchayat.headerImage || '',
        district: selectedPanchayat.district?._id || '',
        block: selectedPanchayat.block || '',
        coordinates: {
          lat: selectedPanchayat.coordinates?.lat || '',
          lng: selectedPanchayat.coordinates?.lng || ''
        },
        establishmentYear: selectedPanchayat.establishmentYear || '',
        historicalBackground: selectedPanchayat.historicalBackground || '',
        population: selectedPanchayat.population || '',
        area: selectedPanchayat.area || '',
        localArt: selectedPanchayat.localArt || '',
        localCuisine: selectedPanchayat.localCuisine || '',
        traditions: selectedPanchayat.traditions || '',
        majorRivers: selectedPanchayat.majorRivers || [],
        status: selectedPanchayat.status || 'pending'
      });
      setPreview(selectedPanchayat.headerImage || null);
    }
  }, [selectedPanchayat, params.id]);

  useEffect(() => {
    if (success) {
      toast.success('Panchayat updated successfully!');
      dispatch(clearSuccess());
      setIsEditing(false);
      setFile(null);
      setIsSaving(false);
    }
    if (error) {
      toast.error(error.message || 'Failed to update panchayat');
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
    setPreview(formData.headerImage);
    setUploadMethod('url');
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
        await dispatch(updatePanchayat({ id: params.id, panchayatData: submitData })).unwrap();
      } else {
        await dispatch(updatePanchayat({ id: params.id, panchayatData: formData })).unwrap();
      }
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFile(null);
    setUploadMethod('url');
    if (selectedPanchayat) {
      setFormData({
        name: selectedPanchayat.name || '',
        slug: selectedPanchayat.slug || '',
        headerImage: selectedPanchayat.headerImage || '',
        district: selectedPanchayat.district?._id || '',
        block: selectedPanchayat.block || '',
        coordinates: {
          lat: selectedPanchayat.coordinates?.lat || '',
          lng: selectedPanchayat.coordinates?.lng || ''
        },
        establishmentYear: selectedPanchayat.establishmentYear || '',
        historicalBackground: selectedPanchayat.historicalBackground || '',
        population: selectedPanchayat.population || '',
        area: selectedPanchayat.area || '',
        localArt: selectedPanchayat.localArt || '',
        localCuisine: selectedPanchayat.localCuisine || '',
        traditions: selectedPanchayat.traditions || '',
        majorRivers: selectedPanchayat.majorRivers || [],
        status: selectedPanchayat.status || 'pending'
      });
      setPreview(selectedPanchayat.headerImage || null);
    }
    setErrors({});
  };

  const districtOptions = [
    { value: '', label: 'Select a district' },
    ...districts.map((d) => ({ value: d._id, label: d.name }))
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' }
  ];

  if (loading && !selectedPanchayat) return <div className="fixed inset-0 z-[9999]"><Loader message={"Loading..."} /></div>;

  if (!selectedPanchayat) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Panchayat not found</div>
        <Link href="/admin/panchayats" className="no-underline">
          <Button 
            sx={{
              backgroundColor: "#1348e8",
              color: "white",
              "&:hover": { backgroundColor: "#0d3a9d" },
              mt: 2
            }}
          >
            Back to Panchayats
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Saving Loader */}
      {isSaving && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Saving..."} />
        </div>
      )}
      
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/panchayats" className="no-underline">
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: "#1348e8", 
                  color: "#1348e8", 
                  "&:hover": { 
                    borderColor: "#0d3a9d", 
                    backgroundColor: "#1348e810" 
                  },
                  minWidth: "auto",
                  padding: "12px"
                }}
              >
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedPanchayat.name}</h1>
              <div className="text-sm text-gray-600 mt-1">{isEditing ? 'Edit panchayat details' : 'View panchayat details'}</div>
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
                textTransform: "none", 
                fontSize: { xs: "0.875rem", sm: "1rem" }
              }}
            >
              Edit Panchayat
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleCancel} 
                variant="outlined"
                sx={{
                  borderColor: "#6b7280",
                  color: "#374151",
                  "&:hover": {
                    borderColor: "#374151",
                    backgroundColor: "#f9fafb",
                  },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || isSaving} 
                startIcon={<Save size={20} />}
                sx={{
                  backgroundColor: "#1348e8",
                  color: "white",
                  "&:hover": { backgroundColor: "#0d3a9d" },
                  "&:disabled": { backgroundColor: "#9ca3af" },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col xl:flex-row gap-6 mb-6">
            {/* Image Section */}
            <div className="w-full xl:w-[70%]">
              <div className="border border-[#1348e820] overflow-hidden bg-white h-full rounded-lg">
                <div className="relative bg-[#1348e805] p-0 h-full">
                  <div className="flex justify-center items-center h-full">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt={selectedPanchayat.name} 
                        className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg"
                        style={{ maxHeight: isEditing ? '400px' : 'none' }}
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-16">
                        <div>No header image set</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Geography Section */}
            <div className="w-full xl:w-[30%]">
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white",
                  height: "100%"
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Geography</h3>
                
                {/* Major Rivers */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-[#1348e8]" />
                    <h4 className="font-semibold text-gray-900">Major Rivers</h4>
                  </div>
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <TextField 
                        value={tempRiver} 
                        onChange={(e) => setTempRiver(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRiver())}
                        placeholder="Betwa" 
                        fullWidth 
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddRiver}
                        sx={{
                          backgroundColor: "#1348e8",
                          color: "white",
                          "&:hover": { backgroundColor: "#0d3a9d" },
                          fontWeight: "600",
                          minWidth: "80px"
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.majorRivers.map((river, index) => (
                      <div key={index} className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium">
                        {river}
                        {isEditing && (
                          <button onClick={() => handleRemoveRiver(index)} className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Basic Information and Statistics */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="w-full lg:w-[70%]">
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <TextField label="Panchayat Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={errors.name} helperText={errors.name} disabled={!isEditing || isSaving} fullWidth />
                    <TextField label="Slug *" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} error={errors.slug} helperText={errors.slug} disabled={!isEditing || isSaving} fullWidth />
                  </div>

                  {/* Header Image Upload */}
                  {isEditing && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
                      <div className="flex border-b border-gray-200 mb-4">
                        <button 
                          type="button" 
                          onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }} 
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'url' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <LinkIcon size={18} />Use URL
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setUploadMethod('file')} 
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'file' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <CloudUpload size={18} />Upload File
                        </button>
                      </div>

                      {uploadMethod === 'file' ? (
                        <>
                          {!file ? (
                            <div 
                              className={`border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={isSaving ? undefined : () => document.getElementById('file-upload').click()}
                            >
                              <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
                              <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
                              <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 50MB)</div>
                            </div>
                          ) : (
                            <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-semibold text-gray-900">{file.name}</div>
                                    <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                  </div>
                                </div>
                                <button 
                                  onClick={removeFile} 
                                  disabled={isSaving}
                                  className={`text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <X size={20} />
                                </button>
                              </div>
                              <div className="flex justify-center">
                                {preview && (
                                  <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="w-full h-48 object-contain rounded-lg" 
                                  />
                                )}
                              </div>
                            </div>
                          )}
                          <input 
                            id="file-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            disabled={isSaving}
                            className="hidden" 
                          />
                        </>
                      ) : (
                        <TextField 
                          label="Header Image URL *" 
                          value={formData.headerImage} 
                          onChange={(e) => handleUrlChange(e.target.value)} 
                          error={errors.headerImage} 
                          helperText={errors.headerImage || "Paste direct URL to header image"} 
                          placeholder="https://example.com/panchayat-header.jpg" 
                          startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} 
                          disabled={!isEditing || isSaving}
                          fullWidth 
                        />
                      )}
                      {errors.headerImage && <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-4">
                    <SelectField label="District *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} options={districtOptions} error={errors.district} helperText={errors.district} disabled={!isEditing || isSaving} fullWidth />
                    <TextField label="Block *" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} error={errors.block} helperText={errors.block} disabled={!isEditing || isSaving} fullWidth />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <TextField label="Establishment Year" type="number" value={formData.establishmentYear} onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value })} placeholder="1972" disabled={!isEditing || isSaving} startIcon={<Calendar size={20} className="text-[#1348e8]" />} fullWidth />
                    <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={statusOptions} disabled={!isEditing || isSaving} fullWidth />
                  </div>
                </div>
              </Card>
            </div>

            {/* Statistics */}
            <div className="w-full lg:w-[30%]">
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
                <div className="flex flex-col gap-4">
                  <TextField label="Population" type="number" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} placeholder="5000" disabled={!isEditing || isSaving} startIcon={<Users size={20} className="text-[#1348e8]" />} fullWidth />
                  <TextField label="Area (sq km)" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="25.5" disabled={!isEditing || isSaving} startIcon={<Maximize size={20} className="text-[#1348e8]" />} fullWidth />
                </div>
              </Card>
            </div>
          </div>

          {/* Coordinates */}
          <Card 
            sx={{ 
              p: 3, 
              my: 3, 
              border: "1px solid", 
              borderColor: "#1348e820", 
              backgroundColor: "white"
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-[#1348e8]" />
              <h3 className="text-lg font-semibold text-gray-900">Coordinates *</h3>
            </div>
            <div className="flex gap-3">
              <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} error={errors.lat} helperText={errors.lat} placeholder="22.7196" disabled={!isEditing || isSaving} fullWidth />
              <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} error={errors.lng} helperText={errors.lng} placeholder="75.8577" disabled={!isEditing || isSaving} fullWidth />
            </div>
          </Card>

          {/* Cultural Information */}
          <div className="mb-6">
            <Card 
              sx={{ 
                p: 3, 
                border: "1px solid", 
                borderColor: "#1348e820", 
                backgroundColor: "white"
              }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cultural Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Historical Background
                  </label>
                  <textarea 
                    value={formData.historicalBackground} 
                    onChange={(e) => setFormData({ ...formData, historicalBackground: e.target.value })} 
                    placeholder="Write about the historical significance..." 
                    disabled={!isEditing || isSaving} 
                    rows={6} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Traditional Art Forms
                    </label>
                    <textarea 
                      value={formData.localArt} 
                      onChange={(e) => setFormData({ ...formData, localArt: e.target.value })} 
                      placeholder="Traditional art forms..." 
                      disabled={!isEditing || isSaving} 
                      rows={4} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Traditional Cuisine
                    </label>
                    <textarea 
                      value={formData.localCuisine} 
                      onChange={(e) => setFormData({ ...formData, localCuisine: e.target.value })} 
                      placeholder="Traditional dishes..." 
                      disabled={!isEditing || isSaving} 
                      rows={4} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Traditions
                  </label>
                  <textarea 
                    value={formData.traditions} 
                    onChange={(e) => setFormData({ ...formData, traditions: e.target.value })} 
                    placeholder="Cultural traditions..." 
                    disabled={!isEditing || isSaving} 
                    rows={4} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
                  />
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </>
  );
}// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft, Save, MapPin, CloudUpload, Link as LinkIcon, X, Edit, Calendar, Users, Maximize
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';

// export default function EditPanchayatPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);

//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadMethod, setUploadMethod] = useState('url');
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '', slug: '', headerImage: '', district: '', block: '',
//     coordinates: { lat: '', lng: '' }, establishmentYear: '',
//     historicalBackground: '', population: '', area: '', localArt: '',
//     localCuisine: '', traditions: '', majorRivers: [], status: 'pending'
//   });

//   const [errors, setErrors] = useState({});
//   const [tempRiver, setTempRiver] = useState('');

//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }));
//     if (params.id && (!selectedPanchayat || selectedPanchayat._id !== params.id)) {
//       dispatch(fetchPanchayatById(params.id));
//     }
//   }, [params.id]);

//   useEffect(() => {
//     if (selectedPanchayat && selectedPanchayat._id === params.id) {
//       setFormData({
//         name: selectedPanchayat.name || '',
//         slug: selectedPanchayat.slug || '',
//         headerImage: selectedPanchayat.headerImage || '',
//         district: selectedPanchayat.district?._id || '',
//         block: selectedPanchayat.block || '',
//         coordinates: {
//           lat: selectedPanchayat.coordinates?.lat || '',
//           lng: selectedPanchayat.coordinates?.lng || ''
//         },
//         establishmentYear: selectedPanchayat.establishmentYear || '',
//         historicalBackground: selectedPanchayat.historicalBackground || '',
//         population: selectedPanchayat.population || '',
//         area: selectedPanchayat.area || '',
//         localArt: selectedPanchayat.localArt || '',
//         localCuisine: selectedPanchayat.localCuisine || '',
//         traditions: selectedPanchayat.traditions || '',
//         majorRivers: selectedPanchayat.majorRivers || [],
//         status: selectedPanchayat.status || 'pending'
//       });
//       setPreview(selectedPanchayat.headerImage || null);
//     }
//   }, [selectedPanchayat, params.id]);

//   useEffect(() => {
//     if (success) {
//       toast.success('Panchayat updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       setFile(null);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update panchayat');
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

//       const maxSize = 50 * 1024 * 1024;
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

//   const handleAddRiver = () => {
//     if (!tempRiver.trim()) return;
//     setFormData(prev => ({ ...prev, majorRivers: [...prev.majorRivers, tempRiver.trim()] }));
//     setTempRiver('');
//   };

//   const handleRemoveRiver = (index) => {
//     setFormData(prev => ({ ...prev, majorRivers: prev.majorRivers.filter((_, i) => i !== index) }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'Panchayat name is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (!formData.district) newErrors.district = 'District is required';
//     if (!formData.block.trim()) newErrors.block = 'Block is required';
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
//         submitData.append('district', formData.district);
//         submitData.append('block', formData.block);
//         submitData.append('coordinates[lat]', formData.coordinates.lat);
//         submitData.append('coordinates[lng]', formData.coordinates.lng);
//         submitData.append('status', formData.status);
//         submitData.append('establishmentYear', formData.establishmentYear);
//         submitData.append('historicalBackground', formData.historicalBackground);
//         submitData.append('population', formData.population);
//         submitData.append('area', formData.area);
//         submitData.append('localArt', formData.localArt);
//         submitData.append('localCuisine', formData.localCuisine);
//         submitData.append('traditions', formData.traditions);
//         submitData.append('majorRivers', formData.majorRivers.join(','));
//         await dispatch(updatePanchayat({ id: params.id, panchayatData: submitData })).unwrap();
//       } else {
//         await dispatch(updatePanchayat({ id: params.id, panchayatData: formData })).unwrap();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setFile(null);
//     setUploadMethod('url');
//     if (selectedPanchayat) {
//       setFormData({
//         name: selectedPanchayat.name || '',
//         slug: selectedPanchayat.slug || '',
//         headerImage: selectedPanchayat.headerImage || '',
//         district: selectedPanchayat.district?._id || '',
//         block: selectedPanchayat.block || '',
//         coordinates: {
//           lat: selectedPanchayat.coordinates?.lat || '',
//           lng: selectedPanchayat.coordinates?.lng || ''
//         },
//         establishmentYear: selectedPanchayat.establishmentYear || '',
//         historicalBackground: selectedPanchayat.historicalBackground || '',
//         population: selectedPanchayat.population || '',
//         area: selectedPanchayat.area || '',
//         localArt: selectedPanchayat.localArt || '',
//         localCuisine: selectedPanchayat.localCuisine || '',
//         traditions: selectedPanchayat.traditions || '',
//         majorRivers: selectedPanchayat.majorRivers || [],
//         status: selectedPanchayat.status || 'pending'
//       });
//       setPreview(selectedPanchayat.headerImage || null);
//     }
//     setErrors({});
//   };

//   const districtOptions = [
//     { value: '', label: 'Select a district' },
//     ...districts.map((d) => ({ value: d._id, label: d.name }))
//   ];

//   const statusOptions = [
//     { value: 'draft', label: 'Draft' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'verified', label: 'Verified' }
//   ];

//   if (loading && !selectedPanchayat) return <div className="fixed inset-0 z-[9999]"><Loader message={"Loading..."} /></div>;

//   if (!selectedPanchayat) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-gray-600 mb-4">Panchayat not found</div>
//         <Link href="/admin/panchayats" className="no-underline">
//           <Button className="mt-2 text-[#1348e8]">Back to Panchayats</Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-4">
//           <Link href="/admin/panchayats" className="no-underline">
//             <Button variant="outlined" sx={{ borderColor: "#1348e8", color: "#1348e8", "&:hover": { borderColor: "#0d3a9d", backgroundColor: "#1348e810" }}} className="!min-w-auto !p-3">
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedPanchayat.name}</h1>
//             <div className="text-sm text-gray-600 mt-1">{isEditing ? 'Edit panchayat details' : 'View panchayat details'}</div>
//           </div>
//         </div>
        
//         {!isEditing ? (
//           <Button onClick={() => setIsEditing(true)} startIcon={<Edit size={20} />} sx={{ backgroundColor: "#1348e8", color: "white", "&:hover": { backgroundColor: "#0d3a9d" }, textTransform: "none", fontSize: { xs: "0.875rem", sm: "1rem" }}}>
//             Edit Panchayat
//           </Button>
//         ) : (
//           <div className="flex gap-2">
//             <Button onClick={handleCancel} variant="outlined" className="border-gray-500 text-gray-600 hover:border-gray-700 hover:bg-gray-50 text-sm sm:text-base">
//               Cancel
//             </Button>
//             <Button onClick={handleSubmit} disabled={loading} startIcon={<Save size={20} />} className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] text-sm sm:text-base">
//               {loading ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="flex flex-col xl:flex-row gap-6 mb-6">
//           {/* Image Section */}
//           <div className="w-full xl:w-[70%]">
//             <div className="border border-[#1348e820] overflow-hidden bg-white h-full">
//               <div className="relative bg-[#1348e805] p-0 h-full">
//                 <div className="flex justify-center items-center h-full">
//                   {preview ? (
//                     <img src={preview} alt={selectedPanchayat.name} className="w-full max-w-4xl h-full object-cover rounded-lg shadow-lg" />
//                   ) : (
//                     <div className="text-center text-gray-500 py-16">
//                       <div>No header image set</div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Geography Section */}
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
//                       value={tempRiver} 
//                       onChange={(e) => setTempRiver(e.target.value)} 
//                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRiver())}
//                       placeholder="Betwa" 
//                       fullWidth 
//                     />
//                     <Button type="button" onClick={handleAddRiver} className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] font-semibold min-w-20">
//                       Add
//                     </Button>
//                   </div>
//                 )}
//                 <div className="flex flex-wrap gap-2">
//                   {formData.majorRivers.map((river, index) => (
//                     <div key={index} className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium">
//                       {river}
//                       {isEditing && (
//                         <button onClick={() => handleRemoveRiver(index)} className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5">
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

//         {/* Basic Information and Statistics */}
//         <div className="flex flex-col lg:flex-row gap-6 mb-6">
//           <div className="w-full lg:w-[70%]">
//             <Card className="p-6 border border-[#1348e820] bg-white">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
//               <div className="flex flex-col gap-4">
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <TextField label="Panchayat Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={errors.name} helperText={errors.name} disabled={!isEditing} fullWidth />
//                   <TextField label="Slug *" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} error={errors.slug} helperText={errors.slug} disabled={!isEditing} fullWidth />
//                 </div>

//                 {/* Header Image Upload */}
//                 {isEditing && (
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
//                     <div className="flex border-b border-gray-200 mb-4">
//                       <button type="button" onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'url' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//                         <LinkIcon size={18} />Use URL
//                       </button>
//                       <button type="button" onClick={() => setUploadMethod('file')} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'file' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//                         <CloudUpload size={18} />Upload File
//                       </button>
//                     </div>

//                     {uploadMethod === 'file' ? (
//                       <>
//                         {!file ? (
//                           <div className="border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors" onClick={() => document.getElementById('file-upload').click()}>
//                             <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
//                             <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
//                             <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 50MB)</div>
//                           </div>
//                         ) : (
//                           <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="flex items-center gap-3">
//                                 <div>
//                                   <div className="font-semibold text-gray-900">{file.name}</div>
//                                   <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
//                                 </div>
//                               </div>
//                               <button onClick={removeFile} className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50">
//                                 <X size={20} />
//                               </button>
//                             </div>
//                           <div className="flex justify-center">
//   {preview && (
//     <img 
//       src={preview} 
//       alt="Preview" 
//       className="w-full max-h-48 object-contain rounded-lg" 
//     />
//   )}
// </div>
//                           </div>
//                         )}
//                         <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
//                       </>
//                     ) : (
//                       <TextField label="Header Image URL *" value={formData.headerImage} onChange={(e) => handleUrlChange(e.target.value)} error={errors.headerImage} helperText={errors.headerImage || "Paste direct URL to header image"} placeholder="https://example.com/panchayat-header.jpg" startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} fullWidth />
//                     )}
//                     {errors.headerImage && <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>}
//                   </div>
//                 )}

//                 <div className="flex flex-col md:flex-row gap-4">
//                   <SelectField label="District *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} options={districtOptions} disabled={!isEditing} fullWidth />
//                   <TextField label="Block *" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} disabled={!isEditing} fullWidth />
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-4">
//                   <TextField label="Establishment Year" type="number" value={formData.establishmentYear} onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value })} placeholder="1972" disabled={!isEditing} startIcon={<Calendar size={20} className="text-[#1348e8]" />} fullWidth />
//                   <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={statusOptions} disabled={!isEditing} fullWidth />
//                 </div>
//               </div>
//             </Card>
//           </div>

//           {/* Statistics */}
//           <div className="w-full lg:w-[40%]">
//             <Card className="p-6 border border-[#1348e820] bg-white">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
//               <div className="flex flex-col gap-4">
//                 <TextField label="Population" type="number" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} placeholder="5000" disabled={!isEditing} startIcon={<Users size={20} className="text-[#1348e8]" />} fullWidth />
//                 <TextField label="Area (sq km)" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="25.5" disabled={!isEditing} startIcon={<Maximize size={20} className="text-[#1348e8]" />} fullWidth />
//               </div>
//             </Card>
//           </div>
//         </div>

//         {/* Coordinates */}
//         <Card className="p-6 my-5 border border-[#1348e820] bg-white">
//           <div className="flex items-center gap-2 mb-4">
//             <MapPin size={20} className="text-[#1348e8]" />
//             <h3 className="text-lg font-semibold text-gray-900">Coordinates *</h3>
//           </div>
//           <div className="flex gap-3">
//             <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} error={errors.lat} helperText={errors.lat} placeholder="22.7196" disabled={!isEditing} fullWidth />
//             <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} error={errors.lng} helperText={errors.lng} placeholder="75.8577" disabled={!isEditing} fullWidth />
//           </div>
//         </Card>

//         {/* Cultural Information */}
//         <div className="mb-6">
//           <Card className="p-6 border border-[#1348e820] bg-white">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Cultural Information</h2>
//             <div className="space-y-4">
//               <textarea value={formData.historicalBackground} onChange={(e) => setFormData({ ...formData, historicalBackground: e.target.value })} placeholder="Write about the historical significance..." disabled={!isEditing} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <textarea value={formData.localArt} onChange={(e) => setFormData({ ...formData, localArt: e.target.value })} placeholder="Traditional art forms..." disabled={!isEditing} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//                 <textarea value={formData.localCuisine} onChange={(e) => setFormData({ ...formData, localCuisine: e.target.value })} placeholder="Traditional dishes..." disabled={!isEditing} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//               </div>
//               <textarea value={formData.traditions} onChange={(e) => setFormData({ ...formData, traditions: e.target.value })} placeholder="Cultural traditions..." disabled={!isEditing} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//             </div>
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
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft, Save, MapPin, CloudUpload, Link as LinkIcon, X, Edit, Calendar, Users, Maximize
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';

// export default function EditPanchayatPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);

//   const [isEditing, setIsEditing] = useState(false);
//   const [uploadMethod, setUploadMethod] = useState('url');
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '', slug: '', headerImage: '', district: '', block: '',
//     coordinates: { lat: '', lng: '' }, establishmentYear: '',
//     historicalBackground: '', population: '', area: '', localArt: '',
//     localCuisine: '', traditions: '', majorRivers: [], status: 'pending'
//   });

//   const [errors, setErrors] = useState({});
//   const [tempRiver, setTempRiver] = useState('');

//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }));
//     if (params.id && (!selectedPanchayat || selectedPanchayat._id !== params.id)) {
//       dispatch(fetchPanchayatById(params.id));
//     }
//   }, [params.id]);

//   useEffect(() => {
//     if (selectedPanchayat && selectedPanchayat._id === params.id) {
//       setFormData({
//         name: selectedPanchayat.name || '',
//         slug: selectedPanchayat.slug || '',
//         headerImage: selectedPanchayat.headerImage || '',
//         district: selectedPanchayat.district?._id || '',
//         block: selectedPanchayat.block || '',
//         coordinates: {
//           lat: selectedPanchayat.coordinates?.lat || '',
//           lng: selectedPanchayat.coordinates?.lng || ''
//         },
//         establishmentYear: selectedPanchayat.establishmentYear || '',
//         historicalBackground: selectedPanchayat.historicalBackground || '',
//         population: selectedPanchayat.population || '',
//         area: selectedPanchayat.area || '',
//         localArt: selectedPanchayat.localArt || '',
//         localCuisine: selectedPanchayat.localCuisine || '',
//         traditions: selectedPanchayat.traditions || '',
//         majorRivers: selectedPanchayat.majorRivers || [],
//         status: selectedPanchayat.status || 'pending'
//       });
//       setPreview(selectedPanchayat.headerImage || null);
//     }
//   }, [selectedPanchayat, params.id]);

//   useEffect(() => {
//     if (success) {
//       toast.success('Panchayat updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       setFile(null);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update panchayat');
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

//       const maxSize = 50 * 1024 * 1024;
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

//   const handleAddRiver = () => {
//     if (!tempRiver.trim()) return;
//     setFormData(prev => ({ ...prev, majorRivers: [...prev.majorRivers, tempRiver.trim()] }));
//     setTempRiver('');
//   };

//   const handleRemoveRiver = (index) => {
//     setFormData(prev => ({ ...prev, majorRivers: prev.majorRivers.filter((_, i) => i !== index) }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'Panchayat name is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (!formData.district) newErrors.district = 'District is required';
//     if (!formData.block.trim()) newErrors.block = 'Block is required';
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
//         submitData.append('district', formData.district);
//         submitData.append('block', formData.block);
//         submitData.append('coordinates[lat]', formData.coordinates.lat);
//         submitData.append('coordinates[lng]', formData.coordinates.lng);
//         submitData.append('status', formData.status);
//         submitData.append('establishmentYear', formData.establishmentYear);
//         submitData.append('historicalBackground', formData.historicalBackground);
//         submitData.append('population', formData.population);
//         submitData.append('area', formData.area);
//         submitData.append('localArt', formData.localArt);
//         submitData.append('localCuisine', formData.localCuisine);
//         submitData.append('traditions', formData.traditions);
//         submitData.append('majorRivers', formData.majorRivers.join(','));
//         await dispatch(updatePanchayat({ id: params.id, panchayatData: submitData })).unwrap();
//       } else {
//         await dispatch(updatePanchayat({ id: params.id, panchayatData: formData })).unwrap();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setFile(null);
//     setUploadMethod('url');
//     if (selectedPanchayat) {
//       setFormData({
//         name: selectedPanchayat.name || '',
//         slug: selectedPanchayat.slug || '',
//         headerImage: selectedPanchayat.headerImage || '',
//         district: selectedPanchayat.district?._id || '',
//         block: selectedPanchayat.block || '',
//         coordinates: {
//           lat: selectedPanchayat.coordinates?.lat || '',
//           lng: selectedPanchayat.coordinates?.lng || ''
//         },
//         establishmentYear: selectedPanchayat.establishmentYear || '',
//         historicalBackground: selectedPanchayat.historicalBackground || '',
//         population: selectedPanchayat.population || '',
//         area: selectedPanchayat.area || '',
//         localArt: selectedPanchayat.localArt || '',
//         localCuisine: selectedPanchayat.localCuisine || '',
//         traditions: selectedPanchayat.traditions || '',
//         majorRivers: selectedPanchayat.majorRivers || [],
//         status: selectedPanchayat.status || 'pending'
//       });
//       setPreview(selectedPanchayat.headerImage || null);
//     }
//     setErrors({});
//   };

//   const districtOptions = [
//     { value: '', label: 'Select a district' },
//     ...districts.map((d) => ({ value: d._id, label: d.name }))
//   ];

//   const statusOptions = [
//     { value: 'draft', label: 'Draft' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'verified', label: 'Verified' }
//   ];

//   if (loading && !selectedPanchayat) return <div className="fixed inset-0 z-[9999]"><Loader message={"Loading..."} /></div>;

//   if (!selectedPanchayat) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-gray-600 mb-4">Panchayat not found</div>
//         <Link href="/admin/panchayats" className="no-underline">
//           <Button className="mt-2 text-[#1348e8]">Back to Panchayats</Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-4">
//           <Link href="/admin/panchayats" className="no-underline">
//             <Button variant="outlined" sx={{ borderColor: "#1348e8", color: "#1348e8", "&:hover": { borderColor: "#0d3a9d", backgroundColor: "#1348e810" }}} className="!min-w-auto !p-3">
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedPanchayat.name}</h1>
//             <div className="text-sm text-gray-600 mt-1">{isEditing ? 'Edit panchayat details' : 'View panchayat details'}</div>
//           </div>
//         </div>
        
//         {!isEditing ? (
//           <Button onClick={() => setIsEditing(true)} startIcon={<Edit size={20} />} sx={{ backgroundColor: "#1348e8", color: "white", "&:hover": { backgroundColor: "#0d3a9d" }, textTransform: "none", fontSize: { xs: "0.875rem", sm: "1rem" }}}>
//             Edit Panchayat
//           </Button>
//         ) : (
//           <div className="flex gap-2">
//             <Button onClick={handleCancel} variant="outlined" className="border-gray-500 text-gray-600 hover:border-gray-700 hover:bg-gray-50 text-sm sm:text-base">
//               Cancel
//             </Button>
//             <Button onClick={handleSubmit} disabled={loading} startIcon={<Save size={20} />} className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] text-sm sm:text-base">
//               {loading ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="flex flex-col xl:flex-row gap-6 mb-6">
//           {/* Image Section */}
//           <div className="w-full xl:w-[70%]">
//             <div className="border border-[#1348e820] overflow-hidden bg-white h-full">
//               <div className="relative bg-[#1348e805] p-0 h-full">
//                 <div className="flex justify-center items-center h-full">
//                   {preview ? (
//                     <img src={preview} alt={selectedPanchayat.name} className="w-full max-w-4xl h-full object-cover rounded-lg shadow-lg" />
//                   ) : (
//                     <div className="text-center text-gray-500 py-16">
//                       <div>No header image set</div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Geography Section */}
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
//                       value={tempRiver} 
//                       onChange={(e) => setTempRiver(e.target.value)} 
//                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRiver())}
//                       placeholder="Betwa" 
//                       fullWidth 
//                     />
//                     <Button type="button" onClick={handleAddRiver} className="bg-[#1348e8] text-white hover:bg-[#0d3a9d] font-semibold min-w-20">
//                       Add
//                     </Button>
//                   </div>
//                 )}
//                 <div className="flex flex-wrap gap-2">
//                   {formData.majorRivers.map((river, index) => (
//                     <div key={index} className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium">
//                       {river}
//                       {isEditing && (
//                         <button onClick={() => handleRemoveRiver(index)} className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5">
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

//         {/* Basic Information and Statistics */}
//         <div className="flex flex-col lg:flex-row gap-6 mb-6">
//           <div className="w-full lg:w-[70%]">
//             <Card className="p-6 border border-[#1348e820] bg-white">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
//               <div className="flex flex-col gap-4">
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <TextField label="Panchayat Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={errors.name} helperText={errors.name} disabled={!isEditing} fullWidth />
//                   <TextField label="Slug *" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} error={errors.slug} helperText={errors.slug} disabled={!isEditing} fullWidth />
//                 </div>

//                 {/* Header Image Upload */}
//                 {isEditing && (
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
//                     <div className="flex border-b border-gray-200 mb-4">
//                       <button type="button" onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'url' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//                         <LinkIcon size={18} />Use URL
//                       </button>
//                       <button type="button" onClick={() => setUploadMethod('file')} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'file' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//                         <CloudUpload size={18} />Upload File
//                       </button>
//                     </div>

//                     {uploadMethod === 'file' ? (
//                       <>
//                         {!file ? (
//                           <div className="border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors" onClick={() => document.getElementById('file-upload').click()}>
//                             <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
//                             <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
//                             <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 50MB)</div>
//                           </div>
//                         ) : (
//                           <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="flex items-center gap-3">
//                                 <div>
//                                   <div className="font-semibold text-gray-900">{file.name}</div>
//                                   <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
//                                 </div>
//                               </div>
//                               <button onClick={removeFile} className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50">
//                                 <X size={20} />
//                               </button>
//                             </div>
//                             <div className="flex justify-center">
//                               <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
//                             </div>
//                           </div>
//                         )}
//                         <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
//                       </>
//                     ) : (
//                       <TextField label="Header Image URL *" value={formData.headerImage} onChange={(e) => handleUrlChange(e.target.value)} error={errors.headerImage} helperText={errors.headerImage || "Paste direct URL to header image"} placeholder="https://example.com/panchayat-header.jpg" startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} fullWidth />
//                     )}
//                     {errors.headerImage && <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>}
//                   </div>
//                 )}

//                 <div className="flex flex-col md:flex-row gap-4">
//                   <SelectField label="District *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} options={districtOptions} disabled={!isEditing} fullWidth />
//                   <TextField label="Block *" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} disabled={!isEditing} fullWidth />
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-4">
//                   <TextField label="Establishment Year" type="number" value={formData.establishmentYear} onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value })} placeholder="1972" disabled={!isEditing} startIcon={<Calendar size={20} className="text-[#1348e8]" />} fullWidth />
//                   <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={statusOptions} disabled={!isEditing} fullWidth />
//                 </div>
//               </div>
//             </Card>
//           </div>

//           {/* Statistics */}
//           <div className="w-full lg:w-[40%]">
//             <Card className="p-6 border border-[#1348e820] bg-white">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
//               <div className="flex flex-col gap-4">
//                 <TextField label="Population" type="number" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} placeholder="5000" disabled={!isEditing} startIcon={<Users size={20} className="text-[#1348e8]" />} fullWidth />
//                 <TextField label="Area (sq km)" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="25.5" disabled={!isEditing} startIcon={<Maximize size={20} className="text-[#1348e8]" />} fullWidth />
//               </div>
//             </Card>
//           </div>
//         </div>

//         {/* Coordinates */}
//         <Card className="p-6 my-5 border border-[#1348e820] bg-white">
//           <div className="flex items-center gap-2 mb-4">
//             <MapPin size={20} className="text-[#1348e8]" />
//             <h3 className="text-lg font-semibold text-gray-900">Coordinates *</h3>
//           </div>
//           <div className="flex gap-3">
//             <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} error={errors.lat} helperText={errors.lat} placeholder="22.7196" disabled={!isEditing} fullWidth />
//             <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} error={errors.lng} helperText={errors.lng} placeholder="75.8577" disabled={!isEditing} fullWidth />
//           </div>
//         </Card>

//         {/* Cultural Information */}
//         <div className="mb-6">
//           <Card className="p-6 border border-[#1348e820] bg-white">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Cultural Information</h2>
//             <div className="space-y-4">
//               <textarea value={formData.historicalBackground} onChange={(e) => setFormData({ ...formData, historicalBackground: e.target.value })} placeholder="Write about the historical significance..." disabled={!isEditing} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <textarea value={formData.localArt} onChange={(e) => setFormData({ ...formData, localArt: e.target.value })} placeholder="Traditional art forms..." disabled={!isEditing} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//                 <textarea value={formData.localCuisine} onChange={(e) => setFormData({ ...formData, localCuisine: e.target.value })} placeholder="Traditional dishes..." disabled={!isEditing} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//               </div>
//               <textarea value={formData.traditions} onChange={(e) => setFormData({ ...formData, traditions: e.target.value })} placeholder="Cultural traditions..." disabled={!isEditing} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" />
//             </div>
//           </Card>
//         </div>
//       </form>
//     </div>
//   );
// }


// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { 
//   ArrowLeft, 
//   Save, 
//   Edit, 
//   User, 
//   Calendar,
//   MapPin,
//   FileText,
//   AlertCircle
// } from "lucide-react"
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import StatusChip from "@/components/ui/StatusChip"
// import Loader from "@/components/ui/Loader"

// export default function PanchayatDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     block: "",
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     status: "pending",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//   })

//   const [errors, setErrors] = useState({})

//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchPanchayatById(params.id))
//       setDataLoaded(true)
//     }
//   }, [params.id, dataLoaded, dispatch])

//   useEffect(() => {
//     if (selectedPanchayat && selectedPanchayat._id === params.id) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//   }, [selectedPanchayat, params.id])

//   useEffect(() => {
//     if (success && isSaving) {
//       toast.success("Panchayat updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setTimeout(() => {
//         dispatch(fetchPanchayatById(params.id))
//       }, 500)
//     }
//     if (error && isSaving) {
//       toast.error(error.message || "Failed to update panchayat")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, isSaving, dispatch, params.id])

//   const validateForm = () => {
//     const newErrors = {}
//     if (!formData.name.trim()) newErrors.name = "Panchayat name is required"
//     if (!formData.slug.trim()) newErrors.slug = "Slug is required"
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleCancel = () => {
//     setIsEditing(false)
//     if (selectedPanchayat) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//     setErrors({})
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) {
//       toast.error("Please fix all errors")
//       return
//     }
//     try {
//       setIsSaving(true)

//       const formattedData = {
//         ...formData,
//         population: formData.population ? parseInt(formData.population) : undefined,
//         establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
//       }

//       await dispatch(updatePanchayat({ id: params.id, panchayatData: formattedData })).unwrap()
//       setIsSaving(false)
//     } catch (err) {
//       console.log("Error object:", err)
//       const errorMessage =
//         err?.message || err?.error?.message || (typeof err === "string" ? err : "Failed to update panchayat")

//       toast.error(errorMessage)
//       setIsSaving(false)
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     } catch {
//       return "N/A"
//     }
//   }

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "pending", label: "Pending" },
//     { value: "verified", label: "Verified" }
//   ]

//   if (loading && !selectedPanchayat) {
//     return (
//       <div className="flex justify-center items-center min-h-60">
//         <Loader />
//       </div>
//     )
//   }

//   if (!selectedPanchayat) {
//     return (
//       <div className="text-center py-8">
//         <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">
//           Panchayat Not Found
//         </h1>
//         <p className="text-gray-600 mb-4">
//           This panchayat could not be found.
//         </p>
//         <Link href="/admin/panchayats" className="no-underline">
//           <Button
//             startIcon={<ArrowLeft size={16} />}
//             className="font-semibold mt-2"
//           >
//             Back to Panchayats
//           </Button>
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-4">
//           <Link href="/admin/panchayats" className="no-underline">
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
//           <div>
//             <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
//               {isEditing ? "Edit Panchayat" : selectedPanchayat.name}
//             </h1>
//             <div className="text-sm text-gray-600 mt-1">
//               {selectedPanchayat.createdBy?.name && (
//                 <>
//                   Created by <span className="font-semibold">{selectedPanchayat.createdBy.name}</span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             startIcon={<Edit size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               fontWeight: 'bold',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Edit Panchayat
//           </Button>
//         )}
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* LEFT COLUMN - Form */}
//         <div className="flex-1">
//           <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
//             {/* BASIC INFORMATION */}
//             <Card className="p-6 border border-blue-100">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Basic Information
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   {isEditing ? (
//                     <TextField
//                       label="Panchayat Name *"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       error={!!errors.name}
//                       helperText={errors.name}
//                       fullWidth
//                     />
//                   ) : (
//                     <div>
//                       <div className="text-sm text-gray-600 font-medium mb-1">
//                         Panchayat Name
//                       </div>
//                       <div className="text-lg font-semibold text-gray-900">
//                         {formData.name}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   {isEditing ? (
//                     <TextField
//                       label="Slug *"
//                       name="slug"
//                       value={formData.slug}
//                       onChange={handleChange}
//                       error={!!errors.slug}
//                       helperText={errors.slug}
//                       fullWidth
//                     />
//                   ) : (
//                     <div>
//                       <div className="text-sm text-gray-600 font-medium mb-1">
//                         Slug
//                       </div>
//                       <div className="text-gray-900">
//                         {formData.slug}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   {isEditing ? (
//                     <TextField
//                       label="Block"
//                       name="block"
//                       value={formData.block}
//                       onChange={handleChange}
//                       fullWidth
//                     />
//                   ) : (
//                     <div>
//                       <div className="text-sm text-gray-600 font-medium mb-1">
//                         Block
//                       </div>
//                       <div className="text-gray-900">
//                         {formData.block || "Not specified"}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   {isEditing ? (
//                     <TextField
//                       label="Establishment Year"
//                       name="establishmentYear"
//                       type="number"
//                       value={formData.establishmentYear}
//                       onChange={handleChange}
//                       fullWidth
//                     />
//                   ) : (
//                     <div>
//                       <div className="text-sm text-gray-600 font-medium mb-1">
//                         Establishment Year
//                       </div>
//                       <div className="text-gray-900">
//                         {formData.establishmentYear || "Not specified"}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   {isEditing ? (
//                     <TextField
//                       label="Population"
//                       name="population"
//                       type="number"
//                       value={formData.population}
//                       onChange={handleChange}
//                       fullWidth
//                     />
//                   ) : (
//                     <div>
//                       <div className="text-sm text-gray-600 font-medium mb-1">
//                         Population
//                       </div>
//                       <div className="text-gray-900">
//                         {formData.population ? formData.population.toLocaleString() : "Not specified"}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Card>

//             {/* HISTORICAL BACKGROUND */}
//             <Card className="p-6 border border-blue-100">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Historical Background
//               </h2>
//               {isEditing ? (
//                 <TextField
//                   multiline
//                   rows={5}
//                   name="historicalBackground"
//                   value={formData.historicalBackground}
//                   onChange={handleChange}
//                   placeholder="Describe the historical background of the panchayat..."
//                   fullWidth
//                 />
//               ) : (
//                 <div className="text-gray-600 whitespace-pre-wrap">
//                   {formData.historicalBackground || "No historical background provided"}
//                 </div>
//               )}
//             </Card>

//             {/* CULTURAL INFORMATION */}
//             <Card className="p-6 border border-blue-100">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Cultural Information
//               </h2>
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">
//                     Local Art
//                   </h3>
//                   {isEditing ? (
//                     <TextField
//                       multiline
//                       rows={3}
//                       name="localArt"
//                       value={formData.localArt}
//                       onChange={handleChange}
//                       placeholder="Traditional art forms and cultural expressions..."
//                       fullWidth
//                     />
//                   ) : (
//                     <div className="text-gray-600 whitespace-pre-wrap">
//                       {formData.localArt || "No information available"}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">
//                     Local Cuisine
//                   </h3>
//                   {isEditing ? (
//                     <TextField
//                       multiline
//                       rows={3}
//                       name="localCuisine"
//                       value={formData.localCuisine}
//                       onChange={handleChange}
//                       placeholder="Traditional dishes and local cuisine..."
//                       fullWidth
//                     />
//                   ) : (
//                     <div className="text-gray-600 whitespace-pre-wrap">
//                       {formData.localCuisine || "No information available"}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">
//                     Traditions
//                   </h3>
//                   {isEditing ? (
//                     <TextField
//                       multiline
//                       rows={3}
//                       name="traditions"
//                       value={formData.traditions}
//                       onChange={handleChange}
//                       placeholder="Cultural traditions and practices..."
//                       fullWidth
//                     />
//                   ) : (
//                     <div className="text-gray-600 whitespace-pre-wrap">
//                       {formData.traditions || "No information available"}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Card>

//             {/* SAVE BUTTONS */}
//             {isEditing && (
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Button
//                   type="submit"
//                   disabled={isSaving}
//                   startIcon={isSaving ? <Loader /> : <Save size={20} />}
//                   size="large"
//                   sx={{
//                     flex: 1,
//                     backgroundColor: '#144ae9',
//                     color: 'white',
//                     fontWeight: 600,
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#144ae950',
//                       color: 'white'
//                     }
//                   }}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={handleCancel}
//                   disabled={isSaving}
//                   variant="outlined"
//                   size="large"
//                   sx={{
//                     flex: 1,
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     fontWeight: 600,
//                     '&:hover': {
//                       borderColor: '#0d3ec7',
//                       backgroundColor: '#144ae910'
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             )}
//           </form>
//         </div>

//         {/* RIGHT COLUMN - Sidebar */}
//         <div className="lg:w-80 flex-shrink-0">
//           <div className="space-y-6">
//             {/* STATUS & INFO */}
//             <Card className="p-6 border border-blue-100">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Information
//               </h2>

//               {/* STATUS */}
//               <div className="mb-6">
//                 <div className="text-sm text-gray-600 font-medium mb-2">
//                   Status
//                 </div>
//                 {isEditing ? (
//                   <SelectField
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     options={statusOptions}
//                     fullWidth
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.status}
//                     label={formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
//                   />
//                 )}
//               </div>

//               {/* DISTRICT INFO */}
//               {selectedPanchayat.district && (
//                 <div className="mb-6">
//                   <div className="flex items-center gap-2 mb-2">
//                     <MapPin size={16} className="text-blue-600" />
//                     <div className="text-sm text-gray-600 font-medium">
//                       District
//                     </div>
//                   </div>
//                   <div className="font-semibold text-gray-900">
//                     {selectedPanchayat.district?.name || "N/A"}
//                   </div>
//                 </div>
//               )}

//               {/* CREATED BY */}
//               {selectedPanchayat.createdBy && (
//                 <div>
//                   <div className="flex items-center gap-2 mb-2">
//                     <User size={16} className="text-blue-600" />
//                     <div className="text-sm text-gray-600 font-medium">
//                       Created By
//                     </div>
//                   </div>
//                   <div className="font-semibold text-gray-900">
//                     {selectedPanchayat.createdBy?.name || "Unknown"}
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {selectedPanchayat.createdBy?.email || ""}
//                   </div>
//                 </div>
//               )}
//             </Card>

//             {/* ADDITIONAL INFO */}
//             <Card className="p-6 border border-blue-100">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Additional Information
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <div className="text-sm text-gray-600 font-medium">
//                     Created
//                   </div>
//                   <div className="text-gray-900">
//                     {formatDate(selectedPanchayat.createdAt)}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-600 font-medium">
//                     Last Updated
//                   </div>
//                   <div className="text-gray-900">
//                     {formatDate(selectedPanchayat.updatedAt)}
//                   </div>
//                 </div>
//               </div>
//             </Card>

//             {/* RTC REPORTS */}
//             {!isEditing && (
//               <Card className="p-6 border border-blue-100 bg-blue-50">
//                 <div className="flex items-center gap-3 mb-4">
//                   <FileText size={20} className="text-blue-600" />
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     RTC Reports
//                   </h2>
//                 </div>
//                 <div className="text-gray-600 mb-4">
//                   View and manage RTC reports for this panchayat.
//                 </div>
//                 <Link
//                   href={`/admin/panchayats/${params.id}/rtc-report`}
//                   className="no-underline"
//                 >
//                   <Button
//                     fullWidth
//                     sx={{
//                       backgroundColor: '#144ae9',
//                       color: 'white',
//                       fontWeight: 600,
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7'
//                       }
//                     }}
//                   >
//                     View RTC Reports
//                   </Button>
//                 </Link>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { 
//   ArrowLeft, 
//   Save, 
//   Edit, 
//   User, 
//   Calendar,
//   MapPin,
//   FileText,
//   AlertCircle
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Stack,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem
// } from '@mui/material'
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import StatusChip from "@/components/ui/StatusChip"
// import Loader from "@/components/ui/Loader"

// export default function PanchayatDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     block: "",
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     status: "pending",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//   })

//   const [errors, setErrors] = useState({})

//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchPanchayatById(params.id))
//       setDataLoaded(true)
//     }
//   }, [params.id, dataLoaded, dispatch])

//   useEffect(() => {
//     if (selectedPanchayat && selectedPanchayat._id === params.id) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//   }, [selectedPanchayat, params.id])

//   useEffect(() => {
//     if (success && isSaving) {
//       toast.success("Panchayat updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setTimeout(() => {
//         dispatch(fetchPanchayatById(params.id))
//       }, 500)
//     }
//     if (error && isSaving) {
//       toast.error(error.message || "Failed to update panchayat")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, isSaving, dispatch, params.id])

//   const validateForm = () => {
//     const newErrors = {}
//     if (!formData.name.trim()) newErrors.name = "Panchayat name is required"
//     if (!formData.slug.trim()) newErrors.slug = "Slug is required"
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleCancel = () => {
//     setIsEditing(false)
//     if (selectedPanchayat) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//     setErrors({})
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) {
//       toast.error("Please fix all errors")
//       return
//     }
//     try {
//       setIsSaving(true)

//       const formattedData = {
//         ...formData,
//         population: formData.population ? parseInt(formData.population) : undefined,
//         establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
//       }

//       await dispatch(updatePanchayat({ id: params.id, panchayatData: formattedData })).unwrap()
//       setIsSaving(false)
//     } catch (err) {
//       console.log("Error object:", err)
//       const errorMessage =
//         err?.message || err?.error?.message || (typeof err === "string" ? err : "Failed to update panchayat")

//       toast.error(errorMessage)
//       setIsSaving(false)
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     } catch {
//       return "N/A"
//     }
//   }

//   if (loading && !selectedPanchayat) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
//         <Loader />
//       </Box>
//     )
//   }

//   if (!selectedPanchayat) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <AlertCircle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
//         <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
//           Panchayat Not Found
//         </Typography>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           This panchayat could not be found.
//         </Typography>
//         <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
//           <Button
//             startIcon={<ArrowLeft size={16} />}
//             sx={{ mt: 2, fontWeight: 'bold' }}
//           >
//             Back to Panchayats
//           </Button>
//         </Link>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: { xs: 'column', sm: 'row' }, 
//         justifyContent: 'space-between', 
//         alignItems: { xs: 'flex-start', sm: 'center' }, 
//         gap: 2, 
//         mb: 4 
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
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
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {isEditing ? "Edit Panchayat" : selectedPanchayat.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {selectedPanchayat.createdBy?.name && (
//                 <>
//                   Created by <Typography component="span" fontWeight={600}>{selectedPanchayat.createdBy.name}</Typography>
//                 </>
//               )}
//             </Typography>
//           </Box>
//         </Box>

//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             startIcon={<Edit size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               fontWeight: 'bold',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Edit Panchayat
//           </Button>
//         )}
//       </Box>

//       {/* MAIN CONTENT */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
//         {/* LEFT COLUMN - Form */}
//         <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 70%' }, minWidth: 0 }}>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
//             {/* BASIC INFORMATION */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
//                 Basic Information
//               </Typography>
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   {isEditing ? (
//                     <TextField
//                       label="Panchayat Name *"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       error={!!errors.name}
//                       helperText={errors.name}
//                       fullWidth
//                     />
//                   ) : (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                         Panchayat Name
//                       </Typography>
//                       <Typography variant="h6" fontWeight={600} color="text.primary">
//                         {formData.name}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   {isEditing ? (
//                     <TextField
//                       label="Slug *"
//                       name="slug"
//                       value={formData.slug}
//                       onChange={handleChange}
//                       error={!!errors.slug}
//                       helperText={errors.slug}
//                       fullWidth
//                     />
//                   ) : (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                         Slug
//                       </Typography>
//                       <Typography variant="body1" color="text.primary">
//                         {formData.slug}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   {isEditing ? (
//                     <TextField
//                       label="Block"
//                       name="block"
//                       value={formData.block}
//                       onChange={handleChange}
//                       fullWidth
//                     />
//                   ) : (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                         Block
//                       </Typography>
//                       <Typography variant="body1" color="text.primary">
//                         {formData.block || "Not specified"}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   {isEditing ? (
//                     <TextField
//                       label="Establishment Year"
//                       name="establishmentYear"
//                       type="number"
//                       value={formData.establishmentYear}
//                       onChange={handleChange}
//                       fullWidth
//                     />
//                   ) : (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                         Establishment Year
//                       </Typography>
//                       <Typography variant="body1" color="text.primary">
//                         {formData.establishmentYear || "Not specified"}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   {isEditing ? (
//                     <TextField
//                       label="Population"
//                       name="population"
//                       type="number"
//                       value={formData.population}
//                       onChange={handleChange}
//                       fullWidth
//                     />
//                   ) : (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                         Population
//                       </Typography>
//                       <Typography variant="body1" color="text.primary">
//                         {formData.population ? formData.population.toLocaleString() : "Not specified"}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Grid>
//               </Grid>
//             </Card>

//             {/* HISTORICAL BACKGROUND */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
//                 Historical Background
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   multiline
//                   rows={5}
//                   name="historicalBackground"
//                   value={formData.historicalBackground}
//                   onChange={handleChange}
//                   placeholder="Describe the historical background of the panchayat..."
//                   fullWidth
//                 />
//               ) : (
//                 <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
//                   {formData.historicalBackground || "No historical background provided"}
//                 </Typography>
//               )}
//             </Card>

//             {/* CULTURAL INFORMATION */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
//                 Cultural Information
//               </Typography>
//               <Stack spacing={3}>
//                 <Box>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
//                     Local Art
//                   </Typography>
//                   {isEditing ? (
//                     <TextField
//                       multiline
//                       rows={3}
//                       name="localArt"
//                       value={formData.localArt}
//                       onChange={handleChange}
//                       placeholder="Traditional art forms and cultural expressions..."
//                       fullWidth
//                     />
//                   ) : (
//                     <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
//                       {formData.localArt || "No information available"}
//                     </Typography>
//                   )}
//                 </Box>

//                 <Box>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
//                     Local Cuisine
//                   </Typography>
//                   {isEditing ? (
//                     <TextField
//                       multiline
//                       rows={3}
//                       name="localCuisine"
//                       value={formData.localCuisine}
//                       onChange={handleChange}
//                       placeholder="Traditional dishes and local cuisine..."
//                       fullWidth
//                     />
//                   ) : (
//                     <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
//                       {formData.localCuisine || "No information available"}
//                     </Typography>
//                   )}
//                 </Box>

//                 <Box>
//                   <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
//                     Traditions
//                   </Typography>
//                   {isEditing ? (
//                     <TextField
//                       multiline
//                       rows={3}
//                       name="traditions"
//                       value={formData.traditions}
//                       onChange={handleChange}
//                       placeholder="Cultural traditions and practices..."
//                       fullWidth
//                     />
//                   ) : (
//                     <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
//                       {formData.traditions || "No information available"}
//                     </Typography>
//                   )}
//                 </Box>
//               </Stack>
//             </Card>

//             {/* SAVE BUTTONS */}
//             {isEditing && (
//               <Box sx={{ display: 'flex', gap: 2 }}>
//                 <Button
//                   type="submit"
//                   disabled={isSaving}
//                   startIcon={isSaving ? <Loader /> : <Save size={20} />}
//                   size="large"
//                   sx={{
//                     flex: 1,
//                     backgroundColor: '#144ae9',
//                     color: 'white',
//                     fontWeight: 600,
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#144ae950',
//                       color: 'white'
//                     }
//                   }}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={handleCancel}
//                   disabled={isSaving}
//                   variant="outlined"
//                   size="large"
//                   sx={{
//                     flex: 1,
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     fontWeight: 600,
//                     '&:hover': {
//                       borderColor: '#0d3ec7',
//                       backgroundColor: '#144ae910'
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         </Box>

//         {/* RIGHT COLUMN - Sidebar */}
//         <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 30%' }, maxWidth: { lg: 400 }, minWidth: 0 }}>
//           <Stack spacing={3}>
//             {/* STATUS & INFO */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Information
//               </Typography>

//               {/* STATUS */}
//               <Box sx={{ mb: 3 }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 {isEditing ? (
//                   <FormControl fullWidth>
//                     <InputLabel>Status</InputLabel>
//                     <Select
//                       name="status"
//                       value={formData.status}
//                       onChange={handleChange}
//                       label="Status"
//                     >
//                       <MenuItem value="draft">Draft</MenuItem>
//                       <MenuItem value="pending">Pending</MenuItem>
//                       <MenuItem value="verified">Verified</MenuItem>
//                     </Select>
//                   </FormControl>
//                 ) : (
//                   <StatusChip
//                     status={formData.status}
//                     label={formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
//                   />
//                 )}
//               </Box>

//               {/* DISTRICT INFO */}
//               {selectedPanchayat.district && (
//                 <Box sx={{ mb: 3 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//                     <MapPin size={16} color="#144ae9" />
//                     <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                       District
//                     </Typography>
//                   </Box>
//                   <Typography variant="body1" color="text.primary" fontWeight={600}>
//                     {selectedPanchayat.district?.name || "N/A"}
//                   </Typography>
//                 </Box>
//               )}

//               {/* CREATED BY */}
//               {selectedPanchayat.createdBy && (
//                 <Box>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//                     <User size={16} color="#144ae9" />
//                     <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                       Created By
//                     </Typography>
//                   </Box>
//                   <Typography variant="body1" color="text.primary" fontWeight={600}>
//                     {selectedPanchayat.createdBy?.name || "Unknown"}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {selectedPanchayat.createdBy?.email || ""}
//                   </Typography>
//                 </Box>
//               )}
//             </Card>

//             {/* ADDITIONAL INFO */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Additional Information
//               </Typography>
//               <Stack spacing={2}>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Created
//                   </Typography>
//                   <Typography variant="body2" color="text.primary">
//                     {formatDate(selectedPanchayat.createdAt)}
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Last Updated
//                   </Typography>
//                   <Typography variant="body2" color="text.primary">
//                     {formatDate(selectedPanchayat.updatedAt)}
//                   </Typography>
//                 </Box>
//               </Stack>
//             </Card>

//             {/* RTC REPORTS */}
//             {!isEditing && (
//               <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: '#144ae905' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
//                   <FileText size={20} color="#144ae9" />
//                   <Typography variant="h6" fontWeight={600} color="text.primary">
//                     RTC Reports
//                   </Typography>
//                 </Box>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                   View and manage RTC reports for this panchayat.
//                 </Typography>
//                 <Link
//                   href={`/admin/panchayats/${params.id}/rtc-report`}
//                   style={{ textDecoration: 'none' }}
//                 >
//                   <Button
//                     fullWidth
//                     sx={{
//                       backgroundColor: '#144ae9',
//                       color: 'white',
//                       fontWeight: 600,
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7'
//                       }
//                     }}
//                   >
//                     View RTC Reports
//                   </Button>
//                 </Link>
//               </Card>
//             )}
//           </Stack>
//         </Box>
//       </Box>
//     </Box>
//   )
// }

// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowLeft, Save, Edit, User, Calendar } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   TextField,
//   Select,
//   MenuItem
// } from '@mui/material'
// import Loader from "@/components/ui/Loader"

// export default function PanchayatDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     block: "",
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     status: "pending",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//   })

//   const [errors, setErrors] = useState({})

//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchPanchayatById(params.id))
//       setDataLoaded(true)
//     }
//   }, [params.id, dataLoaded, dispatch])

//   useEffect(() => {
//     if (selectedPanchayat && selectedPanchayat._id === params.id) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//   }, [selectedPanchayat, params.id])

//   useEffect(() => {
//     if (success && isSaving) {
//       toast.success("Panchayat updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setTimeout(() => {
//         dispatch(fetchPanchayatById(params.id))
//       }, 500)
//     }
//     if (error && isSaving) {
//       toast.error(error.message || "Failed to update panchayat")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, isSaving, dispatch, params.id])

//   const validateForm = () => {
//     const newErrors = {}
//     if (!formData.name.trim()) newErrors.name = "Panchayat name is required"
//     if (!formData.slug.trim()) newErrors.slug = "Slug is required"
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleCancel = () => {
//     setIsEditing(false)
//     if (selectedPanchayat) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//     setErrors({})
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) {
//       toast.error("Please fix all errors")
//       return
//     }
//     try {
//       setIsSaving(true)

//       const formattedData = {
//         ...formData,
//         population: formData.population ? parseInt(formData.population) : undefined,
//         establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
//       }

//       const result = await dispatch(updatePanchayat({ id: params.id, panchayatData: formattedData })).unwrap()
//       setIsSaving(false)
//     } catch (err) {
//       console.log("Error object:", err)
//       const errorMessage =
//         err?.message || err?.error?.message || (typeof err === "string" ? err : "Failed to update panchayat")

//       toast.error(errorMessage)
//       setIsSaving(false)
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "draft":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#144ae9', color: 'white' }
//       case "verified":
//         return { backgroundColor: '#10b981', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     } catch {
//       return "N/A"
//     }
//   }

//   if (loading && !selectedPanchayat) {
//     return (
//         <Loader />
//     )
//   }

//   if (!selectedPanchayat) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           Panchayat not found
//         </Typography>
//         <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
//           <Button sx={{ mt: 2, color: '#144ae9' }}>
//             Back to Panchayats
//           </Button>
//         </Link>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
//             <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9' }}>
//               <ArrowLeft size={20} color="#144ae9" />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {selectedPanchayat.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {isEditing ? "Edit panchayat details" : "View panchayat details"}
//             </Typography>
//           </Box>
//         </Box>
        
//         {!isEditing && (
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
//             Edit
//           </Button>
//         )}
//       </Box>

//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} md={6}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
//               <User size={20} color="#144ae9" />
//               <Box>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                   Created By
//                 </Typography>
//                 <Typography variant="h6" fontWeight={600} color="text.primary">
//                   {selectedPanchayat.createdBy?.name || "Unknown"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {selectedPanchayat.createdBy?.email || ""}
//                 </Typography>
//               </Box>
//             </Box>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 <Chip
//                   label={selectedPanchayat.status?.charAt(0).toUpperCase() + selectedPanchayat.status?.slice(1)}
//                   sx={getStatusColor(selectedPanchayat.status)}
//                 />
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Calendar size={16} color="#144ae9" />
//                 <Box>
//                   <Typography variant="caption" color="text.secondary">
//                     Created
//                   </Typography>
//                   <Typography variant="body2" fontWeight={500} color="text.primary">
//                     {formatDate(selectedPanchayat.createdAt)}
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           </Card>
//         </Grid>
//       </Grid>

//       <Box component="form" onSubmit={handleSubmit}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Basic Information
//             </Typography>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Panchayat Name *"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   error={!!errors.name}
//                   helperText={errors.name}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Slug *"
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleChange}
//                   error={!!errors.slug}
//                   helperText={errors.slug}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Block"
//                   name="block"
//                   value={formData.block}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Establishment Year"
//                   name="establishmentYear"
//                   type="number"
//                   value={formData.establishmentYear}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Population"
//                   name="population"
//                   type="number"
//                   value={formData.population}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 {isEditing ? (
//                   <Select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     fullWidth
//                     sx={{
//                       '& .MuiOutlinedInput-notchedOutline': {
//                         borderColor: '#144ae920',
//                       },
//                       '&:hover .MuiOutlinedInput-notchedOutline': {
//                         borderColor: '#144ae9',
//                       },
//                     }}
//                   >
//                     <MenuItem value="draft">Draft</MenuItem>
//                     <MenuItem value="pending">Pending</MenuItem>
//                     <MenuItem value="verified">Verified</MenuItem>
//                   </Select>
//                 ) : (
//                   <Chip
//                     label={formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
//                     sx={getStatusColor(formData.status)}
//                   />
//                 )}
//               </Grid>
//             </Grid>
//           </Card>

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Historical Background
//             </Typography>
//             <TextField
//               multiline
//               rows={4}
//               name="historicalBackground"
//               value={formData.historicalBackground}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   '& fieldset': {
//                     borderColor: '#144ae920',
//                   },
//                   '&:hover fieldset': {
//                     borderColor: '#144ae9',
//                   },
//                 },
//               }}
//             />
//           </Card>

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Local Art
//             </Typography>
//             <TextField
//               multiline
//               rows={3}
//               name="localArt"
//               value={formData.localArt}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               placeholder="Traditional art forms and cultural expressions..."
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   '& fieldset': {
//                     borderColor: '#144ae920',
//                   },
//                   '&:hover fieldset': {
//                     borderColor: '#144ae9',
//                   },
//                 },
//               }}
//             />
//           </Card>

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Local Cuisine
//             </Typography>
//             <TextField
//               multiline
//               rows={3}
//               name="localCuisine"
//               value={formData.localCuisine}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               placeholder="Traditional dishes and local cuisine..."
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   '& fieldset': {
//                     borderColor: '#144ae920',
//                   },
//                   '&:hover fieldset': {
//                     borderColor: '#144ae9',
//                   },
//                 },
//               }}
//             />
//           </Card>

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Traditions
//             </Typography>
//             <TextField
//               multiline
//               rows={3}
//               name="traditions"
//               value={formData.traditions}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               placeholder="Cultural traditions and practices..."
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   '& fieldset': {
//                     borderColor: '#144ae920',
//                   },
//                   '&:hover fieldset': {
//                     borderColor: '#144ae9',
//                   },
//                 },
//               }}
//             />
//           </Card>

//           {isEditing && (
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 type="submit"
//                 disabled={isSaving || loading}
//                 startIcon={isSaving || loading ? <Loader /> : <Save size={20} />}
//                 size="large"
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   '&:hover': {
//                     backgroundColor: '#0d3ec7'
//                   },
//                   '&.Mui-disabled': {
//                     backgroundColor: '#144ae950',
//                     color: 'white'
//                   }
//                 }}
//               >
//                 {isSaving || loading ? 'Saving...' : 'Save Changes'}
//               </Button>
//               <Button
//                 type="button"
//                 onClick={handleCancel}
//                 disabled={isSaving || loading}
//                 variant="outlined"
//                 size="large"
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   '&:hover': {
//                     borderColor: '#0d3ec7',
//                     backgroundColor: '#144ae910'
//                   }
//                 }}
//               >
//                 Cancel
//               </Button>
//             </Box>
//           )}

//           {!isEditing && (
//             <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: '#144ae905' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 RTC Reports
//               </Typography>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 View and manage RTC reports for this panchayat.
//               </Typography>
//               <Link
//                 href={`/admin/panchayats/${params.id}/rtc-report`}
//                 style={{ textDecoration: 'none' }}
//               >
//                 <Button
//                   sx={{
//                     backgroundColor: '#144ae9',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   View RTC Reports
//                 </Button>
//               </Link>
//             </Card>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   )
// }

