"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import {
  fetchMediaById,
  updateMedia,
  approveMedia,
  rejectMedia,
  clearError,
  clearSuccess,
} from "@/redux/slices/mediaSlice.js"
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
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
} from "lucide-react"
import { toast } from "react-toastify"
import Link from "next/link"

// Import your custom components
import Button from "@/components/ui/Button"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import Loader from "@/components/ui/Loader"

const CATEGORIES = [
  { value: "heritage", label: "Heritage" },
  { value: "natural", label: "Natural" },
  { value: "cultural", label: "Cultural" },
  { value: "event", label: "Event" },
  { value: "festival", label: "Festival" }
]

export default function MediaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { selectedMedia: media, loading, error, success } = useSelector((state) => state.media)

  const [edit, setEdit] = useState(false)
  const [formData, setFormData] = useState({})
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchMediaById(params.id))
    }
  }, [dispatch, params.id])

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || "",
        description: media.description || "",
        category: media.category || "",
        photographer: media.photographer || "",
        tags: media.tags?.join(", ") || "",
        captureDate: media.captureDate ? new Date(media.captureDate).toISOString().split('T')[0] : "",
      })
    }
  }, [media])

  useEffect(() => {
    if (error) {
      toast.error(error?.message || "An error occurred")
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    if (success) {
      toast.success("Action completed successfully")
      dispatch(clearSuccess())
      setEdit(false)
      if (params.id) {
        dispatch(fetchMediaById(params.id))
      }
    }
  }, [success, dispatch, params.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }
      await dispatch(updateMedia({ id: params.id, mediaData: updateData })).unwrap()
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    try {
      await dispatch(approveMedia(params.id)).unwrap()
      toast.success("Media approved successfully")
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    try {
      await dispatch(rejectMedia({ id: params.id, reason: rejectReason })).unwrap()
      setOpenRejectDialog(false)
      setRejectReason("")
      toast.success("Media rejected successfully")
    } catch (error) {
      console.error('Rejection failed:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={20} color="#10b981" />
      case "rejected":
        return <XCircle size={20} color="#ef4444" />
      default:
        return <Clock size={20} color="#f59e0b" />
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader />
      </Box>
    )
  }

  if (!media) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Media not found
          </Typography>
          <Link href="/admin/media" style={{ textDecoration: 'none' }}>
            <Button sx={{ mt: 2 }}>
              Back to Media
            </Button>
          </Link>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              Media Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and review media content
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {media.status === "pending" && (
            <>
              <Button
                startIcon={<CheckCircle size={18} />}
                onClick={handleApprove}
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' }
                }}
              >
                Approve
              </Button>
              <Button
                startIcon={<XCircle size={18} />}
                onClick={() => setOpenRejectDialog(true)}
                sx={{
                  backgroundColor: '#ef4444',
                  '&:hover': { backgroundColor: '#dc2626' }
                }}
              >
                Reject
              </Button>
            </>
          )}
          {!edit ? (
            <Button
              startIcon={<Edit size={18} />}
              onClick={() => setEdit(true)}
              sx={{
                backgroundColor: '#144ae9',
                '&:hover': { backgroundColor: '#0d3ec7' }
              }}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                startIcon={saving ? <Loader /> : <Save size={18} />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' }
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                startIcon={<X size={18} />}
                onClick={() => setEdit(false)}
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
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* MEDIA PREVIEW */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ border: '1px solid #144ae920', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', backgroundColor: '#144ae905' }}>
              {media.fileType === "video" ? (
                <video
                  src={media.fileUrl}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <img
                  src={media.fileUrl}
                  alt={media.title}
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain'
                  }}
                />
              )}
              
              {/* BADGES OVERLAY */}
              <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  icon={media.fileType === "video" ? <Video size={14} /> : <ImageIcon size={14} />}
                  label={media.fileType}
                  size="small"
                  sx={{
                    backgroundColor: media.fileType === 'video' ? '#ef4444' : '#3b82f6',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={getStatusIcon(media.status)}
                  label={media.status}
                  size="small"
                  sx={{
                    ...getStatusColor(media.status),
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* CATEGORY BADGE */}
              <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Chip
                  label={media.category}
                  size="small"
                  sx={{
                    ...getCategoryColor(media.category),
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* SIDEBAR INFO */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* QUICK INFO */}
            <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Info
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User size={18} color="#144ae9" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Uploaded By
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {media.uploadedBy?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Calendar size={18} color="#144ae9" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Upload Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(media.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {media.captureDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Calendar size={18} color="#144ae9" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Capture Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(media.captureDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {(media.district || media.gramPanchayat) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MapPin size={18} color="#144ae9" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {media.gramPanchayat?.name 
                          ? `${media.gramPanchayat.name}, ${media.district?.name}`
                          : media.district?.name || 'N/A'
                        }
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>

            {/* TAGS */}
            {media.tags && media.tags.length > 0 && (
              <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Tag size={18} color="#144ae9" />
                  <Typography variant="h6" fontWeight="bold">
                    Tags
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {media.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: '#144ae910',
                        color: '#144ae9',
                        border: '1px solid #144ae920',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Card>
            )}
          </Box>
        </Grid>

        {/* MEDIA INFORMATION FORM */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {edit ? "Edit Media Information" : "Media Information"}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!edit}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!edit}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={CATEGORIES}
                  disabled={!edit}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Photographer"
                  value={formData.photographer || ""}
                  onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  disabled={!edit}
                  startIcon={<User size={20} color="#144ae9" />}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MuiTextField
                  label="Capture Date"
                  type="date"
                  value={formData.captureDate || ""}
                  onChange={(e) => setFormData({ ...formData, captureDate: e.target.value })}
                  disabled={!edit}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tags (comma separated)"
                  value={formData.tags || ""}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  disabled={!edit}
                  startIcon={<Tag size={20} color="#144ae9" />}
                  fullWidth
                  helperText="Separate tags with commas"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* REJECT DIALOG */}
      <Dialog 
        open={openRejectDialog} 
        onClose={() => setOpenRejectDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Reject Media
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this media:
          </Typography>
          <MuiTextField
            fullWidth
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={4}
            placeholder="Enter the reason for rejection..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenRejectDialog(false)}
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
            onClick={handleReject}
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            Reject Media
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

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
//             <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setEdit(true)}>
//               Edit
//             </Button>
//           )}
//           {edit && (
//             <>
//               <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
//                 {saving ? "Saving..." : "Save"}
//               </Button>
//               <Button variant="outlined" size="small" startIcon={<CloseIcon />} onClick={() => setEdit(false)}>
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
