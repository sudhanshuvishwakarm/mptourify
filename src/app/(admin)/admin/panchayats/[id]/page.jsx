'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft, Save, MapPin, CloudUpload, Link as LinkIcon, X, Edit,
  Calendar, Users, Maximize, Plus, Trash2
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
    coordinates: { lat: '', lng: '' },
    basicInfo: { 
      establishmentYear: '', 
      population: '', 
      area: '', 
      majorRivers: [],
      languagesSpoken: []
    },
    culturalInfo: { 
      historicalBackground: '', 
      traditions: '', 
      localCuisine: '', 
      localArt: '' 
    },
    politicalOverview: [],
    transportationServices: [],
    hospitalityServices: [],
    emergencyDirectory: [],
    specialPersons: [],
    status: 'Pending'
  });
  const [errors, setErrors] = useState({});
  const [tempRiver, setTempRiver] = useState('');
  const [tempLanguage, setTempLanguage] = useState('');
const [tempPolitical, setTempPolitical] = useState({ heading: '', description: '' });
const [tempTransport, setTempTransport] = useState({ name: '', type: '', location: '' });
const [tempHospitality, setTempHospitality] = useState({ name: '', type: '', location: '', phone: '' });
const [tempEmergency, setTempEmergency] = useState({ service: '', contactNumber: '' });
const [tempPerson, setTempPerson] = useState({ name: '', achievement: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchDistricts({ limit: 100 }));
    if (params.id) dispatch(fetchPanchayatById(params.id));
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
        basicInfo: {
          establishmentYear: selectedPanchayat.basicInfo?.establishmentYear || '',
          population: selectedPanchayat.basicInfo?.population || '',
          area: selectedPanchayat.basicInfo?.area || '',
          majorRivers: selectedPanchayat.basicInfo?.majorRivers || [],
          languagesSpoken: selectedPanchayat.basicInfo?.languagesSpoken || []
        },
        culturalInfo: {
          historicalBackground: selectedPanchayat.culturalInfo?.historicalBackground || '',
          traditions: selectedPanchayat.culturalInfo?.traditions || '',
          localCuisine: selectedPanchayat.culturalInfo?.localCuisine || '',
          localArt: selectedPanchayat.culturalInfo?.localArt || ''
        },
        politicalOverview: selectedPanchayat.politicalOverview || [],
        transportationServices: selectedPanchayat.transportationServices || [],
        hospitalityServices: selectedPanchayat.hospitalityServices || [],
        emergencyDirectory: selectedPanchayat.emergencyDirectory || [],
        specialPersons: selectedPanchayat.specialPersons || [],
        status: selectedPanchayat.status || 'Pending'
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
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid image type');
      return;
    }

    if (selectedFile.size > 95 * 1024 * 1024) {
      toast.error('File too large');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name required';
    if (!formData.district) newErrors.district = 'District required';
    if (!formData.block.trim()) newErrors.block = 'Block required';
    if (!formData.coordinates.lat) newErrors.lat = 'Latitude required';
    if (!formData.coordinates.lng) newErrors.lng = 'Longitude required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Fix errors');
      return;
    }

    setIsSaving(true);
    console.log('Submitting update with data:', formData);

    try {
      const submitData = new FormData();
      
      if (uploadMethod === 'file' && file) {
        submitData.append('headerImage', file);
        submitData.append('uploadMethod', 'file');
      } else {
        submitData.append('headerImageUrl', formData.headerImage);
        submitData.append('uploadMethod', 'url');
      }

      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('district', formData.district);
      submitData.append('block', formData.block);
      submitData.append('coordinates[lat]', formData.coordinates.lat);
      submitData.append('coordinates[lng]', formData.coordinates.lng);
      submitData.append('status', formData.status);

      // Basic Info
      if (formData.basicInfo.establishmentYear) {
        submitData.append('basicInfo[establishmentYear]', formData.basicInfo.establishmentYear);
      }
      if (formData.basicInfo.population) {
        submitData.append('basicInfo[population]', formData.basicInfo.population);
      }
      if (formData.basicInfo.area) {
        submitData.append('basicInfo[area]', formData.basicInfo.area);
      }
      if (formData.basicInfo.majorRivers.length > 0) {
        submitData.append('basicInfo[majorRivers]', formData.basicInfo.majorRivers.join(','));
      }
      if (formData.basicInfo.languagesSpoken.length > 0) {
        submitData.append('basicInfo[languagesSpoken]', formData.basicInfo.languagesSpoken.join(','));
      }

      // Cultural Info
      if (formData.culturalInfo.historicalBackground) {
        submitData.append('culturalInfo[historicalBackground]', formData.culturalInfo.historicalBackground);
      }
      if (formData.culturalInfo.traditions) {
        submitData.append('culturalInfo[traditions]', formData.culturalInfo.traditions);
      }
      if (formData.culturalInfo.localCuisine) {
        submitData.append('culturalInfo[localCuisine]', formData.culturalInfo.localCuisine);
      }
      if (formData.culturalInfo.localArt) {
        submitData.append('culturalInfo[localArt]', formData.culturalInfo.localArt);
      }

      // Arrays as JSON
      if (formData.politicalOverview.length > 0) {
        submitData.append('politicalOverview', JSON.stringify(formData.politicalOverview));
      }
      if (formData.transportationServices.length > 0) {
        submitData.append('transportationServices', JSON.stringify(formData.transportationServices));
      }
      if (formData.hospitalityServices.length > 0) {
        submitData.append('hospitalityServices', JSON.stringify(formData.hospitalityServices));
      }
      if (formData.emergencyDirectory.length > 0) {
        submitData.append('emergencyDirectory', JSON.stringify(formData.emergencyDirectory));
      }
      if (formData.specialPersons.length > 0) {
        submitData.append('specialPersons', JSON.stringify(formData.specialPersons));
      }

      console.log('FormData entries for update:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await dispatch(updatePanchayat({ id: params.id, panchayatData: submitData })).unwrap();
    } catch (err) {
      console.error('Update error:', err);
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
        basicInfo: {
          establishmentYear: selectedPanchayat.basicInfo?.establishmentYear || '',
          population: selectedPanchayat.basicInfo?.population || '',
          area: selectedPanchayat.basicInfo?.area || '',
          majorRivers: selectedPanchayat.basicInfo?.majorRivers || [],
          languagesSpoken: selectedPanchayat.basicInfo?.languagesSpoken || []
        },
        culturalInfo: {
          historicalBackground: selectedPanchayat.culturalInfo?.historicalBackground || '',
          traditions: selectedPanchayat.culturalInfo?.traditions || '',
          localCuisine: selectedPanchayat.culturalInfo?.localCuisine || '',
          localArt: selectedPanchayat.culturalInfo?.localArt || ''
        },
        politicalOverview: selectedPanchayat.politicalOverview || [],
        transportationServices: selectedPanchayat.transportationServices || [],
        hospitalityServices: selectedPanchayat.hospitalityServices || [],
        emergencyDirectory: selectedPanchayat.emergencyDirectory || [],
        specialPersons: selectedPanchayat.specialPersons || [],
        status: selectedPanchayat.status || 'Pending'
      });
      setPreview(selectedPanchayat.headerImage || null);
    }
    setErrors({});
  };

  // const politicalHeadingOptions = [
  //   { value: '', label: 'Select Heading' },
  //   { value: 'Current Leadership', label: 'Current Leadership' },
  //   { value: 'Political History', label: 'Political History' },
  //   { value: 'Governing Structure', label: 'Governing Structure' },
  //   { value: 'Major Achievements', label: 'Major Achievements' },
  //   { value: 'Recent Developments', label: 'Recent Developments' },
  //   { value: 'Election History', label: 'Election History' },
  //   { value: 'Administrative Setup', label: 'Administrative Setup' },
  //   { value: 'Future Plans', label: 'Future Plans' },
  //   { value: 'Public Participation', label: 'Public Participation' },
  //   { value: 'Key Challenges', label: 'Key Challenges' }
  // ];

  if (loading && !selectedPanchayat) return <div className="fixed inset-0 z-[9999]"><Loader message="Loading..." /></div>;

  if (!selectedPanchayat) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Panchayat not found</div>
        <Link href="/admin/panchayats" className="no-underline">
          <Button sx={{ backgroundColor: "#1348e8" }}>Back to Panchayats</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {isSaving && <div className="fixed inset-0 z-[9999]"><Loader message="Saving..." /></div>}
      
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0">{selectedPanchayat.name}</h1>
              <p className="text-sm text-gray-600 mt-1 mb-0">{isEditing ? 'Edit panchayat details' : 'View panchayat details'}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              startIcon={<Edit size={20} />} 
              sx={{ 
                backgroundColor: "#1348e8",
                color: "white",
                "&:hover": { backgroundColor: "#0d3a9d" }
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
                disabled={isSaving} 
                startIcon={<Save size={20} />} 
                sx={{ 
                  backgroundColor: "#1348e8",
                  color: "white",
                  "&:hover": { backgroundColor: "#0d3a9d" },
                  "&:disabled": { backgroundColor: "#9ca3af", color: "#e5e7eb" }
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* HEADER IMAGE SECTION - 70% width like district */}
          <div className="flex flex-col xl:flex-row gap-6 mb-6">
            <div className="w-full xl:w-[70%]">
              <div className="border border-[#e5e7eb] overflow-hidden bg-white rounded-xl shadow-sm">
                <div className="relative bg-gray-50 p-0">
                  <div className="flex justify-center items-center">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt={selectedPanchayat.name} 
                        className="w-full object-cover"
                        style={{ maxHeight: isEditing ? '400px' : '500px' }}
                      />
                    ) : (
                      <div className="text-center text-gray-400 py-20">
                        <CloudUpload size={48} className="mx-auto mb-4" />
                        <p className="text-base font-medium mb-0">No header image set</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GEOGRAPHY SECTION - 30% width */}
            <div className="w-full xl:w-[30%]">
              <Card sx={{ 
                p: 3, 
                border: "1px solid #e5e7eb", 
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                height: "100%"
              }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Geography</h3>
                
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Major Rivers</h4>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <TextField 
                        value={tempRiver} 
                        onChange={(e) => setTempRiver(e.target.value)} 
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
                        onClick={() => tempRiver.trim() && (setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, majorRivers: [...prev.basicInfo.majorRivers, tempRiver.trim()] } })), setTempRiver(''))} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#1348e8',
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
                    {formData.basicInfo.majorRivers.length > 0 ? formData.basicInfo.majorRivers.map((river, i) => (
                      <div key={i} className="inline-flex items-center gap-2 bg-blue-50 text-gray-700 border border-blue-100 rounded-full px-3 py-1.5 text-sm font-medium">
                        <span>{river}</span>
                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, majorRivers: prev.basicInfo.majorRivers.filter((_, idx) => idx !== i) } }))}
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

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Languages Spoken</h4>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <TextField 
                        value={tempLanguage} 
                        onChange={(e) => setTempLanguage(e.target.value)} 
                        placeholder="Enter language"
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
                        onClick={() => tempLanguage.trim() && (setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, languagesSpoken: [...prev.basicInfo.languagesSpoken, tempLanguage.trim()] } })), setTempLanguage(''))} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#1348e8',
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
                    {formData.basicInfo.languagesSpoken.length > 0 ? formData.basicInfo.languagesSpoken.map((lang, i) => (
                      <div key={i} className="inline-flex items-center gap-2 bg-blue-50 text-gray-700 border border-blue-100 rounded-full px-3 py-1.5 text-sm font-medium">
                        <span>{lang}</span>
                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, languagesSpoken: prev.basicInfo.languagesSpoken.filter((_, idx) => idx !== i) } }))}
                            className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-blue-100 p-0.5 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 italic mb-0">No languages added</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* IMAGE UPLOAD SECTION - Only show when editing */}
          {isEditing && (
            <Card sx={{ 
              p: 3, 
              mb: 3,
              border: "1px solid #e5e7eb", 
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
            }}>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Update Header Image</h3>
              <div className="flex border-b border-gray-200 mb-4">
                <button 
                  type="button" 
                  onClick={() => { setUploadMethod('url'); setFile(null); }} 
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${uploadMethod === 'url' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  <LinkIcon size={18} />
                  Use URL
                </button>
                <button 
                  type="button" 
                  onClick={() => setUploadMethod('file')} 
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors ${uploadMethod === 'file' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  <CloudUpload size={18} />
                  Upload File
                </button>
              </div>

              {uploadMethod === 'file' ? (
                !file ? (
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
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <CloudUpload size={24} className="text-[#1348e8]" />
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setFile(null); setPreview(formData.headerImage); }}
                        className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    {preview && <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-lg" />}
                  </div>
                )
              ) : (
                <TextField 
                  label="Header Image URL" 
                  value={formData.headerImage} 
                  onChange={(e) => { setFormData({ ...formData, headerImage: e.target.value }); setPreview(e.target.value); }} 
                  placeholder="https://example.com/image.jpg"
                  startIcon={<LinkIcon size={20} className="text-[#1348e8]" />}
                  fullWidth 
                />
              )}
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </Card>
          )}

          {/* BASIC INFO AND STATISTICS ROW */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="w-full lg:w-[70%]">
              <Card sx={{ 
                p: 3, 
                border: "1px solid #e5e7eb", 
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
              }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <TextField 
                      label="Panchayat Name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
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
                      disabled 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.9375rem',
                          color: '#6b7280'
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <SelectField 
                      label="District" 
                      value={formData.district} 
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })} 
                      options={[{ value: '', label: 'Select District' }, ...districts.map(d => ({ value: d._id, label: d.name }))]} 
                      disabled={!isEditing} 
                      required
                      fullWidth 
                      sx={{
                        '& .MuiSelect-select': {
                          fontSize: '0.9375rem',
                          color: isEditing ? '#111827' : '#6b7280'
                        }
                      }}
                    />
                    <TextField 
                      label="Block" 
                      value={formData.block} 
                      onChange={(e) => setFormData({ ...formData, block: e.target.value })} 
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
                  <div className="flex flex-col md:flex-row gap-4">
                    <TextField 
                      label="Establishment Year" 
                      type="number" 
                      value={formData.basicInfo.establishmentYear} 
                      onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, establishmentYear: e.target.value } })} 
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
                      options={[
                        { value: 'Draft', label: 'Draft' }, 
                        { value: 'Pending', label: 'Pending' }, 
                        { value: 'Verified', label: 'Verified' }
                      ]} 
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
              <Card sx={{ 
                p: 3, 
                border: "1px solid #e5e7eb", 
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
              }}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Statistics</h2>
                <div className="flex flex-col gap-4">
                  <TextField 
                    label="Population" 
                    type="number" 
                    value={formData.basicInfo.population} 
                    onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, population: e.target.value } })} 
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
                  <TextField 
                    label="Area (sq km)" 
                    type="number" 
                    value={formData.basicInfo.area} 
                    onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, area: e.target.value } })} 
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
                </div>
              </Card>
            </div>
          </div>

          {/* COORDINATES */}
          <Card sx={{ 
            p: 3, 
            mb: 3,
            border: "1px solid #e5e7eb", 
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
          }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-[#1348e8]" />
              <h2 className="text-lg font-semibold text-gray-900 mb-0">Coordinates</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <TextField 
                label="Latitude" 
                type="number" 
                step="any" 
                value={formData.coordinates.lat} 
                onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} 
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

          {/* CULTURAL INFO */}
          <Card sx={{ 
            p: 3, 
            mb: 3,
            border: "1px solid #e5e7eb", 
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
          }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cultural Information</h2>
            <div className="flex flex-col gap-4">
              <TextField 
                label="Historical Background" 
                value={formData.culturalInfo.historicalBackground} 
                onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, historicalBackground: e.target.value } })} 
                multiline 
                rows={4} 
                disabled={!isEditing} 
                fullWidth 
                sx={{
                  '& .MuiOutlinedInput-input': {
                    fontSize: '0.9375rem',
                    color: isEditing ? '#111827' : '#6b7280'
                  }
                }}
              />
              <div className="flex flex-col md:flex-row gap-4">
                <TextField 
                  label="Local Art" 
                  value={formData.culturalInfo.localArt} 
                  onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, localArt: e.target.value } })} 
                  multiline 
                  rows={3} 
                  disabled={!isEditing} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.9375rem',
                      color: isEditing ? '#111827' : '#6b7280'
                    }
                  }}
                />
                <TextField 
                  label="Local Cuisine" 
                  value={formData.culturalInfo.localCuisine} 
                  onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, localCuisine: e.target.value } })} 
                  multiline 
                  rows={3} 
                  disabled={!isEditing} 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.9375rem',
                      color: isEditing ? '#111827' : '#6b7280'
                    }
                  }}
                />
              </div>
              <TextField 
                label="Traditions" 
                value={formData.culturalInfo.traditions} 
                onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, traditions: e.target.value } })} 
                multiline 
                rows={3} 
                disabled={!isEditing} 
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

          {/* POLITICAL OVERVIEW */}
          <Card sx={{ 
            p: 3, 
            mb: 3,
            border: "1px solid #e5e7eb", 
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-0">Political Overview</h2>
              {isEditing && (
                <Button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, politicalOverview: [...prev.politicalOverview, { heading: '', description: '' }] }))} 
                  startIcon={<Plus size={18} />} 
                  size="small"
                  sx={{ 
                    backgroundColor: '#1348e8',
                    color: "white",
                    "&:hover": { backgroundColor: "#0d3a9d" },
                    fontSize: "0.875rem"
                  }}
                >
                  Add Section
                </Button>
              )}
            </div>
            
            {formData.politicalOverview.length > 0 ? (
              <div className="flex flex-col gap-3">
                {formData.politicalOverview.map((item, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-gray-900 mb-0">Section {i + 1}</h3>
                          <Button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, politicalOverview: prev.politicalOverview.filter((_, idx) => idx !== i) }))} 
                            sx={{ 
                              minWidth: 'auto', 
                              p: 1, 
                              color: '#ef4444',
                              "&:hover": { backgroundColor: "#fee2e2" }
                            }}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                       <TextField 
  label="Heading *" 
  value={item.heading} 
  onChange={(e) => setFormData(prev => ({ ...prev, politicalOverview: prev.politicalOverview.map((po, idx) => idx === i ? { ...po, heading: e.target.value } : po) }))} 
  placeholder="Enter custom heading (e.g., Current Leadership, Political History)"
  fullWidth 
  sx={{
    '& .MuiOutlinedInput-input': {
      fontSize: '0.9375rem'
    }
  }}
/>
                        <TextField 
                          label="Description" 
                          value={item.description} 
                          onChange={(e) => setFormData(prev => ({ ...prev, politicalOverview: prev.politicalOverview.map((po, idx) => idx === i ? { ...po, description: e.target.value } : po) }))} 
                          multiline 
                          rows={3} 
                          fullWidth 
                          sx={{
                            '& .MuiOutlinedInput-input': {
                              fontSize: '0.9375rem'
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-base font-bold text-gray-900 mb-2">{item.heading}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed mb-0">{item.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 italic mb-0">No political overview sections added</p>
              </div>
            )}
          </Card>

          {/* TRANSPORTATION SERVICES */}
          <Card sx={{ 
            p: 3, 
            mb: 3,
            border: "1px solid #e5e7eb", 
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-0">Transportation Services</h2>
              {isEditing && (
                <Button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, transportationServices: [...prev.transportationServices, { name: '', type: '', location: '' }] }))} 
                  startIcon={<Plus size={18} />} 
                  size="small"
                  sx={{ 
                    backgroundColor: '#1348e8',
                    color: "white",
                    "&:hover": { backgroundColor: "#0d3a9d" },
                    fontSize: "0.875rem"
                  }}
                >
                  Add Service
                </Button>
              )}</div>
              {formData.transportationServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.transportationServices.map((item, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0">Service {i + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.filter((_, idx) => idx !== i) }))} 
                        sx={{ 
                          minWidth: 'auto', 
                          p: 0.5, 
                          color: '#ef4444',
                          "&:hover": { backgroundColor: "#fee2e2" }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <TextField 
                      label="Name" 
                      value={item.name} 
                      onChange={(e) => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Type" 
                      value={item.type} 
                      onChange={(e) => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.map((t, idx) => idx === i ? { ...t, type: e.target.value } : t) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Location" 
                      value={item.location} 
                      onChange={(e) => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.map((t, idx) => idx === i ? { ...t, location: e.target.value } : t) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900 mb-1">{item.name}</p>
                    <p className="text-xs text-gray-600 mb-1">{item.type}</p>
                    <p className="text-xs text-gray-700 mb-0">{item.location}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 italic mb-0">No transportation services added</p>
          </div>
        )}
      </Card>

      {/* HOSPITALITY SERVICES */}
      <Card sx={{ 
        p: 3, 
        mb: 3,
        border: "1px solid #e5e7eb", 
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-0">Hospitality Services</h2>
          {isEditing && (
            <Button 
              type="button" 
              onClick={() => setFormData(prev => ({ ...prev, hospitalityServices: [...prev.hospitalityServices, { name: '', type: '', location: '', contact: { phone: '' } }] }))} 
              startIcon={<Plus size={18} />} 
              size="small"
              sx={{ 
                backgroundColor: '#1348e8',
                color: "white",
                "&:hover": { backgroundColor: "#0d3a9d" },
                fontSize: "0.875rem"
              }}
            >
              Add Service
            </Button>
          )}
        </div>
        
        {formData.hospitalityServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.hospitalityServices.map((item, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0">Service {i + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.filter((_, idx) => idx !== i) }))} 
                        sx={{ 
                          minWidth: 'auto', 
                          p: 0.5, 
                          color: '#ef4444',
                          "&:hover": { backgroundColor: "#fee2e2" }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <TextField 
                      label="Name" 
                      value={item.name} 
                      onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, name: e.target.value } : h) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Type" 
                      value={item.type} 
                      onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, type: e.target.value } : h) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Location" 
                      value={item.location} 
                      onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, location: e.target.value } : h) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Phone" 
                      value={item.contact?.phone || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, contact: { phone: e.target.value } } : h) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900 mb-1">{item.name}</p>
                    <p className="text-xs text-gray-600 mb-1">{item.type}</p>
                    <p className="text-xs text-gray-700 mb-1">{item.location}</p>
                    {item.contact?.phone && <p className="text-xs text-[#1348e8] font-medium mb-0">{item.contact.phone}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 italic mb-0">No hospitality services added</p>
          </div>
        )}
      </Card>

      {/* EMERGENCY DIRECTORY */}
      <Card sx={{ 
        p: 3, 
        mb: 3,
        border: "1px solid #e5e7eb", 
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-0">Emergency Directory</h2>
          {isEditing && (
            <Button 
              type="button" 
              onClick={() => setFormData(prev => ({ ...prev, emergencyDirectory: [...prev.emergencyDirectory, { service: '', contactNumber: '' }] }))} 
              startIcon={<Plus size={18} />} 
              size="small"
              sx={{ 
                backgroundColor: '#1348e8',
                color: "white",
                "&:hover": { backgroundColor: "#0d3a9d" },
                fontSize: "0.875rem"
              }}
            >
              Add Contact
            </Button>
          )}
        </div>
        
        {formData.emergencyDirectory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.emergencyDirectory.map((item, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0">Contact {i + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, emergencyDirectory: prev.emergencyDirectory.filter((_, idx) => idx !== i) }))} 
                        sx={{ 
                          minWidth: 'auto', 
                          p: 0.5, 
                          color: '#ef4444',
                          "&:hover": { backgroundColor: "#fee2e2" }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <TextField 
                      label="Service" 
                      value={item.service} 
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyDirectory: prev.emergencyDirectory.map((e, idx) => idx === i ? { ...e, service: e.target.value } : e) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Contact Number" 
                      value={item.contactNumber} 
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyDirectory: prev.emergencyDirectory.map((em, idx) => idx === i ? { ...em, contactNumber: e.target.value } : em) }))} 
                      size="small" 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{item.service}</span>
                    <span className="text-sm text-[#1348e8] font-bold">{item.contactNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 italic mb-0">No emergency contacts added</p>
          </div>
        )}
      </Card>

      {/* SPECIAL PERSONS */}
      <Card sx={{ 
        p: 3, 
        mb: 3,
        border: "1px solid #e5e7eb", 
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-0">Special Persons</h2>
          {isEditing && (
            <Button 
              type="button" 
              onClick={() => setFormData(prev => ({ ...prev, specialPersons: [...prev.specialPersons, { name: '', achievement: '', description: '' }] }))} 
              startIcon={<Plus size={18} />} 
              size="small"
              sx={{ 
                backgroundColor: '#1348e8',
                color: "white",
                "&:hover": { backgroundColor: "#0d3a9d" },
                fontSize: "0.875rem"
              }}
            >
              Add Person
            </Button>
          )}
        </div>
        
        {formData.specialPersons.length > 0 ? (
          <div className="flex flex-col gap-3">
            {formData.specialPersons.map((item, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0">Person {i + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.filter((_, idx) => idx !== i) }))} 
                        sx={{ 
                          minWidth: 'auto', 
                          p: 1, 
                          color: '#ef4444',
                          "&:hover": { backgroundColor: "#fee2e2" }
                        }}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    <TextField 
                      label="Name" 
                      value={item.name} 
                      onChange={(e) => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.map((sp, idx) => idx === i ? { ...sp, name: e.target.value } : sp) }))} 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.9375rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Achievement" 
                      value={item.achievement} 
                      onChange={(e) => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.map((sp, idx) => idx === i ? { ...sp, achievement: e.target.value } : sp) }))} 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.9375rem'
                        }
                      }}
                    />
                    <TextField 
                      label="Description" 
                      value={item.description} 
                      onChange={(e) => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.map((sp, idx) => idx === i ? { ...sp, description: e.target.value } : sp) }))} 
                      multiline 
                      rows={2} 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.9375rem'
                        }
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-[#1348e8] font-medium mb-2">{item.achievement}</p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-0">{item.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 italic mb-0">No special persons added</p>
          </div>
        )}
      </Card>
    
    </form>
  </div>
</>);
}
//   return (
//     <>
//       {isSaving && <div className="fixed inset-0 z-[9999]"><Loader message="Saving..." /></div>}
      
