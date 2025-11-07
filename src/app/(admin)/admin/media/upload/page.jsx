'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { uploadMedia, clearError, clearSuccess } from '@/redux/slices/mediaSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { fetchPanchayatsByDistrict } from '@/redux/slices/panchayatSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft,
  CloudUpload,
  Image as ImageIcon,
  Video,
  Calendar,
  Tag,
  MapPin,
  User,
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

const CATEGORIES = [
  { value: 'heritage', label: 'Heritage' },
  { value: 'natural', label: 'Natural' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'event', label: 'Event' },
  { value: 'festival', label: 'Festival' }
];

export default function UploadMediaPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { uploadLoading, error, success } = useSelector((state) => state.media);
  const { districts } = useSelector((state) => state.district);
  const { panchayats } = useSelector((state) => state.panchayat);

  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    photographer: '',
    captureDate: '',
    tags: [],
    district: '',
    panchayat: '',
    fileUrl: '' // For URL upload
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tempTag, setTempTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (success) {
      toast.success('Media uploaded successfully!');
      dispatch(clearSuccess());
      router.push('/admin/media');
    }
    if (error) {
      toast.error(error.message || 'Failed to upload media');
      dispatch(clearError());
    }
  }, [success, error, dispatch, router]);

  // Fetch districts on component mount
  useEffect(() => {
    dispatch(fetchDistricts());
  }, [dispatch]);

  const handleDistrictChange = (districtId) => {
    setFormData(prev => ({
      ...prev,
      district: districtId,
      panchayat: '' // Reset panchayat when district changes
    }));
    
    if (districtId) {
      dispatch(fetchPanchayatsByDistrict(districtId));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image or video file (JPEG, PNG, WebP, MP4, WebM)');
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
    setFormData(prev => ({ ...prev, fileUrl: url }));
    
    // Auto-detect file type from URL for preview
    if (url) {
      const isVideo = /\.(mp4|webm|mov|avi)$/i.test(url);
      setPreview(url);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (uploadMethod === 'url') {
      setFormData(prev => ({ ...prev, fileUrl: '' }));
    }
  };

  const handleAddTag = () => {
    if (!tempTag.trim()) return;

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tempTag.trim()]
    }));
    setTempTag('');
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (uploadMethod === 'file' && !file) {
      newErrors.file = 'Media file is required';
    } else if (uploadMethod === 'url' && !formData.fileUrl.trim()) {
      newErrors.fileUrl = 'Media URL is required';
    }
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please check all required fields before submitting');
      return;
    }

    const submitData = new FormData();
    
    if (uploadMethod === 'file') {
      submitData.append('file', file);
    } else {
      submitData.append('fileUrl', formData.fileUrl);
    }
    
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('photographer', formData.photographer);
    submitData.append('captureDate', formData.captureDate);
    submitData.append('tags', formData.tags.join(','));
    submitData.append('uploadMethod', uploadMethod);
    
    if (formData.district) {
      submitData.append('district', formData.district);
    }
    
    if (formData.panchayat) {
      submitData.append('panchayat', formData.panchayat);
    }

    dispatch(uploadMedia(submitData));
  };

  const getFileTypeIcon = () => {
    if (uploadMethod === 'url' && formData.fileUrl) {
      const isVideo = /\.(mp4|webm|mov|avi)$/i.test(formData.fileUrl);
      return isVideo ? <Video size={24} color="#144ae9" /> : <ImageIcon size={24} color="#144ae9" />;
    }
    
    if (!file) return <CloudUpload size={24} color="#144ae9" />;
    return file.type.startsWith('video/') ? 
      <Video size={24} color="#144ae9" /> : 
      <ImageIcon size={24} color="#144ae9" />;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Link href="/admin/media" style={{ textDecoration: 'none' }}>
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
            Upload Media
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Add photos and videos to showcase tourism destinations
          </Typography>
        </Box>
      </Box>

      {/* FORM */}
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* UPLOAD METHOD SELECTION */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
              Upload Method
            </Typography>
            
            <Tabs
              value={uploadMethod}
              onChange={(e, newValue) => {
                setUploadMethod(newValue);
                setFile(null);
                setPreview(null);
                setFormData(prev => ({ ...prev, fileUrl: '' }));
              }}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                }
              }}
            >
              <Tab 
                icon={<CloudUpload size={20} />} 
                iconPosition="start" 
                label="Upload File" 
                value="file" 
              />
              <Tab 
                icon={<LinkIcon size={20} />} 
                iconPosition="start" 
                label="Paste URL" 
                value="url" 
              />
            </Tabs>
          </Card>

          {/* MEDIA UPLOAD */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
              Media {uploadMethod === 'file' ? 'File' : 'URL'} *
            </Typography>
            
            {uploadMethod === 'file' ? (
              <>
                {!file ? (
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: errors.file ? '#d32f2f' : '#144ae9',
                      borderRadius: 2,
                      p: 6,
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
                    <CloudUpload size={48} color="#144ae9" style={{ marginBottom: 16 }} />
                    <Typography variant="h6" color="text.primary" gutterBottom>
                      Click to upload or drag and drop
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports JPG, PNG, WebP, MP4, WebM (Max 50MB)
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getFileTypeIcon()}
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
                          color: '#FFFFFF',
                          '&:hover': {
                            backgroundColor: '#d32f210'
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                    
                    {file.type.startsWith('video/') ? (
                      <video
                        src={preview}
                        controls
                        className="w-full max-h-64 rounded-lg"
                        style={{ maxHeight: '256px', width: '100%', borderRadius: '8px' }}
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ 
                          maxHeight: '256px', 
                          width: '100%', 
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  </Box>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                {errors.file && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.file}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <TextField
                  label="Media URL *"
                  value={formData.fileUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  error={!!errors.fileUrl}
                  helperText={errors.fileUrl || "Paste direct URL to image or video"}
                  placeholder="https://example.com/image.jpg or https://example.com/video.mp4"
                  startIcon={<LinkIcon size={20} color="#144ae9" />}
                  fullWidth
                />
                
                {preview && formData.fileUrl && (
                  <Box sx={{ mt: 3, border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                      Preview
                    </Typography>
                    {formData.fileUrl.match(/\.(mp4|webm|mov|avi)$/i) ? (
                      <video
                        src={preview}
                        controls
                        className="w-full max-h-64 rounded-lg"
                        style={{ maxHeight: '256px', width: '100%', borderRadius: '8px' }}
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="URL Preview"
                        style={{ 
                          maxHeight: '256px', 
                          width: '100%', 
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </Box>
                )}
              </>
            )}
          </Card>

          {/* BASIC INFORMATION */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
              Basic Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Enter media title"
                fullWidth
              />

              <TextField
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the media content, location, significance..."
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                <SelectField
                  label="Category *"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={CATEGORIES}
                  error={!!errors.category}
                  helperText={errors.category}
                  fullWidth
                />

                <TextField
                  label="Photographer/Credit"
                  value={formData.photographer}
                  onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  placeholder="Photographer name"
                  startIcon={<User size={20} color="#144ae9" />}
                  fullWidth
                />
              </Box>
            </Box>
          </Card>

          {/* LOCATION INFORMATION */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <MapPin size={20} color="#144ae9" />
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Location Information
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <SelectField
                label="District"
                value={formData.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                options={[
                  { value: '', label: 'Select District' },
                  ...districts.map(district => ({
                    value: district._id,
                    label: district.name
                  }))
                ]}
                fullWidth
              />

              <SelectField
                label="Gram Panchayat"
                value={formData.panchayat}
                onChange={(e) => setFormData({ ...formData, panchayat: e.target.value })}
                disabled={!formData.district}
                options={[
                  { value: '', label: 'Select Panchayat' },
                  ...panchayats.map(panchayat => ({
                    value: panchayat._id,
                    label: panchayat.name
                  }))
                ]}
                fullWidth
              />
            </Box>
            
            {!formData.district && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select a district to see available panchayats
              </Typography>
            )}
          </Card>

          {/* ADDITIONAL INFORMATION */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
              Additional Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Capture Date"
                type="date"
                value={formData.captureDate}
                onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
                startIcon={<Calendar size={20} color="#144ae9" />}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {/* TAGS */}
              <Box>
                <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    value={tempTag}
                    onChange={(e) => setTempTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tags..."
                    startIcon={<Tag size={20} color="#144ae9" />}
                    fullWidth
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
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
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(index)}
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
            </Box>
          </Card>

          {/* SUBMIT BUTTONS */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, position: 'relative' }}>
            {/* Full Screen Loader Overlay */}
            {uploadLoading && (
              // <Box
              //   sx={{
              //     position: 'fixed',
              //     top: 0,
              //     left: 0,
              //     right: 0,
              //     bottom: 0,
              //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
              //     display: 'flex',
              //     justifyContent: 'center',
              //     alignItems: 'center',
              //     zIndex: 9999,
              //   }}
              // >
              //   <Box
              //     sx={{
              //       borderRadius: 2,
              //       p: 4,
              //       textAlign: 'center',
              //       minWidth: 200,
              //     }}
              //   >
              //     <Loader size={40} />
              //     <Typography variant="h6" sx={{ mt: 2, color: '#144ae9' }}>
              //       Uploading Media...
              //     </Typography>
              //     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              //       Please wait while we process your media
              //     </Typography>
              //   </Box>
              // </Box>
            <Loader/>

            )}

            <Button
              type="submit"
              disabled={uploadLoading}
              startIcon={uploadLoading ? <Loader size={20} /> : <CloudUpload size={20} />}
              size="large"
              sx={{ 
                flex: 1, 
                backgroundColor: '#144ae9', 
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#0d3ec7'
                },
                '&:disabled': {
                  backgroundColor: '#144ae950'
                }
              }}
            >
              {uploadLoading ? 'Uploading...' : 'Upload Media'}
            </Button>
            <Link href="/admin/media" style={{ textDecoration: 'none', flex: 1 }}>
              <Button
                variant="outlined"
                size="large"
                disabled={uploadLoading}
                sx={{ 
                  width: '100%',
                  borderColor: '#144ae9',
                  color: '#144ae9',
                  '&:hover': {
                    borderColor: '#0d3ec7',
                    backgroundColor: '#144ae910'
                  },
                  '&:disabled': {
                    borderColor: '#144ae950',
                    color: '#144ae950'
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
}


// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { uploadMedia, clearError, clearSuccess } from '@/redux/slices/mediaSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { fetchPanchayatsByDistrict } from '@/redux/slices/panchayatSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   CloudUpload,
//   Image as ImageIcon,
//   Video,
//   Calendar,
//   Tag,
//   MapPin,
//   User
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

// const CATEGORIES = [
//   { value: 'heritage', label: 'Heritage' },
//   { value: 'natural', label: 'Natural' },
//   { value: 'cultural', label: 'Cultural' },
//   { value: 'event', label: 'Event' },
//   { value: 'festival', label: 'Festival' }
// ];

// export default function UploadMediaPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { uploadLoading, error, success } = useSelector((state) => state.media);
//   const { districts } = useSelector((state) => state.district);
//   const { panchayats } = useSelector((state) => state.panchayat);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: '',
//     photographer: '',
//     captureDate: '',
//     tags: [],
//     district: '',
//     panchayat: ''
//   });

//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [tempTag, setTempTag] = useState('');
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (success) {
//       toast.success('Media uploaded successfully!');
//       dispatch(clearSuccess());
//       router.push('/admin/media');
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to upload media');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch, router]);

//   // Fetch districts on component mount
//   useEffect(() => {
//     dispatch(fetchDistricts());
//   }, [dispatch]);

//   const handleDistrictChange = (districtId) => {
//     setFormData(prev => ({
//       ...prev,
//       district: districtId,
//       panchayat: '' // Reset panchayat when district changes
//     }));
    
//     if (districtId) {
//       dispatch(fetchPanchayatsByDistrict(districtId));
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image or video file (JPEG, PNG, WebP, MP4, WebM)');
//         return;
//       }

//       // Validate file size (50MB)
//       const maxSize = 50 * 1024 * 1024;
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

//   const removeFile = () => {
//     setFile(null);
//     setPreview(null);
//   };

//   const handleAddTag = () => {
//     if (!tempTag.trim()) return;

//     setFormData(prev => ({
//       ...prev,
//       tags: [...prev.tags, tempTag.trim()]
//     }));
//     setTempTag('');
//   };

//   const handleRemoveTag = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter((_, i) => i !== index)
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!file) newErrors.file = 'Media file is required';
//     if (!formData.title.trim()) newErrors.title = 'Title is required';
//     if (!formData.category) newErrors.category = 'Category is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       toast.error('Please fix all errors before submitting');
//       return;
//     }

//     const submitData = new FormData();
//     submitData.append('file', file);
//     submitData.append('title', formData.title);
//     submitData.append('description', formData.description);
//     submitData.append('category', formData.category);
//     submitData.append('photographer', formData.photographer);
//     submitData.append('captureDate', formData.captureDate);
//     submitData.append('tags', formData.tags.join(','));
    
//     if (formData.district) {
//       submitData.append('district', formData.district);
//     }
    
//     if (formData.panchayat) {
//       submitData.append('panchayat', formData.panchayat);
//     }

//     dispatch(uploadMedia(submitData));
//   };

//   const getFileTypeIcon = () => {
//     if (!file) return <CloudUpload size={24} color="#144ae9" />;
//     return file.type.startsWith('video/') ? 
//       <Video size={24} color="#144ae9" /> : 
//       <ImageIcon size={24} color="#144ae9" />;
//   };

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
//         <Link href="/admin/media" style={{ textDecoration: 'none' }}>
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
//             Upload Media
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//             Add photos and videos to showcase tourism destinations
//           </Typography>
//         </Box>
//       </Box>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           {/* MEDIA UPLOAD */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Media File *
//             </Typography>
            
//             {!file ? (
//               <Box
//                 sx={{
//                   border: '2px dashed',
//                   borderColor: errors.file ? '#d32f2f' : '#144ae9',
//                   borderRadius: 2,
//                   p: 6,
//                   textAlign: 'center',
//                   cursor: 'pointer',
//                   backgroundColor: '#144ae905',
//                   '&:hover': {
//                     backgroundColor: '#144ae910',
//                     borderColor: '#0d3ec7'
//                   }
//                 }}
//                 onClick={() => document.getElementById('file-upload').click()}
//               >
//                 <CloudUpload size={48} color="#144ae9" style={{ marginBottom: 16 }} />
//                 <Typography variant="h6" color="text.primary" gutterBottom>
//                   Click to upload or drag and drop
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Supports JPG, PNG, WebP, MP4, WebM (Max 50MB)
//                 </Typography>
//               </Box>
//             ) : (
//               <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     {getFileTypeIcon()}
//                     <Box>
//                       <Typography variant="body1" fontWeight={600}>
//                         {file.name}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {(file.size / (1024 * 1024)).toFixed(2)} MB
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Button
//                     type="button"
//                     onClick={removeFile}
//                     sx={{
//                       color: '#d32f2f',
//                       '&:hover': {
//                         backgroundColor: '#d32f210'
//                       }
//                     }}
//                   >
//                     Remove
//                   </Button>
//                 </Box>
                
//                 {file.type.startsWith('video/') ? (
//                   <video
//                     src={preview}
//                     controls
//                     className="w-full max-h-64 rounded-lg"
//                     style={{ maxHeight: '256px', width: '100%', borderRadius: '8px' }}
//                   />
//                 ) : (
//                   <img
//                     src={preview}
//                     alt="Preview"
//                     style={{ 
//                       maxHeight: '256px', 
//                       width: '100%', 
//                       objectFit: 'contain',
//                       borderRadius: '8px'
//                     }}
//                   />
//                 )}
//               </Box>
//             )}
            
//             <input
//               id="file-upload"
//               type="file"
//               accept="image/*,video/*"
//               onChange={handleFileChange}
//               style={{ display: 'none' }}
//             />
            
//             {errors.file && (
//               <Typography variant="body2" color="error" sx={{ mt: 1 }}>
//                 {errors.file}
//               </Typography>
//             )}
//           </Card>

//           {/* BASIC INFORMATION */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Basic Information
//             </Typography>
            
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               <TextField
//                 label="Title *"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 error={!!errors.title}
//                 helperText={errors.title}
//                 placeholder="Enter media title"
//                 fullWidth
//               />

//               <TextField
//                 label="Description"
//                 multiline
//                 rows={4}
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="Describe the media content, location, significance..."
//                 fullWidth
//               />

//               <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                 <SelectField
//                   label="Category *"
//                   value={formData.category}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   options={CATEGORIES}
//                   error={!!errors.category}
//                   helperText={errors.category}
//                   fullWidth
//                 />

//                 <TextField
//                   label="Photographer/Credit"
//                   value={formData.photographer}
//                   onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
//                   placeholder="Photographer name"
//                   startIcon={<User size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Box>
//             </Box>
//           </Card>

//           {/* LOCATION INFORMATION */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//               <MapPin size={20} color="#144ae9" />
//               <Typography variant="h5" fontWeight="bold" color="text.primary">
//                 Location Information
//               </Typography>
//             </Box>
            
//             <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//               <SelectField
//                 label="District"
//                 value={formData.district}
//                 onChange={(e) => handleDistrictChange(e.target.value)}
//                 options={[
//                   { value: '', label: 'Select District' },
//                   ...districts.map(district => ({
//                     value: district._id,
//                     label: district.name
//                   }))
//                 ]}
//                 fullWidth
//               />

//               <SelectField
//                 label="Gram Panchayat"
//                 value={formData.panchayat}
//                 onChange={(e) => setFormData({ ...formData, panchayat: e.target.value })}
//                 disabled={!formData.district}
//                 options={[
//                   { value: '', label: 'Select Panchayat' },
//                   ...panchayats.map(panchayat => ({
//                     value: panchayat._id,
//                     label: panchayat.name
//                   }))
//                 ]}
//                 fullWidth
//               />
//             </Box>
            
//             {!formData.district && (
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                 Select a district to see available panchayats
//               </Typography>
//             )}
//           </Card>

//           {/* ADDITIONAL INFORMATION */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Additional Information
//             </Typography>
            
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               <TextField
//                 label="Capture Date"
//                 type="date"
//                 value={formData.captureDate}
//                 onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
//                 startIcon={<Calendar size={20} color="#144ae9" />}
//                 fullWidth
//                 InputLabelProps={{
//                   shrink: true,
//                 }}
//               />

//               {/* TAGS */}
//               <Box>
//                 <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
//                   Tags
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//                   <TextField
//                     value={tempTag}
//                     onChange={(e) => setTempTag(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
//                     placeholder="Add tags..."
//                     startIcon={<Tag size={20} color="#144ae9" />}
//                     fullWidth
//                   />
//                   <Button
//                     type="button"
//                     onClick={handleAddTag}
//                     sx={{ 
//                       backgroundColor: '#144ae9',
//                       fontWeight: 'bold',
//                       minWidth: '100px',
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7'
//                       }
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                   {formData.tags.map((tag, index) => (
//                     <Chip
//                       key={index}
//                       label={tag}
//                       onDelete={() => handleRemoveTag(index)}
//                       sx={{
//                         backgroundColor: '#144ae910',
//                         color: '#144ae9',
//                         border: '1px solid #144ae920',
//                         fontWeight: 500,
//                         '& .MuiChip-deleteIcon': {
//                           color: '#144ae9',
//                           '&:hover': {
//                             color: '#0d3ec7'
//                           }
//                         }
//                       }}
//                     />
//                   ))}
//                 </Box>
//               </Box>
//             </Box>
//           </Card>

//           {/* SUBMIT BUTTONS */}
//           <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
//             <Button
//               type="submit"
//               disabled={uploadLoading}
//               startIcon={uploadLoading ? <Loader /> : <CloudUpload size={20} />}
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
//               {uploadLoading ? 'Uploading...' : 'Upload Media'}
//             </Button>
//             <Link href="/admin/media" style={{ textDecoration: 'none', flex: 1 }}>
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