'use client'

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { fetchNewsById, updateNews, clearError, clearSuccess } from "@/redux/slices/newsSlice"
import { toast } from "react-toastify"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  FormControlLabel,
  Stack,
  Select
} from '@mui/material'
import {
  CalendarToday,
  Visibility,
  Schedule
} from '@mui/icons-material'

// Import your custom components
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import StatusChip from "@/components/ui/StatusChip"
import Loader from "@/components/ui/Loader"

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { selectedNews, loading, error, success } = useSelector((state) => state.news)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    category: "announcement",
    tags: [],
    status: "draft",
    featured: false,
    publishDate: "",
  })

  // INITIAL LOAD
  useEffect(() => {
    if (params.id) {
      dispatch(fetchNewsById(params.id))
    }
  }, [params.id, dispatch])

  // POPULATE FORM WHEN NEWS LOADED
  useEffect(() => {
    if (selectedNews) {
      setFormData({
        title: selectedNews.title || "",
        slug: selectedNews.slug || "",
        content: selectedNews.content || "",
        excerpt: selectedNews.excerpt || "",
        featuredImage: selectedNews.featuredImage || "",
        category: selectedNews.category || "announcement",
        tags: selectedNews.tags || [],
        status: selectedNews.status || "draft",
        featured: selectedNews.featured || false,
        publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
      })
    }
  }, [selectedNews])

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success("News article updated successfully!")
      dispatch(clearSuccess())
      setIsEditing(false)
      setIsSaving(false)
      // Reload data
      if (params.id) {
        dispatch(fetchNewsById(params.id))
      }
    }
    if (error) {
      toast.error(error?.message || "Failed to update news")
      dispatch(clearError())
      setIsSaving(false)
    }
  }, [success, error, dispatch, params.id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)
    setFormData((prev) => ({
      ...prev,
      tags,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      await dispatch(
        updateNews({
          id: params.id,
          newsData: formData,
        }),
      ).unwrap()
    } catch (err) {
      console.error("[v0] Update error:", err)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <Visibility sx={{ fontSize: 16 }} />
      case 'draft': return <CalendarToday sx={{ fontSize: 16 }} />
      // case 'scheduled': return <Schedule sx={{ fontSize: 16 }} />
      default: return <CalendarToday sx={{ fontSize: 16 }} />
    }
  }

  const categoryOptions = [
    { value: "announcement", label: "Announcement" },
    { value: "media_coverage", label: "Media Coverage" },
    { value: "press_release", label: "Press Release" },
    { value: "update", label: "Update" }
  ]

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    // { value: "scheduled", label: "Scheduled" }
  ]

  if (loading) {
    return (
      <Loader />
    )
  }

  if (!selectedNews) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <AlertCircle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          News Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This news article could not be found.
        </Typography>
        <Link href="/admin/news" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            sx={{ mt: 2, fontWeight: 'bold' }}
          >
            Back to News
          </Button>
        </Link>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/admin/news" style={{ textDecoration: 'none', }}>
            <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5 }}>
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <Box>
            <Typography variant="h4" fontWeight={700} color="144ae9">
              {isEditing ? "Edit News Article" : "News Article Details"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedNews.author?.name && (
                <>
                  Created by <Typography component="span" fontWeight={600}>{selectedNews.author.name}</Typography>
                </>
              )}
            </Typography>
          </Box>
        </Box>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            sx={{ fontWeight: 'bold', backgroundColor: '#144ae9' }}
          >
            Edit Article
          </Button>
        )}
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* FORM - Takes full width on mobile, 70% on desktop */}
        <Box sx={{
          flex: { xs: '1 1 auto', lg: '1 1 70%' },
          minWidth: 0
        }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* FEATURED IMAGE */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Featured Image
              </Typography>
              {formData.featuredImage && (
                <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <img
                    src={formData.featuredImage || "/placeholder.svg"}
                    alt={formData.title}
                    style={{ width: '100%', height: 256, objectFit: 'cover' }}
                  />
                </Box>
              )}
              {isEditing ? (
                <TextField
                  label="Image URL"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  disabled={isSaving}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {formData.featuredImage || "No image"}
                </Typography>
              )}
            </Card>

            {/* TITLE */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Title *
              </Typography>
              {isEditing ? (
                <TextField
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Article title"
                  disabled={isSaving}
                />
              ) : (
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  {formData.title}
                </Typography>
              )}
            </Card>

            {/* SLUG */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Slug *
              </Typography>
              {isEditing ? (
                <TextField
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="article-slug"
                  disabled={isSaving}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {formData.slug}
                </Typography>
              )}
            </Card>

            {/* EXCERPT */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Excerpt *
              </Typography>
              {isEditing ? (
                <TextField
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the article"
                  multiline
                  rows={3}
                  disabled={isSaving}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {formData.excerpt}
                </Typography>
              )}
            </Card>

            {/* CONTENT */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Content *
              </Typography>
              {isEditing ? (
                <TextField
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Article content"
                  multiline
                  rows={12}
                  disabled={isSaving}
                />
              ) : (
                <Box sx={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    {formData.content}
                  </Typography>
                </Box>
              )}
            </Card>

            {/* SAVE BUTTON */}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  disabled={isSaving}
                  startIcon={isSaving ? <Loader /> : <Save size={20} />}
                  size="large"
                  sx={{ flex: 1, backgroundColor: '#144ae9' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="outlined"
                  size="large"
                  disabled={isSaving}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* SIDEBAR - Takes full width on mobile, 30% on desktop */}
        <Box sx={{
          flex: { xs: '1 1 auto', lg: '1 1 30%' },
          maxWidth: { lg: 400 },
          minWidth: 0
        }}>
          <Stack spacing={3}>
            {/* METADATA */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Information
              </Typography>

              {/* CATEGORY */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                  Category
                </Typography>
                {isEditing ? (
                  <SelectField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    options={categoryOptions}
                    disabled={isSaving}
                  />
                ) : (
                  <StatusChip
                    status={formData.category}
                    label={formData.category.replace("_", " ")}
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
              </Box>

              {/* STATUS */}
              {/* <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                  Status
                </Typography>
                {isEditing ? (
                  <SelectField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={statusOptions}
                    disabled={isSaving}
                  />
                ) : (
                  <StatusChip 
                    status={formData.status} 
                    label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  />
                )}
              </Box> */}
              {/* STATUS - FIXED VERSION */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                  Status
                </Typography>
                {isEditing ? (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                      disabled={isSaving}
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <StatusChip
                    status={formData.status}
                    label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  />
                )}
              </Box>
              {/* PUBLISH DATE */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                  Publish Date
                </Typography>
                {isEditing ? (
                  <TextField
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <Typography variant="body2" color="text.primary">
                    {formData.publishDate ? new Date(formData.publishDate).toLocaleDateString() : "Not set"}
                  </Typography>
                )}
              </Box>

              {/* FEATURED */}
              <Box>
                {isEditing ? (
                  <FormControlLabel
                    control={
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: '#144ae9'
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={500}>
                        Featured Article
                      </Typography>
                    }
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Featured:
                    </Typography>
                    <Typography variant="body2" color={formData.featured ? '#144ae9' : 'text.secondary'} fontWeight={600}>
                      {formData.featured ? "⭐ Yes" : "No"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* TAGS */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Tags
              </Typography>
              {isEditing ? (
                <TextField
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  placeholder="Comma-separated tags"
                  size="small"
                  disabled={isSaving}
                />
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.length > 0 ? (
                    formData.tags.map((tag) => (
                      <StatusChip
                        key={tag}
                        status="active"
                        label={tag}
                        size="small"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tags
                    </Typography>
                  )}
                </Box>
              )}
            </Card>

            {/* ADDITIONAL INFO */}
            <Card>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Additional Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Created
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                {selectedNews.views !== undefined && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Views
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {selectedNews.views}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}