//       <div className="p-4 md:p-6 max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <Link href="/admin/panchayats" className="no-underline">
//               <Button variant="outlined" sx={{ borderColor: "#1348e8", color: "#1348e8", minWidth: "auto", p: 1.5 }}>
//                 <ArrowLeft size={20} />
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-2xl font-bold">{selectedPanchayat.name}</h1>
//               <div className="text-sm text-gray-600">{isEditing ? 'Edit details' : 'View details'}</div>
//             </div>
//           </div>
          
//           {!isEditing ? (
//             <Button onClick={() => setIsEditing(true)} startIcon={<Edit size={20} />} sx={{ backgroundColor: "#1348e8" }}>
//               Edit
//             </Button>
//           ) : (
//             <div className="flex gap-2">
//               <Button onClick={handleCancel} variant="outlined">Cancel</Button>
//               <Button onClick={handleSubmit} disabled={isSaving} startIcon={<Save size={20} />} sx={{ backgroundColor: "#1348e8" }}>
//                 {isSaving ? 'Saving...' : 'Save'}
//               </Button>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* HEADER IMAGE */}
//           <div className="border rounded-lg overflow-hidden">
//             {preview && <img src={preview} alt={selectedPanchayat.name} className="w-full h-64 md:h-80 object-cover" />}
//           </div>

