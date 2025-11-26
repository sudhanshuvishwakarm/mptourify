'use client'

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { fetchNewsById, updateNews, clearError, clearSuccess } from "@/redux/slices/newsSlice"
import { fetchDistricts } from '@/redux/slices/districtSlice'
import { fetchPanchayats } from '@/redux/slices/panchayatSlice'
import { toast } from "react-toastify"
import { 
  ArrowLeft, 
  Save, 
  Edit,
  AlertCircle, 
  Image as ImageIcon,
  CloudUpload,
  Link as LinkIcon,
  Calendar,
  User,
  Eye,
  Tag,
  X
} from "lucide-react"
import Link from "next/link"

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
  const { districts } = useSelector((state) => state.district)
  const { panchayats } = useSelector((state) => state.panchayat)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('url')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [filteredPanchayats, setFilteredPanchayats] = useState([])
  
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
    relatedDistrict: "",
    relatedPanchayat: ""
  })

  const [errors, setErrors] = useState({})

  // FETCH DISTRICTS AND PANCHAYATS
  useEffect(() => {
    dispatch(fetchDistricts({ status: 'active', limit: 100 }))
    dispatch(fetchPanchayats({ status: 'active', limit: 1000 }))
  }, [dispatch])

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
        relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
        relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
      })
      setPreview(selectedNews.featuredImage)
    }
  }, [selectedNews])

  // FILTER PANCHAYATS BASED ON SELECTED DISTRICT
  useEffect(() => {
    if (formData.relatedDistrict) {
      const filtered = panchayats.filter(
        p => p.district?._id === formData.relatedDistrict || p.district === formData.relatedDistrict
      )
      setFilteredPanchayats(filtered)
      
      // Reset panchayat if it doesn't belong to selected district
      if (formData.relatedPanchayat) {
        const isPanchayatValid = filtered.some(p => p._id === formData.relatedPanchayat)
        if (!isPanchayatValid) {
          setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
        }
      }
    } else {
      setFilteredPanchayats([])
      setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
    }
  }, [formData.relatedDistrict, panchayats])

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success("News article updated successfully!")
      dispatch(clearSuccess())
      setIsEditing(false)
      setIsSaving(false)
      setFile(null)
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)')
        return
      }

      const maxSize = 95 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 50MB limit')
        return
      }

      setFile(selectedFile)
      
      const reader = new FileReader()
      reader.onload = (event) => setPreview(event.target.result)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUrlChange = (url) => {
    setFormData(prev => ({ ...prev, featuredImage: url }))
    setPreview(url)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(formData.featuredImage)
    if (uploadMethod === 'url') {
      setFormData(prev => ({ ...prev, featuredImage: selectedNews?.featuredImage || '' }))
      setPreview(selectedNews?.featuredImage || null)
    }
  }

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

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    if (uploadMethod === 'file' && !file && !formData.featuredImage) {
      newErrors.featuredImage = 'Featured image is required'
    } else if (uploadMethod === 'url' && !formData.featuredImage.trim()) {
      newErrors.featuredImage = 'Featured image URL is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix all errors")
      return
    }

    setIsSaving(true)
    try {
      if (uploadMethod === 'file' && file) {
        const submitData = new FormData()
        
        submitData.append('featuredImage', file)
        submitData.append('uploadMethod', 'file')
        submitData.append('title', formData.title)
        submitData.append('slug', formData.slug)
        submitData.append('content', formData.content)
        submitData.append('excerpt', formData.excerpt)
        submitData.append('category', formData.category)
        submitData.append('status', formData.status)
        submitData.append('publishDate', formData.publishDate)
        submitData.append('featured', formData.featured)
        
        if (formData.relatedDistrict) {
          submitData.append('relatedDistrict', formData.relatedDistrict)
        }
        if (formData.relatedPanchayat) {
          submitData.append('relatedPanchayat', formData.relatedPanchayat)
        }
        
        submitData.append('tags', formData.tags.join(','))

        await dispatch(
          updateNews({
            id: params.id,
            newsData: submitData,
          })
        ).unwrap()
      } else {
        const submitData = { ...formData }
        if (!submitData.relatedDistrict) delete submitData.relatedDistrict
        if (!submitData.relatedPanchayat) delete submitData.relatedPanchayat
        
        await dispatch(
          updateNews({
            id: params.id,
            newsData: submitData,
          })
        ).unwrap()
      }
    } catch (err) {
      console.error("Update error:", err)
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsSaving(false)
    setFile(null)
    setUploadMethod('url')
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
        relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
        relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
      })
      setPreview(selectedNews.featuredImage)
    }
    setErrors({})
  }

  const categoryOptions = [
    { value: "announcement", label: "Announcement" },
    { value: "media_coverage", label: "Media Coverage" },
    { value: "press_release", label: "Press Release" },
    { value: "update", label: "Update" }
  ]

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" }
  ]

  const districtOptions = [
    { value: '', label: 'No District' },
    ...districts.map(district => ({
      value: district._id,
      label: district.name
    }))
  ]

  const panchayatOptions = [
    { value: '', label: 'No Panchayat' },
    ...filteredPanchayats.map(panchayat => ({
      value: panchayat._id,
      label: panchayat.name
    }))
  ]

  if (loading && !selectedNews) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Loader message={"Loading..."} />
      </div>
    )
  }

  if (!selectedNews) {
    return (
      <div className="text-center py-8">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h4 className="text-2xl font-bold text-gray-900 mb-4">
          News Not Found
        </h4>
        <p className="text-gray-600 mb-4">
          This news article could not be found.
        </p>
        <Link href="/admin/news" className="no-underline">
          <Button
            startIcon={<ArrowLeft size={16} />}
            sx={{
              backgroundColor: "#1348e8",
              color: "white",
              "&:hover": { backgroundColor: "#0d3a9d" },
              mt: 2
            }}
          >
            Back to News
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Saving Loader */}
      {isSaving && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Saving..."} />
        </div>
      )}
      
      {/* HEADER - Improved responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/news" className="no-underline">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {selectedNews.title}
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Edit news article' : 'View news article details'}
              {selectedNews.author?.name && (
                <> • Created by <span className="font-semibold">{selectedNews.author.name}</span></>
              )}
            </div>
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
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Edit Article
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
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
                flex: { xs: 1, sm: 'none' }
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
                "&:disabled": { backgroundColor: "#9ca3af" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                flex: { xs: 1, sm: 'none' }
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Image and Sidebar in one row */}
        <div className="flex flex-col xl:flex-row gap-6 mb-6">
          {/* Main Content - 70% width */}
          <div className="w-full xl:w-[70%]">
            <div className="flex flex-col gap-6">
              {/* Featured Image Section */}
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                {/* <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Image</h2> */}
                
                {isEditing ? (
                  <>
                    {/* Upload Method Selection */}
                    <div className="flex border-b border-gray-200 mb-4">
                      <button
                        type="button"
                        onClick={() => { setUploadMethod('url'); setFile(null); setPreview(formData.featuredImage); }}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                          uploadMethod === 'url' 
                            ? 'border-[#1348e8] text-[#1348e8]' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <LinkIcon size={18} />
                        Use URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                          uploadMethod === 'file' 
                            ? 'border-[#1348e8] text-[#1348e8]' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
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
                            className="border-2 border-dashed border-[#1348e8] rounded-lg p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors"
                            onClick={() => document.getElementById('file-upload').click()}
                          >
                            <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
                            <div className="text-lg font-semibold text-gray-900 mb-2">Click to upload featured image</div>
                            <div className="text-sm text-gray-600">Supports JPG, PNG, WebP (Max 95MB)</div>
                          </div>
                        ) : (
                          <div className="border border-[#1348e820] rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <ImageIcon size={24} className="text-[#1348e8]" />
                                <div>
                                  <div className="font-semibold text-gray-900">{file.name}</div>
                                  <div className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                </div>
                              </div>
                              <button 
                                onClick={removeFile}
                                className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
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
                        label="Featured Image URL *" 
                        value={formData.featuredImage} 
                        onChange={(e) => handleUrlChange(e.target.value)} 
                        error={errors.featuredImage}
                        helperText={errors.featuredImage || "Paste direct URL to featured image"}
                        placeholder="https://example.com/featured-image.jpg" 
                        startIcon={<LinkIcon size={20} className="text-[#1348e8]" />} 
                        fullWidth 
                      />
                    )}
                  </>
                ) : (
                  <div className="border border-[#1348e820] overflow-hidden bg-white rounded-lg">
                    <div className="relative bg-[#1348e805] p-0">
                      <div className="flex justify-center items-center">
                        {preview ? (
                          <img 
                            src={preview} 
                            alt={selectedNews.title} 
                            className="w-full  object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center text-gray-500 py-16">
                            <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
                            <div>No featured image set</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Basic Information */}
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
                  <TextField 
                    label="Title *" 
                    name="title"
                    value={formData.title} 
                    onChange={handleInputChange} 
                    error={errors.title}
                    helperText={errors.title}
                    disabled={!isEditing} 
                    fullWidth 
                  />
                  <TextField 
                    label="Slug *" 
                    name="slug"
                    value={formData.slug} 
                    onChange={handleInputChange} 
                    error={errors.slug}
                    helperText={errors.slug}
                    disabled={!isEditing} 
                    fullWidth 
                  />
                  <TextField 
                    label="Excerpt *" 
                    name="excerpt"
                    value={formData.excerpt} 
                    onChange={handleInputChange} 
                    error={errors.excerpt}
                    helperText={errors.excerpt}
                    multiline
                    rows={3}
                    disabled={!isEditing} 
                    fullWidth 
                  />
                </div>
              </Card>

              {/* Content */}
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Content</h2>
                {isEditing ? (
                  <TextField 
                    label="Content *" 
                    name="content"
                    value={formData.content} 
                    onChange={handleInputChange} 
                    error={errors.content}
                    helperText={errors.content}
                    multiline
                    rows={12}
                    disabled={!isEditing} 
                    fullWidth 
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-gray-600 border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                    {formData.content}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Sidebar - 30% width */}
          <div className="w-full xl:w-[30%]">
            <div className="flex flex-col gap-6">
              {/* Article Information */}
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Article Information</h3>
                
                <div className="flex flex-col gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    {isEditing ? (
                      <SelectField
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        options={categoryOptions}
                        disabled={isSaving}
                        fullWidth
                      />
                    ) : (
                      <StatusChip
                        status={formData.category}
                        label={formData.category.replace("_", " ")}
                        className="capitalize"
                      />
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    {isEditing ? (
                      <SelectField
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        options={statusOptions}
                        disabled={isSaving}
                        fullWidth
                      />
                    ) : (
                      <StatusChip
                        status={formData.status}
                        label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                      />
                    )}
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date
                    </label>
                    {isEditing ? (
                      <TextField
                        type="date"
                        name="publishDate"
                        value={formData.publishDate}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        startIcon={<Calendar size={20} className="text-[#1348e8]" />}
                        fullWidth
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar size={18} className="text-[#1348e8]" />
                        {formData.publishDate ? new Date(formData.publishDate).toLocaleDateString() : "Not set"}
                      </div>
                    )}
                  </div>

                  {/* Featured */}
                  <div>
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          disabled={isSaving}
                          className="w-4 h-4 text-[#1348e8] rounded focus:ring-[#1348e8]"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Featured Article
                        </span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Featured:</span>
                        <span className={`text-sm font-semibold ${formData.featured ? 'text-[#1348e8]' : 'text-gray-500'}`}>
                          {formData.featured ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Location Information */}
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
                
                <div className="flex flex-col gap-4">
                  {/* Related District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related District
                    </label>
                    {isEditing ? (
                      <SelectField
                        name="relatedDistrict"
                        value={formData.relatedDistrict}
                        onChange={handleInputChange}
                        options={districtOptions}
                        disabled={isSaving}
                        fullWidth
                      />
                    ) : selectedNews.relatedDistrict ? (
                      <div className="text-gray-900">
                        {selectedNews.relatedDistrict?.name}
                      </div>
                    ) : (
                      <div className="text-gray-500">No district</div>
                    )}
                  </div>

                  {/* Related Panchayat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Panchayat
                    </label>
                    {isEditing ? (
                      <SelectField
                        name="relatedPanchayat"
                        value={formData.relatedPanchayat}
                        onChange={handleInputChange}
                        options={panchayatOptions}
                        disabled={!formData.relatedDistrict || isSaving}
                        helperText={!formData.relatedDistrict ? "Select a district first" : ""}
                        fullWidth
                      />
                    ) : selectedNews.relatedPanchayat ? (
                      <div className="text-gray-900">
                        {selectedNews.relatedPanchayat?.name}
                      </div>
                    ) : (
                      <div className="text-gray-500">No panchayat</div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Tags */}
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tags</h3>
                {isEditing ? (
                  <TextField
                    value={formData.tags.join(", ")}
                    onChange={handleTagsChange}
                    placeholder="Comma-separated tags"
                    disabled={isSaving}
                    startIcon={<Tag size={20} className="text-[#1348e8]" />}
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.length > 0 ? (
                      formData.tags.map((tag, idx) => (
                        <StatusChip
                          key={idx}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: "#1348e820",
                            color: "#1348e8",
                            border: "1px solid #1348e8",
                            fontWeight: "600",
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No tags</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Additional Information */}
              <Card 
                sx={{ 
                  p: 3, 
                  border: "1px solid", 
                  borderColor: "#1348e820", 
                  backgroundColor: "white"
                }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-[#1348e8]" />
                    <div>
                      <div className="text-sm text-gray-500">Author</div>
                      <div className="text-gray-900 font-medium">
                        {selectedNews.author?.name || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-[#1348e8]" />
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="text-gray-900 font-medium">
                        {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-[#1348e8]" />
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="text-gray-900 font-medium">
                        {selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {selectedNews.views !== undefined && (
                    <div className="flex items-center gap-3">
                      <Eye size={18} className="text-[#1348e8]" />
                      <div>
                        <div className="text-sm text-gray-500">Views</div>
                        <div className="text-gray-900 font-medium">
                          {selectedNews.views}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}// 'use client'

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import { fetchNewsById, updateNews, clearError, clearSuccess } from "@/redux/slices/newsSlice"
// import { fetchDistricts } from '@/redux/slices/districtSlice'
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice'
// import { toast } from "react-toastify"
// import { 
//   ArrowLeft, 
//   Save, 
//   AlertCircle, 
//   Image as ImageIcon,
//   CloudUpload,
//   Link as LinkIcon 
// } from "lucide-react"
// import Link from "next/link"
// import {
//   Tabs,
//   Tab
// } from '@mui/material'

// // Import your custom components
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import StatusChip from "@/components/ui/StatusChip"
// import Loader from "@/components/ui/Loader"

// export default function NewsDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedNews, loading, error, success } = useSelector((state) => state.news)
//   const { districts } = useSelector((state) => state.district)
//   const { panchayats } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [uploadMethod, setUploadMethod] = useState('url') // 'file' or 'url'
//   const [file, setFile] = useState(null)
//   const [preview, setPreview] = useState(null)
//   const [filteredPanchayats, setFilteredPanchayats] = useState([])
  
//   const [formData, setFormData] = useState({
//     title: "",
//     slug: "",
//     content: "",
//     excerpt: "",
//     featuredImage: "",
//     category: "announcement",
//     tags: [],
//     status: "draft",
//     featured: false,
//     publishDate: "",
//     relatedDistrict: "",
//     relatedPanchayat: ""
//   })

//   // FETCH DISTRICTS AND PANCHAYATS
//   useEffect(() => {
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }))
//     dispatch(fetchPanchayats({ status: 'active', limit: 1000 }))
//   }, [dispatch])

//   // INITIAL LOAD
//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchNewsById(params.id))
//     }
//   }, [params.id, dispatch])

//   // POPULATE FORM WHEN NEWS LOADED
//   useEffect(() => {
//     if (selectedNews) {
//       setFormData({
//         title: selectedNews.title || "",
//         slug: selectedNews.slug || "",
//         content: selectedNews.content || "",
//         excerpt: selectedNews.excerpt || "",
//         featuredImage: selectedNews.featuredImage || "",
//         category: selectedNews.category || "announcement",
//         tags: selectedNews.tags || [],
//         status: selectedNews.status || "draft",
//         featured: selectedNews.featured || false,
//         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//         relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
//         relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
//       })
//       setPreview(selectedNews.featuredImage)
//     }
//   }, [selectedNews])

//   // FILTER PANCHAYATS BASED ON SELECTED DISTRICT
//   useEffect(() => {
//     if (formData.relatedDistrict) {
//       const filtered = panchayats.filter(
//         p => p.district?._id === formData.relatedDistrict || p.district === formData.relatedDistrict
//       )
//       setFilteredPanchayats(filtered)
      
//       // Reset panchayat if it doesn't belong to selected district
//       if (formData.relatedPanchayat) {
//         const isPanchayatValid = filtered.some(p => p._id === formData.relatedPanchayat)
//         if (!isPanchayatValid) {
//           setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
//         }
//       }
//     } else {
//       setFilteredPanchayats([])
//       setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
//     }
//   }, [formData.relatedDistrict, panchayats])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("News article updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setFile(null)
//       // Reload data
//       if (params.id) {
//         dispatch(fetchNewsById(params.id))
//       }
//     }
//     if (error) {
//       toast.error(error?.message || "Failed to update news")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, dispatch, params.id])

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0]
    
//     if (selectedFile) {
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp']
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, WebP)')
//         return
//       }

//       // Validate file size (50MB)
//       const maxSize = 95 * 1024 * 1024
//       if (selectedFile.size > maxSize) {
//         toast.error('File size exceeds 50MB limit')
//         return
//       }

//       setFile(selectedFile)
      
//       // Create preview
//       const reader = new FileReader()
//       reader.onload = (event) => setPreview(event.target.result)
//       reader.readAsDataURL(selectedFile)
//     }
//   }

//   const handleUrlChange = (url) => {
//     setFormData(prev => ({ ...prev, featuredImage: url }))
//     setPreview(url)
//   }

//   const removeFile = () => {
//     setFile(null)
//     setPreview(formData.featuredImage)
//     if (uploadMethod === 'url') {
//       setFormData(prev => ({ ...prev, featuredImage: selectedNews?.featuredImage || '' }))
//       setPreview(selectedNews?.featuredImage || null)
//     }
//   }

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   const handleTagsChange = (e) => {
//     const tags = e.target.value
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter((tag) => tag)
//     setFormData((prev) => ({
//       ...prev,
//       tags,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     // Validate image
//     if (uploadMethod === 'file' && !file && !formData.featuredImage) {
//       toast.error("Please provide a featured image")
//       return
//     } else if (uploadMethod === 'url' && !formData.featuredImage) {
//       toast.error("Please provide a featured image URL")
//       return
//     }

//     setIsSaving(true)
//     try {
//       // Create FormData for file upload or use JSON for URL
//       if (uploadMethod === 'file' && file) {
//         const submitData = new FormData()
        
//         // Append file and upload method
//         submitData.append('featuredImage', file)
//         submitData.append('uploadMethod', 'file')
        
//         // Append other form data
//         submitData.append('title', formData.title)
//         submitData.append('slug', formData.slug)
//         submitData.append('content', formData.content)
//         submitData.append('excerpt', formData.excerpt)
//         submitData.append('category', formData.category)
//         submitData.append('status', formData.status)
//         submitData.append('publishDate', formData.publishDate)
        
//         // Append optional fields if they exist
//         if (formData.relatedDistrict) {
//           submitData.append('relatedDistrict', formData.relatedDistrict)
//         }
//         if (formData.relatedPanchayat) {
//           submitData.append('relatedPanchayat', formData.relatedPanchayat)
//         }
        
//         // Append tags array
//         submitData.append('tags', formData.tags.join(','))

//         await dispatch(
//           updateNews({
//             id: params.id,
//             newsData: submitData,
//           })
//         ).unwrap()
//       } else {
//         // Use regular JSON for URL upload or no image change
//         const submitData = { ...formData }
//         if (!submitData.relatedDistrict) delete submitData.relatedDistrict
//         if (!submitData.relatedPanchayat) delete submitData.relatedPanchayat
        
//         await dispatch(
//           updateNews({
//             id: params.id,
//             newsData: submitData,
//           })
//         ).unwrap()
//       }
//     } catch (err) {
//       console.error("Update error:", err)
//       setIsSaving(false)
//     }
//   }

//   const categoryOptions = [
//     { value: "announcement", label: "Announcement" },
//     { value: "media_coverage", label: "Media Coverage" },
//     { value: "press_release", label: "Press Release" },
//     { value: "update", label: "Update" }
//   ]

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "published", label: "Published" }
//   ]

//   const districtOptions = [
//     { value: '', label: 'No District' },
//     ...districts.map(district => ({
//       value: district._id,
//       label: district.name
//     }))
//   ]

//   const panchayatOptions = [
//     { value: '', label: 'No Panchayat' },
//     ...filteredPanchayats.map(panchayat => ({
//       value: panchayat._id,
//       label: panchayat.name
//     }))
//   ]

//   if (loading && !selectedNews) {
//     return (
//       <div className="fixed inset-0 z-[9999]">
//         <Loader message={"Loading..."} />
//       </div>
//     )
//   }

//   if (!selectedNews) {
//     return (
//       <div className="text-center py-8">
//         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
//         <h4 className="text-2xl font-bold text-gray-900 mb-4">
//           News Not Found
//         </h4>
//         <p className="text-gray-600 mb-4">
//           This news article could not be found.
//         </p>
//         <Link href="/admin/news" className="no-underline">
//           <Button
//             startIcon={<ArrowLeft size={16} />}
//             sx={{
//               backgroundColor: "#1348e8",
//               color: "white",
//               "&:hover": { backgroundColor: "#0d3a9d" },
//               mt: 2
//             }}
//           >
//             Back to News
//           </Button>
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       {/* Saving Loader */}
//       {isSaving && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Saving..."} />
//         </div>
//       )}
      
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-4">
//           <Link href="/admin/news" className="no-underline">
//             <Button
//               variant="outlined"
//               sx={{
//                 borderColor: "#1348e8",
//                 color: "#1348e8",
//                 "&:hover": {
//                   borderColor: "#0d3a9d",
//                   backgroundColor: "#1348e810",
//                 },
//                 minWidth: "auto",
//                 padding: "12px"
//               }}
//             >
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//               {isEditing ? "Edit News Article" : "News Article Details"}
//             </h1>
//             <p className="text-gray-500 text-sm mt-1">
//               {selectedNews.author?.name && (
//                 <>
//                   Created by <span className="font-semibold">{selectedNews.author.name}</span>
//                 </>
//               )}
//             </p>
//           </div>
//         </div>

//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             sx={{
//               backgroundColor: "#1348e8",
//               color: "white",
//               "&:hover": { backgroundColor: "#0d3a9d" },
//               textTransform: "none",
//               fontSize: { xs: "0.875rem", sm: "1rem" },
//             }}
//           >
//             Edit Article
//           </Button>
//         )}
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* FORM - Takes full width on mobile, 70% on desktop */}
//         <div className="flex-1 lg:flex-[70%] min-w-0">
//           <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//             {/* FEATURED IMAGE */}
//             <div>
//               {/* <h3 className="text-lg font-semibold mb-4">
//                 Featured Image
//               </h3> */}
              
//               {isEditing ? (
//                 <>
//                   {/* UPLOAD METHOD SELECTION */}
//                   <Tabs
//                     value={uploadMethod}
//                     onChange={(e, newValue) => {
//                       setUploadMethod(newValue)
//                       setFile(null)
//                       if (newValue === 'url') {
//                         setPreview(formData.featuredImage)
//                       }
//                     }}
//                     sx={{ mb: 3 }}
//                   >
//                     <Tab 
//                       icon={<LinkIcon size={18} />} 
//                       iconPosition="start" 
//                       label="Image URL" 
//                       value="url" 
//                       sx={{ textTransform: "none" }}
//                     />
//                     <Tab 
//                       icon={<CloudUpload size={18} />} 
//                       iconPosition="start" 
//                       label="Upload New File" 
//                       value="file" 
//                       sx={{ textTransform: "none" }}
//                     />
//                   </Tabs>

//                   {uploadMethod === 'url' ? (
//                     <>
//                       <TextField
//                         label="Image URL"
//                         name="featuredImage"
//                         value={formData.featuredImage}
//                         onChange={(e) => handleUrlChange(e.target.value)}
//                         placeholder="https://example.com/image.jpg"
//                         disabled={isSaving}
//                         fullWidth
//                       />
//                       {preview && formData.featuredImage && (
//                         <div className="mt-4 rounded-xl overflow-hidden">
//                           <img
//                             src={preview}
//                             alt="Preview"
//                             className="w-full h-64 object-cover"
//                             onError={(e) => {
//                               e.target.style.display = 'none'
//                               toast.error('Failed to load image from URL')
//                             }}
//                           />
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       {!file ? (
//                         <>
//                           {preview && (
//                             <div className="mb-4 rounded-xl overflow-hidden">
//                               <img
//                                 src={preview}
//                                 alt="Current"
//                                 className="w-full object-cover"
//                               />
//                               <p className="text-gray-500 text-sm mt-2">
//                                 Current image - Upload a new file to replace
//                               </p>
//                             </div>
//                           )}
//                           <div
//                             className="border-2 border-dashed border-[#1348e8] rounded-xl p-6 text-center cursor-pointer bg-[#1348e805] hover:bg-[#1348e810] transition-colors"
//                             onClick={() => document.getElementById('file-upload').click()}
//                           >
//                             <CloudUpload size={36} className="text-[#1348e8] mx-auto mb-3" />
//                             <h4 className="text-lg font-semibold text-gray-900 mb-2">
//                               Click to upload new image
//                             </h4>
//                             <p className="text-gray-500 text-sm">
//                               Supports JPG, PNG, WebP (Max 95MB)
//                             </p>
//                           </div>
//                         </>
//                       ) : (
//                         <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//                           <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center gap-3">
//                               <ImageIcon size={24} className="text-[#1348e8]" />
//                               <div>
//                                 <p className="font-semibold text-gray-900">
//                                   {file.name}
//                                 </p>
//                                 <p className="text-gray-500 text-sm">
//                                   {(file.size / (1024 * 1024)).toFixed(2)} MB
//                                 </p>
//                               </div>
//                             </div>
//                             <Button
//                               type="button"
//                               onClick={removeFile}
//                               sx={{
//                                 color: "#d32f2f",
//                                 "&:hover": { backgroundColor: "#d32f210" }
//                               }}
//                             >
//                               Remove
//                             </Button>
//                           </div>
                          
//                           <img
//                             src={preview}
//                             alt="Preview"
//                             className="w-full h-48 object-contain rounded-lg"
//                           />
//                         </Card>
//                       )}
                      
//                       <input
//                         id="file-upload"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         className="hidden"
//                       />
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   {formData.featuredImage && (
//                     <div className="rounded-xl overflow-hidden">
//                       <img
//                         src={formData.featuredImage}
//                         alt={formData.title}
//                         className="w-full  object-cover"
//                       />
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* TITLE */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Title *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   placeholder="Article title"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {formData.title}
//                 </h2>
//               )}
//             </Card>

//             {/* SLUG */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Slug *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleInputChange}
//                   placeholder="article-slug"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <p className="text-gray-600">
//                   {formData.slug}
//                 </p>
//               )}
//             </Card>

//             {/* EXCERPT */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Excerpt *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="excerpt"
//                   value={formData.excerpt}
//                   onChange={handleInputChange}
//                   placeholder="Brief summary of the article"
//                   multiline
//                   rows={3}
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <p className="text-gray-600">
//                   {formData.excerpt}
//                 </p>
//               )}
//             </Card>

//             {/* CONTENT */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Content *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="content"
//                   value={formData.content}
//                   onChange={handleInputChange}
//                   placeholder="Article content"
//                   multiline
//                   rows={12}
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <div className="whitespace-pre-wrap max-h-96 overflow-auto">
//                   <p className="text-gray-600">
//                     {formData.content}
//                   </p>
//                 </div>
//               )}
//             </Card>

//             {/* SAVE BUTTON */}
//             {isEditing && (
//               <div className="flex gap-3">
//                 <Button
//                   type="submit"
//                   disabled={isSaving}
//                   startIcon={!isSaving && <Save size={20} />}
//                   sx={{
//                     backgroundColor: "#1348e8",
//                     color: "white",
//                     "&:hover": { backgroundColor: "#0d3a9d" },
//                     "&:disabled": { backgroundColor: "#9ca3af" },
//                     flex: 1
//                   }}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsEditing(false)
//                     setFile(null)
//                     setPreview(selectedNews?.featuredImage)
//                     // Reset form data
//                     if (selectedNews) {
//                       setFormData({
//                         title: selectedNews.title || "",
//                         slug: selectedNews.slug || "",
//                         content: selectedNews.content || "",
//                         excerpt: selectedNews.excerpt || "",
//                         featuredImage: selectedNews.featuredImage || "",
//                         category: selectedNews.category || "announcement",
//                         tags: selectedNews.tags || [],
//                         status: selectedNews.status || "draft",
//                         featured: selectedNews.featured || false,
//                         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//                         relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
//                         relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
//                       })
//                     }
//                   }}
//                   variant="outlined"
//                   disabled={isSaving}
//                   sx={{
//                     borderColor: "#6b7280",
//                     color: "#374151",
//                     "&:hover": {
//                       borderColor: "#374151",
//                       backgroundColor: "#f9fafb",
//                     },
//                     flex: 1
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             )}
//           </form>
//         </div>

//         {/* SIDEBAR - Takes full width on mobile, 30% on desktop */}
//         <div className="flex-1 lg:flex-[30%] max-w-lg min-w-0">
//           <div className="flex flex-col gap-6">
//             {/* METADATA */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Information
//               </h3>

//               {/* CATEGORY */}
//               <div className="mb-4">
//                 <p className="text-gray-500 font-medium text-sm mb-2">
//                   Category
//                 </p>
//                 {isEditing ? (
//                   <SelectField
//                     label="Category"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     options={categoryOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.category}
//                     label={formData.category.replace("_", " ")}
//                     className="capitalize"
//                   />
//                 )}
//               </div>

//               {/* STATUS */}
//               <div className="mb-4">
//                 <p className="text-gray-500 font-medium text-sm mb-2">
//                   Status
//                 </p>
//                 {isEditing ? (
//                   <SelectField
//                     label="Status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                     options={statusOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.status}
//                     label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
//                   />
//                 )}
//               </div>

//               {/* RELATED DISTRICT */}
//               {isEditing && (
//                 <div className="mb-4">
//                   <p className="text-gray-500 font-medium text-sm mb-2">
//                     Related District
//                   </p>
//                   <SelectField
//                     label="Related District"
//                     name="relatedDistrict"
//                     value={formData.relatedDistrict}
//                     onChange={handleInputChange}
//                     options={districtOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 </div>
//               )}

//               {/* RELATED PANCHAYAT */}
//               {isEditing && (
//                 <div className="mb-4">
//                   <p className="text-gray-500 font-medium text-sm mb-2">
//                     Related Panchayat
//                   </p>
//                   <SelectField
//                     label="Related Panchayat"
//                     name="relatedPanchayat"
//                     value={formData.relatedPanchayat}
//                     onChange={handleInputChange}
//                     options={panchayatOptions}
//                     disabled={!formData.relatedDistrict || isSaving}
//                     helperText={!formData.relatedDistrict ? "Select a district first" : ""}
//                     fullWidth
//                   />
//                 </div>
//               )}

//               {/* PUBLISH DATE */}
//               <div className="mb-4">
//                 <p className="text-gray-500 font-medium text-sm mb-2">
//                   Publish Date
//                 </p>
//                 {isEditing ? (
//                   <TextField
//                     type="date"
//                     name="publishDate"
//                     value={formData.publishDate}
//                     onChange={handleInputChange}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <p className="text-gray-900">
//                     {formData.publishDate ? new Date(formData.publishDate).toLocaleDateString() : "Not set"}
//                   </p>
//                 )}
//               </div>

//               {/* FEATURED */}
//               <div>
//                 {isEditing ? (
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="featured"
//                       checked={formData.featured}
//                       onChange={handleInputChange}
//                       disabled={isSaving}
//                       className="w-4 h-4 text-[#1348e8] rounded focus:ring-[#1348e8]"
//                     />
//                     <span className="text-sm font-medium">
//                       Featured Article
//                     </span>
//                   </label>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <p className="text-gray-500 font-medium text-sm">
//                       Featured:
//                     </p>
//                     <p className={`text-sm font-semibold ${formData.featured ? 'text-[#1348e8]' : 'text-gray-500'}`}>
//                       {formData.featured ? "⭐ Yes" : "No"}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </Card>

//             {/* TAGS */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Tags
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   value={formData.tags.join(", ")}
//                   onChange={handleTagsChange}
//                   placeholder="Comma-separated tags"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <div className="flex flex-wrap gap-2">
//                   {formData.tags.length > 0 ? (
//                     formData.tags.map((tag, idx) => (
//                       <StatusChip
//                         key={idx}
//                         label={tag}
//                         size="small"
//                         sx={{
//                           backgroundColor: "#1348e820",
//                           color: "#1348e8",
//                           border: "1px solid #1348e8",
//                           fontWeight: "600",
//                         }}
//                       />
//                     ))
//                   ) : (
//                     <p className="text-gray-500">
//                       No tags
//                     </p>
//                   )}
//                 </div>
//               )}
//             </Card>

//             {/* LOCATION INFO */}
//             {(selectedNews.relatedDistrict || selectedNews.relatedPanchayat) && !isEditing && (
//               <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//                 <h3 className="text-lg font-semibold mb-4">
//                   Location
//                 </h3>
//                 <div className="flex flex-col gap-4">
//                   {selectedNews.relatedDistrict && (
//                     <div>
//                       <p className="text-gray-500 font-medium text-sm">
//                         District
//                       </p>
//                       <p className="text-gray-900">
//                         {selectedNews.relatedDistrict?.name || 'N/A'}
//                       </p>
//                     </div>
//                   )}
//                   {selectedNews.relatedPanchayat && (
//                     <div>
//                       <p className="text-gray-500 font-medium text-sm">
//                         Panchayat
//                       </p>
//                       <p className="text-gray-900">
//                         {selectedNews.relatedPanchayat?.name || 'N/A'}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             )}

//             {/* ADDITIONAL INFO */}
//             <Card sx={{ p: 3, border: "1px solid", borderColor: "#1348e820" }}>
//               <h3 className="text-lg font-semibold mb-4">
//                 Additional Information
//               </h3>
//               <div className="flex flex-col gap-4">
//                 <div>
//                   <p className="text-gray-500 font-medium text-sm">
//                     Created
//                   </p>
//                   <p className="text-gray-900">
//                     {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString() : 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium text-sm">
//                     Last Updated
//                   </p>
//                   <p className="text-gray-900">
//                     {selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleDateString() : 'N/A'}
//                   </p>
//                 </div>
//                 {selectedNews.views !== undefined && (
//                   <div>
//                     <p className="text-gray-500 font-medium text-sm">
//                       Views
//                     </p>
//                     <p className="text-gray-900">
//                       {selectedNews.views}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }// 'use client'

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import { fetchNewsById, updateNews, clearError, clearSuccess } from "@/redux/slices/newsSlice"
// import { fetchDistricts } from '@/redux/slices/districtSlice'
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice'
// import { toast } from "react-toastify"
// import { 
//   ArrowLeft, 
//   Save, 
//   AlertCircle, 
//   Image as ImageIcon,
//   CloudUpload,
//   Link as LinkIcon 
// } from "lucide-react"
// import Link from "next/link"
// import {
//   Tabs,
//   Tab
// } from '@mui/material'

// // Import your custom components
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import StatusChip from "@/components/ui/StatusChip"
// import Loader from "@/components/ui/Loader"

// export default function NewsDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedNews, loading, error, success } = useSelector((state) => state.news)
//   const { districts } = useSelector((state) => state.district)
//   const { panchayats } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [uploadMethod, setUploadMethod] = useState('url') // 'file' or 'url'
//   const [file, setFile] = useState(null)
//   const [preview, setPreview] = useState(null)
//   const [filteredPanchayats, setFilteredPanchayats] = useState([])
  
//   const [formData, setFormData] = useState({
//     title: "",
//     slug: "",
//     content: "",
//     excerpt: "",
//     featuredImage: "",
//     category: "announcement",
//     tags: [],
//     status: "draft",
//     featured: false,
//     publishDate: "",
//     relatedDistrict: "",
//     relatedPanchayat: ""
//   })

//   // FETCH DISTRICTS AND PANCHAYATS
//   useEffect(() => {
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }))
//     dispatch(fetchPanchayats({ status: 'active', limit: 1000 }))
//   }, [dispatch])

//   // INITIAL LOAD
//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchNewsById(params.id))
//     }
//   }, [params.id, dispatch])

//   // POPULATE FORM WHEN NEWS LOADED
//   useEffect(() => {
//     if (selectedNews) {
//       setFormData({
//         title: selectedNews.title || "",
//         slug: selectedNews.slug || "",
//         content: selectedNews.content || "",
//         excerpt: selectedNews.excerpt || "",
//         featuredImage: selectedNews.featuredImage || "",
//         category: selectedNews.category || "announcement",
//         tags: selectedNews.tags || [],
//         status: selectedNews.status || "draft",
//         featured: selectedNews.featured || false,
//         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//         relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
//         relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
//       })
//       setPreview(selectedNews.featuredImage)
//     }
//   }, [selectedNews])

//   // FILTER PANCHAYATS BASED ON SELECTED DISTRICT
//   useEffect(() => {
//     if (formData.relatedDistrict) {
//       const filtered = panchayats.filter(
//         p => p.district?._id === formData.relatedDistrict || p.district === formData.relatedDistrict
//       )
//       setFilteredPanchayats(filtered)
      
//       // Reset panchayat if it doesn't belong to selected district
//       if (formData.relatedPanchayat) {
//         const isPanchayatValid = filtered.some(p => p._id === formData.relatedPanchayat)
//         if (!isPanchayatValid) {
//           setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
//         }
//       }
//     } else {
//       setFilteredPanchayats([])
//       setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
//     }
//   }, [formData.relatedDistrict, panchayats])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("News article updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setFile(null)
//       // Reload data
//       if (params.id) {
//         dispatch(fetchNewsById(params.id))
//       }
//     }
//     if (error) {
//       toast.error(error?.message || "Failed to update news")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, dispatch, params.id])

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0]
    
//     if (selectedFile) {
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp']
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, WebP)')
//         return
//       }

//       // Validate file size (50MB)
//       const maxSize = 95 * 1024 * 1024
//       if (selectedFile.size > maxSize) {
//         toast.error('File size exceeds 50MB limit')
//         return
//       }

//       setFile(selectedFile)
      
//       // Create preview
//       const reader = new FileReader()
//       reader.onload = (event) => setPreview(event.target.result)
//       reader.readAsDataURL(selectedFile)
//     }
//   }

//   const handleUrlChange = (url) => {
//     setFormData(prev => ({ ...prev, featuredImage: url }))
//     setPreview(url)
//   }

//   const removeFile = () => {
//     setFile(null)
//     setPreview(formData.featuredImage)
//     if (uploadMethod === 'url') {
//       setFormData(prev => ({ ...prev, featuredImage: selectedNews?.featuredImage || '' }))
//       setPreview(selectedNews?.featuredImage || null)
//     }
//   }

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   const handleTagsChange = (e) => {
//     const tags = e.target.value
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter((tag) => tag)
//     setFormData((prev) => ({
//       ...prev,
//       tags,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     // Validate image
//     if (uploadMethod === 'file' && !file && !formData.featuredImage) {
//       toast.error("Please provide a featured image")
//       return
//     } else if (uploadMethod === 'url' && !formData.featuredImage) {
//       toast.error("Please provide a featured image URL")
//       return
//     }

//     setIsSaving(true)
//     try {
//       // Create FormData for file upload or use JSON for URL
//       if (uploadMethod === 'file' && file) {
//         const submitData = new FormData()
        
//         // Append file and upload method
//         submitData.append('featuredImage', file)
//         submitData.append('uploadMethod', 'file')
        
//         // Append other form data
//         submitData.append('title', formData.title)
//         submitData.append('slug', formData.slug)
//         submitData.append('content', formData.content)
//         submitData.append('excerpt', formData.excerpt)
//         submitData.append('category', formData.category)
//         submitData.append('status', formData.status)
//         submitData.append('publishDate', formData.publishDate)
        
//         // Append optional fields if they exist
//         if (formData.relatedDistrict) {
//           submitData.append('relatedDistrict', formData.relatedDistrict)
//         }
//         if (formData.relatedPanchayat) {
//           submitData.append('relatedPanchayat', formData.relatedPanchayat)
//         }
        
//         // Append tags array
//         submitData.append('tags', formData.tags.join(','))

//         await dispatch(
//           updateNews({
//             id: params.id,
//             newsData: submitData,
//           })
//         ).unwrap()
//       } else {
//         // Use regular JSON for URL upload or no image change
//         const submitData = { ...formData }
//         if (!submitData.relatedDistrict) delete submitData.relatedDistrict
//         if (!submitData.relatedPanchayat) delete submitData.relatedPanchayat
        
//         await dispatch(
//           updateNews({
//             id: params.id,
//             newsData: submitData,
//           })
//         ).unwrap()
//       }
//     } catch (err) {
//       console.error("Update error:", err)
//     }
//   }

//   const categoryOptions = [
//     { value: "announcement", label: "Announcement" },
//     { value: "media_coverage", label: "Media Coverage" },
//     { value: "press_release", label: "Press Release" },
//     { value: "update", label: "Update" }
//   ]

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "published", label: "Published" }
//   ]

//   const districtOptions = [
//     { value: '', label: 'No District' },
//     ...districts.map(district => ({
//       value: district._id,
//       label: district.name
//     }))
//   ]

//   const panchayatOptions = [
//     { value: '', label: 'No Panchayat' },
//     ...filteredPanchayats.map(panchayat => ({
//       value: panchayat._id,
//       label: panchayat.name
//     }))
//   ]

//   if (loading) {
//     return (
//       <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading..."} />
//         </div>
//     )
//   }

//   if (!selectedNews) {
//     return (
//       <div className="text-center py-8">
//         <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
//         <h4 className="text-2xl font-bold text-gray-900 mb-4">
//           News Not Found
//         </h4>
//         <p className="text-gray-600 mb-4">
//           This news article could not be found.
//         </p>
//         <Link href="/admin/news" className="no-underline">
//           <Button
//             startIcon={<ArrowLeft size={16} />}
//             className="mt-2 font-bold"
//           >
//             Back to News
//           </Button>
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       {/* HEADER */}
//       {
//         isSaving && <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Saving..."} />
//         </div>
//       }
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-4">
//              <Link href="/admin/news" className="no-underline">
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
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//               {isEditing ? "Edit News Article" : "News Article Details"}
//             </h1>
//             <p className="text-gray-500 text-sm mt-1">
//               {selectedNews.author?.name && (
//                 <>
//                   Created by <span className="font-semibold">{selectedNews.author.name}</span>
//                 </>
//               )}
//             </p>
//           </div>
//         </div>

//         {!isEditing && (
//           <Button
//   onClick={() => setIsEditing(true)}
//   className="font-bold px-4 py-2"
//   sx={{
//     backgroundColor: "#1348e8",
//     color: "white",
//     "&:hover": {
//       backgroundColor: "#0d3a9d",
//     },
//   }}
// >
//   Edit Article
// </Button>

//         )}
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* FORM - Takes full width on mobile, 70% on desktop */}
//         <div className="flex-1 lg:flex-[70%] min-w-0">
//           <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//             {/* FEATURED IMAGE */}
//             <div className=" border rounded-xl border-blue-100">
//               {/* <h3 className="text-lg font-semibold mb-4">
//                 Featured Image
//               </h3> */}
              
//               {isEditing ? (
//                 <>
//                   {/* UPLOAD METHOD SELECTION */}
//                   <Tabs
//                     value={uploadMethod}
//                     onChange={(e, newValue) => {
//                       setUploadMethod(newValue)
//                       setFile(null)
//                       if (newValue === 'url') {
//                         setPreview(formData.featuredImage)
//                       }
//                     }}
//                     className="mb-6"
//                   >
//                     <Tab 
//                       icon={<LinkIcon size={18} />} 
//                       iconPosition="start" 
//                       label="Image URL" 
//                       value="url" 
//                     />
//                     <Tab 
//                       icon={<CloudUpload size={18} />} 
//                       iconPosition="start" 
//                       label="Upload New File" 
//                       value="file" 
//                     />
//                   </Tabs>

//                   {uploadMethod === 'url' ? (
//                     <>
//                       <TextField
//                         label="Image URL"
//                         name="featuredImage"
//                         value={formData.featuredImage}
//                         onChange={(e) => handleUrlChange(e.target.value)}
//                         placeholder="https://example.com/image.jpg"
//                         disabled={isSaving}
//                         fullWidth
//                       />
//                       {preview && formData.featuredImage && (
//                         <div className="mt-4 rounded-xl overflow-hidden">
//                           <img
//                             src={preview}
//                             alt="Preview"
//                             className="w-full h-64 object-cover"
//                             onError={(e) => {
//                               e.target.style.display = 'none'
//                               toast.error('Failed to load image from URL')
//                             }}
//                           />
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       {!file ? (
//                         <>
//                           {preview && (
//                             <div className="mb-4 rounded-xl overflow-hidden">
//                               <img
//                                 src={preview}
//                                 alt="Current"
//                                 className="w-full object-cover"
//                               />
//                               <p className="text-gray-500 text-sm mt-2">
//                                 Current image - Upload a new file to replace
//                               </p>
//                             </div>
//                           )}
//                           <div
//                             className="border-2 border-dashed border-blue-600 rounded-xl p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-700 transition-colors"
//                             onClick={() => document.getElementById('file-upload').click()}
//                           >
//                             <CloudUpload size={36} className="text-blue-600 mx-auto mb-3" />
//                             <h4 className="text-lg font-semibold text-gray-900 mb-2">
//                               Click to upload new image
//                             </h4>
//                             <p className="text-gray-500 text-sm">
//                               Supports JPG, PNG, WebP (Max 95MB)
//                             </p>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="border border-blue-100 rounded-xl p-4">
//                           <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center gap-3">
//                               <ImageIcon size={24} className="text-blue-600" />
//                               <div>
//                                 <p className="font-semibold text-gray-900">
//                                   {file.name}
//                                 </p>
//                                 <p className="text-gray-500 text-sm">
//                                   {(file.size / (1024 * 1024)).toFixed(2)} MB
//                                 </p>
//                               </div>
//                             </div>
//                             <Button
//                               type="button"
//                               onClick={removeFile}
//                               className="text-red-600 hover:bg-red-50"
//                             >
//                               Remove
//                             </Button>
//                           </div>
                          
//                           <img
//                             src={preview}
//                             alt="Preview"
//                             className=" w-full object-contain rounded-lg"
//                           />
//                         </div>
//                       )}
                      
//                       <input
//                         id="file-upload"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         className="hidden"
//                       />
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   {formData.featuredImage && (
//                     <div className="rounded-xl overflow-hidden">
//                       <img
//                         src={formData.featuredImage}
//                         alt={formData.title}
//                         className="w-full  object-cover"
//                       />
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* TITLE */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Title *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   placeholder="Article title"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {formData.title}
//                 </h2>
//               )}
//             </Card>

//             {/* SLUG */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Slug *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleInputChange}
//                   placeholder="article-slug"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <p className="text-gray-600">
//                   {formData.slug}
//                 </p>
//               )}
//             </Card>

//             {/* EXCERPT */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Excerpt *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="excerpt"
//                   value={formData.excerpt}
//                   onChange={handleInputChange}
//                   placeholder="Brief summary of the article"
//                   multiline
//                   rows={3}
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <p className="text-gray-600">
//                   {formData.excerpt}
//                 </p>
//               )}
//             </Card>

//             {/* CONTENT */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Content *
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   name="content"
//                   value={formData.content}
//                   onChange={handleInputChange}
//                   placeholder="Article content"
//                   multiline
//                   rows={12}
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <div className="whitespace-pre-wrap max-h-96 overflow-auto">
//                   <p className="text-gray-600">
//                     {formData.content}
//                   </p>
//                 </div>
//               )}
//             </Card>

//             {/* SAVE BUTTON */}
//             {isEditing && (
//               <div className="flex gap-3">
//                 <Button
//                   type="submit"
//                   disabled={isSaving}
//                   startIcon={!isSaving && <Save size={20} />}
//                   size="large"
//                   sx={{backgroundColor:'#1348e8'}}
//                   className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-white"
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsEditing(false)
//                     setFile(null)
//                     setPreview(selectedNews?.featuredImage)
//                     // Reset form data
//                     if (selectedNews) {
//                       setFormData({
//                         title: selectedNews.title || "",
//                         slug: selectedNews.slug || "",
//                         content: selectedNews.content || "",
//                         excerpt: selectedNews.excerpt || "",
//                         featuredImage: selectedNews.featuredImage || "",
//                         category: selectedNews.category || "announcement",
//                         tags: selectedNews.tags || [],
//                         status: selectedNews.status || "draft",
//                         featured: selectedNews.featured || false,
//                         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//                         relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
//                         relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
//                       })
//                     }
//                   }}
//                   variant="outlined"
//                   size="large"
//                   disabled={isSaving}
//                   className="flex-1 border-blue-600 text-blue-600 hover:border-blue-700 hover:bg-blue-50 font-bold"
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             )}
//           </form>
//         </div>

//         {/* SIDEBAR - Takes full width on mobile, 30% on desktop */}
//         <div className="flex-1 lg:flex-[30%] max-w-lg min-w-0">
//           <div className="flex flex-col gap-6">
//             {/* METADATA */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Information
//               </h3>

//               {/* CATEGORY */}
//               <div className="mb-4">
//                 <p className="text-gray-500 font-medium text-sm mb-2">
//                   Category
//                 </p>
//                 {isEditing ? (
//                   <SelectField
//                     label="Category"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     options={categoryOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.category}
//                     label={formData.category.replace("_", " ")}
//                     className="capitalize"
//                   />
//                 )}
//               </div>

//               {/* STATUS */}
//               <div className="mb-4">
//                 <p className="text-gray-500 font-medium text-sm mb-2">
//                   Status
//                 </p>
//                 {isEditing ? (
//                   <SelectField
//                     label="Status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                     options={statusOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.status}
//                     label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
//                   />
//                 )}
//               </div>

//               {/* RELATED DISTRICT */}
//               {isEditing && (
//                 <div className="mb-4">
//                   <p className="text-gray-500 font-medium text-sm mb-2">
//                     Related District
//                   </p>
//                   <SelectField
//                     label="Related District"
//                     name="relatedDistrict"
//                     value={formData.relatedDistrict}
//                     onChange={handleInputChange}
//                     options={districtOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 </div>
//               )}

//               {/* RELATED PANCHAYAT */}
//               {isEditing && (
//                 <div className="mb-4">
//                   <p className="text-gray-500 font-medium text-sm mb-2">
//                     Related Panchayat
//                   </p>
//                   <SelectField
//                     label="Related Panchayat"
//                     name="relatedPanchayat"
//                     value={formData.relatedPanchayat}
//                     onChange={handleInputChange}
//                     options={panchayatOptions}
//                     disabled={!formData.relatedDistrict || isSaving}
//                     helperText={!formData.relatedDistrict ? "Select a district first" : ""}
//                     fullWidth
//                   />
//                 </div>
//               )}

//               {/* PUBLISH DATE */}
//               <div className="mb-4">
//                 <p className="text-gray-500 font-medium text-sm mb-2">
//                   Publish Date
//                 </p>
//                 {isEditing ? (
//                   <TextField
//                     type="date"
//                     name="publishDate"
//                     value={formData.publishDate}
//                     onChange={handleInputChange}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <p className="text-gray-900">
//                     {formData.publishDate ? new Date(formData.publishDate).toLocaleDateString() : "Not set"}
//                   </p>
//                 )}
//               </div>

//               {/* FEATURED */}
//               <div>
//                 {isEditing ? (
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="featured"
//                       checked={formData.featured}
//                       onChange={handleInputChange}
//                       disabled={isSaving}
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                     />
//                     <span className="text-sm font-medium">
//                       Featured Article
//                     </span>
//                   </label>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <p className="text-gray-500 font-medium text-sm">
//                       Featured:
//                     </p>
//                     <p className={`text-sm font-semibold ${formData.featured ? 'text-blue-600' : 'text-gray-500'}`}>
//                       {formData.featured ? "⭐ Yes" : "No"}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </Card>

//             {/* TAGS */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Tags
//               </h3>
//               {isEditing ? (
//                 <TextField
//                   value={formData.tags.join(", ")}
//                   onChange={handleTagsChange}
//                   placeholder="Comma-separated tags"
//                   size="small"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <div className="flex flex-wrap gap-2">
//                   {formData.tags.length > 0 ? (
//                 formData.tags.map((tag, idx) => (
//   <StatusChip
//     key={idx}
//     label={tag}
//     size="small"
//     sx={{
//       backgroundColor: "#1348e820", // light blue tint
//       color: "#1348e8",
//       border: "1px solid #1348e8",
//       fontWeight: "600",
//     }}
//   />
// ))

//                   ) : (
//                     <p className="text-gray-500">
//                       No tags
//                     </p>
//                   )}
//                 </div>
//               )}
//             </Card>

//             {/* LOCATION INFO */}
//             {(selectedNews.relatedDistrict || selectedNews.relatedPanchayat) && !isEditing && (
//               <Card className="p-6 border border-blue-100">
//                 <h3 className="text-lg font-semibold mb-4">
//                   Location
//                 </h3>
//                 <div className="flex flex-col gap-4">
//                   {selectedNews.relatedDistrict && (
//                     <div>
//                       <p className="text-gray-500 font-medium text-sm">
//                         District
//                       </p>
//                       <p className="text-gray-900">
//                         {selectedNews.relatedDistrict?.name || 'N/A'}
//                       </p>
//                     </div>
//                   )}
//                   {selectedNews.relatedPanchayat && (
//                     <div>
//                       <p className="text-gray-500 font-medium text-sm">
//                         Panchayat
//                       </p>
//                       <p className="text-gray-900">
//                         {selectedNews.relatedPanchayat?.name || 'N/A'}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             )}

//             {/* ADDITIONAL INFO */}
//             <Card className="p-6 border border-blue-100">
//               <h3 className="text-lg font-semibold mb-4">
//                 Additional Information
//               </h3>
//               <div className="flex flex-col gap-4">
//                 <div>
//                   <p className="text-gray-500 font-medium text-sm">
//                     Created
//                   </p>
//                   <p className="text-gray-900">
//                     {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString() : 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 font-medium text-sm">
//                     Last Updated
//                   </p>
//                   <p className="text-gray-900">
//                     {selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleDateString() : 'N/A'}
//                   </p>
//                 </div>
//                 {selectedNews.views !== undefined && (
//                   <div>
//                     <p className="text-gray-500 font-medium text-sm">
//                       Views
//                     </p>
//                     <p className="text-gray-900">
//                       {selectedNews.views}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// 'use client'

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import { fetchNewsById, updateNews, clearError, clearSuccess } from "@/redux/slices/newsSlice"
// import { fetchDistricts } from '@/redux/slices/districtSlice'
// import { fetchPanchayats } from '@/redux/slices/panchayatSlice'
// import { toast } from "react-toastify"
// import { 
//   ArrowLeft, 
//   Save, 
//   AlertCircle, 
//   Image as ImageIcon,
//   CloudUpload,
//   Link as LinkIcon 
// } from "lucide-react"
// import Link from "next/link"
// import {
//   Box,
//   Typography,
//   Grid,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   FormControlLabel,
//   Stack,
//   Select,
//   Tabs,
//   Tab
// } from '@mui/material'
// import {
//   CalendarToday,
//   Visibility,
//   Schedule
// } from '@mui/icons-material'

// // Import your custom components
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import StatusChip from "@/components/ui/StatusChip"
// import Loader from "@/components/ui/Loader"

// export default function NewsDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedNews, loading, error, success } = useSelector((state) => state.news)
//   const { districts } = useSelector((state) => state.district)
//   const { panchayats } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [uploadMethod, setUploadMethod] = useState('url') // 'file' or 'url'
//   const [file, setFile] = useState(null)
//   const [preview, setPreview] = useState(null)
//   const [filteredPanchayats, setFilteredPanchayats] = useState([])
  
//   const [formData, setFormData] = useState({
//     title: "",
//     slug: "",
//     content: "",
//     excerpt: "",
//     featuredImage: "",
//     category: "announcement",
//     tags: [],
//     status: "draft",
//     featured: false,
//     publishDate: "",
//     relatedDistrict: "",
//     relatedPanchayat: ""
//   })

//   // FETCH DISTRICTS AND PANCHAYATS
//   useEffect(() => {
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }))
//     dispatch(fetchPanchayats({ status: 'active', limit: 1000 }))
//   }, [dispatch])

//   // INITIAL LOAD
//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchNewsById(params.id))
//     }
//   }, [params.id, dispatch])

//   // POPULATE FORM WHEN NEWS LOADED
//   useEffect(() => {
//     if (selectedNews) {
//       setFormData({
//         title: selectedNews.title || "",
//         slug: selectedNews.slug || "",
//         content: selectedNews.content || "",
//         excerpt: selectedNews.excerpt || "",
//         featuredImage: selectedNews.featuredImage || "",
//         category: selectedNews.category || "announcement",
//         tags: selectedNews.tags || [],
//         status: selectedNews.status || "draft",
//         featured: selectedNews.featured || false,
//         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//         relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
//         relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
//       })
//       setPreview(selectedNews.featuredImage)
//     }
//   }, [selectedNews])

//   // FILTER PANCHAYATS BASED ON SELECTED DISTRICT
//   useEffect(() => {
//     if (formData.relatedDistrict) {
//       const filtered = panchayats.filter(
//         p => p.district?._id === formData.relatedDistrict || p.district === formData.relatedDistrict
//       )
//       setFilteredPanchayats(filtered)
      
//       // Reset panchayat if it doesn't belong to selected district
//       if (formData.relatedPanchayat) {
//         const isPanchayatValid = filtered.some(p => p._id === formData.relatedPanchayat)
//         if (!isPanchayatValid) {
//           setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
//         }
//       }
//     } else {
//       setFilteredPanchayats([])
//       setFormData(prev => ({ ...prev, relatedPanchayat: '' }))
//     }
//   }, [formData.relatedDistrict, panchayats])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("News article updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setFile(null)
//       // Reload data
//       if (params.id) {
//         dispatch(fetchNewsById(params.id))
//       }
//     }
//     if (error) {
//       toast.error(error?.message || "Failed to update news")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, dispatch, params.id])

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0]
    
//     if (selectedFile) {
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/png', 'image/webp']
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, WebP)')
//         return
//       }

//       // Validate file size (50MB)
//       const maxSize = 95 * 1024 * 1024
//       if (selectedFile.size > maxSize) {
//         toast.error('File size exceeds 50MB limit')
//         return
//       }

//       setFile(selectedFile)
      
//       // Create preview
//       const reader = new FileReader()
//       reader.onload = (event) => setPreview(event.target.result)
//       reader.readAsDataURL(selectedFile)
//     }
//   }

//   const handleUrlChange = (url) => {
//     setFormData(prev => ({ ...prev, featuredImage: url }))
//     setPreview(url)
//   }

//   const removeFile = () => {
//     setFile(null)
//     setPreview(formData.featuredImage)
//     if (uploadMethod === 'url') {
//       setFormData(prev => ({ ...prev, featuredImage: selectedNews?.featuredImage || '' }))
//       setPreview(selectedNews?.featuredImage || null)
//     }
//   }

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   const handleTagsChange = (e) => {
//     const tags = e.target.value
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter((tag) => tag)
//     setFormData((prev) => ({
//       ...prev,
//       tags,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     // Validate image
//     if (uploadMethod === 'file' && !file && !formData.featuredImage) {
//       toast.error("Please provide a featured image")
//       return
//     } else if (uploadMethod === 'url' && !formData.featuredImage) {
//       toast.error("Please provide a featured image URL")
//       return
//     }

//     setIsSaving(true)
//     try {
//       // Create FormData for file upload or use JSON for URL
//       if (uploadMethod === 'file' && file) {
//         const submitData = new FormData()
        
//         // Append file and upload method
//         submitData.append('featuredImage', file)
//         submitData.append('uploadMethod', 'file')
        
//         // Append other form data
//         submitData.append('title', formData.title)
//         submitData.append('slug', formData.slug)
//         submitData.append('content', formData.content)
//         submitData.append('excerpt', formData.excerpt)
//         submitData.append('category', formData.category)
//         submitData.append('status', formData.status)
//         submitData.append('publishDate', formData.publishDate)
        
//         // Append optional fields if they exist
//         if (formData.relatedDistrict) {
//           submitData.append('relatedDistrict', formData.relatedDistrict)
//         }
//         if (formData.relatedPanchayat) {
//           submitData.append('relatedPanchayat', formData.relatedPanchayat)
//         }
        
//         // Append tags array
//         submitData.append('tags', formData.tags.join(','))

//         await dispatch(
//           updateNews({
//             id: params.id,
//             newsData: submitData,
//           })
//         ).unwrap()
//       } else {
//         // Use regular JSON for URL upload or no image change
//         const submitData = { ...formData }
//         if (!submitData.relatedDistrict) delete submitData.relatedDistrict
//         if (!submitData.relatedPanchayat) delete submitData.relatedPanchayat
        
//         await dispatch(
//           updateNews({
//             id: params.id,
//             newsData: submitData,
//           })
//         ).unwrap()
//       }
//     } catch (err) {
//       console.error("Update error:", err)
//     }
//   }

//   const categoryOptions = [
//     { value: "announcement", label: "Announcement" },
//     { value: "media_coverage", label: "Media Coverage" },
//     { value: "press_release", label: "Press Release" },
//     { value: "update", label: "Update" }
//   ]

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "published", label: "Published" }
//   ]

//   const districtOptions = [
//     { value: '', label: 'No District' },
//     ...districts.map(district => ({
//       value: district._id,
//       label: district.name
//     }))
//   ]

//   const panchayatOptions = [
//     { value: '', label: 'No Panchayat' },
//     ...filteredPanchayats.map(panchayat => ({
//       value: panchayat._id,
//       label: panchayat.name
//     }))
//   ]

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
//         <Loader />
//       </Box>
//     )
//   }

//   if (!selectedNews) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <AlertCircle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
//         <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
//           News Not Found
//         </Typography>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           This news article could not be found.
//         </Typography>
//         <Link href="/admin/news" style={{ textDecoration: 'none' }}>
//           <Button
//             startIcon={<ArrowLeft size={16} />}
//             sx={{ mt: 2, fontWeight: 'bold' }}
//           >
//             Back to News
//           </Button>
//         </Link>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/news" style={{ textDecoration: 'none' }}>
//             <Button variant="outlined" sx={{ 
//               minWidth: 'auto', 
//               p: 1.5,
//               borderColor: '#144ae9',
//               color: '#144ae9',
//               '&:hover': {
//                 borderColor: '#0d3ec7',
//                 backgroundColor: '#144ae910'
//               }
//             }}>
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {isEditing ? "Edit News Article" : "News Article Details"}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {selectedNews.author?.name && (
//                 <>
//                   Created by <Typography component="span" fontWeight={600}>{selectedNews.author.name}</Typography>
//                 </>
//               )}
//             </Typography>
//           </Box>
//         </Box>

//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             sx={{ 
//               fontWeight: 'bold', 
//               backgroundColor: '#144ae9',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Edit Article
//           </Button>
//         )}
//       </Box>

//       {/* MAIN CONTENT */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
//         {/* FORM - Takes full width on mobile, 70% on desktop */}
//         <Box sx={{
//           flex: { xs: '1 1 auto', lg: '1 1 70%' },
//           minWidth: 0
//         }}>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//             {/* FEATURED IMAGE */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
//                 Featured Image
//               </Typography>
              
//               {isEditing ? (
//                 <>
//                   {/* UPLOAD METHOD SELECTION */}
//                   <Tabs
//                     value={uploadMethod}
//                     onChange={(e, newValue) => {
//                       setUploadMethod(newValue)
//                       setFile(null)
//                       if (newValue === 'url') {
//                         setPreview(formData.featuredImage)
//                       }
//                     }}
//                     sx={{
//                       mb: 3,
//                       '& .MuiTab-root': {
//                         textTransform: 'none',
//                         fontWeight: 600,
//                         fontSize: '0.9rem',
//                       }
//                     }}
//                   >
//                     <Tab 
//                       icon={<LinkIcon size={18} />} 
//                       iconPosition="start" 
//                       label="Image URL" 
//                       value="url" 
//                     />
//                     <Tab 
//                       icon={<CloudUpload size={18} />} 
//                       iconPosition="start" 
//                       label="Upload New File" 
//                       value="file" 
//                     />
//                   </Tabs>

//                   {uploadMethod === 'url' ? (
//                     <>
//                       <TextField
//                         label="Image URL"
//                         name="featuredImage"
//                         value={formData.featuredImage}
//                         onChange={(e) => handleUrlChange(e.target.value)}
//                         placeholder="https://example.com/image.jpg"
//                         disabled={isSaving}
//                         fullWidth
//                       />
//                       {preview && formData.featuredImage && (
//                         <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
//                           <img
//                             src={preview}
//                             alt="Preview"
//                             style={{ width: '100%', height: 256, objectFit: 'cover' }}
//                             onError={(e) => {
//                               e.target.style.display = 'none'
//                               toast.error('Failed to load image from URL')
//                             }}
//                           />
//                         </Box>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       {!file ? (
//                         <>
//                           {preview && (
//                             <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
//                               <img
//                                 src={preview}
//                                 alt="Current"
//                                 style={{ width: '100%', height: 256, objectFit: 'cover' }}
//                               />
//                               <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                                 Current image - Upload a new file to replace
//                               </Typography>
//                             </Box>
//                           )}
//                           <Box
//                             sx={{
//                               border: '2px dashed',
//                               borderColor: '#144ae9',
//                               borderRadius: 2,
//                               p: 4,
//                               textAlign: 'center',
//                               cursor: 'pointer',
//                               backgroundColor: '#144ae905',
//                               '&:hover': {
//                                 backgroundColor: '#144ae910',
//                                 borderColor: '#0d3ec7'
//                               }
//                             }}
//                             onClick={() => document.getElementById('file-upload').click()}
//                           >
//                             <CloudUpload size={36} color="#144ae9" style={{ marginBottom: 12 }} />
//                             <Typography variant="h6" color="text.primary" gutterBottom>
//                               Click to upload new image
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               Supports JPG, PNG, WebP (Max 95MB)
//                             </Typography>
//                           </Box>
//                         </>
//                       ) : (
//                         <Box sx={{ border: '1px solid', borderColor: '#144ae920', borderRadius: 2, p: 3 }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                               <ImageIcon size={24} color="#144ae9" />
//                               <Box>
//                                 <Typography variant="body1" fontWeight={600}>
//                                   {file.name}
//                                 </Typography>
//                                 <Typography variant="body2" color="text.secondary">
//                                   {(file.size / (1024 * 1024)).toFixed(2)} MB
//                                 </Typography>
//                               </Box>
//                             </Box>
//                             <Button
//                               type="button"
//                               onClick={removeFile}
//                               sx={{
//                                 color: '#d32f2f',
//                                 '&:hover': {
//                                   backgroundColor: '#d32f2f10'
//                                 }
//                               }}
//                             >
//                               Remove
//                             </Button>
//                           </Box>
                          
//                           <img
//                             src={preview}
//                             alt="Preview"
//                             style={{ 
//                               maxHeight: '256px', 
//                               width: '100%', 
//                               objectFit: 'contain',
//                               borderRadius: '8px'
//                             }}
//                           />
//                         </Box>
//                       )}
                      
//                       <input
//                         id="file-upload"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         style={{ display: 'none' }}
//                       />
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   {formData.featuredImage && (
//                     <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
//                       <img
//                         src={formData.featuredImage}
//                         alt={formData.title}
//                         style={{ width: '100%', height: 256, objectFit: 'cover' }}
//                       />
//                     </Box>
//                   )}
//                 </>
//               )}
//             </Card>

//             {/* TITLE */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Title *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   placeholder="Article title"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <Typography variant="h5" fontWeight={600} color="text.primary">
//                   {formData.title}
//                 </Typography>
//               )}
//             </Card>

//             {/* SLUG */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Slug *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleInputChange}
//                   placeholder="article-slug"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   {formData.slug}
//                 </Typography>
//               )}
//             </Card>

//             {/* EXCERPT */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Excerpt *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="excerpt"
//                   value={formData.excerpt}
//                   onChange={handleInputChange}
//                   placeholder="Brief summary of the article"
//                   multiline
//                   rows={3}
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   {formData.excerpt}
//                 </Typography>
//               )}
//             </Card>

//             {/* CONTENT */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Content *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="content"
//                   value={formData.content}
//                   onChange={handleInputChange}
//                   placeholder="Article content"
//                   multiline
//                   rows={12}
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <Box sx={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     {formData.content}
//                   </Typography>
//                 </Box>
//               )}
//             </Card>

//             {/* SAVE BUTTON */}
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
//                     fontWeight: 'bold',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setIsEditing(false)
//                     setFile(null)
//                     setPreview(selectedNews?.featuredImage)
//                     // Reset form data
//                     if (selectedNews) {
//                       setFormData({
//                         title: selectedNews.title || "",
//                         slug: selectedNews.slug || "",
//                         content: selectedNews.content || "",
//                         excerpt: selectedNews.excerpt || "",
//                         featuredImage: selectedNews.featuredImage || "",
//                         category: selectedNews.category || "announcement",
//                         tags: selectedNews.tags || [],
//                         status: selectedNews.status || "draft",
//                         featured: selectedNews.featured || false,
//                         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//                         relatedDistrict: selectedNews.relatedDistrict?._id || selectedNews.relatedDistrict || "",
//                         relatedPanchayat: selectedNews.relatedPanchayat?._id || selectedNews.relatedPanchayat || ""
//                       })
//                     }
//                   }}
//                   variant="outlined"
//                   size="large"
//                   disabled={isSaving}
//                   sx={{ 
//                     flex: 1,
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     fontWeight: 'bold',
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

//         {/* SIDEBAR - Takes full width on mobile, 30% on desktop */}
//         <Box sx={{
//           flex: { xs: '1 1 auto', lg: '1 1 30%' },
//           maxWidth: { lg: 400 },
//           minWidth: 0
//         }}>
//           <Stack spacing={3}>
//             {/* METADATA */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Information
//               </Typography>

//               {/* CATEGORY */}
//               <Box sx={{ mb: 3 }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Category
//                 </Typography>
//                 {isEditing ? (
//                   <SelectField
//                     label="Category"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     options={categoryOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.category}
//                     label={formData.category.replace("_", " ")}
//                     sx={{ textTransform: 'capitalize' }}
//                   />
//                 )}
//               </Box>

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
//                       onChange={handleInputChange}
//                       label="Status"
//                       disabled={isSaving}
//                     >
//                       <MenuItem value="draft">Draft</MenuItem>
//                       <MenuItem value="published">Published</MenuItem>
//                     </Select>
//                   </FormControl>
//                 ) : (
//                   <StatusChip
//                     status={formData.status}
//                     label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
//                   />
//                 )}
//               </Box>

//               {/* RELATED DISTRICT */}
//               {isEditing && (
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                     Related District
//                   </Typography>
//                   <SelectField
//                     label="Related District"
//                     name="relatedDistrict"
//                     value={formData.relatedDistrict}
//                     onChange={handleInputChange}
//                     options={districtOptions}
//                     disabled={isSaving}
//                     fullWidth
//                   />
//                 </Box>
//               )}

//               {/* RELATED PANCHAYAT */}
//               {isEditing && (
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                     Related Panchayat
//                   </Typography>
//                   <SelectField
//                     label="Related Panchayat"
//                     name="relatedPanchayat"
//                     value={formData.relatedPanchayat}
//                     onChange={handleInputChange}
//                     options={panchayatOptions}
//                     disabled={!formData.relatedDistrict || isSaving}
//                     helperText={!formData.relatedDistrict ? "Select a district first" : ""}
//                     fullWidth
//                   />
//                 </Box>
//               )}

//               {/* PUBLISH DATE */}
//               <Box sx={{ mb: 3 }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Publish Date
//                 </Typography>
//                 {isEditing ? (
//                   <TextField
//                     type="date"
//                     name="publishDate"
//                     value={formData.publishDate}
//                     onChange={handleInputChange}
//                     disabled={isSaving}
//                     InputLabelProps={{ shrink: true }}
//                     fullWidth
//                   />
//                 ) : (
//                   <Typography variant="body2" color="text.primary">
//                     {formData.publishDate ? new Date(formData.publishDate).toLocaleDateString() : "Not set"}
//                   </Typography>
//                 )}
//               </Box>

//               {/* FEATURED */}
//               <Box>
//                 {isEditing ? (
//                   <FormControlLabel
//                     control={
//                       <input
//                         type="checkbox"
//                         name="featured"
//                         checked={formData.featured}
//                         onChange={handleInputChange}
//                         disabled={isSaving}
//                         style={{
//                           width: 18,
//                           height: 18,
//                           accentColor: '#144ae9'
//                         }}
//                       />
//                     }
//                     label={
//                       <Typography variant="body2" fontWeight={500}>
//                         Featured Article
//                       </Typography>
//                     }
//                   />
//                 ) : (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                       Featured:
//                     </Typography>
//                     <Typography variant="body2" color={formData.featured ? '#144ae9' : 'text.secondary'} fontWeight={600}>
//                       {formData.featured ? "⭐ Yes" : "No"}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </Card>

//             {/* TAGS */}
//             <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Tags
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   value={formData.tags.join(", ")}
//                   onChange={handleTagsChange}
//                   placeholder="Comma-separated tags"
//                   size="small"
//                   disabled={isSaving}
//                   fullWidth
//                 />
//               ) : (
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                   {formData.tags.length > 0 ? (
//                     formData.tags.map((tag, idx) => (
//                       <StatusChip
//                         key={idx}
//                         status="active"
//                         label={tag}
//                         size="small"
//                       />
//                     ))
//                   ) : (
//                     <Typography variant="body2" color="text.secondary">
//                       No tags
//                     </Typography>
//                   )}
//                 </Box>
//               )}
//             </Card>

//             {/* LOCATION INFO */}
//             {(selectedNews.relatedDistrict || selectedNews.relatedPanchayat) && !isEditing && (
//               <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
//                 <Typography variant="h6" fontWeight={600} gutterBottom>
//                   Location
//                 </Typography>
//                 <Stack spacing={2}>
//                   {selectedNews.relatedDistrict && (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                         District
//                       </Typography>
//                       <Typography variant="body2" color="text.primary">
//                         {selectedNews.relatedDistrict?.name || 'N/A'}
//                       </Typography>
//                     </Box>
//                   )}
//                   {selectedNews.relatedPanchayat && (
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                         Panchayat
//                       </Typography>
//                       <Typography variant="body2" color="text.primary">
//                         {selectedNews.relatedPanchayat?.name || 'N/A'}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Stack>
//               </Card>
//             )}

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
//                     {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString() : 'N/A'}
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Last Updated
//                   </Typography>
//                   <Typography variant="body2" color="text.primary">
//                     {selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleDateString() : 'N/A'}
//                   </Typography>
//                 </Box>
//                 {selectedNews.views !== undefined && (
//                   <Box>
//                     <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                       Views
//                     </Typography>
//                     <Typography variant="body2" color="text.primary">
//                       {selectedNews.views}
//                     </Typography>
//                   </Box>
//                 )}
//               </Stack>
//             </Card>
//           </Stack>
//         </Box>
//       </Box>
//     </Box>
//   )
// }


// 'use client'

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import { fetchNewsById, updateNews, clearError, clearSuccess } from "@/redux/slices/newsSlice"
// import { toast } from "react-toastify"
// import { ArrowLeft, Save, AlertCircle } from "lucide-react"
// import Link from "next/link"
// import {
//   Box,
//   Typography,
//   Grid,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   FormControlLabel,
//   Stack,
//   Select
// } from '@mui/material'
// import {
//   CalendarToday,
//   Visibility,
//   Schedule
// } from '@mui/icons-material'

// // Import your custom components
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import StatusChip from "@/components/ui/StatusChip"
// import Loader from "@/components/ui/Loader"

// export default function NewsDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedNews, loading, error, success } = useSelector((state) => state.news)

//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [formData, setFormData] = useState({
//     title: "",
//     slug: "",
//     content: "",
//     excerpt: "",
//     featuredImage: "",
//     category: "announcement",
//     tags: [],
//     status: "draft",
//     featured: false,
//     publishDate: "",
//   })

//   // INITIAL LOAD
//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchNewsById(params.id))
//     }
//   }, [params.id, dispatch])

//   // POPULATE FORM WHEN NEWS LOADED
//   useEffect(() => {
//     if (selectedNews) {
//       setFormData({
//         title: selectedNews.title || "",
//         slug: selectedNews.slug || "",
//         content: selectedNews.content || "",
//         excerpt: selectedNews.excerpt || "",
//         featuredImage: selectedNews.featuredImage || "",
//         category: selectedNews.category || "announcement",
//         tags: selectedNews.tags || [],
//         status: selectedNews.status || "draft",
//         featured: selectedNews.featured || false,
//         publishDate: selectedNews.publishDate ? selectedNews.publishDate.split("T")[0] : "",
//       })
//     }
//   }, [selectedNews])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("News article updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       // Reload data
//       if (params.id) {
//         dispatch(fetchNewsById(params.id))
//       }
//     }
//     if (error) {
//       toast.error(error?.message || "Failed to update news")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, dispatch, params.id])

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }))
//   }

//   const handleTagsChange = (e) => {
//     const tags = e.target.value
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter((tag) => tag)
//     setFormData((prev) => ({
//       ...prev,
//       tags,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     setIsSaving(true)
//     try {
//       await dispatch(
//         updateNews({
//           id: params.id,
//           newsData: formData,
//         }),
//       ).unwrap()
//     } catch (err) {
//       console.error("[v0] Update error:", err)
//     }
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'published': return <Visibility sx={{ fontSize: 16 }} />
//       case 'draft': return <CalendarToday sx={{ fontSize: 16 }} />
//       // case 'scheduled': return <Schedule sx={{ fontSize: 16 }} />
//       default: return <CalendarToday sx={{ fontSize: 16 }} />
//     }
//   }

//   const categoryOptions = [
//     { value: "announcement", label: "Announcement" },
//     { value: "media_coverage", label: "Media Coverage" },
//     { value: "press_release", label: "Press Release" },
//     { value: "update", label: "Update" }
//   ]

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "published", label: "Published" },
//     // { value: "scheduled", label: "Scheduled" }
//   ]

//   if (loading) {
//     return (
//       <Loader />
//     )
//   }

//   if (!selectedNews) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <AlertCircle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
//         <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
//           News Not Found
//         </Typography>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           This news article could not be found.
//         </Typography>
//         <Link href="/admin/news" style={{ textDecoration: 'none' }}>
//           <Button
//             startIcon={<ArrowLeft size={16} />}
//             sx={{ mt: 2, fontWeight: 'bold' }}
//           >
//             Back to News
//           </Button>
//         </Link>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/news" style={{ textDecoration: 'none', }}>
//             <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5 }}>
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="144ae9">
//               {isEditing ? "Edit News Article" : "News Article Details"}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {selectedNews.author?.name && (
//                 <>
//                   Created by <Typography component="span" fontWeight={600}>{selectedNews.author.name}</Typography>
//                 </>
//               )}
//             </Typography>
//           </Box>
//         </Box>

//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             sx={{ fontWeight: 'bold', backgroundColor: '#144ae9' }}
//           >
//             Edit Article
//           </Button>
//         )}
//       </Box>

//       {/* MAIN CONTENT */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
//         {/* FORM - Takes full width on mobile, 70% on desktop */}
//         <Box sx={{
//           flex: { xs: '1 1 auto', lg: '1 1 70%' },
//           minWidth: 0
//         }}>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//             {/* FEATURED IMAGE */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Featured Image
//               </Typography>
//               {formData.featuredImage && (
//                 <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
//                   <img
//                     src={formData.featuredImage || "/placeholder.svg"}
//                     alt={formData.title}
//                     style={{ width: '100%', height: 256, objectFit: 'cover' }}
//                   />
//                 </Box>
//               )}
//               {isEditing ? (
//                 <TextField
//                   label="Image URL"
//                   name="featuredImage"
//                   value={formData.featuredImage}
//                   onChange={handleInputChange}
//                   placeholder="Enter image URL"
//                   disabled={isSaving}
//                 />
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   {formData.featuredImage || "No image"}
//                 </Typography>
//               )}
//             </Card>

//             {/* TITLE */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Title *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   placeholder="Article title"
//                   disabled={isSaving}
//                 />
//               ) : (
//                 <Typography variant="h5" fontWeight={600} color="text.primary">
//                   {formData.title}
//                 </Typography>
//               )}
//             </Card>

//             {/* SLUG */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Slug *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleInputChange}
//                   placeholder="article-slug"
//                   disabled={isSaving}
//                 />
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   {formData.slug}
//                 </Typography>
//               )}
//             </Card>

//             {/* EXCERPT */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Excerpt *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="excerpt"
//                   value={formData.excerpt}
//                   onChange={handleInputChange}
//                   placeholder="Brief summary of the article"
//                   multiline
//                   rows={3}
//                   disabled={isSaving}
//                 />
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   {formData.excerpt}
//                 </Typography>
//               )}
//             </Card>

//             {/* CONTENT */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Content *
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   name="content"
//                   value={formData.content}
//                   onChange={handleInputChange}
//                   placeholder="Article content"
//                   multiline
//                   rows={12}
//                   disabled={isSaving}
//                 />
//               ) : (
//                 <Box sx={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     {formData.content}
//                   </Typography>
//                 </Box>
//               )}
//             </Card>

//             {/* SAVE BUTTON */}
//             {isEditing && (
//               <Box sx={{ display: 'flex', gap: 2 }}>
//                 <Button
//                   type="submit"
//                   disabled={isSaving}
//                   startIcon={isSaving ? <Loader /> : <Save size={20} />}
//                   size="large"
//                   sx={{ flex: 1, backgroundColor: '#144ae9' }}
//                 >
//                   {isSaving ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() => setIsEditing(false)}
//                   variant="outlined"
//                   size="large"
//                   disabled={isSaving}
//                   sx={{ flex: 1 }}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         </Box>

//         {/* SIDEBAR - Takes full width on mobile, 30% on desktop */}
//         <Box sx={{
//           flex: { xs: '1 1 auto', lg: '1 1 30%' },
//           maxWidth: { lg: 400 },
//           minWidth: 0
//         }}>
//           <Stack spacing={3}>
//             {/* METADATA */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Information
//               </Typography>

//               {/* CATEGORY */}
//               <Box sx={{ mb: 3 }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Category
//                 </Typography>
//                 {isEditing ? (
//                   <SelectField
//                     label="Category"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleInputChange}
//                     options={categoryOptions}
//                     disabled={isSaving}
//                   />
//                 ) : (
//                   <StatusChip
//                     status={formData.category}
//                     label={formData.category.replace("_", " ")}
//                     sx={{ textTransform: 'capitalize' }}
//                   />
//                 )}
//               </Box>

//               {/* STATUS */}
//               {/* <Box sx={{ mb: 3 }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 {isEditing ? (
//                   <SelectField
//                     label="Status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                     options={statusOptions}
//                     disabled={isSaving}
//                   />
//                 ) : (
//                   <StatusChip 
//                     status={formData.status} 
//                     label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
//                   />
//                 )}
//               </Box> */}
//               {/* STATUS - FIXED VERSION */}
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
//                       onChange={handleInputChange}
//                       label="Status"
//                       disabled={isSaving}
//                     >
//                       <MenuItem value="draft">Draft</MenuItem>
//                       <MenuItem value="published">Published</MenuItem>
//                     </Select>
//                   </FormControl>
//                 ) : (
//                   <StatusChip
//                     status={formData.status}
//                     label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
//                   />
//                 )}
//               </Box>
//               {/* PUBLISH DATE */}
//               <Box sx={{ mb: 3 }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Publish Date
//                 </Typography>
//                 {isEditing ? (
//                   <TextField
//                     type="date"
//                     name="publishDate"
//                     value={formData.publishDate}
//                     onChange={handleInputChange}
//                     disabled={isSaving}
//                     InputLabelProps={{ shrink: true }}
//                   />
//                 ) : (
//                   <Typography variant="body2" color="text.primary">
//                     {formData.publishDate ? new Date(formData.publishDate).toLocaleDateString() : "Not set"}
//                   </Typography>
//                 )}
//               </Box>

//               {/* FEATURED */}
//               <Box>
//                 {isEditing ? (
//                   <FormControlLabel
//                     control={
//                       <input
//                         type="checkbox"
//                         name="featured"
//                         checked={formData.featured}
//                         onChange={handleInputChange}
//                         disabled={isSaving}
//                         style={{
//                           width: 18,
//                           height: 18,
//                           accentColor: '#144ae9'
//                         }}
//                       />
//                     }
//                     label={
//                       <Typography variant="body2" fontWeight={500}>
//                         Featured Article
//                       </Typography>
//                     }
//                   />
//                 ) : (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                       Featured:
//                     </Typography>
//                     <Typography variant="body2" color={formData.featured ? '#144ae9' : 'text.secondary'} fontWeight={600}>
//                       {formData.featured ? "⭐ Yes" : "No"}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </Card>

//             {/* TAGS */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Tags
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   value={formData.tags.join(", ")}
//                   onChange={handleTagsChange}
//                   placeholder="Comma-separated tags"
//                   size="small"
//                   disabled={isSaving}
//                 />
//               ) : (
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                   {formData.tags.length > 0 ? (
//                     formData.tags.map((tag) => (
//                       <StatusChip
//                         key={tag}
//                         status="active"
//                         label={tag}
//                         size="small"
//                       />
//                     ))
//                   ) : (
//                     <Typography variant="body2" color="text.secondary">
//                       No tags
//                     </Typography>
//                   )}
//                 </Box>
//               )}
//             </Card>

//             {/* ADDITIONAL INFO */}
//             <Card>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Additional Information
//               </Typography>
//               <Stack spacing={2}>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Created
//                   </Typography>
//                   <Typography variant="body2" color="text.primary">
//                     {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString() : 'N/A'}
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Last Updated
//                   </Typography>
//                   <Typography variant="body2" color="text.primary">
//                     {selectedNews.updatedAt ? new Date(selectedNews.updatedAt).toLocaleDateString() : 'N/A'}
//                   </Typography>
//                 </Box>
//                 {selectedNews.views !== undefined && (
//                   <Box>
//                     <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                       Views
//                     </Typography>
//                     <Typography variant="body2" color="text.primary">
//                       {selectedNews.views}
//                     </Typography>
//                   </Box>
//                 )}
//               </Stack>
//             </Card>
//           </Stack>
//         </Box>
//       </Box>
//     </Box>
//   )
// }