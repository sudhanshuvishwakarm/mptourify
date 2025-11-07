'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createNews, clearError, clearSuccess } from '@/redux/slices/newsSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Stack,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
} from '@mui/icons-material';

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

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    category: 'announcement',
    tags: [],
    relatedDistrict: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    featured: false
  });

  const [errors, setErrors] = useState({});
  const [tempTag, setTempTag] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    dispatch(fetchDistricts({ status: 'active', limit: 100 }));
  }, [dispatch]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.featuredImage.trim()) newErrors.featuredImage = 'Featured image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    const submitData = { ...formData };
    if (!submitData.relatedDistrict) delete submitData.relatedDistrict;

    dispatch(createNews(submitData));
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

  const handleTagsInput = (e) => {
    setTempTag(e.target.value);
  };

  const categoryOptions = [
    { value: 'media_coverage', label: 'Media Coverage' },
    { value: 'press_release', label: 'Press Release' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'update', label: 'Update' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    // { value: 'scheduled', label: 'Scheduled' }
  ];

  const districtOptions = [
    { value: '', label: 'No District' },
    ...districts.map(district => ({
      value: district._id,
      label: district.name
    }))
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Link href="/admin/news" style={{ textDecoration: 'none' }}>
          <IconButton sx={{ color: '#144ae9', p: 1.5 }}>
            <ArrowBack />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Create News Article
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add a new news article or press release
          </Typography>
        </Box>
      </Box>

      {/* MAIN FORM */}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={4}>
          {/* BASIC INFORMATION */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
              </Grid>
              
              <Grid item xs={12}>
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
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Excerpt *"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  error={!!errors.excerpt}
                  helperText={errors.excerpt}
                  placeholder="Brief summary of the article..."
                  multiline
                  rows={1}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Card>

          {/* CONTENT */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Content *
            </Typography>
            <TextField
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              error={!!errors.content}
              helperText={errors.content}
              placeholder="Write the full article content here..."
              multiline
              rows={3}
              fullWidth
            />
          </Card>

          {/* FEATURED IMAGE */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
              Featured Image *
            </Typography>
            <TextField
              type="url"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleInputChange}
              error={!!errors.featuredImage}
              helperText={errors.featuredImage}
              placeholder="https://example.com/image.jpg"
              fullWidth
            />
            {formData.featuredImage && (
              <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden' }}>
                <img
                  src={formData.featuredImage}
                  alt="Featured preview"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            )}
          </Card>

          {/* CATEGORIZATION & PUBLISHING OPTIONS IN ONE ROW */}
          <Grid container spacing={3}>
            {/* CATEGORIZATION */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  Categorization
                </Typography>
                
                <Stack spacing={3}>
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

                  {/* TAGS */}
                  <Box>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        value={tempTag}
                        onChange={handleTagsInput}
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
                        onClick={handleAddTag}
                        sx={{ 
                          minWidth: '80px',
                          backgroundColor: '#144ae9',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#0d3ec7'
                          }
                        }}
                      >
                        ADD
                      </Button>
                    </Box>
                    
                    {/* TAGS LIST */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.tags.map((tag, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            backgroundColor: '#144ae910',
                            color: '#144ae9',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            border: '1px solid #144ae920'
                          }}
                        >
                          {tag}
                          <Box
                            component="span"
                            onClick={() => handleRemoveTag(tag)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.7 }
                            }}
                          >
                            ×
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* PUBLISHING OPTIONS */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  Publishing Options
                </Typography>
                
                <Stack spacing={3}>
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

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#144ae9'
                      }}
                    />
                    <Typography variant="body1" fontWeight="medium">
                      Featured Article
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* SUBMIT BUTTONS */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', sm: 'row' } 
            }}>
              <Button
                type="submit"
                disabled={loading}
                startIcon={loading ? <Loader size={20} /> : null}
                size="large"
                sx={{ 
                  flex: 1,
                  backgroundColor: '#144ae9',
                  color: 'white',
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
              <Link href="/admin/news" style={{ textDecoration: 'none', flex: 1 }}>
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
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}