//           {isEditing && (
//             <Card sx={{ p: 3 }}>
//               <h3 className="font-semibold mb-3">Update Header Image</h3>
//               <div className="flex border-b mb-4">
//                 <button type="button" onClick={() => { setUploadMethod('url'); setFile(null); }} className={`px-4 py-2 border-b-2 ${uploadMethod === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
//                   <LinkIcon size={18} className="inline mr-2" />URL
//                 </button>
//                 <button type="button" onClick={() => setUploadMethod('file')} className={`px-4 py-2 border-b-2 ${uploadMethod === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
//                   <CloudUpload size={18} className="inline mr-2" />File
//                 </button>
//               </div>

//               {uploadMethod === 'file' ? (
//                 !file ? (
//                   <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
//                     <CloudUpload size={36} className="mx-auto mb-2" />
//                     <div>Click to upload</div>
//                   </div>
//                 ) : (
//                   <div className="border rounded-lg p-4">
//                     <div className="flex justify-between mb-2">
//                       <span>{file.name}</span>
//                       <button type="button" onClick={() => { setFile(null); setPreview(formData.headerImage); }}><X size={20} /></button>
//                     </div>
//                     {preview && <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded" />}
//                   </div>
//                 )
//               ) : (
//                 <TextField label="Image URL" value={formData.headerImage} onChange={(e) => { setFormData({ ...formData, headerImage: e.target.value }); setPreview(e.target.value); }} fullWidth />
//               )}
//               <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
//             </Card>
//           )}

