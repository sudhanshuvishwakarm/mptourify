'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createNews, clearError, clearSuccess } from '@/redux/slices/newsSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  CloudUpload,
  Link as LinkIcon,
  X
} from 'lucide-react';

// Import your custom components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import Loader from '@/components/ui/Loader';

export default function CreateNewsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.news);
  const { districts } = useSelector((state) => state.district);
  const { panchayats } = useSelector((state) => state.panchayat);

  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    category: 'announcement',
    tags: [],
    relatedDistrict: '',
    relatedPanchayat: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    featured: false
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [tempTag, setTempTag] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [filteredPanchayats, setFilteredPanchayats] = useState([]);

  // FETCH DISTRICTS AND PANCHAYATS
  useEffect(() => {
    dispatch(fetchDistricts({ status: 'active', limit: 100 }));
    dispatch(fetchPanchayats({ status: 'active', limit: 1000 }));
  }, [dispatch]);

  // FILTER PANCHAYATS BASED ON SELECTED DISTRICT
  useEffect(() => {
    if (formData.relatedDistrict) {
      const filtered = panchayats.filter(
        p => p.district?._id === formData.relatedDistrict || p.district === formData.relatedDistrict
      );
      setFilteredPanchayats(filtered);
      
      // Reset panchayat if it doesn't belong to selected district
      if (formData.relatedPanchayat) {
        const isPanchayatValid = filtered.some(p => p._id === formData.relatedPanchayat);
        if (!isPanchayatValid) {
          setFormData(prev => ({ ...prev, relatedPanchayat: '' }));
        }
      }
    } else {
      setFilteredPanchayats([]);
      setFormData(prev => ({ ...prev, relatedPanchayat: '' }));
    }
  }, [formData.relatedDistrict, panchayats]);

  useEffect(() => {
    if (success) {
      toast.success('News article created successfully!');
      dispatch(clearSuccess());
      router.push('/admin/news');
    }
    if (error) {
      toast.error(error.message || 'Failed to create news article');
      dispatch(clearError());
    }
  }, [success, error, dispatch, router]);

  // AUTO-GENERATE SLUG
  useEffect(() => {
    if (formData.title && !slugEdited) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, slugEdited]);

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
      const maxSize = 95 * 1024 * 1024;
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
    setFormData(prev => ({ ...prev, featuredImage: url }));
    setPreview(url);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (uploadMethod === 'url') {
      setFormData(prev => ({ ...prev, featuredImage: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    
    // Validate featured image based on upload method
    if (uploadMethod === 'file' && !file) {
      newErrors.featuredImage = 'Featured image is required';
    } else if (uploadMethod === 'url' && !formData.featuredImage.trim()) {
      newErrors.featuredImage = 'Featured image URL is required';
    }

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
      submitData.append('featuredImage', file);
      submitData.append('uploadMethod', 'file');
      
      // Append other form data
      submitData.append('title', formData.title);
      submitData.append('slug', formData.slug);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('category', formData.category);
      submitData.append('status', formData.status);
      submitData.append('publishDate', formData.publishDate);
      
      // Append optional fields if they exist
      if (formData.relatedDistrict) {
        submitData.append('relatedDistrict', formData.relatedDistrict);
      }
      if (formData.relatedPanchayat) {
        submitData.append('relatedPanchayat', formData.relatedPanchayat);
      }
      
      // Append tags array
      submitData.append('tags', formData.tags.join(','));

      dispatch(createNews(submitData));
    } else {
      // Use regular JSON for URL upload
      const submitData = { ...formData };
      if (!submitData.relatedDistrict) delete submitData.relatedDistrict;
      if (!submitData.relatedPanchayat) delete submitData.relatedPanchayat;
      
      dispatch(createNews(submitData));
    }
  };

  const handleAddTag = () => {
    if (!tempTag.trim()) return;
    if (formData.tags.includes(tempTag.trim())) {
      toast.error('Tag already exists');
      return;
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tempTag.trim()]
    }));
    setTempTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setFormData({ ...formData, slug: e.target.value });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const categoryOptions = [
    { value: 'media_coverage', label: 'Media Coverage' },
    { value: 'press_release', label: 'Press Release' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'update', label: 'Update' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
  ];

  const districtOptions = [
    { value: '', label: 'No District' },
    ...districts.map(district => ({
      value: district._id,
      label: district.name
    }))
  ];

  const panchayatOptions = [
    { value: '', label: 'No Panchayat' },
    ...filteredPanchayats.map(panchayat => ({
      value: panchayat._id,
      label: panchayat.name
    }))
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      {
        loading && <div className="fixed inset-0 z-[9999]">
          <Loader message={"Creating..."} />
        </div>
      }
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/news" className="no-underline">
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
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold  text-gray-900">
            Create News Article
          </h1>
          <div className="text-sm text-gray-600 mt-1">
            Add a new news article or press release
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* BASIC INFO */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold  text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                label="Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="Enter article title"
                fullWidth
              />

              <TextField
                label="Slug *"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                error={!!errors.slug}
                helperText={errors.slug}
                placeholder="article-url-slug"
                fullWidth
              />
            </div>

            <TextField
              label="Excerpt *"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              error={!!errors.excerpt}
              helperText={errors.excerpt}
              placeholder="Brief summary of the article..."
              multiline
              rows={2}
              fullWidth
            />
          </Card>

          {/* FEATURED IMAGE UPLOAD */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold  text-gray-900 mb-4">
              Featured Image *
            </h2>
            
            {/* UPLOAD METHOD SELECTION */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUploadMethod('file');
                  setFile(null);
                  setPreview(null);
                  setFormData(prev => ({ ...prev, featuredImage: '' }));
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
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
                onClick={() => {
                  setUploadMethod('url');
                  setFile(null);
                  setPreview(null);
                  setFormData(prev => ({ ...prev, featuredImage: '' }));
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
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
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      Click to upload featured image
                    </div>
                    <div className="text-sm text-gray-600">
                      Supports JPG, PNG, WebP (Max 95MB)
                    </div>
                  </div>
                ) : (
                  <div className="border border-blue-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <ImageIcon size={24} className="text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-lg"
                    />
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
                label="Featured Image URL *"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => handleUrlChange(e.target.value)}
                error={!!errors.featuredImage}
                helperText={errors.featuredImage || "Paste direct URL to featured image"}
                placeholder="https://example.com/news-image.jpg"
                startIcon={<LinkIcon size={20} className="text-blue-600" />}
                fullWidth
              />
            )}

            {preview && (uploadMethod === 'url' && formData.featuredImage) && (
              <div className="mt-3 border border-blue-200 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="URL Preview"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {errors.featuredImage && (
              <div className="text-red-600 text-sm mt-2">
                {errors.featuredImage}
              </div>
            )}
          </Card>

          {/* CONTENT */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <h2 className="text-xl font-semibold  text-gray-900 mb-4">
              Content *
            </h2>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write the full article content here..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-vertical"
            />
            {errors.content && (
              <div className="text-red-600 text-sm mt-2">
                {errors.content}
              </div>
            )}
          </Card>

          {/* CATEGORIZATION & PUBLISHING OPTIONS IN ONE ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT SIDE - Categorization */}
            <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white', height: 'fit-content' }}>
              <h2 className="text-xl font-semibold  text-gray-900 mb-4">
                Categorization
              </h2>

              <div className="space-y-4 flex flex-col gap-5">
                <SelectField
                  label="Category *"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={categoryOptions}
                  fullWidth
                />

                <SelectField
                  label="Related District"
                  name="relatedDistrict"
                  value={formData.relatedDistrict}
                  onChange={handleInputChange}
                  options={districtOptions}
                  fullWidth
                />

                <SelectField
                  label="Related Panchayat"
                  name="relatedPanchayat"
                  value={formData.relatedPanchayat}
                  onChange={handleInputChange}
                  options={panchayatOptions}
                  disabled={!formData.relatedDistrict}
                  helperText={!formData.relatedDistrict ? 'Select a district first' : ''}
                  fullWidth
                />

                {/* TAGS */}
              </div>
            </Card>
             

            {/* RIGHT SIDE - Publishing Options */}
            <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: 'white', height: 'fit-content' }}>
              <h2 className="text-xl font-semibold  text-gray-900 mb-4">
                Publishing Options
              </h2>

              <div className="space-y-4 flex flex-col gap-5">
                <TextField
                  type="date"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                  label="Publish Date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={statusOptions}
                  fullWidth
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="font-medium text-gray-900">
                    Featured Article
                  </div>
                </div>
              </div>
            </Card>
          </div>
   <div>
                  <div className="font-medium text-gray-900 mb-2">
                    Tags
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <TextField
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tags..."
                      fullWidth
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      sx={{
                        minWidth: '80px',
                        backgroundColor: '#144ae9',
                        color: 'white',
                        fontWeight: '600',
                        '&:hover': { backgroundColor: '#0d3ec7' },
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  {/* TAGS LIST */}
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-200 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
          {/* SUBMIT BUTTONS */}
          <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                startIcon={!loading && <Save size={20} />}
                size="large"
                sx={{ 
                  flex: 1,
                  backgroundColor: '#144ae9',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#0d3ec7'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#144ae950'
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create News Article'}
              </Button>
              <Link href="/admin/news" className="no-underline flex-1">
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
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { createNews, clearError, clearSuccess } from '@/redux/slices/newsSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   Image as ImageIcon,
//   CloudUpload,
//   Link as LinkIcon
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Chip,
//   Tabs,
//   Tab,
//   Grid,
//   Stack
// } from '@mui/material';

// // Import your custom components
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function CreateNewsPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector((state) => state.news);
//   const { districts } = useSelector((state) => state.district);
//   const { panchayats } = useSelector((state) => state.panchayat);

//   const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     content: '',
//     excerpt: '',
//     featuredImage: '',
//     category: 'announcement',
//     tags: [],
//     relatedDistrict: '',
//     relatedPanchayat: '',
//     publishDate: new Date().toISOString().split('T')[0],
//     status: 'draft',
//     featured: false
//   });

//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [tempTag, setTempTag] = useState('');
//   const [slugEdited, setSlugEdited] = useState(false);
//   const [filteredPanchayats, setFilteredPanchayats] = useState([]);

//   // FETCH DISTRICTS AND PANCHAYATS
//   useEffect(() => {
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }));
//     dispatch(fetchPanchayats({ status: 'active', limit: 1000 }));
//   }, [dispatch]);

//   // FILTER PANCHAYATS BASED ON SELECTED DISTRICT
//   useEffect(() => {
//     if (formData.relatedDistrict) {
//       const filtered = panchayats.filter(
//         p => p.district?._id === formData.relatedDistrict || p.district === formData.relatedDistrict
//       );
//       setFilteredPanchayats(filtered);
      
//       // Reset panchayat if it doesn't belong to selected district
//       if (formData.relatedPanchayat) {
//         const isPanchayatValid = filtered.some(p => p._id === formData.relatedPanchayat);
//         if (!isPanchayatValid) {
//           setFormData(prev => ({ ...prev, relatedPanchayat: '' }));
//         }
//       }
//     } else {
//       setFilteredPanchayats([]);
//       setFormData(prev => ({ ...prev, relatedPanchayat: '' }));
//     }
//   }, [formData.relatedDistrict, panchayats]);

//   useEffect(() => {
//     if (success) {
//       toast.success('News article created successfully!');
//       dispatch(clearSuccess());
//       router.push('/admin/news');
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to create news article');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch, router]);

//   // AUTO-GENERATE SLUG
//   useEffect(() => {
//     if (formData.title && !slugEdited) {
//       const slug = formData.title
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/^-+|-+$/g, '');
//       setFormData(prev => ({ ...prev, slug }));
//     }
//   }, [formData.title, slugEdited]);

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
//     setFormData(prev => ({ ...prev, featuredImage: url }));
//     setPreview(url);
//   };

//   const removeFile = () => {
//     setFile(null);
//     setPreview(null);
//     if (uploadMethod === 'url') {
//       setFormData(prev => ({ ...prev, featuredImage: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.title.trim()) newErrors.title = 'Title is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (!formData.content.trim()) newErrors.content = 'Content is required';
//     if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    
//     // Validate featured image based on upload method
//     if (uploadMethod === 'file' && !file) {
//       newErrors.featuredImage = 'Featured image is required';
//     } else if (uploadMethod === 'url' && !formData.featuredImage.trim()) {
//       newErrors.featuredImage = 'Featured image URL is required';
//     }

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
//       submitData.append('featuredImage', file);
//       submitData.append('uploadMethod', 'file');
      
//       // Append other form data
//       submitData.append('title', formData.title);
//       submitData.append('slug', formData.slug);
//       submitData.append('content', formData.content);
//       submitData.append('excerpt', formData.excerpt);
//       submitData.append('category', formData.category);
//       submitData.append('status', formData.status);
//       submitData.append('publishDate', formData.publishDate);
      
//       // Append optional fields if they exist
//       if (formData.relatedDistrict) {
//         submitData.append('relatedDistrict', formData.relatedDistrict);
//       }
//       if (formData.relatedPanchayat) {
//         submitData.append('relatedPanchayat', formData.relatedPanchayat);
//       }
      
//       // Append tags array
//       submitData.append('tags', formData.tags.join(','));

//       dispatch(createNews(submitData));
//     } else {
//       // Use regular JSON for URL upload
//       const submitData = { ...formData };
//       if (!submitData.relatedDistrict) delete submitData.relatedDistrict;
//       if (!submitData.relatedPanchayat) delete submitData.relatedPanchayat;
      
//       dispatch(createNews(submitData));
//     }
//   };

//   const handleAddTag = () => {
//     if (!tempTag.trim()) return;
//     if (formData.tags.includes(tempTag.trim())) {
//       toast.error('Tag already exists');
//       return;
//     }
//     setFormData(prev => ({
//       ...prev,
//       tags: [...prev.tags, tempTag.trim()]
//     }));
//     setTempTag('');
//   };

//   const handleRemoveTag = (tagToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove)
//     }));
//   };

//   const handleSlugChange = (e) => {
//     setSlugEdited(true);
//     setFormData({ ...formData, slug: e.target.value });
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const categoryOptions = [
//     { value: 'media_coverage', label: 'Media Coverage' },
//     { value: 'press_release', label: 'Press Release' },
//     { value: 'announcement', label: 'Announcement' },
//     { value: 'update', label: 'Update' }
//   ];

//   const statusOptions = [
//     { value: 'draft', label: 'Draft' },
//     { value: 'published', label: 'Published' }
//   ];

//   const districtOptions = [
//     { value: '', label: 'No District' },
//     ...districts.map(district => ({
//       value: district._id,
//       label: district.name
//     }))
//   ];

//   const panchayatOptions = [
//     { value: '', label: 'No Panchayat' },
//     ...filteredPanchayats.map(panchayat => ({
//       value: panchayat._id,
//       label: panchayat.name
//     }))
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
//         <Link href="/admin/news" style={{ textDecoration: 'none' }}>
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
//             Create News Article
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//             Add a new news article or press release
//           </Typography>
//         </Box>
//       </Box>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit}>
//         <Stack spacing={4}>
//           {/* BASIC INFO */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Basic Information
//             </Typography>
//        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
//   <TextField
//     label="Title *"
//     name="title"
//     value={formData.title}
//     onChange={handleInputChange}
//     error={!!errors.title}
//     helperText={errors.title}
//     placeholder="Enter article title"
//     fullWidth
//     sx={{ flex: 1 }}
//   />

//   <TextField
//     label="Slug *"
//     name="slug"
//     value={formData.slug}
//     onChange={handleSlugChange}
//     error={!!errors.slug}
//     helperText={errors.slug}
//     placeholder="article-url-slug"
//     fullWidth
//     sx={{ flex: 1 }}
//   />
// </Box>

// <Box sx={{ width: '100%' }}>
//   <TextField
//     label="Excerpt"
//     name="excerpt"
//     value={formData.excerpt}
//     onChange={handleInputChange}
//     error={!!errors.excerpt}
//     helperText={errors.excerpt}
//     placeholder="Brief summary of the article..."
//     multiline
//     rows={2}
//     fullWidth
//   />
// </Box>

//           </Card>

//           {/* FEATURED IMAGE UPLOAD */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 2 }}>
//               Featured Image *
//             </Typography>
            
//             {/* UPLOAD METHOD SELECTION */}
//             <Tabs
//               value={uploadMethod}
//               onChange={(e, newValue) => {
//                 setUploadMethod(newValue);
//                 setFile(null);
//                 setPreview(null);
//                 setFormData(prev => ({ ...prev, featuredImage: '' }));
//               }}
//               sx={{
//                 mb: 3,
//                 '& .MuiTab-root': {
//                   textTransform: 'none',
//                   fontWeight: 600,
//                   fontSize: '0.9rem',
//                 }
//               }}
//             >
//               <Tab 
//                 icon={<CloudUpload size={18} />} 
//                 iconPosition="start" 
//                 label="Upload File" 
//                 value="file" 
//               />
//               <Tab 
//                 icon={<LinkIcon size={18} />} 
//                 iconPosition="start" 
//                 label="Paste URL" 
//                 value="url" 
//               />
//             </Tabs>

//             {uploadMethod === 'file' ? (
//               <>
//                 {!file ? (
//                   <Box
//                     sx={{
//                       border: '2px dashed',
//                       borderColor: errors.featuredImage ? '#d32f2f' : '#144ae9',
//                       borderRadius: 2,
//                       p: 4,
//                       textAlign: 'center',
//                       cursor: 'pointer',
//                       backgroundColor: '#144ae905',
//                       '&:hover': {
//                         backgroundColor: '#144ae910',
//                         borderColor: '#0d3ec7'
//                       }
//                     }}
//                     onClick={() => document.getElementById('file-upload').click()}
//                   >
//                     <CloudUpload size={36} color="#144ae9" style={{ marginBottom: 12 }} />
//                     <Typography variant="h6" color="text.primary" gutterBottom>
//                       Click to upload featured image
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Supports JPG, PNG, WebP (Max 95MB)
//                     </Typography>
//                   </Box>
//                 ) : (
//                   <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                         <ImageIcon size={24} color="#144ae9" />
//                         <Box>
//                           <Typography variant="body1" fontWeight={600}>
//                             {file.name}
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {(file.size / (1024 * 1024)).toFixed(2)} MB
//                           </Typography>
//                         </Box>
//                       </Box>
//                       <Button
//                         type="button"
//                         onClick={removeFile}
//                         sx={{
//                           color: '#d32f2f',
//                           '&:hover': {
//                             backgroundColor: '#d32f2f10'
//                           }
//                         }}
//                       >
//                         Remove
//                       </Button>
//                     </Box>
                    
//                     <img
//                       src={preview}
//                       alt="Preview"
//                       style={{ 
//                         maxHeight: '200px', 
//                         width: '100%', 
//                         objectFit: 'contain',
//                         borderRadius: '8px'
//                       }}
//                     />
//                   </Box>
//                 )}
                
//                 <input
//                   id="file-upload"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   style={{ display: 'none' }}
//                 />
//               </>
//             ) : (
//               <TextField
//                 label="Featured Image URL *"
//                 name="featuredImage"
//                 value={formData.featuredImage}
//                 onChange={(e) => handleUrlChange(e.target.value)}
//                 error={!!errors.featuredImage}
//                 helperText={errors.featuredImage || "Paste direct URL to featured image"}
//                 placeholder="https://example.com/news-image.jpg"
//                 startIcon={<LinkIcon size={20} color="#144ae9" />}
//                 fullWidth
//               />
//             )}

//             {preview && (uploadMethod === 'url' && formData.featuredImage) && (
//               <Box sx={{ mt: 2, border: '1px solid', borderColor: '#144ae920', borderRadius: 2, overflow: 'hidden' }}>
//                 <img
//                   src={preview}
//                   alt="URL Preview"
//                   style={{ 
//                     width: '100%', 
//                     maxHeight: '200px', 
//                     objectFit: 'cover'
//                   }}
//                   onError={(e) => {
//                     e.target.style.display = 'none';
//                   }}
//                 />
//               </Box>
//             )}

//             {errors.featuredImage && (
//               <Typography variant="body2" color="error" sx={{ mt: 1 }}>
//                 {errors.featuredImage}
//               </Typography>
//             )}
//           </Card>

//           {/* CONTENT */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 3 }}>
//               Content *
//             </Typography>
//             <TextField
//               name="content"
//               value={formData.content}
//               onChange={handleInputChange}
//               error={!!errors.content}
//               helperText={errors.content}
//               placeholder="Write the full article content here..."
//               multiline
//               rows={12}
//               fullWidth
//             />
//           </Card>

//           {/* CATEGORIZATION & PUBLISHING OPTIONS IN ONE ROW */}
//         <Box
//   sx={{
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     width: '100%',
//     gap: 3,
//   }}
// >
//   {/* LEFT SIDE - Categorization */}
//   <Box sx={{ width: '50%' }}>
//     <Card
//       sx={{
//         p: 3,
//         height: '100%',
//         border: '1px solid #144ae920',
//         backgroundColor: 'white',
//       }}
//     >
//       <Typography
//         variant="h6"
//         fontWeight="bold"
//         gutterBottom
//         color="text.primary"
//         sx={{ mb: 3 }}
//       >
//         Categorization
//       </Typography>

//       <Stack spacing={3}>
//         <SelectField
//           label="Category *"
//           name="category"
//           value={formData.category}
//           onChange={handleInputChange}
//           options={categoryOptions}
//           fullWidth
//         />

//         <SelectField
//           label="Related District"
//           name="relatedDistrict"
//           value={formData.relatedDistrict}
//           onChange={handleInputChange}
//           options={districtOptions}
//           fullWidth
//         />

//         <SelectField
//           label="Related Panchayat"
//           name="relatedPanchayat"
//           value={formData.relatedPanchayat}
//           onChange={handleInputChange}
//           options={panchayatOptions}
//           disabled={!formData.relatedDistrict}
//           helperText={!formData.relatedDistrict ? 'Select a district first' : ''}
//           fullWidth
//         />

//         {/* TAGS */}
//         <Box>
//           <Typography variant="body2" fontWeight="medium" gutterBottom>
//             Tags
//           </Typography>

//           <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//             <TextField
//               value={tempTag}
//               onChange={(e) => setTempTag(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                   handleAddTag();
//                 }
//               }}
//               placeholder="Add tags..."
//               fullWidth
//             />
//             <Button
//               type="button"
//               onClick={handleAddTag}
//               sx={{
//                 minWidth: '80px',
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontWeight: 'bold',
//                 '&:hover': { backgroundColor: '#0d3ec7' },
//               }}
//             >
//               Add
//             </Button>
//           </Box>

//           {/* TAGS LIST */}
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//             {formData.tags.map((tag, index) => (
//               <Chip
//                 key={index}
//                 label={tag}
//                 onDelete={() => handleRemoveTag(tag)}
//                 sx={{
//                   backgroundColor: '#144ae910',
//                   color: '#144ae9',
//                   border: '1px solid #144ae920',
//                   fontWeight: 500,
//                   '& .MuiChip-deleteIcon': {
//                     color: '#144ae9',
//                     '&:hover': { color: '#0d3ec7' },
//                   },
//                 }}
//               />
//             ))}
//           </Box>
//         </Box>
//       </Stack>
//     </Card>
//   </Box>

//   {/* RIGHT SIDE - Publishing Options */}
//   <Box sx={{ width: '50%' }}>
//     <Card
//       sx={{
//         p: 3,
//         height: '100%',
//         border: '1px solid #144ae920',
//         backgroundColor: 'white',
//       }}
//     >
//       <Typography
//         variant="h6"
//         fontWeight="bold"
//         gutterBottom
//         color="text.primary"
//         sx={{ mb: 3 }}
//       >
//         Publishing Options
//       </Typography>

//       <Stack spacing={3}>
//         <TextField
//           type="date"
//           name="publishDate"
//           value={formData.publishDate}
//           onChange={handleInputChange}
//           label="Publish Date"
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//         />

//         <SelectField
//           label="Status"
//           name="status"
//           value={formData.status}
//           onChange={handleInputChange}
//           options={statusOptions}
//           fullWidth
//         />

//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <input
//             type="checkbox"
//             name="featured"
//             checked={formData.featured}
//             onChange={handleInputChange}
//             style={{
//               width: '18px',
//               height: '18px',
//               accentColor: '#144ae9',
//               cursor: 'pointer',
//             }}
//           />
//           <Typography variant="body1" fontWeight="medium">
//             Featured Article
//           </Typography>
//         </Box>
//       </Stack>
//     </Card>
//   </Box>
// </Box>


//           {/* SUBMIT BUTTONS */}
//           <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: 'white' }}>
//             <Box sx={{ 
//               display: 'flex', 
//               gap: 2, 
//               flexDirection: { xs: 'column', sm: 'row' } 
//             }}>
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 startIcon={loading ? <Loader /> : <Save size={20} />}
//                 size="large"
//                 sx={{ 
//                   flex: 1,
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   fontWeight: 600,
//                   '&:hover': {
//                     backgroundColor: '#0d3ec7'
//                   },
//                   '&.Mui-disabled': {
//                     backgroundColor: '#144ae950'
//                   }
//                 }}
//               >
//                 {loading ? 'Creating...' : 'Create News Article'}
//               </Button>
//               <Link href="/admin/news" style={{ textDecoration: 'none', flex: 1 }}>
//                 <Button
//                   variant="outlined"
//                   size="large"
//                   sx={{ 
//                     width: '100%',
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     '&:hover': {
//                       borderColor: '#0d3ec7',
//                       backgroundColor: '#144ae910'
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Link>
//             </Box>
//           </Card>
//         </Stack>
//       </Box>
//     </Box>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { createNews, clearError, clearSuccess } from '@/redux/slices/newsSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   Box,
//   Typography,
//   Grid,
//   Stack,
//   IconButton
// } from '@mui/material';
// import {
//   ArrowBack,
// } from '@mui/icons-material';

// // Import your custom components
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import Loader from '@/components/ui/Loader';

// export default function CreateNewsPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector((state) => state.news);
//   const { districts } = useSelector((state) => state.district);

//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     content: '',
//     excerpt: '',
//     featuredImage: '',
//     category: 'announcement',
//     tags: [],
//     relatedDistrict: '',
//     publishDate: new Date().toISOString().split('T')[0],
//     status: 'draft',
//     featured: false
//   });

//   const [errors, setErrors] = useState({});
//   const [tempTag, setTempTag] = useState('');
//   const [slugEdited, setSlugEdited] = useState(false);

//   useEffect(() => {
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }));
//   }, [dispatch]);

//   useEffect(() => {
//     if (success) {
//       toast.success('News article created successfully!');
//       dispatch(clearSuccess());
//       router.push('/admin/news');
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to create news article');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch, router]);

//   // AUTO-GENERATE SLUG
//   useEffect(() => {
//     if (formData.title && !slugEdited) {
//       const slug = formData.title
//         .toLowerCase()
//         .replace(/[^a-z0-9]+/g, '-')
//         .replace(/^-+|-+$/g, '');
//       setFormData(prev => ({ ...prev, slug }));
//     }
//   }, [formData.title, slugEdited]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.title.trim()) newErrors.title = 'Title is required';
//     if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
//     if (!formData.content.trim()) newErrors.content = 'Content is required';
//     if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
//     if (!formData.featuredImage.trim()) newErrors.featuredImage = 'Featured image URL is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Please fix all errors');
//       return;
//     }

//     const submitData = { ...formData };
//     if (!submitData.relatedDistrict) delete submitData.relatedDistrict;

//     dispatch(createNews(submitData));
//   };

//   const handleAddTag = () => {
//     if (!tempTag.trim()) return;
//     if (formData.tags.includes(tempTag.trim())) {
//       toast.error('Tag already exists');
//       return;
//     }

//     setFormData(prev => ({
//       ...prev,
//       tags: [...prev.tags, tempTag.trim()]
//     }));
//     setTempTag('');
//   };

//   const handleRemoveTag = (tagToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove)
//     }));
//   };

//   const handleSlugChange = (e) => {
//     setSlugEdited(true);
//     setFormData({ ...formData, slug: e.target.value });
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleTagsInput = (e) => {
//     setTempTag(e.target.value);
//   };

//   const categoryOptions = [
//     { value: 'media_coverage', label: 'Media Coverage' },
//     { value: 'press_release', label: 'Press Release' },
//     { value: 'announcement', label: 'Announcement' },
//     { value: 'update', label: 'Update' }
//   ];

//   const statusOptions = [
//     { value: 'draft', label: 'Draft' },
//     { value: 'published', label: 'Published' },
//     // { value: 'scheduled', label: 'Scheduled' }
//   ];

//   const districtOptions = [
//     { value: '', label: 'No District' },
//     ...districts.map(district => ({
//       value: district._id,
//       label: district.name
//     }))
//   ];

//   return (
//     <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
//         <Link href="/admin/news" style={{ textDecoration: 'none' }}>
//           <IconButton sx={{ color: '#144ae9', p: 1.5 }}>
//             <ArrowBack />
//           </IconButton>
//         </Link>
//         <Box>
//           <Typography variant="h4" fontWeight="bold" color="text.primary">
//             Create News Article
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Add a new news article or press release
//           </Typography>
//         </Box>
//       </Box>

//       {/* MAIN FORM */}
//       <Box component="form" onSubmit={handleSubmit}>
//         <Stack spacing={4}>
//           {/* BASIC INFORMATION */}
//           <Card sx={{ p: 3 }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
//               Basic Information
//             </Typography>
            
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   label="Title *"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   error={!!errors.title}
//                   helperText={errors.title}
//                   placeholder="Enter article title"
//                   fullWidth
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <TextField
//                   label="Slug *"
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleSlugChange}
//                   error={!!errors.slug}
//                   helperText={errors.slug}
//                   placeholder="article-url-slug"
//                   fullWidth
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <TextField
//                   label="Excerpt *"
//                   name="excerpt"
//                   value={formData.excerpt}
//                   onChange={handleInputChange}
//                   error={!!errors.excerpt}
//                   helperText={errors.excerpt}
//                   placeholder="Brief summary of the article..."
//                   multiline
//                   rows={1}
//                   fullWidth
//                 />
//               </Grid>
//             </Grid>
//           </Card>

//           {/* CONTENT */}
//           <Card sx={{ p: 3 }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
//               Content *
//             </Typography>
//             <TextField
//               name="content"
//               value={formData.content}
//               onChange={handleInputChange}
//               error={!!errors.content}
//               helperText={errors.content}
//               placeholder="Write the full article content here..."
//               multiline
//               rows={3}
//               fullWidth
//             />
//           </Card>

//           {/* FEATURED IMAGE */}
//           <Card sx={{ p: 3 }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
//               Featured Image *
//             </Typography>
//             <TextField
//               type="url"
//               name="featuredImage"
//               value={formData.featuredImage}
//               onChange={handleInputChange}
//               error={!!errors.featuredImage}
//               helperText={errors.featuredImage}
//               placeholder="https://example.com/image.jpg"
//               fullWidth
//             />
//             {formData.featuredImage && (
//               <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden' }}>
//                 <img
//                   src={formData.featuredImage}
//                   alt="Featured preview"
//                   style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
//                   onError={(e) => {
//                     e.target.style.display = 'none';
//                   }}
//                 />
//               </Box>
//             )}
//           </Card>

//           {/* CATEGORIZATION & PUBLISHING OPTIONS IN ONE ROW */}
//           <Grid container spacing={3}>
//             {/* CATEGORIZATION */}
//             <Grid item xs={12} md={6}>
//               <Card sx={{ p: 3, height: '100%' }}>
//                 <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
//                   Categorization
//                 </Typography>
                
//                 <Stack spacing={3}>
//                   <SelectField
//                     label="Category *"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     options={categoryOptions}
//                     fullWidth
//                   />

//                   <SelectField
//                     label="Related District"
//                     name="relatedDistrict"
//                     value={formData.relatedDistrict}
//                     onChange={handleInputChange}
//                     options={districtOptions}
//                     fullWidth
//                   />

//                   {/* TAGS */}
//                   <Box>
//                     <Typography variant="body2" fontWeight="medium" gutterBottom>
//                       Tags
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//                       <TextField
//                         value={tempTag}
//                         onChange={handleTagsInput}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter') {
//                             e.preventDefault();
//                             handleAddTag();
//                           }
//                         }}
//                         placeholder="Add tags..."
//                         fullWidth
//                       />
//                       <Button
//                         onClick={handleAddTag}
//                         sx={{ 
//                           minWidth: '80px',
//                           backgroundColor: '#144ae9',
//                           color: 'white',
//                           '&:hover': {
//                             backgroundColor: '#0d3ec7'
//                           }
//                         }}
//                       >
//                         ADD
//                       </Button>
//                     </Box>
                    
//                     {/* TAGS LIST */}
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                       {formData.tags.map((tag, index) => (
//                         <Box
//                           key={index}
//                           sx={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 1,
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             px: 2,
//                             py: 1,
//                             borderRadius: 1,
//                             fontSize: '0.875rem',
//                             border: '1px solid #144ae920'
//                           }}
//                         >
//                           {tag}
//                           <Box
//                             component="span"
//                             onClick={() => handleRemoveTag(tag)}
//                             sx={{
//                               cursor: 'pointer',
//                               '&:hover': { opacity: 0.7 }
//                             }}
//                           >
//                             ×
//                           </Box>
//                         </Box>
//                       ))}
//                     </Box>
//                   </Box>
//                 </Stack>
//               </Card>
//             </Grid>

//             {/* PUBLISHING OPTIONS */}
//             <Grid item xs={12} md={6}>
//               <Card sx={{ p: 3, height: '100%' }}>
//                 <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
//                   Publishing Options
//                 </Typography>
                
//                 <Stack spacing={3}>
//                   <TextField
//                     type="date"
//                     name="publishDate"
//                     value={formData.publishDate}
//                     onChange={handleInputChange}
//                     label="Publish Date"
//                     InputLabelProps={{ shrink: true }}
//                     fullWidth
//                   />

//                   <SelectField
//                     label="Status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                     options={statusOptions}
//                     fullWidth
//                   />

//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <input
//                       type="checkbox"
//                       name="featured"
//                       checked={formData.featured}
//                       onChange={handleInputChange}
//                       style={{
//                         width: '18px',
//                         height: '18px',
//                         accentColor: '#144ae9'
//                       }}
//                     />
//                     <Typography variant="body1" fontWeight="medium">
//                       Featured Article
//                     </Typography>
//                   </Box>
//                 </Stack>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* SUBMIT BUTTONS */}
//           <Card sx={{ p: 3 }}>
//             <Box sx={{ 
//               display: 'flex', 
//               gap: 2, 
//               flexDirection: { xs: 'column', sm: 'row' } 
//             }}>
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 startIcon={loading ? <Loader size={20} /> : null}
//                 size="large"
//                 sx={{ 
//                   flex: 1,
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   '&:hover': {
//                     backgroundColor: '#0d3ec7'
//                   },
//                   '&.Mui-disabled': {
//                     backgroundColor: '#144ae950'
//                   }
//                 }}
//               >
//                 {loading ? 'Creating...' : 'Create News Article'}
//               </Button>
//               <Link href="/admin/news" style={{ textDecoration: 'none', flex: 1 }}>
//                 <Button
//                   variant="outlined"
//                   size="large"
//                   sx={{ 
//                     width: '100%',
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     '&:hover': {
//                       borderColor: '#0d3ec7',
//                       backgroundColor: '#144ae910'
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Link>
//             </Box>
//           </Card>
//         </Stack>
//       </Box>
//     </Box>
//   );
// }