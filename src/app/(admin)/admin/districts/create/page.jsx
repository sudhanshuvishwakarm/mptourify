'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice';
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
  Calendar1,
  CloudUpload,
  Link as LinkIcon
} from 'lucide-react';
import {
  Box,
  Typography,
  Chip,
  Tabs,
  Tab
} from '@mui/material';

// Import your custom components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function CreateDistrictPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.district);

  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
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

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [tempInputs, setTempInputs] = useState({
    division: '',
    lokSabha: '',
    vidhanSabha: '',
    river: '',
    hill: '',
    naturalSpot: ''
  });

  useEffect(() => {
    if (success) {
      toast.success('District created successfully!');
      dispatch(clearSuccess());
      router.push('/admin/districts');
    }
    if (error) {
      toast.error(error.message || 'Failed to create district');
      dispatch(clearError());
    }
  }, [success, error]);

  // AUTO-GENERATE SLUG
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

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
    setPreview(null);
    if (uploadMethod === 'url') {
      setFormData(prev => ({ ...prev, headerImage: '' }));
    }
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

      dispatch(createDistrict(submitData));
    } else {
      // Use regular JSON for URL upload
      dispatch(createDistrict(formData));
    }
  };

  const handleAddItem = (field, value) => {
    if (!value.trim()) return;

    if (field === 'lokSabha' || field === 'vidhanSabha') {
      setFormData(prev => ({
        ...prev,
        politicalConstituencies: {
          ...prev.politicalConstituencies,
          [field]: [...prev.politicalConstituencies[field], value.trim()]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }

    setTempInputs(prev => ({ ...prev, [field]: '' }));
  };

  const handleRemoveItem = (field, index) => {
    if (field === 'lokSabha' || field === 'vidhanSabha') {
      setFormData(prev => ({
        ...prev,
        politicalConstituencies: {
          ...prev.politicalConstituencies,
          [field]: prev.politicalConstituencies[field].filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
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
            Create New District
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Add a new district to Madhya Pradesh
          </Typography>
        </Box>
      </Box>

      {/* FORM */}
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* BASIC INFO */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
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
                  fullWidth
                />
                <TextField
                  label="Slug *"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  error={!!errors.slug}
                  helperText={errors.slug}
                  fullWidth
                />
              </Box>

              {/* HEADER IMAGE UPLOAD */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 2 }}>
                  Header Image *
                </Typography>
                
                {/* UPLOAD METHOD SELECTION */}
                <Tabs
                  value={uploadMethod}
                  onChange={(e, newValue) => {
                    setUploadMethod(newValue);
                    setFile(null);
                    setPreview(null);
                    setFormData(prev => ({ ...prev, headerImage: '' }));
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }
                  }}
                >
                  <Tab 
                    icon={<CloudUpload size={18} />} 
                    iconPosition="start" 
                    label="Upload File" 
                    value="file" 
                  />
                  <Tab 
                    icon={<LinkIcon size={18} />} 
                    iconPosition="start" 
                    label="Paste URL" 
                    value="url" 
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
                          <Button
                            type="button"
                            onClick={removeFile}
                            sx={{
                              color: '#d32f2f',
                              '&:hover': {
                                backgroundColor: '#d32f210'
                              }
                            }}
                          >
                            Remove
                          </Button>
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

                {preview && (uploadMethod === 'url' && formData.headerImage) && (
                  <Box sx={{ mt: 2, border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Preview:
                    </Typography>
                    <img
                      src={preview}
                      alt="URL Preview"
                      style={{ 
                        maxHeight: '150px', 
                        width: '100%', 
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                )}

                {errors.headerImage && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.headerImage}
                  </Typography>
                )}
              </Box>

              {/* SECOND ROW */}
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField
                  label="Formation Year"
                  type="number"
                  value={formData.formationYear}
                  onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })}
                  placeholder="1956"
                  startIcon={<Calendar1 size={20} color="#144ae9" />}
                  fullWidth
                />
                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={statusOptions}
                  fullWidth
                />
              </Box>
            </Box>
          </Card>

          {/* STATISTICS */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
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
                startIcon={<Maximize size={20} color="#144ae9" />}
                fullWidth
              />
              <TextField
                label="Population"
                type="number"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                placeholder="2371061"
                startIcon={<Users size={20} color="#144ae9" />}
                fullWidth
              />
            </Box>
          </Card>

          {/* COORDINATES */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <MapPin size={20} color="#144ae9" />
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Coordinates *
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
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
                fullWidth
              />
            </Box>
          </Card>

          {/* GEOGRAPHY */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
              Geography
            </Typography>
            
            {/* MAJOR RIVERS */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                Major Rivers
              </Typography>
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.majorRivers.map((river, index) => (
                  <Chip
                    key={index}
                    label={river}
                    onDelete={() => handleRemoveItem('majorRivers', index)}
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.hills.map((hill, index) => (
                  <Chip
                    key={index}
                    label={hill}
                    onDelete={() => handleRemoveItem('hills', index)}
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.naturalSpots.map((spot, index) => (
                  <Chip
                    key={index}
                    label={spot}
                    onDelete={() => handleRemoveItem('naturalSpots', index)}
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

          {/* HISTORY & CULTURE */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
              History & Culture
            </Typography>
            <TextField
              multiline
              rows={6}
              value={formData.historyAndCulture}
              onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
              placeholder="Write about the district's history, culture, and significance..."
              fullWidth
            />
          </Card>

          {/* SUBMIT BUTTONS */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              type="submit"
              disabled={loading}
              startIcon={loading ? <Loader /> : <Save size={20} />}
              size="large"
              sx={{ 
                flex: 1, 
                backgroundColor: '#144ae9', 
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#0d3ec7'
                }
              }}
            >
              {loading ? 'Creating...' : 'Create District'}
            </Button>
            <Link href="/admin/districts" style={{ textDecoration: 'none', flex: 1 }}>
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  width: '100%',
                  borderColor: '#144ae9',
                  color: '#144ae9',
                  '&:hover': {
                    borderColor: '#0d3ec7',
                    backgroundColor: '#144ae910'
                  }
                }}
              >
                Cancel
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { createDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice';
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
//   Calendar1
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Chip
// } from '@mui/material';

// // Import your custom components
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function CreateDistrictPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector((state) => state.district);

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
//     division: '',
//     lokSabha: '',
//     vidhanSabha: '',
//     river: '',
//     hill: '',
//     naturalSpot: ''
//   });

//   useEffect(() => {
//     if (success) {
//       toast.success('District created successfully!');
//       dispatch(clearSuccess());
//       router.push('/admin/districts');
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to create district');
//       dispatch(clearError());
//     }
//   }, [success, error]);

//   // AUTO-GENERATE SLUG
//   useEffect(() => {
//     if (formData.name) {
//       const slug = formData.name
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/^-+|-+$/g, '');
//       setFormData(prev => ({ ...prev, slug }));
//     }
//   }, [formData.name]);

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

//     dispatch(createDistrict(formData));
//   };

//   const handleAddItem = (field, value) => {
//     if (!value.trim()) return;

//     if (field === 'lokSabha' || field === 'vidhanSabha') {
//       setFormData(prev => ({
//         ...prev,
//         politicalConstituencies: {
//           ...prev.politicalConstituencies,
//           [field]: [...prev.politicalConstituencies[field], value.trim()]
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [field]: [...prev[field], value.trim()]
//       }));
//     }

//     setTempInputs(prev => ({ ...prev, [field]: '' }));
//   };

//   const handleRemoveItem = (field, index) => {
//     if (field === 'lokSabha' || field === 'vidhanSabha') {
//       setFormData(prev => ({
//         ...prev,
//         politicalConstituencies: {
//           ...prev.politicalConstituencies,
//           [field]: prev.politicalConstituencies[field].filter((_, i) => i !== index)
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [field]: prev[field].filter((_, i) => i !== index)
//       }));
//     }
//   };

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
//         <Link href="/admin/districts" style={{ textDecoration: 'none' }}>
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
//         <Box>
//           <Typography variant="h4" fontWeight="bold" color="text.primary">
//             Create New District
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//             Add a new district to Madhya Pradesh
//           </Typography>
//         </Box>
//       </Box>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           {/* BASIC INFO */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Basic Information
//             </Typography>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {/* FIRST ROW */}
//               <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                 <TextField
//                   label="District Name *"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   error={!!errors.name}
//                   helperText={errors.name}
//                   fullWidth
//                 />
//                 <TextField
//                   label="Slug *"
//                   value={formData.slug}
//                   onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
//                   error={!!errors.slug}
//                   helperText={errors.slug}
//                   fullWidth
//                 />
//               </Box>

//               {/* HEADER IMAGE */}
//               <TextField
//                 label="Header Image URL *"
//                 value={formData.headerImage}
//                 onChange={(e) => setFormData({ ...formData, headerImage: e.target.value })}
//                 error={!!errors.headerImage}
//                 helperText={errors.headerImage}
//                 placeholder="https://example.com/bhopal.jpg"
//                 startIcon={<ImageIcon size={20} color="#144ae9" />}
//                 fullWidth
//               />

//               {/* SECOND ROW */}
//               <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                 <TextField
//                   label="Formation Year"
//                   type="number"
//                   value={formData.formationYear}
//                   onChange={(e) => setFormData({ ...formData, formationYear: e.target.value })}
//                   placeholder="1956"
//                   startIcon={<Calendar1 size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//                 <SelectField
//                   label="Status"
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   options={statusOptions}
//                   fullWidth
//                 />
//               </Box>
//             </Box>
//           </Card>

//           {/* STATISTICS */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Statistics
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//               <TextField
//                 label="Area (sq km)"
//                 type="number"
//                 value={formData.area}
//                 onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//                 placeholder="2772"
//                 startIcon={<Maximize size={20} color="#144ae9" />}
//                 fullWidth
//               />
//               <TextField
//                 label="Population"
//                 type="number"
//                 value={formData.population}
//                 onChange={(e) => setFormData({ ...formData, population: e.target.value })}
//                 placeholder="2371061"
//                 startIcon={<Users size={20} color="#144ae9" />}
//                 fullWidth
//               />
//             </Box>
//           </Card>

//           {/* COORDINATES */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//               <MapPin size={20} color="#144ae9" />
//               <Typography variant="h5" fontWeight="bold" color="text.primary">
//                 Coordinates *
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//               <TextField
//                 label="Latitude *"
//                 type="number"
//                 step="any"
//                 value={formData.coordinates.lat}
//                 onChange={(e) => setFormData({
//                   ...formData,
//                   coordinates: { ...formData.coordinates, lat: e.target.value }
//                 })}
//                 error={!!errors.lat}
//                 helperText={errors.lat}
//                 placeholder="23.2599"
//                 fullWidth
//               />
//               <TextField
//                 label="Longitude *"
//                 type="number"
//                 step="any"
//                 value={formData.coordinates.lng}
//                 onChange={(e) => setFormData({
//                   ...formData,
//                   coordinates: { ...formData.coordinates, lng: e.target.value }
//                 })}
//                 error={!!errors.lng}
//                 helperText={errors.lng}
//                 placeholder="77.4126"
//                 fullWidth
//               />
//             </Box>
//           </Card>

//           {/* GEOGRAPHY */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Geography
//             </Typography>
            
//             {/* MAJOR RIVERS */}
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                 Major Rivers
//               </Typography>
//               <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
//                     backgroundColor: '#144ae9',
//                     fontWeight: 'bold',
//                     minWidth: '100px',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   Add
//                 </Button>
//               </Box>
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                 {formData.majorRivers.map((river, index) => (
//                   <Chip
//                     key={index}
//                     label={river}
//                     onDelete={() => handleRemoveItem('majorRivers', index)}
//                     sx={{
//                       backgroundColor: '#144ae910',
//                       color: '#144ae9',
//                       border: '1px solid #144ae920',
//                       fontWeight: 500,
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
//               <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                 Hills
//               </Typography>
//               <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
//                     backgroundColor: '#144ae9',
//                     fontWeight: 'bold',
//                     minWidth: '100px',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   Add
//                 </Button>
//               </Box>
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                 {formData.hills.map((hill, index) => (
//                   <Chip
//                     key={index}
//                     label={hill}
//                     onDelete={() => handleRemoveItem('hills', index)}
//                     sx={{
//                       backgroundColor: '#144ae910',
//                       color: '#144ae9',
//                       border: '1px solid #144ae920',
//                       fontWeight: 500,
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
//               <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                 Natural Spots
//               </Typography>
//               <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
//                     backgroundColor: '#144ae9',
//                     fontWeight: 'bold',
//                     minWidth: '100px',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   Add
//                 </Button>
//               </Box>
//               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                 {formData.naturalSpots.map((spot, index) => (
//                   <Chip
//                     key={index}
//                     label={spot}
//                     onDelete={() => handleRemoveItem('naturalSpots', index)}
//                     sx={{
//                       backgroundColor: '#144ae910',
//                       color: '#144ae9',
//                       border: '1px solid #144ae920',
//                       fontWeight: 500,
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
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               History & Culture
//             </Typography>
//             <TextField
//               multiline
//               rows={6}
//               value={formData.historyAndCulture}
//               onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
//               placeholder="Write about the district's history, culture, and significance..."
//               fullWidth
//             />
//           </Card>

//           {/* SUBMIT BUTTONS */}
//           <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//             <Button
//               type="submit"
//               disabled={loading}
//               startIcon={loading ? <Loader /> : <Save size={20} />}
//               size="large"
//               sx={{ 
//                 flex: 1, 
//                 backgroundColor: '#144ae9', 
//                 fontWeight: 600,
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7'
//                 }
//               }}
//             >
//               {loading ? 'Creating...' : 'Create District'}
//             </Button>
//             <Link href="/admin/districts" style={{ textDecoration: 'none', flex: 1 }}>
//               <Button
//                 variant="outlined"
//                 size="large"
//                 sx={{ 
//                   width: '100%',
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
//             </Link>
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// }