//           {/* BASIC INFO */}
//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Basic Information</h2>
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} fullWidth />
//                 <TextField label="Slug" value={formData.slug} disabled fullWidth />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <SelectField label="District *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} options={[{ value: '', label: 'Select' }, ...districts.map(d => ({ value: d._id, label: d.name }))]} disabled={!isEditing} fullWidth />
//                 <TextField label="Block *" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} disabled={!isEditing} fullWidth />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Establishment Year" type="number" value={formData.basicInfo.establishmentYear} onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, establishmentYear: e.target.value } })} disabled={!isEditing} startIcon={<Calendar size={20} />} fullWidth />
//                 <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'Draft', label: 'Draft' }, { value: 'Pending', label: 'Pending' }, { value: 'Verified', label: 'Verified' }]} disabled={!isEditing} fullWidth />
//               </div>
//             </div>
//           </Card>

//           {/* STATISTICS */}
//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Statistics</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <TextField label="Population" type="number" value={formData.basicInfo.population} onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, population: e.target.value } })} disabled={!isEditing} startIcon={<Users size={20} />} fullWidth />
//               <TextField label="Area (sq km)" type="number" value={formData.basicInfo.area} onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, area: e.target.value } })} disabled={!isEditing} startIcon={<Maximize size={20} />} fullWidth />
//             </div>
//           </Card>

//           {/* COORDINATES */}
//           <Card sx={{ p: 3 }}>
//             <div className="flex items-center gap-2 mb-4">
//               <MapPin size={20} />
//               <h2 className="text-xl font-bold">Coordinates</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} disabled={!isEditing} fullWidth />
//               <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} disabled={!isEditing} fullWidth />
//             </div>
//           </Card>

//           {/* GEOGRAPHY */}
//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Geography</h2>
            
//             <div className="mb-4">
//               <h3 className="font-semibold mb-2">Major Rivers</h3>
//               {isEditing && (
//                 <div className="flex gap-2 mb-3">
//                   <TextField value={tempRiver} onChange={(e) => setTempRiver(e.target.value)} placeholder="River name" fullWidth />
//                   <Button type="button" onClick={() => tempRiver.trim() && (setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, majorRivers: [...prev.basicInfo.majorRivers, tempRiver.trim()] } })), setTempRiver(''))} sx={{ backgroundColor: '#1348e8' }}>Add</Button>
//                 </div>
//               )}
//               <div className="flex flex-wrap gap-2">
//                 {formData.basicInfo.majorRivers.map((river, i) => (
//                   <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
//                     {river}
//                     {isEditing && (
//                       <button type="button" onClick={() => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, majorRivers: prev.basicInfo.majorRivers.filter((_, idx) => idx !== i) } }))}><X size={14} /></button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h3 className="font-semibold mb-2">Languages Spoken</h3>
//               {isEditing && (
//                 <div className="flex gap-2 mb-3">
//                   <TextField value={tempLanguage} onChange={(e) => setTempLanguage(e.target.value)} placeholder="Language name" fullWidth />
//                   <Button type="button" onClick={() => tempLanguage.trim() && (setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, languagesSpoken: [...prev.basicInfo.languagesSpoken, tempLanguage.trim()] } })), setTempLanguage(''))} sx={{ backgroundColor: '#1348e8' }}>Add</Button>
//                 </div>
//               )}
//               <div className="flex flex-wrap gap-2">
//                 {formData.basicInfo.languagesSpoken.map((lang, i) => (
//                   <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
//                     {lang}
//                     {isEditing && (
//                       <button type="button" onClick={() => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, languagesSpoken: prev.basicInfo.languagesSpoken.filter((_, idx) => idx !== i) } }))}><X size={14} /></button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Card>

//           {/* CULTURAL INFO */}
//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Cultural Information</h2>
//             <div className="space-y-4">
//               <TextField label="Historical Background" value={formData.culturalInfo.historicalBackground} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, historicalBackground: e.target.value } })} multiline rows={4} disabled={!isEditing} fullWidth />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Local Art" value={formData.culturalInfo.localArt} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, localArt: e.target.value } })} multiline rows={3} disabled={!isEditing} fullWidth />
//                 <TextField label="Local Cuisine" value={formData.culturalInfo.localCuisine} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, localCuisine: e.target.value } })} multiline rows={3} disabled={!isEditing} fullWidth />
//               </div>
//               <TextField label="Traditions" value={formData.culturalInfo.traditions} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, traditions: e.target.value } })} multiline rows={3} disabled={!isEditing} fullWidth />
//             </div>
//           </Card>
// {/* POLITICAL OVERVIEW - EDITABLE */}
// <Card sx={{ p: 3 }}>
//   <div className="flex items-center justify-between mb-4">
//     <h2 className="text-xl font-bold">Political Overview</h2>
//     {isEditing && (
//       <Button type="button" onClick={() => setFormData(prev => ({ ...prev, politicalOverview: [...prev.politicalOverview, { heading: '', description: '' }] }))} startIcon={<Plus size={18} />} sx={{ backgroundColor: '#1348e8' }}>
//         Add Section
//       </Button>
//     )}
//   </div>
  
