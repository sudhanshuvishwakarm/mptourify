"use client"

import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { fetchDistricts } from "@/redux/slices/districtSlice"
import { fetchPanchayatsByDistrict } from "@/redux/slices/panchayatSlice"
import {
  fetchMediaById,
  updateMedia,
  approveMedia,
  rejectMedia,
  updateMediaStatus,
  clearError,
  clearSuccess,
} from "@/redux/slices/mediaSlice.js"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Tag,
  Image as ImageIcon,
  Video,
  FileType,
  Shield
} from "lucide-react"
import { toast } from "react-toastify"
import Link from "next/link"
import Button from "@/components/ui/Button"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import Card from "@/components/ui/Card"
import Loader from "@/components/ui/Loader"

const CATEGORIES = [
  { value: "heritage", label: "Heritage" },
  { value: "natural", label: "Natural" },
  { value: "cultural", label: "Cultural" },
  { value: "event", label: "Event" },
  { value: "festival", label: "Festival" }
]

const STATUSES = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" }
]

export default function MediaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { selectedMedia: media, loading, error, success } = useSelector((state) => state.media)
  const { districts } = useSelector((state) => state.district)
  const { panchayats } = useSelector((state) => state.panchayat)

  const [edit, setEdit] = useState(false)
  const [formData, setFormData] = useState({})
  const [tempTag, setTempTag] = useState("")
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchMediaById(params.id))
    }
    dispatch(fetchDistricts())
  }, [dispatch, params.id])

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || "",
        description: media.description || "",
        category: media.category || "",
        photographer: media.photographer || "",
        tags: media.tags || [],
        captureDate: media.captureDate ? new Date(media.captureDate).toISOString().split('T')[0] : "",
        district: media.district?._id || "",
        gramPanchayat: media.gramPanchayat?._id || "",
        status: media.status || "pending"
      })
      
      if (media.district?._id) {
        dispatch(fetchPanchayatsByDistrict(media.district._id))
      }
    }
  }, [media, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error?.message || "An error occurred")
      dispatch(clearError())
      setSaving(false)
    }
  }, [error, dispatch])

  useEffect(() => {
    if (success) {
      toast.success("Action completed successfully")
      dispatch(clearSuccess())
      setEdit(false)
      setSaving(false)
      if (params.id) {
        dispatch(fetchMediaById(params.id))
      }
    }
  }, [success, dispatch, params.id])

  const handleDistrictChange = (districtId) => {
    setFormData(prev => ({
      ...prev,
      district: districtId,
      gramPanchayat: ""
    }))
    
    if (districtId) {
      dispatch(fetchPanchayatsByDistrict(districtId))
    }
  }

  const handleAddTag = () => {
    if (!tempTag.trim()) return
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tempTag.trim()]
    }))
    setTempTag("")
  }

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await dispatch(updateMedia({ id: params.id, mediaData: formData })).unwrap()
    } catch (error) {
      console.error('Update failed:', error)
    }
  }, [formData, params.id, dispatch])

  const handleApprove = useCallback(async () => {
    try {
      await dispatch(approveMedia(params.id)).unwrap()
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }, [params.id, dispatch])

  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    try {
      await dispatch(rejectMedia({ id: params.id, reason: rejectReason })).unwrap()
      setOpenRejectDialog(false)
      setRejectReason("")
    } catch (error) {
      console.error('Rejection failed:', error)
    }
  }, [params.id, rejectReason, dispatch])

  const handleCancel = () => {
    setEdit(false)
    if (media) {
      setFormData({
        title: media.title || "",
        description: media.description || "",
        category: media.category || "",
        photographer: media.photographer || "",
        tags: media.tags || [],
        captureDate: media.captureDate ? new Date(media.captureDate).toISOString().split('T')[0] : "",
        district: media.district?._id || "",
        gramPanchayat: media.gramPanchayat?._id || "",
        status: media.status || "pending"
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={20} className="text-green-500" />
      case "rejected":
        return <XCircle size={20} className="text-red-500" />
      default:
        return <Clock size={20} className="text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return { backgroundColor: '#10b981', color: 'white' }
      case "rejected":
        return { backgroundColor: '#ef4444', color: 'white' }
      case "pending":
        return { backgroundColor: '#f59e0b', color: 'white' }
      default:
        return { backgroundColor: '#6b7280', color: 'white' }
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "heritage":
        return { backgroundColor: '#8b5cf6', color: 'white' }
      case "natural":
        return { backgroundColor: '#10b981', color: 'white' }
      case "cultural":
        return { backgroundColor: '#f59e0b', color: 'white' }
      case "event":
        return { backgroundColor: '#ef4444', color: 'white' }
      case "festival":
        return { backgroundColor: '#3b82f6', color: 'white' }
      default:
        return { backgroundColor: '#6b7280', color: 'white' }
    }
  }

  if (loading && !media) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Loader message={"Loading..."} />
      </div>
    )
  }

  if (!media) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Card sx={{ p: 6, textAlign: 'center', border: '1px solid #144ae920' }}>
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <h6 className="text-gray-500 text-xl font-semibold mb-4">Media not found</h6>
          <Link href="/admin/media" className="no-underline">
            <Button sx={{ backgroundColor: '#144ae9', color: 'white', '&:hover': { backgroundColor: '#0d3ec7' } }}>
              Back to Media
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* LOADER */}
      {saving && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Saving..."} />
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/media" className="no-underline">
            <Button
              variant="outlined"
              sx={{
                borderColor: "#144ae9",
                color: "#144ae9",
                "&:hover": {
                  borderColor: "#0d3ec7",
                  backgroundColor: "#144ae910",
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
              {media.title}
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              {edit ? 'Edit media details' : 'View media details'}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {media.status === "pending" && !edit && (
            <>
              <Button
                starticon={<CheckCircle size={16} />}
                onClick={handleApprove}
                sx={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  '&:hover': { backgroundColor: '#059669' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  flex: { xs: 1, sm: 'unset' }
                }}
              >
                Approve
              </Button>
              <Button
                starticon={<XCircle size={16} />}
                onClick={() => setOpenRejectDialog(true)}
                sx={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  '&:hover': { backgroundColor: '#dc2626' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  flex: { xs: 1, sm: 'unset' }
                }}
              >
                Reject
              </Button>
            </>
          )}
          
          {!edit ? (
            <Button
              starticon={<Edit size={16} />}
              onClick={() => setEdit(true)}
              sx={{
                backgroundColor: "#144ae9",
                color: "white",
                "&:hover": { backgroundColor: "#0d3ec7" },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                flex: { xs: 1, sm: 'unset' }
              }}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                starticon={<Save size={16} />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  backgroundColor: '#1348e8',
                  color: 'white',
                  '&:hover': { backgroundColor: '#059669' },
                  '&:disabled': { backgroundColor: '#9ca3af' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  flex: { xs: 1, sm: 'unset' }
                }}
              >
                Save
              </Button>
              <Button
                starticon={<X size={16} />}
                onClick={handleCancel}
                variant="outlined"
                sx={{
                  borderColor: '#6b7280',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#374151',
                    backgroundColor: '#f9fafb'
                  },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  flex: { xs: 1, sm: 'unset' }
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT SIDE - Media Preview (70%) */}
        <div className="w-full xl:w-[70%]">
          <Card sx={{ border: '1px solid #144ae920', overflow: 'hidden', mb: 3 }}>
            <div className="relative bg-[#144ae905]">
              {media.fileType === "video" ? (
                <video
                  src={media.fileUrl}
                  controls
                  className="w-full h-64 md:h-80 lg:h-96 object-contain"
                />
              ) : (
                <img
                  src={media.fileUrl}
                  alt={media.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-contain"
                />
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span 
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={media.fileType === 'video' ? { backgroundColor: '#ef4444', color: 'white' } : { backgroundColor: '#3b82f6', color: 'white' }}
                >
                  {media.fileType === "video" ? <Video size={14} /> : <ImageIcon size={14} />}
                  {media.fileType}
                </span>
                {/* <span 
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={getStatusColor(media.status)}
                >
                  {getStatusIcon(media.status)}
                  {media.status}
                </span> */}
              </div>

              {/* <div className="absolute top-4 right-4">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  style={getCategoryColor(media.category)}
                >
                  {media.category}
                </span>
              </div> */}
            </div>
          </Card>

          {/* MEDIA INFORMATION FORM */}
        
        </div>

        {/* RIGHT SIDE - Quick Info (30%) */}
        <div className="w-full xl:w-[30%]">
          <Card sx={{ p: 3, border: '1px solid #144ae920', mb: 3 }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#144ae910] flex-shrink-0">
                  <FileType size={20} className="text-[#144ae9]" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium mb-1">File Type</p>
                  <p className="font-semibold text-gray-900">{media.fileType}</p>
                </div>
              </div>

              {/* <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#144ae910] flex-shrink-0">
                  <Shield size={20} className="text-[#144ae9]" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium mb-1">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{media.status}</p>
                </div>
              </div> */}

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#144ae910] flex-shrink-0">
                  <User size={20} className="text-[#144ae9]" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium mb-1">Uploaded By</p>
                  <p className="font-semibold text-gray-900">{media.uploadedBy?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#144ae910] flex-shrink-0">
                  <Calendar size={20} className="text-[#144ae9]" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium mb-1">Upload Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(media.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {media.captureDate && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#144ae910] flex-shrink-0">
                    <Calendar size={20} className="text-[#144ae9]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">Capture Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(media.captureDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {(media.district || media.gramPanchayat) && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#144ae910] flex-shrink-0">
                    <MapPin size={20} className="text-[#144ae9]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {media.gramPanchayat?.name 
                        ? `${media.gramPanchayat.name}, ${media.district?.name}`
                        : media.district?.name || 'N/A'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
        <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Media Information</h2>

            <div className="flex flex-col gap-4">
              <TextField
                label="Title *"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={!edit}
                fullWidth
              />

              <TextField
                label="Description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!edit}
                multiline
                rows={4}
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Category *"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={CATEGORIES}
                  disabled={!edit}
                  fullWidth
                />

                <SelectField
                  label="Status"
                  value={formData.status || ""}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={STATUSES}
                  disabled={!edit}
                  starticon={<Shield size={20} className="text-[#144ae9]" />}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Photographer"
                  value={formData.photographer || ""}
                  onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  disabled={!edit}
                  starticon={<User size={18} className="text-[#144ae9]" />}
                  fullWidth
                />

                <TextField
                  label="Capture Date"
                  type="date"
                  value={formData.captureDate || ""}
                  onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
                  disabled={!edit}
                  starticon={<Calendar size={18} className="text-[#144ae9]" />}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="District"
                  value={formData.district || ""}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  options={[
                    { value: "", label: "Select District" },
                    ...districts.map(d => ({ value: d._id, label: d.name }))
                  ]}
                  disabled={!edit}
                  fullWidth
                />

                <SelectField
                  label="Gram Panchayat"
                  value={formData.gramPanchayat || ""}
                  onChange={(e) => setFormData({ ...formData, gramPanchayat: e.target.value })}
                  options={[
                    { value: "", label: "Select Panchayat" },
                    ...panchayats.map(p => ({ value: p._id, label: p.name }))
                  ]}
                  disabled={!edit || !formData.district}
                  fullWidth
                />
              </div>

              {/* TAGS */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                {edit && (
                  <div className="flex gap-2 mb-3">
                    <TextField
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      starticon={<Tag size={18} className="text-[#144ae9]" />}
                      fullWidth
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      sx={{
                        backgroundColor: '#144ae9',
                        color: 'white',
                        '&:hover': { backgroundColor: '#0d3ec7' },
                        fontWeight: 600,
                        minWidth: '80px'
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-[#144ae910] text-[#144ae9] border border-[#144ae920] rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {tag}
                      {edit && (
                        <button
                          onClick={() => handleRemoveTag(index)}
                          className="text-[#144ae9] hover:text-[#0d3ec7] rounded-full hover:bg-[#144ae920] p-0.5"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

      {/* REJECT DIALOG */}
      <Dialog 
        open={openRejectDialog} 
        onClose={() => setOpenRejectDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
      >
        <DialogTitle>
          <h3 className="text-xl font-bold text-gray-900 m-0">Reject Media</h3>
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-500 text-sm mb-4">
            Please provide a reason for rejecting this media:
          </p>
          <TextField
            fullWidth
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={4}
            placeholder="Enter the reason for rejection..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setOpenRejectDialog(false)}
            variant="outlined"
            sx={{
              borderColor: '#6b7280',
              color: '#374151',
              '&:hover': {
                borderColor: '#374151',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            sx={{
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            Reject Media
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import {
//   fetchMediaById,
//   updateMedia,
//   approveMedia,
//   rejectMedia,
//   clearError,
//   clearSuccess,
// } from "@/redux/slices/mediaSlice.js"
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField as MuiTextField,
// } from "@mui/material"
// import {
//   ArrowLeft,
//   Edit,
//   Save,
//   X,
//   CheckCircle,
//   XCircle,
//   Clock,
//   MapPin,
//   User,
//   Calendar,
//   Tag,
//   Image as ImageIcon,
//   Video,
// } from "lucide-react"
// import { toast } from "react-toastify"
// import Link from "next/link"
// import Button from "@/components/ui/Button"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import Loader from "@/components/ui/Loader"

// const CATEGORIES = [
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// export default function MediaDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedMedia: media, loading, error, success } = useSelector((state) => state.media)

//   const [edit, setEdit] = useState(false)
//   const [formData, setFormData] = useState({})
//   const [openRejectDialog, setOpenRejectDialog] = useState(false)
//   const [rejectReason, setRejectReason] = useState("")
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchMediaById(params.id))
//     }
//   }, [dispatch, params.id])

//   useEffect(() => {
//     if (media) {
//       setFormData({
//         title: media.title || "",
//         description: media.description || "",
//         category: media.category || "",
//         photographer: media.photographer || "",
//         tags: media.tags?.join(", ") || "",
//         captureDate: media.captureDate ? new Date(media.captureDate).toISOString().split('T')[0] : "",
//       })
//     }
//   }, [media])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setEdit(false)
//       if (params.id) {
//         dispatch(fetchMediaById(params.id))
//       }
//     }
//   }, [success, dispatch, params.id])

//   const handleSave = useCallback(async () => {
//     setSaving(true)
//     try {
//       const updateData = {
//         ...formData,
//         tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
//       }
//       await dispatch(updateMedia({ id: params.id, mediaData: updateData })).unwrap()
//     } catch (error) {
//       console.error('Update failed:', error)
//     } finally {
//       setSaving(false)
//     }
//   }, [formData, params.id, dispatch])

//   const handleApprove = useCallback(async () => {
//     try {
//       await dispatch(approveMedia(params.id)).unwrap()
//       toast.success("Media approved successfully")
//     } catch (error) {
//       console.error('Approval failed:', error)
//     }
//   }, [params.id, dispatch])

//   const handleReject = useCallback(async () => {
//     if (!rejectReason.trim()) {
//       toast.error("Please provide a rejection reason")
//       return
//     }
//     try {
//       await dispatch(rejectMedia({ id: params.id, reason: rejectReason })).unwrap()
//       setOpenRejectDialog(false)
//       setRejectReason("")
//       toast.success("Media rejected successfully")
//     } catch (error) {
//       console.error('Rejection failed:', error)
//     }
//   }, [params.id, rejectReason, dispatch])

//   const getStatusIcon = useMemo(() => (status) => {
//     switch (status) {
//       case "approved":
//         return <CheckCircle size={20} className="text-green-500" />
//       case "rejected":
//         return <XCircle size={20} className="text-red-500" />
//       default:
//         return <Clock size={20} className="text-yellow-500" />
//     }
//   }, [])

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "approved":
//         return "bg-green-500 text-white"
//       case "rejected":
//         return "bg-red-500 text-white"
//       case "pending":
//         return "bg-yellow-500 text-white"
//       default:
//         return "bg-gray-500 text-white"
//     }
//   }

//   const getCategoryColor = (category) => {
//     switch (category) {
//       case "heritage":
//         return "bg-purple-500 text-white"
//       case "natural":
//         return "bg-green-500 text-white"
//       case "cultural":
//         return "bg-yellow-500 text-white"
//       case "event":
//         return "bg-red-500 text-white"
//       case "festival":
//         return "bg-blue-500 text-white"
//       default:
//         return "bg-gray-500 text-white"
//     }
//   }

//   if (loading && !media) {
//     return (
//       <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading..."} />
//         </div>
//     )
//   }

//   if (!media) {
//     return (
//       <div className="p-4 md:p-6 max-w-7xl mx-auto">
//         <div className="p-6 text-center rounded-lg shadow-sm border border-gray-200">
//           <h6 className="text-gray-500 text-xl font-semibold m-0">
//             Media not found
//           </h6>
//           <Link href="/admin/media" className="no-underline">
//             <Button className="mt-4">
//               Back to Media
//             </Button>
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 md:p-6 max-w-7xl mx-auto">
//       {/* HEADER */}
//       {
//         saving && <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Saving..."} />
//         </div>
//       }
//       <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
//         <div className="flex items-center gap-4">
//              <Link href="/admin/media" className="no-underline">
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
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">
//               Media Details
//             </h1>
//             <p className="text-gray-500 text-sm m-0">
//               Manage and review media content
//             </p>
//           </div>
//         </div>

//         {/* ACTION BUTTONS */}
//         <div className="flex gap-2 flex-wrap w-full md:w-auto">
//           {media.status === "pending" && (
//             <>
//               <Button
//                 starticon={<CheckCircle size={16} />}
//                 onClick={handleApprove}
//                 className="bg-green-500 hover:bg-green-600 text-white text-sm flex-1 md:flex-none"
//               >
//                 Approve
//               </Button>
//               <Button
//                 starticon={<XCircle size={16} />}
//                 onClick={() => setOpenRejectDialog(true)}
//                 className="bg-red-500 hover:bg-red-600 text-white text-sm flex-1 md:flex-none"
//               >
//                 Reject
//               </Button>
//             </>
//           )}
//           {!edit ? (
//            <Button
//   starticon={<Edit size={16} />}
//   onClick={() => setEdit(true)}
//   sx={{
//     backgroundColor: "#1348e8",
//     color: "white",
//     fontSize: "0.875rem", // text-sm
//     "&:hover": {
//       backgroundColor: "#0d3a9d",
//     },
//   }}
// >
//   Edit
// </Button>

//           ) : (
//             <>
//               <Button
//                 starticon={saving ? null : <Save size={16} />}
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="bg-green-500 hover:bg-green-600 text-white text-sm flex-1 md:flex-none"
//               >
//                 {!saving && 'Save'}
//               </Button>
//               <Button
//                 starticon={<X size={16} />}
//                 onClick={() => setEdit(false)}
//                 variant="outlined"
//                 className="border-gray-500 text-gray-500 hover:border-gray-700 hover:bg-gray-50 text-sm flex-1 md:flex-none"
//               >
//                 Cancel
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* MAIN CONTENT - Media & Quick Info Side by Side */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* MEDIA PREVIEW - Takes 3/4 on desktop */}
//         <div className="lg:col-span-3">
//           <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm bg-blue-50/50">
//             <div className="relative">
//               {media.fileType === "video" ? (
//                 <video
//                   src={media.fileUrl}
//                   controls
//                   className="w-full max-h-[600px] object-contain"
//                 />
//               ) : (
//                 <img
//                   src={media.fileUrl}
//                   alt={media.title}
//                   className="w-full max-h-[600px] object-contain"
//                 />
//               )}
              
//               {/* Badges */}
//               <div className="absolute top-4 left-4 flex flex-col gap-2">
//                 <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
//                   media.fileType === 'video' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
//                 }`}>
//                   {media.fileType === "video" ? <Video size={14} /> : <ImageIcon size={14} />}
//                   {media.fileType}
//                 </span>
//                 <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(media.status)}`}>
//                   {getStatusIcon(media.status)}
//                   {media.status}
//                 </span>
//               </div>

//               <div className="absolute top-4 right-4">
//                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(media.category)}`}>
//                   {media.category}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* MEDIA INFORMATION FORM */}
         
//         </div>

//         {/* QUICK INFO - Takes 1/4 on desktop */}
//         <div className="lg:col-span-1">
//           <div className="flex flex-col gap-6">
//             {/* QUICK INFO CARD */}
//             <div className="p-6 rounded-xl shadow-sm border border-blue-100 bg-white">
//               <h3 className="text-lg font-bold text-gray-900 mb-4">
//                 Quick Info
//               </h3>
              
//               <div className="flex flex-col gap-5">
//                 <div className="flex items-start gap-4">
//                   <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 flex-shrink-0">
//                     <User size={18} className="text-blue-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-gray-500 text-sm font-medium mb-1">
//                       Uploaded By
//                     </p>
//                     <p className="font-semibold text-gray-900 text-sm truncate">
//                       {media.uploadedBy?.name || 'N/A'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-4">
//                   <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 flex-shrink-0">
//                     <Calendar size={18} className="text-blue-600" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-gray-500 text-sm font-medium mb-1">
//                       Upload Date
//                     </p>
//                     <p className="font-semibold text-gray-900 text-sm">
//                       {new Date(media.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>

//                 {media.captureDate && (
//                   <div className="flex items-start gap-4">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 flex-shrink-0">
//                       <Calendar size={18} className="text-blue-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-gray-500 text-sm font-medium mb-1">
//                         Capture Date
//                       </p>
//                       <p className="font-semibold text-gray-900 text-sm">
//                         {new Date(media.captureDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {(media.district || media.gramPanchayat) && (
//                   <div className="flex items-start gap-4">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 flex-shrink-0">
//                       <MapPin size={18} className="text-blue-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-gray-500 text-sm font-medium mb-1">
//                         Location
//                       </p>
//                       <p className="font-semibold text-gray-900 text-sm">
//                         {media.gramPanchayat?.name 
//                           ? `${media.gramPanchayat.name}, ${media.district?.name}`
//                           : media.district?.name || 'N/A'
//                         }
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* TAGS CARD */}
//             {media.tags && media.tags.length > 0 && (
//               <div className="p-6 rounded-xl shadow-sm border border-blue-100 bg-white">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
//                     <Tag size={16} className="text-blue-600" />
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-900 m-0">
//                     Tags
//                   </h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {media.tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//  <div className="mt-6 p-6 rounded-xl shadow-sm border border-blue-100 bg-white">
//             <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
//               {edit ? "Edit Media Information" : "Media Information"}
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               <div className="md:col-span-2">
//                 <TextField
//                   label="Title"
//                   value={formData.title || ""}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   disabled={!edit}
//                   fullWidth
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <TextField
//                   label="Description"
//                   value={formData.description || ""}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   disabled={!edit}
//                   multiline
//                   rows={4}
//                   fullWidth
//                 />
//               </div>

//               <div>
//                 <SelectField
//                   label="Category"
//                   value={formData.category || ""}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   options={CATEGORIES}
//                   disabled={!edit}
//                   fullWidth
//                 />
//               </div>

//               <div>
//                 <TextField
//                   label="Photographer"
//                   value={formData.photographer || ""}
//                   onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
//                   disabled={!edit}
//                   starticon={<User size={18} className="text-blue-600" />}
//                   fullWidth
//                 />
//               </div>

//               <div>
//                 <MuiTextField
//                   label="Capture Date"
//                   type="date"
//                   value={formData.captureDate || ""}
//                   onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
//                   disabled={!edit}
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </div>

//               <div>
//                 <TextField
//                   label="Tags (comma separated)"
//                   value={formData.tags || ""}
//                   onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
//                   disabled={!edit}
//                   starticon={<Tag size={18} className="text-blue-600" />}
//                   fullWidth
//                   helperText="Separate tags with commas"
//                 />
//               </div>
//             </div>
//           </div>
//       {/* REJECT DIALOG */}
//       <Dialog 
//         open={openRejectDialog} 
//         onClose={() => setOpenRejectDialog(false)} 
//         maxWidth="sm" 
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 12, m: 2 } }}
//       >
//         <DialogTitle>
//           <h3 className="text-xl font-bold text-gray-900 m-0">
//             Reject Media
//           </h3>
//         </DialogTitle>
//         <DialogContent>
//           <p className="text-gray-500 text-sm mb-4">
//             Please provide a reason for rejecting this media:
//           </p>
//           <MuiTextField
//             fullWidth
//             label="Rejection Reason"
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//             multiline
//             rows={4}
//             placeholder="Enter the reason for rejection..."
//           />
//         </DialogContent>
//         <DialogActions className="p-6 gap-3">
//           <Button
//             onClick={() => setOpenRejectDialog(false)}
//             variant="outlined"
//             className="border-gray-500 text-gray-500 hover:border-gray-700 hover:bg-gray-50 text-sm"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleReject}
//             className="bg-red-500 hover:bg-red-600 text-white text-sm"
//           >
//             Reject Media
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   )
// }


// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import {
//   fetchMediaById,
//   updateMedia,
//   approveMedia,
//   rejectMedia,
//   clearError,
//   clearSuccess,
// } from "@/redux/slices/mediaSlice.js"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField as MuiTextField,
// } from "@mui/material"
// import {
//   ArrowLeft,
//   Edit,
//   Save,
//   X,
//   CheckCircle,
//   XCircle,
//   Clock,
//   MapPin,
//   User,
//   Calendar,
//   Tag,
//   Image as ImageIcon,
//   Video,
// } from "lucide-react"
// import { toast } from "react-toastify"
// import Link from "next/link"
// import Button from "@/components/ui/Button"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import Loader from "@/components/ui/Loader"

// const CATEGORIES = [
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// export default function MediaDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedMedia: media, loading, error, success } = useSelector((state) => state.media)

//   const [edit, setEdit] = useState(false)
//   const [formData, setFormData] = useState({})
//   const [openRejectDialog, setOpenRejectDialog] = useState(false)
//   const [rejectReason, setRejectReason] = useState("")
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchMediaById(params.id))
//     }
//   }, [dispatch, params.id])

//   useEffect(() => {
//     if (media) {
//       setFormData({
//         title: media.title || "",
//         description: media.description || "",
//         category: media.category || "",
//         photographer: media.photographer || "",
//         tags: media.tags?.join(", ") || "",
//         captureDate: media.captureDate ? new Date(media.captureDate).toISOString().split('T')[0] : "",
//       })
//     }
//   }, [media])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setEdit(false)
//       if (params.id) {
//         dispatch(fetchMediaById(params.id))
//       }
//     }
//   }, [success, dispatch, params.id])

//   const handleSave = useCallback(async () => {
//     setSaving(true)
//     try {
//       const updateData = {
//         ...formData,
//         tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
//       }
//       await dispatch(updateMedia({ id: params.id, mediaData: updateData })).unwrap()
//     } catch (error) {
//       console.error('Update failed:', error)
//     } finally {
//       setSaving(false)
//     }
//   }, [formData, params.id, dispatch])

//   const handleApprove = useCallback(async () => {
//     try {
//       await dispatch(approveMedia(params.id)).unwrap()
//       toast.success("Media approved successfully")
//     } catch (error) {
//       console.error('Approval failed:', error)
//     }
//   }, [params.id, dispatch])

//   const handleReject = useCallback(async () => {
//     if (!rejectReason.trim()) {
//       toast.error("Please provide a rejection reason")
//       return
//     }
//     try {
//       await dispatch(rejectMedia({ id: params.id, reason: rejectReason })).unwrap()
//       setOpenRejectDialog(false)
//       setRejectReason("")
//       toast.success("Media rejected successfully")
//     } catch (error) {
//       console.error('Rejection failed:', error)
//     }
//   }, [params.id, rejectReason, dispatch])

//   const getStatusIcon = useMemo(() => (status) => {
//     switch (status) {
//       case "approved":
//         return <CheckCircle size={20} color="#10b981" />
//       case "rejected":
//         return <XCircle size={20} color="#ef4444" />
//       default:
//         return <Clock size={20} color="#f59e0b" />
//     }
//   }, [])

//   const getStatusColor = useMemo(() => (status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   const getCategoryColor = useMemo(() => (category) => {
//     switch (category) {
//       case "heritage":
//         return { backgroundColor: '#8b5cf6', color: 'white' }
//       case "natural":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "cultural":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "event":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       case "festival":
//         return { backgroundColor: '#3b82f6', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   if (loading && !media) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
//         <Loader />
//       </Box>
//     )
//   }

//   if (!media) {
//     return (
//       <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
//         <Card sx={{ p: 4, textAlign: 'center' }}>
//           <Typography variant="h6" color="text.secondary">
//             Media not found
//           </Typography>
//           <Link href="/admin/media" style={{ textDecoration: 'none' }}>
//             <Button sx={{ mt: 2 }}>
//               Back to Media
//             </Button>
//           </Link>
//         </Card>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, sm: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'space-between', 
//         mb: { xs: 3, sm: 4 }, 
//         flexWrap: 'wrap', 
//         gap: 2 
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/media" style={{ textDecoration: 'none' }}>
//             <Button 
//               variant="outlined" 
//               sx={{ 
//                 minWidth: 'auto', 
//                 p: { xs: 1, sm: 1.5 },
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}>
//               Media Details
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//               Manage and review media content
//             </Typography>
//           </Box>
//         </Box>

//         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           {media.status === "pending" && (
//             <>
//               <Button
//                 starticon={<CheckCircle size={16} />}
//                 onClick={handleApprove}
//                 fullWidth={false}
//                 sx={{
//                   backgroundColor: '#10b981',
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#059669' }
//                 }}
//               >
//                 Approve
//               </Button>
//               <Button
//                 starticon={<XCircle size={16} />}
//                 onClick={() => setOpenRejectDialog(true)}
//                 fullWidth={false}
//                 sx={{
//                   backgroundColor: '#ef4444',
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#dc2626' }
//                 }}
//               >
//                 Reject
//               </Button>
//             </>
//           )}
//           {!edit ? (
//             <Button
//               starticon={<Edit size={16} />}
//               onClick={() => setEdit(true)}
//               fullWidth={media.status === "pending"}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': { backgroundColor: '#0d3ec7' }
//               }}
//             >
//               Edit
//             </Button>
//           ) : (
//             <>
//               <Button
//                 starticon={saving ? null : <Save size={16} />}
//                 onClick={handleSave}
//                 disabled={saving}
//                 fullWidth={false}
//                 sx={{
//                   backgroundColor: '#10b981',
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#059669' }
//                 }}
//               >
//                 {saving ? <Loader /> : 'Save'}
//               </Button>
//               <Button
//                 starticon={<X size={16} />}
//                 onClick={() => setEdit(false)}
//                 variant="outlined"
//                 fullWidth={false}
//                 sx={{
//                   borderColor: '#6b7280',
//                   color: '#6b7280',
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': {
//                     borderColor: '#374151',
//                     backgroundColor: '#6b728010'
//                   }
//                 }}
//               >
//                 Cancel
//               </Button>
//             </>
//           )}
//         </Box>
//       </Box>

//       <Grid container spacing={{ xs: 2, sm: 3 }}>
//         {/* MEDIA PREVIEW */}
//         <Grid item xs={12} lg={8}>
//           <Card sx={{ border: '1px solid #144ae920', overflow: 'hidden' }}>
//             <Box sx={{ position: 'relative', backgroundColor: '#144ae905' }}>
//               {media.fileType === "video" ? (
//                 <video
//                   src={media.fileUrl}
//                   controls
//                   style={{
//                     width: '100%',
//                     maxHeight: '500px',
//                     objectFit: 'contain'
//                   }}
//                 />
//               ) : (
//                 <img
//                   src={media.fileUrl}
//                   alt={media.title}
//                   style={{
//                     width: '100%',
//                     maxHeight: '500px',
//                     objectFit: 'contain'
//                   }}
//                 />
//               )}
              
//               <Box sx={{ position: 'absolute', top: { xs: 8, sm: 12 }, left: { xs: 8, sm: 12 }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Chip
//                   icon={media.fileType === "video" ? <Video size={12} /> : <ImageIcon size={12} />}
//                   label={media.fileType}
//                   size="small"
//                   sx={{
//                     backgroundColor: media.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                     color: 'white',
//                     fontWeight: 600,
//                     fontSize: { xs: '0.65rem', sm: '0.75rem' }
//                   }}
//                 />
//                 <Chip
//                   icon={getStatusIcon(media.status)}
//                   label={media.status}
//                   size="small"
//                   sx={{
//                     ...getStatusColor(media.status),
//                     fontWeight: 600,
//                     fontSize: { xs: '0.65rem', sm: '0.75rem' }
//                   }}
//                 />
//               </Box>

//               <Box sx={{ position: 'absolute', top: { xs: 8, sm: 12 }, right: { xs: 8, sm: 12 } }}>
//                 <Chip
//                   label={media.category}
//                   size="small"
//                   sx={{
//                     ...getCategoryColor(media.category),
//                     fontWeight: 600,
//                     fontSize: { xs: '0.65rem', sm: '0.75rem' }
//                   }}
//                 />
//               </Box>
//             </Box>
//           </Card>
//         </Grid>

//         {/* SIDEBAR INFO */}
//         <Grid item xs={12} lg={4}>
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
//             {/* QUICK INFO */}
//             <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920' }}>
//               <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                 Quick Info
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <User size={16} color="#144ae9" className="sm:w-5 sm:h-5" />
//                   <Box>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
//                       Uploaded By
//                     </Typography>
//                     <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
//                       {media.uploadedBy?.name || 'N/A'}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <Calendar size={16} color="#144ae9" className="sm:w-5 sm:h-5" />
//                   <Box>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
//                       Upload Date
//                     </Typography>
//                     <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
//                       {new Date(media.createdAt).toLocaleDateString()}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {media.captureDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <Calendar size={16} color="#144ae9" className="sm:w-5 sm:h-5" />
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
//                         Capture Date
//                       </Typography>
//                       <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
//                         {new Date(media.captureDate).toLocaleDateString()}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 )}

//                 {(media.district || media.gramPanchayat) && (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <MapPin size={16} color="#144ae9" className="sm:w-5 sm:h-5" />
//                     <Box>
//                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
//                         Location
//                       </Typography>
//                       <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
//                         {media.gramPanchayat?.name 
//                           ? `${media.gramPanchayat.name}, ${media.district?.name}`
//                           : media.district?.name || 'N/A'
//                         }
//                       </Typography>
//                     </Box>
//                   </Box>
//                 )}
//               </Box>
//             </Card>

//             {/* TAGS */}
//             {media.tags && media.tags.length > 0 && (
//               <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                   <Tag size={16} color="#144ae9" className="sm:w-5 sm:h-5" />
//                   <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                     Tags
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                   {media.tags.map((tag, index) => (
//                     <Chip
//                       key={index}
//                       label={tag}
//                       size="small"
//                       sx={{
//                         backgroundColor: '#144ae910',
//                         color: '#144ae9',
//                         border: '1px solid #144ae920',
//                         fontWeight: 500,
//                         fontSize: { xs: '0.65rem', sm: '0.75rem' }
//                       }}
//                     />
//                   ))}
//                 </Box>
//               </Card>
//             )}
//           </Box>
//         </Grid>

//         {/* MEDIA INFORMATION FORM */}
//         <Grid item xs={12}>
//           <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
//               {edit ? "Edit Media Information" : "Media Information"}
//             </Typography>

//             <Grid container spacing={{ xs: 2, sm: 3 }}>
//               <Grid item xs={12}>
//                 <TextField
//                   label="Title"
//                   value={formData.title || ""}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   disabled={!edit}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   label="Description"
//                   value={formData.description || ""}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   disabled={!edit}
//                   multiline
//                   rows={4}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <SelectField
//                   label="Category"
//                   value={formData.category || ""}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   options={CATEGORIES}
//                   disabled={!edit}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Photographer"
//                   value={formData.photographer || ""}
//                   onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
//                   disabled={!edit}
//                   starticon={<User size={18} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <MuiTextField
//                   label="Capture Date"
//                   type="date"
//                   value={formData.captureDate || ""}
//                   onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
//                   disabled={!edit}
//                   fullWidth
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Tags (comma separated)"
//                   value={formData.tags || ""}
//                   onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
//                   disabled={!edit}
//                   starticon={<Tag size={18} color="#144ae9" />}
//                   fullWidth
//                   helperText="Separate tags with commas"
//                 />
//               </Grid>
//             </Grid>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* REJECT DIALOG */}
//       <Dialog 
//         open={openRejectDialog} 
//         onClose={() => setOpenRejectDialog(false)} 
//         maxWidth="sm" 
//         fullWidth
//         PaperProps={{ sx: { borderRadius: 2, m: 2 } }}
//       >
//         <DialogTitle>
//           <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
//             Reject Media
//           </Typography>
//         </DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Please provide a reason for rejecting this media:
//           </Typography>
//           <MuiTextField
//             fullWidth
//             label="Rejection Reason"
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//             multiline
//             rows={4}
//             placeholder="Enter the reason for rejection..."
//           />
//         </DialogContent>
//         <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
//           <Button
//             onClick={() => setOpenRejectDialog(false)}
//             variant="outlined"
//             sx={{
//               borderColor: '#6b7280',
//               color: '#6b7280',
//               fontSize: { xs: '0.75rem', sm: '0.875rem' },
//               '&:hover': {
//                 borderColor: '#374151',
//                 backgroundColor: '#6b728010'
//               }
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleReject}
//             sx={{
//               backgroundColor: '#ef4444',
//               fontSize: { xs: '0.75rem', sm: '0.875rem' },
//               '&:hover': { backgroundColor: '#dc2626' }
//             }}
//           >
//             Reject Media
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }


// "use client"

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams, useRouter } from "next/navigation"
// import {
//   fetchMediaById,
//   updateMedia,
//   approveMedia,
//   rejectMedia,
//   clearError,
//   clearSuccess,
// } from "@/redux/slices/mediaSlice.js"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField as MuiTextField,
// } from "@mui/material"
// import {
//   ArrowLeft,
//   Edit,
//   Save,
//   X,
//   CheckCircle,
//   XCircle,
//   Clock,
//   MapPin,
//   User,
//   Calendar,
//   Tag,
//   Image as ImageIcon,
//   Video,
// } from "lucide-react"
// import { toast } from "react-toastify"
// import Link from "next/link"

// // Import your custom components
// import Button from "@/components/ui/Button"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import Loader from "@/components/ui/Loader"

// const CATEGORIES = [
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// export default function MediaDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedMedia: media, loading, error, success } = useSelector((state) => state.media)

//   const [edit, setEdit] = useState(false)
//   const [formData, setFormData] = useState({})
//   const [openRejectDialog, setOpenRejectDialog] = useState(false)
//   const [rejectReason, setRejectReason] = useState("")
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchMediaById(params.id))
//     }
//   }, [dispatch, params.id])

//   useEffect(() => {
//     if (media) {
//       setFormData({
//         title: media.title || "",
//         description: media.description || "",
//         category: media.category || "",
//         photographer: media.photographer || "",
//         tags: media.tags?.join(", ") || "",
//         captureDate: media.captureDate ? new Date(media.captureDate).toISOString().split('T')[0] : "",
//       })
//     }
//   }, [media])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setEdit(false)
//       if (params.id) {
//         dispatch(fetchMediaById(params.id))
//       }
//     }
//   }, [success, dispatch, params.id])

//   const handleSave = async () => {
//     setSaving(true)
//     try {
//       const updateData = {
//         ...formData,
//         tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
//       }
//       await dispatch(updateMedia({ id: params.id, mediaData: updateData })).unwrap()
//     } catch (error) {
//       console.error('Update failed:', error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleApprove = async () => {
//     try {
//       await dispatch(approveMedia(params.id)).unwrap()
//       toast.success("Media approved successfully")
//     } catch (error) {
//       console.error('Approval failed:', error)
//     }
//   }

//   const handleReject = async () => {
//     if (!rejectReason.trim()) {
//       toast.error("Please provide a rejection reason")
//       return
//     }
//     try {
//       await dispatch(rejectMedia({ id: params.id, reason: rejectReason })).unwrap()
//       setOpenRejectDialog(false)
//       setRejectReason("")
//       toast.success("Media rejected successfully")
//     } catch (error) {
//       console.error('Rejection failed:', error)
//     }
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "approved":
//         return <CheckCircle size={20} color="#10b981" />
//       case "rejected":
//         return <XCircle size={20} color="#ef4444" />
//       default:
//         return <Clock size={20} color="#f59e0b" />
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }

//   const getCategoryColor = (category) => {
//     switch (category) {
//       case "heritage":
//         return { backgroundColor: '#8b5cf6', color: 'white' }
//       case "natural":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "cultural":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "event":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       case "festival":
//         return { backgroundColor: '#3b82f6', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
//         <Loader />
//       </Box>
//     )
//   }

//   if (!media) {
//     return (
//       <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
//         <Card sx={{ p: 4, textAlign: 'center' }}>
//           <Typography variant="h6" color="text.secondary">
//             Media not found
//           </Typography>
//           <Link href="/admin/media" style={{ textDecoration: 'none' }}>
//             <Button sx={{ mt: 2 }}>
//               Back to Media
//             </Button>
//           </Link>
//         </Card>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/media" style={{ textDecoration: 'none' }}>
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
//             <Typography variant="h4" fontWeight="bold" color="text.primary">
//               Media Details
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Manage and review media content
//             </Typography>
//           </Box>
//         </Box>

//         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//           {media.status === "pending" && (
//             <>
//               <Button
//                 starticon={<CheckCircle size={18} />}
//                 onClick={handleApprove}
//                 sx={{
//                   backgroundColor: '#10b981',
//                   '&:hover': { backgroundColor: '#059669' }
//                 }}
//               >
//                 Approve
//               </Button>
//               <Button
//                 starticon={<XCircle size={18} />}
//                 onClick={() => setOpenRejectDialog(true)}
//                 sx={{
//                   backgroundColor: '#ef4444',
//                   '&:hover': { backgroundColor: '#dc2626' }
//                 }}
//               >
//                 Reject
//               </Button>
//             </>
//           )}
//           {!edit ? (
//             <Button
//               starticon={<Edit size={18} />}
//               onClick={() => setEdit(true)}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 '&:hover': { backgroundColor: '#0d3ec7' }
//               }}
//             >
//               Edit
//             </Button>
//           ) : (
//             <>
//               <Button
//                 starticon={saving ? <Loader /> : <Save size={18} />}
//                 onClick={handleSave}
//                 disabled={saving}
//                 sx={{
//                   backgroundColor: '#10b981',
//                   '&:hover': { backgroundColor: '#059669' }
//                 }}
//               >
//                 {saving ? 'Saving...' : 'Save'}
//               </Button>
//               <Button
//                 starticon={<X size={18} />}
//                 onClick={() => setEdit(false)}
//                 variant="outlined"
//                 sx={{
//                   borderColor: '#6b7280',
//                   color: '#6b7280',
//                   '&:hover': {
//                     borderColor: '#374151',
//                     backgroundColor: '#6b728010'
//                   }
//                 }}
//               >
//                 Cancel
//               </Button>
//             </>
//           )}
//         </Box>
//       </Box>

//       <Grid container spacing={3}>
//         {/* MEDIA PREVIEW */}
//         <Grid item xs={12} lg={8}>
//           <Card sx={{ border: '1px solid #144ae920', overflow: 'hidden' }}>
//             <Box sx={{ position: 'relative', backgroundColor: '#144ae905' }}>
//               {media.fileType === "video" ? (
//                 <video
//                   src={media.fileUrl}
//                   controls
//                   style={{
//                     width: '100%',
//                     maxHeight: '500px',
//                     objectFit: 'contain'
//                   }}
//                 />
//               ) : (
//                 <img
//                   src={media.fileUrl}
//                   alt={media.title}
//                   style={{
//                     width: '100%',
//                     maxHeight: '500px',
//                     objectFit: 'contain'
//                   }}
//                 />
//               )}
              
//               {/* BADGES OVERLAY */}
//               <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <Chip
//                   icon={media.fileType === "video" ? <Video size={14} /> : <ImageIcon size={14} />}
//                   label={media.fileType}
//                   size="small"
//                   sx={{
//                     backgroundColor: media.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                     color: 'white',
//                     fontWeight: 600
//                   }}
//                 />
//                 <Chip
//                   icon={getStatusIcon(media.status)}
//                   label={media.status}
//                   size="small"
//                   sx={{
//                     ...getStatusColor(media.status),
//                     fontWeight: 600
//                   }}
//                 />
//               </Box>

//               {/* CATEGORY BADGE */}
//               <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
//                 <Chip
//                   label={media.category}
//                   size="small"
//                   sx={{
//                     ...getCategoryColor(media.category),
//                     fontWeight: 600
//                   }}
//                 />
//               </Box>
//             </Box>
//           </Card>
//         </Grid>

//         {/* SIDEBAR INFO */}
//         <Grid item xs={12} lg={4}>
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//             {/* QUICK INFO */}
//             <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//               <Typography variant="h6" fontWeight="bold" gutterBottom>
//                 Quick Info
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <User size={18} color="#144ae9" />
//                   <Box>
//                     <Typography variant="body2" color="text.secondary">
//                       Uploaded By
//                     </Typography>
//                     <Typography variant="body1" fontWeight={500}>
//                       {media.uploadedBy?.name || 'N/A'}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <Calendar size={18} color="#144ae9" />
//                   <Box>
//                     <Typography variant="body2" color="text.secondary">
//                       Upload Date
//                     </Typography>
//                     <Typography variant="body1" fontWeight={500}>
//                       {new Date(media.createdAt).toLocaleDateString()}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {media.captureDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <Calendar size={18} color="#144ae9" />
//                     <Box>
//                       <Typography variant="body2" color="text.secondary">
//                         Capture Date
//                       </Typography>
//                       <Typography variant="body1" fontWeight={500}>
//                         {new Date(media.captureDate).toLocaleDateString()}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 )}

//                 {(media.district || media.gramPanchayat) && (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <MapPin size={18} color="#144ae9" />
//                     <Box>
//                       <Typography variant="body2" color="text.secondary">
//                         Location
//                       </Typography>
//                       <Typography variant="body1" fontWeight={500}>
//                         {media.gramPanchayat?.name 
//                           ? `${media.gramPanchayat.name}, ${media.district?.name}`
//                           : media.district?.name || 'N/A'
//                         }
//                       </Typography>
//                     </Box>
//                   </Box>
//                 )}
//               </Box>
//             </Card>

//             {/* TAGS */}
//             {media.tags && media.tags.length > 0 && (
//               <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                   <Tag size={18} color="#144ae9" />
//                   <Typography variant="h6" fontWeight="bold">
//                     Tags
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                   {media.tags.map((tag, index) => (
//                     <Chip
//                       key={index}
//                       label={tag}
//                       size="small"
//                       sx={{
//                         backgroundColor: '#144ae910',
//                         color: '#144ae9',
//                         border: '1px solid #144ae920',
//                         fontWeight: 500
//                       }}
//                     />
//                   ))}
//                 </Box>
//               </Card>
//             )}
//           </Box>
//         </Grid>

//         {/* MEDIA INFORMATION FORM */}
//         <Grid item xs={12}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h5" fontWeight="bold" gutterBottom>
//               {edit ? "Edit Media Information" : "Media Information"}
//             </Typography>

//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   label="Title"
//                   value={formData.title || ""}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   disabled={!edit}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   label="Description"
//                   value={formData.description || ""}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   disabled={!edit}
//                   multiline
//                   rows={4}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <SelectField
//                   label="Category"
//                   value={formData.category || ""}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   options={CATEGORIES}
//                   disabled={!edit}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Photographer"
//                   value={formData.photographer || ""}
//                   onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
//                   disabled={!edit}
//                   starticon={<User size={20} color="#144ae9" />}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <MuiTextField
//                   label="Capture Date"
//                   type="date"
//                   value={formData.captureDate || ""}
//                   onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
//                   disabled={!edit}
//                   fullWidth
//                   InputLabelProps={{
//                     shrink: true,
//                   }}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Tags (comma separated)"
//                   value={formData.tags || ""}
//                   onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
//                   disabled={!edit}
//                   starticon={<Tag size={20} color="#144ae9" />}
//                   fullWidth
//                   helperText="Separate tags with commas"
//                 />
//               </Grid>
//             </Grid>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* REJECT DIALOG */}
//       <Dialog 
//         open={openRejectDialog} 
//         onClose={() => setOpenRejectDialog(false)} 
//         maxWidth="sm" 
//         fullWidth
//         PaperProps={{
//           sx: { borderRadius: 2 }
//         }}
//       >
//         <DialogTitle>
//           <Typography variant="h6" fontWeight="bold">
//             Reject Media
//           </Typography>
//         </DialogTitle>
//         <DialogContent>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//             Please provide a reason for rejecting this media:
//           </Typography>
//           <MuiTextField
//             fullWidth
//             label="Rejection Reason"
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//             multiline
//             rows={4}
//             placeholder="Enter the reason for rejection..."
//           />
//         </DialogContent>
//         <DialogActions sx={{ p: 3, gap: 1 }}>
//           <Button
//             onClick={() => setOpenRejectDialog(false)}
//             variant="outlined"
//             sx={{
//               borderColor: '#6b7280',
//               color: '#6b7280',
//               '&:hover': {
//                 borderColor: '#374151',
//                 backgroundColor: '#6b728010'
//               }
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleReject}
//             sx={{
//               backgroundColor: '#ef4444',
//               '&:hover': { backgroundColor: '#dc2626' }
//             }}
//           >
//             Reject Media
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

//  "use client"

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { useParams } from "next/navigation"
// import {
//   fetchMediaById,
//   updateMedia,
//   approveMedia,
//   rejectMedia,
//   clearError,
//   clearSuccess,
// } from "@/redux/slices/mediaSlice.js"
// import {
//   Container,
//   Box,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   CircularProgress,
//   Grid,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CardMedia,
//   Stack,
//   Chip,
//   Badge,
// } from "@mui/material"
// import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material"
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import { toast } from "react-toastify"
// import Link from "next/link"

// const CATEGORIES = ["heritage", "natural", "cultural", "event", "festival"]

// export default function MediaDetailPage() {
//   const params = useParams()
//   const dispatch = useDispatch()
//   const { currentMedia: media, loading, error, success } = useSelector((state) => state.media)

//   const [edit, setEdit] = useState(false)
//   const [formData, setFormData] = useState({})
//   const [openRejectDialog, setOpenRejectDialog] = useState(false)
//   const [rejectReason, setRejectReason] = useState("")
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     dispatch(fetchMediaById(params.id))
//   }, [dispatch, params.id])

//   useEffect(() => {
//     if (media) {
//       setFormData({
//         title: media.title || "",
//         description: media.description || "",
//         category: media.category || "",
//         photographer: media.photographer || "",
//         tags: media.tags?.join(", ") || "",
//       })
//     }
//   }, [media])

//   useEffect(() => {
//     if (error) {
//       toast.error(error.message || "An error occurred")
//       dispatch(clearError())
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setEdit(false)
//     }
//   }, [success, dispatch])

//   const handleSave = async () => {
//     setSaving(true)
//     try {
//       await dispatch(updateMedia({ id: params.id, data: formData }))
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleApprove = async () => {
//     await dispatch(approveMedia(params.id))
//     dispatch(fetchMediaById(params.id))
//   }

//   const handleReject = async () => {
//     if (!rejectReason.trim()) {
//       toast.error("Please provide a rejection reason")
//       return
//     }
//     await dispatch(rejectMedia({ id: params.id, reason: rejectReason }))
//     setOpenRejectDialog(false)
//     setRejectReason("")
//     dispatch(fetchMediaById(params.id))
//   }

//   if (loading) {
//     return (
//       <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
//         <CircularProgress />
//       </Container>
//     )
//   }

//   if (!media) {
//     return (
//       <Container sx={{ py: 4 }}>
//         <Card elevation={1} sx={{ p: 4, textAlign: "center" }}>
//           <Typography color="textSecondary">Media not found</Typography>
//         </Card>
//       </Container>
//     )
//   }

//   return (
//     <Container maxWidth="2xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box
//         sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}
//       >
//         <Box>
//           <Link href="/admin/media">
//             <Typography variant="body2" sx={{ cursor: "pointer", color: "primary.main", mb: 1 }}>
//               ← Back to Media
//             </Typography>
//           </Link>
//           <Typography variant="h4" sx={{ fontWeight: "bold" }}>
//             Media Details
//           </Typography>
//         </Box>
//         <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//           {!edit && (
//             <Button variant="outlined" size="small" starticon={<EditIcon />} onClick={() => setEdit(true)}>
//               Edit
//             </Button>
//           )}
//           {edit && (
//             <>
//               <Button variant="contained" size="small" starticon={<SaveIcon />} onClick={handleSave} disabled={saving}>
//                 {saving ? "Saving..." : "Save"}
//               </Button>
//               <Button variant="outlined" size="small" starticon={<CloseIcon />} onClick={() => setEdit(false)}>
//                 Cancel
//               </Button>
//             </>
//           )}
//         </Box>
//       </Box>

//       <Grid container spacing={3}>
//         {/* Media Preview */}
//         <Grid item xs={12} md={8}>
//           <Card elevation={2} sx={{ overflow: "hidden" }}>
//             <CardMedia
//               component={media.fileType === "video" ? "video" : "img"}
//               image={media.thumbnailUrl || media.fileUrl}
//               src={media.fileType === "video" ? media.fileUrl : undefined}
//               controls={media.fileType === "video"}
//               sx={{
//                 width: "100%",
//                 height: { xs: 300, sm: 400, md: 500 },
//                 backgroundColor: "#f0f0f0",
//                 objectFit: "cover",
//               }}
//             />
//           </Card>
//         </Grid>

//         {/* Info Sidebar */}
//         <Grid item xs={12} md={4}>
//           <Stack spacing={2}>
//             {/* Quick Info */}
//             <Card elevation={2} sx={{ p: 2 }}>
//               <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
//                 Status
//               </Typography>
//               <Badge status={media.status}>{media.status.toUpperCase()}</Badge>

//               <Box sx={{ mt: 2 }}>
//                 <Typography variant="caption" color="textSecondary" display="block">
//                   Uploaded by: {media.uploadedBy?.name || "N/A"}
//                 </Typography>
//                 <Typography variant="caption" color="textSecondary" display="block">
//                   {new Date(media.createdAt).toLocaleDateString()}
//                 </Typography>
//               </Box>
//             </Card>

//             {/* Moderation Actions */}
//             {media.status === "pending" && (
//               <Card elevation={2} sx={{ p: 2 }}>
//                 <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
//                   Moderation
//                 </Typography>
//                 <Stack spacing={1}>
//                   <Button fullWidth variant="contained" color="success" onClick={handleApprove}>
//                     Approve
//                   </Button>
//                   <Button fullWidth variant="contained" color="error" onClick={() => setOpenRejectDialog(true)}>
//                     Reject
//                   </Button>
//                 </Stack>
//               </Card>
//             )}
//           </Stack>
//         </Grid>

//         {/* Form Section */}
//         <Grid item xs={12}>
//           <Card elevation={2} sx={{ p: 3 }}>
//             <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
//               {edit ? "Edit Media" : "Media Information"}
//             </Typography>

//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Title"
//                   value={formData.title || ""}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   disabled={!edit}
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Description"
//                   value={formData.description || ""}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   disabled={!edit}
//                   multiline
//                   rows={4}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <FormControl fullWidth disabled={!edit}>
//                   <InputLabel>Category</InputLabel>
//                   <Select
//                     value={formData.category || ""}
//                     label="Category"
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   >
//                     {CATEGORIES.map((cat) => (
//                       <MenuItem key={cat} value={cat}>
//                         {cat.charAt(0).toUpperCase() + cat.slice(1)}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Photographer"
//                   value={formData.photographer || ""}
//                   onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
//                   disabled={!edit}
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Tags (comma separated)"
//                   value={formData.tags || ""}
//                   onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
//                   disabled={!edit}
//                 />
//               </Grid>

//               {/* Tags Display */}
//               {!edit && formData.tags && (
//                 <Grid item xs={12}>
//                   <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
//                     {formData.tags.split(",").map((tag, idx) => (
//                       <Chip key={idx} label={tag.trim()} size="small" />
//                     ))}
//                   </Box>
//                 </Grid>
//               )}
//             </Grid>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Reject Dialog */}
//       <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Reject Media</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label="Rejection Reason"
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//             multiline
//             rows={4}
//             sx={{ mt: 2 }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenRejectDialog(false)} variant="outlined">
//             Cancel
//           </Button>
//           <Button onClick={handleReject} variant="contained" color="error">
//             Reject
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   )
// }
