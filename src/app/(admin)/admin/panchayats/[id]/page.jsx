'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Edit, 
  User, 
  Calendar,
  MapPin,
  FileText,
  AlertCircle
} from "lucide-react"
import {
  Box,
  Typography,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import TextField from "@/components/ui/TextField"
import StatusChip from "@/components/ui/StatusChip"
import Loader from "@/components/ui/Loader"

export default function PanchayatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

  const [isEditing, setIsEditing] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    block: "",
    establishmentYear: "",
    historicalBackground: "",
    population: "",
    status: "pending",
    localArt: "",
    localCuisine: "",
    traditions: "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (params.id && !dataLoaded) {
      dispatch(fetchPanchayatById(params.id))
      setDataLoaded(true)
    }
  }, [params.id, dataLoaded, dispatch])

  useEffect(() => {
    if (selectedPanchayat && selectedPanchayat._id === params.id) {
      setFormData({
        name: selectedPanchayat.name || "",
        slug: selectedPanchayat.slug || "",
        block: selectedPanchayat.block || "",
        establishmentYear: selectedPanchayat.establishmentYear || "",
        historicalBackground: selectedPanchayat.historicalBackground || "",
        population: selectedPanchayat.population || "",
        status: selectedPanchayat.status || "pending",
        localArt: selectedPanchayat.localArt || "",
        localCuisine: selectedPanchayat.localCuisine || "",
        traditions: selectedPanchayat.traditions || "",
      })
    }
  }, [selectedPanchayat, params.id])

  useEffect(() => {
    if (success && isSaving) {
      toast.success("Panchayat updated successfully!")
      dispatch(clearSuccess())
      setIsEditing(false)
      setIsSaving(false)
      setTimeout(() => {
        dispatch(fetchPanchayatById(params.id))
      }, 500)
    }
    if (error && isSaving) {
      toast.error(error.message || "Failed to update panchayat")
      dispatch(clearError())
      setIsSaving(false)
    }
  }, [success, error, isSaving, dispatch, params.id])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Panchayat name is required"
    if (!formData.slug.trim()) newErrors.slug = "Slug is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (selectedPanchayat) {
      setFormData({
        name: selectedPanchayat.name || "",
        slug: selectedPanchayat.slug || "",
        block: selectedPanchayat.block || "",
        establishmentYear: selectedPanchayat.establishmentYear || "",
        historicalBackground: selectedPanchayat.historicalBackground || "",
        population: selectedPanchayat.population || "",
        status: selectedPanchayat.status || "pending",
        localArt: selectedPanchayat.localArt || "",
        localCuisine: selectedPanchayat.localCuisine || "",
        traditions: selectedPanchayat.traditions || "",
      })
    }
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix all errors")
      return
    }
    try {
      setIsSaving(true)

      const formattedData = {
        ...formData,
        population: formData.population ? parseInt(formData.population) : undefined,
        establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
      }

      await dispatch(updatePanchayat({ id: params.id, panchayatData: formattedData })).unwrap()
      setIsSaving(false)
    } catch (err) {
      console.log("Error object:", err)
      const errorMessage =
        err?.message || err?.error?.message || (typeof err === "string" ? err : "Failed to update panchayat")

      toast.error(errorMessage)
      setIsSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  if (loading && !selectedPanchayat) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader />
      </Box>
    )
  }

  if (!selectedPanchayat) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <AlertCircle size={48} color="#d32f2f" style={{ marginBottom: 16 }} />
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Panchayat Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This panchayat could not be found.
        </Typography>
        <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            sx={{ mt: 2, fontWeight: 'bold' }}
          >
            Back to Panchayats
          </Button>
        </Link>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2, 
        mb: 4 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
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
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {isEditing ? "Edit Panchayat" : selectedPanchayat.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedPanchayat.createdBy?.name && (
                <>
                  Created by <Typography component="span" fontWeight={600}>{selectedPanchayat.createdBy.name}</Typography>
                </>
              )}
            </Typography>
          </Box>
        </Box>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            startIcon={<Edit size={20} />}
            sx={{
              backgroundColor: '#144ae9',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#0d3ec7'
              }
            }}
          >
            Edit Panchayat
          </Button>
        )}
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* LEFT COLUMN - Form */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 70%' }, minWidth: 0 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* BASIC INFORMATION */}
            <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {isEditing ? (
                    <TextField
                      label="Panchayat Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      fullWidth
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                        Panchayat Name
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        {formData.name}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  {isEditing ? (
                    <TextField
                      label="Slug *"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      error={!!errors.slug}
                      helperText={errors.slug}
                      fullWidth
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                        Slug
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {formData.slug}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  {isEditing ? (
                    <TextField
                      label="Block"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      fullWidth
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                        Block
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {formData.block || "Not specified"}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  {isEditing ? (
                    <TextField
                      label="Establishment Year"
                      name="establishmentYear"
                      type="number"
                      value={formData.establishmentYear}
                      onChange={handleChange}
                      fullWidth
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                        Establishment Year
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {formData.establishmentYear || "Not specified"}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  {isEditing ? (
                    <TextField
                      label="Population"
                      name="population"
                      type="number"
                      value={formData.population}
                      onChange={handleChange}
                      fullWidth
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                        Population
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {formData.population ? formData.population.toLocaleString() : "Not specified"}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Card>

            {/* HISTORICAL BACKGROUND */}
            <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Historical Background
              </Typography>
              {isEditing ? (
                <TextField
                  multiline
                  rows={5}
                  name="historicalBackground"
                  value={formData.historicalBackground}
                  onChange={handleChange}
                  placeholder="Describe the historical background of the panchayat..."
                  fullWidth
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formData.historicalBackground || "No historical background provided"}
                </Typography>
              )}
            </Card>

            {/* CULTURAL INFORMATION */}
            <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Cultural Information
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    Local Art
                  </Typography>
                  {isEditing ? (
                    <TextField
                      multiline
                      rows={3}
                      name="localArt"
                      value={formData.localArt}
                      onChange={handleChange}
                      placeholder="Traditional art forms and cultural expressions..."
                      fullWidth
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {formData.localArt || "No information available"}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    Local Cuisine
                  </Typography>
                  {isEditing ? (
                    <TextField
                      multiline
                      rows={3}
                      name="localCuisine"
                      value={formData.localCuisine}
                      onChange={handleChange}
                      placeholder="Traditional dishes and local cuisine..."
                      fullWidth
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {formData.localCuisine || "No information available"}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                    Traditions
                  </Typography>
                  {isEditing ? (
                    <TextField
                      multiline
                      rows={3}
                      name="traditions"
                      value={formData.traditions}
                      onChange={handleChange}
                      placeholder="Cultural traditions and practices..."
                      fullWidth
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {formData.traditions || "No information available"}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Card>

            {/* SAVE BUTTONS */}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  disabled={isSaving}
                  startIcon={isSaving ? <Loader /> : <Save size={20} />}
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
                      backgroundColor: '#144ae950',
                      color: 'white'
                    }
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="outlined"
                  size="large"
                  sx={{
                    flex: 1,
                    borderColor: '#144ae9',
                    color: '#144ae9',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#0d3ec7',
                      backgroundColor: '#144ae910'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT COLUMN - Sidebar */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 30%' }, maxWidth: { lg: 400 }, minWidth: 0 }}>
          <Stack spacing={3}>
            {/* STATUS & INFO */}
            <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Information
              </Typography>

              {/* STATUS */}
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
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="verified">Verified</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <StatusChip
                    status={formData.status}
                    label={formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                  />
                )}
              </Box>

              {/* DISTRICT INFO */}
              {selectedPanchayat.district && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MapPin size={16} color="#144ae9" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      District
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    {selectedPanchayat.district?.name || "N/A"}
                  </Typography>
                </Box>
              )}

              {/* CREATED BY */}
              {selectedPanchayat.createdBy && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <User size={16} color="#144ae9" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Created By
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    {selectedPanchayat.createdBy?.name || "Unknown"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedPanchayat.createdBy?.email || ""}
                  </Typography>
                </Box>
              )}
            </Card>

            {/* ADDITIONAL INFO */}
            <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Additional Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Created
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {formatDate(selectedPanchayat.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Last Updated
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {formatDate(selectedPanchayat.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* RTC REPORTS */}
            {!isEditing && (
              <Card sx={{ p: 3, border: '1px solid', borderColor: '#144ae920', backgroundColor: '#144ae905' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <FileText size={20} color="#144ae9" />
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    RTC Reports
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  View and manage RTC reports for this panchayat.
                </Typography>
                <Link
                  href={`/admin/panchayats/${params.id}/rtc-report`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    fullWidth
                    sx={{
                      backgroundColor: '#144ae9',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#0d3ec7'
                      }
                    }}
                  >
                    View RTC Reports
                  </Button>
                </Link>
              </Card>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowLeft, Save, Edit, User, Calendar } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   TextField,
//   Select,
//   MenuItem
// } from '@mui/material'
// import Loader from "@/components/ui/Loader"

// export default function PanchayatDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     block: "",
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     status: "pending",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//   })

//   const [errors, setErrors] = useState({})

//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchPanchayatById(params.id))
//       setDataLoaded(true)
//     }
//   }, [params.id, dataLoaded, dispatch])

//   useEffect(() => {
//     if (selectedPanchayat && selectedPanchayat._id === params.id) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//   }, [selectedPanchayat, params.id])

//   useEffect(() => {
//     if (success && isSaving) {
//       toast.success("Panchayat updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       setIsSaving(false)
//       setTimeout(() => {
//         dispatch(fetchPanchayatById(params.id))
//       }, 500)
//     }
//     if (error && isSaving) {
//       toast.error(error.message || "Failed to update panchayat")
//       dispatch(clearError())
//       setIsSaving(false)
//     }
//   }, [success, error, isSaving, dispatch, params.id])

//   const validateForm = () => {
//     const newErrors = {}
//     if (!formData.name.trim()) newErrors.name = "Panchayat name is required"
//     if (!formData.slug.trim()) newErrors.slug = "Slug is required"
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleCancel = () => {
//     setIsEditing(false)
//     if (selectedPanchayat) {
//       setFormData({
//         name: selectedPanchayat.name || "",
//         slug: selectedPanchayat.slug || "",
//         block: selectedPanchayat.block || "",
//         establishmentYear: selectedPanchayat.establishmentYear || "",
//         historicalBackground: selectedPanchayat.historicalBackground || "",
//         population: selectedPanchayat.population || "",
//         status: selectedPanchayat.status || "pending",
//         localArt: selectedPanchayat.localArt || "",
//         localCuisine: selectedPanchayat.localCuisine || "",
//         traditions: selectedPanchayat.traditions || "",
//       })
//     }
//     setErrors({})
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateForm()) {
//       toast.error("Please fix all errors")
//       return
//     }
//     try {
//       setIsSaving(true)

//       const formattedData = {
//         ...formData,
//         population: formData.population ? parseInt(formData.population) : undefined,
//         establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
//       }

//       const result = await dispatch(updatePanchayat({ id: params.id, panchayatData: formattedData })).unwrap()
//       setIsSaving(false)
//     } catch (err) {
//       console.log("Error object:", err)
//       const errorMessage =
//         err?.message || err?.error?.message || (typeof err === "string" ? err : "Failed to update panchayat")

//       toast.error(errorMessage)
//       setIsSaving(false)
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "draft":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#144ae9', color: 'white' }
//       case "verified":
//         return { backgroundColor: '#10b981', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A"
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     } catch {
//       return "N/A"
//     }
//   }

//   if (loading && !selectedPanchayat) {
//     return (
//         <Loader />
//     )
//   }

//   if (!selectedPanchayat) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Typography variant="body1" color="text.secondary" gutterBottom>
//           Panchayat not found
//         </Typography>
//         <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
//           <Button sx={{ mt: 2, color: '#144ae9' }}>
//             Back to Panchayats
//           </Button>
//         </Link>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
//             <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9' }}>
//               <ArrowLeft size={20} color="#144ae9" />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {selectedPanchayat.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//               {isEditing ? "Edit panchayat details" : "View panchayat details"}
//             </Typography>
//           </Box>
//         </Box>
        
//         {!isEditing && (
//           <Button
//             onClick={() => setIsEditing(true)}
//             startIcon={<Edit size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Edit
//           </Button>
//         )}
//       </Box>

//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} md={6}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
//               <User size={20} color="#144ae9" />
//               <Box>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                   Created By
//                 </Typography>
//                 <Typography variant="h6" fontWeight={600} color="text.primary">
//                   {selectedPanchayat.createdBy?.name || "Unknown"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {selectedPanchayat.createdBy?.email || ""}
//                 </Typography>
//               </Box>
//             </Box>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 <Chip
//                   label={selectedPanchayat.status?.charAt(0).toUpperCase() + selectedPanchayat.status?.slice(1)}
//                   sx={getStatusColor(selectedPanchayat.status)}
//                 />
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Calendar size={16} color="#144ae9" />
//                 <Box>
//                   <Typography variant="caption" color="text.secondary">
//                     Created
//                   </Typography>
//                   <Typography variant="body2" fontWeight={500} color="text.primary">
//                     {formatDate(selectedPanchayat.createdAt)}
//                   </Typography>
//                 </Box>
//               </Box>
//             </Box>
//           </Card>
//         </Grid>
//       </Grid>

//       <Box component="form" onSubmit={handleSubmit}>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Basic Information
//             </Typography>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Panchayat Name *"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   error={!!errors.name}
//                   helperText={errors.name}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Slug *"
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleChange}
//                   error={!!errors.slug}
//                   helperText={errors.slug}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Block"
//                   name="block"
//                   value={formData.block}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Establishment Year"
//                   name="establishmentYear"
//                   type="number"
//                   value={formData.establishmentYear}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   label="Population"
//                   name="population"
//                   type="number"
//                   value={formData.population}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   Status
//                 </Typography>
//                 {isEditing ? (
//                   <Select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     fullWidth
//                     sx={{
//                       '& .MuiOutlinedInput-notchedOutline': {
//                         borderColor: '#144ae920',
//                       },
//                       '&:hover .MuiOutlinedInput-notchedOutline': {
//                         borderColor: '#144ae9',
//                       },
//                     }}
//                   >
//                     <MenuItem value="draft">Draft</MenuItem>
//                     <MenuItem value="pending">Pending</MenuItem>
//                     <MenuItem value="verified">Verified</MenuItem>
//                   </Select>
//                 ) : (
//                   <Chip
//                     label={formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
//                     sx={getStatusColor(formData.status)}
//                   />
//                 )}
//               </Grid>
//             </Grid>
//           </Card>

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Historical Background
//             </Typography>
//             <TextField
//               multiline
//               rows={4}
//               name="historicalBackground"
//               value={formData.historicalBackground}
//               onChange={handleChange}
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

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Local Art
//             </Typography>
//             <TextField
//               multiline
//               rows={3}
//               name="localArt"
//               value={formData.localArt}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               placeholder="Traditional art forms and cultural expressions..."
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

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Local Cuisine
//             </Typography>
//             <TextField
//               multiline
//               rows={3}
//               name="localCuisine"
//               value={formData.localCuisine}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               placeholder="Traditional dishes and local cuisine..."
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

//           <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
//             <Typography variant="h6" fontWeight={600} gutterBottom>
//               Traditions
//             </Typography>
//             <TextField
//               multiline
//               rows={3}
//               name="traditions"
//               value={formData.traditions}
//               onChange={handleChange}
//               disabled={!isEditing}
//               fullWidth
//               placeholder="Cultural traditions and practices..."
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

//           {isEditing && (
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 type="submit"
//                 disabled={isSaving || loading}
//                 startIcon={isSaving || loading ? <Loader /> : <Save size={20} />}
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
//                 {isSaving || loading ? 'Saving...' : 'Save Changes'}
//               </Button>
//               <Button
//                 type="button"
//                 onClick={handleCancel}
//                 disabled={isSaving || loading}
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

//           {!isEditing && (
//             <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: '#144ae905' }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 RTC Reports
//               </Typography>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 View and manage RTC reports for this panchayat.
//               </Typography>
//               <Link
//                 href={`/admin/panchayats/${params.id}/rtc-report`}
//                 style={{ textDecoration: 'none' }}
//               >
//                 <Button
//                   sx={{
//                     backgroundColor: '#144ae9',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   View RTC Reports
//                 </Button>
//               </Link>
//             </Card>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   )
// }