//   {formData.politicalOverview.length > 0 ? (
//     <div className="space-y-3">
//       {formData.politicalOverview.map((item, i) => (
//         <div key={i} className="p-4 border rounded bg-gray-50">
//           {isEditing ? (
//             <div className="space-y-3">
//               <div className="flex justify-between items-start">
//                 <h3 className="font-semibold">Section {i + 1}</h3>
//                 <Button type="button" onClick={() => setFormData(prev => ({ ...prev, politicalOverview: prev.politicalOverview.filter((_, idx) => idx !== i) }))} sx={{ minWidth: 'auto', p: 1, color: '#ef4444' }}>
//                   <Trash2 size={18} />
//                 </Button>
//               </div>
//               <SelectField label="Heading" value={item.heading} onChange={(e) => setFormData(prev => ({ ...prev, politicalOverview: prev.politicalOverview.map((po, idx) => idx === i ? { ...po, heading: e.target.value } : po) }))} options={politicalHeadingOptions} fullWidth />
//               <TextField label="Description" value={item.description} onChange={(e) => setFormData(prev => ({ ...prev, politicalOverview: prev.politicalOverview.map((po, idx) => idx === i ? { ...po, description: e.target.value } : po) }))} multiline rows={3} fullWidth />
//             </div>
//           ) : (
//             <>
//               <h3 className="font-bold mb-2">{item.heading}</h3>
//               <p className="text-gray-700 text-sm">{item.description}</p>
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   ) : (
//     <div className="text-center py-8 text-gray-500">No political overview sections</div>
//   )}
// </Card>

// {/* TRANSPORTATION SERVICES - EDITABLE */}
// <Card sx={{ p: 3 }}>
//   <div className="flex items-center justify-between mb-4">
//     <h2 className="text-xl font-bold">Transportation Services</h2>
//     {isEditing && (
//       <Button type="button" onClick={() => setFormData(prev => ({ ...prev, transportationServices: [...prev.transportationServices, { name: '', type: '', location: '' }] }))} startIcon={<Plus size={18} />} sx={{ backgroundColor: '#1348e8' }}>
//         Add Service
//       </Button>
//     )}
//   </div>
  
//   {formData.transportationServices.length > 0 ? (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//       {formData.transportationServices.map((item, i) => (
//         <div key={i} className="p-3 border rounded bg-gray-50">
//           {isEditing ? (
//             <div className="space-y-2">
//               <div className="flex justify-between items-start mb-2">
//                 <h3 className="font-semibold text-sm">Service {i + 1}</h3>
//                 <Button type="button" onClick={() => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.filter((_, idx) => idx !== i) }))} sx={{ minWidth: 'auto', p: 0.5, color: '#ef4444' }}>
//                   <Trash2 size={14} />
//                 </Button>
//               </div>
//               <TextField label="Name" value={item.name} onChange={(e) => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t) }))} size="small" fullWidth />
//               <TextField label="Type" value={item.type} onChange={(e) => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.map((t, idx) => idx === i ? { ...t, type: e.target.value } : t) }))} size="small" fullWidth />
//               <TextField label="Location" value={item.location} onChange={(e) => setFormData(prev => ({ ...prev, transportationServices: prev.transportationServices.map((t, idx) => idx === i ? { ...t, location: e.target.value } : t) }))} size="small" fullWidth />
//             </div>
//           ) : (
//             <>
//               <div className="font-bold text-sm">{item.name}</div>
//               <div className="text-xs text-gray-600">{item.type}</div>
//               <div className="text-xs">{item.location}</div>
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   ) : (
//     <div className="text-center py-8 text-gray-500">No transportation services</div>
//   )}
// </Card>

// {/* HOSPITALITY SERVICES - EDITABLE */}
// <Card sx={{ p: 3 }}>
//   <div className="flex items-center justify-between mb-4">
//     <h2 className="text-xl font-bold">Hospitality Services</h2>
//     {isEditing && (
//       <Button type="button" onClick={() => setFormData(prev => ({ ...prev, hospitalityServices: [...prev.hospitalityServices, { name: '', type: '', location: '', contact: { phone: '' } }] }))} startIcon={<Plus size={18} />} sx={{ backgroundColor: '#1348e8' }}>
//         Add Service
//       </Button>
//     )}
//   </div>
  
//   {formData.hospitalityServices.length > 0 ? (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//       {formData.hospitalityServices.map((item, i) => (
//         <div key={i} className="p-3 border rounded bg-gray-50">
//           {isEditing ? (
//             <div className="space-y-2">
//               <div className="flex justify-between items-start mb-2">
//                 <h3 className="font-semibold text-sm">Service {i + 1}</h3>
//                 <Button type="button" onClick={() => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.filter((_, idx) => idx !== i) }))} sx={{ minWidth: 'auto', p: 0.5, color: '#ef4444' }}>
//                   <Trash2 size={14} />
//                 </Button>
//               </div>
//               <TextField label="Name" value={item.name} onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, name: e.target.value } : h) }))} size="small" fullWidth />
//               <TextField label="Type" value={item.type} onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, type: e.target.value } : h) }))} size="small" fullWidth />
//               <TextField label="Location" value={item.location} onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, location: e.target.value } : h) }))} size="small" fullWidth />
//               <TextField label="Phone" value={item.contact?.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, hospitalityServices: prev.hospitalityServices.map((h, idx) => idx === i ? { ...h, contact: { phone: e.target.value } } : h) }))} size="small" fullWidth />
//             </div>
//           ) : (
//             <>
//               <div className="font-bold text-sm">{item.name}</div>
//               <div className="text-xs text-gray-600">{item.type}</div>
//               <div className="text-xs">{item.location}</div>
//               {item.contact?.phone && <div className="text-xs text-blue-600">{item.contact.phone}</div>}
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   ) : (
//     <div className="text-center py-8 text-gray-500">No hospitality services</div>
//   )}
// </Card>

// {/* EMERGENCY DIRECTORY - EDITABLE */}
// <Card sx={{ p: 3 }}>
//   <div className="flex items-center justify-between mb-4">
//     <h2 className="text-xl font-bold">Emergency Directory</h2>
//     {isEditing && (
//       <Button type="button" onClick={() => setFormData(prev => ({ ...prev, emergencyDirectory: [...prev.emergencyDirectory, { service: '', contactNumber: '' }] }))} startIcon={<Plus size={18} />} sx={{ backgroundColor: '#1348e8' }}>
//         Add Contact
//       </Button>
//     )}
//   </div>
  
//   {formData.emergencyDirectory.length > 0 ? (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//       {formData.emergencyDirectory.map((item, i) => (
//         <div key={i} className="p-3 border rounded bg-gray-50">
//           {isEditing ? (
//             <div className="space-y-2">
//               <div className="flex justify-between items-start mb-2">
//                 <h3 className="font-semibold text-sm">Contact {i + 1}</h3>
//                 <Button type="button" onClick={() => setFormData(prev => ({ ...prev, emergencyDirectory: prev.emergencyDirectory.filter((_, idx) => idx !== i) }))} sx={{ minWidth: 'auto', p: 0.5, color: '#ef4444' }}>
//                   <Trash2 size={14} />
//                 </Button>
//               </div>
//               <TextField label="Service" value={item.service} onChange={(e) => setFormData(prev => ({ ...prev, emergencyDirectory: prev.emergencyDirectory.map((e, idx) => idx === i ? { ...e, service: e.target.value } : e) }))} size="small" fullWidth />
//               <TextField label="Contact Number" value={item.contactNumber} onChange={(e) => setFormData(prev => ({ ...prev, emergencyDirectory: prev.emergencyDirectory.map((em, idx) => idx === i ? { ...em, contactNumber: e.target.value } : em) }))} size="small" fullWidth />
//             </div>
//           ) : (
//             <div className="flex justify-between items-center">
//               <span className="font-medium text-sm">{item.service}</span>
//               <span className="text-blue-600 font-bold text-sm">{item.contactNumber}</span>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   ) : (
//     <div className="text-center py-8 text-gray-500">No emergency contacts</div>
//   )}
// </Card>

// {/* SPECIAL PERSONS - EDITABLE */}
// <Card sx={{ p: 3 }}>
//   <div className="flex items-center justify-between mb-4">
//     <h2 className="text-xl font-bold">Special Persons</h2>
//     {isEditing && (
//       <Button type="button" onClick={() => setFormData(prev => ({ ...prev, specialPersons: [...prev.specialPersons, { name: '', achievement: '', description: '' }] }))} startIcon={<Plus size={18} />} sx={{ backgroundColor: '#1348e8' }}>
//         Add Person
//       </Button>
//     )}
//   </div>
  
//   {formData.specialPersons.length > 0 ? (
//     <div className="space-y-3">
//       {formData.specialPersons.map((item, i) => (
//         <div key={i} className="p-4 border rounded bg-gray-50">
//           {isEditing ? (
//             <div className="space-y-3">
//               <div className="flex justify-between items-start">
//                 <h3 className="font-semibold">Person {i + 1}</h3>
//                 <Button type="button" onClick={() => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.filter((_, idx) => idx !== i) }))} sx={{ minWidth: 'auto', p: 1, color: '#ef4444' }}>
//                   <Trash2 size={18} />
//                 </Button>
//               </div>
//               <TextField label="Name" value={item.name} onChange={(e) => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.map((sp, idx) => idx === i ? { ...sp, name: e.target.value } : sp) }))} fullWidth />
//               <TextField label="Achievement" value={item.achievement} onChange={(e) => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.map((sp, idx) => idx === i ? { ...sp, achievement: e.target.value } : sp) }))} fullWidth />
//               <TextField label="Description" value={item.description} onChange={(e) => setFormData(prev => ({ ...prev, specialPersons: prev.specialPersons.map((sp, idx) => idx === i ? { ...sp, description: e.target.value } : sp) }))} multiline rows={2} fullWidth />
//             </div>
//           ) : (
//             <>
//               <h3 className="font-bold text-lg">{item.name}</h3>
//               <div className="text-blue-600 font-medium text-sm mb-2">{item.achievement}</div>
//               <p className="text-gray-700 text-sm">{item.description}</p>
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   ) : (
//     <div className="text-center py-8 text-gray-500">No special persons</div>
//   )}
// </Card>
        
//         </form>
//       </div>
//     </>
//   );








  {/* READ-ONLY SECTIONS FOR OTHER DATA */}
          // {formData.politicalOverview.length > 0 && (
          //   <Card sx={{ p: 3 }}>
          //     <h2 className="text-xl font-bold mb-4">Political Overview</h2>
          //     <div className="space-y-3">
          //       {formData.politicalOverview.map((item, i) => (
          //         <div key={i} className="p-4 border rounded bg-gray-50">
          //           <h3 className="font-bold mb-2">{item.heading}</h3>
          //           <p className="text-gray-700 text-sm">{item.description}</p>
          //         </div>
          //       ))}
          //     </div>
          //   </Card>
          // )}

          // {formData.transportationServices.length > 0 && (
          //   <Card sx={{ p: 3 }}>
          //     <h2 className="text-xl font-bold mb-4">Transportation Services</h2>
          //     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          //       {formData.transportationServices.map((item, i) => (
          //         <div key={i} className="p-3 border rounded bg-gray-50">
          //           <div className="font-bold text-sm">{item.name}</div>
          //           <div className="text-xs text-gray-600">{item.type}</div>
          //           <div className="text-xs">{item.location}</div>
          //         </div>
          //       ))}
          //     </div>
          //   </Card>
          // )}

          // {formData.hospitalityServices.length > 0 && (
          //   <Card sx={{ p: 3 }}>
          //     <h2 className="text-xl font-bold mb-4">Hospitality Services</h2>
          //     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          //       {formData.hospitalityServices.map((item, i) => (
          //         <div key={i} className="p-3 border rounded bg-gray-50">
          //           <div className="font-bold text-sm">{item.name}</div>
          //           <div className="text-xs text-gray-600">{item.type}</div>
          //           <div className="text-xs">{item.location}</div>
          //           {item.contact?.phone && <div className="text-xs text-blue-600">{item.contact.phone}</div>}
          //         </div>
          //       ))}
          //     </div>
          //   </Card>
          // )}

          // {formData.emergencyDirectory.length > 0 && (
          //   <Card sx={{ p: 3 }}>
          //     <h2 className="text-xl font-bold mb-4">Emergency Directory</h2>
          //     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          //       {formData.emergencyDirectory.map((item, i) => (
          //         <div key={i} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
          //           <span className="font-medium text-sm">{item.service}</span>
          //           <span className="text-blue-600 font-bold text-sm">{item.contactNumber}</span>
          //         </div>
          //       ))}
          //     </div>
          //   </Card>
          // )}

          // {formData.specialPersons.length > 0 && (
          //   <Card sx={{ p: 3 }}>
          //     <h2 className="text-xl font-bold mb-4">Special Persons</h2>
          //     <div className="space-y-3">
          //       {formData.specialPersons.map((item, i) => (
          //         <div key={i} className="p-4 border rounded bg-gray-50">
          //           <h3 className="font-bold text-lg">{item.name}</h3>
          //           <div className="text-blue-600 font-medium text-sm mb-2">{item.achievement}</div>
          //           <p className="text-gray-700 text-sm">{item.description}</p>
          //         </div>
          //       ))}
          //     </div>
          //   </Card>
          // )}












// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft, Save, MapPin, CloudUpload, Link as LinkIcon, X, Edit,
//   Calendar, Users, Maximize, Plus, Minus
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';

// const POLITICAL_HEADINGS = [
//   'Current Leadership', 'Political History', 'Governing Structure',
//   'Major Achievements', 'Recent Developments', 'Election History',
//   'Administrative Setup', 'Future Plans', 'Public Participation', 'Key Challenges'
// ];

// const TRANSPORT_TYPES = ['Bus Stop', 'Railway Station', 'Taxi Stand', 'Auto Stand', 'Bus Depot'];
// const HOSPITALITY_TYPES = ['Hotel', 'Resort', 'Restaurant', 'Dhaba', 'Lodging', 'Guest House'];
// const EMERGENCY_SERVICES = [
//   'Police', 'Fire Station', 'Ambulance', 'Hospital', 'Medical Center',
//   'Emergency Helpline', 'Women Helpline', 'Child Helpline', 'Disaster Management',
//   'Electricity Emergency', 'Water Supply Emergency', 'Gas Leak Emergency',
//   'Road Maintenance', 'Forest Department', 'Wildlife Rescue'
// ];

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
//     coordinates: { lat: '', lng: '' },
//     basicInfo: { establishmentYear: '', population: '', area: '', majorRivers: [] },
//     culturalInfo: { historicalBackground: '', traditions: '', localCuisine: '', localArt: '' },
//     politicalOverview: [],
//     transportationServices: [],
//     hospitalityServices: [],
//     emergencyDirectory: [],
//     specialPersons: [],
//     status: 'Pending'
//   });
//   const [errors, setErrors] = useState({});
//   const [tempRiver, setTempRiver] = useState('');
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }));
//     if (params.id) dispatch(fetchPanchayatById(params.id));
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
//         basicInfo: {
//           establishmentYear: selectedPanchayat.basicInfo?.establishmentYear || '',
//           population: selectedPanchayat.basicInfo?.population || '',
//           area: selectedPanchayat.basicInfo?.area || '',
//           majorRivers: selectedPanchayat.basicInfo?.majorRivers || []
//         },
//         culturalInfo: {
//           historicalBackground: selectedPanchayat.culturalInfo?.historicalBackground || '',
//           traditions: selectedPanchayat.culturalInfo?.traditions || '',
//           localCuisine: selectedPanchayat.culturalInfo?.localCuisine || '',
//           localArt: selectedPanchayat.culturalInfo?.localArt || ''
//         },
//         politicalOverview: selectedPanchayat.politicalOverview || [],
//         transportationServices: selectedPanchayat.transportationServices || [],
//         hospitalityServices: selectedPanchayat.hospitalityServices || [],
//         emergencyDirectory: selectedPanchayat.emergencyDirectory || [],
//         specialPersons: selectedPanchayat.specialPersons || [],
//         status: selectedPanchayat.status || 'Pending'
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
//       setIsSaving(false);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update panchayat');
//       dispatch(clearError());
//       setIsSaving(false);
//     }
//   }, [success, error, dispatch]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//     if (!validTypes.includes(selectedFile.type)) {
//       toast.error('Invalid image type');
//       return;
//     }

