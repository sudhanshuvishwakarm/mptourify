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
  X
} from 'lucide-react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';

// Import your custom components
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function EditDistrictPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedDistrict, loading, error, success } = useSelector((state) => state.district);

  const [isEditing, setIsEditing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'file' or 'url'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    headerImage: '',
    formationYear: '',
    area: '',
    population: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    administrativeDivisions: [],
    politicalConstituencies: {
      lokSabha: [],
      vidhanSabha: []
    },
    majorRivers: [],
    hills: [],
    naturalSpots: [],
    historyAndCulture: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [tempInputs, setTempInputs] = useState({
    river: '',
    hill: '',
    naturalSpot: ''
  });

  // LOAD DATA ONLY ONCE
  useEffect(() => {
    if (params.id && !dataLoaded) {
      dispatch(fetchDistrictById(params.id));
      setDataLoaded(true);
    }
  }, [params.id, dataLoaded, dispatch]);

  // POPULATE FORM
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
        administrativeDivisions: selectedDistrict.administrativeDivisions || [],
        politicalConstituencies: {
          lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
          vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
        },
        majorRivers: selectedDistrict.majorRivers || [],
        hills: selectedDistrict.hills || [],
        naturalSpots: selectedDistrict.naturalSpots || [],
        historyAndCulture: selectedDistrict.historyAndCulture || '',
        status: selectedDistrict.status || 'active'
      });
      setPreview(selectedDistrict.headerImage || null);
    }
  }, [selectedDistrict, params.id]);

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success('District updated successfully!');
      dispatch(clearSuccess());
      setIsEditing(false);
      setFile(null);
      dispatch(fetchDistrictById(params.id));
    }
    if (error) {
      toast.error(error.message || 'Failed to update district');
      dispatch(clearError());
    }
  }, [success, error, dispatch, params.id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Validate file size (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 50MB limit');
        return;
      }

      setFile(selectedFile);
      
      // Create preview
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
    setPreview(formData.headerImage); // Reset to original image
    setUploadMethod('url');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'District name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
    // Validate header image based on upload method
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

    // Create FormData for file upload or use JSON for URL
    if (uploadMethod === 'file' && file) {
      const submitData = new FormData();
      
      // Append file and upload method
      submitData.append('headerImage', file);
      submitData.append('uploadMethod', 'file');
      
      // Append other form data
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('formationYear', formData.formationYear);
      submitData.append('area', formData.area);
      submitData.append('population', formData.population);
      submitData.append('coordinates[lat]', formData.coordinates.lat);
      submitData.append('coordinates[lng]', formData.coordinates.lng);
      submitData.append('status', formData.status);
      submitData.append('historyAndCulture', formData.historyAndCulture);
      
      // Append arrays
      submitData.append('administrativeDivisions', formData.administrativeDivisions.join(','));
      submitData.append('politicalConstituencies[lokSabha]', formData.politicalConstituencies.lokSabha.join(','));
      submitData.append('politicalConstituencies[vidhanSabha]', formData.politicalConstituencies.vidhanSabha.join(','));
      submitData.append('majorRivers', formData.majorRivers.join(','));
      submitData.append('hills', formData.hills.join(','));
      submitData.append('naturalSpots', formData.naturalSpots.join(','));
      
      // Append empty arrays for tourist places and famous personalities
      submitData.append('touristPlaces', '[]');
      submitData.append('famousPersonalities', '[]');

      dispatch(updateDistrict({ id: params.id, districtData: submitData }));
    } else {
      // Use regular JSON for URL upload
      dispatch(updateDistrict({ id: params.id, districtData: formData }));
    }
  };

  const handleAddItem = (field, value) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));

    setTempInputs(prev => ({ ...prev, [field]: '' }));
  };

  const handleRemoveItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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
        administrativeDivisions: selectedDistrict.administrativeDivisions || [],
        politicalConstituencies: {
          lokSabha: selectedDistrict.politicalConstituencies?.lokSabha || [],
          vidhanSabha: selectedDistrict.politicalConstituencies?.vidhanSabha || []
        },
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

  if (loading && !selectedDistrict) {
    return <Loader />;
  }

  if (!selectedDistrict) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          District not found
        </Typography>
        <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
          <Button sx={{ mt: 2, color: '#144ae9' }}>
            Back to Districts
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined" 
              sx={{ 
                minWidth: 'auto', 
                p: 1.5,
                borderColor: '#144ae9',
                color: '#144ae9',
                '&:hover': {
                  borderColor: '#0d3ec7',
                  backgroundColor: '#144ae910'
                }
              }}
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {selectedDistrict.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isEditing ? 'Edit district details' : 'View district details'}
            </Typography>
          </Box>
        </Box>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            startIcon={<Edit size={20} />}
            sx={{
              backgroundColor: '#144ae9',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0d3ec7'
              }
            }}
          >
            Edit District
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleCancel}
              variant="outlined"
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#374151',
                  backgroundColor: '#6b728010'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <Loader /> : <Save size={20} />}
              sx={{
                backgroundColor: '#144ae9',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#144ae9'
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {/* HEADER IMAGE PREVIEW */}
      <Card sx={{ mb: 4, border: '1px solid #144ae920', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', height: 300, bgcolor: '#144ae905' }}>
          {preview && (
            <img
              src={preview}
              alt={selectedDistrict.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white',
            p: 3
          }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {selectedDistrict.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {selectedDistrict.area && (
                <Typography variant="body1">
                  📏 {selectedDistrict.area} sq km
                </Typography>
              )}
              {selectedDistrict.population && (
                <Typography variant="body1">
                  👥 {selectedDistrict.population.toLocaleString()} people
                </Typography>
              )}
              {selectedDistrict.formationYear && (
                <Typography variant="body1">
                  📅 Formed in {selectedDistrict.formationYear}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* FORM */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* LEFT COLUMN - BASIC INFO */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* BASIC INFO */}
              <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* FIRST ROW */}
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      label="District Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={!!errors.name}
                      helperText={errors.name}
                      disabled={!isEditing}
                      fullWidth
                    />
                    <TextField
                      label="Slug *"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      error={!!errors.slug}
                      helperText={errors.slug}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Box>

                  {/* HEADER IMAGE UPLOAD */}
                  {isEditing && (
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                        Header Image *
                      </Typography>
                      
                      <Tabs
                        value={uploadMethod}
                        onChange={(e, newValue) => {
                          setUploadMethod(newValue);
                          if (newValue === 'url') {
                            setFile(null);
                            setPreview(formData.headerImage);
                          }
                        }}
                        sx={{
                          mb: 3,
                          '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                          }
                        }}
                      >
                        <Tab 
                          icon={<LinkIcon size={18} />} 
                          iconPosition="start" 
                          label="Use URL" 
                          value="url" 
                        />
                        <Tab 
                          icon={<CloudUpload size={18} />} 
                          iconPosition="start" 
                          label="Upload File" 
                          value="file" 
                        />
                      </Tabs>

                      {uploadMethod === 'file' ? (
                        <>
                          {!file ? (
                            <Box
                              sx={{
                                border: '2px dashed',
                                borderColor: errors.headerImage ? '#d32f2f' : '#144ae9',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#144ae905',
                                '&:hover': {
                                  backgroundColor: '#144ae910',
                                  borderColor: '#0d3ec7'
                                }
                              }}
                              onClick={() => document.getElementById('file-upload').click()}
                            >
                              <CloudUpload size={36} color="#144ae9" style={{ marginBottom: 12 }} />
                              <Typography variant="h6" color="text.primary" gutterBottom>
                                Click to upload header image
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Supports JPG, PNG, WebP (Max 50MB)
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <ImageIcon size={24} color="#144ae9" />
                                  <Box>
                                    <Typography variant="body1" fontWeight={600}>
                                      {file.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  onClick={removeFile}
                                  sx={{
                                    color: '#d32f2f',
                                    '&:hover': {
                                      backgroundColor: '#d32f210'
                                    }
                                  }}
                                >
                                  <X size={20} />
                                </IconButton>
                              </Box>
                              
                              <img
                                src={preview}
                                alt="Preview"
                                style={{ 
                                  maxHeight: '200px', 
                                  width: '100%', 
                                  objectFit: 'contain',
                                  borderRadius: '8px'
                                }}
                              />
                            </Box>
                          )}
                          
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </>
                      ) : (
                        <TextField
                          label="Header Image URL *"
                          value={formData.headerImage}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          error={!!errors.headerImage}
                          helperText={errors.headerImage || "Paste direct URL to header image"}
                          placeholder="https://example.com/district-header.jpg"
                          startIcon={<LinkIcon size={20} color="#144ae9" />}
                          fullWidth
                        />
                      )}

                      {errors.headerImage && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          {errors.headerImage}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* SECOND ROW */}
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      label="Formation Year"
                      type="number"
                      value={formData.formationYear}
                      onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })}
                      placeholder="1956"
                      disabled={!isEditing}
                      startIcon={<Calendar size={20} color="#144ae9" />}
                      fullWidth
                    />
                    <SelectField
                      label="Status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      options={statusOptions}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Box>
                </Box>
              </Card>

              {/* STATISTICS */}
              <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                  Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    label="Area (sq km)"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="2772"
                    disabled={!isEditing}
                    startIcon={<Maximize size={20} color="#144ae9" />}
                    fullWidth
                  />
                  <TextField
                    label="Population"
                    type="number"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                    placeholder="2371061"
                    disabled={!isEditing}
                    startIcon={<Users size={20} color="#144ae9" />}
                    fullWidth
                  />
                </Box>
              </Card>

              {/* HISTORY & CULTURE */}
              <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                  History & Culture
                </Typography>
                <TextField
                  multiline
                  rows={6}
                  value={formData.historyAndCulture}
                  onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
                  placeholder="Write about the district's history, culture, and significance..."
                  disabled={!isEditing}
                  fullWidth
                />
              </Card>
            </Box>
          </Grid>

          {/* RIGHT COLUMN - GEOGRAPHY & COORDINATES */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* COORDINATES */}
              <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <MapPin size={20} color="#144ae9" />
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Coordinates *
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Latitude *"
                    type="number"
                    step="any"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: { ...formData.coordinates, lat: e.target.value }
                    })}
                    error={!!errors.lat}
                    helperText={errors.lat}
                    placeholder="23.2599"
                    disabled={!isEditing}
                    fullWidth
                  />
                  <TextField
                    label="Longitude *"
                    type="number"
                    step="any"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: { ...formData.coordinates, lng: e.target.value }
                    })}
                    error={!!errors.lng}
                    helperText={errors.lng}
                    placeholder="77.4126"
                    disabled={!isEditing}
                    fullWidth
                  />
                </Box>
              </Card>

              {/* GEOGRAPHY */}
              <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                  Geography
                </Typography>
                
                {/* MAJOR RIVERS */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    Major Rivers
                  </Typography>
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        value={tempInputs.river}
                        onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))}
                        placeholder="Betwa"
                        fullWidth
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddItem('majorRivers', tempInputs.river)}
                        sx={{ 
                          color: 'white',
                          backgroundColor: '#144ae9',
                          fontWeight: 'bold',
                          minWidth: '100px',
                          '&:hover': {
                            backgroundColor: '#0d3ec7'
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.majorRivers.map((river, index) => (
                      <Chip
                        key={index}
                        label={river}
                        onDelete={isEditing ? () => handleRemoveItem('majorRivers', index) : undefined}
                        sx={{
                          backgroundColor: '#144ae910',
                          color: '#144ae9',
                          border: '1px solid #144ae920',
                          fontWeight: 500,
                          '& .MuiChip-deleteIcon': {
                            color: '#144ae9',
                            '&:hover': {
                              color: '#0d3ec7'
                            }
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* HILLS */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    Hills
                  </Typography>
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        value={tempInputs.hill}
                        onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))}
                        placeholder="Vindhyachal"
                        fullWidth
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddItem('hills', tempInputs.hill)}
                        sx={{ 
                          color: 'white',
                          backgroundColor: '#144ae9',
                          fontWeight: 'bold',
                          minWidth: '100px',
                          '&:hover': {
                            backgroundColor: '#0d3ec7'
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.hills.map((hill, index) => (
                      <Chip
                        key={index}
                        label={hill}
                        onDelete={isEditing ? () => handleRemoveItem('hills', index) : undefined}
                        sx={{
                          backgroundColor: '#144ae910',
                          color: '#144ae9',
                          border: '1px solid #144ae920',
                          fontWeight: 500,
                          '& .MuiChip-deleteIcon': {
                            color: '#144ae9',
                            '&:hover': {
                              color: '#0d3ec7'
                            }
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* NATURAL SPOTS */}
                <Box>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                    Natural Spots
                  </Typography>
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        value={tempInputs.naturalSpot}
                        onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))}
                        placeholder="Upper Lake"
                        fullWidth
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)}
                        sx={{ 
                          color: 'white',
                          backgroundColor: '#144ae9',
                          fontWeight: 'bold',
                          minWidth: '100px',
                          '&:hover': {
                            backgroundColor: '#0d3ec7'
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.naturalSpots.map((spot, index) => (
                      <Chip
                        key={index}
                        label={spot}
                        onDelete={isEditing ? () => handleRemoveItem('naturalSpots', index) : undefined}
                        sx={{
                          backgroundColor: '#144ae910',
                          color: '#144ae9',
                          border: '1px solid #144ae920',
                          fontWeight: 500,
                          '& .MuiChip-deleteIcon': {
                            color: '#144ae9',
                            '&:hover': {
                              color: '#0d3ec7'
                            }
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}// 'use client'
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
//   Edit
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   TextField,
//   Select,
//   MenuItem,
//   Chip,
//   IconButton
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';

// export default function EditDistrictPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedDistrict, loading, error, success } = useSelector((state) => state.district);

//   const [isEditing, setIsEditing] = useState(false);
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
//     }
//   }, [selectedDistrict, params.id]);

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success('District updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       dispatch(fetchDistrictById(params.id));
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update district');
//       dispatch(clearError());
//     }
//   }, [success, error]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = 'District name is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (!formData.headerImage.trim()) newErrors.headerImage = 'Header image URL is required';
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

//     dispatch(updateDistrict({ id: params.id, districtData: formData }));
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
//     }
//     setErrors({});
//   };

//   if (loading && !selectedDistrict) {
//     return (
//         <Loader />
//     );
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
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
//             <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9' }}>
//               <ArrowLeft size={20} color="#144ae9" />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {selectedDistrict.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {isEditing ? 'Edit district details' : 'View district details'}
//             </Typography>
//           </Box>
//         </Box>
        
//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             starticon={<Edit size={20} />}
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
//         )}
//       </Box>

//       {/* HEADER IMAGE PREVIEW */}
//       <Card sx={{ mb: 4, border: '1px solid #144ae920', overflow: 'hidden' }}>
//         <Box sx={{ position: 'relative', height: 256, bgcolor: '#144ae9' }}>
//           {selectedDistrict.headerImage && (
//             <img
//               src={selectedDistrict.headerImage}
//               alt={selectedDistrict.name}
//               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//             />
//           )}
//           <Box sx={{ position: 'absolute', bottom: 16, left: 16, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', borderRadius: 2, px: 3, py: 2 }}>
//             <Typography variant="h6" fontWeight={600} color="text.primary">
//               {selectedDistrict.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {selectedDistrict.area && `${selectedDistrict.area} sq km`}
//               {selectedDistrict.population && ` • ${selectedDistrict.population.toLocaleString()} people`}
//             </Typography>
//           </Box>
//         </Box>
//       </Card>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           {/* BASIC INFO */}
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Basic Information
//             </Typography>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               {/* NAME */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="District Name *"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   error={!!errors.name}
//                   helperText={errors.name}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               {/* SLUG */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Slug *"
//                   value={formData.slug}
//                   onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//                   error={!!errors.slug}
//                   helperText={errors.slug}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               {/* HEADER IMAGE */}
//               <Grid item xs={12}>
//                 <TextField
//                   label="Header Image URL *"
//                   value={formData.headerImage}
//                   onChange={(e) => setFormData({ ...formData, headerImage: e.target.value })}
//                   error={!!errors.headerImage}
//                   helperText={errors.headerImage}
//                   placeholder="https://example.com/bhopal.jpg"
//                   disabled={!isEditing}
//                   starticon={<ImageIcon size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Grid>

//               {/* FORMATION YEAR */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Formation Year"
//                   type="number"
//                   value={formData.formationYear}
//                   onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })}
//                   placeholder="1956"
//                   disabled={!isEditing}
//                   starticon={<Calendar size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Grid>

//               {/* STATUS */}
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 <Select
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   disabled={!isEditing}
//                   fullWidth
//                   sx={{
//                     '& .MuiOutlinedInput-notchedOutline': {
//                       borderColor: '#144ae920',
//                     },
//                     '&:hover .MuiOutlinedInput-notchedOutline': {
//                       borderColor: '#144ae9',
//                     },
//                   }}
//                 >
//                   <MenuItem value="active">Active</MenuItem>
//                   <MenuItem value="draft">Draft</MenuItem>
//                 </Select>
//               </Grid>
//             </Grid>
//           </Card>

//           {/* STATISTICS */}
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Statistics
//             </Typography>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               {/* AREA */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Area (sq km)"
//                   type="number"
//                   value={formData.area}
//                   onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//                   placeholder="2772"
//                   disabled={!isEditing}
//                   starticon={<Maximize size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Grid>

//               {/* POPULATION */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Population"
//                   type="number"
//                   value={formData.population}
//                   onChange={(e) => setFormData({ ...formData, population: e.target.value })}
//                   placeholder="2371061"
//                   disabled={!isEditing}
//                   starticon={<Users size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Grid>
//             </Grid>
//           </Card>

//           {/* COORDINATES */}
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//               <MapPin size={20} color="#144ae9" />
//               <Typography variant="h6" fontWeight={600}>
//                 Coordinates *
//               </Typography>
//             </Box>
//             <Grid container spacing={3}>
//               {/* LATITUDE */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Latitude *"
//                   type="number"
//                   step="any"
//                   value={formData.coordinates.lat}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     coordinates: { ...formData.coordinates, lat: e.target.value }
//                   })}
//                   error={!!errors.lat}
//                   helperText={errors.lat}
//                   placeholder="23.2599"
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               {/* LONGITUDE */}
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Longitude *"
//                   type="number"
//                   step="any"
//                   value={formData.coordinates.lng}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     coordinates: { ...formData.coordinates, lng: e.target.value }
//                   })}
//                   error={!!errors.lng}
//                   helperText={errors.lng}
//                   placeholder="77.4126"
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>
//             </Grid>
//           </Card>

//           {/* GEOGRAPHY */}
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Geography
//             </Typography>

//             {/* MAJOR RIVERS */}
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                 Major Rivers
//               </Typography>
//               {isEditing && (
//                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//                   <TextField
//                     value={tempInputs.river}
//                     onChange={(e) => setTempInputs({ ...tempInputs, river: e.target.value })}
//                     onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('majorRivers', tempInputs.river))}
//                     placeholder="Add river"
//                     fullWidth
//                     size="small"
//                   />
//                   <Button
//                     type="button"
//                     onClick={() => handleAddItem('majorRivers', tempInputs.river)}
//                     sx={{
//                       backgroundColor: '#144ae9',
//                       color: 'white',
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7'
//                       }
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>
//               )}
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                 {formData.majorRivers.map((river, index) => (
//                   <Chip
//                     key={index}
//                     label={river}
//                     onDelete={isEditing ? () => handleRemoveItem('majorRivers', index) : undefined}
//                     sx={{
//                       backgroundColor: '#144ae910',
//                       color: '#144ae9',
//                       border: '1px solid #144ae920',
//                       '& .MuiChip-deleteIcon': {
//                         color: '#144ae9',
//                         '&:hover': {
//                           color: '#0d3ec7'
//                         }
//                       }
//                     }}
//                   />
//                 ))}
//               </Box>
//             </Box>

//             {/* HILLS */}
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                 Hills
//               </Typography>
//               {isEditing && (
//                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//                   <TextField
//                     value={tempInputs.hill}
//                     onChange={(e) => setTempInputs({ ...tempInputs, hill: e.target.value })}
//                     onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hills', tempInputs.hill))}
//                     placeholder="Add hill"
//                     fullWidth
//                     size="small"
//                   />
//                   <Button
//                     type="button"
//                     onClick={() => handleAddItem('hills', tempInputs.hill)}
//                     sx={{
//                       backgroundColor: '#144ae9',
//                       color: 'white',
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7'
//                       }
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>
//               )}
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                 {formData.hills.map((hill, index) => (
//                   <Chip
//                     key={index}
//                     label={hill}
//                     onDelete={isEditing ? () => handleRemoveItem('hills', index) : undefined}
//                     sx={{
//                       backgroundColor: '#144ae910',
//                       color: '#144ae9',
//                       border: '1px solid #144ae920',
//                       '& .MuiChip-deleteIcon': {
//                         color: '#144ae9',
//                         '&:hover': {
//                           color: '#0d3ec7'
//                         }
//                       }
//                     }}
//                   />
//                 ))}
//               </Box>
//             </Box>

//             {/* NATURAL SPOTS */}
//             <Box>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                 Natural Spots
//               </Typography>
//               {isEditing && (
//                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//                   <TextField
//                     value={tempInputs.naturalSpot}
//                     onChange={(e) => setTempInputs({ ...tempInputs, naturalSpot: e.target.value })}
//                     onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('naturalSpots', tempInputs.naturalSpot))}
//                     placeholder="Add natural spot"
//                     fullWidth
//                     size="small"
//                   />
//                   <Button
//                     type="button"
//                     onClick={() => handleAddItem('naturalSpots', tempInputs.naturalSpot)}
//                     sx={{
//                       backgroundColor: '#144ae9',
//                       color: 'white',
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7'
//                       }
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>
//               )}
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                 {formData.naturalSpots.map((spot, index) => (
//                   <Chip
//                     key={index}
//                     label={spot}
//                     onDelete={isEditing ? () => handleRemoveItem('naturalSpots', index) : undefined}
//                     sx={{
//                       backgroundColor: '#144ae910',
//                       color: '#144ae9',
//                       border: '1px solid #144ae920',
//                       '& .MuiChip-deleteIcon': {
//                         color: '#144ae9',
//                         '&:hover': {
//                           color: '#0d3ec7'
//                         }
//                       }
//                     }}
//                   />
//                 ))}
//               </Box>
//             </Box>
//           </Card>

//           {/* HISTORY & CULTURE */}
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               History & Culture
//             </Typography>
//             <TextField
//               multiline
//               rows={6}
//               value={formData.historyAndCulture}
//               onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
//               placeholder="Write about the district's history, culture, and significance..."
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

//           {/* SUBMIT BUTTONS */}
//           {isEditing && (
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 starticon={loading ? <Loader /> : <Save size={20} />}
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
//                 {loading ? 'Saving...' : 'Save Changes'}
//               </Button>
//               <Button
//                 type="button"
//                 onClick={handleCancel}
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
//         </Box>
//       </Box>
//     </Box>
//   );
// }

