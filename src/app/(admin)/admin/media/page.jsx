"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
import Link from "next/link"
import { 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  Image as ImageIcon, 
  Video,
  Search,
  Filter,
  Play,
  AlertTriangle
} from "lucide-react"
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  IconButton
} from '@mui/material'
import { toast } from "react-toastify"
import Loader from "@/components/ui/Loader"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "heritage", label: "Heritage" },
  { value: "natural", label: "Natural" },
  { value: "cultural", label: "Cultural" },
  { value: "event", label: "Event" },
  { value: "festival", label: "Festival" }
]

const FILE_TYPES = [
  { value: "", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" }
]

const STATUSES = [
  { value: "", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" }
]

export default function MediaPage() {
  const dispatch = useDispatch()
  const { media, loading, error, success, totalMedia, stats } = useSelector(
    (state) => state.media,
  )

  // Temporary filters (not applied yet)
  const [tempFilters, setTempFilters] = useState({
    category: "",
    fileType: "",
    status: "",
    search: "",
  })

  // Applied filters (used for fetching)
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    fileType: "",
    status: "",
    search: "",
  })

  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate pending media count from the actual media array
  const pendingMediaCount = useMemo(() => {
    return media.filter(item => item.status === "pending").length
  }, [media])

  // Fetch ALL media (including pending) when component mounts and when appliedFilters change
  useEffect(() => {
    // Build params - only include non-empty values
    const params = { admin: 'true' } // Add admin parameter to fetch all media
    
    if (appliedFilters.category) params.category = appliedFilters.category
    if (appliedFilters.fileType) params.fileType = appliedFilters.fileType
    if (appliedFilters.status) params.status = appliedFilters.status
    if (appliedFilters.search) params.search = appliedFilters.search
    
    dispatch(fetchMedia(params))
  }, [dispatch, appliedFilters])

  useEffect(() => {
    if (error) {
      toast.error(error?.message || "An error occurred")
      dispatch(clearError())
      setIsDeleting(false)
    }
  }, [error, dispatch])

  useEffect(() => {
    if (success) {
      toast.success("Action completed successfully")
      dispatch(clearSuccess())
      setIsDeleting(false)
    }
  }, [success, dispatch])

  const handleDelete = useCallback(async (id) => {
    try {
      setIsDeleting(true)
      await dispatch(deleteMedia(id)).unwrap()
      setDeleteConfirm(null)
    } catch (err) {
      console.error(err)
      setIsDeleting(false)
    }
  }, [dispatch])

  // Apply filters when user clicks Apply button
  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...tempFilters })
  }, [tempFilters])

  // Reset both temp and applied filters
  const handleReset = useCallback(() => {
    const resetFilters = {
      category: "",
      fileType: "",
      status: "",
      search: "",
    }
    setTempFilters(resetFilters)
    setAppliedFilters(resetFilters)
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "pending":
        return "bg-blue-500" // Changed to blue to match your theme
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }, [])

  const getCategoryColor = useCallback((category) => {
    switch (category) {
      case "heritage":
        return "bg-purple-500"
      case "natural":
        return "bg-green-500"
      case "cultural":
        return "bg-yellow-500"
      case "event":
        return "bg-red-500"
      case "festival":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }, [])

  if (loading && !media.length) {
    return <div className="fixed inset-0 z-[9999]">
          <Loader message={"Loading media..."} />
        </div>
  }

  return (
    <>
      {/* Delete Loader */}
      {isDeleting && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Deleting..."} />
        </div>
      )}
      
      <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
        {/* HEADER */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2, 
          mb: { xs: 3, sm: 4 } 
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <ImageIcon size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                Media Gallery ({totalMedia || 0})
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Manage all photos and videos
            </Typography>
          </Box>
          <Link href="/admin/media/upload" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
            <Button
              startIcon={<Plus size={18} />}
              fullWidth
              disabled={isDeleting}
              sx={{
                backgroundColor: '#144ae9',
                color: 'white',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                '&:hover': {
                  backgroundColor: '#0d3ec7'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#144ae950',
                  color: 'white'
                }
              }}
            >
              Upload Media
            </Button>
          </Link>
        </Box>

        {/* PENDING MEDIA ALERT - Show immediately if there are pending items */}
        {pendingMediaCount > 0 && (
          <Card sx={{ 
            p: { xs: 2, sm: 3 }, 
            border: '2px solid #144ae9',
            backgroundColor: '#144ae910',
            mb: { xs: 3, sm: 4 },
            boxShadow: '0 4px 6px -1px rgba(20, 74, 233, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <AlertTriangle size={24} color="#144ae9" />
                <Box>
                  <Typography variant="h6" fontWeight={600} color="#144ae9" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    Pending Media Awaiting Approval
                  </Typography>
                  <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, opacity: 0.9 }}>
                    You have {pendingMediaCount} media item{pendingMediaCount !== 1 ? 's' : ''} waiting for review and approval.
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={() => {
                  setTempFilters(prev => ({ ...prev, status: "pending" }))
                  setAppliedFilters(prev => ({ ...prev, status: "pending" }))
                }}
                sx={{
                  backgroundColor: '#144ae9',
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#0d3ec7'
                  }
                }}
              >
                Review Pending Media
              </Button>
            </Box>
          </Card>
        )}

        {/* STATS */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ 
              p: { xs: 2, sm: 3 }, 
              border: '1px solid #144ae920',
              backgroundColor: '#144ae905'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  backgroundColor: '#144ae910',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats?.images || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Images
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ 
              p: { xs: 2, sm: 3 }, 
              border: '1px solid #144ae920',
              backgroundColor: '#144ae905'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  backgroundColor: '#144ae910',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Video size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats?.videos || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Videos
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ 
              p: { xs: 2, sm: 3 }, 
              border: '1px solid #144ae920',
              backgroundColor: '#144ae905'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  backgroundColor: '#144ae910',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {pendingMediaCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Pending
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ 
              p: { xs: 2, sm: 3 }, 
              border: '1px solid #144ae920',
              backgroundColor: '#144ae905'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  width: { xs: 40, sm: 48 }, 
                  height: { xs: 40, sm: 48 }, 
                  borderRadius: 2, 
                  backgroundColor: '#144ae910',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {totalMedia || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Media
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* FILTERS */}
        <Card sx={{ 
          p: { xs: 2, sm: 3 }, 
          border: '1px solid #144ae920', 
          mb: { xs: 3, sm: 4 } 
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 2 }, 
            alignItems: 'stretch', 
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap'
          }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
              <TextField
                label="Search"
                value={tempFilters.search}
                onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title..."
                startIcon={<Search size={18} color="#144ae9" />}
                fullWidth
                disabled={isDeleting}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    height: { xs: '44px', sm: '56px' },
                    '&.Mui-disabled': {
                      backgroundColor: '#f9fafb'
                    }
                  } 
                }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
              <SelectField
                label="Category"
                value={tempFilters.category}
                onChange={(e) => setTempFilters({ ...tempFilters, category: e.target.value })}
                options={CATEGORIES}
                fullWidth
                disabled={isDeleting}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    height: { xs: '44px', sm: '56px' },
                    '&.Mui-disabled': {
                      backgroundColor: '#f9fafb'
                    }
                  } 
                }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
              <SelectField
                label="Type"
                value={tempFilters.fileType}
                onChange={(e) => setTempFilters({ ...tempFilters, fileType: e.target.value })}
                options={FILE_TYPES}
                fullWidth
                disabled={isDeleting}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    height: { xs: '44px', sm: '56px' },
                    '&.Mui-disabled': {
                      backgroundColor: '#f9fafb'
                    }
                  } 
                }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
              <SelectField
                label="Status"
                value={tempFilters.status}
                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                options={STATUSES}
                fullWidth
                disabled={isDeleting}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    height: { xs: '44px', sm: '56px' },
                    '&.Mui-disabled': {
                      backgroundColor: '#f9fafb'
                    }
                  } 
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                onClick={handleSearch}
                disabled={loading || isDeleting}
                startIcon={<Filter size={16} />}
                sx={{
                  backgroundColor: '#144ae9',
                  color: 'white',
                  height: { xs: '44px', sm: '56px' },
                  minWidth: { xs: '0', sm: '100px' },
                  flex: { xs: 1, sm: 'unset' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': { backgroundColor: '#0d3ec7' },
                  '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isDeleting}
                sx={{
                  borderColor: '#144ae9',
                  color: '#144ae9',
                  height: { xs: '44px', sm: '56px' },
                  minWidth: { xs: '0', sm: '100px' },
                  flex: { xs: 1, sm: 'unset' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' },
                  '&.Mui-disabled': { borderColor: '#144ae950', color: '#144ae950' }
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Card>

        {/* MEDIA GRID */}
        <Card sx={{ border: '1px solid #144ae920' }}>
          {media.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
              <ImageIcon size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                No media found
              </Typography>
            </Box>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {media.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg border border-blue-100 shadow-sm hover:border-blue-300 transition-all duration-200 ease-in-out overflow-hidden max-w-[350px] mx-auto w-full"
                >
                  {/* Media Container */}
                  <div className="relative h-40 sm:h-48 bg-blue-50 group">
                    {item.fileType === "video" ? (
                      <>
                        <video
                          src={item.fileUrl}
                          className="w-full h-full object-cover"
                        />
                        {/* Play Icon Overlay for Video */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200">
                          <div className="rounded-full p-3 border-2 border-white transition-transform group-hover:scale-110">
                            <Play size={26} className="text-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.thumbnailUrl || item.fileUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "/placeholder.svg" }}
                      />
                    )}
                    
                    {/* Status Badge - Show only if pending or rejected */}
                    {item.status !== "approved" && (
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    )}
                    
                    {/* Category Chip */}
                    {item.category && (
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getCategoryColor(item.category)}`}
                        >
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-3 sm:p-4">

                    {/* Title */}
                    <h3 
                      className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base"
                    >
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    {item.description && (
                      <p 
                        className="text-gray-600 mb-3 line-clamp-2 text-xs sm:text-sm"
                      >
                        {item.description}
                      </p>
                    )}

                    {/* Location */}
                    {(item.district?.name || item.gramPanchayat?.name) && (
                      <div className="mb-3">
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {item.gramPanchayat?.name 
                            ? `${item.gramPanchayat.name}, ${item.district?.name}`
                            : item.district?.name
                          }
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                      {/* VIEW BUTTON */}
                      <a
                        href={`/admin/media/${item._id}`}
                        className="flex-1 min-w-0 no-underline"
                      >
                        <button
                          disabled={isDeleting}
                          className="w-full bg-blue-50 text-blue-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </a>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => setDeleteConfirm(item._id)}
                        disabled={isDeleting}
                        className="flex-1 min-w-0 bg-red-50 text-red-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}      
            </div>
          )}
        </Card>

        {/* DELETE CONFIRMATION */}
        <ConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
          title="Delete Media"
          message="Are you sure you want to delete this media? This action cannot be undone."
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          confirmColor="error"
          disabled={isDeleting}
          icon={<Trash2 size={24} color="#144ae9" />}
        />
      </Box>
    </>
  )
}

// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
// import Link from "next/link"
// import { 
//   Plus, 
//   Trash2, 
//   Eye, 
//   Edit, 
//   Image as ImageIcon, 
//   Video,
//   Search,
//   Filter,
//   Play
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material'
// import { toast } from "react-toastify"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// const FILE_TYPES = [
//   { value: "", label: "All Types" },
//   { value: "image", label: "Images" },
//   { value: "video", label: "Videos" }
// ]

// const STATUSES = [
//   { value: "", label: "All Status" },
//   { value: "approved", label: "Approved" },
//   { value: "pending", label: "Pending" },
//   { value: "rejected", label: "Rejected" }
// ]

// export default function MediaPage() {
//   const dispatch = useDispatch()
//   const { media, loading, error, success, totalMedia, stats } = useSelector(
//     (state) => state.media,
//   )

//   // Temporary filters (not applied yet)
//   const [tempFilters, setTempFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "",
//     search: "",
//   })

//   // Applied filters (used for fetching)
//   const [appliedFilters, setAppliedFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "",
//     search: "",
//   })

//   const [deleteConfirm, setDeleteConfirm] = useState(null)
//   const [isDeleting, setIsDeleting] = useState(false)

//   // Fetch media only when appliedFilters change
//   useEffect(() => {
//     // Build params - only include non-empty values
//     const params = {}
//     if (appliedFilters.category) params.category = appliedFilters.category
//     if (appliedFilters.fileType) params.fileType = appliedFilters.fileType
//     if (appliedFilters.status) params.status = appliedFilters.status
//     if (appliedFilters.search) params.search = appliedFilters.search
    
//     dispatch(fetchMedia(params))
//   }, [dispatch, appliedFilters])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//       setIsDeleting(false)
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setIsDeleting(false)
//     }
//   }, [success, dispatch])

//   const handleDelete = useCallback(async (id) => {
//     try {
//       setIsDeleting(true)
//       await dispatch(deleteMedia(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//       setIsDeleting(false)
//     }
//   }, [dispatch])

//   // Apply filters when user clicks Apply button
//   const handleSearch = useCallback(() => {
//     setAppliedFilters({ ...tempFilters })
//   }, [tempFilters])

//   // Reset both temp and applied filters
//   const handleReset = useCallback(() => {
//     const resetFilters = {
//       category: "",
//       fileType: "",
//       status: "",
//       search: "",
//     }
//     setTempFilters(resetFilters)
//     setAppliedFilters(resetFilters)
//   }, [])

//   const getStatusColor = useCallback((status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   const getCategoryColor = useCallback((category) => {
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

//   if (loading && !media.length) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading media..."} />
//         </div>
//   }

//   return (
//     <>
//       {/* Delete Loader */}
//       {isDeleting && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Deleting..."} />
//         </div>
//       )}
      
//       <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//         {/* HEADER */}
//         <Box sx={{ 
//           display: 'flex', 
//           flexDirection: { xs: 'column', sm: 'row' }, 
//           justifyContent: 'space-between', 
//           alignItems: { xs: 'flex-start', sm: 'center' }, 
//           gap: 2, 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//               <ImageIcon size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//               <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                 Media Gallery ({totalMedia || 0})
//               </Typography>
//             </Box>
//             <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//               Manage all photos and videos
//             </Typography>
//           </Box>
//           <Link href="/admin/media/upload" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               disabled={isDeleting}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7'
//                 },
//                 '&.Mui-disabled': {
//                   backgroundColor: '#144ae950',
//                   color: 'white'
//                 }
//               }}
//             >
//               Upload Media
//             </Button>
//           </Link>
//         </Box>

//         {/* STATS */}
//         {stats && (
//           <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.images || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Images
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Video size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.videos || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Videos
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {totalMedia || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Total Media
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         )}

//         {/* FILTERS */}
//         <Card sx={{ 
//           p: { xs: 2, sm: 3 }, 
//           border: '1px solid #144ae920', 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box sx={{ 
//             display: 'flex', 
//             gap: { xs: 1.5, sm: 2 }, 
//             alignItems: 'stretch', 
//             flexDirection: { xs: 'column', sm: 'row' },
//             flexWrap: 'wrap'
//           }}>
//             <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//               <TextField
//                 label="Search"
//                 value={tempFilters.search}
//                 onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 placeholder="Search by title..."
//                 startIcon={<Search size={18} color="#144ae9" />}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
//               <SelectField
//                 label="Category"
//                 value={tempFilters.category}
//                 onChange={(e) => setTempFilters({ ...tempFilters, category: e.target.value })}
//                 options={CATEGORIES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Type"
//                 value={tempFilters.fileType}
//                 onChange={(e) => setTempFilters({ ...tempFilters, fileType: e.target.value })}
//                 options={FILE_TYPES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Status"
//                 value={tempFilters.status}
//                 onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
//                 options={STATUSES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading || isDeleting}
//                 startIcon={<Filter size={16} />}
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#0d3ec7' },
//                   '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//                 }}
//               >
//                 Apply
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 disabled={isDeleting}
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' },
//                   '&.Mui-disabled': { borderColor: '#144ae950', color: '#144ae950' }
//                 }}
//               >
//                 Reset
//               </Button>
//             </Box>
//           </Box>
//         </Card>

//         {/* MEDIA GRID */}
//         <Card sx={{ border: '1px solid #144ae920' }}>
//           {media.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//               <ImageIcon size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//               <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//                 No media found
//               </Typography>
//             </Box>
//           ) : (
// //             <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
// //               {media.map((item) => (
// //                 <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
// //                   <Card 
// //                     sx={{ 
// //                       maxWidth:350,
// //                       border: '1px solid #144ae920',
// //                       transition: 'all 0.2s',
// //                       '&:hover': {
// //                         boxShadow: 4,
// //                         borderColor: '#144ae9'
// //                       }
// //                     }}
// //                   >
// //                     <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae905' }}>
// //                       {item.fileType === "video" ? (
// //                         <video
// //                           src={item.fileUrl}
// //                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
// //                         />
// //                       ) : (
// //                         <img
// //                           src={item.thumbnailUrl || item.fileUrl}
// //                           alt={item.title}
// //                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
// //                           onError={(e) => { e.target.src = "/placeholder.svg" }}
// //                         />
// //                       )}
                      
// //                       <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                         <Chip
// //                           label={item.fileType}
// //                           size="small"
// //                           sx={{
// //                             backgroundColor: item.fileType === 'video' ? '#ef4444' : '#3b82f6',
// //                             color: 'white',
// //                             fontWeight: 600,
// //                             fontSize: '0.65rem'
// //                           }}
// //                         />
// //                         <Chip
// //                           label={item.status}
// //                           size="small"
// //                           sx={{
// //                             ...getStatusColor(item.status),
// //                             fontWeight: 600,
// //                             fontSize: '0.65rem'
// //                           }}
// //                         />
// //                       </Box>

// //                       <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
// //                         <Chip
// //                           label={item.category}
// //                           size="small"
// //                           sx={{
// //                             ...getCategoryColor(item.category),
// //                             fontWeight: 600,
// //                             fontSize: '0.65rem'
// //                           }}
// //                         />
// //                       </Box>
// //                     </Box>

// //                     <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
// //                       <Typography 
// //                         variant="body1" 
// //                         fontWeight={600} 
// //                         color="text.primary" 
// //                         gutterBottom
// //                         sx={{ 
// //                           overflow: 'hidden',
// //                           textOverflow: 'ellipsis',
// //                           display: '-webkit-box',
// //                           WebkitLineClamp: 2,
// //                           WebkitBoxOrient: 'vertical',
// //                           fontSize: { xs: '0.9rem', sm: '1rem' }
// //                         }}
// //                       >
// //                         {item.title}
// //                       </Typography>
                      
// //                       {item.description && (
// //                         <Typography 
// //                           variant="body2" 
// //                           color="text.secondary" 
// //                           sx={{ 
// //                             mb: 2,
// //                             overflow: 'hidden',
// //                             textOverflow: 'ellipsis',
// //                             display: '-webkit-box',
// //                             WebkitLineClamp: 2,
// //                             WebkitBoxOrient: 'vertical',
// //                             fontSize: { xs: '0.75rem', sm: '0.875rem' }
// //                           }}
// //                         >
// //                           {item.description}
// //                         </Typography>
// //                       )}

// //                       {(item.district?.name || item.gramPanchayat?.name) && (
// //                         <Box sx={{ mb: 2 }}>
// //                           <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
// //                             {item.gramPanchayat?.name 
// //                               ? `${item.gramPanchayat.name}, ${item.district?.name}`
// //                               : item.district?.name
// //                             }
// //                           </Typography>
// //                         </Box>
// //                       )}

// //                    <Box sx={{ display: 'flex', gap: 1 }}>
// //   {/* VIEW BUTTON */}
// //   <Link
// //     href={`/admin/media/${item._id}`}
// //     style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
// //   >
// //     <Button
// //       fullWidth
// //       disabled={isDeleting}
// //       startIcon={<Eye size={14} />}
// //       sx={{
// //         backgroundColor: '#144ae910',
// //         color: '#144ae9',
// //         fontSize: { xs: '0.7rem', sm: '0.875rem' },
// //         py: { xs: 0.75, sm: 1 },
// //         '&:hover': { backgroundColor: '#144ae920' },
// //         '&.Mui-disabled': {
// //           backgroundColor: '#144ae905',
// //           color: '#144ae950'
// //         }
// //       }}
// //     >
// //       View
// //     </Button>
// //   </Link>

// //   {/* DELETE BUTTON (50%) */}
// //   <Button
// //     fullWidth
// //     onClick={() => setDeleteConfirm(item._id)}
// //     disabled={isDeleting}
// //     startIcon={<Trash2 size={14} />}
// //     sx={{
// //       flex: 1,
// //       minWidth: 0,
// //       backgroundColor: '#d32f2f10',
// //       color: '#d32f2f',
// //       fontSize: { xs: '0.7rem', sm: '0.875rem' },
// //       py: { xs: 0.75, sm: 1 },
// //       '&:hover': { backgroundColor: '#d32f2f20' },
// //       '&.Mui-disabled': {
// //         backgroundColor: '#d32f2f05',
// //         color: '#d32f2f50'
// //       }
// //     }}
// //   >
// //     Delete
// //   </Button>
// // </Box>

// //                     </Box>
// //                   </Card>
// //                 </Grid>
// //               ))}
// //             </Grid>
// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
//   {media.map((item) => (
//     <div
//       key={item._id}
//       className="bg-white rounded-lg border border-blue-100 shadow-sm hover:border-blue-300 transition-all duration-200 ease-in-out overflow-hidden max-w-[350px] mx-auto w-full"
//     >
//       {/* Media Container */}
//       <div className="relative h-40 sm:h-48 bg-blue-50 group">
//         {item.fileType === "video" ? (
//           <>
//             <video
//               src={item.fileUrl}
//               className="w-full h-full object-cover"
//             />
//             {/* Play Icon Overlay for Video */}
//             <div className="absolute inset-0 bg-black/30 flex items-center justify-center  transition-opacity duration-200">
//               <div className="rounded-full p-3 border-2 border-white transition-transform group-hover:scale-110">
//                 <Play size={26} className="text-white" />
//               </div>
//             </div>
//           </>
//         ) : (
//           <img
//             src={item.thumbnailUrl || item.fileUrl}
//             alt={item.title}
//             className="w-full h-full object-cover"
//             onError={(e) => { e.target.src = "/placeholder.svg" }}
//           />
//         )}
        
//         {/* Only show category chip (removed file type and status chips) */}
//         {item.category && (
//           <div className="absolute top-2 right-2">
//             <span
//               className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
//                 item.category === 'news' ? 'bg-purple-500' :
//                 item.category === 'event' ? 'bg-orange-500' :
//                 item.category === 'document' ? 'bg-indigo-500' :
//                 item.category === 'gallery' ? 'bg-pink-500' : 'bg-gray-500'
//               }`}
//             >
//               {item.category}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Content Section */}
//       <div className="p-3 sm:p-4">

//         {/* Title */}
//         <h3 
//           className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base"
//         >
//           {item.title}
//         </h3>
        
//         {/* Description */}
//         {item.description && (
//           <p 
//             className="text-gray-600 mb-3 line-clamp-2 text-xs sm:text-sm"
//           >
//             {item.description}
//           </p>
//         )}

//         {/* Location */}
//         {(item.district?.name || item.gramPanchayat?.name) && (
//           <div className="mb-3">
//             <p className="text-gray-500 text-xs sm:text-sm">
//               {item.gramPanchayat?.name 
//                 ? `${item.gramPanchayat.name}, ${item.district?.name}`
//                 : item.district?.name
//               }
//             </p>
//           </div>
//         )}

//         {/* Buttons */}
//         <div className="flex gap-2">
//           {/* VIEW BUTTON */}
//           <a
//             href={`/admin/media/${item._id}`}
//             className="flex-1 min-w-0 no-underline"
//           >
//             <button
//               disabled={isDeleting}
//               className="w-full bg-blue-50 text-blue-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Eye size={14} />
//               View
//             </button>
//           </a>

//           {/* DELETE BUTTON */}
//           <button
//             onClick={() => setDeleteConfirm(item._id)}
//             disabled={isDeleting}
//             className="flex-1 min-w-0 bg-red-50 text-red-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Trash2 size={14} />
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   ))}      
// </div>
//           )}
//         </Card>

//         {/* DELETE CONFIRMATION */}
//         <ConfirmDialog
//           open={!!deleteConfirm}
//           onClose={() => setDeleteConfirm(null)}
//           onConfirm={() => handleDelete(deleteConfirm)}
//           title="Delete Media"
//           message="Are you sure you want to delete this media? This action cannot be undone."
//           confirmText={isDeleting ? "Deleting..." : "Delete"}
//           cancelText="Cancel"
//           confirmColor="error"
//           disabled={isDeleting}
//           icon={<Trash2 size={24} color="#144ae9" />}
//         />
//       </Box>
//     </>
//   )
// }

// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
// import Link from "next/link"
// import { 
//   Plus, 
//   Trash2, 
//   Eye, 
//   Edit, 
//   Image as ImageIcon, 
//   Video,
//   Search,
//   Filter
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material'
// import { toast } from "react-toastify"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// const FILE_TYPES = [
//   { value: "", label: "All Types" },
//   { value: "image", label: "Image" },
//   { value: "video", label: "Video" }
// ]

// const STATUSES = [
//   { value: "", label: "All Status" },
//   { value: "approved", label: "Approved" },
//   { value: "pending", label: "Pending" },
//   { value: "rejected", label: "Rejected" }
// ]

// export default function MediaPage() {
//   const dispatch = useDispatch()
//   const { media, loading, error, success, totalMedia, stats } = useSelector(
//     (state) => state.media,
//   )

//   // Temporary filters (not applied yet)
//   const [tempFilters, setTempFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "",
//     search: "",
//   })

//   // Applied filters (used for fetching)
//   const [appliedFilters, setAppliedFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "",
//     search: "",
//   })

//   const [deleteConfirm, setDeleteConfirm] = useState(null)
//   const [isDeleting, setIsDeleting] = useState(false)

//   // Fetch media only when appliedFilters change
//   useEffect(() => {
//     const params = Object.fromEntries(
//       Object.entries(appliedFilters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [dispatch, appliedFilters])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//       setIsDeleting(false)
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setIsDeleting(false)
//     }
//   }, [success, dispatch])

//   const handleDelete = useCallback(async (id) => {
//     try {
//       setIsDeleting(true)
//       await dispatch(deleteMedia(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//       setIsDeleting(false)
//     }
//   }, [dispatch])

//   // Apply filters when user clicks Apply button
//   const handleSearch = useCallback(() => {
//     setAppliedFilters({ ...tempFilters })
//   }, [tempFilters])

//   // Reset both temp and applied filters
//   const handleReset = useCallback(() => {
//     const resetFilters = {
//       category: "",
//       fileType: "",
//       status: "",
//       search: "",
//     }
//     setTempFilters(resetFilters)
//     setAppliedFilters(resetFilters)
//   }, [])

//   const getStatusColor = useCallback((status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   const getCategoryColor = useCallback((category) => {
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

//   if (loading && !media.length) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading media..."} />
//         </div>
//   }

//   return (
//     <>
//       {/* Delete Loader */}
//       {isDeleting && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Deleting..."} />
//         </div>
//       )}
      
//       <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//         {/* HEADER */}
//         <Box sx={{ 
//           display: 'flex', 
//           flexDirection: { xs: 'column', sm: 'row' }, 
//           justifyContent: 'space-between', 
//           alignItems: { xs: 'flex-start', sm: 'center' }, 
//           gap: 2, 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//               <ImageIcon size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//               <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                 Media Gallery ({totalMedia || 0})
//               </Typography>
//             </Box>
//             <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//               Manage all photos and videos
//             </Typography>
//           </Box>
//           <Link href="/admin/media/upload" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               disabled={isDeleting}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7'
//                 },
//                 '&.Mui-disabled': {
//                   backgroundColor: '#144ae950',
//                   color: 'white'
//                 }
//               }}
//             >
//               Upload Media
//             </Button>
//           </Link>
//         </Box>

//         {/* STATS */}
//         {stats && (
//           <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.images || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Images
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Video size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.videos || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Videos
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {totalMedia || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Total Media
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         )}

//         {/* FILTERS */}
//         <Card sx={{ 
//           p: { xs: 2, sm: 3 }, 
//           border: '1px solid #144ae920', 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box sx={{ 
//             display: 'flex', 
//             gap: { xs: 1.5, sm: 2 }, 
//             alignItems: 'stretch', 
//             flexDirection: { xs: 'column', sm: 'row' },
//             flexWrap: 'wrap'
//           }}>
//             <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//               <TextField
//                 label="Search"
//                 value={tempFilters.search}
//                 onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 placeholder="Search by title..."
//                 startIcon={<Search size={18} color="#144ae9" />}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
//               <SelectField
//                 label="Category"
//                 value={tempFilters.category}
//                 onChange={(e) => setTempFilters({ ...tempFilters, category: e.target.value })}
//                 options={CATEGORIES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Type"
//                 value={tempFilters.fileType}
//                 onChange={(e) => setTempFilters({ ...tempFilters, fileType: e.target.value })}
//                 options={FILE_TYPES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Status"
//                 value={tempFilters.status}
//                 onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
//                 options={STATUSES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading || isDeleting}
//                 startIcon={<Filter size={16} />}
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#0d3ec7' },
//                   '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//                 }}
//               >
//                 Apply
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 disabled={isDeleting}
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' },
//                   '&.Mui-disabled': { borderColor: '#144ae950', color: '#144ae950' }
//                 }}
//               >
//                 Reset
//               </Button>
//             </Box>
//           </Box>
//         </Card>

//         {/* MEDIA GRID */}
//         <Card sx={{ border: '1px solid #144ae920' }}>
//           {media.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//               <ImageIcon size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//               <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//                 No media found
//               </Typography>
//             </Box>
//           ) : (
//             <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//               {media.map((item) => (
//                 <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
//                   <Card 
//                     sx={{ 
//                       maxWidth:350,
//                       border: '1px solid #144ae920',
//                       transition: 'all 0.2s',
//                       '&:hover': {
//                         boxShadow: 4,
//                         borderColor: '#144ae9'
//                       }
//                     }}
//                   >
//                     <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae905' }}>
//                       {item.fileType === "video" ? (
//                         <video
//                           src={item.fileUrl}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         />
//                       ) : (
//                         <img
//                           src={item.thumbnailUrl || item.fileUrl}
//                           alt={item.title}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                           onError={(e) => { e.target.src = "/placeholder.svg" }}
//                         />
//                       )}
                      
//                       <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Chip
//                           label={item.fileType}
//                           size="small"
//                           sx={{
//                             backgroundColor: item.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                             color: 'white',
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                         <Chip
//                           label={item.status}
//                           size="small"
//                           sx={{
//                             ...getStatusColor(item.status),
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                       </Box>

//                       <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
//                         <Chip
//                           label={item.category}
//                           size="small"
//                           sx={{
//                             ...getCategoryColor(item.category),
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                       </Box>
//                     </Box>

//                     <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
//                       <Typography 
//                         variant="body1" 
//                         fontWeight={600} 
//                         color="text.primary" 
//                         gutterBottom
//                         sx={{ 
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis',
//                           display: '-webkit-box',
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: 'vertical',
//                           fontSize: { xs: '0.9rem', sm: '1rem' }
//                         }}
//                       >
//                         {item.title}
//                       </Typography>
                      
//                       {item.description && (
//                         <Typography 
//                           variant="body2" 
//                           color="text.secondary" 
//                           sx={{ 
//                             mb: 2,
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             display: '-webkit-box',
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: 'vertical',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' }
//                           }}
//                         >
//                           {item.description}
//                         </Typography>
//                       )}

//                       {(item.district?.name || item.gramPanchayat?.name) && (
//                         <Box sx={{ mb: 2 }}>
//                           <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                             {item.gramPanchayat?.name 
//                               ? `${item.gramPanchayat.name}, ${item.district?.name}`
//                               : item.district?.name
//                             }
//                           </Typography>
//                         </Box>
//                       )}

//                    <Box sx={{ display: 'flex', gap: 1 }}>
//   {/* VIEW BUTTON */}
//   <Link
//     href={`/admin/media/${item._id}`}
//     style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
//   >
//     <Button
//       fullWidth
//       disabled={isDeleting}
//       startIcon={<Eye size={14} />}
//       sx={{
//         backgroundColor: '#144ae910',
//         color: '#144ae9',
//         fontSize: { xs: '0.7rem', sm: '0.875rem' },
//         py: { xs: 0.75, sm: 1 },
//         '&:hover': { backgroundColor: '#144ae920' },
//         '&.Mui-disabled': {
//           backgroundColor: '#144ae905',
//           color: '#144ae950'
//         }
//       }}
//     >
//       View
//     </Button>
//   </Link>

//   {/* DELETE BUTTON (50%) */}
//   <Button
//     fullWidth
//     onClick={() => setDeleteConfirm(item._id)}
//     disabled={isDeleting}
//     startIcon={<Trash2 size={14} />}
//     sx={{
//       flex: 1,
//       minWidth: 0,
//       backgroundColor: '#d32f2f10',
//       color: '#d32f2f',
//       fontSize: { xs: '0.7rem', sm: '0.875rem' },
//       py: { xs: 0.75, sm: 1 },
//       '&:hover': { backgroundColor: '#d32f2f20' },
//       '&.Mui-disabled': {
//         backgroundColor: '#d32f2f05',
//         color: '#d32f2f50'
//       }
//     }}
//   >
//     Delete
//   </Button>
// </Box>

//                     </Box>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </Card>

//         {/* DELETE CONFIRMATION */}
//         <ConfirmDialog
//           open={!!deleteConfirm}
//           onClose={() => setDeleteConfirm(null)}
//           onConfirm={() => handleDelete(deleteConfirm)}
//           title="Delete Media"
//           message="Are you sure you want to delete this media? This action cannot be undone."
//           confirmText={isDeleting ? "Deleting..." : "Delete"}
//           cancelText="Cancel"
//           confirmColor="error"
//           disabled={isDeleting}
//           icon={<Trash2 size={24} color="#144ae9" />}
//         />
//       </Box>
//     </>
//   )
// }


// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
// import Link from "next/link"
// import { 
//   Plus, 
//   Trash2, 
//   Eye, 
//   Edit, 
//   Image as ImageIcon, 
//   Video,
//   Search,
//   Filter
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material'
// import { toast } from "react-toastify"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// const FILE_TYPES = [
//   { value: "", label: "All Types" },
//   { value: "image", label: "Image" },
//   { value: "video", label: "Video" }
// ]

// const STATUSES = [
//   { value: "approved", label: "Approved" },
//   { value: "pending", label: "Pending" },
//   { value: "rejected", label: "Rejected" }
// ]

// export default function MediaPage() {
//   const dispatch = useDispatch()
//   const { media, loading, error, success, totalMedia, stats } = useSelector(
//     (state) => state.media,
//   )

//   const [filters, setFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "approved",
//     search: "",
//   })
//   const [deleteConfirm, setDeleteConfirm] = useState(null)
//   const [isDeleting, setIsDeleting] = useState(false)

//   useEffect(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [dispatch, filters])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//       setIsDeleting(false)
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setIsDeleting(false)
//     }
//   }, [success, dispatch])

//   const handleDelete = useCallback(async (id) => {
//     try {
//       setIsDeleting(true)
//       await dispatch(deleteMedia(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//       setIsDeleting(false)
//     }
//   }, [dispatch])

//   const handleSearch = useCallback(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [filters, dispatch])

//   const handleReset = useCallback(() => {
//     setFilters({
//       category: "",
//       fileType: "",
//       status: "approved",
//       search: "",
//     })
//   }, [])

//   const getStatusColor = useCallback((status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   const getCategoryColor = useCallback((category) => {
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

//   if (loading && !media.length) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading media..."} />
//         </div>
//   }

//   return (
//     <>
//       {/* Delete Loader */}
//       {isDeleting && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Deleting..."} />
//         </div>
//       )}
      
//       <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//         {/* HEADER */}
//         <Box sx={{ 
//           display: 'flex', 
//           flexDirection: { xs: 'column', sm: 'row' }, 
//           justifyContent: 'space-between', 
//           alignItems: { xs: 'flex-start', sm: 'center' }, 
//           gap: 2, 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//               <ImageIcon size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//               <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                 Media Gallery ({totalMedia || 0})
//               </Typography>
//             </Box>
//             <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//               Manage all photos and videos
//             </Typography>
//           </Box>
//           <Link href="/admin/media/upload" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               disabled={isDeleting}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7'
//                 },
//                 '&.Mui-disabled': {
//                   backgroundColor: '#144ae950',
//                   color: 'white'
//                 }
//               }}
//             >
//               Upload Media
//             </Button>
//           </Link>
//         </Box>

//         {/* STATS */}
//         {stats && (
//           <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.images || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Images
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Video size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.videos || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Videos
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {totalMedia || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Total Media
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         )}

//         {/* FILTERS */}
//         <Card sx={{ 
//           p: { xs: 2, sm: 3 }, 
//           border: '1px solid #144ae920', 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box sx={{ 
//             display: 'flex', 
//             gap: { xs: 1.5, sm: 2 }, 
//             alignItems: 'stretch', 
//             flexDirection: { xs: 'column', sm: 'row' },
//             flexWrap: 'wrap'
//           }}>
//             <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//               <TextField
//                 label="Search"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 placeholder="Search by title..."
//                 startIcon={<Search size={18} color="#144ae9" />}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
//               <SelectField
//                 label="Category"
//                 value={filters.category}
//                 onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//                 options={CATEGORIES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Type"
//                 value={filters.fileType}
//                 onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
//                 options={FILE_TYPES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Status"
//                 value={filters.status}
//                 onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                 options={STATUSES}
//                 fullWidth
//                 disabled={isDeleting}
//                 sx={{ 
//                   '& .MuiInputBase-root': { 
//                     height: { xs: '44px', sm: '56px' },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#f9fafb'
//                     }
//                   } 
//                 }}
//               />
//             </Box>

//             <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading || isDeleting}
//                 startIcon={<Filter size={16} />}
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#0d3ec7' },
//                   '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//                 }}
//               >
//                 Apply
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 disabled={isDeleting}
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' },
//                   '&.Mui-disabled': { borderColor: '#144ae950', color: '#144ae950' }
//                 }}
//               >
//                 Reset
//               </Button>
//             </Box>
//           </Box>
//         </Card>

//         {/* MEDIA GRID */}
//         <Card sx={{ border: '1px solid #144ae920' }}>
//           {media.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//               <ImageIcon size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//               <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//                 No media found
//               </Typography>
//             </Box>
//           ) : (
//             <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//               {media.map((item) => (
//                 <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
//                   <Card 
//                     sx={{ 
//                       maxWidth:350,
//                       border: '1px solid #144ae920',
//                       transition: 'all 0.2s',
//                       '&:hover': {
//                         boxShadow: 4,
//                         borderColor: '#144ae9'
//                       }
//                     }}
//                   >
//                     <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae905' }}>
//                       {item.fileType === "video" ? (
//                         <video
//                           src={item.fileUrl}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         />
//                       ) : (
//                         <img
//                           src={item.thumbnailUrl || item.fileUrl}
//                           alt={item.title}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                           onError={(e) => { e.target.src = "/placeholder.svg" }}
//                         />
//                       )}
                      
//                       <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Chip
//                           label={item.fileType}
//                           size="small"
//                           sx={{
//                             backgroundColor: item.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                             color: 'white',
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                         <Chip
//                           label={item.status}
//                           size="small"
//                           sx={{
//                             ...getStatusColor(item.status),
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                       </Box>

//                       <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
//                         <Chip
//                           label={item.category}
//                           size="small"
//                           sx={{
//                             ...getCategoryColor(item.category),
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                       </Box>
//                     </Box>

//                     <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
//                       <Typography 
//                         variant="body1" 
//                         fontWeight={600} 
//                         color="text.primary" 
//                         gutterBottom
//                         sx={{ 
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis',
//                           display: '-webkit-box',
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: 'vertical',
//                           fontSize: { xs: '0.9rem', sm: '1rem' }
//                         }}
//                       >
//                         {item.title}
//                       </Typography>
                      
//                       {item.description && (
//                         <Typography 
//                           variant="body2" 
//                           color="text.secondary" 
//                           sx={{ 
//                             mb: 2,
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             display: '-webkit-box',
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: 'vertical',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' }
//                           }}
//                         >
//                           {item.description}
//                         </Typography>
//                       )}

//                       {(item.district?.name || item.gramPanchayat?.name) && (
//                         <Box sx={{ mb: 2 }}>
//                           <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                             {item.gramPanchayat?.name 
//                               ? `${item.gramPanchayat.name}, ${item.district?.name}`
//                               : item.district?.name
//                             }
//                           </Typography>
//                         </Box>
//                       )}

//                    <Box sx={{ display: 'flex', gap: 1 }}>
//   {/* VIEW BUTTON */}
//   <Link
//     href={`/admin/media/${item._id}`}
//     style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
//   >
//     <Button
//       fullWidth
//       disabled={isDeleting}
//       startIcon={<Eye size={14} />}
//       sx={{
//         backgroundColor: '#144ae910',
//         color: '#144ae9',
//         fontSize: { xs: '0.7rem', sm: '0.875rem' },
//         py: { xs: 0.75, sm: 1 },
//         '&:hover': { backgroundColor: '#144ae920' },
//         '&.Mui-disabled': {
//           backgroundColor: '#144ae905',
//           color: '#144ae950'
//         }
//       }}
//     >
//       View
//     </Button>
//   </Link>

//   {/* DELETE BUTTON (50%) */}
//   <Button
//     fullWidth
//     onClick={() => setDeleteConfirm(item._id)}
//     disabled={isDeleting}
//     startIcon={<Trash2 size={14} />}
//     sx={{
//       flex: 1,
//       minWidth: 0,
//       backgroundColor: '#d32f2f10',
//       color: '#d32f2f',
//       fontSize: { xs: '0.7rem', sm: '0.875rem' },
//       py: { xs: 0.75, sm: 1 },
//       '&:hover': { backgroundColor: '#d32f2f20' },
//       '&.Mui-disabled': {
//         backgroundColor: '#d32f2f05',
//         color: '#d32f2f50'
//       }
//     }}
//   >
//     Delete
//   </Button>
// </Box>

//                     </Box>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </Card>

//         {/* DELETE CONFIRMATION */}
//         <ConfirmDialog
//           open={!!deleteConfirm}
//           onClose={() => setDeleteConfirm(null)}
//           onConfirm={() => handleDelete(deleteConfirm)}
//           title="Delete Media"
//           message="Are you sure you want to delete this media? This action cannot be undone."
//           confirmText={isDeleting ? "Deleting..." : "Delete"}
//           cancelText="Cancel"
//           confirmColor="error"
//           disabled={isDeleting}
//           icon={<Trash2 size={24} color="#144ae9" />}
//         />
//       </Box>
//     </>
//   )
// }


// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
// import Link from "next/link"
// import { 
//   Plus, 
//   Trash2, 
//   Eye, 
//   Edit, 
//   Image as ImageIcon, 
//   Video,
//   Search,
//   Filter
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material'
// import { toast } from "react-toastify"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// const FILE_TYPES = [
//   { value: "", label: "All Types" },
//   { value: "image", label: "Image" },
//   { value: "video", label: "Video" }
// ]

// const STATUSES = [
//   { value: "approved", label: "Approved" },
//   { value: "pending", label: "Pending" },
//   { value: "rejected", label: "Rejected" }
// ]

// export default function MediaPage() {
//   const dispatch = useDispatch()
//   const { media, loading, error, success, totalMedia, stats } = useSelector(
//     (state) => state.media,
//   )

//   const [filters, setFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "approved",
//     search: "",
//   })
//   const [deleteConfirm, setDeleteConfirm] = useState(null)
//   const [isDeleting, setIsDeleting] = useState(false)

//   useEffect(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [dispatch, filters])

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.message || "An error occurred")
//       dispatch(clearError())
//       setIsDeleting(false)
//     }
//   }, [error, dispatch])

//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully")
//       dispatch(clearSuccess())
//       setIsDeleting(false)
//     }
//   }, [success, dispatch])

//   const handleDelete = useCallback(async (id) => {
//     try {
//       setIsDeleting(true)
//       await dispatch(deleteMedia(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//       setIsDeleting(false)
//     }
//   }, [dispatch])

//   const handleSearch = useCallback(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [filters, dispatch])

//   const handleReset = useCallback(() => {
//     setFilters({
//       category: "",
//       fileType: "",
//       status: "approved",
//       search: "",
//     })
//   }, [])

//   const getStatusColor = useCallback((status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   const getCategoryColor = useCallback((category) => {
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

//   if (loading && !media.length) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading media..."} />
//         </div>
//   }

//   return (
//     <>
//       {/* Delete Loader */}
//       {isDeleting && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Deleting..."} />
//         </div>
//       )}
      
//       <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//         {/* HEADER */}
//         <Box sx={{ 
//           display: 'flex', 
//           flexDirection: { xs: 'column', sm: 'row' }, 
//           justifyContent: 'space-between', 
//           alignItems: { xs: 'flex-start', sm: 'center' }, 
//           gap: 2, 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//               <ImageIcon size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//               <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                 Media Gallery ({totalMedia || 0})
//               </Typography>
//             </Box>
//             <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//               Manage all photos and videos
//             </Typography>
//           </Box>
//           <Link href="/admin/media/upload" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7'
//                 }
//               }}
//             >
//               Upload Media
//             </Button>
//           </Link>
//         </Box>

//         {/* STATS */}
//         {stats && (
//           <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.images || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Images
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <Video size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {stats.videos || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Videos
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <Card sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 backgroundColor: '#144ae905'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                   <Box sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#144ae910',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                   </Box>
//                   <Box>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {totalMedia || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Total Media
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         )}

//         {/* FILTERS */}
//         <Card sx={{ 
//           p: { xs: 2, sm: 3 }, 
//           border: '1px solid #144ae920', 
//           mb: { xs: 3, sm: 4 } 
//         }}>
//           <Box sx={{ 
//             display: 'flex', 
//             gap: { xs: 1.5, sm: 2 }, 
//             alignItems: 'stretch', 
//             flexDirection: { xs: 'column', sm: 'row' },
//             flexWrap: 'wrap'
//           }}>
//             <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//               <TextField
//                 label="Search"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 placeholder="Search by title..."
//                 startIcon={<Search size={18} color="#144ae9" />}
//                 fullWidth
//                 sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
//               <SelectField
//                 label="Category"
//                 value={filters.category}
//                 onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//                 options={CATEGORIES}
//                 fullWidth
//                 sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Type"
//                 value={filters.fileType}
//                 onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
//                 options={FILE_TYPES}
//                 fullWidth
//                 sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//               />
//             </Box>

//             <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//               <SelectField
//                 label="Status"
//                 value={filters.status}
//                 onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                 options={STATUSES}
//                 fullWidth
//                 sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//               />
//             </Box>

//             <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading || isDeleting}
//                 startIcon={<Filter size={16} />}
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { backgroundColor: '#0d3ec7' },
//                   '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//                 }}
//               >
//                 Apply
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 disabled={isDeleting}
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '100px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' },
//                   '&.Mui-disabled': { borderColor: '#144ae950', color: '#144ae950' }
//                 }}
//               >
//                 Reset
//               </Button>
//             </Box>
//           </Box>
//         </Card>

//         {/* MEDIA GRID */}
//         <Card sx={{ border: '1px solid #144ae920' }}>
//           {media.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//               <ImageIcon size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//               <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//                 No media found
//               </Typography>
//             </Box>
//           ) : (
//             <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//               {media.map((item) => (
//                 <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
//                   <Card 
//                     sx={{ 
//                       maxWidth:350,
//                       border: '1px solid #144ae920',
//                       transition: 'all 0.2s',
//                       '&:hover': {
//                         boxShadow: 4,
//                         borderColor: '#144ae9'
//                       }
//                     }}
//                   >
//                     <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae905' }}>
//                       {item.fileType === "video" ? (
//                         <video
//                           src={item.fileUrl}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         />
//                       ) : (
//                         <img
//                           src={item.thumbnailUrl || item.fileUrl}
//                           alt={item.title}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                           onError={(e) => { e.target.src = "/placeholder.svg" }}
//                         />
//                       )}
                      
//                       <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                         <Chip
//                           label={item.fileType}
//                           size="small"
//                           sx={{
//                             backgroundColor: item.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                             color: 'white',
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                         <Chip
//                           label={item.status}
//                           size="small"
//                           sx={{
//                             ...getStatusColor(item.status),
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                       </Box>

//                       <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
//                         <Chip
//                           label={item.category}
//                           size="small"
//                           sx={{
//                             ...getCategoryColor(item.category),
//                             fontWeight: 600,
//                             fontSize: '0.65rem'
//                           }}
//                         />
//                       </Box>
//                     </Box>

//                     <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
//                       <Typography 
//                         variant="body1" 
//                         fontWeight={600} 
//                         color="text.primary" 
//                         gutterBottom
//                         sx={{ 
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis',
//                           display: '-webkit-box',
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: 'vertical',
//                           fontSize: { xs: '0.9rem', sm: '1rem' }
//                         }}
//                       >
//                         {item.title}
//                       </Typography>
                      
//                       {item.description && (
//                         <Typography 
//                           variant="body2" 
//                           color="text.secondary" 
//                           sx={{ 
//                             mb: 2,
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             display: '-webkit-box',
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: 'vertical',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' }
//                           }}
//                         >
//                           {item.description}
//                         </Typography>
//                       )}

//                       {(item.district?.name || item.gramPanchayat?.name) && (
//                         <Box sx={{ mb: 2 }}>
//                           <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                             {item.gramPanchayat?.name 
//                               ? `${item.gramPanchayat.name}, ${item.district?.name}`
//                               : item.district?.name
//                             }
//                           </Typography>
//                         </Box>
//                       )}

//                       <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                         <Link href={`/admin/media/${item._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '80px' }}>
//                           <Button
//                             fullWidth
//                             disabled={isDeleting}
//                             startIcon={<Eye size={14} />}
//                             sx={{
//                               backgroundColor: '#144ae910',
//                               color: '#144ae9',
//                               fontSize: { xs: '0.7rem', sm: '0.875rem' },
//                               py: { xs: 0.75, sm: 1 },
//                               '&:hover': { backgroundColor: '#144ae920' },
//                               '&.Mui-disabled': { backgroundColor: '#144ae905', color: '#144ae950' }
//                             }}
//                           >
//                             View
//                           </Button>
//                         </Link>
//                         <Link href={`/admin/media/${item._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '80px' }}>
//                           <Button
//                             fullWidth
//                             disabled={isDeleting}
//                             startIcon={<Edit size={14} />}
//                             sx={{
//                               backgroundColor: '#144ae910',
//                               color: '#144ae9',
//                               fontSize: { xs: '0.7rem', sm: '0.875rem' },
//                               py: { xs: 0.75, sm: 1 },
//                               '&:hover': { backgroundColor: '#144ae920' },
//                               '&.Mui-disabled': { backgroundColor: '#144ae905', color: '#144ae950' }
//                             }}
//                           >
//                             Edit
//                           </Button>
//                         </Link>
//                         <IconButton
//                           onClick={() => setDeleteConfirm(item._id)}
//                           disabled={isDeleting}
//                           sx={{
//                             color: '#d32f2f',
//                             backgroundColor: '#d32f2f10',
//                             width: { xs: 32, sm: 40 },
//                             height: { xs: 32, sm: 40 },
//                             '&:hover': { backgroundColor: '#d32f2f20' },
//                             '&.Mui-disabled': { backgroundColor: '#d32f2f05', color: '#d32f2f50' }
//                           }}
//                         >
//                           <Trash2 size={14} />
//                         </IconButton>
//                       </Box>
//                     </Box>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </Card>

//         {/* DELETE CONFIRMATION */}
//         <ConfirmDialog
//           open={!!deleteConfirm}
//           onClose={() => setDeleteConfirm(null)}
//           onConfirm={() => handleDelete(deleteConfirm)}
//           title="Delete Media"
//           message="Are you sure you want to delete this media? This action cannot be undone."
//           confirmText={isDeleting ? "Deleting..." : "Delete"}
//           cancelText="Cancel"
//           confirmColor="error"
//           disabled={isDeleting}
//           icon={<Trash2 size={24} color="#144ae9" />}
//         />
//       </Box>
//     </>
//   )
// }


// "use client"

// import { useEffect, useState, useMemo, useCallback } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
// import Link from "next/link"
// import { 
//   Plus, 
//   Trash2, 
//   Eye, 
//   Edit, 
//   Image as ImageIcon, 
//   Video,
//   Search,
//   Filter
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material'
// import { toast } from "react-toastify"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// const FILE_TYPES = [
//   { value: "", label: "All Types" },
//   { value: "image", label: "Image" },
//   { value: "video", label: "Video" }
// ]

// const STATUSES = [
//   { value: "approved", label: "Approved" },
//   { value: "pending", label: "Pending" },
//   { value: "rejected", label: "Rejected" }
// ]

// export default function MediaPage() {
//   const dispatch = useDispatch()
//   const { media, loading, error, success, totalMedia, stats } = useSelector(
//     (state) => state.media,
//   )

//   const [filters, setFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "approved",
//     search: "",
//   })
//   const [deleteConfirm, setDeleteConfirm] = useState(null)

//   useEffect(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [dispatch, filters])

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
//     }
//   }, [success, dispatch])

//   const handleDelete = useCallback(async (id) => {
//     try {
//       await dispatch(deleteMedia(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//     }
//   }, [dispatch])

//   const handleSearch = useCallback(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [filters, dispatch])

//   const handleReset = useCallback(() => {
//     setFilters({
//       category: "",
//       fileType: "",
//       status: "approved",
//       search: "",
//     })
//   }, [])

//   const getStatusColor = useCallback((status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }, [])

//   const getCategoryColor = useCallback((category) => {
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

//   if (loading && !media.length) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Media..."} />
//         </div>
//   }

//   return (
//     <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: { xs: 'column', sm: 'row' }, 
//         justifyContent: 'space-between', 
//         alignItems: { xs: 'flex-start', sm: 'center' }, 
//         gap: 2, 
//         mb: { xs: 3, sm: 4 } 
//       }}>
//         <Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//             <ImageIcon size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//             <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//               Media Gallery ({totalMedia || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all photos and videos
//           </Typography>
//         </Box>
//         <Link href="/admin/media/upload" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
//           <Button
//             startIcon={<Plus size={18} />}
//             fullWidth
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               fontSize: { xs: '0.8rem', sm: '0.875rem' },
//               px: { xs: 2, sm: 3 },
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Upload Media
//           </Button>
//         </Link>
//       </Box>

//       {/* STATS */}
//       {stats && (
//         <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
//           <Grid item xs={12} sm={4}>
//             <Card sx={{ 
//               p: { xs: 2, sm: 3 }, 
//               border: '1px solid #144ae920',
//               backgroundColor: '#144ae905'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                 <Box sx={{ 
//                   width: { xs: 40, sm: 48 }, 
//                   height: { xs: 40, sm: 48 }, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                     {stats.images || 0}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                     Images
//                   </Typography>
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Card sx={{ 
//               p: { xs: 2, sm: 3 }, 
//               border: '1px solid #144ae920',
//               backgroundColor: '#144ae905'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                 <Box sx={{ 
//                   width: { xs: 40, sm: 48 }, 
//                   height: { xs: 40, sm: 48 }, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Video size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                     {stats.videos || 0}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                     Videos
//                   </Typography>
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Card sx={{ 
//               p: { xs: 2, sm: 3 }, 
//               border: '1px solid #144ae920',
//               backgroundColor: '#144ae905'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
//                 <Box sx={{ 
//                   width: { xs: 40, sm: 48 }, 
//                   height: { xs: 40, sm: 48 }, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <ImageIcon size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                     {totalMedia || 0}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                     Total Media
//                   </Typography>
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//         </Grid>
//       )}

//       {/* FILTERS */}
//       <Card sx={{ 
//         p: { xs: 2, sm: 3 }, 
//         border: '1px solid #144ae920', 
//         mb: { xs: 3, sm: 4 } 
//       }}>
//         <Box sx={{ 
//           display: 'flex', 
//           gap: { xs: 1.5, sm: 2 }, 
//           alignItems: 'stretch', 
//           flexDirection: { xs: 'column', sm: 'row' },
//           flexWrap: 'wrap'
//         }}>
//           <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//             <TextField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//               placeholder="Search by title..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
//             <SelectField
//               label="Category"
//               value={filters.category}
//               onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//               options={CATEGORIES}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//             <SelectField
//               label="Type"
//               value={filters.fileType}
//               onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
//               options={FILE_TYPES}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '130px' } }}>
//             <SelectField
//               label="Status"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               options={STATUSES}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               onClick={handleSearch}
//               disabled={loading}
//               startIcon={<Filter size={16} />}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': { backgroundColor: '#0d3ec7' },
//                 '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//               }}
//             >
//               Apply
//             </Button>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' }
//               }}
//             >
//               Reset
//             </Button>
//           </Box>
//         </Box>
//       </Card>

//       {/* MEDIA GRID */}
//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {media.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <ImageIcon size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//               No media found
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//             {media.map((item) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
//                 <Card 
//                   sx={{ 
//                     maxWidth:350,
//                     border: '1px solid #144ae920',
//                     transition: 'all 0.2s',
//                     '&:hover': {
//                       boxShadow: 4,
//                       borderColor: '#144ae9'
//                     }
//                   }}
//                 >
//                   <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae905' }}>
//                     {item.fileType === "video" ? (
//                       <video
//                         src={item.fileUrl}
//                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       />
//                     ) : (
//                       <img
//                         src={item.thumbnailUrl || item.fileUrl}
//                         alt={item.title}
//                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         onError={(e) => { e.target.src = "/placeholder.svg" }}
//                       />
//                     )}
                    
//                     <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       <Chip
//                         label={item.fileType}
//                         size="small"
//                         sx={{
//                           backgroundColor: item.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                           color: 'white',
//                           fontWeight: 600,
//                           fontSize: '0.65rem'
//                         }}
//                       />
//                       <Chip
//                         label={item.status}
//                         size="small"
//                         sx={{
//                           ...getStatusColor(item.status),
//                           fontWeight: 600,
//                           fontSize: '0.65rem'
//                         }}
//                       />
//                     </Box>

//                     <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
//                       <Chip
//                         label={item.category}
//                         size="small"
//                         sx={{
//                           ...getCategoryColor(item.category),
//                           fontWeight: 600,
//                           fontSize: '0.65rem'
//                         }}
//                       />
//                     </Box>
//                   </Box>

//                   <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
//                     <Typography 
//                       variant="body1" 
//                       fontWeight={600} 
//                       color="text.primary" 
//                       gutterBottom
//                       sx={{ 
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis',
//                         display: '-webkit-box',
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: 'vertical',
//                         fontSize: { xs: '0.9rem', sm: '1rem' }
//                       }}
//                     >
//                       {item.title}
//                     </Typography>
                    
//                     {item.description && (
//                       <Typography 
//                         variant="body2" 
//                         color="text.secondary" 
//                         sx={{ 
//                           mb: 2,
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis',
//                           display: '-webkit-box',
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: 'vertical',
//                           fontSize: { xs: '0.75rem', sm: '0.875rem' }
//                         }}
//                       >
//                         {item.description}
//                       </Typography>
//                     )}

//                     {(item.district?.name || item.gramPanchayat?.name) && (
//                       <Box sx={{ mb: 2 }}>
//                         <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                           {item.gramPanchayat?.name 
//                             ? `${item.gramPanchayat.name}, ${item.district?.name}`
//                             : item.district?.name
//                           }
//                         </Typography>
//                       </Box>
//                     )}

//                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                       <Link href={`/admin/media/${item._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '80px' }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Eye size={14} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             fontSize: { xs: '0.7rem', sm: '0.875rem' },
//                             py: { xs: 0.75, sm: 1 },
//                             '&:hover': { backgroundColor: '#144ae920' }
//                           }}
//                         >
//                           View
//                         </Button>
//                       </Link>
//                       <Link href={`/admin/media/${item._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '80px' }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Edit size={14} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             fontSize: { xs: '0.7rem', sm: '0.875rem' },
//                             py: { xs: 0.75, sm: 1 },
//                             '&:hover': { backgroundColor: '#144ae920' }
//                           }}
//                         >
//                           Edit
//                         </Button>
//                       </Link>
//                       <IconButton
//                         onClick={() => setDeleteConfirm(item._id)}
//                         sx={{
//                           color: '#d32f2f',
//                           backgroundColor: '#d32f2f10',
//                           width: { xs: 32, sm: 40 },
//                           height: { xs: 32, sm: 40 },
//                           '&:hover': { backgroundColor: '#d32f2f20' }
//                         }}
//                       >
//                         <Trash2 size={14} />
//                       </IconButton>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Media"
//         message="Are you sure you want to delete this media? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   )
// }


// "use client"

// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchMedia, deleteMedia, clearError, clearSuccess } from "@/redux/slices/mediaSlice.js"
// import Link from "next/link"
// import { 
//   Plus, 
//   Trash2, 
//   Eye, 
//   Edit, 
//   Image as ImageIcon, 
//   Video,
//   Search,
//   Filter
// } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material'
// import { toast } from "react-toastify"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// const CATEGORIES = [
//   { value: "", label: "All Categories" },
//   { value: "heritage", label: "Heritage" },
//   { value: "natural", label: "Natural" },
//   { value: "cultural", label: "Cultural" },
//   { value: "event", label: "Event" },
//   { value: "festival", label: "Festival" }
// ]

// const FILE_TYPES = [
//   { value: "", label: "All Types" },
//   { value: "image", label: "Image" },
//   { value: "video", label: "Video" }
// ]

// const STATUSES = [
//   { value: "approved", label: "Approved" },
//   { value: "pending", label: "Pending" },
//   { value: "rejected", label: "Rejected" }
// ]

// export default function MediaPage() {
//   const dispatch = useDispatch()
//   const { media, loading, error, success, totalMedia, stats } = useSelector(
//     (state) => state.media,
//   )

//   const [filters, setFilters] = useState({
//     category: "",
//     fileType: "",
//     status: "approved",
//     search: "",
//   })

//   const [deleteConfirm, setDeleteConfirm] = useState(null)

//   useEffect(() => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }, [dispatch, filters])

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
//     }
//   }, [success, dispatch])

//   const handleDelete = async (id) => {
//     try {
//       await dispatch(deleteMedia(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const handleSearch = () => {
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== "")
//     )
//     dispatch(fetchMedia(params))
//   }

//   const handleReset = () => {
//     setFilters({
//       category: "",
//       fileType: "",
//       status: "approved",
//       search: "",
//     })
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "approved":
//         return { backgroundColor: '#10b981', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "rejected":
//         return { backgroundColor: '#ef4444', color: 'white' }
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

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: { xs: 'column', sm: 'row' }, 
//         justifyContent: 'space-between', 
//         alignItems: { xs: 'flex-start', sm: 'center' }, 
//         gap: 2, 
//         mb: 4 
//       }}>
//         <Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//             <ImageIcon size={32} color="#144ae9" />
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               Media Gallery ({totalMedia || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary">
//             Manage all photos and videos
//           </Typography>
//         </Box>
//         <Link href="/admin/media/upload" style={{ textDecoration: 'none' }}>
//           <Button
//             startIcon={<Plus size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Upload Media
//           </Button>
//         </Link>
//       </Box>

//       {/* STATS */}
//       {stats && (
//         <Grid container spacing={2} sx={{ mb: 4 }}>
//           <Grid item xs={12} sm={4}>
//             <Card sx={{ 
//               p: 3, 
//               border: '1px solid #144ae920',
//               backgroundColor: '#144ae905'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                 <Box sx={{ 
//                   width: 48, 
//                   height: 48, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <ImageIcon size={24} color="#144ae9" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h4" fontWeight={700} color="#144ae9">
//                     {stats.images || 0}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Images
//                   </Typography>
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Card sx={{ 
//               p: 3, 
//               border: '1px solid #144ae920',
//               backgroundColor: '#144ae905'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                 <Box sx={{ 
//                   width: 48, 
//                   height: 48, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <Video size={24} color="#144ae9" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h4" fontWeight={700} color="#144ae9">
//                     {stats.videos || 0}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Videos
//                   </Typography>
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={4}>
//             <Card sx={{ 
//               p: 3, 
//               border: '1px solid #144ae920',
//               backgroundColor: '#144ae905'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                 <Box sx={{ 
//                   width: 48, 
//                   height: 48, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}>
//                   <ImageIcon size={24} color="#144ae9" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h4" fontWeight={700} color="#144ae9">
//                     {totalMedia || 0}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Total Media
//                   </Typography>
//                 </Box>
//               </Box>
//             </Card>
//           </Grid>
//         </Grid>
//       )}

//       {/* FILTERS */}
//       <Card sx={{ 
//         p: { xs: 2, sm: 3 }, 
//         border: '1px solid #144ae920', 
//         mb: 4 
//       }}>
//         <Box sx={{ 
//           display: 'flex', 
//           gap: { xs: 2, sm: 2, md: 2 }, 
//           alignItems: 'center', 
//           flexDirection: { xs: 'column', sm: 'row' },
//           flexWrap: 'wrap'
//         }}>
//           {/* SEARCH FIELD */}
//           <Box sx={{ 
//             flex: 1,
//             minWidth: { xs: '100%', sm: '200px' },
//             display: 'flex', 
//             alignItems: 'center' 
//           }}>
//             <TextField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//               placeholder="Search by title..."
//               startIcon={<Search size={20} color="#144ae9" />}
//               fullWidth
//               sx={{ 
//                 '& .MuiInputBase-root': { 
//                   height: { xs: '48px', sm: '56px' } 
//                 } 
//               }}
//             />
//           </Box>

//           {/* CATEGORY FILTER */}
//           <Box sx={{ 
//             width: { xs: '100%', sm: '180px', md: '180px' },
//             display: 'flex', 
//             alignItems: 'center' 
//           }}>
//             <SelectField
//               label="Category"
//               value={filters.category}
//               onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//               options={CATEGORIES}
//               fullWidth
//               sx={{ 
//                 '& .MuiInputBase-root': { 
//                   height: { xs: '48px', sm: '56px' } 
//                 } 
//               }}
//             />
//           </Box>

//           {/* FILE TYPE FILTER */}
//           <Box sx={{ 
//             width: { xs: '100%', sm: '180px', md: '180px' },
//             display: 'flex', 
//             alignItems: 'center' 
//           }}>
//             <SelectField
//               label="Type"
//               value={filters.fileType}
//               onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
//               options={FILE_TYPES}
//               fullWidth
//               sx={{ 
//                 '& .MuiInputBase-root': { 
//                   height: { xs: '48px', sm: '56px' } 
//                 } 
//               }}
//             />
//           </Box>

//           {/* STATUS FILTER */}
//           <Box sx={{ 
//             width: { xs: '100%', sm: '180px', md: '180px' },
//             display: 'flex', 
//             alignItems: 'center' 
//           }}>
//             <SelectField
//               label="Status"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               options={STATUSES}
//               fullWidth
//               sx={{ 
//                 '& .MuiInputBase-root': { 
//                   height: { xs: '48px', sm: '56px' } 
//                 } 
//               }}
//             />
//           </Box>

//           {/* BUTTONS */}
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center',
//             width: { xs: '100%', sm: 'auto' },
//             mt: { xs: 1, sm: 0 }
//           }}>
//             <Box sx={{ 
//               display: 'flex', 
//               gap: 1, 
//               flexDirection: 'row',
//               width: { xs: '100%', sm: 'auto' }
//             }}>
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading}
//                 startIcon={<Filter size={18} />}
//                 size="large"
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   height: { xs: '48px', sm: '56px' },
//                   minWidth: '100px',
//                   '&:hover': {
//                     backgroundColor: '#0d3ec7',
//                     color: 'white'
//                   },
//                   '&.Mui-disabled': {
//                     backgroundColor: '#144ae950',
//                     color: 'white'
//                   },
//                   fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 Apply
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 size="large"
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '48px', sm: '56px' },
//                   minWidth: '100px',
//                   '&:hover': {
//                     borderColor: '#0d3ec7',
//                     backgroundColor: '#144ae910',
//                     color: '#0d3ec7'
//                   },
//                   fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 Reset
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </Card>

//       {/* MEDIA GRID */}
//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading ? (
//           <Loader />
//         ) : media.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: 8 }}>
//             <ImageIcon size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
//             <Typography variant="body1" color="text.secondary">
//               No media found
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={3} sx={{ p: 3 }}>
//             {media.map((item) => (
//               <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
//                 <Card 
//                   sx={{ 
//                     border: '1px solid #144ae920',
//                     transition: 'all 0.2s',
//                     '&:hover': {
//                       boxShadow: 4,
//                       borderColor: '#144ae9'
//                     },
//                     maxWidth:'350px'
//                   }}
//                 >
//                   {/* MEDIA THUMBNAIL */}
//                   <Box sx={{ position: 'relative', height: 200, bgcolor: '#144ae905' }}>
//                     {item.fileType === "video" ? (
//                       <video
//                         src={item.fileUrl}
//                         className="w-full h-full object-cover"
//                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       />
//                     ) : (
//                       <img
//                         src={item.thumbnailUrl || item.fileUrl}
//                         alt={item.title}
//                         style={{ 
//                           width: '100%', 
//                           height: '100%', 
//                           objectFit: 'cover' 
//                         }}
//                         onError={(e) => {
//                           e.target.src = "/placeholder.svg"
//                         }}
//                       />
//                     )}
                    
//                     {/* BADGES */}
//                     <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
//                       <Chip
//                         label={item.fileType}
//                         size="small"
//                         sx={{
//                           backgroundColor: item.fileType === 'video' ? '#ef4444' : '#3b82f6',
//                           color: 'white',
//                           fontWeight: 600,
//                           fontSize: '0.7rem'
//                         }}
//                       />
//                       <Chip
//                         label={item.status}
//                         size="small"
//                         sx={{
//                           ...getStatusColor(item.status),
//                           fontWeight: 600,
//                           fontSize: '0.7rem'
//                         }}
//                       />
//                     </Box>

//                     {/* CATEGORY BADGE */}
//                     <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
//                       <Chip
//                         label={item.category}
//                         size="small"
//                         sx={{
//                           ...getCategoryColor(item.category),
//                           fontWeight: 600,
//                           fontSize: '0.7rem'
//                         }}
//                       />
//                     </Box>
//                   </Box>

//                   {/* MEDIA INFO */}
//                   <Box sx={{ p: 2 }}>
//                     <Typography 
//                       variant="body1" 
//                       fontWeight={600} 
//                       color="text.primary" 
//                       gutterBottom
//                       sx={{ 
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis',
//                         display: '-webkit-box',
//                         WebkitLineClamp: 2,
//                         WebkitBoxOrient: 'vertical'
//                       }}
//                     >
//                       {item.title}
//                     </Typography>
                    
//                     {item.description && (
//                       <Typography 
//                         variant="body2" 
//                         color="text.secondary" 
//                         sx={{ 
//                           mb: 2,
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis',
//                           display: '-webkit-box',
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: 'vertical'
//                         }}
//                       >
//                         {item.description}
//                       </Typography>
//                     )}

//                     {/* LOCATION INFO */}
//                     {(item.district?.name || item.gramPanchayat?.name) && (
//                       <Box sx={{ mb: 2 }}>
//                         <Typography variant="caption" color="text.secondary">
//                           {item.gramPanchayat?.name 
//                             ? `${item.gramPanchayat.name}, ${item.district?.name}`
//                             : item.district?.name
//                           }
//                         </Typography>
//                       </Box>
//                     )}

//                     {/* ACTIONS */}
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Link href={`/admin/media/${item._id}`} style={{ textDecoration: 'none', flex: 1 }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Eye size={16} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             '&:hover': {
//                               backgroundColor: '#144ae920'
//                             }
//                           }}
//                         >
//                           View
//                         </Button>
//                       </Link>
//                       <Link href={`/admin/media/${item._id}`} style={{ textDecoration: 'none', flex: 1 }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Edit size={16} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             '&:hover': {
//                               backgroundColor: '#144ae920'
//                             }
//                           }}
//                         >
//                           Edit
//                         </Button>
//                       </Link>
//                       <IconButton
//                         onClick={() => setDeleteConfirm(item._id)}
//                         sx={{
//                           color: '#d32f2f',
//                           backgroundColor: '#d32f2f10',
//                           '&:hover': {
//                             backgroundColor: '#d32f2f20'
//                           }
//                         }}
//                       >
//                         <Trash2 size={16} />
//                       </IconButton>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Media"
//         message="Are you sure you want to delete this media? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   )
// }