//     if (selectedFile.size > 95 * 1024 * 1024) {
//       toast.error('File too large');
//       return;
//     }

//     setFile(selectedFile);
//     const reader = new FileReader();
//     reader.onload = (event) => setPreview(event.target.result);
//     reader.readAsDataURL(selectedFile);
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = 'Name required';
//     if (!formData.district) newErrors.district = 'District required';
//     if (!formData.block.trim()) newErrors.block = 'Block required';
//     if (uploadMethod === 'file' && !file) newErrors.headerImage = 'Image required';
//     if (uploadMethod === 'url' && !formData.headerImage.trim()) newErrors.headerImage = 'Image URL required';
//     if (!formData.coordinates.lat) newErrors.lat = 'Latitude required';
//     if (!formData.coordinates.lng) newErrors.lng = 'Longitude required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Fix errors');
//       return;
//     }

//     setIsSaving(true);

//     try {
//       const submitData = new FormData();
      
//       if (uploadMethod === 'file' && file) {
//         submitData.append('headerImage', file);
//         submitData.append('uploadMethod', 'file');
//       } else {
//         submitData.append('headerImageUrl', formData.headerImage);
//         submitData.append('uploadMethod', 'url');
//       }

//       submitData.append('name', formData.name);
//       submitData.append('slug', formData.slug);
//       submitData.append('district', formData.district);
//       submitData.append('block', formData.block);
//       submitData.append('coordinates[lat]', formData.coordinates.lat);
//       submitData.append('coordinates[lng]', formData.coordinates.lng);
//       submitData.append('status', formData.status);

//       Object.entries(formData.basicInfo).forEach(([key, value]) => {
//         if (key === 'majorRivers') {
//           submitData.append(`basicInfo[${key}]`, value.join(','));
//         } else if (value) {
//           submitData.append(`basicInfo[${key}]`, value);
//         }
//       });

//       Object.entries(formData.culturalInfo).forEach(([key, value]) => {
//         if (value) submitData.append(`culturalInfo[${key}]`, value);
//       });

//       if (formData.politicalOverview.length) {
//         submitData.append('politicalOverview', JSON.stringify(formData.politicalOverview));
//       }
//       if (formData.transportationServices.length) {
//         submitData.append('transportationServices', JSON.stringify(formData.transportationServices));
//       }
//       if (formData.hospitalityServices.length) {
//         submitData.append('hospitalityServices', JSON.stringify(formData.hospitalityServices));
//       }
//       if (formData.emergencyDirectory.length) {
//         submitData.append('emergencyDirectory', JSON.stringify(formData.emergencyDirectory));
//       }
//       if (formData.specialPersons.length) {
//         submitData.append('specialPersons', JSON.stringify(formData.specialPersons));
//       }

//       await dispatch(updatePanchayat({ id: params.id, panchayatData: submitData })).unwrap();
//     } catch (err) {
//       console.error(err);
//       setIsSaving(false);
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
//         basicInfo: {
//           establishmentYear: selectedPanchayat.basicInfo?.establishmentYear || '',
//           population: selectedPanchayat.basicInfo?.population || '',
//           area: selectedPanchayat.basicInfo?.area || '',
//           majorRivers: selectedPanchayat.basicInfo?.majorRivers || []
//         },
//         culturalInfo: {
//           historicalBackground: selectedPanchayat.culturalInfo?.historicalBackground || '',
//           traditions: selectedPanchayat.culturalInfo?.traditions || '',
//           localCuisine: selectedPanchayat.culturalInfo?.localCuisine || '',
//           localArt: selectedPanchayat.culturalInfo?.localArt || ''
//         },
//         politicalOverview: selectedPanchayat.politicalOverview || [],
//         transportationServices: selectedPanchayat.transportationServices || [],
//         hospitalityServices: selectedPanchayat.hospitalityServices || [],
//         emergencyDirectory: selectedPanchayat.emergencyDirectory || [],
//         specialPersons: selectedPanchayat.specialPersons || [],
//         status: selectedPanchayat.status || 'Pending'
//       });
//       setPreview(selectedPanchayat.headerImage || null);
//     }
//     setErrors({});
//   };

//   if (loading && !selectedPanchayat) return <div className="fixed inset-0 z-[9999]"><Loader message="Loading..." /></div>;

//   if (!selectedPanchayat) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-gray-600 mb-4">Panchayat not found</div>
//         <Link href="/admin/panchayats" className="no-underline">
//           <Button sx={{ backgroundColor: "#1348e8" }}>Back to Panchayats</Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <>
//       {isSaving && <div className="fixed inset-0 z-[9999]"><Loader message="Saving..." /></div>}
      
//       <div className="p-4 md:p-6 max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <Link href="/admin/panchayats" className="no-underline">
//               <Button variant="outlined" sx={{ borderColor: "#1348e8", color: "#1348e8", minWidth: "auto", p: 1.5 }}>
//                 <ArrowLeft size={20} />
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-2xl font-bold">{selectedPanchayat.name}</h1>
//               <div className="text-sm text-gray-600">{isEditing ? 'Edit details' : 'View details'}</div>
//             </div>
//           </div>
          
//           {!isEditing ? (
//             <Button onClick={() => setIsEditing(true)} startIcon={<Edit size={20} />} sx={{ backgroundColor: "#1348e8" }}>
//               Edit
//             </Button>
//           ) : (
//             <div className="flex gap-2">
//               <Button onClick={handleCancel} variant="outlined">Cancel</Button>
//               <Button onClick={handleSubmit} disabled={isSaving} startIcon={<Save size={20} />} sx={{ backgroundColor: "#1348e8" }}>
//                 {isSaving ? 'Saving...' : 'Save'}
//               </Button>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="border rounded-lg overflow-hidden">
//             {preview && <img src={preview} alt={selectedPanchayat.name} className="w-full h-64 md:h-80 object-cover" />}
//           </div>

//           {isEditing && (
//             <Card sx={{ p: 3 }}>
//               <h3 className="font-semibold mb-3">Update Header Image</h3>
//               <div className="flex border-b mb-4">
//                 <button type="button" onClick={() => { setUploadMethod('url'); setFile(null); }} className={`px-4 py-2 border-b-2 ${uploadMethod === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
//                   <LinkIcon size={18} className="inline mr-2" />URL
//                 </button>
//                 <button type="button" onClick={() => setUploadMethod('file')} className={`px-4 py-2 border-b-2 ${uploadMethod === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
//                   <CloudUpload size={18} className="inline mr-2" />File
//                 </button>
//               </div>

//               {uploadMethod === 'file' ? (
//                 !file ? (
//                   <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
//                     <CloudUpload size={36} className="mx-auto mb-2" />
//                     <div>Click to upload</div>
//                   </div>
//                 ) : (
//                   <div className="border rounded-lg p-4">
//                     <div className="flex justify-between mb-2">
//                       <span>{file.name}</span>
//                       <button type="button" onClick={() => { setFile(null); setPreview(formData.headerImage); }}><X size={20} /></button>
//                     </div>
//                     {preview && <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded" />}
//                   </div>
//                 )
//               ) : (
//                 <TextField label="Image URL" value={formData.headerImage} onChange={(e) => { setFormData({ ...formData, headerImage: e.target.value }); setPreview(e.target.value); }} fullWidth />
//               )}
//               <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
//             </Card>
//           )}

//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Basic Information</h2>
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!isEditing} fullWidth />
//                 <TextField label="Slug" value={formData.slug} disabled fullWidth />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <SelectField label="District *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} options={[{ value: '', label: 'Select' }, ...districts.map(d => ({ value: d._id, label: d.name }))]} disabled={!isEditing} fullWidth />
//                 <TextField label="Block *" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} disabled={!isEditing} fullWidth />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Establishment Year" type="number" value={formData.basicInfo.establishmentYear} onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, establishmentYear: e.target.value } })} disabled={!isEditing} startIcon={<Calendar size={20} />} fullWidth />
//                 <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'Draft', label: 'Draft' }, { value: 'Pending', label: 'Pending' }, { value: 'Verified', label: 'Verified' }]} disabled={!isEditing} fullWidth />
//               </div>
//             </div>
//           </Card>

//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Statistics</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <TextField label="Population" type="number" value={formData.basicInfo.population} onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, population: e.target.value } })} disabled={!isEditing} startIcon={<Users size={20} />} fullWidth />
//               <TextField label="Area (sq km)" type="number" value={formData.basicInfo.area} onChange={(e) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, area: e.target.value } })} disabled={!isEditing} startIcon={<Maximize size={20} />} fullWidth />
//             </div>
//           </Card>

//           <Card sx={{ p: 3 }}>
//             <div className="flex items-center gap-2 mb-4">
//               <MapPin size={20} />
//               <h2 className="text-xl font-bold">Coordinates</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} disabled={!isEditing} fullWidth />
//               <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} disabled={!isEditing} fullWidth />
//             </div>
//           </Card>

//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Major Rivers</h2>
//             {isEditing && (
//               <div className="flex gap-2 mb-3">
//                 <TextField value={tempRiver} onChange={(e) => setTempRiver(e.target.value)} placeholder="River name" fullWidth />
//                 <Button type="button" onClick={() => tempRiver.trim() && (setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, majorRivers: [...prev.basicInfo.majorRivers, tempRiver.trim()] } })), setTempRiver(''))} sx={{ backgroundColor: '#1348e8' }}>Add</Button>
//               </div>
//             )}
//             <div className="flex flex-wrap gap-2">
//               {formData.basicInfo.majorRivers.map((river, i) => (
//                 <div key={i} className="flex items-center gap-2 bg-blue-50 border rounded-full px-3 py-1">
//                   {river}
//                   {isEditing && (
//                     <button type="button" onClick={() => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, majorRivers: prev.basicInfo.majorRivers.filter((_, idx) => idx !== i) } }))}><X size={14} /></button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </Card>

//           <Card sx={{ p: 3 }}>
//             <h2 className="text-xl font-bold mb-4">Cultural Information</h2>
//             <div className="space-y-4">
//               <TextField label="Historical Background" value={formData.culturalInfo.historicalBackground} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, historicalBackground: e.target.value } })} multiline rows={4} disabled={!isEditing} fullWidth />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Local Art" value={formData.culturalInfo.localArt} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, localArt: e.target.value } })} multiline rows={3} disabled={!isEditing} fullWidth />
//                 <TextField label="Local Cuisine" value={formData.culturalInfo.localCuisine} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, localCuisine: e.target.value } })} multiline rows={3} disabled={!isEditing} fullWidth />
//               </div>
//               <TextField label="Traditions" value={formData.culturalInfo.traditions} onChange={(e) => setFormData({ ...formData, culturalInfo: { ...formData.culturalInfo, traditions: e.target.value } })} multiline rows={3} disabled={!isEditing} fullWidth />
//             </div>
//           </Card>

//           {formData.politicalOverview.length > 0 && (
//             <Card sx={{ p: 3 }}>
//               <h2 className="text-xl font-bold mb-4">Political Overview</h2>
//               {formData.politicalOverview.map((item, i) => (
//                 <div key={i} className="mb-4 p-4 border rounded">
//                   <h3 className="font-bold mb-2">{item.heading}</h3>
//                   <p className="text-gray-700">{item.description}</p>
//                 </div>
//               ))}
//             </Card>
//           )}

//           {formData.transportationServices.length > 0 && (
//             <Card sx={{ p: 3 }}>
//               <h2 className="text-xl font-bold mb-4">Transportation Services</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {formData.transportationServices.map((item, i) => (
//                   <div key={i} className="p-3 border rounded">
//                     <div className="font-bold">{item.name}</div>
//                     <div className="text-sm text-gray-600">{item.type}</div>
//                     <div className="text-sm">{item.location}</div>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           )}

//           {formData.hospitalityServices.length > 0 && (
//             <Card sx={{ p: 3 }}>
//               <h2 className="text-xl font-bold mb-4">Hospitality Services</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {formData.hospitalityServices.map((item, i) => (
//                   <div key={i} className="p-3 border rounded">
//                     <div className="font-bold">{item.name}</div>
//                     <div className="text-sm text-gray-600">{item.type}</div>
//                     <div className="text-sm">{item.location}</div>
//                     {item.contact?.phone && <div className="text-sm text-blue-600">{item.contact.phone}</div>}
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           )}

//           {formData.emergencyDirectory.length > 0 && (
//             <Card sx={{ p: 3 }}>
//               <h2 className="text-xl font-bold mb-4">Emergency Directory</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {formData.emergencyDirectory.map((item, i) => (
//                   <div key={i} className="p-3 border rounded flex justify-between">
//                     <span className="font-medium">{item.service}</span>
//                     <span className="text-blue-600 font-bold">{item.contactNumber}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           )}

//           {formData.specialPersons.length > 0 && (
//             <Card sx={{ p: 3 }}>
//               <h2 className="text-xl font-bold mb-4">Special Persons</h2>
//               {formData.specialPersons.map((item, i) => (
//                 <div key={i} className="mb-4 p-4 border rounded">
//                   <h3 className="font-bold text-lg">{item.name}</h3>
//                   <div className="text-blue-600 font-medium mb-2">{item.achievement}</div>
//                   <p className="text-gray-700">{item.description}</p>
//                 </div>
//               ))}
//             </Card>
//           )}
//         </form>
//       </div>
//     </>
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
//   const [isSaving, setIsSaving] = useState(false);

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
//       setIsSaving(false);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update panchayat');
//       dispatch(clearError());
//       setIsSaving(false);
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

//     setIsSaving(true);

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
//       setIsSaving(false);
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
//           <Button 
//             sx={{
//               backgroundColor: "#1348e8",
//               color: "white",
//               "&:hover": { backgroundColor: "#0d3a9d" },
//               mt: 2
//             }}
//           >
//             Back to Panchayats
//           </Button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Saving Loader */}
//       {isSaving && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Saving..."} />
//         </div>
//       )}
      
//       <div className="p-4 md:p-6 max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//           <div className="flex items-center gap-4">
//             <Link href="/admin/panchayats" className="no-underline">
//               <Button 
//                 variant="outlined" 
//                 sx={{ 
//                   borderColor: "#1348e8", 
//                   color: "#1348e8", 
//                   "&:hover": { 
//                     borderColor: "#0d3a9d", 
//                     backgroundColor: "#1348e810" 
//                   },
//                   minWidth: "auto",
//                   padding: "12px"
//                 }}
//               >
//                 <ArrowLeft size={20} />
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedPanchayat.name}</h1>
//               <div className="text-sm text-gray-600 mt-1">{isEditing ? 'Edit panchayat details' : 'View panchayat details'}</div>
//             </div>
//           </div>
          
//           {!isEditing ? (
//             <Button 
//               onClick={() => setIsEditing(true)} 
//               startIcon={<Edit size={20} />} 
//               sx={{ 
//                 backgroundColor: "#1348e8", 
//                 color: "white", 
//                 "&:hover": { backgroundColor: "#0d3a9d" }, 
//                 textTransform: "none", 
//                 fontSize: { xs: "0.875rem", sm: "1rem" }
//               }}
//             >
//               Edit Panchayat
//             </Button>
//           ) : (
//             <div className="flex gap-2">
//               <Button 
//                 onClick={handleCancel} 
//                 variant="outlined"
//                 sx={{
//                   borderColor: "#6b7280",
//                   color: "#374151",
//                   "&:hover": {
//                     borderColor: "#374151",
//                     backgroundColor: "#f9fafb",
//                   },
//                   fontSize: { xs: "0.875rem", sm: "1rem" },
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleSubmit} 
//                 disabled={loading || isSaving} 
//                 startIcon={<Save size={20} />}
//                 sx={{
//                   backgroundColor: "#1348e8",
//                   color: "white",
//                   "&:hover": { backgroundColor: "#0d3a9d" },
//                   "&:disabled": { backgroundColor: "#9ca3af" },
//                   fontSize: { xs: "0.875rem", sm: "1rem" },
//                 }}
//               >
//                 {isSaving ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-col xl:flex-row gap-6 mb-6">
//             {/* Image Section */}
//             <div className="w-full xl:w-[70%]">
//               <div className="border border-[#1348e820] overflow-hidden bg-white h-full rounded-lg">
//                 <div className="relative bg-[#1348e805] p-0 h-full">
//                   <div className="flex justify-center items-center h-full">
//                     {preview ? (
//                       <img 
//                         src={preview} 
//                         alt={selectedPanchayat.name} 
//                         className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg"
//                         style={{ maxHeight: isEditing ? '400px' : 'none' }}
//                       />
//                     ) : (
//                       <div className="text-center text-gray-500 py-16">
//                         <div>No header image set</div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Geography Section */}
//             <div className="w-full xl:w-[30%]">
//               <Card 
//                 sx={{ 
//                   p: 3, 
//                   border: "1px solid", 
//                   borderColor: "#1348e820", 
//                   backgroundColor: "white",
//                   height: "100%"
//                 }}
//               >
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">Geography</h3>
                
//                 {/* Major Rivers */}
//                 <div className="mb-6">
//                   <div className="flex items-center gap-2 mb-3">
//                     <MapPin size={18} className="text-[#1348e8]" />
//                     <h4 className="font-semibold text-gray-900">Major Rivers</h4>
//                   </div>
//                   {isEditing && (
//                     <div className="flex flex-col sm:flex-row gap-2 mb-3">
//                       <TextField 
//                         value={tempRiver} 
//                         onChange={(e) => setTempRiver(e.target.value)} 
//                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRiver())}
//                         placeholder="Betwa" 
//                         fullWidth 
//                       />
//                       <Button 
//                         type="button" 
//                         onClick={handleAddRiver}
//                         sx={{
//                           backgroundColor: "#1348e8",
//                           color: "white",
//                           "&:hover": { backgroundColor: "#0d3a9d" },
//                           fontWeight: "600",
//                           minWidth: "80px"
//                         }}
//                       >
//                         Add
//                       </Button>
//                     </div>
//                   )}
//                   <div className="flex flex-wrap gap-2">
//                     {formData.majorRivers.map((river, index) => (
//                       <div key={index} className="inline-flex items-center gap-2 bg-[#1348e810] text-gray-600 border border-[#1348e820] rounded-full px-3 py-1 text-sm font-medium">
//                         {river}
//                         {isEditing && (
//                           <button onClick={() => handleRemoveRiver(index)} className="text-[#1348e8] hover:text-[#0d3a9d] rounded-full hover:bg-[#1348e820] p-0.5">
//                             <X size={14} />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </div>

//           {/* Basic Information and Statistics */}
//           <div className="flex flex-col lg:flex-row gap-6 mb-6">
//             <div className="w-full lg:w-[70%]">
//               <Card 
//                 sx={{ 
//                   p: 3, 
//                   border: "1px solid", 
//                   borderColor: "#1348e820", 
//                   backgroundColor: "white"
//                 }}
//               >
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
//                 <div className="flex flex-col gap-4">
//                   <div className="flex flex-col md:flex-row gap-4">
//                     <TextField label="Panchayat Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={errors.name} helperText={errors.name} disabled={!isEditing || isSaving} fullWidth />
//                     <TextField label="Slug *" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} error={errors.slug} helperText={errors.slug} disabled={!isEditing || isSaving} fullWidth />
//                   </div>

//                   {/* Header Image Upload */}
//                   {isEditing && (
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Header Image *</h3>
//                       <div className="flex border-b border-gray-200 mb-4">
//                         <button 
//                           type="button" 
//                           onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.headerImage); }} 
//                           disabled={isSaving}
//                           className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'url' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                           <LinkIcon size={18} />Use URL
//                         </button>
//                         <button 
//                           type="button" 
//                           onClick={() => setUploadMethod('file')} 
//                           disabled={isSaving}
//                           className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${uploadMethod === 'file' ? 'border-[#1348e8] text-[#1348e8]' : 'border-transparent text-gray-500 hover:text-gray-700'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                           <CloudUpload size={18} />Upload File
//                         </button>
//                       </div>

//                       {uploadMethod === 'file' ? (
//                         <>
//                           {!file ? (
//                             <div 
//                               className={`border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                               onClick={isSaving ? undefined : () => document.getElementById('file-upload').click()}
//                             >
//                               <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
//                               <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload header image</div>
//                               <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 95MB)</div>
//                             </div>
//                           ) : (
//                             <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
//                               <div className="flex items-center justify-between mb-3">
//                                 <div className="flex items-center gap-3">
//                                   <div>
//                                     <div className="font-semibold text-gray-900">{file.name}</div>
//                                     <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
//                                   </div>
//                                 </div>
//                                 <button 
//                                   onClick={removeFile} 
//                                   disabled={isSaving}
//                                   className={`text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                 >
//                                   <X size={20} />
//                                 </button>
//                               </div>
//                               <div className="flex justify-center">
//                                 {preview && (
//                                   <img 
//                                     src={preview} 
//                                     alt="Preview" 
//                                     className="w-full h-48 object-contain rounded-lg" 
//                                   />
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                           <input 
//                             id="file-upload" 
//                             type="file" 
//                             accept="image/*" 
//                             onChange={handleFileChange} 
//                             disabled={isSaving}
//                             className="hidden" 
//                           />
//                         </>
//                       ) : (
//                         <TextField 
//                           label="Header Image URL *" 
//                           value={formData.headerImage} 
//                           onChange={(e) => handleUrlChange(e.target.value)} 
//                           error={errors.headerImage} 
//                           helperText={errors.headerImage || "Paste direct URL to header image"} 
//                           placeholder="https://example.com/panchayat-header.jpg" 
//                           startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} 
//                           disabled={!isEditing || isSaving}
//                           fullWidth 
//                         />
//                       )}
//                       {errors.headerImage && <div className="text-red-600 text-sm mt-2">{errors.headerImage}</div>}
//                     </div>
//                   )}

//                   <div className="flex flex-col md:flex-row gap-4">
//                     <SelectField label="District *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} options={districtOptions} error={errors.district} helperText={errors.district} disabled={!isEditing || isSaving} fullWidth />
//                     <TextField label="Block *" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} error={errors.block} helperText={errors.block} disabled={!isEditing || isSaving} fullWidth />
//                   </div>

//                   <div className="flex flex-col md:flex-row gap-4">
//                     <TextField label="Establishment Year" type="number" value={formData.establishmentYear} onChange={(e) => setFormData({ ...formData, establishmentYear: e.target.value })} placeholder="1972" disabled={!isEditing || isSaving} startIcon={<Calendar size={20} className="text-[#1348e8]" />} fullWidth />
//                     <SelectField label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={statusOptions} disabled={!isEditing || isSaving} fullWidth />
//                   </div>
//                 </div>
//               </Card>
//             </div>

//             {/* Statistics */}
//             <div className="w-full lg:w-[30%]">
//               <Card 
//                 sx={{ 
//                   p: 3, 
//                   border: "1px solid", 
//                   borderColor: "#1348e820", 
//                   backgroundColor: "white"
//                 }}
//               >
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
//                 <div className="flex flex-col gap-4">
//                   <TextField label="Population" type="number" value={formData.population} onChange={(e) => setFormData({ ...formData, population: e.target.value })} placeholder="5000" disabled={!isEditing || isSaving} startIcon={<Users size={20} className="text-[#1348e8]" />} fullWidth />
//                   <TextField label="Area (sq km)" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="25.5" disabled={!isEditing || isSaving} startIcon={<Maximize size={20} className="text-[#1348e8]" />} fullWidth />
//                 </div>
//               </Card>
//             </div>
//           </div>

//           {/* Coordinates */}
//           <Card 
//             sx={{ 
//               p: 3, 
//               my: 3, 
//               border: "1px solid", 
//               borderColor: "#1348e820", 
//               backgroundColor: "white"
//             }}
//           >
//             <div className="flex items-center gap-2 mb-4">
//               <MapPin size={20} className="text-[#1348e8]" />
//               <h3 className="text-lg font-semibold text-gray-900">Coordinates *</h3>
//             </div>
//             <div className="flex gap-3">
//               <TextField label="Latitude *" type="number" step="any" value={formData.coordinates.lat} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: e.target.value } })} error={errors.lat} helperText={errors.lat} placeholder="22.7196" disabled={!isEditing || isSaving} fullWidth />
//               <TextField label="Longitude *" type="number" step="any" value={formData.coordinates.lng} onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: e.target.value } })} error={errors.lng} helperText={errors.lng} placeholder="75.8577" disabled={!isEditing || isSaving} fullWidth />
//             </div>
//           </Card>

//           {/* Cultural Information */}
//           <div className="mb-6">
//             <Card 
//               sx={{ 
//                 p: 3, 
//                 border: "1px solid", 
//                 borderColor: "#1348e820", 
//                 backgroundColor: "white"
//               }}
//             >
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Cultural Information</h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Historical Background
//                   </label>
//                   <textarea 
//                     value={formData.historicalBackground} 
//                     onChange={(e) => setFormData({ ...formData, historicalBackground: e.target.value })} 
//                     placeholder="Write about the historical significance..." 
//                     disabled={!isEditing || isSaving} 
//                     rows={6} 
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Traditional Art Forms
//                     </label>
//                     <textarea 
//                       value={formData.localArt} 
//                       onChange={(e) => setFormData({ ...formData, localArt: e.target.value })} 
//                       placeholder="Traditional art forms..." 
//                       disabled={!isEditing || isSaving} 
//                       rows={4} 
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Traditional Cuisine
//                     </label>
//                     <textarea 
//                       value={formData.localCuisine} 
//                       onChange={(e) => setFormData({ ...formData, localCuisine: e.target.value })} 
//                       placeholder="Traditional dishes..." 
//                       disabled={!isEditing || isSaving} 
//                       rows={4} 
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
//                     />
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Cultural Traditions
//                   </label>
//                   <textarea 
//                     value={formData.traditions} 
//                     onChange={(e) => setFormData({ ...formData, traditions: e.target.value })} 
//                     placeholder="Cultural traditions..." 
//                     disabled={!isEditing || isSaving} 
//                     rows={4} 
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1348e8] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical" 
//                   />
//                 </div>
//               </div>
//             </Card>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }

